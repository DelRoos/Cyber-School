import Link from "next/link";
import { ArrowDown, ArrowUpRight, Eye, MousePointer2, MessageCircle } from "lucide-react";
import { loadAcademyData } from "@/lib/curriculum-data";
import { CourseCatalog } from "@/components/course-catalog";
import { MemoryPreview } from "@/components/memory-preview";

export default function HomePage() {
  const { lessons } = loadAcademyData();
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="hero-copy">
          <div className="hero-intro">
            <span className="signal-dot" /> Un laboratoire pour les esprits curieux
          </div>
          <h1 id="home-heading">
            Le déclic
            <br />
            vient en
            <br />
            <span className="hero-heading-last">expérimentant.</span>
          </h1>
          <p>
            La mémoire, les réseaux, les systèmes. Entrez dans la machine et comprenez enfin ce qui
            se passe à l’intérieur.
          </p>
          <div className="hero-actions">
            <Link href="/lessons/program-memory-fundamentals" className="studio-button">
              Commencer à explorer <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/curriculum" data-testid="home-curriculum-v4-link" className="text-link">
              Explorer le parcours
            </Link>
            <a href="#courses" className="text-link">
              Voir les cours <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-reassurance">
            <span>Aucune installation</span>
            <span>À votre rythme</span>
            <span>Débutants bienvenus</span>
          </div>
        </div>
        <MemoryPreview />
      </section>
      <section id="courses" className="catalog-section" aria-labelledby="courses-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Votre terrain d’exploration</p>
            <h2 id="courses-heading">Sous le capot.</h2>
          </div>
          <p>
            Des mécanismes invisibles.
            <br />
            Des expériences pour les comprendre.
          </p>
        </div>
        <CourseCatalog lessons={lessons} />
      </section>
      <section id="method" className="method-section" aria-labelledby="method-heading">
        <div>
          <p className="section-kicker">Une autre façon d’apprendre</p>
          <h2 id="method-heading">
            Moins de par cœur.
            <br />
            Plus de « j’ai compris ».
          </h2>
          <p>
            Chaque expérience part d’une question concrète. Vous observez, vous essayez, puis vous
            mettez des mots sur le mécanisme.
          </p>
        </div>
        <ol className="method-steps">
          {[
            {
              icon: Eye,
              title: "Voyez l’invisible",
              text: "Une explication courte et un exemple résolu pour poser les bases.",
            },
            {
              icon: MousePointer2,
              title: "Prenez les commandes",
              text: "Avancez pas à pas, changez une valeur et observez ce qui change.",
            },
            {
              icon: MessageCircle,
              title: "Faites le lien",
              text: "Prédisez le résultat et comprenez vos erreurs grâce à un retour expliqué.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <span className="method-number">0{i + 1}</span>
              <Icon size={20} aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
