"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Cpu,
  Fingerprint,
  Globe2,
  Layers3,
  Network,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getStepDuration, useGsapScope, usePrefersReducedMotion } from "@cyber-school/animations";
import { Button, buttonVariants, cn } from "@cyber-school/ui";
import type { ParcoursCatalogTrack } from "@/lib/parcours/parcours-pages";
import { TransversalDirectory } from "./transversal-directory";

gsap.registerPlugin(ScrollTrigger);

const TRACK_PRESENTATION = {
  "v4-branche-a": {
    title: "Plateformes, Mobile, Fintech & IA",
    description:
      "Auditez là où les usages se créent : web, API, Android, iOS, AppSec/Cloud, paiements Mobile Money et IA.",
    tags: ["Web & API", "Android & iOS", "AppSec & Cloud", "Fintech & IA"],
    Icon: Code2,
    tone: "blue",
    category: "specialisation",
  },
  "v4-branche-b": {
    title: "Infrastructure & offensive",
    description:
      "Comprenez réseaux, Active Directory, Linux, assembleur, reverse logiciel/mobile, malwares et recherche de failles.",
    tags: ["Réseaux & Linux", "Active Directory", "Reverse & mobile", "Recherche & malwares"],
    Icon: Network,
    tone: "purple",
    category: "specialisation",
  },
  "v4-branche-c": {
    title: "Investigation & protection",
    description:
      "Remontez des traces aux faits : OSINT, fraudes, forensics disque/RAM/réseau, forensics mobile et anti-stalkerware.",
    tags: ["OSINT & Threat Intel", "Forensics OS & RAM", "Forensics mobile", "Anti-stalkerware"],
    Icon: Fingerprint,
    tone: "peach",
    category: "specialisation",
  },
  "v4-branche-d": {
    title: "Pratique professionnelle",
    description:
      "Cadrez une mission, produisez des preuves, encadrez un copilote IA et rendez vos conclusions exploitables.",
    tags: [
      "Contrats & missions",
      "Rapports & preuves",
      "IA copilote d’audit",
      "Gouvernance & qualité",
    ],
    Icon: ShieldCheck,
    tone: "green",
    category: "professional",
  },
} as const;

type TrackSlug = keyof typeof TRACK_PRESENTATION;
type Filter = "all" | "specialisation" | "professional";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

function FoundationsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGsapScope(mapRef, () => {
    if (reducedMotion) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    tl.fromTo(
      ".paths-map-signal",
      { y: 0, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: "power1.out" },
    )
      .to(".paths-map-step[data-stage='0']", {
        borderColor: "#c8ed97",
        backgroundColor: "#253424",
        duration: 0.35,
      })
      .to(".paths-map-signal", { y: 82, duration: 0.9, ease: "power1.inOut" })
      .to(".paths-map-step[data-stage='0']", {
        borderColor: "#42513a",
        backgroundColor: "#202b20",
        duration: 0.35,
      })
      .to(
        ".paths-map-step[data-stage='1']",
        {
          borderColor: "#c8ed97",
          backgroundColor: "#253424",
          duration: 0.35,
        },
        "<",
      )
      .to(".paths-map-signal", { y: 164, duration: 0.9, ease: "power1.inOut" })
      .to(".paths-map-step[data-stage='1']", {
        borderColor: "#42513a",
        backgroundColor: "#202b20",
        duration: 0.35,
      })
      .to(
        ".paths-map-step[data-stage='2']",
        {
          borderColor: "#c8ed97",
          backgroundColor: "#253424",
          duration: 0.35,
        },
        "<",
      )
      .to(".paths-map-signal", { y: 215, opacity: 0, duration: 0.45, ease: "power1.in" })
      .fromTo(
        ".paths-map-branches .paths-map-branch",
        { borderColor: "#3a4935" },
        {
          borderColor: "#c8ed97",
          stagger: 0.08,
          duration: 0.28,
          yoyo: true,
          repeat: 1,
        },
        "<",
      )
      .to(".paths-map-step[data-stage='2']", {
        borderColor: "#42513a",
        backgroundColor: "#202b20",
        duration: 0.35,
      });
  }, [reducedMotion]);

  const branchNodes = [
    { slug: "v4-branche-a", label: "Web, Mobile & IA", Icon: Code2, tone: "blue" },
    { slug: "v4-branche-b", label: "Infra & offensive", Icon: Network, tone: "purple" },
    { slug: "v4-branche-c", label: "Investigation", Icon: Fingerprint, tone: "peach" },
    { slug: "v4-branche-d", label: "Pratique pro", Icon: ShieldCheck, tone: "green" },
  ] as const;

  return (
    <div
      ref={mapRef}
      className="paths-foundations-map"
      aria-label="Des fondations vers votre spécialisation"
    >
      <p className="paths-map-caption">
        <span className="paths-live-dot" aria-hidden="true" />
        <span>Des fondations vers votre spécialisation</span>
      </p>
      <div className="paths-map-stages" aria-hidden="true">
        <span className="paths-map-signal" />
        <div className="paths-map-step" data-stage="0">
          <span className="paths-map-icon">
            <Compass size={20} />
          </span>
          <div>
            <strong>Raisonner</strong>
            <small>Observer, tester, prouver</small>
          </div>
          <span className="paths-map-step-number">01</span>
        </div>
        <div className="paths-map-step" data-stage="1">
          <span className="paths-map-icon">
            <Cpu size={20} />
          </span>
          <div>
            <strong>Comprendre la machine</strong>
            <small>Mémoire, CPU et systèmes</small>
          </div>
          <span className="paths-map-step-number">02</span>
        </div>
        <div className="paths-map-step" data-stage="2">
          <span className="paths-map-icon">
            <Globe2 size={20} />
          </span>
          <div>
            <strong>Relier les systèmes</strong>
            <small>Réseaux, Web et crypto</small>
          </div>
          <span className="paths-map-step-number">03</span>
        </div>
      </div>
      <div className="paths-map-branches" role="group" aria-label="Domaines de spécialisation">
        {branchNodes.map((branch) => {
          const BranchIcon = branch.Icon;
          return (
            <Link
              key={branch.slug}
              href={`/parcours/${branch.slug}`}
              className={`paths-map-branch paths-tone-${branch.tone}`}
            >
              <span className="paths-map-branch-icon">
                <BranchIcon size={13} aria-hidden="true" />
              </span>
              <span>{branch.label}</span>
            </Link>
          );
        })}
      </div>
      <p className="paths-map-end">Puis, choisissez votre terrain.</p>
    </div>
  );
}

export function ParcoursCatalog({ tracks }: { tracks: ParcoursCatalogTrack[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const foundation = tracks.find((track) => track.slug === "v4-tronc-commun");
  const transversal = tracks.find((track) => track.slug === "v4-approfondissements");
  // Derived results: https://react.dev/learn/choosing-the-state-structure
  const specialisations = tracks.filter((track) => track.slug in TRACK_PRESENTATION);
  const visibleTracks = useMemo(
    () =>
      specialisations.filter((track) => {
        const meta = TRACK_PRESENTATION[track.slug as TrackSlug];
        return (
          (filter === "all" || filter === meta.category) &&
          normalize(
            [track.title, track.tagline, ...track.topics, meta.title, ...meta.tags].join(" "),
          ).includes(normalize(query.trim()))
        );
      }),
    [filter, query, specialisations],
  );
  const hasFilters = Boolean(query || filter !== "all");
  const clearFilters = () => {
    setQuery("");
    setFilter("all");
    document.getElementById("track-search")?.focus();
  };
  const visibleTrackSignature = visibleTracks.map((t) => t.slug).join(",");

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
  }, [reducedMotion, visibleTrackSignature]);

  useGsapScope(pageRef, () => {
    if (reducedMotion) return;

    const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    introTl
      .from(".paths-intro h1", { y: 18, opacity: 0.85, duration: 0.55 })
      .from(".paths-intro-aside", { y: 14, opacity: 0.85, duration: 0.45 }, "-=0.35")
      .from(".paths-foundation", { y: 18, opacity: 0.85, duration: 0.55 }, "-=0.25");

    gsap.from(".paths-tracks-grid .paths-track", {
      y: 20,
      opacity: 0.85,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: ".paths-tracks-grid",
        start: "top 88%",
        once: true,
      },
    });

    gsap.from(".paths-complement-groups section", {
      y: 16,
      opacity: 0.85,
      stagger: 0.08,
      duration: 0.45,
      ease: "power2.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: ".paths-complement-groups",
        start: "top 90%",
        once: true,
      },
    });

    gsap.from(".paths-start-note", {
      y: 14,
      opacity: 0.85,
      duration: 0.45,
      ease: "power2.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: ".paths-start-note",
        start: "top 92%",
        once: true,
      },
    });
  }, [reducedMotion]);

  useGsapScope(gridRef, () => {
    if (reducedMotion || !hasFilters) return;
    const cards = gsap.utils.toArray<HTMLElement>(".paths-track", gridRef.current);
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { y: 10, scale: 0.985, opacity: 0.65 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: getStepDuration(0.28, reducedMotion),
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [visibleTrackSignature, hasFilters, reducedMotion]);

  return (
    <div ref={pageRef} className="paths-page" data-testid="parcours-catalog">
      <header className="paths-intro">
        <p className="paths-location">
          <span /> Les parcours
        </p>
        <div className="paths-intro-layout">
          <h1>
            Une base solide.
            <br />
            Votre expertise ensuite.
          </h1>
          <div className="paths-intro-aside">
            <p>
              Comprenez comment les systèmes fonctionnent. Apprenez à les questionner. Trouvez votre
              place en cybersécurité.
            </p>
            <a href="#specialisations" className="paths-text-link">
              Trouver ma direction <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      {foundation && (
        <section
          className="paths-foundation paths-spotlight"
          aria-labelledby="foundation-title"
          data-testid="parcours-foundation"
        >
          <div className="paths-foundation-copy">
            <span className="paths-recommendation">
              <Compass size={14} aria-hidden="true" /> Le point de départ recommandé
            </span>
            <h2 id="foundation-title">
              Tout commence
              <br />
              par les fondations.
            </h2>
            <p>
              Avant de chercher une faille, comprenez ce qui se passe sous le capot. Le tronc commun
              vous guide du raisonnement aux réseaux, une idée à la fois.
            </p>
            <ul className="paths-foundation-facts">
              <li>
                <Check size={15} aria-hidden="true" /> Aucun prérequis technique
              </li>
              <li>
                <Layers3 size={15} aria-hidden="true" /> {foundation.totalModules} modules au
                programme
              </li>
            </ul>
            <Link
              href="/parcours/v4-tronc-commun"
              className={cn(buttonVariants({ size: "lg" }), "paths-primary paths-sheen")}
              data-magnetic="0.14"
              data-testid="parcours-foundation-link"
            >
              Découvrir le tronc commun <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <span className="paths-availability">Un programme progressif, à votre rythme</span>
          </div>
          <FoundationsMap />
        </section>
      )}

      <section
        id="specialisations"
        className="paths-specialisations"
        aria-labelledby="specialisations-title"
      >
        <div className="paths-section-heading">
          <div>
            <p className="paths-section-context">Après les fondations</p>
            <h2 id="specialisations-title">Quel terrain vous attire ?</h2>
          </div>
          <p>
            Quatre branches complémentaires.
            <br />À explorer selon votre objectif.
          </p>
        </div>
        <div className="paths-toolbar">
          <div className="paths-filters" role="group" aria-label="Filtrer les branches">
            {(
              [
                { id: "all", label: "Les quatre branches" },
                { id: "specialisation", label: "Domaines techniques" },
                { id: "professional", label: "Pratique professionnelle" },
              ] as const
            ).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="paths-filter"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="paths-search">
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="track-search">
              Rechercher une branche
            </label>
            <input
              id="track-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Web, réseau, investigation…"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="paths-results-line">
          <span role="status">
            {visibleTracks.length} branche{visibleTracks.length > 1 ? "s" : ""}
            {hasFilters
              ? visibleTracks.length === 1
                ? " correspond à votre recherche"
                : " correspondent à votre recherche"
              : " pour construire la suite"}
          </span>
          {hasFilters && (
            <button type="button" onClick={clearFilters}>
              Réinitialiser les filtres <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>
        <div ref={gridRef} className="paths-tracks-grid">
          {visibleTracks.map((track) => {
            const meta = TRACK_PRESENTATION[track.slug as TrackSlug];
            const Icon = meta.Icon;
            const totalLessons = track.modules.reduce((acc, m) => acc + m.microLessonsCount, 0);
            return (
              <Link
                key={track.slug}
                href={`/parcours/${track.slug}`}
                className={`paths-track paths-spotlight paths-tone-${meta.tone}`}
                data-testid={`parcours-card-${track.slug}`}
              >
                <div className="paths-track-top">
                  <span className="paths-track-icon">
                    <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <ArrowUpRight className="paths-track-arrow" size={20} aria-hidden="true" />
                </div>
                <div className="paths-track-body">
                  <h3>{meta.title}</h3>
                  <p>{meta.description}</p>
                  <ul className="paths-track-tags">
                    {meta.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
                <div className="paths-track-bottom">
                  <span>
                    {track.totalModules} modules <span aria-hidden="true">/</span> {totalLessons}{" "}
                    leçons
                  </span>
                  <span>
                    Voir le programme <ChevronRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
          {visibleTracks.length === 0 && (
            <div className="paths-empty">
              <SlidersHorizontal size={28} aria-hidden="true" />
              <h3>Aucune branche pour « {query || "ces filtres"} »</h3>
              <p>Essayez un sujet plus large, comme « réseau », ou affichez tous les parcours.</p>
              <Button variant="secondary" onClick={clearFilters}>
                Afficher les quatre branches
              </Button>
            </div>
          )}
        </div>
      </section>

      {transversal && <TransversalDirectory modules={transversal.modules} />}

      <aside className="paths-start-note paths-spotlight">
        <span className="paths-note-icon">
          <BookOpen size={24} aria-hidden="true" />
        </span>
        <div>
          <h2>Vous pouvez commencer par une seule idée.</h2>
          <p>
            Pas besoin de choisir votre spécialité aujourd’hui. Découvrez les fondations et les
            sujets qui vous donnent envie d’aller plus loin.
          </p>
        </div>
        <Link href="/parcours/v4-tronc-commun" className="paths-note-link">
          Explorer le tronc commun <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
