import fs from "node:fs";
import path from "node:path";
import {
  CourseAudioManifestSchema,
  CurriculumCatalogSchema,
  CoursePageSchema,
  LessonManifestSchema,
  ResourcesCatalogSchema,
  validateCurriculumIntegrity,
} from "@cyber-school/lesson-runtime";
import { loadV4PlanningState } from "../../scripts/curriculum/v4-plan.ts";
import { compileCourseDirectory } from "../../scripts/curriculum/course-compile.ts";

const rootDir = path.resolve(import.meta.dirname, "../..");

const resourcesRaw = JSON.parse(
  fs.readFileSync(path.join(rootDir, "resources/sources.json"), "utf8"),
);
const resources = ResourcesCatalogSchema.parse(resourcesRaw);

const curriculumDir = path.join(rootDir, "curriculum");
const curriculumFiles = fs
  .readdirSync(curriculumDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

const parsedCatalogs = curriculumFiles.map((file) => {
  const raw = JSON.parse(fs.readFileSync(path.join(curriculumDir, file), "utf8"));
  return CurriculumCatalogSchema.parse(raw);
});

const curriculum = {
  version: "1.0" as const,
  domains: parsedCatalogs.flatMap((c) => c.domains),
  concepts: parsedCatalogs.flatMap((c) => c.concepts),
};

const lessonsDir = path.join(rootDir, "lessons");
const lessonDirs = fs.existsSync(lessonsDir)
  ? fs
      .readdirSync(lessonsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
  : [];

const lessons = lessonDirs.map((dir) => {
  const manifestPath = path.join(lessonsDir, dir.name, "lesson.json");
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  return LessonManifestSchema.parse(raw);
});

const report = validateCurriculumIntegrity(curriculum, resources, lessons);
const { units } = loadV4PlanningState(rootDir);
for (const lesson of lessons) {
  const pagePath = path.join(lessonsDir, lesson.slug, "course.page.json");
  if (!fs.existsSync(pagePath)) continue;
  const page = CoursePageSchema.parse(JSON.parse(fs.readFileSync(pagePath, "utf8")));
  const unit = units.units.find((entry) => entry.id === page.unitId);
  if (!unit) throw new Error(`Unknown unit for complete course: ${lesson.slug}`);
  const mdxPath = path.join(lessonsDir, lesson.slug, "course.mdx");
  if (fs.existsSync(mdxPath)) {
    const { report: qualityReport, staleFiles } = compileCourseDirectory(lesson.slug, {
      checkOnly: true,
    });
    if (staleFiles.length > 0) {
      throw new Error(
        `Compiled course artifacts out of sync with MDX+YAML for ${lesson.slug}: ${staleFiles.join(", ")}`,
      );
    }
    if (!qualityReport.passed) {
      const details = qualityReport.issues.map((i) => `[${i.code}] ${i.message}`).join("; ");
      throw new Error(
        `Course quality rubric failed for ${lesson.slug} (${qualityReport.score}/100): ${details}`,
      );
    }
    const audioManifestPath = path.join(lessonsDir, lesson.slug, "audio-manifest.json");
    if (fs.existsSync(audioManifestPath)) {
      const audioManifest = CourseAudioManifestSchema.parse(
        JSON.parse(fs.readFileSync(audioManifestPath, "utf8")),
      );
      const expectedChapters = (page.courseParts ?? []).flatMap((p) => p.chapters);
      for (const ch of expectedChapters) {
        const track = audioManifest.chapters[ch.id];
        if (!track) {
          throw new Error(`Audio manifest missing chapter ${ch.id} for ${lesson.slug}`);
        }
        const scenes = ch.scenes ?? [];
        if (scenes.length > 0) {
          if (track.cues.length !== scenes.length) {
            throw new Error(
              `Audio manifest cue count mismatch on ${lesson.slug}/${ch.id}: ${track.cues.length} cues vs ${scenes.length} scenes`,
            );
          }
          for (let idx = 0; idx < scenes.length; idx += 1) {
            if (track.cues[idx]?.blockId !== scenes[idx]?.id) {
              throw new Error(
                `Audio manifest cue mismatch on ${lesson.slug}/${ch.id}[${idx}]: ${track.cues[idx]?.blockId} vs ${scenes[idx]?.id}`,
              );
            }
          }
        }
      }
    }
  }
}

if (!report.valid) {
  console.error("Curriculum integrity check failed:");
  for (const issue of report.issues) {
    console.error(`- [${issue.code}] ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `Curriculum validation passed: ${curriculumFiles.length} catalog(s), ${curriculum.domains.length} domain(s), ${curriculum.concepts.length} concept(s), ${lessons.length} lesson(s), ${resources.resources.length} resource(s).`,
);
