import fs from "node:fs";
import path from "node:path";
import {
  CurriculumCatalogSchema,
  LessonManifestSchema,
  ResourcesCatalogSchema,
  validateCurriculumIntegrity,
} from "@cyber-school/lesson-runtime";

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
const lessonDirs = fs
  .readdirSync(lessonsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));

const lessons = lessonDirs.map((dir) => {
  const manifestPath = path.join(lessonsDir, dir.name, "lesson.json");
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  return LessonManifestSchema.parse(raw);
});

const report = validateCurriculumIntegrity(curriculum, resources, lessons);

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
