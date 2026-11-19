"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { Award, Check, Compass, ExternalLink, FlaskConical, ShieldCheck } from "lucide-react";
import {
  getStepDuration,
  MotionStepPanel,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import type { BespokeParcoursPageData, TopologyNodeView } from "@/lib/parcours/parcours-pages";

export interface ParcoursValidationStudioProps {
  page: BespokeParcoursPageData;
  onFocusNode: (nodeId: string, scrollToGraph?: boolean) => void;
}

type ValidationTabId = "projects" | "exams" | "next";

export function ParcoursValidationStudio({ page, onFocusNode }: ParcoursValidationStudioProps) {
  const [activeTab, setActiveTab] = React.useState<ValidationTabId>("projects");
  const gaugeRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const reducedMotion = usePrefersReducedMotion();

  const nodeTitleMap = React.useMemo(() => {
    const map = new Map<string, TopologyNodeView>();
    for (const node of page.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [page.nodes]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - page.masteryThresholdPercent / 100);

  useGsapScope(gaugeRef, () => {
    const arc = gaugeRef.current?.querySelector(".parcours-readiness-arc");
    if (!arc) return;
    if (reducedMotion) {
      gsap.set(arc, { strokeDashoffset: targetOffset });
      return;
    }
    gsap.fromTo(
      arc,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: targetOffset,
        duration: getStepDuration(0.85, reducedMotion),
        ease: "power2.out",
      },
    );
  }, [page.slug, targetOffset, circumference, reducedMotion]);

  const tabs: Array<{ id: ValidationTabId; label: string }> = [
    { id: "projects", label: "Mises en pratique" },
    { id: "exams", label: `Évaluation (${page.exams.length})` },
    { id: "next", label: "Suites & remédiation" },
  ];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      setActiveTab(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  return (
    <section
      id="parcours-validation"
      aria-labelledby="parcours-validation-heading"
      className="parcours-studio-section"
      data-testid="parcours-validation-section"
    >
      <div className="parcours-section-head">
        <div>
          <p className="parcours-eyebrow">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mises en pratique & critères de maîtrise</span>
          </p>
          <h2 id="parcours-validation-heading" className="parcours-section-title">
            Preuves demandées en fin de parcours
          </h2>
          <p className="parcours-section-lead">
            Chaque module prépare un livrable concret et vérifiable avant de passer à la suite.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Vues de validation du parcours"
          className="parcours-tablist"
        >
          {tabs.map((tab, index) => {
            const isSelected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                data-testid={`validation-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`parcours-tab-btn ${isSelected ? "is-selected" : ""}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="parcours-validation-grid">
        {/* Radial SVG readiness visual */}
        <div ref={gaugeRef} className="parcours-readiness-card">
          <div className="parcours-readiness-svg-wrap">
            <svg viewBox="0 0 112 112" className="h-28 w-28" aria-hidden="true">
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="rgba(162, 175, 164, 0.16)"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="#c8ed97"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={targetOffset}
                transform="rotate(-90 56 56)"
                className="parcours-readiness-arc"
              />
            </svg>
            <div className="parcours-readiness-center">
              <span className="parcours-readiness-pct">{page.masteryThresholdPercent}%</span>
              <span className="parcours-readiness-sub">seuil requis</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-foreground">Conditions de réussite</h3>
          <ul className="parcours-criteria-list">
            {page.passingCriteria.map((criterion) => (
              <li key={criterion}>
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Tab Panel */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="parcours-validation-panel"
        >
          <MotionStepPanel stepKey={activeTab}>
            {activeTab === "projects" ? (
              <div className="parcours-projects-grid">
                {page.projects.map((project) => (
                  <article key={project.title} className="parcours-project-card">
                    <div className="flex items-center justify-between gap-2">
                      <span className="parcours-stage-tag">
                        <FlaskConical className="mr-1 inline h-3 w-3" aria-hidden="true" />
                        Atelier ~{project.hours} h
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-foreground">{project.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{project.scenario}</p>
                    <p className="mt-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-xs text-foreground">
                      <strong className="text-primary">Livrable :</strong> {project.deliverable}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.nodeIds.map((nodeId) => {
                        const node = nodeTitleMap.get(nodeId);
                        if (!node) return null;
                        return (
                          <button
                            key={nodeId}
                            type="button"
                            onClick={() => onFocusNode(nodeId, true)}
                            className="parcours-remediation-chip"
                          >
                            {String(node.order).padStart(2, "0")} · {node.shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {activeTab === "exams" ? (
              <div className="parcours-projects-grid">
                {page.exams.map((exam) => (
                  <article key={exam.id} className="parcours-project-card">
                    <div className="flex items-center justify-between gap-2">
                      <span className="parcours-stage-tag">
                        <ShieldCheck className="mr-1 inline h-3 w-3" aria-hidden="true" />
                        {exam.id}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-foreground">{exam.title}</h3>
                    <ul className="parcours-criteria-list mt-3">
                      {exam.criteria.map((crit) => (
                        <li key={crit}>
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                    {exam.externalLabs.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {exam.externalLabs.map((lab) => (
                          <a
                            key={lab.url}
                            href={lab.url}
                            target="_blank"
                            rel="noreferrer"
                            className="parcours-remediation-chip"
                          >
                            <span>{lab.label}</span>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}

            {activeTab === "next" ? (
              <div className="parcours-projects-grid">
                {page.nextTracks.map((next) => (
                  <Link
                    key={next.slug}
                    href={`/parcours/${next.slug}`}
                    className="parcours-project-card group block transition-colors hover:border-primary/60"
                  >
                    <span className="parcours-stage-tag">
                      <Compass className="mr-1 inline h-3 w-3" aria-hidden="true" />
                      Suite recommandée
                    </span>
                    <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-primary">
                      {next.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{next.reason}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </MotionStepPanel>
        </div>
      </div>
    </section>
  );
}
