"use client";

import * as React from "react";
import { CheckCircle2, Compass, Layers } from "lucide-react";
import { AssessmentRunner, ExerciseCard } from "@cyber-school/exercises";
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle } from "@cyber-school/ui";
import type { LessonComponentProps } from "@/components/default-lesson-experience";
import { Vis01CausalConfounder } from "./components/vis-01-causal-confounder";
import { Vis02CounterexampleFalsifier } from "./components/vis-02-counterexample-falsifier";

interface ChapterMeta {
  stepId: string;
  badge: string;
  exerciseIds: string[];
}

const CHAPTER_METADATA: ChapterMeta[] = [
  {
    stepId: "step-observation-hypothesis",
    badge: "Bloc 1 · Observation & Falsifiabilité (TC00.001–003)",
    exerciseIds: ["ex-tc00-01", "ex-tc00-02"],
  },
  {
    stepId: "step-controls-confounders",
    badge: "Bloc 2 · Variables contrôlées & Confondant Z (TC00.004–005)",
    exerciseIds: ["ex-tc00-04"],
  },
  {
    stepId: "step-causal-vs-correlation",
    badge: "Bloc 3 · Chaîne causale vs Corrélation (TC00.006–007)",
    exerciseIds: ["ex-tc00-03", "ex-tc00-05"],
  },
  {
    stepId: "step-minimal-counterexample",
    badge: "Bloc 4 · Contre-exemple minimal (TC00.008)",
    exerciseIds: ["ex-tc00-06"],
  },
];

export function ReasoningCourseExperience({ lesson }: LessonComponentProps) {
  const [scores, setScores] = React.useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = React.useState<string>("all");

  function handleResult(exerciseId: string, correct: boolean | null) {
    setScores((prev) => {
      const next = { ...prev };
      if (correct === null) delete next[exerciseId];
      else next[exerciseId] = correct;
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

  const visibleChapters =
    activeFilter === "all"
      ? CHAPTER_METADATA
      : CHAPTER_METADATA.filter((ch) => ch.stepId === activeFilter);

  return (
    <div className="min-w-0 space-y-8 overflow-x-clip" data-testid="reasoning-course-experience">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">
                Unité TC-00.1 · Logique, causalité et réfutation (8 micro-leçons)
              </CardTitle>
            </div>
            <Badge
              data-testid="reasoning-score-badge"
              variant={solvedCount === lesson.exercises.length ? "success" : "secondary"}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {solvedCount} / {lesson.exercises.length} exercices validés
            </Badge>
          </div>
          <CardDescription>{lesson.mediumJustification}</CardDescription>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filtrer par bloc pédagogique"
          >
            <Button
              type="button"
              size="sm"
              variant={activeFilter === "all" ? "default" : "outline"}
              data-testid="reasoning-filter-all"
              onClick={() => setActiveFilter("all")}
            >
              Tous les blocs ({lesson.steps.length})
            </Button>
            {CHAPTER_METADATA.map((chapter) => (
              <Button
                key={chapter.stepId}
                type="button"
                size="sm"
                className="h-auto whitespace-normal py-1.5 text-left"
                variant={activeFilter === chapter.stepId ? "default" : "outline"}
                data-testid={`reasoning-filter-${chapter.stepId}`}
                onClick={() => setActiveFilter(chapter.stepId)}
              >
                {chapter.badge}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="min-w-0 space-y-10">
        {visibleChapters.map((chapter) => {
          const step = stepById.get(chapter.stepId);
          if (!step) return null;

          return (
            <section
              key={chapter.stepId}
              id={chapter.stepId}
              aria-labelledby={`${chapter.stepId}-heading`}
              className="min-w-0 space-y-5 scroll-mt-16"
            >
              <div className="space-y-2 border-l-4 border-primary pl-4">
                <Badge variant="outline" className="font-mono text-xs">
                  {chapter.badge}
                </Badge>
                <h2 id={`${chapter.stepId}-heading`} className="text-2xl font-bold tracking-tight">
                  {step.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.summary}</p>
                <p className="text-xs font-medium text-primary">
                  Focus visuel : {step.visualFocus}
                </p>
              </div>

              {chapter.stepId === "step-controls-confounders" && <Vis01CausalConfounder />}
              {chapter.stepId === "step-causal-vs-correlation" && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                      Intervention contrôlée vs Observation passive
                    </CardTitle>
                    <CardDescription>
                      Comparez les étapes 2 et 4 de{" "}
                      <a href="#step-controls-confounders" className="underline">
                        VIS-01
                      </a>{" "}
                      : observer <code className="font-mono">P(Y | X=1)</code> donne 410 alertes/h,
                      mais forcer <code className="font-mono">do(X = OFF)</code> tout en gardant Z
                      laisse 408 alertes/h.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
              {chapter.stepId === "step-minimal-counterexample" && <Vis02CounterexampleFalsifier />}

              <div className="grid min-w-0 grid-cols-1 gap-4">
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
            </section>
          );
        })}
      </div>

      {lesson.assessments && lesson.assessments.length > 0 && (
        <div className="min-w-0 border-t pt-6">
          <AssessmentRunner
            assessments={lesson.assessments}
            exercises={lesson.exercises}
            scores={scores}
          />
        </div>
      )}
    </div>
  );
}
