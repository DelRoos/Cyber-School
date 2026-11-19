import type { Metadata } from "next";
import { ParcoursCatalog } from "@/components/parcours/parcours-catalog";
import { loadParcoursCatalog } from "@/lib/parcours/parcours-pages";

export const metadata: Metadata = {
  title: "Les parcours",
  description:
    "Un tronc commun, quatre branches et dix modules transversaux : explorez la carte du programme de cybersécurité et ses leçons.",
};

export default function ParcoursPage() {
  return <ParcoursCatalog tracks={loadParcoursCatalog()} />;
}
