"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { ExerciseCard } from "@cyber-school/exercises";
import type { LessonManifest } from "@cyber-school/lesson-runtime";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cyber-school/ui";

export interface LessonComponentProps {
  lesson: LessonManifest;
}

export function DefaultLessonExperience({ lesson }: LessonComponentProps) {
  const [scores, setScores] = React.useState<Record<string, boolean>>({});

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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progression guidée de la leçon</CardTitle>
          <CardDescription>{lesson.mediumJustification}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            {lesson.steps.map((step) => (
              <li
                key={step.id}
                className="rounded-lg border border-border bg-secondary/30 px-4 py-3"
              >
                <div className="font-semibold text-foreground">{step.title}</div>
                <p className="mt-1 text-muted-foreground">{step.summary}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <section aria-labelledby="exercises-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="exercises-heading" className="text-xl font-semibold tracking-tight">
            Exercices de compréhension et de raisonnement
          </h2>
          <Badge
            data-testid="exercises-score-badge"
            variant={solvedCount === lesson.exercises.length ? "success" : "secondary"}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {solvedCount} / {lesson.exercises.length} validés
          </Badge>
        </div>
        <div className="grid gap-4">
          {lesson.exercises.map((exercise, idx) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={idx}
              onResult={handleResult}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
