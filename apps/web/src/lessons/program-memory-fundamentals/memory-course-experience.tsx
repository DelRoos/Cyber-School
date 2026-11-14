"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FlaskConical, Layers, Terminal } from "lucide-react";
import { AssessmentRunner, ExerciseCard } from "@cyber-school/exercises";
import type { LessonManifest } from "@cyber-school/lesson-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cyber-school/ui";
import type { LessonComponentProps } from "@/components/default-lesson-experience";
import { chapterGuidance } from "./chapter-guidance";
import { Vis01CpuMemory } from "./components/vis-01-cpu-memory";
import { Vis02VirtualMemory } from "./components/vis-02-virtual-memory";
import { Vis03CallStack } from "./components/vis-03-call-stack";
import { Vis04HeapAllocator } from "./components/vis-04-heap-allocator";
import { Vis05MemoryModels } from "./components/vis-05-memory-models";

type ChapterFilter = "all" | string;

interface ChapterMeta {
  stepId: string;
  badge: string;
  conceptIds: string[];
  exerciseIds: string[];
}

const CHAPTER_METADATA: ChapterMeta[] = [
  {
    stepId: "step-cpu-bytes",
    badge: "Chapitre 1 · CPU & Octets",
    conceptIds: ["cpu-fetch-decode-execute", "memory-addressing-and-bytes"],
    exerciseIds: ["ex-mem-01", "ex-mem-02", "ex-mem-03"],
  },
  {
    stepId: "step-virtual-segments",
    badge: "Chapitre 2 · Mémoire virtuelle & Segments",
    conceptIds: ["virtual-vs-physical-memory", "process-memory-segments"],
    exerciseIds: ["ex-mem-04", "ex-mem-05", "ex-mem-06"],
  },
  {
    stepId: "step-call-stack-abi",
    badge: "Chapitre 3 · Variables, Pile & ABI",
    conceptIds: [
      "variable-value-vs-address-and-type",
      "call-stack-and-frames",
      "function-prologue-epilogue-and-abi",
    ],
    exerciseIds: ["ex-mem-07", "ex-mem-08", "ex-mem-11"],
  },
  {
    stepId: "step-pointers-dangling",
    badge: "Chapitre 4 · Pointeurs & Dangling",
    conceptIds: ["pointers-and-dereferencing", "stack-dangling-pointers-and-overflow"],
    exerciseIds: ["ex-mem-09", "ex-mem-10"],
  },
  {
    stepId: "step-heap-allocators",
    badge: "Chapitre 5 · Tas & Allocateur",
    conceptIds: [
      "heap-allocation-and-lifetime",
      "allocator-chunks-bins-and-fragmentation",
      "heap-corruption-uaf-and-leaks",
    ],
    exerciseIds: ["ex-mem-12", "ex-mem-13"],
  },
  {
    stepId: "step-models-uaf-reality",
    badge: "Chapitre 6 · Modèles mémoire & Compilateur",
    conceptIds: ["manual-vs-raii-vs-gc", "compiler-optimizations-and-memory-reality"],
    exerciseIds: ["ex-mem-14", "ex-mem-15", "ex-mem-16"],
  },
];

export function MemoryCourseExperience({ lesson }: LessonComponentProps) {
  const [scores, setScores] = React.useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = React.useState<ChapterFilter>("step-cpu-bytes");

  function handleResult(exerciseId: string, correct: boolean | null) {
    setScores((prev) => {
      const next = { ...prev };
      if (correct === null) {
        delete next[exerciseId];
      } else {
        next[exerciseId] = correct;
      }
      return next;
    });
  }

  const solvedCount = Object.values(scores).filter(Boolean).length;
  const exerciseById = React.useMemo(
    () => new Map(lesson.exercises.map((ex, idx) => [ex.id, { ex, idx }])),
    [lesson.exercises],
  );
  const stepById = React.useMemo(
    () => new Map(lesson.steps.map((step) => [step.id, step])),
    [lesson.steps],
  );

  const [focusRequest, setFocusRequest] = React.useState<{ id: string; seq: number } | null>(null);

  React.useEffect(() => {
    if (!focusRequest) return;
    const target = document.getElementById(focusRequest.id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [focusRequest]);

  const activeIndex = CHAPTER_METADATA.findIndex((ch) => ch.stepId === activeFilter);
  function selectChapter(stepId: string) {
    setActiveFilter(stepId);
    setFocusRequest((prev) => ({ id: stepId + "-heading", seq: (prev?.seq ?? 0) + 1 }));
  }

  function revisitExercise(exerciseId: string) {
    const chapter = CHAPTER_METADATA.find((entry) => entry.exerciseIds.includes(exerciseId));
    if (!chapter) return;
    setActiveFilter(chapter.stepId);
    setFocusRequest((prev) => ({ id: `exercise-${exerciseId}`, seq: (prev?.seq ?? 0) + 1 }));
  }

  return (
    <div className="learning-layout" data-testid="memory-course-experience">
      <aside className="course-outline" aria-label="Sommaire du cours">
        <div className="outline-heading">
          <h2>Votre parcours</h2>
          <p>Un chapitre à la fois. À votre rythme.</p>
        </div>
        <nav className="outline-list" aria-label="Chapitres">
          {CHAPTER_METADATA.map((chapter, index) => (
            <button
              key={chapter.stepId}
              type="button"
              aria-current={activeFilter === chapter.stepId ? "step" : undefined}
              data-testid={`chapter-filter-${chapter.stepId}`}
              onClick={() => selectChapter(chapter.stepId)}
            >
              <span className="outline-index">0{index + 1}</span>
              <span>
                {chapterGuidance[chapter.stepId]?.title}
                <small>
                  {chapterGuidance[chapter.stepId]?.minutes} min · {chapter.exerciseIds.length}{" "}
                  exercices
                </small>
              </span>
            </button>
          ))}
        </nav>
        <div className="outline-mode">
          <button
            data-testid="chapter-filter-all"
            aria-pressed={activeFilter === "all"}
            onClick={() => setActiveFilter(activeFilter === "all" ? "step-cpu-bytes" : "all")}
          >
            {activeFilter === "all" ? "Revenir au parcours guidé" : "Afficher tous les chapitres"}
          </button>
        </div>
        <div className="outline-score">
          <span data-testid="exercises-score-badge">
            {solvedCount} / {lesson.exercises.length} exercices validés
          </span>
          <span>Réponses vérifiées pendant cette session.</span>
        </div>
      </aside>
      <div className="course-workspace">
        {/* Progressive Chapters */}
        <div className="space-y-10">
          {CHAPTER_METADATA.map((chapter, chapterIndex) => {
            const step = stepById.get(chapter.stepId);
            const guidance = chapterGuidance[chapter.stepId];
            const shown = activeFilter === "all" || activeFilter === chapter.stepId;
            if (!step || !guidance) return null;

            return (
              <section
                key={chapter.stepId}
                id={chapter.stepId}
                aria-labelledby={`${chapter.stepId}-heading`}
                className="learning-chapter"
                hidden={activeFilter !== "all" && activeFilter !== chapter.stepId}
              >
                <header className="chapter-heading">
                  <p>
                    Chapitre {chapterIndex + 1} sur {CHAPTER_METADATA.length} · {guidance.minutes}{" "}
                    min environ
                  </p>
                  <h2 id={`${chapter.stepId}-heading`} tabIndex={-1}>
                    {guidance.title}
                  </h2>
                  <p>{guidance.question}</p>
                </header>
                <div className="learning-note">
                  <h3>L’idée en clair</h3>
                  <p>{guidance.intuition}</p>
                </div>
                <div className="learning-note">
                  <h3>Un exemple, pas à pas</h3>
                  <p>{guidance.example}</p>
                </div>
                <div className="experiment-label">
                  <FlaskConical size={16} aria-hidden="true" /> À vous d’expérimenter
                </div>
                <p className="mb-4 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
                  {guidance.experiment}
                </p>
                {/* Chapter-matched Interactive Visualization */}
                {chapter.stepId === "step-cpu-bytes" && shown && <Vis01CpuMemory />}
                {chapter.stepId === "step-virtual-segments" && shown && <Vis02VirtualMemory />}
                {chapter.stepId === "step-call-stack-abi" && shown && <Vis03CallStack />}
                {chapter.stepId === "step-pointers-dangling" && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                        Observation guidée sur la pile : alias et données résiduelles
                      </CardTitle>
                      <CardDescription>
                        Utilisez l&apos;onglet <strong>Pointeur pendant (Dangling)</strong> du
                        simulateur{" "}
                        <button
                          type="button"
                          onClick={() => selectChapter("step-call-stack-abi")}
                          className="underline text-primary min-h-11"
                        >
                          Ouvrir le laboratoire de la pile
                        </button>{" "}
                        pour observer comment une nouvelle trame peut réutiliser la zone contenant
                        la valeur pointée à <code className="font-mono">0x7FFF0FC0</code>.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
                {chapter.stepId === "step-heap-allocators" && shown && <Vis04HeapAllocator />}
                {chapter.stepId === "step-models-uaf-reality" && shown && (
                  <>
                    <Vis05MemoryModels />
                    <Card data-testid="gdb-compiler-reality-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Terminal className="h-4 w-4 text-primary" aria-hidden="true" />
                          Trace réelle comparée : compilateur (
                          <code className="font-mono">-O0</code> vs{" "}
                          <code className="font-mono">-O2</code>) &amp; GDB
                        </CardTitle>
                        <CardDescription>
                          Comparez l&apos;image pédagogique (trame complète en RAM) avec la réalité
                          d&apos;un binaire optimisé observée dans Compiler Explorer / GDB en
                          lecture seule.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 text-xs md:grid-cols-2">
                        <div className="min-w-0 space-y-1.5 rounded-lg border bg-muted/40 p-3 font-mono">
                          <div className="font-semibold text-foreground">
                            Sans optimisation (gcc -O0)
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                            {`sub    rsp, 16
mov    DWORD PTR [rbp-4], 42   ; variable locale stockée sur la pile
mov    eax, DWORD PTR [rbp-4]  ; relue depuis la RAM
(gdb) x/4bx $rbp-4
0x7fffffffe3fc: 0x2a 0x00 0x00 0x00   ; little-endian`}
                          </pre>
                        </div>
                        <div className="min-w-0 space-y-1.5 rounded-lg border border-primary/40 bg-primary/5 p-3 font-mono">
                          <div className="font-semibold text-foreground">Optimisé (gcc -O2)</div>
                          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                            {`mov    eax, 42                 ; constante pliée directement en registre
ret                            ; aucune trame pile ni adresse &x en RAM !
; Si vous prenez &x en C mais provoquez un UB, le compilateur peut même
; supprimer une branche jugée impossible.`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Chapter Concept Exercises */}
                <details className="mt-5 text-xs text-muted-foreground">
                  <summary className="py-2">Ce que ce modèle simplifie</summary>
                  <p className="max-w-[72ch] py-3 leading-relaxed">{guidance.limit}</p>
                </details>
                <div className="exercise-section">
                  <h3 className="exercise-section-title">
                    <CheckCircle2 size={19} className="text-primary" aria-hidden="true" /> Faites le
                    point
                  </h3>
                  <p>
                    Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si
                    vous bloquez.
                  </p>
                  <div className="grid gap-4">
                    {chapter.exerciseIds.map((exId) => {
                      const found = exerciseById.get(exId);
                      if (!found) return null;
                      return (
                        <ExerciseCard
                          key={found.ex.id}
                          exercise={found.ex}
                          index={found.idx}
                          onResult={handleResult}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="chapter-takeaway">
                  <h3>À emporter</h3>
                  <p>{guidance.takeaway}</p>
                </div>
              </section>
            );
          })}
        </div>

        {activeFilter !== "all" && (
          <div className="chapter-pagination">
            <button
              disabled={activeIndex <= 0}
              onClick={() =>
                selectChapter(CHAPTER_METADATA[activeIndex - 1]?.stepId ?? "step-cpu-bytes")
              }
            >
              <ArrowLeft size={15} aria-hidden="true" /> Précédent
            </button>
            <span>
              {activeIndex + 1} / {CHAPTER_METADATA.length}
            </span>
            <button
              disabled={activeIndex >= CHAPTER_METADATA.length - 1}
              onClick={() =>
                selectChapter(
                  CHAPTER_METADATA[activeIndex + 1]?.stepId ?? "step-models-uaf-reality",
                )
              }
            >
              Chapitre suivant <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        )}
        {/* Cumulative Mastery Assessments */}
        {(activeFilter === "all" || activeFilter === "step-models-uaf-reality") &&
          lesson.assessments &&
          lesson.assessments.length > 0 && (
            <div className="border-t pt-6">
              <AssessmentRunner
                assessments={lesson.assessments}
                exercises={lesson.exercises}
                scores={scores}
                onExerciseNavigate={revisitExercise}
              />
            </div>
          )}
      </div>
    </div>
  );
}

export type { LessonManifest };
