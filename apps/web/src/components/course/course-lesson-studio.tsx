"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileCheck2,
  Headphones,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Terminal,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import type {
  CourseChapter,
  CourseEditorialBlock,
  CoursePage,
  CoursePart,
  CoursePartChapter,
  CourseScene,
  LessonManifest,
  ResourceMetadata,
} from "@cyber-school/lesson-runtime";
import { Badge, Button, EditorialCallout, cn } from "@cyber-school/ui";
import { CourseExperienceRenderer } from "@/components/course-experiences/registry";
import { CourseSyncedAudioBar, type StudyMode } from "./course-synced-audio-bar";
import { MicroCheckCard, ReferenceSheetCard, WorkedExampleCard } from "./course-editorial-blocks";
import { GuidedListeningStage } from "./guided-listening-stage";
import { useCourseAudio } from "./use-course-audio";
import {
  SignalAutopsyDiagram,
  SensorBoundaryDiagram,
  RefutationFunnelDiagram,
  MedicolegalTriptychDiagram,
} from "./interactive-diagrams";
import type { LessonAudioTrack, LessonAudioManifest } from "@/lib/course/course-audio";

interface InteractiveDiagramProps {
  activeCueId?: string;
  activeCueIndex?: number;
  isPlaying?: boolean;
}

const DIAGRAM_REGISTRY: Record<string, React.ComponentType<InteractiveDiagramProps>> = {
  "token-inspector": SignalAutopsyDiagram,
  "signal-autopsy": SignalAutopsyDiagram,
  "packet-boundary": SensorBoundaryDiagram,
  "causes-to-log": SensorBoundaryDiagram,
  "sensor-boundary": SensorBoundaryDiagram,
  "refutation-funnel": RefutationFunnelDiagram,
  "medicolegal-triptych": MedicolegalTriptychDiagram,
  "triptych-report": MedicolegalTriptychDiagram,
};

export interface CourseLessonStudioProps {
  lesson: LessonManifest;
  page: CoursePage;
  linkedResources: ResourceMetadata[];
  audioManifest?: LessonAudioManifest | null;
}

type ReaderTarget = "overview" | "all" | "quiz" | string;

function getChapterScenes(chapter: CoursePartChapter): CourseScene[] {
  if (chapter.scenes && chapter.scenes.length > 0) {
    return chapter.scenes;
  }
  return chapter.blocks.map((block, idx) => ({
    id: `${chapter.id}-sec-${idx + 1}`,
    title: block.type === "heading" ? block.text : `${chapter.title} · Section ${idx + 1}`,
    blocks: [block],
  }));
}

interface StoredCourseProgress {
  results: Record<string, boolean | null>;
  quizSelections?: Record<string, string>;
  quizOrders?: Record<string, string[]>;
  completedChapterIds: string[];
  transferNotes: string;
  lastTarget?: ReaderTarget;
  isQuizSubmitted?: boolean;
}

function safeReadStorage(key: string): StoredCourseProgress | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCourseProgress>;
    return {
      results: parsed.results && typeof parsed.results === "object" ? parsed.results : {},
      quizSelections:
        parsed.quizSelections && typeof parsed.quizSelections === "object"
          ? parsed.quizSelections
          : {},
      quizOrders:
        parsed.quizOrders && typeof parsed.quizOrders === "object" ? parsed.quizOrders : {},
      completedChapterIds: Array.isArray(parsed.completedChapterIds)
        ? parsed.completedChapterIds.filter((id): id is string => typeof id === "string")
        : [],
      transferNotes: typeof parsed.transferNotes === "string" ? parsed.transferNotes : "",
      lastTarget: typeof parsed.lastTarget === "string" ? parsed.lastTarget : undefined,
      isQuizSubmitted: Boolean(parsed.isQuizSubmitted),
    };
  } catch {
    return null;
  }
}

function safeWriteStorage(key: string, value: StoredCourseProgress): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely renders inline emphasis (**bold**, `code`, *italic*, [link](url)) as React elements
 * without raw HTML injection, supporting inline code inside bold/italic spans and secure external links.
 */
function renderRichInline(text: string, depth = 0): React.ReactNode[] {
  if (depth > 3) {
    return [<React.Fragment key={0}>{text}</React.Fragment>];
  }
  const tokens = text.split(
    /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|`[^`]+`|\*\*[\s\S]+?\*\*|\*[^*\n]+?\*)/g,
  );
  return tokens.map((part, idx) => {
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const closeBracket = part.indexOf("](");
      const label = part.slice(1, closeBracket);
      const href = part.slice(closeBracket + 2, -1);
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-[#c8ed97] underline decoration-[#c8ed97]/40 underline-offset-2 hover:decoration-[#c8ed97]"
        >
          <span>{label}</span>
          <ExternalLink className="inline h-3 w-3 shrink-0" aria-hidden="true" />
        </a>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="rounded-md border border-[#2c382f] bg-[#1a221d] px-1.5 py-0.5 font-mono text-[0.86em] text-[#c8ed97]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#f5f7f0]">
          {renderRichInline(part.slice(2, -2), depth + 1)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#eff4ec]">
          {renderRichInline(part.slice(1, -1), depth + 1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function CourseEditorialBanner({ variant }: { variant: "welcome" | "practice" }) {
  if (variant === "welcome") {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-[#263229] bg-[#131815]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 760 210" className="h-auto w-full">
          <defs>
            <linearGradient id="ocBannerBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#162119" />
              <stop offset="55%" stopColor="#13191e" />
              <stop offset="100%" stopColor="#1a1f16" />
            </linearGradient>
          </defs>
          <rect width="760" height="210" fill="url(#ocBannerBg)" />
          <g opacity="0.18" stroke="#c8ed97" strokeWidth="1">
            <line x1="0" y1="52" x2="760" y2="52" />
            <line x1="0" y1="105" x2="760" y2="105" />
            <line x1="0" y1="158" x2="760" y2="158" />
            <line x1="150" y1="0" x2="150" y2="210" />
            <line x1="380" y1="0" x2="380" y2="210" />
            <line x1="610" y1="0" x2="610" y2="210" />
          </g>
          {/* Left log terminal */}
          <rect
            x="48"
            y="38"
            width="230"
            height="134"
            rx="14"
            fill="#0d110f"
            stroke="#324236"
            strokeWidth="1.5"
          />
          <circle cx="70" cy="56" r="4" fill="#ea6d82" />
          <circle cx="84" cy="56" r="4" fill="#f3a34a" />
          <circle cx="98" cy="56" r="4" fill="#c8ed97" />
          <rect x="66" y="76" width="160" height="10" rx="5" fill="#29382b" />
          <rect x="66" y="96" width="190" height="10" rx="5" fill="#68b8ea" opacity="0.45" />
          <rect x="66" y="116" width="142" height="10" rx="5" fill="#c8ed97" opacity="0.65" />
          <rect x="66" y="136" width="170" height="10" rx="5" fill="#29382b" />
          {/* Connecting flow */}
          <path
            d="M278 105 C325 105, 325 72, 368 72"
            fill="none"
            stroke="#68b8ea"
            strokeWidth="2.5"
            strokeDasharray="6 5"
          />
          <path
            d="M278 105 C325 105, 325 138, 368 138"
            fill="none"
            stroke="#c8ed97"
            strokeWidth="2.5"
          />
          {/* Right verification pill + funnel */}
          <rect
            x="368"
            y="42"
            width="168"
            height="58"
            rx="12"
            fill="#14202b"
            stroke="#68b8ea"
            strokeWidth="1.5"
          />
          <text x="386" y="67" fill="#68b8ea" fontSize="11" fontWeight="700" fontFamily="monospace">
            SOURCE BRUTE
          </text>
          <text x="386" y="86" fill="#e7ede5" fontSize="12" fontWeight="600">
            5 champs mesurés
          </text>
          <rect
            x="368"
            y="112"
            width="168"
            height="58"
            rx="12"
            fill="#1a2417"
            stroke="#c8ed97"
            strokeWidth="1.5"
          />
          <text
            x="386"
            y="137"
            fill="#c8ed97"
            fontSize="11"
            fontWeight="700"
            fontFamily="monospace"
          >
            RECOUPEMENT
          </text>
          <text x="386" y="156" fill="#f5f7f0" fontSize="12" fontWeight="600">
            3 → 2 → 1 piste
          </text>
          {/* Inspector lens on right */}
          <circle cx="638" cy="98" r="48" fill="#151f18" stroke="#c8ed97" strokeWidth="3" />
          <circle cx="638" cy="98" r="28" fill="none" stroke="#68b8ea" strokeWidth="2" />
          <path
            d="M624 98 l10 10 l18 -20"
            fill="none"
            stroke="#c8ed97"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="673"
            y1="133"
            x2="704"
            y2="164"
            stroke="#c8ed97"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#2a382c] bg-gradient-to-r from-[#192418] via-[#152028] to-[#1a2117] px-5 py-4"
      aria-hidden="true"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c8ed97] text-[#101312]">
          <Terminal className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <span className="block font-mono text-[11px] font-semibold tracking-wider text-[#c8ed97]">
            ATELIER DE MISE EN PRATIQUE
          </span>
          <span className="block text-sm font-medium text-[#dbe5db]">
            Passez de l&apos;observation à l&apos;expérimentation guidée
          </span>
        </div>
      </div>
      <svg viewBox="0 0 120 44" className="hidden h-11 w-[120px] shrink-0 sm:block">
        <rect
          x="4"
          y="6"
          width="32"
          height="32"
          rx="8"
          fill="#101312"
          stroke="#68b8ea"
          strokeWidth="1.5"
        />
        <rect x="12" y="16" width="16" height="4" rx="2" fill="#68b8ea" />
        <rect x="12" y="24" width="11" height="4" rx="2" fill="#c8ed97" />
        <path d="M40 22 H74" stroke="#68b8ea" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="94" cy="22" r="15" fill="#101312" stroke="#c8ed97" strokeWidth="1.5" />
        <path
          d="M88 22 l4 4 l8 -8"
          fill="none"
          stroke="#c8ed97"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function CourseLessonStudio({
  lesson,
  page,
  linkedResources,
  audioManifest = null,
}: CourseLessonStudioProps) {
  const storageKey = `cyber-school:course-progress:${lesson.slug}`;
  const baseChapter: CourseChapter = page.chapters[0]!;

  const parts: CoursePart[] = React.useMemo(() => {
    if (page.courseParts && page.courseParts.length > 0) {
      return page.courseParts;
    }
    return [
      {
        id: "part-1-default",
        number: 1,
        title: baseChapter.title,
        summary: page.introduction,
        quizTitle: "Quiz : Validez vos acquis",
        quizIntro: "Vérifiez votre compréhension avec les exercices du cours.",
        chapters: [
          {
            id: baseChapter.id,
            number: 1,
            title: baseChapter.title,
            subtitle: `${baseChapter.estimatedMinutes} min`,
            estimatedMinutes: baseChapter.estimatedMinutes,
            blocks: [
              { type: "prose", paragraphs: [baseChapter.question, ...baseChapter.explanation] },
              {
                type: "practice",
                title: "À vous de jouer",
                context: baseChapter.experience.instruction,
                instructions: [baseChapter.experience.observe],
                experienceId: baseChapter.experience.componentId,
                exerciseIds: [baseChapter.predictionExerciseId, ...baseChapter.practiceExerciseIds],
                showTransferPad: true,
              },
              {
                type: "summary",
                points: [baseChapter.takeaway],
                transition: page.finalTakeaway,
              },
            ],
          },
        ],
      },
    ];
  }, [baseChapter, page]);

  const flatChapters = React.useMemo(
    () => parts.flatMap((part) => part.chapters.map((ch) => ({ part, chapter: ch }))),
    [parts],
  );

  const assessment = lesson.assessments?.[0];
  const totalExercises = lesson.exercises.length;
  const passingPercent = assessment?.passingScorePercent ?? 70;

  const [activeTarget, setActiveTarget] = React.useState<ReaderTarget>("overview");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [results, setResults] = React.useState<Record<string, boolean | null>>({});
  const [quizSelections, setQuizSelections] = React.useState<Record<string, string>>({});
  const [quizOrders, setQuizOrders] = React.useState<Record<string, string[]>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = React.useState(false);
  const [completedChapterIds, setCompletedChapterIds] = React.useState<string[]>([]);
  const [transferNotes, setTransferNotes] = React.useState("");
  const [storageAvailable, setStorageAvailable] = React.useState(true);
  const [focusRequest, setFocusRequest] = React.useState<{ id: string; seq: number } | null>(null);

  // Synchronized mentor voiceover & bimodal study state (single lifted audio controller)
  const [studyMode, setStudyMode] = React.useState<StudyMode>("reading");
  const [audioSyncEnabled, setAudioSyncEnabled] = React.useState(true);
  const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(false);

  const currentChapterId = React.useMemo(() => {
    if (activeTarget === "quiz" || activeTarget === "overview") return null;
    if (activeTarget === "all") return flatChapters[0]?.chapter.id ?? null;
    return activeTarget;
  }, [activeTarget, flatChapters]);

  const currentChapterAudioTrack: LessonAudioTrack | null = React.useMemo(() => {
    if (!currentChapterId) return null;
    return audioManifest?.chapters?.[currentChapterId] ?? null;
  }, [audioManifest, currentChapterId]);

  const scrollToTargetElement = React.useCallback(
    (targetId: string, transcriptState?: boolean) => {
      const el = document.getElementById(targetId);
      if (!el) return;

      const effectiveTranscriptOpen = transcriptState ?? isTranscriptOpen;
      const headerOffset = 90;
      const bottomDockHeight = effectiveTranscriptOpen ? 280 : 120;
      const viewportHeight = window.innerHeight;
      const availableHeight = Math.max(160, viewportHeight - headerOffset - bottomDockHeight);

      const rect = el.getBoundingClientRect();
      const elHeight = rect.height;

      let targetY: number;
      if (elHeight <= availableHeight) {
        const verticalMargin = Math.max(16, (availableHeight - elHeight) / 2);
        targetY = window.scrollY + rect.top - headerOffset - verticalMargin;
      } else {
        targetY = window.scrollY + rect.top - headerOffset - 16;
      }

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      window.scrollTo({
        top: Math.max(0, Math.round(targetY)),
        behavior: prefersReducedMotion ? "instant" : "smooth",
      });
    },
    [isTranscriptOpen],
  );

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const audio = useCourseAudio(currentChapterAudioTrack, audioRef, {
    onCueChange: (cue) => {
      if (studyMode === "reading" && audioSyncEnabled) {
        scrollToTargetElement(cue.blockId);
      }
    },
  });

  const activeAudioBlockId =
    audio.currentWindow?.cue.blockId ?? currentChapterAudioTrack?.cues[0]?.blockId ?? null;

  const enterStudyMode = React.useCallback(
    (nextMode: StudyMode) => {
      setStudyMode(nextMode);
      if (nextMode === "listening") {
        setSidebarOpen(false);
        if (activeTarget === "all" && currentChapterId) {
          setActiveTarget(currentChapterId);
        }
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "instant" });
          });
        }
      } else if (activeAudioBlockId) {
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            scrollToTargetElement(activeAudioBlockId);
          });
        }
      }
    },
    [activeAudioBlockId, activeTarget, currentChapterId, scrollToTargetElement],
  );

  const handleToggleTranscript = React.useCallback(() => {
    setIsTranscriptOpen((prev) => {
      const next = !prev;
      if (studyMode === "reading" && audioSyncEnabled && activeAudioBlockId) {
        window.setTimeout(() => {
          scrollToTargetElement(activeAudioBlockId, next);
        }, 120);
      }
      return next;
    });
  }, [activeAudioBlockId, audioSyncEnabled, scrollToTargetElement, studyMode]);

  React.useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      const saved = safeReadStorage(storageKey);
      if (saved) {
        setResults(saved.results);
        if (saved.quizSelections) {
          setQuizSelections(saved.quizSelections);
        }
        if (saved.quizOrders && Object.keys(saved.quizOrders).length > 0) {
          setQuizOrders((prev) => ({ ...prev, ...saved.quizOrders }));
        }
        if (saved.isQuizSubmitted) {
          setIsQuizSubmitted(true);
        }
        setCompletedChapterIds(saved.completedChapterIds);
        setTransferNotes(saved.transferNotes);
        if (saved.lastTarget) {
          setActiveTarget(saved.lastTarget);
        }
      }
      try {
        const testKey = `${storageKey}:probe`;
        window.localStorage.setItem(testKey, "1");
        window.localStorage.removeItem(testKey);
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [storageKey]);

  React.useEffect(() => {
    if (!focusRequest) return;
    const target = document.getElementById(focusRequest.id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [focusRequest]);

  function persistState(next: Partial<StoredCourseProgress>) {
    safeWriteStorage(storageKey, {
      results: next.results ?? results,
      quizSelections: next.quizSelections ?? quizSelections,
      quizOrders: next.quizOrders ?? quizOrders,
      completedChapterIds: next.completedChapterIds ?? completedChapterIds,
      transferNotes: next.transferNotes ?? transferNotes,
      lastTarget: next.lastTarget ?? activeTarget,
      isQuizSubmitted: next.isQuizSubmitted ?? isQuizSubmitted,
    });
  }

  function navigateToTarget(target: ReaderTarget, focusId?: string) {
    setActiveTarget(target);
    audio.resetTrack();
    setIsTranscriptOpen(false);
    persistState({ lastTarget: target });
    const resolvedFocusId =
      focusId ??
      (target === "overview"
        ? "course-main-heading"
        : target === "quiz"
          ? "quiz-main-heading"
          : target === "all"
            ? `${flatChapters[0]?.chapter.id ?? "reader"}-heading`
            : `${target}-heading`);
    setFocusRequest((prev) => ({ id: resolvedFocusId, seq: (prev?.seq ?? 0) + 1 }));
  }

  function evaluateQuestion(
    exerciseId: string,
    selectionsMap = quizSelections,
    ordersMap = quizOrders,
  ): boolean | null {
    const ex = lesson.exercises.find((item) => item.id === exerciseId);
    if (!ex) return null;
    if (ex.kind === "multiple-choice" || ex.kind === "state-prediction") {
      const picked = selectionsMap[ex.id];
      if (!picked) return null;
      return picked === ex.correctOptionId;
    }
    if (ex.kind === "sequence-order") {
      const order = ordersMap[ex.id];
      if (!order) return null;
      return (
        order.length === ex.expectedOrder.length &&
        order.every((id, idx) => id === ex.expectedOrder[idx])
      );
    }
    return null;
  }

  function handleSelectQuizOption(exerciseId: string, optionId: string) {
    const nextSelections = { ...quizSelections, [exerciseId]: optionId };
    setQuizSelections(nextSelections);
    if (isQuizSubmitted) {
      setIsQuizSubmitted(false);
      setResults({});
      persistState({ quizSelections: nextSelections, isQuizSubmitted: false, results: {} });
    } else {
      persistState({ quizSelections: nextSelections });
    }
  }

  function handleMoveSequenceItem(exerciseId: string, fromIndex: number, direction: -1 | 1) {
    const ex = lesson.exercises.find((item) => item.id === exerciseId);
    if (!ex || ex.kind !== "sequence-order") return;
    const currentOrder = [...(quizOrders[exerciseId] ?? ex.items.map((item) => item.id))];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= currentOrder.length) return;
    const current = currentOrder[fromIndex];
    const target = currentOrder[toIndex];
    if (!current || !target) return;
    currentOrder[fromIndex] = target;
    currentOrder[toIndex] = current;
    const nextOrders = { ...quizOrders, [exerciseId]: currentOrder };
    setQuizOrders(nextOrders);
    if (isQuizSubmitted) {
      setIsQuizSubmitted(false);
      setResults({});
      persistState({ quizOrders: nextOrders, isQuizSubmitted: false, results: {} });
    } else {
      persistState({ quizOrders: nextOrders });
    }
  }

  function handleValidateAllQuiz() {
    const nextResults: Record<string, boolean | null> = {};
    for (const ex of lesson.exercises) {
      const outcome = evaluateQuestion(ex.id);
      nextResults[ex.id] = outcome ?? false;
    }
    setResults(nextResults);
    setIsQuizSubmitted(true);
    persistState({ results: nextResults, isQuizSubmitted: true });
    setFocusRequest((prev) => ({ id: "quiz-score-banner", seq: (prev?.seq ?? 0) + 1 }));
  }

  function handleResetQuiz() {
    setResults({});
    setQuizSelections({});
    setQuizOrders({});
    setIsQuizSubmitted(false);
    persistState({
      results: {},
      quizSelections: {},
      quizOrders: {},
      isQuizSubmitted: false,
    });
    setFocusRequest((prev) => ({ id: "quiz-main-heading", seq: (prev?.seq ?? 0) + 1 }));
  }

  const handleTransferNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextNotes = event.target.value;
    setTransferNotes(nextNotes);
    persistState({ transferNotes: nextNotes });
  };

  function completeAndAdvance(currentChapterId: string, nextTarget: ReaderTarget) {
    const updatedCompleted = completedChapterIds.includes(currentChapterId)
      ? completedChapterIds
      : [...completedChapterIds, currentChapterId];
    setCompletedChapterIds(updatedCompleted);
    setActiveTarget(nextTarget);
    audio.resetTrack();
    setIsTranscriptOpen(false);
    persistState({ completedChapterIds: updatedCompleted, lastTarget: nextTarget });
    const nextFocusId = nextTarget === "quiz" ? "quiz-main-heading" : `${nextTarget}-heading`;
    setFocusRequest((prev) => ({ id: nextFocusId, seq: (prev?.seq ?? 0) + 1 }));
  }

  const verifiedCount = isQuizSubmitted
    ? totalExercises
    : Object.values(results).filter((val) => val !== null && val !== undefined).length;
  const correctCount = Object.values(results).filter((val) => val === true).length;
  const scorePercent = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;
  const assessmentPassed = isQuizSubmitted && scorePercent >= passingPercent;

  const answeredCount = lesson.exercises.filter((ex) => {
    if (ex.kind === "multiple-choice" || ex.kind === "state-prediction") {
      return Boolean(quizSelections[ex.id]);
    }
    if (ex.kind === "sequence-order") {
      return Boolean(quizOrders[ex.id]);
    }
    return false;
  }).length;

  const firstChapterId = flatChapters[0]?.chapter.id ?? "ch-1";
  const hasStarted =
    verifiedCount > 0 || completedChapterIds.length > 0 || transferNotes.trim().length > 0;
  const resumeTarget =
    flatChapters.find((item) => !completedChapterIds.includes(item.chapter.id))?.chapter.id ??
    firstChapterId;

  function renderBlock(
    block: CourseEditorialBlock,
    blockKey: string,
    isChapterVisible: boolean,
  ): React.ReactNode {
    if (block.type === "banner") {
      return (
        <figure key={blockKey} className="space-y-2 pt-1">
          <CourseEditorialBanner variant={block.variant} />
          {block.caption ? (
            <figcaption className="text-center text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    if (block.type === "heading") {
      return (
        <h2
          key={blockKey}
          className="pt-2 pb-1 text-[22px] font-bold tracking-[-0.015em] text-[#f5f7f0] sm:text-[24px]"
        >
          {renderRichInline(block.text)}
        </h2>
      );
    }

    if (block.type === "prose") {
      return (
        <div key={blockKey} className="space-y-4 text-[16px] leading-[1.72] text-[#dce3db]">
          {block.paragraphs.map((p, idx) => (
            <p key={idx}>{renderRichInline(p)}</p>
          ))}
        </div>
      );
    }

    if (block.type === "quote") {
      return (
        <blockquote
          key={blockKey}
          className="space-y-2.5 border-l-[3px] border-[#425544] py-1 pl-5 text-[15.5px] leading-[1.72] text-[#cbd6ca]"
        >
          {block.paragraphs.map((p, idx) => (
            <p key={idx}>{renderRichInline(p)}</p>
          ))}
          {block.attribution ? (
            <footer className="font-mono text-xs text-[#8d9d8f]">— {block.attribution}</footer>
          ) : null}
        </blockquote>
      );
    }

    if (block.type === "callout") {
      return (
        <EditorialCallout key={blockKey} variant={block.kind} title={block.title}>
          <p>{renderRichInline(block.body)}</p>
        </EditorialCallout>
      );
    }

    if (block.type === "terminal") {
      return (
        <div
          key={blockKey}
          className="overflow-hidden rounded-2xl border border-[#2a342c] bg-[#0c0f0d]"
        >
          <div className="flex items-center gap-2 border-b border-[#222b24] bg-[#141916] px-4 py-2.5 font-mono text-[11px] text-[#c8ed97]">
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{block.label}</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#e6f0e4]">
            <code>{block.content}</code>
          </pre>
        </div>
      );
    }

    if (block.type === "table") {
      return (
        <figure key={blockKey} className="min-w-0 max-w-full space-y-2 pt-1">
          <div className="max-w-full overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse text-left text-[12.5px] leading-relaxed sm:text-[14.5px]">
              <thead>
                <tr className="bg-[#1b271e] text-[#c8ed97]">
                  {block.headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      scope="col"
                      className="px-2.5 py-2 font-semibold sm:px-4 sm:py-3"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={cn(
                      "border-t border-border",
                      rIdx % 2 === 0 ? "bg-[#121614]" : "bg-[#161b18]",
                    )}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-2.5 py-2 align-top text-[#dce3db] sm:px-4 sm:py-3"
                      >
                        {renderRichInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption ? (
            <figcaption className="text-center text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    if (block.type === "list") {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          key={blockKey}
          className={cn(
            "space-y-3 pl-6 text-[16px] leading-[1.7] text-[#dce3db]",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((item, idx) => (
            <li key={idx}>
              {item.lead ? (
                <>
                  <strong className="font-semibold text-[#f5f7f0]">
                    {renderRichInline(item.lead)}
                  </strong>{" "}
                </>
              ) : null}
              {renderRichInline(item.detail)}
            </li>
          ))}
        </ListTag>
      );
    }

    if (block.type === "worked-example") {
      return (
        <WorkedExampleCard key={blockKey} block={block} renderInline={(t) => renderRichInline(t)} />
      );
    }

    if (block.type === "micro-check") {
      return (
        <MicroCheckCard key={blockKey} block={block} renderInline={(t) => renderRichInline(t)} />
      );
    }

    if (block.type === "reference-sheet") {
      return (
        <ReferenceSheetCard
          key={blockKey}
          block={block}
          renderInline={(t) => renderRichInline(t)}
        />
      );
    }

    if (block.type === "diagram") {
      const currentCue = audio.currentWindow?.cue;
      const DiagramComponent = DIAGRAM_REGISTRY[block.diagramId];
      return (
        <figure key={blockKey} className="space-y-2 pt-1">
          {DiagramComponent ? (
            <DiagramComponent
              activeCueId={currentCue?.id}
              activeCueIndex={audio.activeCueIndex}
              isPlaying={audio.isPlaying}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-[#131815] p-5 text-sm text-[#cbd6ca]">
              Schéma interactif indisponible ({block.diagramId}).
            </div>
          )}
          <figcaption className="text-center text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        </figure>
      );
    }

    if (block.type === "practice") {
      return (
        <section key={blockKey} aria-label={block.title} className="space-y-5 pt-2">
          <div className="space-y-4">
            <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[#f5f7f0] sm:text-[24px]">
              {block.title}
            </h2>

            <div className="space-y-2">
              <h3 className="text-[17px] font-bold text-[#f5f7f0]">Contexte</h3>
              <p className="text-[16px] leading-[1.72] text-[#dce3db]">
                {renderRichInline(block.context)}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[17px] font-bold text-[#f5f7f0]">Consignes</h3>
              <ol className="list-decimal space-y-2.5 pl-6 text-[16px] leading-[1.7] text-[#dce3db]">
                {block.instructions.map((step, idx) => (
                  <li key={idx}>{renderRichInline(step)}</li>
                ))}
              </ol>
            </div>
          </div>

          {block.experienceId && isChapterVisible ? (
            <div className="space-y-3 pt-1">
              <CourseExperienceRenderer componentId={block.experienceId} />
              <details
                className="rounded-xl border border-border/70 bg-[#141816] px-4 py-2 text-xs text-muted-foreground"
                data-testid="experience-model-limits"
              >
                <summary className="py-1 font-medium text-[#dce3db]">
                  Limites du modèle simulé et vérifications en production
                </summary>
                <p className="py-2 leading-relaxed">{baseChapter.experience.modelLimits}</p>
              </details>
            </div>
          ) : null}

          {block.showTransferPad ? (
            <div className="rounded-2xl border border-[#324234] bg-[#141916] p-5 space-y-3">
              <h3 className="text-[16px] font-semibold text-[#c8ed97]">
                Votre brouillon de ticket (cas inédit)
              </h3>
              <p className="text-[14.5px] leading-relaxed text-[#cbd6ca]">
                Rédigez votre constat structuré en 3 volets (Observation brute, Hypothèses
                compatibles, Recoupement) à partir de la trace ci-dessus :
              </p>
              <div>
                <label htmlFor="transfer-response-input" className="sr-only">
                  Rédigez votre constat en trois volets
                </label>
                <textarea
                  id="transfer-response-input"
                  name="transferNotes"
                  rows={4}
                  value={transferNotes}
                  onChange={handleTransferNotesChange}
                  placeholder="1. Observation brute (journal backup-agent)...&#10;2. Deux hypothèses compatibles + source à recouper..."
                  className="w-full rounded-xl border border-border bg-[#0d110f] p-3.5 text-sm text-[#f0f1e9] placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>

              {block.selfCheckPoints && block.selfCheckPoints.length > 0 ? (
                <details className="text-xs text-muted-foreground">
                  <summary className="py-1 font-medium text-[#c8ed97]">
                    Comparer votre ticket avec la grille d&apos;auto-contrôle
                  </summary>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[#dce3db]">
                    {block.selfCheckPoints.map((checkItem, idx) => (
                      <li key={idx}>{renderRichInline(checkItem)}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : null}

          {block.solutionSummary ? (
            <details className="rounded-2xl border border-[#26384a] bg-[#14202b] px-5 py-3.5 text-[15px] leading-[1.7] text-[#dce4dc]">
              <summary className="font-semibold text-[#84c5f4]">
                Vérifiez votre travail à l&apos;aide de cet exemple de corrigé
              </summary>
              <div className="mt-2.5 border-t border-[#26384a] pt-2.5">
                <p>{renderRichInline(block.solutionSummary)}</p>
              </div>
            </details>
          ) : null}
        </section>
      );
    }

    if (block.type === "summary") {
      return (
        <section
          key={blockKey}
          aria-label="En résumé"
          className="space-y-4 border-t border-border pt-7"
          data-testid="lesson-summary-block"
        >
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-[#f5f7f0]">
            <BookOpenCheck size={20} className="text-[#c8ed97]" aria-hidden="true" />
            En résumé
          </h2>
          <ul className="list-disc space-y-2.5 pl-6 text-[16px] leading-[1.7] text-[#dce3db]">
            {block.points.map((point, idx) => (
              <li key={idx}>{renderRichInline(point)}</li>
            ))}
          </ul>
          <p className="pt-1 text-[16px] leading-[1.72] text-[#b4c2b5]">
            {renderRichInline(block.transition)}
          </p>
        </section>
      );
    }

    return null;
  }

  /* =====================================================================
     VUE 0 : PAGE DE PRÉSENTATION DU COURS (format OpenClassrooms)
     ===================================================================== */
  if (activeTarget === "overview") {
    const overviewNarrative = page.overviewNarrative ?? [page.introduction];

    return (
      <div className="oc-reader-shell pb-16">
        {/* Hero Band */}
        <header className="border-b border-border bg-[#131815]">
          <div className="mx-auto max-w-[1080px] px-5 py-9 sm:px-8 sm:py-12 space-y-6">
            <nav
              aria-label="Fil d’Ariane"
              className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground"
            >
              <Link
                href="/parcours/v4-tronc-commun"
                data-testid="course-back-to-parcours"
                className="inline-flex items-center gap-1.5 text-[#c8ed97] hover:underline"
              >
                <ArrowLeft size={13} aria-hidden="true" /> Tronc commun
              </Link>
              <span aria-hidden="true">/</span>
              <span>Logique, preuve et recherche</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
              <div className="space-y-4">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#68b8ea]">
                  CYBERSÉCURITÉ · PREMIÈRE LEÇON
                </p>

                <h1
                  id="course-main-heading"
                  tabIndex={-1}
                  data-testid="course-main-heading"
                  className="text-3xl font-bold tracking-[-0.025em] text-[#f5f7f0] sm:text-[42px] sm:leading-[1.15]"
                >
                  {lesson.title}
                </h1>

                <p className="max-w-[60ch] text-[16px] leading-[1.7] text-[#c2cec2]">
                  {page.introduction}
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-1 text-sm text-[#dce3db]">
                  <span className="inline-flex items-center gap-1.5">
                    <Award size={15} className="text-[#c8ed97]" aria-hidden="true" />
                    {page.levelLabel ?? "Facile"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={15} className="text-[#68b8ea]" aria-hidden="true" />
                    {lesson.estimatedMinutes} minutes
                  </span>
                  <span className="text-[#9fad9f]">{page.audience}</span>
                </div>
              </div>

              {/* OpenClassrooms Start Card */}
              <div className="rounded-2xl border border-[#2a382c] bg-[#181e1a] p-6 space-y-4">
                <p className="text-sm font-semibold text-[#f5f7f0]">
                  {hasStarted
                    ? "Vous avez déjà commencé ce cours"
                    : "Ce cours en libre accès vous intéresse ?"}
                </p>
                <p className="text-xs leading-relaxed text-[#aab8ab]">
                  Suivez les {flatChapters.length} chapitres à l&apos;écrit ou en écoute guidée avec
                  la voix mentor, manipulez le laboratoire 2D puis validez vos réflexes au quiz.
                </p>

                <div className="space-y-2.5 pt-1">
                  <Button
                    size="lg"
                    data-testid="course-start-btn"
                    onClick={() => {
                      enterStudyMode("reading");
                      navigateToTarget(hasStarted ? resumeTarget : firstChapterId);
                    }}
                    className="w-full gap-2 font-semibold"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {hasStarted ? "Continuer le cours" : "Commencer"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>

                  {audioManifest ? (
                    <Button
                      variant="secondary"
                      size="default"
                      data-testid="course-start-listening-btn"
                      onClick={() => {
                        enterStudyMode("listening");
                        navigateToTarget(hasStarted ? resumeTarget : firstChapterId);
                      }}
                      className="h-auto min-h-10 w-full gap-2 whitespace-normal border border-[#3a4f3b] bg-[#19241b] py-2 text-center text-[#c8ed97] hover:bg-[#223224]"
                    >
                      <Headphones className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Écouter le cours en diapos (sans lecture)</span>
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    size="default"
                    data-testid="overview-quiz-btn"
                    onClick={() => navigateToTarget("quiz")}
                    className="w-full gap-2"
                  >
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    Accéder au quiz ({correctCount}/{totalExercises})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sticky Sub-Navigation Bar */}
        <nav
          aria-label="Sections du cours"
          className="sticky top-[74px] z-20 border-b border-border bg-[#101312]/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-[1080px] items-center gap-7 overflow-x-auto px-5 text-sm font-medium sm:px-8">
            <a
              href="#course-overview-section"
              className="border-b-2 border-[#c8ed97] py-3.5 whitespace-nowrap text-[#f5f7f0]"
            >
              Aperçu
            </a>
            <a
              href="#course-toc"
              className="py-3.5 whitespace-nowrap text-[#9fad9f] transition-colors hover:text-[#f5f7f0]"
            >
              Table des matières
            </a>
            <a
              href="#course-credits"
              className="py-3.5 whitespace-nowrap text-[#9fad9f] transition-colors hover:text-[#f5f7f0]"
            >
              Sources
            </a>
          </div>
        </nav>

        {/* Centered Single-Column Narrative Overview + Wide Syllabus + Sources */}
        <div className="mx-auto max-w-[820px] px-5 pt-10 sm:px-8 space-y-12">
          <section id="course-overview-section" className="space-y-6">
            <div className="space-y-4 text-[16px] leading-[1.72] text-[#dce3db]">
              {overviewNarrative.map((para, idx) => (
                <p key={idx}>{renderRichInline(para)}</p>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-[20px] font-bold text-[#f5f7f0]">Objectifs pédagogiques</h2>
              <p className="text-[15.5px] text-[#aab8ab]">
                À la fin de ce cours, vous serez capable de :
              </p>
              <ul className="space-y-2.5 text-[15.5px] leading-relaxed text-[#dce3db]">
                {page.learningObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-[#c8ed97]"
                      aria-hidden="true"
                    />
                    <span>{renderRichInline(obj)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-border pt-6">
              <h2 className="text-[18px] font-bold text-[#f5f7f0]">Prérequis</h2>
              <ul className="space-y-1.5 text-[15.5px] leading-relaxed text-[#cbd6ca]">
                {page.prerequisites.map((pre, idx) => (
                  <li key={idx}>{renderRichInline(pre)}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Wide Table des matières */}
          <section id="course-toc" aria-labelledby="toc-heading" className="space-y-5 pt-2">
            <div className="space-y-1">
              <h2 id="toc-heading" className="text-[22px] font-bold text-[#f5f7f0]">
                Table des matières
              </h2>
              <p className="text-sm text-[#9fad9f]">
                Suivez les chapitres dans l&apos;ordre puis validez vos acquis avec le quiz de fin
                de partie.
              </p>
            </div>

            {parts.map((part) => (
              <div
                key={part.id}
                className="overflow-hidden rounded-2xl border border-border bg-[#131815]"
              >
                <div className="border-b border-[#25323f] bg-[#18222b] px-6 py-4">
                  <span className="block font-mono text-[11px] font-semibold tracking-wider text-[#68b8ea]">
                    PARTIE {part.number}
                  </span>
                  <strong className="mt-1 block text-[17px] font-bold text-[#f5f7f0]">
                    {part.title}
                  </strong>
                </div>

                <div className="oc-syllabus-list">
                  {part.chapters.map((ch) => {
                    const isDone = completedChapterIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        data-testid={`overview-chapter-btn-${ch.id}`}
                        onClick={() => navigateToTarget(ch.id)}
                      >
                        <span
                          className={cn("oc-outline-index", isDone && "oc-outline-index--done")}
                        >
                          {isDone ? <Check size={13} aria-hidden="true" /> : ch.number}
                        </span>
                        <span>
                          {ch.title}
                          <small>{ch.subtitle}</small>
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    data-testid="overview-quiz-row-btn"
                    onClick={() => navigateToTarget("quiz")}
                  >
                    <span
                      className={cn(
                        "oc-outline-index",
                        assessmentPassed && "oc-outline-index--done",
                      )}
                    >
                      {assessmentPassed ? (
                        <Check size={13} aria-hidden="true" />
                      ) : (
                        <ListChecks size={13} aria-hidden="true" />
                      )}
                    </span>
                    <span>
                      {part.quizTitle}
                      <small>
                        Évaluation · {correctCount} / {totalExercises} validés ({scorePercent} %)
                      </small>
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Sources scientifiques & activité locale */}
          <section
            id="course-credits"
            aria-labelledby="credits-heading"
            className="space-y-4 border-t border-border pt-8"
          >
            <h2 id="credits-heading" className="text-[20px] font-bold text-[#f5f7f0]">
              Sources scientifiques et activité hors-ligne
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {linkedResources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-xl border border-border bg-[#141816] p-4 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[#f0f1e9]">
                      {res.publisher} {res.publishedYear ? `(${res.publishedYear})` : ""} —{" "}
                      {res.title}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 font-medium text-[#c8ed97] hover:underline"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                  {res.sectionRef ? (
                    <p className="font-mono text-[11px] text-muted-foreground">{res.sectionRef}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {lesson.externalLabs.map((lab) => (
              <div
                key={lab.id}
                className="rounded-xl border border-border bg-[#141816] p-4 text-xs space-y-2"
                data-testid={`external-lab-${lab.id}`}
              >
                <div className="flex items-center justify-between gap-2 font-semibold text-[#f0f1e9]">
                  <span className="inline-flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#c8ed97]" aria-hidden="true" />
                    {lab.title}
                  </span>
                  <Badge variant="outline">{lab.estimatedMinutes} min</Badge>
                </div>
                <p className="text-muted-foreground">{lab.description}</p>
                {lab.localSteps ? (
                  <ol className="list-decimal space-y-1 pl-4 text-[#dce3db]">
                    {lab.localSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  /* =====================================================================
     VUES 1..4 & QUIZ : LECTEUR DE COURS PLEINE LARGEUR (modèle OpenClassrooms)
     ===================================================================== */
  const isGuidedStudioView =
    activeTarget !== "quiz" &&
    activeTarget !== "overview" &&
    activeTarget !== "all" &&
    studyMode === "listening" &&
    Boolean(currentChapterAudioTrack);

  return (
    <div className="oc-reader-shell">
      {/* Slim Full-Width Course Sub-Header (mirrors OpenClassrooms ← <Course Title>) */}
      <div className="border-b border-border bg-[#121614] px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="back-to-overview-btn"
              onClick={() => navigateToTarget("overview")}
              className="inline-flex min-h-[36px] items-center gap-2 text-sm font-medium text-[#dce3db] transition-colors hover:text-[#c8ed97]"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{lesson.title}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!sidebarOpen ? (
              <button
                type="button"
                data-testid="reopen-toc-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Afficher la table des matières"
                className={cn(
                  "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#2a3b48] bg-[#18222b] px-3 py-1.5 text-xs font-semibold text-[#84c5f4] shadow-lg transition-colors hover:bg-[#202d38]",
                  !isGuidedStudioView &&
                    "lg:fixed lg:left-0 lg:top-[152px] lg:z-30 lg:min-h-[42px] lg:rounded-l-none lg:rounded-r-full lg:border-l-0 lg:pl-3.5 lg:pr-4",
                )}
              >
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                <span className={cn(!isGuidedStudioView && "lg:sr-only")}>
                  {isGuidedStudioView ? "Chapitres" : "Table des matières"}
                </span>
              </button>
            ) : null}
            <span data-testid="exercises-score-badge" className="font-mono text-xs text-[#aab8ab]">
              {isQuizSubmitted
                ? `${correctCount} / ${totalExercises} exercices validés (${scorePercent} %)`
                : `${answeredCount} / ${totalExercises} questions renseignées`}
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Two-Pane Reader */}
      <div
        className={cn(
          "min-h-[calc(100vh-126px)]",
          sidebarOpen ? "lg:grid lg:grid-cols-[348px_minmax(0,1fr)]" : "block",
        )}
      >
        {/* Docked Left Sidebar Column */}
        {sidebarOpen ? (
          <div className="border-b border-border bg-[#121614] lg:border-b-0 lg:border-r">
            <aside
              aria-label="Table des matières du cours"
              className="flex flex-col justify-between lg:sticky lg:top-[74px] lg:h-[calc(100vh-74px)]"
            >
              <div className="overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <h2 className="text-[15px] font-bold text-[#f5f7f0]">Table des matières</h2>
                  <button
                    type="button"
                    aria-label="Replier la table des matières"
                    onClick={() => setSidebarOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#9fad9f] transition-colors hover:bg-[#1b221d] hover:text-[#f5f7f0]"
                  >
                    <PanelLeftClose size={17} className="hidden lg:inline" aria-hidden="true" />
                    <X size={17} className="lg:hidden" aria-hidden="true" />
                  </button>
                </div>

                <nav aria-label="Chapitres et quiz du cours" data-testid="desktop-outline">
                  {parts.map((part) => (
                    <div key={part.id}>
                      <div className="border-b border-[#25323f] bg-[#18222b] px-5 py-3.5">
                        <span className="block font-mono text-[10.5px] font-semibold tracking-wider text-[#68b8ea]">
                          PARTIE {part.number}
                        </span>
                        <strong className="mt-1 block text-[13.5px] font-bold leading-snug text-[#f5f7f0]">
                          {part.title}
                        </strong>
                      </div>

                      <div className="oc-outline-list">
                        {part.chapters.map((ch) => {
                          const isDone = completedChapterIds.includes(ch.id);
                          const isActive = activeTarget === ch.id;
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              aria-current={isActive ? "step" : undefined}
                              data-testid={`toc-chapter-${ch.id}`}
                              onClick={() => navigateToTarget(ch.id)}
                            >
                              <span
                                className={cn(
                                  "oc-outline-index",
                                  isDone && "oc-outline-index--done",
                                )}
                              >
                                {isDone ? <Check size={12} aria-hidden="true" /> : ch.number}
                              </span>
                              <span>{ch.title}</span>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          aria-current={activeTarget === "quiz" ? "step" : undefined}
                          data-testid="toc-quiz-btn"
                          onClick={() => navigateToTarget("quiz")}
                        >
                          <span
                            className={cn(
                              "oc-outline-index",
                              assessmentPassed && "oc-outline-index--done",
                            )}
                          >
                            {assessmentPassed ? (
                              <Check size={12} aria-hidden="true" />
                            ) : (
                              <ListChecks size={12} aria-hidden="true" />
                            )}
                          </span>
                          <span>{part.quizTitle}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Quiet Bottom Utility inside Sidebar */}
              <div className="border-t border-border px-5 py-3 space-y-1.5 text-[11px] text-[#8d9d8f]">
                <button
                  type="button"
                  data-testid="chapter-filter-all"
                  aria-pressed={activeTarget === "all"}
                  onClick={() => navigateToTarget(activeTarget === "all" ? firstChapterId : "all")}
                  className="text-left font-medium text-[#c8ed97] hover:underline"
                >
                  {activeTarget === "all"
                    ? "Revenir chapitre par chapitre"
                    : "Afficher tout le cours sur une page"}
                </button>
                <p>
                  {!storageAvailable
                    ? "Stockage local bloqué : session active."
                    : "Progression sauvegardée dans ce navigateur."}
                </p>
              </div>
            </aside>
          </div>
        ) : null}

        {/* Centered Calm Reading Column OR Wide Studio Presentation Theater */}
        <main
          className={cn(
            "course-workspace min-w-0 transition-[padding] duration-300",
            isGuidedStudioView ? "px-4 pt-4 sm:px-6 sm:pt-5 lg:px-7" : "px-4 pt-7 sm:px-8 sm:pt-10",
          )}
          style={{
            paddingBottom: isGuidedStudioView ? "56px" : isTranscriptOpen ? "340px" : "180px",
          }}
        >
          <div
            className={cn(
              "mx-auto w-full transition-[max-width] duration-300",
              isGuidedStudioView ? "max-w-[1380px]" : "max-w-[780px]",
            )}
          >
            {flatChapters.map(({ chapter }, index) => {
              const isVisible = activeTarget === "all" || activeTarget === chapter.id;
              const isGuidedActive =
                activeTarget !== "all" &&
                studyMode === "listening" &&
                Boolean(currentChapterAudioTrack) &&
                activeTarget === chapter.id;
              const prevTarget: ReaderTarget =
                index > 0 ? flatChapters[index - 1]!.chapter.id : "overview";
              const nextChapter =
                index < flatChapters.length - 1 ? flatChapters[index + 1]!.chapter : null;
              const nextTarget: ReaderTarget = nextChapter ? nextChapter.id : "quiz";
              const ChapterHeadingTag = activeTarget === "all" && index > 0 ? "h2" : "h1";

              return (
                <article
                  key={chapter.id}
                  id={chapter.id}
                  aria-labelledby={`${chapter.id}-heading`}
                  hidden={!isVisible}
                  className={cn(
                    isGuidedActive ? "space-y-4" : "space-y-6",
                    activeTarget === "all" && index > 0 && "mt-14 border-t border-border pt-12",
                  )}
                >
                  <header
                    className={cn(
                      "flex flex-wrap items-start justify-between gap-4",
                      isGuidedActive ? "sr-only" : "pb-2",
                    )}
                  >
                    <div className="space-y-1.5">
                      <p className="font-mono text-xs font-semibold tracking-wider text-[#68b8ea]">
                        CHAPITRE {chapter.number} · {chapter.estimatedMinutes} MIN
                      </p>
                      <ChapterHeadingTag
                        id={`${chapter.id}-heading`}
                        tabIndex={-1}
                        data-testid="chapter-main-heading"
                        className="text-[26px] font-bold tracking-[-0.02em] leading-[1.2] text-[#f5f7f0] sm:text-[32px]"
                      >
                        {chapter.title}
                      </ChapterHeadingTag>
                    </div>

                    {activeTarget === chapter.id && currentChapterAudioTrack && !isGuidedActive ? (
                      <div
                        role="group"
                        aria-label="Mode de suivi du cours"
                        className="inline-flex rounded-xl border border-[#2c392f] bg-[#131815] p-1 text-xs"
                      >
                        <button
                          type="button"
                          aria-pressed={studyMode === "reading"}
                          data-testid="study-mode-reading-btn"
                          onClick={() => enterStudyMode("reading")}
                          className={cn(
                            "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors",
                            studyMode === "reading"
                              ? "bg-[#1f2d20] text-[#c8ed97]"
                              : "text-[#9fad9f] hover:text-[#f5f7f0]",
                          )}
                        >
                          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          Lecture
                        </button>
                        <button
                          type="button"
                          aria-pressed={studyMode === "listening"}
                          data-testid="study-mode-listening-btn"
                          onClick={() => enterStudyMode("listening")}
                          className={cn(
                            "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors",
                            studyMode === "listening"
                              ? "bg-[#1f2d20] text-[#c8ed97]"
                              : "text-[#9fad9f] hover:text-[#f5f7f0]",
                          )}
                        >
                          <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                          Écoute guidée
                        </button>
                      </div>
                    ) : null}
                  </header>

                  {isGuidedActive ? (
                    <GuidedListeningStage
                      chapterNumber={chapter.number}
                      chapterTitle={chapter.title}
                      scenes={getChapterScenes(chapter)}
                      audio={audio}
                      courseSidebarOpen={sidebarOpen}
                      onSwitchToReading={() => enterStudyMode("reading")}
                      renderBlock={renderBlock}
                      renderInline={(t) => renderRichInline(t)}
                    />
                  ) : (
                    <div className="space-y-8">
                      {getChapterScenes(chapter).map((scene, sceneIdx) => {
                        const isHighlighted =
                          activeTarget === chapter.id && activeAudioBlockId === scene.id;
                        const hasAudioForScene =
                          activeTarget === chapter.id &&
                          Boolean(currentChapterAudioTrack?.cues[sceneIdx]);
                        return (
                          <section
                            key={scene.id}
                            id={scene.id}
                            data-section-id={scene.id}
                            className={cn(
                              "space-y-4 rounded-2xl transition-all duration-300",
                              isHighlighted &&
                                audio.isPlaying &&
                                "border-2 border-[#c8ed97] border-l-4 border-l-[#c8ed97] bg-[#141b16]/50 pl-4 sm:pl-5 pr-4 py-4 rounded-2xl shadow-[0_0_20px_rgba(200,237,151,0.12)]",
                              isHighlighted &&
                                !audio.isPlaying &&
                                "border border-[#c8ed97]/50 border-l-4 border-l-[#c8ed97] bg-[#141b16]/25 pl-4 sm:pl-5 pr-4 py-4 rounded-2xl",
                              !isHighlighted &&
                                "border border-transparent border-l-4 border-l-transparent pl-4 sm:pl-5 pr-4 py-2",
                            )}
                          >
                            {hasAudioForScene ? (
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
                                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#8fa192]">
                                  Étape {String(sceneIdx + 1).padStart(2, "0")} · {scene.title}
                                </span>
                                <button
                                  type="button"
                                  data-testid={`scene-listen-btn-${scene.id}`}
                                  onClick={() => audio.jumpToCue(sceneIdx, true)}
                                  className={cn(
                                    "inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                                    isHighlighted && audio.isPlaying
                                      ? "border-[#c8ed97] bg-[#1e2d1d] text-[#c8ed97]"
                                      : "border-[#2a372d] bg-[#141a16] text-[#b4c4b5] hover:border-[#c8ed97]/50 hover:text-[#c8ed97]",
                                  )}
                                >
                                  <Volume2 className="h-3 w-3" aria-hidden="true" />
                                  <span>
                                    {isHighlighted && audio.isPlaying ? "En écoute" : "Écouter"}
                                  </span>
                                </button>
                              </div>
                            ) : null}

                            {scene.blocks.map((block, bIdx) => {
                              const blockKey = `${scene.id}-block-${bIdx}`;
                              return (
                                <div key={blockKey} id={blockKey} data-block-id={blockKey}>
                                  {renderBlock(block, blockKey, isVisible)}
                                </div>
                              );
                            })}
                          </section>
                        );
                      })}
                    </div>
                  )}

                  {/* Sources scientifiques (affichées en bas du dernier chapitre avant le quiz, conforme à l'onglet ressources scientifiques) */}
                  {index === flatChapters.length - 1 && linkedResources.length > 0 ? (
                    <section
                      id="chapter-sources-credits"
                      aria-labelledby="chapter-sources-heading"
                      className={cn(
                        "mt-10 space-y-4 border-t border-border pt-8 transition-all duration-500",
                        activeAudioBlockId === "chapter-sources-credits" &&
                          (audio.isPlaying
                            ? "rounded-2xl ring-2 ring-[#c8ed97] shadow-[0_0_28px_rgba(200,237,151,0.25)] bg-[#131a15]/90 p-4 -m-4"
                            : "rounded-2xl ring-1 ring-[#c8ed97]/40 shadow-[0_0_14px_rgba(200,237,151,0.12)] p-4 -m-4"),
                      )}
                      data-testid="last-chapter-sources-section"
                    >
                      <h2
                        id="chapter-sources-heading"
                        className="text-[20px] font-bold text-[#f5f7f0]"
                      >
                        Sources scientifiques
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Publications et standards officiels de sécurité des systèmes
                        d&apos;information et de démarche scientifique sur lesquels s&apos;appuie ce
                        cours :
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {linkedResources.map((res) => (
                          <div
                            key={res.id}
                            className="rounded-xl border border-border bg-[#141816] p-4 text-xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-[#f0f1e9]">
                                {res.publisher} {res.publishedYear ? `(${res.publishedYear})` : ""}{" "}
                                — {res.title}
                              </span>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1 font-medium text-[#c8ed97] hover:underline"
                              >
                                <span>Source</span>
                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                              </a>
                            </div>
                            {res.sectionRef ? (
                              <p className="font-mono text-[11px] text-muted-foreground">
                                {res.sectionRef}
                              </p>
                            ) : null}
                            {res.summary ? (
                              <p className="text-[11.5px] leading-relaxed text-[#aab8ab]">
                                {res.summary}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {activeTarget !== "all" ? (
                    <nav
                      aria-label="Navigation entre chapitres"
                      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7"
                    >
                      <button
                        type="button"
                        data-testid="chapter-prev-btn"
                        onClick={() => navigateToTarget(prevTarget)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-[#cbd6ca] transition-colors hover:border-[#3e4c3f] hover:text-[#f5f7f0]"
                      >
                        <ArrowLeft size={15} aria-hidden="true" />
                        <span>{index === 0 ? "Aperçu du cours" : "Chapitre précédent"}</span>
                      </button>

                      <button
                        type="button"
                        data-testid="chapter-next-btn"
                        onClick={() => completeAndAdvance(chapter.id, nextTarget)}
                        className="inline-flex min-h-[48px] max-w-full items-center gap-3 rounded-xl border border-[#5f7848] bg-[#1a2417] px-5 py-3 text-right transition-colors hover:bg-[#22301d]"
                      >
                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#9db687]">
                            {nextChapter ? "Chapitre suivant" : "Évaluation finale"}
                          </span>
                          <span className="block truncate text-sm font-semibold text-[#c8ed97]">
                            {nextChapter ? nextChapter.title : "Passer au Quiz final"}
                          </span>
                        </span>
                        <ArrowRight
                          size={17}
                          className="shrink-0 text-[#c8ed97]"
                          aria-hidden="true"
                        />
                      </button>
                    </nav>
                  ) : null}
                </article>
              );
            })}

            {/* Final Quiz View (OpenClassrooms Quiz Experience) */}
            <section
              id="part-quiz-view"
              aria-labelledby="quiz-main-heading"
              hidden={activeTarget !== "quiz" && activeTarget !== "all"}
              className={cn(
                "space-y-8",
                activeTarget === "all" && "mt-14 border-t border-border pt-12",
              )}
              data-testid="course-assessment-summary"
            >
              <header className="space-y-3 border-b border-border pb-6">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#68b8ea]">
                  PARTIE 1 · {parts[0]?.title}
                </p>
                <h1
                  id="quiz-main-heading"
                  tabIndex={-1}
                  className="text-[26px] font-bold tracking-[-0.02em] text-[#f5f7f0] sm:text-[32px]"
                >
                  {parts[0]?.quizTitle ?? "Quiz : Testez vos connaissances"}
                </h1>
                <p className="text-[18px] font-semibold text-[#c8ed97]">
                  Testez vos connaissances !
                </p>
                <p className="max-w-[66ch] text-[15.5px] leading-[1.7] text-[#cbd6ca]">
                  {parts[0]?.quizIntro}
                </p>
              </header>

              {/* Sources scientifiques (en haut du quiz, conforme à l'onglet ressources scientifiques) */}
              {linkedResources.length > 0 ? (
                <section
                  aria-labelledby="quiz-sources-heading"
                  className="space-y-3 rounded-2xl border border-border bg-[#141816] p-5"
                  data-testid="quiz-sources-reference"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5">
                    <h2 id="quiz-sources-heading" className="text-sm font-bold text-[#f5f7f0]">
                      Sources scientifiques du cours
                    </h2>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Standards officiels NIST, IETF &amp; NGSS
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {linkedResources.map((res) => (
                      <div
                        key={res.id}
                        className="flex flex-col justify-between rounded-xl border border-border bg-[#101312] p-3 text-xs space-y-2"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-[#f0f1e9] block line-clamp-2">
                            {res.publisher} {res.publishedYear ? `(${res.publishedYear})` : ""} —{" "}
                            {res.title}
                          </span>
                          {res.sectionRef ? (
                            <p className="font-mono text-[10.5px] text-muted-foreground">
                              {res.sectionRef}
                            </p>
                          ) : null}
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 font-medium text-[#c8ed97] hover:underline pt-1 text-[11px]"
                        >
                          <span>Source</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* OpenClassrooms Quiz Score & Threshold Banner */}
              {isQuizSubmitted ? (
                <div
                  id="quiz-score-banner"
                  tabIndex={-1}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-6",
                    assessmentPassed
                      ? "border-emerald-500/50 bg-emerald-950/25"
                      : "border-rose-500/45 bg-rose-950/20",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold",
                        assessmentPassed
                          ? "bg-[#c8ed97] text-[#101312]"
                          : "bg-rose-500/25 text-rose-200 border border-rose-400/50",
                      )}
                    >
                      {scorePercent}%
                    </span>
                    <div className="space-y-1">
                      <p
                        className="text-[16px] font-bold text-[#f5f7f0]"
                        data-testid="assessment-status-text"
                      >
                        {assessmentPassed
                          ? `Bravo : vous avez validé ${correctCount} exercices sur ${totalExercises} (${scorePercent} %). Quiz réussi !`
                          : `Score obtenu : ${correctCount} / ${totalExercises} (${scorePercent} %) — Seuil requis : ${passingPercent} %`}
                      </p>
                      <p className="text-xs leading-relaxed text-[#cbd6ca]">
                        {assessmentPassed
                          ? `Vous avez dépassé le seuil de ${passingPercent} % et validé les réflexes d'analyse de ce cours.`
                          : `Vous n'avez pas encore atteint le seuil de ${passingPercent} %. Consultez les explications diagnostiques sous chaque question pour comprendre vos erreurs, puis réessayez.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetQuiz}
                      data-testid="clear-course-progress-btn"
                      className="gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Recommencer le quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  id="quiz-score-banner"
                  tabIndex={-1}
                  className="rounded-2xl border border-border bg-[#141916] p-5 sm:p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-[#c8ed97]">
                      Progression : {answeredCount} / {totalExercises} questions renseignées
                    </span>
                    <Badge variant="outline" className="font-mono text-[11px] text-[#cbd6ca]">
                      Seuil de réussite : {passingPercent} % (
                      {Math.ceil((totalExercises * passingPercent) / 100)} / {totalExercises})
                    </Badge>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#1b221d]">
                    <div
                      className="h-full bg-[#c8ed97] transition-all duration-300"
                      style={{ width: `${(answeredCount / totalExercises) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9fad9f]">
                    Répondez aux {totalExercises} questions ci-dessous à votre rythme. Vos choix
                    sont enregistrés automatiquement. Vos résultats et l&apos;ensemble des
                    explications détaillées s&apos;afficheront dès la validation au bas de la page.
                  </p>
                </div>
              )}

              {/* OpenClassrooms Sequential Quiz Questions (Question 1 .. Question N) */}
              <div className="space-y-8">
                {lesson.exercises.map((ex, idx) => {
                  const questionNumber = idx + 1;
                  const resultState = results[ex.id];
                  const isCorrect = isQuizSubmitted && resultState === true;
                  const selectedId = quizSelections[ex.id] ?? null;
                  const currentOrder =
                    ex.kind === "sequence-order"
                      ? (quizOrders[ex.id] ?? ex.items.map((item) => item.id))
                      : [];
                  const relatedChapter =
                    (ex.chapterId
                      ? flatChapters.find((item) => item.chapter.id === ex.chapterId)?.chapter
                      : undefined) ??
                    flatChapters[
                      Math.min(
                        flatChapters.length - 1,
                        Math.floor((idx * flatChapters.length) / Math.max(1, totalExercises)),
                      )
                    ]?.chapter;

                  const selectedOption =
                    ex.kind === "multiple-choice" || ex.kind === "state-prediction"
                      ? ex.options.find((o) => o.id === selectedId)
                      : undefined;

                  return (
                    <article
                      key={ex.id}
                      id={`exercise-${ex.id}`}
                      tabIndex={-1}
                      data-testid={`exercise-card-${ex.id}`}
                      className="rounded-2xl border border-border bg-[#131815] p-5 sm:p-7 space-y-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3.5">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1b261d] font-mono text-xs font-bold text-[#c8ed97] border border-[#354838]">
                            {questionNumber}
                          </span>
                          <h2 className="text-[19px] font-bold text-[#f5f7f0]">
                            Question {questionNumber}
                          </h2>
                        </div>

                        <div className="flex items-center gap-2">
                          {relatedChapter ? (
                            <button
                              type="button"
                              onClick={() => navigateToTarget(relatedChapter.id)}
                              className="text-xs text-[#84c5f4] hover:underline"
                            >
                              Chapitre {relatedChapter.number}
                            </button>
                          ) : null}
                          {isQuizSubmitted ? (
                            <Badge variant={isCorrect ? "success" : "warning"}>
                              {isCorrect ? "✓ Bonne réponse" : "✕ À revoir"}
                            </Badge>
                          ) : selectedId || (ex.kind === "sequence-order" && quizOrders[ex.id]) ? (
                            <Badge
                              variant="outline"
                              className="border-[#c8ed97]/40 text-[#c8ed97] text-[11px]"
                            >
                              Répondu
                            </Badge>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">
                              Question {questionNumber} / {totalExercises}
                            </span>
                          )}
                        </div>
                      </div>

                      {ex.kind === "state-prediction" && ex.scenario ? (
                        <div className="rounded-xl border-l-[3px] border-[#68b8ea] bg-[#14202b] px-4 py-3 text-[15px] leading-relaxed text-[#dce4dc]">
                          {ex.scenario}
                        </div>
                      ) : null}

                      <div className="space-y-1.5">
                        <p className="text-[16.5px] font-semibold leading-[1.6] text-[#f5f7f0]">
                          {ex.prompt}
                        </p>
                        <p className="text-xs text-[#9fad9f]">
                          {ex.kind === "sequence-order"
                            ? "Ordonnez les quatre étapes de haut en bas (1 à 4) à l'aide des flèches."
                            : "Attention, une seule réponse est possible."}
                        </p>
                      </div>

                      {/* Choice Options (Radio style like OpenClassrooms) */}
                      {ex.kind === "multiple-choice" || ex.kind === "state-prediction" ? (
                        <div
                          role="radiogroup"
                          aria-label={`Question ${questionNumber}`}
                          className="space-y-2.5"
                        >
                          {ex.options.map((opt) => {
                            const isSelected = selectedId === opt.id;
                            const isOptionCorrect = opt.id === ex.correctOptionId;

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => handleSelectQuizOption(ex.id, opt.id)}
                                className={cn(
                                  "flex w-full items-start gap-3.5 rounded-xl border p-4 text-left text-[15px] leading-[1.6] transition-colors",
                                  !isQuizSubmitted &&
                                    (isSelected
                                      ? "border-[#c8ed97] bg-[#1a2417] text-[#f5f7f0]"
                                      : "border-border bg-[#0f1311] text-[#dce3db] hover:border-[#38473b] hover:bg-[#151b17]"),
                                  isQuizSubmitted &&
                                    isOptionCorrect &&
                                    "border-emerald-500/70 bg-emerald-950/25 text-[#f5f7f0]",
                                  isQuizSubmitted &&
                                    isSelected &&
                                    !isOptionCorrect &&
                                    "border-rose-500/70 bg-rose-950/25 text-[#f5f7f0]",
                                  isQuizSubmitted &&
                                    !isSelected &&
                                    !isOptionCorrect &&
                                    "border-border/60 bg-[#0f1311]/60 text-[#9fad9f]",
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                                    !isQuizSubmitted &&
                                      (isSelected
                                        ? "border-[#c8ed97] bg-[#c8ed97]/20"
                                        : "border-[#4b5b4e]"),
                                    isQuizSubmitted &&
                                      isOptionCorrect &&
                                      "border-emerald-400 bg-emerald-500/30 text-emerald-200",
                                    isQuizSubmitted &&
                                      isSelected &&
                                      !isOptionCorrect &&
                                      "border-rose-400 bg-rose-500/30 text-rose-200",
                                  )}
                                >
                                  {isQuizSubmitted && isOptionCorrect ? (
                                    <Check size={12} />
                                  ) : isQuizSubmitted && isSelected && !isOptionCorrect ? (
                                    <X size={12} />
                                  ) : isSelected ? (
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#c8ed97]" />
                                  ) : null}
                                </span>
                                <span className="flex-1">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Sequence Order Question */}
                      {ex.kind === "sequence-order" ? (
                        <ol className="space-y-2.5">
                          {currentOrder.map((itemId, posIdx) => {
                            const item = ex.items.find((entry) => entry.id === itemId);
                            if (!item) return null;
                            const isAtRightPos =
                              isQuizSubmitted && ex.expectedOrder[posIdx] === itemId;
                            return (
                              <li
                                key={item.id}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-xl border p-3.5 text-[15px]",
                                  !isQuizSubmitted && "border-border bg-[#0f1311] text-[#dce3db]",
                                  isQuizSubmitted &&
                                    (isAtRightPos
                                      ? "border-emerald-500/65 bg-emerald-950/20 text-[#f5f7f0]"
                                      : "border-rose-500/65 bg-rose-950/20 text-[#f5f7f0]"),
                                )}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-[#161c18] font-mono text-xs font-bold text-[#c8ed97]">
                                    {posIdx + 1}
                                  </span>
                                  <span className="leading-snug">{item.label}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={posIdx === 0 || isQuizSubmitted}
                                    aria-label={`Monter ${item.label}`}
                                    onClick={() => handleMoveSequenceItem(ex.id, posIdx, -1)}
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={posIdx === currentOrder.length - 1 || isQuizSubmitted}
                                    aria-label={`Descendre ${item.label}`}
                                    onClick={() => handleMoveSequenceItem(ex.id, posIdx, 1)}
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      ) : null}

                      {/* OpenClassrooms Detailed Pedagogical Explanation after validation */}
                      {isQuizSubmitted ? (
                        <div
                          role="status"
                          className={cn(
                            "rounded-xl border p-4 sm:p-5 space-y-2.5 text-[14.5px] leading-[1.7]",
                            isCorrect
                              ? "border-emerald-500/45 bg-emerald-950/20 text-[#e4efe4]"
                              : "border-rose-500/45 bg-rose-950/20 text-[#f2e2e5]",
                          )}
                        >
                          <p className="flex items-center gap-2 font-bold text-[#f5f7f0]">
                            {isCorrect ? (
                              <>
                                <CheckCircle2
                                  className="h-4 w-4 shrink-0 text-emerald-400"
                                  aria-hidden="true"
                                />
                                <span>Raisonnement exact</span>
                              </>
                            ) : (
                              <>
                                <XCircle
                                  className="h-4 w-4 shrink-0 text-rose-400"
                                  aria-hidden="true"
                                />
                                <span>Pas encore — analysons pourquoi</span>
                              </>
                            )}
                          </p>

                          {selectedOption ? (
                            <p>{selectedOption.feedback}</p>
                          ) : ex.kind === "sequence-order" ? (
                            <p>
                              {isCorrect
                                ? "L'ordre méthodologique des quatre étapes est parfaitement respecté."
                                : "L'ordre méthodologique des quatre étapes n'est pas encore correct."}
                            </p>
                          ) : (
                            <p className="italic text-[#cbd6ca]">
                              Aucune réponse n&apos;avait été sélectionnée pour cette question.
                            </p>
                          )}

                          <p className="border-t border-white/10 pt-2 text-xs text-[#cbd6ca]">
                            <strong className="text-[#f5f7f0]">À retenir :</strong> {ex.explanation}
                          </p>

                          {!isCorrect && relatedChapter ? (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => navigateToTarget(relatedChapter.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c8ed97] hover:underline"
                              >
                                <span>
                                  Revoir le Chapitre {relatedChapter.number} :{" "}
                                  {relatedChapter.title}
                                </span>
                                <ArrowRight size={13} aria-hidden="true" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              {/* OpenClassrooms Bottom Submit-All Quiz Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#2f3e31] bg-[#161d17] p-5 sm:p-6">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#f5f7f0]">
                    {isQuizSubmitted
                      ? `Quiz terminé · Score final : ${correctCount} / ${totalExercises} (${scorePercent} %)`
                      : answeredCount === totalExercises
                        ? `Toutes les questions sont renseignées (${totalExercises} / ${totalExercises})`
                        : `Questions renseignées : ${answeredCount} / ${totalExercises}`}
                  </p>
                  <p className="text-xs text-[#9fad9f]">
                    {isQuizSubmitted
                      ? "Vous pouvez revoir vos réponses ci-dessus ou recommencer le quiz pour retenter votre chance."
                      : "Validez l'ensemble de vos réponses pour calculer votre score final et afficher les explications détaillées (seuil : " +
                        passingPercent +
                        " %)."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {isQuizSubmitted ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleResetQuiz}
                      className="gap-2 font-semibold"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Recommencer le quiz
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      data-testid="quiz-submit-all-btn"
                      onClick={handleValidateAllQuiz}
                      className="gap-2 font-semibold"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Valider mes réponses
                    </Button>
                  )}
                </div>
              </div>

              {activeTarget === "quiz" ? (
                <nav
                  aria-label="Navigation depuis le quiz"
                  className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7"
                >
                  <button
                    type="button"
                    data-testid="quiz-prev-btn"
                    onClick={() =>
                      navigateToTarget(
                        flatChapters[flatChapters.length - 1]?.chapter.id ?? firstChapterId,
                      )
                    }
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-[#cbd6ca] transition-colors hover:text-[#f5f7f0]"
                  >
                    <ArrowLeft size={15} aria-hidden="true" />
                    <span>Retour au Chapitre {flatChapters.length}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="quiz-overview-btn"
                    onClick={() => navigateToTarget("overview")}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#5f7848] bg-[#1a2417] px-5 py-2.5 text-sm font-semibold text-[#c8ed97] transition-colors hover:bg-[#22301d]"
                  >
                    <span>Retour à l&apos;aperçu du cours</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </nav>
              ) : null}
            </section>
          </div>
        </main>

        {/* Single Lifted Audio Element (persists seamlessly when switching Reading <-> Guided Theater Mode) */}
        {activeTarget !== "quiz" && activeTarget !== "overview" && currentChapterAudioTrack ? (
          <audio
            key={currentChapterAudioTrack.chapterId}
            ref={audioRef}
            preload="metadata"
            onLoadedMetadata={audio.handleLoadedMetadata}
            onTimeUpdate={audio.handleTimeUpdate}
            onEnded={audio.handleEnded}
            onError={audio.handleError}
            className="hidden"
            data-testid="course-audio-element"
          >
            <source
              src={currentChapterAudioTrack.audioSrc}
              type="audio/ogg; codecs=opus"
              onError={currentChapterAudioTrack.fallbackAudioSrc ? undefined : audio.handleError}
            />
            {currentChapterAudioTrack.fallbackAudioSrc ? (
              <source
                src={currentChapterAudioTrack.fallbackAudioSrc}
                type="audio/mpeg"
                onError={audio.handleError}
              />
            ) : null}
          </audio>
        ) : null}

        {/* Reading-Mode Synced Audio Bar (hidden on Overview, Quiz, and Guided Theater where the integrated dock is active) */}
        {activeTarget !== "quiz" &&
        activeTarget !== "overview" &&
        currentChapterAudioTrack &&
        (studyMode === "reading" || activeTarget === "all") ? (
          <CourseSyncedAudioBar
            audio={audio}
            syncEnabled={audioSyncEnabled}
            studyMode={studyMode}
            sidebarOpen={sidebarOpen}
            transcriptOpen={isTranscriptOpen}
            onToggleSync={() => setAudioSyncEnabled((prev) => !prev)}
            onToggleStudyMode={() =>
              enterStudyMode(studyMode === "reading" ? "listening" : "reading")
            }
            onToggleTranscript={handleToggleTranscript}
          />
        ) : null}
      </div>
    </div>
  );
}
