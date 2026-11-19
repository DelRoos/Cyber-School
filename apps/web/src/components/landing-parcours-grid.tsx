import Link from "next/link";
import { ArrowUpRight, Layers, Scale, SearchCheck, ServerCrash, ShieldCheck } from "lucide-react";
import type { V4ExplorerDomainSummary } from "@/lib/v4-catalog";

interface ParcoursMeta {
  shortTitle: string;
  subtitle: string;
  highlights: [string, string, string];
  icon: typeof Layers;
}

const PARCOURS_META: Record<string, ParcoursMeta> = {
  "v4-tronc-commun": {
    shortTitle: "Tronc commun",
    subtitle: "Fondations scientifiques, architecture mémoire, systèmes Linux/Windows et réseaux.",
    highlights: ["Raisonnement & preuve", "Mémoire, CPU & pile", "Réseaux & protocoles TCP/IP"],
    icon: Layers,
  },
  "v4-branche-a": {
    shortTitle: "Web, Mobile (Android & iOS), Fintech & IA",
    subtitle:
      "Sécurité web, APIs, Android, iOS, AppSec, cloud applicatif, Mobile Money et modèles IA.",
    highlights: ["Web, APIs & Cloud", "Sécurité Android & iOS", "Fintech & Red Team IA"],
    icon: ShieldCheck,
  },
  "v4-branche-b": {
    shortTitle: "Infrastructure, Offensive & Recherche",
    subtitle:
      "Audit réseau, Active Directory, Linux, rétro-ingénierie logiciel/mobile, exploitation binaire et malwares.",
    highlights: [
      "Active Directory & Linux",
      "Reverse binaire & mobile",
      "Recherche de failles & malwares",
    ],
    icon: ServerCrash,
  },
  "v4-branche-c": {
    shortTitle: "OSINT, Fraudes, Forensics & Protection",
    subtitle:
      "Investigation numérique, lutte anti-fraude, Threat Intel, forensics système/RAM/mobile et anti-stalkerware.",
    highlights: [
      "OSINT & Threat Intel",
      "Forensics disque, RAM & réseau",
      "Forensics mobile & protection",
    ],
    icon: SearchCheck,
  },
  "v4-branche-d": {
    shortTitle: "Pratique pro, Gouvernance & Qualité",
    subtitle: "Contrats, cadrage de mission, rapports, IA copilote d’audit et assurance qualité.",
    highlights: ["Contrats & missions", "Rapports & IA copilote", "Gouvernance & qualité"],
    icon: Scale,
  },
};

export function LandingParcoursGrid({
  domains,
  moduleCountsByDomain,
}: {
  domains: V4ExplorerDomainSummary[];
  moduleCountsByDomain: Record<string, number>;
}) {
  return (
    <div className="parcours-grid" aria-label="Un tronc commun et quatre branches">
      {domains
        .filter((domain) => domain.id !== "v4-approfondissements")
        .map((domain) => {
          const meta = PARCOURS_META[domain.id];
          const Icon = meta?.icon ?? Layers;
          const isEntryTrack = domain.id === "v4-tronc-commun";
          const moduleCount = moduleCountsByDomain[domain.id] ?? 0;
          const href = `/parcours/${domain.id}`;

          return (
            <article
              key={domain.id}
              className={
                isEntryTrack ? "parcours-card is-open-track spotlight-surface" : "parcours-card"
              }
            >
              <div className="parcours-card-top">
                <span className="parcours-index">
                  <Icon size={15} aria-hidden="true" />
                  <span>{isEntryTrack ? "Le socle commun" : "Une branche du programme"}</span>
                </span>
                <span className={isEntryTrack ? "parcours-status is-open" : "parcours-status"}>
                  {isEntryTrack ? "Pour commencer" : "Au programme"}
                </span>
              </div>

              <h3>{meta?.shortTitle ?? domain.title}</h3>
              <p className="parcours-subtitle">{meta?.subtitle ?? domain.title}</p>

              {meta && (
                <ul className="parcours-topics">
                  {meta.highlights.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              )}

              <div className="parcours-card-footer">
                <span className="parcours-scope">
                  {moduleCount} modules · {domain.microLessonsCount} leçons
                </span>
                <Link href={href} className="parcours-link">
                  <span>{isEntryTrack ? "Commencer" : "Explorer"}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      <aside className="parcours-transversal-note">
        <div>
          <h3>Des compléments transversaux, à la carte.</h3>
          <p>
            {moduleCountsByDomain["v4-approfondissements"] ?? 0} modules pour enrichir les méthodes,
            les plateformes, l’IA et l’investigation, selon le sujet que vous travaillez.
          </p>
        </div>
        <Link href="/parcours#modules-transversaux">
          Explorer les compléments <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
