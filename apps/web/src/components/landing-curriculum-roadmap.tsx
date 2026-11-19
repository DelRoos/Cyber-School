import Link from "next/link";
import { ArrowRight, Compass, Cpu, Network, ShieldAlert } from "lucide-react";

const TRACKS = [
  {
    step: "01",
    icon: Compass,
    title: "Raisonnement & Preuve",
    outcome: "Poser un modèle causal strict avant de conclure devant une corrélation apparente.",
    skills: ["Preuve vs hypothèse", "Variables confondantes", "Contre-exemple minimal"],
    evidence: "Module Tronc commun · 25 min",
    href: "/parcours/v4-tronc-commun#noeud-TC-00",
    cta: "Voir le module",
    status: "Disponible",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Architecture & Mémoire",
    outcome: "Voir vivre chaque octet du registre CPU jusqu'au tas et aux protections matérielles.",
    skills: ["Little-Endian & RAM", "Pagination MMU & ASLR", "Pile, Tas & Pointeurs"],
    evidence: "7 chapitres · Tronc commun",
    href: "/parcours/v4-tronc-commun#noeud-TC-01",
    cta: "Explorer le module",
    status: "Programme détaillé",
  },
  {
    step: "03",
    icon: Network,
    title: "Réseaux & Protocoles",
    outcome: "Lire et contrôler les échanges TCP avant le premier octet applicatif.",
    skills: ["Poignée de main TCP", "Numéros SEQ / ACK", "Pertes & retransmissions"],
    evidence: "Fondations réseau",
    href: "/parcours/v4-tronc-commun#noeud-TC-03",
    cta: "Explorer le module",
    status: "Programme détaillé",
  },
  {
    step: "04",
    icon: ShieldAlert,
    title: "Défense & Ingénierie Offensive",
    outcome: "Relier le modèle matériel aux vulnérabilités réelles et aux parades système.",
    skills: ["Use-After-Free", "Protection NX / W^X", "Surface d'attaque"],
    evidence: "Spécialisations & suite",
    href: "/parcours",
    cta: "Voir tous les parcours",
    status: "Feuille de route",
  },
] as const;

export function LandingCurriculumRoadmap() {
  return (
    <section id="roadmap" className="roadmap-section" aria-labelledby="roadmap-heading">
      <div className="roadmap-timeline-grid">
        <aside className="roadmap-sticky-aside">
          <div>
            <p className="section-eyebrow">Progression du cursus</p>
            <h2 id="roadmap-heading">
              De zéro jusqu&apos;aux mécanismes d&apos;attaque et de défense.
            </h2>
            <p className="roadmap-aside-copy">
              Chaque palier s&apos;appuie sur le précédent : on ne mémorise aucune faille sans
              d&apos;abord maîtriser le fonctionnement normal de la machine.
            </p>
          </div>

          <div className="roadmap-hud-counter" aria-label="Palier affiché">
            <div className="roadmap-hud-digits">
              <strong data-roadmap-current>01</strong>
              <span>/ 04 palier actif</span>
            </div>
            <p className="roadmap-hud-label" data-roadmap-active-title>
              Raisonnement &amp; Preuve
            </p>
            <nav className="roadmap-hud-nav" aria-label="Accès direct aux paliers">
              {TRACKS.map((track) => (
                <a
                  key={track.step}
                  href={`#roadmap-stage-${track.step}`}
                  data-roadmap-nav={track.step}
                >
                  {track.step}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="roadmap-spine-wrap">
          <div className="roadmap-spine-rail" aria-hidden="true">
            <div className="roadmap-spine-fill" data-roadmap-spine-fill />
          </div>

          <ol className="roadmap-spine-list">
            {TRACKS.map((track, index) => {
              const Icon = track.icon;
              return (
                <li
                  key={track.step}
                  id={`roadmap-stage-${track.step}`}
                  className={index === 0 ? "roadmap-stage is-active" : "roadmap-stage"}
                  data-roadmap-stage={track.step}
                  data-roadmap-title={track.title}
                >
                  <span className="roadmap-node-dot" aria-hidden="true">
                    <span>{track.step}</span>
                  </span>

                  <article className="roadmap-stage-card spotlight-surface">
                    <div className="roadmap-stage-header">
                      <span className="roadmap-phase-tag">Palier {track.step}</span>
                      <span className="roadmap-pill">{track.status}</span>
                    </div>

                    <div className="roadmap-icon-row">
                      <span className="roadmap-icon-badge" aria-hidden="true">
                        <Icon size={17} />
                      </span>
                      <h3>{track.title}</h3>
                    </div>

                    <p className="roadmap-outcome">{track.outcome}</p>

                    <ul className="roadmap-skills">
                      {track.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>

                    <div className="roadmap-card-footer">
                      <span className="roadmap-evidence">{track.evidence}</span>
                      <Link
                        href={track.href}
                        className="roadmap-link"
                        {...(track.href.startsWith("/lessons/")
                          ? {
                              "data-testid": `home-lesson-link-${track.href.replace("/lessons/", "")}`,
                            }
                          : {})}
                      >
                        {track.cta} <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
