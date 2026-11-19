import Link from "next/link";
import { ArrowDown, ArrowUpRight, Shield, Terminal, Zap } from "lucide-react";
import { loadV4ExplorerData } from "@/lib/v4-catalog";
import { HeroAtmosphereCanvas } from "@/components/hero-atmosphere-canvas";
import { HeroLabWorkbench } from "@/components/hero-lab-workbench";
import { LandingConceptMarquee } from "@/components/landing-concept-marquee";
import { LandingCurriculumRoadmap } from "@/components/landing-curriculum-roadmap";
import { LandingFaq } from "@/components/landing-faq";
import { LandingMethodSandbox } from "@/components/landing-method-sandbox";
import { LandingMotionShell } from "@/components/landing-motion-shell";
import { LandingParcoursGrid } from "@/components/landing-parcours-grid";

export default function HomePage() {
  const explorer = loadV4ExplorerData();
  const domainModules = new Map<string, Set<string>>();
  for (const unit of explorer.units) {
    if (!domainModules.has(unit.domainId)) domainModules.set(unit.domainId, new Set());
    domainModules.get(unit.domainId)?.add(unit.moduleId);
  }
  const moduleCountsByDomain = Object.fromEntries(
    [...domainModules.entries()].map(([id, mods]) => [id, mods.size]),
  );

  return (
    <LandingMotionShell>
      <div className="home-page container-rails">
        <span className="rail-tick rail-tick-tl" aria-hidden="true" />
        <span className="rail-tick rail-tick-tr" aria-hidden="true" />

        <section className="home-hero" aria-labelledby="home-heading">
          <HeroAtmosphereCanvas />
          <div className="hero-ambient-spotlight" aria-hidden="true" />
          <div className="hero-backdrop-grid" aria-hidden="true" />

          <div className="hero-copy">
            <p className="hero-kicker" data-hero-animate>
              <span className="hero-kicker-dot" aria-hidden="true" />
              Plateforme d&apos;apprentissage en cybersécurité
            </p>

            <h1 id="home-heading" data-hero-animate>
              Apprenez la cybersécurité.
              <br />
              <span className="hero-h1-accent">Le déclic</span> vient de la machine.
            </h1>

            <p data-hero-animate>
              Une plateforme complète pour apprendre la cybersécurité de zéro jusqu&apos;aux
              mécanismes d&apos;attaque et de défense. Ce qui nous différencie&nbsp;: notre
              méthodologie active et nos moyens visuels pour comprendre chaque système de
              l&apos;intérieur.
            </p>

            <div className="hero-actions" data-hero-animate>
              <Link href="/parcours" className="studio-button" data-magnetic="0.14">
                <span>Commencer</span>
                <span className="cta-badge" aria-hidden="true">
                  <ArrowUpRight size={15} />
                </span>
              </Link>
              <a href="#courses" className="secondary-button">
                Voir les parcours <ArrowDown size={15} aria-hidden="true" />
              </a>
            </div>

            <ul className="hero-proof-strip" aria-label="Ce qui nous différencie" data-hero-animate>
              <li>
                <Terminal size={14} aria-hidden="true" />
                <span>Un socle, quatre branches</span>
              </li>
              <li>
                <Zap size={14} aria-hidden="true" />
                <span>Méthodologie active</span>
              </li>
              <li>
                <Shield size={14} aria-hidden="true" />
                <span>Moyens visuels intégrés</span>
              </li>
            </ul>
          </div>

          <HeroLabWorkbench />
        </section>

        <LandingConceptMarquee />

        <section className="reality-strip" aria-label="Ce qui rend l'apprentissage différent">
          <div className="reality-item">
            <h2>Apprendre dès zéro</h2>
            <p>
              Chaque notion démarre par les bases exactes : aucun prérequis en programmation ni
              configuration Linux préalable n&apos;est demandé.
            </p>
          </div>
          <div className="reality-item">
            <h2>Notre méthodologie active</h2>
            <p>
              Plutôt que de lire passivement, vous observez le modèle, modifiez ses paramètres et
              validez votre raisonnement étape par étape.
            </p>
          </div>
          <div className="reality-item">
            <h2>Des moyens visuels concrets</h2>
            <p>
              Registres, droits mémoire, pile d&apos;appels et échanges TCP prennent vie dans votre
              navigateur pour ancrer durablement chaque concept.
            </p>
          </div>
        </section>

        <LandingMethodSandbox />

        <section id="courses" className="catalog-section" aria-labelledby="courses-heading">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Les parcours</p>
              <h2 id="courses-heading">Les parcours pour maîtriser la cybersécurité.</h2>
            </div>
            <p className="section-aside">
              Un tronc commun, quatre branches et des modules transversaux pour compléter un acquis
              précis. Avancez selon vos prérequis et votre objectif.
            </p>
          </div>

          <LandingParcoursGrid
            domains={explorer.domains}
            moduleCountsByDomain={moduleCountsByDomain}
          />
        </section>

        <LandingCurriculumRoadmap />

        <LandingFaq />

        <section className="closing-cta spotlight-surface" aria-labelledby="closing-cta-heading">
          <div className="workbench-beam" aria-hidden="true" />
          <div>
            <p className="section-eyebrow">Démarrer maintenant</p>
            <h2 id="closing-cta-heading">
              Apprenez la cybersécurité en voyant enfin comment chaque mécanisme fonctionne.
            </h2>
          </div>
          <div className="closing-cta-actions">
            <Link href="/parcours" className="studio-button" data-magnetic="0.14">
              <span>Commencer</span>
              <span className="cta-badge" aria-hidden="true">
                <ArrowUpRight size={15} />
              </span>
            </Link>
          </div>
        </section>
      </div>
    </LandingMotionShell>
  );
}
