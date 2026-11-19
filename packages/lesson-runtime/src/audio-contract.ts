import { z } from "zod";
import { StableIdSchema } from "./schemas.js";

export const AudioWordTimingSchema = z
  .object({
    word: z.string().min(1),
    startMs: z.number().int().min(0),
    endMs: z.number().int().min(0),
  })
  .strict();

export const CourseAudioScriptCueSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().trim().min(3),
    blockId: StableIdSchema,
    spokenText: z.string().trim().min(20),
    style: z.string().trim().min(3).optional(),
    pauseForAction: z.boolean().optional(),
    focusPoints: z.array(z.string().trim().min(8)).min(1).max(5).optional(),
  })
  .strict();

export const CourseAudioScriptChapterSchema = z
  .object({
    title: z.string().trim().min(3),
    voiceName: z.string().trim().min(2),
    style: z.string().trim().min(3).optional(),
    cues: z.array(CourseAudioScriptCueSchema).min(1),
  })
  .strict();

export const CourseAudioScriptsSchema = z
  .object({
    version: z.literal("2.0"),
    slug: StableIdSchema,
    recommendedModel: z.string().trim().min(3),
    voiceName: z.string().trim().min(2),
    persona: z.string().trim().min(5),
    defaultStyle: z.string().trim().min(5),
    chapters: z.record(StableIdSchema, CourseAudioScriptChapterSchema),
  })
  .strict();

export const CourseAudioManifestCueSchema = CourseAudioScriptCueSchema.extend({
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(0),
  estimatedDurationMs: z.number().int().min(0),
  wordTimings: z.array(AudioWordTimingSchema).optional(),
}).strict();

export const CourseAudioManifestChapterSchema = z
  .object({
    chapterId: StableIdSchema,
    chapterTitle: z.string().trim().min(3),
    model: z.string().trim().min(3),
    voiceName: z.string().trim().min(2),
    audioSrc: z.string().trim().min(1),
    fallbackAudioSrc: z.string().trim().min(1).optional(),
    mimeType: z.string().trim().min(3).optional(),
    totalMs: z.number().int().min(0),
    cues: z.array(CourseAudioManifestCueSchema).min(1),
  })
  .strict();

export const CourseAudioManifestSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    model: z.string().trim().min(3),
    persona: z.string().trim().min(3),
    voiceName: z.string().trim().min(2),
    chapters: z.record(StableIdSchema, CourseAudioManifestChapterSchema),
  })
  .strict();

export type AudioWordTiming = z.infer<typeof AudioWordTimingSchema>;
export type CourseAudioScriptCue = z.infer<typeof CourseAudioScriptCueSchema>;
export type CourseAudioScriptChapter = z.infer<typeof CourseAudioScriptChapterSchema>;
export type CourseAudioScripts = z.infer<typeof CourseAudioScriptsSchema>;
export type CourseAudioManifestCue = z.infer<typeof CourseAudioManifestCueSchema>;
export type CourseAudioManifestChapter = z.infer<typeof CourseAudioManifestChapterSchema>;
export type CourseAudioManifest = z.infer<typeof CourseAudioManifestSchema>;
