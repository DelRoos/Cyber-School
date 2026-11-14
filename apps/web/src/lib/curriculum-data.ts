import fs from "node:fs";
import path from "node:path";
import {
  CurriculumCatalogSchema,
  LessonManifestSchema,
  ResourcesCatalogSchema,
  validateCurriculumIntegrity,
  type CurriculumCatalog,
  type LessonManifest,
  type ResourcesCatalog,
} from "@cyber-school/lesson-runtime";

export function findRepoRoot(): string {
  const candidates = [
    process.cwd(),
    path.resolve(/*turbopackIgnore: true*/ process.cwd(), ".."),
    path.resolve(/*turbopackIgnore: true*/ process.cwd(), "../.."),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(/*turbopackIgnore: true*/ dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
  }
  return process.cwd();
}

export interface AcademyData {
  curriculum: CurriculumCatalog;
  resources: ResourcesCatalog;
  lessons: LessonManifest[];
  featuredLesson: LessonManifest | undefined;
}

export function loadAcademyData(rootDir = findRepoRoot()): AcademyData {
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

  const curriculum: CurriculumCatalog = {
    version: "1.0",
    domains: parsedCatalogs.flatMap((c) => c.domains),
    concepts: parsedCatalogs.flatMap((c) => c.concepts),
  };

  const lessonsDir = path.join(rootDir, "lessons");
  const lessonDirs = fs
    .readdirSync(lessonsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const lessons = lessonDirs.map((dir) => {
    const raw = JSON.parse(fs.readFileSync(path.join(lessonsDir, dir.name, "lesson.json"), "utf8"));
    return LessonManifestSchema.parse(raw);
  });

  const report = validateCurriculumIntegrity(curriculum, resources, lessons);
  if (!report.valid) {
    const summary = report.issues.map((issue) => `[${issue.code}] ${issue.message}`).join("; ");
    throw new Error(`Curriculum integrity validation failed: ${summary}`);
  }

  const featuredLesson =
    lessons.find((lesson) => lesson.slug === "tcp-three-way-handshake") ?? lessons[0];

  return {
    curriculum,
    resources,
    lessons,
    featuredLesson,
  };
}
