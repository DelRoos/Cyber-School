"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import type { ExerciseDefinition } from "@cyber-school/lesson-runtime";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@cyber-school/ui";

export interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  index?: number;
  onResult?: (exerciseId: string, correct: boolean | null) => void;
}

export function ExerciseCard({ exercise, index, onResult }: ExerciseCardProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedZoneIds, setSelectedZoneIds] = React.useState<string[]>([]);
  const [orderIds, setOrderIds] = React.useState<string[]>(() =>
    exercise.kind === "sequence-order" ? exercise.items.map((item) => item.id) : [],
  );
  const [submitted, setSubmitted] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const isChoiceExercise =
    exercise.kind === "multiple-choice" || exercise.kind === "state-prediction";
  const isDiagramProbe = exercise.kind === "diagram-probe";

  const evaluateCorrectness = React.useCallback((): boolean => {
    if (isChoiceExercise) {
      return selectedId === exercise.correctOptionId;
    }
    if (isDiagramProbe) {
      if (selectedZoneIds.length !== exercise.correctZoneIds.length) return false;
      const picked = new Set(selectedZoneIds);
      return exercise.correctZoneIds.every((id) => picked.has(id));
    }
    if (exercise.kind === "sequence-order") {
      return (
        orderIds.length === exercise.expectedOrder.length &&
        orderIds.every((id, idx) => id === exercise.expectedOrder[idx])
      );
    }
    return false;
  }, [exercise, isChoiceExercise, isDiagramProbe, orderIds, selectedId, selectedZoneIds]);

  const isCorrect = React.useMemo(() => {
    if (!submitted) return false;
    return evaluateCorrectness();
  }, [evaluateCorrectness, submitted]);

  const selectedOption = isChoiceExercise
    ? exercise.options.find((opt) => opt.id === selectedId)
    : undefined;

  const selectedZones = isDiagramProbe
    ? exercise.zones.filter((zone) => selectedZoneIds.includes(zone.id))
    : [];

  function handleSubmit() {
    if (isChoiceExercise && !selectedId) return;
    if (isDiagramProbe && selectedZoneIds.length === 0) return;
    setSubmitted(true);
    onResult?.(exercise.id, evaluateCorrectness());
  }

  function handleReset() {
    setSubmitted(false);
    setSelectedId(null);
    setSelectedZoneIds([]);
    if (exercise.kind === "sequence-order") {
      setOrderIds(exercise.items.map((item) => item.id));
    }
    onResult?.(exercise.id, null);
  }

  function handleSelectOption(optionId: string) {
    setSelectedId(optionId);
    if (submitted) {
      setSubmitted(false);
      onResult?.(exercise.id, null);
    }
  }

  function handleToggleZone(zoneId: string) {
    if (!isDiagramProbe) return;
    setSelectedZoneIds((prev) => {
      if (!exercise.allowMultiple) {
        return [zoneId];
      }
      return prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId];
    });
    if (submitted) {
      setSubmitted(false);
      onResult?.(exercise.id, null);
    }
  }

  function moveItem(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= orderIds.length) return;
    const next = [...orderIds];
    const current = next[fromIndex];
    const target = next[toIndex];
    if (!current || !target) return;
    next[fromIndex] = target;
    next[toIndex] = current;
    setOrderIds(next);
    if (submitted) {
      setSubmitted(false);
      onResult?.(exercise.id, null);
    }
  }

  const kindLabel =
    exercise.kind === "state-prediction"
      ? "Prédiction d'état"
      : exercise.kind === "sequence-order"
        ? "Ordonnancement"
        : exercise.kind === "diagram-probe"
          ? "Inspection de schéma"
          : "Compréhension";

  return (
    <Card id={`exercise-${exercise.id}`} tabIndex={-1} data-testid={`exercise-card-${exercise.id}`}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="default">
            {index !== undefined ? `Exercice ${index + 1} · ` : ""}
            {kindLabel}
          </Badge>
          {exercise.hint ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint((prev) => !prev)}
              aria-expanded={showHint}
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              {showHint ? "Masquer l'indice" : "Afficher un indice"}
            </Button>
          ) : null}
        </div>
        <CardTitle className="mt-1 text-base sm:text-lg">{exercise.prompt}</CardTitle>
        {exercise.kind === "state-prediction" ? (
          <CardDescription className="rounded-lg border border-border bg-secondary/40 p-3 font-mono text-xs text-foreground">
            {exercise.scenario}
          </CardDescription>
        ) : null}
        {isDiagramProbe ? (
          <CardDescription className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-foreground">
            <span className="font-semibold">{exercise.diagramTitle}</span> —{" "}
            {exercise.diagramCaption}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {showHint && exercise.hint ? (
          <Alert variant="info">
            <AlertTitle>Indice</AlertTitle>
            <AlertDescription>{exercise.hint}</AlertDescription>
          </Alert>
        ) : null}

        {isChoiceExercise ? (
          <fieldset className="space-y-2">
            <legend className="sr-only">{exercise.prompt}</legend>
            {exercise.options.map((option) => {
              const isSelected = selectedId === option.id;
              const isOptionCorrect = submitted && option.id === exercise.correctOptionId;
              const isOptionWrong = submitted && isSelected && !isOptionCorrect;

              return (
                <label
                  key={option.id}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70",
                    isOptionCorrect && "border-emerald-500/70 bg-emerald-500/10",
                    isOptionWrong && "border-rose-500/70 bg-rose-500/10",
                  )}
                >
                  <input
                    type="radio"
                    name={`exercise-${exercise.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleSelectOption(option.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground",
                    )}
                  >
                    {isSelected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    ) : null}
                  </span>
                  <span className="leading-relaxed">{option.label}</span>
                </label>
              );
            })}
          </fieldset>
        ) : isDiagramProbe ? (
          <fieldset className="space-y-2">
            <legend className="sr-only">{exercise.diagramTitle}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {exercise.zones.map((zone) => {
                const isSelected = selectedZoneIds.includes(zone.id);
                const isZoneCorrect = submitted && exercise.correctZoneIds.includes(zone.id);
                const isZoneWrong =
                  submitted && isSelected && !exercise.correctZoneIds.includes(zone.id);

                return (
                  <label
                    key={zone.id}
                    className={cn(
                      "relative flex min-h-11 cursor-pointer flex-col gap-1 rounded-lg border px-3.5 py-3 text-left text-sm transition-colors motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70",
                      isZoneCorrect && "border-emerald-500/70 bg-emerald-500/10",
                      isZoneWrong && "border-rose-500/70 bg-rose-500/10",
                    )}
                  >
                    <input
                      type={exercise.allowMultiple ? "checkbox" : "radio"}
                      name={`probe-${exercise.id}`}
                      value={zone.id}
                      checked={isSelected}
                      onChange={() => handleToggleZone(zone.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {zone.region}
                      </span>
                      <Badge variant={isSelected ? "default" : "outline"} className="text-[10px]">
                        {isSelected ? "Sélectionné" : "Zone"}
                      </Badge>
                    </div>
                    <span className="font-medium leading-snug">{zone.label}</span>
                    {zone.detail ? (
                      <span className="font-mono text-xs text-muted-foreground">{zone.detail}</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <ol className="space-y-2" aria-label="Séquence à ordonner">
            {orderIds.map((id, idx) => {
              const item = exercise.items.find((entry) => entry.id === id);
              if (!item) return null;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Monter ${item.label}`}
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Descendre ${item.label}`}
                      disabled={idx === orderIds.length - 1}
                      onClick={() => moveItem(idx, 1)}
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            onClick={handleSubmit}
            disabled={
              (isChoiceExercise && !selectedId) || (isDiagramProbe && selectedZoneIds.length === 0)
            }
          >
            Vérifier ma réponse
          </Button>
          {submitted ? (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </Button>
          ) : null}
        </div>

        {submitted ? (
          <Alert variant={isCorrect ? "success" : "destructive"}>
            <div className="flex items-start gap-2.5">
              {isCorrect ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              )}
              <div className="space-y-1">
                <AlertTitle>
                  {isCorrect ? "Raisonnement exact" : "Pas encore — analysons pourquoi"}
                </AlertTitle>
                <AlertDescription>
                  {selectedOption ? (
                    <p className="mb-1 font-medium">{selectedOption.feedback}</p>
                  ) : null}
                  {selectedZones.length > 0 ? (
                    <ul className="mb-1 space-y-0.5 font-medium">
                      {selectedZones.map((zone) => (
                        <li key={zone.id}>
                          [{zone.region}] {zone.feedback}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p>{exercise.explanation}</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
