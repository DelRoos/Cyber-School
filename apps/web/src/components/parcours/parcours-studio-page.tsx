"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  GitBranch,
  Layers3,
  Search,
  X,
} from "lucide-react";
import { getStepDuration, useGsapScope, usePrefersReducedMotion } from "@cyber-school/animations";
import { Button, buttonVariants, cn } from "@cyber-school/ui";
import type { BespokeParcoursPageData, ParcoursNavTab } from "@/lib/parcours/parcours-pages";
import { TRANSVERSAL_FAMILIES, transversalFamily } from "@/lib/parcours/parcours-structure";

gsap.registerPlugin(ScrollTrigger);

export interface ParcoursStudioPageProps {
  page: BespokeParcoursPageData;
  navTabs: ParcoursNavTab[];
}

export function ParcoursStudioPage({ page, navTabs }: ParcoursStudioPageProps) {
  const isTransversal = page.slug === "v4-approfondissements";
  const defaultNodeId = page.nodes[0]?.id ?? "";
  const [expanded, setExpanded] = useState<string[]>(isTransversal ? [] : [defaultNodeId]);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const pageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isFoundation = page.slug === "v4-tronc-commun";
  const search = query
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
  const orderedNodes = isTransversal
    ? TRANSVERSAL_FAMILIES.flatMap((group) =>
        group.moduleIds.flatMap((id) => page.nodes.filter((node) => node.id === id)),
      )
    : page.nodes;
  const visibleNodes = orderedNodes.filter((node) => {
    const text = [node.title, ...node.microLessons.map((microLesson) => microLesson.title)]
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
    return (
      text.includes(search) &&
      (!isTransversal || family === "all" || transversalFamily(node.id)?.id === family)
    );
  });

  useEffect(() => {
    function revealAnchor() {
      const id = window.location.hash.replace("#noeud-", "");
      if (!page.nodes.some((node) => node.id === id)) return;
      setQuery("");
      setFamily("all");
      setExpanded((previous) => (previous.includes(id) ? previous : [...previous, id]));
    }
    revealAnchor();
    window.addEventListener("hashchange", revealAnchor);
    return () => window.removeEventListener("hashchange", revealAnchor);
  }, [page.nodes]);

  const visibleSignature = visibleNodes.map((node) => node.id).join(",");

  useEffect(() => {
    const root = pageRef.current;
    if (!root || reducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const surfaces = Array.from(root.querySelectorAll<HTMLElement>(".paths-spotlight"));
    const onPointerMove = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--card-mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--card-my", `${event.clientY - rect.top}px`);
    };

    surfaces.forEach((surface) =>
      surface.addEventListener("pointermove", onPointerMove, { passive: true }),
    );

    const magneticCleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((element) => {
      const strength = Number(element.dataset.magnetic || 0.14);
      const xTo = gsap.quickTo(element, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.35, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * strength;
        const y = (event.clientY - rect.top - rect.height / 2) * strength;
        xTo(Math.max(-7, Math.min(7, x)));
        yTo(Math.max(-7, Math.min(7, y)));
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      element.addEventListener("pointermove", onMove, { passive: true });
      element.addEventListener("pointerleave", onLeave);
      magneticCleanups.push(() => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => {
      surfaces.forEach((surface) => surface.removeEventListener("pointermove", onPointerMove));
      magneticCleanups.forEach((fn) => fn());
    };
  }, [reducedMotion, visibleSignature]);

  useGsapScope(pageRef, () => {
    if (reducedMotion) return;

    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".paths-detail-header h1", { y: 18, opacity: 0.85, duration: 0.5 })
      .from(".paths-detail-tagline", { y: 14, opacity: 0.85, duration: 0.45 }, "-=0.32")
      .from(
        ".paths-detail-meta > span",
        { y: 10, opacity: 0.85, stagger: 0.06, duration: 0.35 },
        "-=0.25",
      )
      .from(".paths-start-card", { y: 16, opacity: 0.85, duration: 0.45 }, "-=0.3");

    gsap.to(".paths-start-symbol svg", {
      rotation: 12,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.from(".paths-outcomes li", {
      x: -10,
      opacity: 0.85,
      stagger: 0.06,
      duration: 0.4,
      ease: "power2.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: ".paths-outcomes",
        start: "top 90%",
        once: true,
      },
    });

    gsap.from(".paths-next-grid a", {
      y: 14,
      opacity: 0.85,
      stagger: 0.08,
      duration: 0.45,
      ease: "power2.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: ".paths-next-grid",
        start: "top 92%",
        once: true,
      },
    });
  }, [reducedMotion, page.slug]);

  const expandedKey = expanded.join(",");

  useGsapScope(listRef, () => {
    if (reducedMotion || !expandedKey) return;
    const openContents = gsap.utils.toArray<HTMLElement>(
      ".paths-module.is-expanded .paths-module-content",
      listRef.current,
    );
    const openLessons = gsap.utils.toArray<HTMLElement>(
      ".paths-module.is-expanded .paths-chapters li",
      listRef.current,
    );
    if (openContents.length > 0) {
      gsap.fromTo(
        openContents,
        { y: -6, opacity: 0.7 },
        {
          y: 0,
          opacity: 1,
          duration: getStepDuration(0.24, reducedMotion),
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    }
    if (openLessons.length === 0) return;
    gsap.fromTo(
      openLessons.slice(0, 14),
      { opacity: 0.4, x: -8 },
      {
        opacity: 1,
        x: 0,
        duration: getStepDuration(0.25, reducedMotion),
        stagger: 0.018,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [expandedKey, reducedMotion]);

  useGsapScope(listRef, () => {
    if (reducedMotion || (!query && family === "all")) return;
    const rows = gsap.utils.toArray<HTMLElement>(".paths-module", listRef.current);
    if (rows.length === 0) return;
    gsap.fromTo(
      rows,
      { y: 8, opacity: 0.7 },
      {
        y: 0,
        opacity: 1,
        duration: getStepDuration(0.22, reducedMotion),
        stagger: 0.03,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [visibleSignature, query, family, reducedMotion]);

  function toggleModule(id: string) {
    setExpanded((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  }

  return (
    <div ref={pageRef} className="paths-page paths-detail" data-testid="parcours-studio-root">
      <nav className="paths-detail-nav" aria-label="Navigation des parcours">
        <Link href="/parcours" className="paths-back">
          <ArrowLeft size={16} aria-hidden="true" /> Tous les parcours
        </Link>
        <details
          className="paths-switcher"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary>
            Changer de parcours <ChevronDown size={15} aria-hidden="true" />
          </summary>
          <div className="paths-switcher-menu">
            {navTabs.map((track) => (
              <Link
                key={track.slug}
                href={`/parcours/${track.slug}`}
                aria-current={track.slug === page.slug ? "page" : undefined}
                data-testid={`parcours-nav-tab-${track.slug}`}
              >
                {track.shortTitle}
                {track.slug === page.slug && <Check size={15} aria-hidden="true" />}
              </Link>
            ))}
          </div>
        </details>
      </nav>

      <header className="paths-detail-header">
        <p className="paths-location">
          <span className="paths-live-dot" />{" "}
          {isFoundation
            ? "Les fondations"
            : isTransversal
              ? "Les compléments transversaux"
              : "Votre branche"}
        </p>
        <h1 data-testid="parcours-hero-title">{page.title}</h1>
        <p className="paths-detail-tagline">{page.tagline}</p>
        <div className="paths-detail-meta">
          <span>
            <Layers3 size={16} aria-hidden="true" /> {page.totalModules} modules
          </span>
          <span>
            <BookOpen size={16} aria-hidden="true" /> {page.totalMicroLessons} leçons
          </span>
          <span>Programme en construction</span>
        </div>
      </header>

      <div className="paths-detail-layout">
        <div className="paths-program-column">
          <section className="paths-outcomes" aria-labelledby="outcomes-title">
            <h2 id="outcomes-title">Ce que vous allez apprendre</h2>
            <ul>
              {page.useCases.map((useCase) => (
                <li key={useCase}>
                  <Check size={17} aria-hidden="true" />
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="programme" className="paths-program" aria-labelledby="program-title">
            <div className="paths-program-heading">
              <div>
                <p className="paths-section-context">
                  {isTransversal ? "À choisir selon le sujet travaillé" : "Une idée après l’autre"}
                </p>
                <h2 id="program-title">
                  {isTransversal ? "Les modules transversaux" : "Le programme"}
                </h2>
              </div>
              <Button
                variant="ghost"
                className="paths-expand-all"
                onClick={() =>
                  setExpanded(
                    expanded.length === page.nodes.length ? [] : page.nodes.map((node) => node.id),
                  )
                }
              >
                {expanded.length === page.nodes.length ? "Tout replier" : "Tout déplier"}
              </Button>
            </div>
            {isTransversal && (
              <div
                className="paths-family-filters"
                role="group"
                aria-label="Filtrer les compléments par thème"
              >
                {[{ id: "all", title: "Tous les thèmes" }, ...TRANSVERSAL_FAMILIES].map((group) => (
                  <Button
                    key={group.id}
                    variant="ghost"
                    className="paths-filter"
                    aria-pressed={family === group.id}
                    onClick={() => setFamily(group.id)}
                  >
                    {group.title}
                  </Button>
                ))}
              </div>
            )}
            <div className="paths-program-tools">
              <div className="paths-search">
                <Search size={17} aria-hidden="true" />
                <label className="sr-only" htmlFor="program-search">
                  Rechercher dans le programme
                </label>
                <input
                  id="program-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un sujet…"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Effacer la recherche"
                    onClick={() => setQuery("")}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <p className="paths-program-help" role="status">
              {query || family !== "all"
                ? `${visibleNodes.length} module${visibleNodes.length > 1 ? "s" : ""} affiché${visibleNodes.length > 1 ? "s" : ""}`
                : "Dépliez un module pour découvrir ses leçons."}
            </p>
            <div ref={listRef} className="paths-module-list">
              {visibleNodes.map((node) => {
                const isExpanded = expanded.includes(node.id);
                return (
                  <article
                    key={node.id}
                    id={`noeud-${node.id}`}
                    className={`paths-module paths-spotlight ${isExpanded ? "is-expanded" : ""}`}
                  >
                    <h3>
                      <button
                        type="button"
                        id={`module-button-${node.id}`}
                        aria-expanded={isExpanded}
                        aria-controls={`module-content-${node.id}`}
                        onClick={() => toggleModule(node.id)}
                        data-testid={`module-toggle-${node.id}`}
                      >
                        <span className="paths-module-number">
                          {isTransversal ? (
                            <GitBranch size={16} aria-hidden="true" />
                          ) : (
                            String(node.order).padStart(2, "0")
                          )}
                        </span>
                        <span className="paths-module-label">
                          <strong>{node.title}</strong>
                          <span>
                            {node.microLessonsCount} leçons
                            {isTransversal && (
                              <span className="paths-module-family">
                                {transversalFamily(node.id)?.title}
                              </span>
                            )}
                          </span>
                        </span>
                        <ChevronDown
                          size={19}
                          className="paths-module-chevron"
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    <div
                      id={`module-content-${node.id}`}
                      hidden={!isExpanded}
                      aria-labelledby={`module-button-${node.id}`}
                    >
                      <div className="paths-module-content">
                        {!isTransversal && (
                          <p className="paths-module-question">{node.mechanicalQuestion}</p>
                        )}
                        <ol className="paths-chapters">
                          {node.microLessons.map((microLesson, index) => (
                            <li key={microLesson.id}>
                              <span className="paths-chapter-index" aria-hidden="true">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {microLesson.id === "TC00.001" ? (
                                <Link
                                  href="/cours/observation-et-interpretation"
                                  data-testid="parcours-first-lesson-link"
                                >
                                  <span>
                                    {microLesson.title}
                                    <small>Première leçon · 20 min</small>
                                  </span>
                                  <span className="paths-chapter-action">
                                    <span>Ouvrir la leçon</span>
                                    <ArrowRight size={14} aria-hidden="true" />
                                  </span>
                                </Link>
                              ) : (
                                <div className="paths-planned-chapter">
                                  <span>{microLesson.title}</span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                        {isTransversal && node.relatedModules.length > 0 && (
                          <div className="paths-module-prereqs">
                            <span>Liens thématiques proposés</span>
                            <p>Des rapprochements par sujet, sans prérequis obligatoire ajouté.</p>
                            {node.relatedModules.map((related) => (
                              <Link key={related.href} href={related.href}>
                                {related.label}
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        )}
                        {!isTransversal && node.externalDeps.length > 0 && (
                          <div className="paths-module-prereqs">
                            <span>Pour préparer ce module</span>
                            {node.externalDeps.map((dependency) => (
                              <Link key={dependency.href} href={dependency.href}>
                                {dependency.label}
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
              {visibleNodes.length === 0 && (
                <div className="paths-empty">
                  <Search size={25} aria-hidden="true" />
                  <h3>Aucun module trouvé</h3>
                  <p>Essayez un autre sujet ou affichez le programme complet.</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setFamily("all");
                    }}
                  >
                    Afficher tout le programme
                  </Button>
                </div>
              )}
            </div>
            <Link
              href="/parcours"
              className="paths-full-catalog"
              data-testid="parcours-domain-catalog-link"
            >
              Retrouver la carte des parcours <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </section>

          {page.relatedComplements.length > 0 && (
            <section
              className="paths-related-complements"
              aria-labelledby="related-complements-title"
            >
              <p className="paths-section-context">Pour enrichir un acquis précis</p>
              <h2 id="related-complements-title">Les compléments liés à ce domaine</h2>
              <p>Des rapprochements thématiques proposés, à consulter au moment utile.</p>
              <ul>
                {page.relatedComplements.map((module) => (
                  <li key={module.href}>
                    <Link href={module.href}>
                      {module.title}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!isTransversal && (
            <section className="paths-practice" aria-labelledby="practice-title">
              <p className="paths-section-context">Du savoir au savoir-faire</p>
              <h2 id="practice-title">L’objectif : pouvoir l’expliquer.</h2>
              <p>
                Le programme prévoit des mises en pratique pour relier les notions et construire un
                raisonnement vérifiable.
              </p>
              {page.projects.map((project) => (
                <details key={project.title} className="paths-project paths-spotlight">
                  <summary>
                    <span>
                      <Compass size={18} aria-hidden="true" />
                      {project.title}
                    </span>
                    <ChevronDown size={17} aria-hidden="true" />
                  </summary>
                  <div>
                    <p>{project.scenario}</p>
                    <p>
                      <strong>Livrable attendu :</strong> {project.deliverable}
                    </p>
                    <span className="paths-project-planned">Projet prévu au programme</span>
                  </div>
                </details>
              ))}
            </section>
          )}
        </div>

        <aside className="paths-start-sidebar" aria-labelledby="start-title">
          <div className="paths-start-card paths-spotlight">
            <span className="paths-start-symbol">
              <Compass size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h2 id="start-title">
              {isFoundation
                ? "Votre premier pas"
                : isTransversal
                  ? "Selon vos besoins"
                  : "Préparez le terrain"}
            </h2>
            <p>
              {isFoundation
                ? "Commencez par observer, poser une hypothèse et la mettre à l’épreuve."
                : page.prerequisiteNote}
            </p>
            <dl className="paths-start-facts">
              <div>
                <dt>
                  <Layers3 size={15} aria-hidden="true" /> Programme
                </dt>
                <dd>{page.totalModules} modules</dd>
              </div>
              <div>
                <dt>
                  <BookOpen size={15} aria-hidden="true" /> Contenu
                </dt>
                <dd>{page.totalMicroLessons} leçons</dd>
              </div>
              <div>
                <dt>
                  <GitBranch size={15} aria-hidden="true" /> Progression
                </dt>
                <dd>{isTransversal ? "À la carte" : "Par prérequis"}</dd>
              </div>
            </dl>
            <a
              href="#programme"
              className={cn(buttonVariants({ size: "lg" }), "paths-primary paths-sheen")}
              data-magnetic="0.14"
              data-testid="parcours-start-lesson-btn"
            >
              {isTransversal ? "Explorer les modules" : "Explorer le programme"}{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <p className="paths-start-disclosure">
              Ce programme est consultable. Les pages des modules et leurs cours seront ajoutés
              progressivement.
            </p>
          </div>
          <div className="paths-prerequisite-note">
            <h3>
              {isFoundation
                ? "Vous partez de zéro ?"
                : isTransversal
                  ? "Comment les utiliser ?"
                  : "Avant de commencer"}
            </h3>
            <p>
              {isFoundation
                ? "Vous êtes au bon endroit. Chaque notion est introduite avant d’être utilisée. Avancez à votre rythme."
                : isTransversal
                  ? "Revenez au complément qui éclaire votre sujet. Les liens thématiques vous aident à le relier aux notions déjà étudiées."
                  : "Vérifiez vos bases avant d’aborder ce parcours."}
            </p>
            {!isFoundation && !isTransversal && (
              <Link href="/parcours/v4-tronc-commun">
                Explorer le tronc commun <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </aside>
      </div>

      <section className="paths-next" aria-labelledby="next-title">
        <div>
          <p className="paths-section-context">
            {isTransversal ? "Revenir à un domaine" : "Pour la suite"}
          </p>
          <h2 id="next-title">
            {isTransversal ? "Retrouver les branches." : "Continuez à tracer votre chemin."}
          </h2>
        </div>
        <div className="paths-next-grid">
          {(isTransversal
            ? navTabs
                .filter((track) => track.slug.startsWith("v4-branche-"))
                .map((track) => ({
                  slug: track.slug,
                  title: track.shortTitle,
                  reason: "Retrouver le programme et ses modules.",
                }))
            : page.nextTracks
          ).map((track) => (
            <Link key={track.slug} href={`/parcours/${track.slug}`} className="paths-spotlight">
              <span>
                <h3>{track.title}</h3>
                <p>{track.reason}</p>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
