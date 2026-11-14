"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { AssessmentRunner, ExerciseCard } from "@cyber-school/exercises";
import type { LessonComponentProps } from "@/components/default-lesson-experience";
import { chapterGuidance } from "./chapter-guidance";
import { Vis01CpuMemory } from "./components/vis-01-cpu-memory";
import { Vis02VirtualMemory } from "./components/vis-02-virtual-memory";
import { Vis03CallStack } from "./components/vis-03-call-stack";
import { Vis04HeapAllocator } from "./components/vis-04-heap-allocator";
import { Vis05MemoryModels } from "./components/vis-05-memory-models";
import { VisCompilerIllusion } from "./components/vis-compiler-illusion";
import { VisPointerDangling } from "./components/vis-pointer-dangling";

type ChapterFilter = "all" | string;

interface ChapterMeta {
  stepId: string;
  exerciseIds: string[];
}

const CHAPTER_METADATA: ChapterMeta[] = [
  { stepId: "step-cpu-bytes", exerciseIds: ["ex-mem-01", "ex-mem-02", "ex-mem-03"] },
  { stepId: "step-virtual-segments", exerciseIds: ["ex-mem-04", "ex-mem-05", "ex-mem-06"] },
  { stepId: "step-call-stack-abi", exerciseIds: ["ex-mem-07", "ex-mem-08", "ex-mem-11"] },
  { stepId: "step-pointers-dangling", exerciseIds: ["ex-mem-09", "ex-mem-10"] },
  { stepId: "step-heap-allocators", exerciseIds: ["ex-mem-12", "ex-mem-13"] },
  { stepId: "step-models-uaf-reality", exerciseIds: ["ex-mem-14", "ex-mem-15", "ex-mem-16"] },
];

export function MemoryCourseExperience({ lesson }: LessonComponentProps) {
  const [scores, setScores] = React.useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = React.useState<ChapterFilter>("step-cpu-bytes");
  const [focusRequest, setFocusRequest] = React.useState<{ id: string; seq: number } | null>(null);

  React.useEffect(() => {
    if (!focusRequest) return;
    const target = document.getElementById(focusRequest.id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [focusRequest]);

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
          <p>Manipulez d&apos;abord, déduisez ensuite.</p>
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
                  ~{chapterGuidance[chapter.stepId]?.minutes} min · {chapter.exerciseIds.length}{" "}
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
                {/* 1. Compact Motivating Question Header */}
                <header className="chapter-heading">
                  <p>
                    Chapitre {chapterIndex + 1} sur {CHAPTER_METADATA.length} · ~{guidance.minutes}{" "}
                    min
                  </p>
                  <h2 id={`${chapter.stepId}-heading`} tabIndex={-1}>
                    {guidance.title}
                  </h2>
                  <p>{guidance.question}</p>
                </header>

                {/* 2. Interactive Explorable Stage FIRST (Center Stage!) */}
                {chapter.stepId === "step-cpu-bytes" && shown && <Vis01CpuMemory />}
                {chapter.stepId === "step-virtual-segments" && shown && <Vis02VirtualMemory />}
                {chapter.stepId === "step-call-stack-abi" && shown && <Vis03CallStack />}
                {chapter.stepId === "step-pointers-dangling" && shown && <VisPointerDangling />}
                {chapter.stepId === "step-heap-allocators" && shown && <Vis04HeapAllocator />}
                {chapter.stepId === "step-models-uaf-reality" && shown && (
                  <div className="space-y-5">
                    <Vis05MemoryModels />
                    <VisCompilerIllusion />
                  </div>
                )}

                {/* 3. Concise Visual Intuition + Collapsible Real-World Nuance */}
                <div className="learning-note mt-5">
                  <h3>L&apos;intuition visuelle</h3>
                  <p>{guidance.intuition}</p>
                </div>

                <details className="mt-3 text-xs text-muted-foreground">
                  <summary className="py-1.5 font-medium">À retenir &amp; limite du modèle</summary>
                  <div className="space-y-2 py-2 leading-relaxed">
                    <p>
                      <strong className="text-foreground">Clé :</strong> {guidance.takeaway}
                    </p>
                    <p>
                      <strong className="text-foreground">Nuance matérielle :</strong>{" "}
                      {guidance.limit}
                    </p>
                  </div>
                </details>

                {/* 4. Interactive Checkpoints */}
                <div className="exercise-section">
                  <h3 className="exercise-section-title">
                    <CheckCircle2 size={19} className="text-primary" aria-hidden="true" /> Vérifiez
                    votre intuition
                  </h3>
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
