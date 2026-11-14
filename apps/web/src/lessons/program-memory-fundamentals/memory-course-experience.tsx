"use client";

import * as React from "react";
import { CheckCircle2, Cpu, Layers, Terminal } from "lucide-react";
import { AssessmentRunner, ExerciseCard } from "@cyber-school/exercises";
import type { LessonManifest } from "@cyber-school/lesson-runtime";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cyber-school/ui";
import type { LessonComponentProps } from "@/components/default-lesson-experience";
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
  const [activeFilter, setActiveFilter] = React.useState<ChapterFilter>("all");

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

  const visibleChapters =
    activeFilter === "all"
      ? CHAPTER_METADATA
      : CHAPTER_METADATA.filter((ch) => ch.stepId === activeFilter);

  return (
    <div className="min-w-0 space-y-8 overflow-x-clip" data-testid="memory-course-experience">
      {/* Course Progress & Chapter Filter Bar */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">
                Parcours progressif en 6 chapitres &amp; 5 simulateurs interactifs
              </CardTitle>
            </div>
            <Badge
              data-testid="exercises-score-badge"
              variant={solvedCount === lesson.exercises.length ? "success" : "secondary"}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {solvedCount} / {lesson.exercises.length} exercices validés
            </Badge>
          </div>
          <CardDescription>{lesson.mediumJustification}</CardDescription>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par chapitre">
            <Button
              type="button"
              size="sm"
              variant={activeFilter === "all" ? "default" : "outline"}
              data-testid="chapter-filter-all"
              onClick={() => setActiveFilter("all")}
            >
              Tous les chapitres ({lesson.steps.length})
            </Button>
            {CHAPTER_METADATA.map((chapter) => (
              <Button
                key={chapter.stepId}
                type="button"
                size="sm"
                variant={activeFilter === chapter.stepId ? "default" : "outline"}
                data-testid={`chapter-filter-${chapter.stepId}`}
                onClick={() => setActiveFilter(chapter.stepId)}
              >
                {chapter.badge}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Progressive Chapters */}
      <div className="space-y-10">
        {visibleChapters.map((chapter) => {
          const step = stepById.get(chapter.stepId);
          if (!step) return null;

          return (
            <section
              key={chapter.stepId}
              id={chapter.stepId}
              aria-labelledby={`${chapter.stepId}-heading`}
              className="space-y-5 scroll-mt-16"
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

              {/* Chapter-matched Interactive Visualization */}
              {chapter.stepId === "step-cpu-bytes" && <Vis01CpuMemory />}
              {chapter.stepId === "step-virtual-segments" && <Vis02VirtualMemory />}
              {chapter.stepId === "step-call-stack-abi" && <Vis03CallStack />}
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
                      <a href="#step-call-stack-abi" className="underline">
                        VIS-03
                      </a>{" "}
                      ci-dessus pour vérifier comment la trame suivante écrase silencieusement la
                      valeur pointée à <code className="font-mono">0x7FFF0FC0</code>.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
              {chapter.stepId === "step-heap-allocators" && <Vis04HeapAllocator />}
              {chapter.stepId === "step-models-uaf-reality" && (
                <>
                  <Vis05MemoryModels />
                  <Card data-testid="gdb-compiler-reality-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Terminal className="h-4 w-4 text-primary" aria-hidden="true" />
                        Trace réelle comparée : compilateur (<code className="font-mono">
                          -O0
                        </code>{" "}
                        vs <code className="font-mono">-O2</code>) &amp; GDB
                      </CardTitle>
                      <CardDescription>
                        Comparez l&apos;image pédagogique (trame complète en RAM) avec la réalité
                        d&apos;un binaire optimisé observée dans Compiler Explorer / GDB en lecture
                        seule.
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
            </section>
          );
        })}
      </div>

      {/* Cumulative Mastery Assessments */}
      {lesson.assessments && lesson.assessments.length > 0 && (
        <div className="border-t pt-6">
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

export type { LessonManifest };
