import { createHash } from "node:crypto";
import type {
  V4CoverageState,
  V4Exam,
  V4ImportedCurriculum,
  V4MicroLesson,
  V4ModuleSummary,
  V4ProductionState,
  V4ProposedDependency,
  V4ResourceLink,
} from "@cyber-school/lesson-runtime";
import { V4ImportedCurriculumSchema } from "@cyber-school/lesson-runtime";

export const V4_SOURCE_FILENAME =
  "Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md";

interface DomainDescriptor {
  id: string;
  title: string;
}

const DOMAIN_MAP: Record<string, DomainDescriptor> = {
  TC: {
    id: "v4-tronc-commun",
    title: "Tronc commun — Fondations scientifiques, systèmes & sécurité",
  },
  A: {
    id: "v4-branche-a",
    title: "Branche A — Sécurité applicative, plateformes, Fintech & IA",
  },
  B: {
    id: "v4-branche-b",
    title: "Branche B — Infrastructure, Offensive avancée & Recherche",
  },
  C: {
    id: "v4-branche-c",
    title: "Branche C — OSINT, Fraudes, Forensics & Protection",
  },
  D: {
    id: "v4-branche-d",
    title: "Branche D — Pratique professionnelle, Gouvernance & Qualité",
  },
  X: {
    id: "v4-approfondissements",
    title: "Modules X — Approfondissements transversaux",
  },
};

const PROPOSED_MODULE_ANCHORS: Record<string, V4ProposedDependency[]> = {
  "TC-01": [
    {
      targetId: "TC-00",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-00 -> TC-01).",
      status: "proposed",
    },
  ],
  "TC-02": [
    {
      targetId: "TC-01",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-01 -> TC-02).",
      status: "proposed",
    },
  ],
  "TC-03": [
    {
      targetId: "TC-02",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-02 -> TC-03).",
      status: "proposed",
    },
  ],
  "TC-04": [
    {
      targetId: "TC-03",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-03 -> TC-04).",
      status: "proposed",
    },
  ],
  "TC-05": [
    {
      targetId: "TC-04",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-04 -> TC-05).",
      status: "proposed",
    },
  ],
  "TC-06": [
    {
      targetId: "TC-05",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-05 -> TC-06).",
      status: "proposed",
    },
  ],
  "TC-07": [
    {
      targetId: "TC-06",
      targetKind: "module",
      rationale: "Ordre obligatoire du socle en Partie IX (TC-06 -> TC-07).",
      status: "proposed",
    },
  ],
  "X-01": [
    {
      targetId: "TC-00",
      targetKind: "module",
      rationale: "Approfondissement de la pédagogie scientifique introduite en TC-00.",
      status: "proposed",
    },
  ],
  "X-02": [
    {
      targetId: "A-01",
      targetKind: "module",
      rationale:
        "Rapprochement thématique proposé : méthodes de test Web/API/mobile et audit applicatif.",
      status: "proposed",
    },
  ],
  "X-03": [
    {
      targetId: "A-01",
      targetKind: "module",
      rationale:
        "Rapprochement thématique proposé : chaînes d’impact, préconditions et validation des constats d’audit.",
      status: "proposed",
    },
  ],
  "X-04": [
    {
      targetId: "A-01",
      targetKind: "module",
      rationale:
        "Rapprochement thématique proposé : navigateur, authentification, sessions et identités Web modernes.",
      status: "proposed",
    },
  ],
  "X-05": [
    {
      targetId: "A-05",
      targetKind: "module",
      rationale:
        "Rapprochement thématique proposé : AppSec, Cloud, CI/CD et chaîne d’approvisionnement logicielle.",
      status: "proposed",
    },
  ],
  "X-06": [
    {
      targetId: "A-08",
      targetKind: "module",
      rationale: "Sécurité des agents IA et architectures LLM modernes.",
      status: "proposed",
    },
  ],
  "X-07": [
    {
      targetId: "A-03",
      targetKind: "module",
      rationale: "Sécurité avancée mobile, attestations matérielles et anti-fraude.",
      status: "proposed",
    },
  ],
  "X-08": [
    {
      targetId: "C-01",
      targetKind: "module",
      rationale: "Contenus synthétiques, deepfakes et vérification forensique.",
      status: "proposed",
    },
  ],
  "X-09": [
    {
      targetId: "C-12",
      targetKind: "module",
      rationale:
        "Rapprochement thématique proposé : protection des personnes, dossiers et communications d’une équipe d’enquête.",
      status: "proposed",
    },
  ],
  "X-10": [
    {
      targetId: "TC-05",
      targetKind: "module",
      rationale:
        "Rapprochement thématique proposé : spécification, tests et revue critique du code produit par IA.",
      status: "proposed",
    },
  ],
};

function getDomainForModule(moduleId: string): DomainDescriptor {
  const prefix = moduleId.split("-")[0] ?? "TC";
  return (
    DOMAIN_MAP[prefix] ?? {
      id: "v4-autre",
      title: `Domaine ${prefix}`,
    }
  );
}

function normalizeTitle(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").replace(/\.$/, "");
}

function extractMarkdownLinks(
  line: string,
  category: "reference" | "external-lab",
): V4ResourceLink[] {
  const links: V4ResourceLink[] = [];
  const regex = /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null = regex.exec(line);
  while (match !== null) {
    const label = match[1]?.trim();
    const url = match[2]?.trim();
    if (label && url) {
      links.push({ label, url, category });
    }
    match = regex.exec(line);
  }
  return links;
}

function expandPrerequisiteString(rawText: string, allModuleIds: Set<string>): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const add = (id: string) => {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  };

  if (/tous les modules\s+A,\s*B,\s*C,\s*D/i.test(rawText)) {
    for (const id of allModuleIds) {
      if (/^[ABCD]-\d+$/.test(id)) add(id);
    }
  }

  const rangeRegex = /\b([A-Z]+)-(\d{2})\s+(?:à|au|-)\s+\1-(\d{2})\b/g;
  let rangeMatch: RegExpExecArray | null = rangeRegex.exec(rawText);
  while (rangeMatch !== null) {
    const prefix = rangeMatch[1]!;
    const start = Number.parseInt(rangeMatch[2]!, 10);
    const end = Number.parseInt(rangeMatch[3]!, 10);
    for (let n = start; n <= end; n += 1) {
      const candidate = `${prefix}-${String(n).padStart(2, "0")}`;
      if (allModuleIds.has(candidate)) add(candidate);
    }
    rangeMatch = rangeRegex.exec(rawText);
  }

  const tokenRegex = /\b((?:TC|EX|[ABCDX])-\d{2})\b/g;
  let tokenMatch: RegExpExecArray | null = tokenRegex.exec(rawText);
  while (tokenMatch !== null) {
    add(tokenMatch[1]!);
    tokenMatch = tokenRegex.exec(rawText);
  }

  return result;
}

interface RawPart1Module {
  id: string;
  title: string;
  moduleOrder: number;
  provenanceLine: number;
  microLessons: Array<{
    id: string;
    title: string;
    subsectionTitle?: string;
    line: number;
    sectionHeading: string;
  }>;
}

interface RawPart2Module {
  id: string;
  provenanceLine: number;
  prereqText: string;
  competencies: Array<{ id: string; title: string; line: number }>;
  resources: V4ResourceLink[];
  books: string[];
  visualizationsHint?: string;
  exercisesHint?: string;
  validationHint?: string;
}

interface RawPart2Exam {
  id: string;
  title: string;
  line: number;
  prereqText: string;
  criteria: string[];
  externalLabs: V4ResourceLink[];
}

export interface V4ImportAnomaly {
  severity: "info" | "warning";
  code: string;
  message: string;
  line?: number;
}

export interface V4ParseResult {
  curriculum: V4ImportedCurriculum;
  anomalies: V4ImportAnomaly[];
}

export interface ParseV4Options {
  preservedDependencies?: Map<string, V4ProposedDependency[]>;
  coverageLookup?: (
    microLessonId: string,
    moduleId: string,
  ) => {
    coverageState: V4CoverageState;
    productionState: V4ProductionState;
    unitId?: string;
    mappedLessonSlugs: string[];
  };
}

export function parseV4CurriculumMarkdown(
  markdownContent: string,
  options: ParseV4Options = {},
): V4ParseResult {
  const normalized = markdownContent.replace(/\r\n/g, "\n");
  const sourceSha256 = createHash("sha256").update(normalized, "utf8").digest("hex");
  const lines = normalized.split("\n");

  let part2StartLineIndex = lines.findIndex((line) =>
    /^#\s+Référentiel complémentaire\b/i.test(line.trim()),
  );
  if (part2StartLineIndex === -1) {
    part2StartLineIndex = lines.length;
  }

  const anomalies: V4ImportAnomaly[] = [];
  const part1Modules: RawPart1Module[] = [];
  let currentP1: RawPart1Module | null = null;
  let currentSubsection: string | undefined;

  for (let i = 0; i < part2StartLineIndex; i += 1) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();
    const lineNo = i + 1;

    if (/^\s*Ce niveau supplémentaire définit \*\*1022 micro-leçons\*\*/i.test(trimmed)) {
      anomalies.push({
        severity: "info",
        code: "PROSE_COUNT_MISMATCH",
        message:
          "La synthèse en ligne 1625 indique 1022 micro-leçons et 53 modules alors que le document en définit 1122 réparties en 54 modules (B-11 et X-01..10 inclus).",
        line: lineNo,
      });
    }

    const modMatch = /^##\s+([A-Z]+-\d{2})\s+[—-]\s+(.+)$/.exec(trimmed);
    if (modMatch) {
      currentP1 = {
        id: modMatch[1]!,
        title: normalizeTitle(modMatch[2]!),
        moduleOrder: part1Modules.length + 1,
        provenanceLine: lineNo,
        microLessons: [],
      };
      part1Modules.push(currentP1);
      currentSubsection = undefined;
      continue;
    }

    if (!currentP1) continue;

    if (trimmed.startsWith("# ") || trimmed === "---") {
      currentSubsection = undefined;
      continue;
    }

    const subMatch = /^###\s+(.+)$/.exec(trimmed);
    if (subMatch) {
      currentSubsection = normalizeTitle(subMatch[1]!);
      continue;
    }

    const microMatch = /^-\s+\*\*([A-Z]+\d+\.\d{3})\*\*\s+[—-]\s+(.+)$/.exec(trimmed);
    if (microMatch) {
      currentP1.microLessons.push({
        id: microMatch[1]!,
        title: normalizeTitle(microMatch[2]!),
        subsectionTitle: currentSubsection,
        line: lineNo,
        sectionHeading: `Module ${currentP1.id} — ${currentP1.title}`,
      });
    }
  }

  const part2Modules = new Map<string, RawPart2Module>();
  const part2Exams: RawPart2Exam[] = [];
  let currentP2Mod: RawPart2Module | null = null;
  let currentP2Exam: RawPart2Exam | null = null;

  for (let i = part2StartLineIndex; i < lines.length; i += 1) {
    const trimmed = (lines[i] ?? "").trim();
    const lineNo = i + 1;

    if (trimmed.startsWith("# ")) {
      currentP2Mod = null;
      currentP2Exam = null;
      continue;
    }

    const examMatch = /^##\s+(EX-\d{2})\s+[—-]\s+(.+)$/.exec(trimmed);
    if (examMatch) {
      currentP2Mod = null;
      currentP2Exam = {
        id: examMatch[1]!,
        title: normalizeTitle(examMatch[2]!),
        line: lineNo,
        prereqText: "",
        criteria: [],
        externalLabs: [],
      };
      part2Exams.push(currentP2Exam);
      continue;
    }

    const modMatch = /^##\s+([A-Z]+-\d{2})\s+[—-]\s+(.+)$/.exec(trimmed);
    if (modMatch) {
      currentP2Exam = null;
      currentP2Mod = {
        id: modMatch[1]!,
        provenanceLine: lineNo,
        prereqText: "",
        competencies: [],
        resources: [],
        books: [],
      };
      part2Modules.set(currentP2Mod.id, currentP2Mod);
      continue;
    }

    if (currentP2Mod) {
      const prereqMatch = /^\*\*(?:Prérequis|Position dans le cursus)\s*:\*\*\s*(.+)$/.exec(
        trimmed,
      );
      if (prereqMatch) {
        currentP2Mod.prereqText += ` ${prereqMatch[1]!}`;
      }
      const compMatch = /^-\s+\*\*([A-Z]+\d+\.\d{2,3})\*\*\s+(.+)$/.exec(trimmed);
      if (compMatch) {
        currentP2Mod.competencies.push({
          id: compMatch[1]!,
          title: normalizeTitle(compMatch[2]!),
          line: lineNo,
        });
      }
      if (/^\*\*Visualisations\s*:\*\*/i.test(trimmed)) {
        currentP2Mod.visualizationsHint = trimmed.replace(/^\*\*Visualisations\s*:\*\*\s*/i, "");
      }
      if (/^\*\*Exercices internes\s*:\*\*/i.test(trimmed)) {
        currentP2Mod.exercisesHint = trimmed.replace(/^\*\*Exercices internes\s*:\*\*\s*/i, "");
      }
      if (/^\*\*Validation\s*:\*\*/i.test(trimmed)) {
        currentP2Mod.validationHint = trimmed.replace(/^\*\*Validation\s*:\*\*\s*/i, "");
      }
      if (/^\*\*Labs externes\b/i.test(trimmed) || /^\*\*Laboratoires externes\b/i.test(trimmed)) {
        currentP2Mod.resources.push(...extractMarkdownLinks(trimmed, "external-lab"));
      } else if (/^\*\*Ressources\b/i.test(trimmed)) {
        currentP2Mod.resources.push(...extractMarkdownLinks(trimmed, "reference"));
      }
      const bookSection = /\*\*Livres\s*:\*\*\s*(.+)$/.exec(trimmed);
      if (bookSection?.[1]) {
        const cleanedBooks = bookSection[1]
          .split(";")
          .map((item) => item.replace(/\*/g, "").replace(/\.$/, "").trim())
          .filter(Boolean);
        currentP2Mod.books.push(...cleanedBooks);
      }
    } else if (currentP2Exam) {
      const prereqMatch = /^\*\*Prérequis\s*:\*\*\s*(.+)$/.exec(trimmed);
      if (prereqMatch) {
        currentP2Exam.prereqText += ` ${prereqMatch[1]!}`;
      }
      const critMatch = /^-\s+\*\*(EX\d{2}\.\d{2})\*\*\s+(.+)$/.exec(trimmed);
      if (critMatch) {
        currentP2Exam.criteria.push(`${critMatch[1]!} — ${normalizeTitle(critMatch[2]!)}`);
      }
      if (/^\*\*(?:Labs externes|Laboratoires externes|Ressources)\b/i.test(trimmed)) {
        currentP2Exam.externalLabs.push(...extractMarkdownLinks(trimmed, "external-lab"));
      }
    }
  }

  const allModuleIds = new Set(part1Modules.map((m) => m.id));
  const seenMicroIds = new Set<string>();
  const modules: V4ModuleSummary[] = [];
  const microLessons: V4MicroLesson[] = [];
  let globalOrder = 0;

  for (const p1 of part1Modules) {
    const domain = getDomainForModule(p1.id);
    const p2 = part2Modules.get(p1.id);

    if (!p2) {
      anomalies.push({
        severity: "info",
        code: "MISSING_PART2_SPEC",
        message: `Module ${p1.id} défini dans la partie 1 sans bloc détaillé en partie 2 (dépendances proposées par défaut).`,
        line: p1.provenanceLine,
      });
    }

    const explicitPrerequisites = p2
      ? expandPrerequisiteString(p2.prereqText, allModuleIds).filter((id) => id !== p1.id)
      : [];

    if (!p2?.prereqText && /^TC-0[1-7]$/.test(p1.id)) {
      anomalies.push({
        severity: "info",
        code: "IMPLICIT_SOCLE_PREREQ",
        message: `Module ${p1.id} sans ligne Prérequis en partie 2 : dépendance proposée selon la Partie IX.`,
        line: p2?.provenanceLine ?? p1.provenanceLine,
      });
    }

    const defaultProposed = PROPOSED_MODULE_ANCHORS[p1.id] ?? [];
    const proposedDependencies = options.preservedDependencies?.get(p1.id) ?? defaultProposed;

    const moduleResources = p2?.resources ?? [];
    const moduleCompetencies = p2?.competencies ?? [];

    modules.push({
      id: p1.id,
      title: p1.title,
      domainId: domain.id,
      domainTitle: domain.title,
      moduleOrder: p1.moduleOrder,
      microLessonIds: p1.microLessons.map((m) => m.id),
      competencies: moduleCompetencies,
      explicitPrerequisites,
      proposedDependencies,
      resources: moduleResources,
      books: p2?.books ?? [],
      visualizationsHint: p2?.visualizationsHint,
      exercisesHint: p2?.exercisesHint,
      validationHint: p2?.validationHint,
      hasPart2Spec: Boolean(p2),
      provenancePart1Line: p1.provenanceLine,
      provenancePart2Line: p2?.provenanceLine,
    });

    const totalMicroInMod = p1.microLessons.length;
    p1.microLessons.forEach((micro, index) => {
      if (seenMicroIds.has(micro.id)) {
        anomalies.push({
          severity: "warning",
          code: "DUPLICATE_MICRO_ID",
          message: `Identifiant micro-leçon dupliqué : ${micro.id}`,
          line: micro.line,
        });
      }
      seenMicroIds.add(micro.id);
      globalOrder += 1;

      const linkedCompetencyIds: string[] = [];
      if (moduleCompetencies.length > 0 && totalMicroInMod > 0) {
        const compIdx = Math.min(
          moduleCompetencies.length - 1,
          Math.floor((index * moduleCompetencies.length) / totalMicroInMod),
        );
        const comp = moduleCompetencies[compIdx];
        if (comp) linkedCompetencyIds.push(comp.id);
      }

      const cov = options.coverageLookup?.(micro.id, p1.id) ?? {
        coverageState: "uncovered" as const,
        productionState: "a_planifier" as const,
        mappedLessonSlugs: [],
      };

      microLessons.push({
        id: micro.id,
        domainId: domain.id,
        domainTitle: domain.title,
        moduleId: p1.id,
        moduleTitle: p1.title,
        ...(micro.subsectionTitle ? { subsectionTitle: micro.subsectionTitle } : {}),
        title: micro.title,
        position: {
          moduleOrder: p1.moduleOrder,
          microOrder: index + 1,
          globalOrder,
        },
        sourceProvenance: {
          file: V4_SOURCE_FILENAME,
          lineStart: micro.line,
          lineEnd: micro.line,
          sectionHeading: micro.sectionHeading,
        },
        learningObjectives: [
          `Expliquer et vérifier sur un cas inédit : ${micro.title}`,
          "Valider compréhension, prédiction d'état et contre-exemple sans recopie.",
        ],
        explicitPrerequisites,
        proposedDependencies,
        linkedCompetencyIds,
        associatedResources: moduleResources,
        coverageState: cov.coverageState,
        productionState: cov.productionState,
        ...(cov.unitId ? { unitId: cov.unitId } : {}),
        mappedLessonSlugs: cov.mappedLessonSlugs,
      });
    });
  }

  const exams: V4Exam[] = part2Exams.map((exam) => {
    const explicitPrerequisites = expandPrerequisiteString(exam.prereqText, allModuleIds);
    if (exam.id === "EX-04" && !explicitPrerequisites.includes("B-11")) {
      anomalies.push({
        severity: "info",
        code: "EX04_OMITS_B11",
        message: "EX-04 cite B-01 à B-10 dans le source V4 sans mentionner explicitement B-11.",
        line: exam.line,
      });
    }
    return {
      id: exam.id,
      title: exam.title,
      explicitPrerequisites,
      criteria: exam.criteria,
      externalLabs: exam.externalLabs,
      line: exam.line,
    };
  });

  const competencyCount = modules.reduce((sum, mod) => sum + mod.competencies.length, 0);

  const curriculum = V4ImportedCurriculumSchema.parse({
    schemaVersion: "1.0",
    sourceFile: V4_SOURCE_FILENAME,
    sourceSha256,
    stats: {
      moduleCount: modules.length,
      microLessonCount: microLessons.length,
      competencyCount,
      examCount: exams.length,
    },
    modules,
    microLessons,
    exams,
  });

  return { curriculum, anomalies };
}
