import fs from "node:fs";
import path from "node:path";
import {
  V4ImportedCurriculumSchema,
  V4ProductionRegistrySchema,
  V4UnitsCatalogSchema,
} from "@cyber-school/lesson-runtime";
import { findRepoRoot } from "../curriculum-data";

export interface RealChapterFact {
  title: string;
  estimatedMinutes: number;
  microLessonsCount: number;
  isOpen: boolean;
  lessonSlug?: string;
}

export interface RealModuleFact {
  id: string;
  order: number;
  title: string;
  totalMinutes: number;
  microLessonsCount: number;
  microLessons: Array<{ id: string; title: string }>;
  prerequisiteModuleIds: string[];
  relatedModules: Array<{ id: string; title: string; parcoursId: string }>;
  competencies: string[];
  chapters: RealChapterFact[];
  openLessonSlug?: string;
}

export interface RealExamFact {
  id: string;
  title: string;
  criteria: string[];
  externalLabs: Array<{ label: string; url: string }>;
}

export interface AudioCueSpec {
  id: string;
  order: number;
  title: string;
  sectionId: string;
  activeNodeId?: string;
  spokenText: string;
  estimatedDurationMs: number;
  startMs?: number;
  endMs?: number;
}

export interface ParcoursAudioData {
  slug: string;
  model: string;
  voiceName: string;
  audioSrc?: string;
  hasGeneratedAudio: boolean;
  cues: AudioCueSpec[];
}

interface RawScriptManifest {
  tracks: Record<
    string,
    {
      voiceName: string;
      cues: Array<{
        id: string;
        title: string;
        sectionId: string;
        activeNodeId?: string;
        spokenText: string;
      }>;
    }
  >;
}

interface RawGeneratedManifest {
  tracks?: Record<
    string,
    {
      model: string;
      voiceName: string;
      audioPath: string;
      cues: Array<{ id: string; startMs: number; endMs: number }>;
    }
  >;
}

function estimateSpeechDurationMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // ~145 spoken words per minute in deliberate French teaching narration
  return Math.max(4000, Math.round((words / 145) * 60_000));
}

function loadOpenLessonTitles(rootDir: string): Record<string, string> {
  const lessonsDir = path.join(/*turbopackIgnore: true*/ rootDir, "lessons");
  if (!fs.existsSync(lessonsDir)) return {};
  const titles: Record<string, string> = {};
  for (const entry of fs.readdirSync(lessonsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(/*turbopackIgnore: true*/ lessonsDir, entry.name, "lesson.json");
    if (!fs.existsSync(file)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { slug?: string; title?: string };
      if (parsed.slug && parsed.title) {
        titles[parsed.slug] = parsed.title;
      }
    } catch {
      // Skip malformed files
    }
  }
  return titles;
}

function resolveHumanTitle(
  rawTitle: string,
  microLessonIds: string[],
  microMap: Map<string, string>,
  openLessonTitle?: string,
): string {
  if (openLessonTitle) return openLessonTitle;

  const isPlaceholder = /^[A-Z]+-\d+\s*[—-]\s*Unité\s+\d+\s*\(/i.test(rawTitle);
  if (!isPlaceholder) {
    return rawTitle.replace(/\s*\([A-Z]+\d+\.\d+(?:\.\.[A-Z]+\d+\.\d+)?\)$/i, "").trim();
  }

  const names = microLessonIds.map((id) => microMap.get(id)).filter((t): t is string => Boolean(t));
  if (names.length >= 2) return `${names[0]} · ${names[1]}`;
  if (names.length === 1 && names[0]) return names[0];
  return "Séquence thématique";
}

export function formatMinutesHuman(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours <= 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${String(mins).padStart(2, "0")}`;
}

// Read and validate once per request, then reuse for the six domain summaries.
// Request-local data keeps author edits fresh without a global cache.
export function loadParcoursFactsSource(rootDir = findRepoRoot()) {
  const imported = V4ImportedCurriculumSchema.parse(
    JSON.parse(
      fs.readFileSync(path.join(rootDir, "curriculum/v4/imported-curriculum.json"), "utf8"),
    ),
  );
  const units = V4UnitsCatalogSchema.parse(
    JSON.parse(fs.readFileSync(path.join(rootDir, "production/units.json"), "utf8")),
  );
  const registry = V4ProductionRegistrySchema.parse(
    JSON.parse(fs.readFileSync(path.join(rootDir, "production/registry.json"), "utf8")),
  );

  return { imported, units, registry, openTitles: loadOpenLessonTitles(rootDir) };
}

export function loadDomainRealFacts(
  domainId: string,
  rootDir = findRepoRoot(),
  source = loadParcoursFactsSource(rootDir),
): {
  modules: RealModuleFact[];
  examsById: Record<string, RealExamFact>;
  moduleTitleById: Record<string, { title: string; parcoursId: string }>;
  totalMinutes: number;
  totalChapters: number;
  totalMicroLessons: number;
} {
  const { imported, units, registry, openTitles } = source;
  const recordMap = new Map(registry.records.map((r) => [r.unitId, r]));
  const unitToModule = new Map(units.units.map((u) => [u.id, u.moduleId]));
  const microTitleMap = new Map(imported.microLessons.map((m) => [m.id, m.title]));

  const moduleTitleById: Record<string, { title: string; parcoursId: string }> = {};
  for (const mod of imported.modules) {
    moduleTitleById[mod.id] = { title: mod.title, parcoursId: mod.domainId };
  }

  const examsById: Record<string, RealExamFact> = {};
  for (const ex of imported.exams) {
    examsById[ex.id] = {
      id: ex.id,
      title: ex.title,
      criteria: ex.criteria.map((c) => c.replace(/^[A-Z]+\d+\.\d+\s*[—-]\s*/i, "").trim()),
      externalLabs: ex.externalLabs.map((l) => ({ label: l.label, url: l.url })),
    };
  }

  const domainModules = imported.modules
    .filter((m) => m.domainId === domainId)
    .sort((a, b) => a.moduleOrder - b.moduleOrder);

  const modules: RealModuleFact[] = domainModules.map((mod, idx) => {
    const modUnits = units.units.filter((u) => u.moduleId === mod.id);
    const prereqMods = new Set<string>();
    for (const p of mod.explicitPrerequisites ?? []) {
      if (p !== mod.id && moduleTitleById[p]) prereqMods.add(p);
    }
    // X has no explicit prerequisite specification in V4. Generated links are
    // proposals, so do not turn production scheduling into mandatory learner prerequisites.
    for (const u of mod.id.startsWith("X-") ? [] : modUnits) {
      for (const preUnitId of u.prerequisiteUnitIds) {
        const preMod = unitToModule.get(preUnitId);
        if (preMod && preMod !== mod.id) prereqMods.add(preMod);
      }
    }

    const chapters: RealChapterFact[] = modUnits.map((u) => {
      const rec = recordMap.get(u.id);
      const candidateSlug = rec?.lessonSlug ?? u.legacyBridgeLessonSlug;
      const lessonSlug = candidateSlug && openTitles[candidateSlug] ? candidateSlug : undefined;
      return {
        title: resolveHumanTitle(
          u.title,
          u.microLessonIds,
          microTitleMap,
          lessonSlug ? openTitles[lessonSlug] : undefined,
        ),
        estimatedMinutes: u.estimatedMinutes,
        microLessonsCount: u.microLessonIds.length,
        isOpen: Boolean(lessonSlug),
        ...(lessonSlug ? { lessonSlug } : {}),
      };
    });

    const totalMinutes = chapters.reduce((acc, c) => acc + c.estimatedMinutes, 0);
    const firstOpen = chapters.find((c) => c.lessonSlug)?.lessonSlug;

    return {
      id: mod.id,
      order: idx + 1,
      title: mod.title,
      totalMinutes,
      microLessonsCount: mod.microLessonIds.length,
      microLessons: mod.microLessonIds.flatMap((id) => {
        const title = microTitleMap.get(id);
        return title ? [{ id, title }] : [];
      }),
      prerequisiteModuleIds: [...prereqMods],
      relatedModules: mod.proposedDependencies.flatMap((dependency) => {
        const target = moduleTitleById[dependency.targetId];
        return dependency.status !== "rejected" && dependency.targetKind === "module" && target
          ? [{ id: dependency.targetId, ...target }]
          : [];
      }),
      competencies: mod.competencies.slice(0, 5).map((c) => c.title),
      chapters,
      ...(firstOpen ? { openLessonSlug: firstOpen } : {}),
    };
  });

  return {
    modules,
    examsById,
    moduleTitleById,
    totalMinutes: modules.reduce((acc, m) => acc + m.totalMinutes, 0),
    totalChapters: modules.reduce((acc, m) => acc + m.chapters.length, 0),
    totalMicroLessons: modules.reduce((acc, m) => acc + m.microLessonsCount, 0),
  };
}

export function loadParcoursAudio(slug: string, rootDir = findRepoRoot()): ParcoursAudioData {
  const scriptsPath = path.join(rootDir, "apps/web/src/lib/parcours/parcours-audio-scripts.json");
  const scriptsRaw = JSON.parse(fs.readFileSync(scriptsPath, "utf8")) as RawScriptManifest;
  const trackScript = scriptsRaw.tracks[slug];

  const manifestPath = path.join(rootDir, "apps/web/src/lib/parcours/audio-manifests.json");
  let generatedManifest: RawGeneratedManifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      generatedManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as RawGeneratedManifest;
    } catch {
      generatedManifest = {};
    }
  }

  const generatedTrack = generatedManifest.tracks?.[slug];
  const wavDiskPath = path.join(rootDir, "apps/web/public/audio/parcours", `${slug}.wav`);
  const hasGeneratedAudio = Boolean(generatedTrack && fs.existsSync(wavDiskPath));

  let runningMs = 0;
  const cues: AudioCueSpec[] = (trackScript?.cues ?? []).map((cue, index) => {
    const matched = generatedTrack?.cues.find((c) => c.id === cue.id);
    const estimatedDurationMs = estimateSpeechDurationMs(cue.spokenText);
    const startMs = hasGeneratedAudio && matched ? matched.startMs : runningMs;
    const endMs = hasGeneratedAudio && matched ? matched.endMs : runningMs + estimatedDurationMs;
    runningMs = endMs;
    return {
      id: cue.id,
      order: index + 1,
      title: cue.title,
      sectionId: cue.sectionId,
      ...(cue.activeNodeId ? { activeNodeId: cue.activeNodeId } : {}),
      spokenText: cue.spokenText,
      estimatedDurationMs,
      startMs,
      endMs,
    };
  });

  return {
    slug,
    model: generatedTrack?.model ?? "gemini-2.5-pro-preview-tts",
    voiceName: generatedTrack?.voiceName ?? trackScript?.voiceName ?? "Kore",
    ...(hasGeneratedAudio ? { audioSrc: `/audio/parcours/${slug}.wav` } : {}),
    hasGeneratedAudio,
    cues,
  };
}
