import { Badge } from "@cyber-school/ui";
import { V4CatalogExplorer } from "@/components/v4-catalog-explorer";
import { loadV4ExplorerData } from "@/lib/v4-catalog";

export const metadata = {
  title: "Cursus V4 & Registre de production · Cyber School",
  description:
    "Exploration structurée des 54 modules et 1 122 micro-leçons V4 regroupées en unités pédagogiques.",
};

export default function CurriculumExplorerPage() {
  const data = loadV4ExplorerData();

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b pb-5">
        <Badge variant="outline" className="font-mono text-xs">
          Référentiel atomique V4 · Chaîne de production industrialisée
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Cartographie complète du cursus V4
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Chaque micro-leçon du référentiel est rattachée à une unité pédagogique cohérente, avec
          suivi persistant sur 12 états de production, prérequis vérifiés et lien direct vers les
          cours interactifs disponibles.
        </p>
      </div>

      <V4CatalogExplorer data={data} />
    </div>
  );
}
