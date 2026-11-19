import { z } from "zod";

export const ReadingLessonSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    lessonId: z.string().min(1),
    title: z.string().min(1),
    estimatedMinutes: z.number().int().positive(),
    sections: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z][a-z0-9-]*$/),
            title: z.string().min(1),
            summary: z.string().min(1),
            minutes: z.number().int().positive(),
            pauseForPractice: z.boolean(),
            paragraphs: z
              .array(
                z
                  .object({
                    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
                    text: z.string().min(1),
                    kind: z.enum(["paragraph", "callout", "quote"]).default("paragraph"),
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((document, context) => {
    const ids = new Set<string>();
    for (const section of document.sections) {
      for (const id of [section.id, ...section.paragraphs.map((paragraph) => paragraph.id)]) {
        if (ids.has(id))
          context.addIssue({ code: "custom", message: `Duplicate reader id: ${id}` });
        ids.add(id);
      }
    }
  });

export type ReadingLesson = z.infer<typeof ReadingLessonSchema>;

/** Narration identity excludes visual styling; changing words/order invalidates old audio. */
export function readingContentKey(reader: ReadingLesson): string {
  return JSON.stringify(
    reader.sections.map((section) => [
      section.id,
      section.title,
      section.pauseForPractice,
      section.paragraphs.map((paragraph) => [paragraph.id, paragraph.text]),
    ]),
  );
}

export const ReadingAudioSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    publicPath: z.string().startsWith("/audio/"),
    voice: z.string().min(1),
    duration: z.number().positive(),
    cues: z
      .array(
        z
          .object({
            sectionId: z.string().min(1),
            paragraphId: z.string().min(1),
            start: z.number().nonnegative(),
            end: z.number().positive(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type ReadingAudio = z.infer<typeof ReadingAudioSchema>;
