"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Compass, RotateCcw, Target } from "lucide-react";
import { MotionStepPanel } from "@cyber-school/animations";
import type { CalibratorQuestion, TopologyNodeView } from "@/lib/parcours/parcours-pages";

export interface ParcoursCalibratorProps {
  questions: CalibratorQuestion[];
  nodes: TopologyNodeView[];
  onFocusNode: (nodeId: string, scrollToGraph?: boolean) => void;
  onHighlightNodesChange: (nodeIds: string[]) => void;
}

export function ParcoursCalibrator({
  questions,
  nodes,
  onFocusNode,
  onHighlightNodesChange,
}: ParcoursCalibratorProps) {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [completed, setCompleted] = React.useState(false);

  const nodeTitleMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const node of nodes) {
      map.set(node.id, node.title);
    }
    return map;
  }, [nodes]);

  const currentQuestion = questions[stepIndex] ?? questions[0];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const selectedOption = currentQuestion?.options.find((option) => option.id === selectedOptionId);

  const diagnostics = React.useMemo(() => {
    const targetIds: string[] = [];
    let masteredCount = 0;

    for (const q of questions) {
      const picked = q.options.find((opt) => opt.id === answers[q.id]);
      if (picked?.mastered) {
        masteredCount += 1;
      } else if (picked) {
        targetIds.push(q.targetNodeId);
      }
    }

    if (targetIds.length === 0 && nodes[0]) {
      targetIds.push(nodes[0].id);
    }

    return {
      masteredCount,
      total: questions.length,
      recommendedIds: Array.from(new Set(targetIds)),
    };
  }, [answers, nodes, questions]);

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(nextAnswers);

    const highlighted: string[] = [];
    for (const q of questions) {
      const opt = q.options.find((item) => item.id === nextAnswers[q.id]);
      if (opt && !opt.mastered) {
        highlighted.push(q.targetNodeId);
      }
    }
    onHighlightNodesChange(Array.from(new Set(highlighted)));
  };

  const handleNext = () => {
    if (stepIndex + 1 < questions.length) {
      setStepIndex(stepIndex + 1);
      return;
    }
    setCompleted(true);
    const firstTarget = diagnostics.recommendedIds[0];
    if (firstTarget) {
      onFocusNode(firstTarget, false);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setAnswers({});
    setCompleted(false);
    onHighlightNodesChange([]);
  };

  if (!currentQuestion) return null;

  const progressPercent = completed
    ? 100
    : Math.round(((stepIndex + (selectedOption ? 1 : 0)) / questions.length) * 100);

  return (
    <section
      id="parcours-positionnement"
      aria-labelledby="parcours-calibrator-heading"
      className="parcours-studio-section"
      data-testid="parcours-calibrator"
    >
      <div className="parcours-section-head">
        <div>
          <p className="parcours-eyebrow">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Positionnement initial · {questions.length} vérifications rapides</span>
          </p>
          <h2 id="parcours-calibrator-heading" className="parcours-section-title">
            Où démarre votre point de bascule ?
          </h2>
          <p className="parcours-section-lead">
            Répondez une question à la fois : le calibrateur éclaire directement sur la carte
            topologique le module prioritaire à ouvrir.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="parcours-ghost-link"
          data-testid="calibrator-reset-btn"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Réinitialiser</span>
        </button>
      </div>

      <div className="parcours-calibrator-shell">
        <div className="parcours-calibrator-progress-row">
          <div className="parcours-calibrator-steps">
            {questions.map((q, index) => {
              const answered = Boolean(answers[q.id]);
              const active = !completed && index === stepIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCompleted(false);
                    setStepIndex(index);
                  }}
                  aria-label={`Question ${index + 1} : ${q.topic}`}
                  className={`parcours-step-pill ${active ? "is-active" : ""} ${answered ? "is-answered" : ""}`}
                >
                  <span>0{index + 1}</span>
                  <span className="hidden sm:inline">{q.topic}</span>
                </button>
              );
            })}
          </div>
          <span className="parcours-calibrator-pct">{progressPercent}%</span>
        </div>

        <div className="parcours-progress-track" aria-hidden="true">
          <div className="parcours-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {completed ? (
          <MotionStepPanel stepKey="calibrator-summary">
            <div className="parcours-calibrator-summary" data-testid="calibrator-result">
              <div className="parcours-calibrator-score">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>
                  Bilan : {diagnostics.masteredCount}/{diagnostics.total} déclics déjà acquis
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Point d&apos;entrée conseillé sur la topologie :{" "}
                <strong className="text-foreground">
                  {diagnostics.recommendedIds.map((id) => nodeTitleMap.get(id) ?? id).join(" · ")}
                </strong>
                .
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                {diagnostics.recommendedIds.map((nodeId) => (
                  <button
                    key={nodeId}
                    type="button"
                    onClick={() => onFocusNode(nodeId, true)}
                    className="parcours-primary-btn"
                    data-testid={`calibrator-focus-${nodeId}`}
                  >
                    <Target className="h-4 w-4" aria-hidden="true" />
                    <span>Inspecter {nodeTitleMap.get(nodeId) ?? nodeId}</span>
                  </button>
                ))}
              </div>
            </div>
          </MotionStepPanel>
        ) : (
          <MotionStepPanel stepKey={currentQuestion.id}>
            <div className="parcours-question-stage">
              <div className="parcours-question-header">
                <span className="parcours-stage-tag">{currentQuestion.topic}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  Question {stepIndex + 1} / {questions.length}
                </span>
              </div>

              <h3 className="parcours-question-prompt">{currentQuestion.prompt}</h3>

              <div
                className="parcours-options-grid"
                role="radiogroup"
                aria-label={currentQuestion.topic}
              >
                {currentQuestion.options.map((option) => {
                  const isPicked = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      data-testid={`calibrator-option-${option.id}`}
                      onClick={() => handleSelectOption(option.id)}
                      className={`parcours-option-btn ${isPicked ? "is-picked" : ""} ${
                        isPicked ? (option.mastered ? "is-mastered" : "is-target") : ""
                      }`}
                    >
                      <span className="parcours-option-radio" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOption ? (
                <div
                  className="parcours-calibrator-feedback"
                  role="status"
                  data-testid="calibrator-feedback"
                >
                  <p className="text-sm text-foreground">{selectedOption.explanation}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onFocusNode(currentQuestion.targetNodeId, true)}
                      className="parcours-inline-jump"
                    >
                      <Target className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        Voir sur la carte :{" "}
                        {nodeTitleMap.get(currentQuestion.targetNodeId) ??
                          currentQuestion.targetNodeId}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="parcours-primary-btn"
                      data-testid="calibrator-next-btn"
                    >
                      <span>
                        {stepIndex + 1 < questions.length
                          ? "Question suivante"
                          : "Afficher mon point d'entrée"}
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </MotionStepPanel>
        )}
      </div>
    </section>
  );
}
