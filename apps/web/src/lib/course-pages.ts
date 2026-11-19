import fs from "node:fs";
import path from "node:path";
import {
  CourseAudioManifestSchema,
  CoursePageSchema,
  LessonManifestSchema,
  StableIdSchema,
  validateCoursePageBindings,
  type AtomicConcept,
  type CoursePage,
  type LessonManifest,
  type ResourceMetadata,
} from "@cyber-school/lesson-runtime";
import { EXPERIENCE_CATALOG } from "@/components/course-experiences/catalog";
import type { LessonAudioManifest } from "./course/course-audio";
import { findRepoRoot, loadAcademyData } from "./curriculum-data";

export interface CompleteCourseBundle {
  lesson: LessonManifest;
  page: CoursePage;
  concept: AtomicConcept;
  linkedResources: ResourceMetadata[];
  audioManifest: LessonAudioManifest | null;
}

export function listCompleteCourseSlugs(rootDir = findRepoRoot()): string[] {
  const lessonsDir = path.join(/*turbopackIgnore: true*/ rootDir, "lessons");
  if (!fs.existsSync(lessonsDir)) return [];
  return fs
    .readdirSync(lessonsDir, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isDirectory()) return false;
      const pagePath = path.join(
        /*turbopackIgnore: true*/ lessonsDir,
        entry.name,
        "course.page.json",
      );
      const manifestPath = path.join(
        /*turbopackIgnore: true*/ lessonsDir,
        entry.name,
        "lesson.json",
      );
      return fs.existsSync(pagePath) && fs.existsSync(manifestPath);
    })
    .map((entry) => entry.name)
    .sort();
}

export function loadCompleteCourseBySlug(
  slug: string,
  rootDir = findRepoRoot(),
): CompleteCourseBundle | undefined {
  const parsedSlug = StableIdSchema.safeParse(slug);
  if (!parsedSlug.success) return undefined;

  const lessonDir = path.join(/*turbopackIgnore: true*/ rootDir, "lessons", parsedSlug.data);
  const manifestPath = path.join(/*turbopackIgnore: true*/ lessonDir, "lesson.json");
  const pagePath = path.join(/*turbopackIgnore: true*/ lessonDir, "course.page.json");

  if (!fs.existsSync(manifestPath) || !fs.existsSync(pagePath)) {
    return undefined;
  }

  const { curriculum, resources } = loadAcademyData(rootDir);
  const lesson = LessonManifestSchema.parse(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
  const page = CoursePageSchema.parse(JSON.parse(fs.readFileSync(pagePath, "utf8")));

  const bindingIssues = validateCoursePageBindings(page, lesson, {
    resources,
    experienceIds: EXPERIENCE_CATALOG.map((entry) => entry.id),
  });
  if (bindingIssues.length > 0) {
    throw new Error(`Invalid course page bindings for ${slug}: ${bindingIssues.join("; ")}`);
  }

  const concept = curriculum.concepts.find((entry) => entry.id === lesson.conceptId);
  if (!concept) {
    throw new Error(`Missing concept ${lesson.conceptId} for lesson ${lesson.slug}`);
  }

  const resourceMap = new Map(resources.resources.map((res) => [res.id, res]));
  const linkedResources = lesson.resourceIds
    .map((id) => resourceMap.get(id))
    .filter((res): res is ResourceMetadata => Boolean(res));

  let audioManifest: LessonAudioManifest | null = null;
  const audioManifestPath = path.join(/*turbopackIgnore: true*/ lessonDir, "audio-manifest.json");
  if (fs.existsSync(audioManifestPath)) {
    const rawAudio = JSON.parse(fs.readFileSync(audioManifestPath, "utf8"));
    const parsedAudio = CourseAudioManifestSchema.safeParse(rawAudio);
    if (parsedAudio.success) {
      audioManifest = parsedAudio.data;
    }
  }

  return {
    lesson,
    page,
    concept,
    linkedResources,
    audioManifest,
  };
}
