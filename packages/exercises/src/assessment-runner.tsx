"use client";

import * as React from "react";
import { Award, CheckCircle2, ClipboardCheck, ShieldAlert } from "lucide-react";
import type { AssessmentBlueprint, ExerciseDefinition } from "@cyber-school/lesson-runtime";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  cn,
} from "@cyber-school/ui";

export interface AssessmentRunnerProps {
  assessments: AssessmentBlueprint[];
  exercises: ExerciseDefinition[];
  scores: Record<string, boolean>;
  onExerciseNavigate?: (exerciseId: string) => void;
}

/**
 * Evaluates cumulative multi-concept progress from completed lesson exercises
 * against each blueprint's passing threshold without duplicating state.
 */
export function AssessmentRunner({
  assessments,
  exercises,
  scores,
  onExerciseNavigate,
}: AssessmentRunnerProps) {
  if (assessments.length === 0) return null;

  return (
    <section
      aria-labelledby="cumulative-assessments-heading"
      data-testid="assessment-runner"
      className="min-w-0 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="cumulative-assessments-heading" className="text-xl font-semibold tracking-tight">
            Évaluations cumulatives par module
          </h2>
          <p className="text-sm text-muted-foreground">
            Les seuils de maîtrise sont calculés dynamiquement à partir de vos réponses validées aux
            exercices correspondants.
          </p>
        </div>
        <Badge variant="outline">
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {assessments.length} jalon(s) cumulatifs
        </Badge>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        {assessments.map((assessment) => {
          const total = assessment.exerciseIds.length;
          const answeredCount = assessment.exerciseIds.filter(
            (id) => scores[id] !== undefined,
          ).length;
          const correctCount = assessment.exerciseIds.filter((id) => scores[id] === true).length;
          const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
          const allAnswered = answeredCount === total && total > 0;
          const passed = allAnswered && scorePercent >= assessment.passingScorePercent;

          return (
            <Card
              key={assessment.id}
              data-testid={`assessment-card-${assessment.id}`}
              className="min-w-0"
            >
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{assessment.title}</CardTitle>
                  <Badge variant={passed ? "success" : allAnswered ? "warning" : "outline"}>
                    {passed ? (
                      <>
                        <Award className="h-3.5 w-3.5" aria-hidden="true" />
                        Maîtrisé ({scorePercent}%)
                      </>
                    ) : allAnswered ? (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />À consolider (
                        {scorePercent}%)
                      </>
                    ) : (
                      `${answeredCount} / ${total} traités`
                    )}
                  </Badge>
                </div>
                <CardDescription>
                  Seuil requis : {assessment.passingScorePercent}% · {correctCount} / {total}{" "}
                  réponse(s) exacte(s)
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <Progress
                  value={scorePercent}
                  aria-label={`Score de ${assessment.title} : ${scorePercent}%`}
                />

                <p className="text-xs text-muted-foreground">
                  {assessment.conceptIds.length} notions mises en pratique. Retrouvez ci-dessous les
                  questions à consolider.
                </p>

                <ul className="space-y-1.5 text-xs">
                  {assessment.exerciseIds.map((exId) => {
                    const ex = exercises.find((entry) => entry.id === exId);
                    const state = scores[exId];
                    return (
                      <li key={exId}>
                        <a
                          href={`#exercise-${exId}`}
                          onClick={
                            onExerciseNavigate
                              ? (event) => {
                                  event.preventDefault();
                                  onExerciseNavigate(exId);
                                }
                              : undefined
                          }
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            state === true
                              ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                              : state === false
                                ? "border-rose-500/40 bg-rose-500/5 text-foreground"
                                : "border-border bg-secondary/20 text-muted-foreground",
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {ex?.prompt ?? exId}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px]">
                            {state === true ? (
                              <>
                                <CheckCircle2
                                  className="h-3.5 w-3.5 text-emerald-400"
                                  aria-hidden="true"
                                />
                                Exact
                              </>
                            ) : state === false ? (
                              "À revoir"
                            ) : (
                              "En attente"
                            )}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
