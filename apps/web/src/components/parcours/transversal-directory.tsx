import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";
import type { ParcoursCatalogTrack } from "@/lib/parcours/parcours-pages";
import { TRANSVERSAL_FAMILIES } from "@/lib/parcours/parcours-structure";

export function TransversalDirectory({ modules }: { modules: ParcoursCatalogTrack["modules"] }) {
  return (
    <section
      id="modules-transversaux"
      className="paths-complements"
      aria-labelledby="complements-title"
    >
      <div className="paths-section-heading">
        <div>
          <p className="paths-section-context">En complément du socle et des branches</p>
          <h2 id="complements-title">Approfondir le sujet qui vous sert.</h2>
        </div>
        <span className="paths-complements-count">
          <GitBranch size={17} aria-hidden="true" /> {modules.length} modules transversaux
        </span>
      </div>
      <p className="paths-complements-intro">
        Ces modules enrichissent un acquis précis. Choisissez-les selon vos besoins : ils ne forment
        pas un parcours supplémentaire à suivre du début à la fin.
      </p>
      <div className="paths-complement-groups">
        {TRANSVERSAL_FAMILIES.map((family) => (
          <section key={family.id} aria-labelledby={`family-${family.id}`}>
            <h3 id={`family-${family.id}`}>{family.title}</h3>
            <ul>
              {family.moduleIds.map((id) => {
                const curriculumModule = modules.find((item) => item.id === id);
                return curriculumModule ? (
                  <li key={id}>
                    <Link
                      href={`/parcours/v4-approfondissements#noeud-${curriculumModule.id}`}
                      data-testid={`complement-link-${id}`}
                    >
                      <span>
                        <strong>{curriculumModule.title}</strong>
                        <small>{curriculumModule.microLessonsCount} leçons</small>
                      </span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </section>
        ))}
      </div>
      <Link href="/parcours/v4-approfondissements" className="paths-text-link">
        Consulter tous les compléments <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
