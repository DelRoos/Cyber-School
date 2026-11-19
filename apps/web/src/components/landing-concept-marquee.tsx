import Link from "next/link";

const CONCEPT_ITEMS = [
  { code: "0x1000", label: "Octet & Little-Endian", href: "/parcours/v4-tronc-commun#noeud-TC-01" },
  {
    code: "SYN · ACK",
    label: "Poignée de main TCP",
    href: "/parcours/v4-tronc-commun#noeud-TC-03",
  },
  { code: "RSP", label: "Pile d'appels & frames", href: "/parcours/v4-tronc-commun#noeud-TC-01" },
  { code: "MMU", label: "Pagination & ASLR", href: "/parcours/v4-tronc-commun#noeud-TC-02" },
  {
    code: "W^X · NX",
    label: "Mémoire non exécutable",
    href: "/parcours/v4-tronc-commun#noeud-TC-02",
  },
  {
    code: "BAYES",
    label: "Taux de base & Alertes",
    href: "/parcours/v4-branche-c#noeud-C-01",
  },
  {
    code: "CAUSE",
    label: "Graphe causal & Réfutation",
    href: "/parcours/v4-tronc-commun#noeud-TC-00",
  },
  { code: "UAF", label: "Tas & pointeurs pendants", href: "/parcours/v4-tronc-commun#noeud-TC-01" },
] as const;

export function LandingConceptMarquee() {
  return (
    <section className="concept-marquee-band" aria-label="Mécanismes explorables en direct">
      <div className="concept-marquee-mask">
        <div className="concept-marquee-track">
          <ul className="concept-marquee-group">
            {CONCEPT_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="concept-chip">
                  <code>{item.code}</code>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="concept-marquee-group is-duplicate" aria-hidden="true">
            {CONCEPT_ITEMS.map((item) => (
              <li key={`${item.label}-dup`}>
                <Link href={item.href} tabIndex={-1} className="concept-chip">
                  <code>{item.code}</code>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
