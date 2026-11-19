import { z } from "zod";
import {
  CourseAudioScriptsSchema,
  type CourseAudioScriptCue,
  type CourseAudioScripts,
} from "./audio-contract.js";
import {
  CourseEditorialBlockSchema,
  CoursePageSchema,
  SlideVisualSpecSchema,
  type CourseChapter,
  type CourseEditorialBlock,
  type CoursePage,
  type CoursePart,
  type CoursePartChapter,
  type CourseScene,
  type SlideVisualSpec,
} from "./course-page.js";
import {
  AssessmentBlueprintSchema,
  ExerciseDefinitionSchema,
  ExternalLabLinkSchema,
  LessonManifestSchema,
  LessonReviewSchema,
  LessonStepSchema,
  StableIdSchema,
  type ExerciseDefinition,
  type LessonManifest,
} from "./schemas.js";
import { parseYaml } from "./yaml-parser.js";

export const CourseMetaYamlSchema = z
  .object({
    schemaVersion: z.literal("2.0"),
    contentRevision: z.string().regex(/^\d+\.\d+\.\d+$/),
    id: StableIdSchema,
    slug: StableIdSchema,
    unitId: StableIdSchema,
    conceptId: StableIdSchema,
    microLessonIds: z.array(z.string().regex(/^[A-Z]+\d+\.\d{3}$/)).min(1),
    title: z.string().trim().min(3),
    audience: z.string().trim().min(10),
    levelLabel: z.string().trim().min(3),
    estimatedMinutes: z.number().int().positive(),
    medium: z.enum(["2d-animated", "2d-graph", "3d-scene", "hybrid"]),
    mediumJustification: z.string().trim().min(15),
    status: z.enum(["draft", "in-review", "published"]),
    review: LessonReviewSchema.optional(),
    resourceIds: z.array(StableIdSchema).min(1),
    introduction: z.string().trim().min(20),
    overviewNarrative: z.array(z.string().trim().min(20)).min(2),
    learningObjectives: z.array(z.string().trim().min(20)).min(2),
    prerequisites: z.array(z.string().trim().min(20)).min(1),
    finalTakeaway: z.string().trim().min(20),
    audio: z
      .object({
        model: z.string().trim().min(3),
        voiceName: z.string().trim().min(2),
        persona: z.string().trim().min(5),
        defaultStyle: z.string().trim().min(5),
      })
      .strict(),
    canonicalStep: LessonStepSchema,
    canonicalChapter: z
      .object({
        id: StableIdSchema,
        title: z.string().trim().min(3),
        estimatedMinutes: z.number().int().positive(),
        question: z.string().trim().min(20),
        objective: z.string().trim().min(20),
        explanation: z.array(z.string().trim().min(20)).min(2),
        workedExample: z
          .object({
            title: z.string().trim().min(3),
            startingPoint: z.string().trim().min(20),
            steps: z.array(z.string().trim().min(20)).min(2),
            conclusion: z.string().trim().min(20),
          })
          .strict(),
        experience: z
          .object({
            componentId: StableIdSchema,
            instruction: z.string().trim().min(20),
            observe: z.string().trim().min(20),
            modelLimits: z.string().trim().min(20),
          })
          .strict(),
        misconception: z
          .object({
            claim: z.string().trim().min(20),
            correction: z.string().trim().min(20),
          })
          .strict(),
        takeaway: z.string().trim().min(20),
        transferQuestion: z.string().trim().min(20),
      })
      .strict(),
    externalLabs: z.array(ExternalLabLinkSchema),
  })
  .strict();

export const CourseExercisesYamlSchema = z
  .object({
    schemaVersion: z.literal("2.0"),
    predictionExerciseId: StableIdSchema,
    assessments: z.array(AssessmentBlueprintSchema).min(1),
    exercises: z.array(
      ExerciseDefinitionSchema.and(
        z.object({
          misconceptionTags: z.record(z.string(), z.string().min(3)).optional(),
        }),
      ),
    ),
  })
  .strict();

export type CourseMetaYaml = z.infer<typeof CourseMetaYamlSchema>;
export type CourseExercisesYaml = z.infer<typeof CourseExercisesYamlSchema>;

export interface CompiledCourseArtifacts {
  lesson: LessonManifest;
  page: CoursePage;
  audioScripts: CourseAudioScripts;
  meta: CourseMetaYaml;
  misconceptionTagsByExercise: Record<string, Record<string, string>>;
}

interface ScannedTag {
  tagName: string;
  attrs: Record<string, string>;
  body: string;
  selfClosing: boolean;
  startIndex: number;
  endIndex: number;
}

function dedentBlock(raw: string): string {
  const lines = raw
    .replace(/^\r?\n/, "")
    .replace(/\r?\n[ \t]*$/, "")
    .split(/\r?\n/);
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const indent = line.length - line.trimStart().length;
    if (indent < minIndent) minIndent = indent;
  }
  if (!Number.isFinite(minIndent) || minIndent === 0) return lines.join("\n").trim();
  return lines
    .map((line) => (line.trim().length === 0 ? "" : line.slice(minIndent)))
    .join("\n")
    .trim();
}

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of raw.matchAll(attrRegex)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? "";
    if (key) attrs[key] = value;
  }
  return attrs;
}

/**
 * Quote-aware tag opening scanner: safely supports `>` inside quoted attribute strings
 * (e.g. `conclusion="3 -> 2 -> 1"`).
 */
function findTagOpenEnd(source: string, start: number): { end: number; selfClosing: boolean } {
  let quote: '"' | "'" | null = null;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\" && i + 1 < source.length) {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ">") {
      const prev = source[i - 1];
      return { end: i, selfClosing: prev === "/" };
    }
  }
  throw new Error(
    `MDX syntax error: unclosed opening tag near "${source.slice(start, start + 60)}".`,
  );
}

function scanTopLevelTags(source: string, allowedTags: ReadonlySet<string>): ScannedTag[] {
  const results: ScannedTag[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const openIdx = source.indexOf("<", cursor);
    if (openIdx < 0) break;

    const rest = source.slice(openIdx);
    const nameMatch = rest.match(/^<([A-Z][A-Za-z0-9]*)(?=[\s/>])/);
    if (!nameMatch || !nameMatch[1]) {
      cursor = openIdx + 1;
      continue;
    }

    const tagName = nameMatch[1];
    if (!allowedTags.has(tagName)) {
      cursor = openIdx + 1;
      continue;
    }

    const afterName = openIdx + 1 + tagName.length;
    const { end: openEnd, selfClosing } = findTagOpenEnd(source, afterName);
    const rawAttrs = source.slice(afterName, selfClosing ? openEnd - 1 : openEnd);
    const attrs = parseAttributes(rawAttrs);

    if (selfClosing) {
      results.push({
        tagName,
        attrs,
        body: "",
        selfClosing: true,
        startIndex: openIdx,
        endIndex: openEnd + 1,
      });
      cursor = openEnd + 1;
      continue;
    }

    const closeToken = `</${tagName}>`;
    const closeIdx = source.indexOf(closeToken, openEnd + 1);
    if (closeIdx < 0) {
      throw new Error(`MDX syntax error: missing closing tag ${closeToken} for <${tagName}>.`);
    }

    const body = dedentBlock(source.slice(openEnd + 1, closeIdx));
    results.push({
      tagName,
      attrs,
      body,
      selfClosing: false,
      startIndex: openIdx,
      endIndex: closeIdx + closeToken.length,
    });
    cursor = closeIdx + closeToken.length;
  }

  return results;
}

function extractTaggedBlocks(
  source: string,
  tagName: string,
): Array<{ attrs: Record<string, string>; body: string }> {
  return scanTopLevelTags(source, new Set([tagName])).map(({ attrs, body }) => ({ attrs, body }));
}

function extractSingleTag(
  source: string,
  tagName: string,
): { attrs: Record<string, string>; body: string } | null {
  const matches = extractTaggedBlocks(source, tagName);
  return matches[0] ?? null;
}

function stripTags(source: string, tagNames: readonly string[]): string {
  const found = scanTopLevelTags(source, new Set(tagNames));
  if (found.length === 0) return source.trim();
  let out = "";
  let last = 0;
  for (const tag of found) {
    out += source.slice(last, tag.startIndex);
    last = tag.endIndex;
  }
  out += source.slice(last);
  return out.trim();
}

function requireAttr(attrs: Record<string, string>, name: string, ctx: string): string {
  const val = attrs[name]?.trim();
  if (!val) throw new Error(`MDX ${ctx}: missing required attribute "${name}".`);
  return val;
}

function parseBoolAttr(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid boolean attribute value "${value}". Expected "true" or "false".`);
}

function parseMarkdownBulletLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^(?:[-*]|\d+\.)\s+/, "").trim())
    .filter((line) => line.length > 0);
}

function parseMarkdownTable(
  raw: string,
  caption?: string,
): Extract<CourseEditorialBlock, { type: "table" }> {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));
  if (lines.length < 3) {
    throw new Error(
      "MDX <Table> must contain a header row, separator row, and at least 1 data row.",
    );
  }
  const splitRow = (line: string) => {
    const cells: string[] = [];
    const inner = line.slice(1, -1);
    let current = "";
    for (let idx = 0; idx < inner.length; idx += 1) {
      const ch = inner[idx];
      if (ch === "\\" && inner[idx + 1] === "|") {
        current += "|";
        idx += 1;
        continue;
      }
      if (ch === "|") {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  };

  const headers = splitRow(lines[0]!);
  const rows = lines.slice(2).map(splitRow);
  return {
    type: "table",
    headers,
    rows,
    ...(caption ? { caption } : {}),
  };
}

function assertNoUnknownComponentTags(fragment: string, sceneId: string): void {
  const cleaned = fragment.replace(/`[^`]*`/g, "");
  const unknown = cleaned.match(/<\/?([A-Z][A-Za-z0-9]*)\b/);
  if (unknown && unknown[1]) {
    throw new Error(
      `MDX Scene ${sceneId}: unknown or improperly closed component tag <${unknown[1]}>.`,
    );
  }
}

function parseMarkdownFlow(markdown: string, sceneId: string): CourseEditorialBlock[] {
  assertNoUnknownComponentTags(markdown, sceneId);
  const blocks: CourseEditorialBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const text = trimmed.replace(/^#{2,3}\s+/, "").trim();
      blocks.push({ type: "heading", text });
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      let attribution: string | undefined;
      while (i < lines.length && (lines[i] ?? "").trim().startsWith(">")) {
        const content = (lines[i] ?? "").trim().replace(/^>\s?/, "").trim();
        if (content.startsWith("-- ")) {
          attribution = content.slice(3).trim();
        } else if (content.length > 0) {
          quoteLines.push(content);
        }
        i += 1;
      }
      if (quoteLines.length > 0) {
        blocks.push({
          type: "quote",
          paragraphs: quoteLines,
          ...(attribution ? { attribution } : {}),
        });
      }
      continue;
    }

    if (/^(?:[-*]|\d+\.)\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const rawItems: string[] = [];
      while (i < lines.length && /^(?:[-*]|\d+\.)\s+/.test((lines[i] ?? "").trim())) {
        rawItems.push(
          (lines[i] ?? "")
            .trim()
            .replace(/^(?:[-*]|\d+\.)\s+/, "")
            .trim(),
        );
        i += 1;
      }

      const structured = rawItems.map((item) => {
        const boldMatch = item.match(/^\*\*([^*]+)\*\*\s*(?:[:·—-]\s*)?(.*)$/);
        if (boldMatch && boldMatch[1] && boldMatch[2] && boldMatch[2].trim().length >= 8) {
          return { lead: boldMatch[1].trim(), detail: boldMatch[2].trim() };
        }
        const colonIdx = item.indexOf(" : ");
        if (colonIdx > 1 && item.slice(colonIdx + 3).trim().length >= 8) {
          return {
            lead: item.slice(0, colonIdx).replace(/\*\*/g, "").trim(),
            detail: item.slice(colonIdx + 3).trim(),
          };
        }
        if (item.trim().length >= 8) {
          return { detail: item.trim() };
        }
        return null;
      });

      if (structured.length >= 2 && structured.every((entry) => entry !== null)) {
        blocks.push({
          type: "list",
          ordered,
          items: structured as Array<{ lead?: string; detail: string }>,
        });
      } else {
        blocks.push({
          type: "prose",
          paragraphs: rawItems,
        });
      }
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const candidate = (lines[i] ?? "").trim();
      if (
        !candidate ||
        candidate.startsWith("## ") ||
        candidate.startsWith("### ") ||
        candidate.startsWith(">") ||
        /^(?:[-*]|\d+\.)\s+/.test(candidate)
      ) {
        break;
      }
      paraLines.push(candidate);
      i += 1;
    }
    if (paraLines.length > 0) {
      const merged = paraLines.join(" ").trim();
      const prev = blocks[blocks.length - 1];
      if (prev && prev.type === "prose") {
        prev.paragraphs.push(merged);
      } else {
        blocks.push({ type: "prose", paragraphs: [merged] });
      }
    }
  }

  return blocks;
}

const SCENE_COMPONENT_TAGS = new Set([
  "Banner",
  "Visual",
  "Callout",
  "Terminal",
  "Table",
  "WorkedExample",
  "MicroCheck",
  "Practice",
  "Summary",
  "ReferenceSheet",
]);

function parseSceneBody(sceneId: string, rawBody: string): CourseEditorialBlock[] {
  const blocks: CourseEditorialBlock[] = [];
  const tags = scanTopLevelTags(rawBody, SCENE_COMPONENT_TAGS);
  let lastIndex = 0;

  for (const tag of tags) {
    const before = rawBody.slice(lastIndex, tag.startIndex).trim();
    if (before) {
      blocks.push(...parseMarkdownFlow(before, sceneId));
    }

    const { tagName, attrs, body } = tag;

    if (tagName === "Banner") {
      const variant = requireAttr(attrs, "variant", `Scene ${sceneId} <Banner>`) as
        "welcome" | "practice";
      blocks.push({
        type: "banner",
        variant,
        ...(attrs.caption ? { caption: attrs.caption } : {}),
      });
    } else if (tagName === "Visual") {
      const diagramId = requireAttr(attrs, "id", `Scene ${sceneId} <Visual>`);
      const caption = requireAttr(attrs, "caption", `Scene ${sceneId} <Visual>`);
      blocks.push({
        type: "diagram",
        diagramId,
        caption,
      });
    } else if (tagName === "Callout") {
      const kind = requireAttr(attrs, "kind", `Scene ${sceneId} <Callout>`) as
        "information" | "question" | "warning" | "error";
      blocks.push({
        type: "callout",
        kind,
        ...(attrs.title ? { title: attrs.title } : {}),
        body: body.replace(/\s*\r?\n\s*/g, " ").trim(),
      });
    } else if (tagName === "Terminal") {
      const label = requireAttr(attrs, "label", `Scene ${sceneId} <Terminal>`);
      blocks.push({
        type: "terminal",
        label,
        content: body,
      });
    } else if (tagName === "Table") {
      blocks.push(parseMarkdownTable(body, attrs.caption));
    } else if (tagName === "WorkedExample") {
      const title = requireAttr(attrs, "title", `Scene ${sceneId} <WorkedExample>`);
      const conclusion = requireAttr(attrs, "conclusion", `Scene ${sceneId} <WorkedExample>`);
      const startTag = extractSingleTag(body, "Start");
      if (!startTag) {
        throw new Error(`MDX Scene ${sceneId} <WorkedExample>: missing <Start>...</Start>.`);
      }
      const stepTags = extractTaggedBlocks(body, "Step");
      if (stepTags.length < 2) {
        throw new Error(`MDX Scene ${sceneId} <WorkedExample>: requires at least 2 <Step> items.`);
      }
      blocks.push({
        type: "worked-example",
        title,
        startingPoint: startTag.body,
        steps: stepTags.map((entry, idx) => ({
          step: entry.body.replace(/\s*\r?\n\s*/g, " ").trim(),
          why: requireAttr(
            entry.attrs,
            "why",
            `Scene ${sceneId} <WorkedExample><Step #${idx + 1}>`,
          ),
        })),
        conclusion,
      });
    } else if (tagName === "MicroCheck") {
      const id = requireAttr(attrs, "id", `Scene ${sceneId} <MicroCheck>`);
      const prompt = requireAttr(attrs, "prompt", `Scene ${sceneId} <MicroCheck>`);
      const correctOptionId = requireAttr(attrs, "correct", `Scene ${sceneId} <MicroCheck>`);
      const optionTags = extractTaggedBlocks(body, "Option");
      const explainTag = extractSingleTag(body, "Explain");
      if (!explainTag) {
        throw new Error(`MDX Scene ${sceneId} <MicroCheck ${id}>: missing <Explain>...</Explain>.`);
      }
      blocks.push({
        type: "micro-check",
        id,
        prompt,
        options: optionTags.map((opt, idx) => ({
          id: requireAttr(
            opt.attrs,
            "id",
            `Scene ${sceneId} <MicroCheck ${id}><Option #${idx + 1}>`,
          ),
          label: opt.body.replace(/\s*\r?\n\s*/g, " ").trim(),
          feedback: requireAttr(
            opt.attrs,
            "feedback",
            `Scene ${sceneId} <MicroCheck ${id}><Option #${idx + 1}>`,
          ),
        })),
        correctOptionId,
        explanation: explainTag.body.replace(/\s*\r?\n\s*/g, " ").trim(),
      });
    } else if (tagName === "Practice") {
      const title = requireAttr(attrs, "title", `Scene ${sceneId} <Practice>`);
      const contextTag = extractSingleTag(body, "Context");
      const stepsTag = extractSingleTag(body, "Steps");
      const selfCheckTag = extractSingleTag(body, "SelfCheck");
      if (!contextTag || !stepsTag) {
        throw new Error(`MDX Scene ${sceneId} <Practice>: requires <Context> and <Steps>.`);
      }
      const instructions = parseMarkdownBulletLines(stepsTag.body);
      const selfCheckPoints = selfCheckTag
        ? parseMarkdownBulletLines(selfCheckTag.body)
        : undefined;
      blocks.push({
        type: "practice",
        title,
        context: contextTag.body.replace(/\s*\r?\n\s*/g, " ").trim(),
        instructions,
        ...(attrs.experienceId ? { experienceId: attrs.experienceId } : {}),
        ...(attrs.showTransferPad ? { showTransferPad: parseBoolAttr(attrs.showTransferPad) } : {}),
        ...(selfCheckPoints && selfCheckPoints.length > 0 ? { selfCheckPoints } : {}),
        ...(attrs.solutionSummary ? { solutionSummary: attrs.solutionSummary } : {}),
      });
    } else if (tagName === "Summary") {
      const transition = requireAttr(attrs, "transition", `Scene ${sceneId} <Summary>`);
      const points = parseMarkdownBulletLines(body);
      blocks.push({
        type: "summary",
        points,
        transition,
      });
    } else if (tagName === "ReferenceSheet") {
      const title = requireAttr(attrs, "title", `Scene ${sceneId} <ReferenceSheet>`);
      const introTag = extractSingleTag(body, "Intro");
      const groupTags = extractTaggedBlocks(body, "Group");
      if (groupTags.length === 0) {
        throw new Error(`MDX Scene ${sceneId} <ReferenceSheet>: requires at least one <Group>.`);
      }
      blocks.push({
        type: "reference-sheet",
        title,
        ...(introTag ? { intro: introTag.body.replace(/\s*\r?\n\s*/g, " ").trim() } : {}),
        groups: groupTags.map((grp, gIdx) => {
          const grpTitle = requireAttr(
            grp.attrs,
            "title",
            `Scene ${sceneId} <ReferenceSheet><Group #${gIdx + 1}>`,
          );
          const items = parseMarkdownBulletLines(grp.body).map((line, iIdx) => {
            const [leftAndMeaning, pitfall] = line.split("||").map((s) => s.trim());
            const sepIdx = (leftAndMeaning ?? "").indexOf("::");
            if (sepIdx < 1) {
              throw new Error(
                `MDX Scene ${sceneId} <ReferenceSheet><Group "${grpTitle}"> item #${iIdx + 1}: expected "**Term** :: Meaning || Optional pitfall".`,
              );
            }
            const term = leftAndMeaning!.slice(0, sepIdx).replace(/\*\*/g, "").trim();
            const meaning = leftAndMeaning!.slice(sepIdx + 2).trim();
            return {
              term,
              meaning,
              ...(pitfall ? { pitfall } : {}),
            };
          });
          return { title: grpTitle, items };
        }),
      });
    }

    lastIndex = tag.endIndex;
  }

  const tail = rawBody.slice(lastIndex).trim();
  if (tail) {
    blocks.push(...parseMarkdownFlow(tail, sceneId));
  }

  return blocks.map((block) => CourseEditorialBlockSchema.parse(block));
}

function parseSlideTag(
  sceneId: string,
  slideTag: { attrs: Record<string, string>; body: string },
): SlideVisualSpec {
  const layout = requireAttr(slideTag.attrs, "layout", `Scene ${sceneId} <Slide>`);
  const parsed = parseYaml(slideTag.body);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`MDX Scene ${sceneId} <Slide>: body must be a valid YAML mapping.`);
  }
  return SlideVisualSpecSchema.parse({
    layout,
    ...parsed,
  });
}

export function compileMdxCourse(input: {
  metaYaml: string;
  courseMdx: string;
  exercisesYaml: string;
}): CompiledCourseArtifacts {
  const meta = CourseMetaYamlSchema.parse(parseYaml(input.metaYaml));
  const exercisesDoc = CourseExercisesYamlSchema.parse(parseYaml(input.exercisesYaml));

  const misconceptionTagsByExercise: Record<string, Record<string, string>> = {};
  const cleanExercises: ExerciseDefinition[] = exercisesDoc.exercises.map((rawEx) => {
    const { misconceptionTags, ...rest } = rawEx;
    if (misconceptionTags) {
      misconceptionTagsByExercise[rest.id] = misconceptionTags;
    }
    return ExerciseDefinitionSchema.parse(rest);
  });

  const practiceExerciseIds = cleanExercises
    .filter((ex) => ex.id !== exercisesDoc.predictionExerciseId)
    .map((ex) => ex.id);

  const partTags = extractTaggedBlocks(input.courseMdx, "Part");
  if (partTags.length === 0) {
    throw new Error("MDX course must define at least one <Part>...</Part>.");
  }

  const courseParts: CoursePart[] = [];
  const audioChapters: CourseAudioScripts["chapters"] = {};

  for (const partTag of partTags) {
    const partId = requireAttr(partTag.attrs, "id", "<Part>");
    const partNumber = Number(requireAttr(partTag.attrs, "number", `<Part ${partId}>`));
    const partTitle = requireAttr(partTag.attrs, "title", `<Part ${partId}>`);
    const quizTitle = requireAttr(partTag.attrs, "quizTitle", `<Part ${partId}>`);

    const summaryTag = extractSingleTag(partTag.body, "PartSummary");
    const quizIntroTag = extractSingleTag(partTag.body, "QuizIntro");
    if (!summaryTag || !quizIntroTag) {
      throw new Error(`MDX <Part ${partId}>: requires <PartSummary> and <QuizIntro>.`);
    }

    const chapterTags = extractTaggedBlocks(partTag.body, "Chapter");
    if (chapterTags.length === 0) {
      throw new Error(`MDX <Part ${partId}>: requires at least one <Chapter>.`);
    }

    const compiledChapters: CoursePartChapter[] = [];

    for (const chTag of chapterTags) {
      const chId = requireAttr(chTag.attrs, "id", `<Chapter>`);
      const chNumber = Number(requireAttr(chTag.attrs, "number", `<Chapter ${chId}>`));
      const chTitle = requireAttr(chTag.attrs, "title", `<Chapter ${chId}>`);
      const chSubtitle = requireAttr(chTag.attrs, "subtitle", `<Chapter ${chId}>`);
      const chMinutes = Number(requireAttr(chTag.attrs, "estimatedMinutes", `<Chapter ${chId}>`));

      const sceneTags = extractTaggedBlocks(chTag.body, "Scene");
      if (sceneTags.length === 0) {
        throw new Error(`MDX <Chapter ${chId}>: requires at least one <Scene>.`);
      }

      const scenes: CourseScene[] = [];
      const cues: CourseAudioScriptCue[] = [];
      const flattenedBlocks: CourseEditorialBlock[] = [];

      for (const scTag of sceneTags) {
        const sceneId = requireAttr(scTag.attrs, "id", `<Chapter ${chId}><Scene>`);
        const sceneTitle = requireAttr(scTag.attrs, "title", `<Scene ${sceneId}>`);
        const pauseForAction = parseBoolAttr(scTag.attrs.pauseForAction);
        const sceneStyleAttr = scTag.attrs.style?.trim();

        const focusTag = extractSingleTag(scTag.body, "Focus");
        const focusPoints = focusTag ? parseMarkdownBulletLines(focusTag.body) : undefined;

        const slideTag = extractSingleTag(scTag.body, "Slide");
        const slide = slideTag ? parseSlideTag(sceneId, slideTag) : undefined;

        const audioTag = extractSingleTag(scTag.body, "AudioScript");
        if (!audioTag || !audioTag.body.trim()) {
          throw new Error(
            `MDX <Scene ${sceneId}>: missing required <AudioScript>...</AudioScript> (every scene must carry its mentor narration).`,
          );
        }

        const audioStyle = audioTag.attrs.style?.trim() || sceneStyleAttr;
        const spokenText = audioTag.body.replace(/\s*\r?\n\s*/g, " ").trim();

        const visualBody = stripTags(scTag.body, ["Focus", "Slide", "AudioScript"]);
        const sceneBlocks = parseSceneBody(sceneId, visualBody);
        if (sceneBlocks.length === 0) {
          throw new Error(
            `MDX <Scene ${sceneId}>: must contain at least one visual/editorial block.`,
          );
        }

        scenes.push({
          id: sceneId,
          title: sceneTitle,
          ...(focusPoints && focusPoints.length > 0 ? { focusPoints } : {}),
          ...(pauseForAction !== undefined ? { pauseForAction } : {}),
          ...(audioStyle ? { audioStyle } : {}),
          ...(slide ? { slide } : {}),
          blocks: sceneBlocks,
        });

        flattenedBlocks.push(...sceneBlocks);

        cues.push({
          id: `${sceneId}-cue`,
          title: sceneTitle,
          blockId: sceneId,
          spokenText,
          ...(audioStyle ? { style: audioStyle } : {}),
          ...(pauseForAction !== undefined ? { pauseForAction } : {}),
          ...(focusPoints && focusPoints.length > 0 ? { focusPoints } : {}),
        });
      }

      compiledChapters.push({
        id: chId,
        number: chNumber,
        title: chTitle,
        subtitle: chSubtitle,
        estimatedMinutes: chMinutes,
        blocks: flattenedBlocks,
        scenes,
      });

      audioChapters[chId] = {
        title: chTitle,
        voiceName: meta.audio.voiceName,
        style: meta.audio.defaultStyle,
        cues,
      };
    }

    courseParts.push({
      id: partId,
      number: partNumber,
      title: partTitle,
      summary: summaryTag.body.replace(/\s*\r?\n\s*/g, " ").trim(),
      chapters: compiledChapters,
      quizTitle,
      quizIntro: quizIntroTag.body.replace(/\s*\r?\n\s*/g, " ").trim(),
    });
  }

  const canonicalChapter: CourseChapter = {
    ...meta.canonicalChapter,
    predictionExerciseId: exercisesDoc.predictionExerciseId,
    practiceExerciseIds,
    resourceIds: meta.resourceIds,
    conceptIds: [meta.conceptId],
    microLessonIds: meta.microLessonIds,
  };

  const lesson = LessonManifestSchema.parse({
    version: "1.0",
    contentRevision: meta.contentRevision,
    id: meta.id,
    slug: meta.slug,
    title: meta.title,
    conceptId: meta.conceptId,
    estimatedMinutes: meta.estimatedMinutes,
    medium: meta.medium,
    mediumJustification: meta.mediumJustification,
    status: meta.status,
    ...(meta.review ? { review: meta.review } : {}),
    steps: [meta.canonicalStep],
    exercises: cleanExercises,
    assessments: exercisesDoc.assessments,
    externalLabs: meta.externalLabs,
    resourceIds: meta.resourceIds,
  });

  const page = CoursePageSchema.parse({
    schemaVersion: "1.0",
    lessonId: meta.id,
    unitId: meta.unitId,
    audience: meta.audience,
    levelLabel: meta.levelLabel,
    introduction: meta.introduction,
    overviewNarrative: meta.overviewNarrative,
    learningObjectives: meta.learningObjectives,
    prerequisites: meta.prerequisites,
    chapters: [canonicalChapter],
    courseParts,
    finalTakeaway: meta.finalTakeaway,
  });

  const audioScripts = CourseAudioScriptsSchema.parse({
    version: "2.0",
    slug: meta.slug,
    recommendedModel: meta.audio.model,
    voiceName: meta.audio.voiceName,
    persona: meta.audio.persona,
    defaultStyle: meta.audio.defaultStyle,
    chapters: audioChapters,
  });

  return {
    lesson,
    page,
    audioScripts,
    meta,
    misconceptionTagsByExercise,
  };
}
