export type ModelScenarioId = "nominal" | "forgotten-free-or-cycle" | "use-after-move";

export type GcFrequency = "aggressive" | "lazy";

export type ModelTrackId = "manual-c" | "rust-raii" | "tracing-gc";

export interface ModelTrackSnapshot {
  trackId: ModelTrackId;
  title: string;
  stackSummary: string;
  heapSummary: string;
  ramUnits: number; // 0..100 scale for comparative SVG bar chart
  statusBadge: "ok" | "freed" | "compile-blocked" | "leaked" | "uaf-risk" | "gc-pending";
  statusLabel: string;
  detail: string;
}

export interface ModelComparisonTick {
  tick: number;
  phaseLabel: string;
  gcRootsCount: number;
  tracks: [ModelTrackSnapshot, ModelTrackSnapshot, ModelTrackSnapshot];
  summary: string;
}

export function getModelComparisonTimeline(
  scenario: ModelScenarioId,
  gcFreq: GcFrequency,
): ModelComparisonTick[] {
  const gcCollectTick = gcFreq === "aggressive" ? 4 : 5;

  if (scenario === "forgotten-free-or-cycle") {
    return [0, 1, 2, 3, 4, 5, 6].map((tick) => {
      const gcCollected = tick >= gcCollectTick;
      return {
        tick,
        phaseLabel:
          tick <= 1
            ? "Allocation paire d'objets (A <-> B)"
            : tick <= 3
              ? "Sortie de portée locale sans free()"
              : tick < gcCollectTick
                ? "Attente du cycle Mark & Sweep"
                : tick === gcCollectTick
                  ? "Passage GC depuis les Racines"
                  : "Après cycle",
        gcRootsCount: tick <= 1 ? 1 : 0,
        tracks: [
          {
            trackId: "manual-c",
            title: "Manuel (C)",
            stackSummary: tick <= 1 ? "ptr_A -> 0x602010" : "(aucune référence)",
            heapSummary: "A <-> B toujours alloués sur tas",
            ramUnits: 85,
            statusBadge: tick >= 2 ? "leaked" : "ok",
            statusLabel: tick >= 2 ? "Fuite CWE-401" : "Alloué",
            detail:
              tick >= 2
                ? "Aucun pointeur n'est conservé et free() n'a pas été appelé : blocs perdus jusqu'à fin du processus."
                : "malloc() réserve A et B.",
          },
          {
            trackId: "rust-raii",
            title: "Ownership / RAII (Rust)",
            stackSummary: tick <= 1 ? "owner_buf (unique)" : "Portée terminée",
            heapSummary: tick <= 1 ? "Tampon unique alloué" : "Libéré via drop()",
            ramUnits: tick <= 1 ? 45 : 0,
            statusBadge: tick >= 2 ? "freed" : "ok",
            statusLabel: tick >= 2 ? "Drop déterministe" : "Propriétaire actif",
            detail:
              tick >= 2
                ? "Le modèle d'ownership impose une structure arborescente sans fuite ; drop() libère à la sortie exacte de portée."
                : "Propriétaire unique dans la trame.",
          },
          {
            trackId: "tracing-gc",
            title: "GC Traçant (.NET / JVM)",
            stackSummary: tick <= 1 ? "GC Root -> A" : "0 GC Root atteignant A/B",
            heapSummary: gcCollected ? "Cycle A<->B balayé" : "A <-> B orphelins en attente",
            ramUnits: gcCollected ? 0 : 75,
            statusBadge: gcCollected ? "freed" : tick >= 2 ? "gc-pending" : "ok",
            statusLabel: gcCollected
              ? "Collecté (Mark & Sweep)"
              : tick >= 2
                ? "Inatteignable (en RAM)"
                : "Atteignable",
            detail: gcCollected
              ? "Mark part des racines (0 chemin vers A<->B) : même un cycle est libéré sans pause critique ici."
              : "Plus aucune racine ne pointe A<->B mais la RAM reste occupée jusqu'au prochain cycle GC.",
          },
        ],
        summary: gcCollected
          ? "À cet instant, le GC traçant balaie même les références circulaires inatteignables, Rust a déjà libéré dès t=2 sans pause, tandis que C fuit indéfiniment."
          : "Entre t=2 et le déclenchement GC, le tas managé conserve temporairement des objets morts (pic RAM), alors que Rust libère immédiatement en fin de portée.",
      };
    });
  }

  if (scenario === "use-after-move") {
    return [0, 1, 2, 3, 4, 5, 6].map((tick) => ({
      tick,
      phaseLabel:
        tick <= 1
          ? "Création tampon `buf` dans main()"
          : tick === 2
            ? "Passage / Transfert vers worker()"
            : tick <= 4
              ? "worker() libère ou rend la main"
              : "Tentative d'accès via l'ancien nom dans main()",
      gcRootsCount: tick <= 4 ? 1 : 0,
      tracks: [
        {
          trackId: "manual-c",
          title: "Manuel (C)",
          stackSummary: "main.p conserve 0x602010",
          heapSummary: tick >= 3 ? "Chunk libéré / réutilisé" : "Chunk actif",
          ramUnits: tick >= 3 ? 20 : 60,
          statusBadge: tick >= 4 ? "uaf-risk" : "ok",
          statusLabel: tick >= 4 ? "Bug UAF runtime" : "Pointeur copié",
          detail:
            tick >= 4
              ? "C autorise la compilation : main() déréférence un pointeur déjà libéré par worker()."
              : "Pointeur passé par valeur.",
        },
        {
          trackId: "rust-raii",
          title: "Ownership / RAII (Rust)",
          stackSummary: tick >= 2 ? "main.buf INVALIDÉ (Moved)" : "main.buf propriétaire",
          heapSummary: tick >= 3 ? "Libéré à fin de worker()" : "Détenu par worker",
          ramUnits: tick >= 3 ? 0 : 50,
          statusBadge: tick >= 4 ? "compile-blocked" : tick >= 3 ? "freed" : "ok",
          statusLabel: tick >= 4 ? "Refusé à la compilation" : tick === 2 ? "Moved" : "Sûr",
          detail:
            tick >= 4
              ? "Le Borrow Checker refuse de compiler toute lecture sur `main.buf` après son déplacement (`move`). Zéro UAF possible."
              : "Un seul propriétaire à la fois.",
        },
        {
          trackId: "tracing-gc",
          title: "GC Traçant (.NET / JVM)",
          stackSummary: "main.ref pointe encore l'objet",
          heapSummary: "Objet maintenu vivant par main.ref",
          ramUnits: 70,
          statusBadge: "ok",
          statusLabel: "Sûr (prolongé par GC)",
          detail:
            "Tant que `main.ref` existe comme racine, le GC ne détruit jamais l'objet : aucun Use-After-Free, au prix de maintenir l'objet plus longtemps en RAM.",
        },
      ],
      summary:
        tick >= 4
          ? "Face à une réutilisation après transfert : C compile et provoque un UAF, Rust bloque le bug dès la compilation, le GC garde l'objet vivant tant qu'une racine existe."
          : "Le transfert de référence prépare trois comportements très différents dès qu'on tente de réutiliser l'ancienne variable.",
    }));
  }

  // Default: "nominal"
  return [0, 1, 2, 3, 4, 5, 6].map((tick) => {
    const gcFreed = tick >= gcCollectTick;
    return {
      tick,
      phaseLabel:
        tick === 0
          ? "Initialisation"
          : tick === 1
            ? "Allocation du tampon"
            : tick === 2
              ? "Traitement en cours"
              : tick === 3
                ? "Sortie de fonction / Fin d'usage"
                : tick < gcCollectTick
                  ? "Mémoire en attente de collecte (GC)"
                  : "Après cycle complet",
      gcRootsCount: tick >= 1 && tick <= 2 ? 1 : 0,
      tracks: [
        {
          trackId: "manual-c",
          title: "Manuel (C)",
          stackSummary: tick >= 1 && tick <= 3 ? "ptr -> 0x602010" : "(hors portée)",
          heapSummary:
            tick >= 1 && tick <= 2 ? "Bloc 64 o occupé" : tick >= 3 ? "free(ptr) exécuté" : "Vide",
          ramUnits: tick >= 1 && tick <= 2 ? 55 : 0,
          statusBadge: tick >= 3 ? "freed" : tick >= 1 ? "ok" : "freed",
          statusLabel: tick >= 3 ? "Libéré explicitement" : tick >= 1 ? "Actif" : "Initial",
          detail:
            tick >= 3
              ? "Appel explicite à free(ptr) juste avant le retour : déterministe mais repose entièrement sur la discipline humaine."
              : tick >= 1
                ? "malloc(64) alloue sur le tas."
                : "Prêt.",
        },
        {
          trackId: "rust-raii",
          title: "Ownership / RAII (Rust)",
          stackSummary: tick >= 1 && tick <= 2 ? "buf propriétaire" : "(portée fermée)",
          heapSummary:
            tick >= 1 && tick <= 2 ? "Bloc 64 o détenu" : tick >= 3 ? "drop() inséré auto" : "Vide",
          ramUnits: tick >= 1 && tick <= 2 ? 55 : 0,
          statusBadge: tick >= 3 ? "freed" : tick >= 1 ? "ok" : "freed",
          statusLabel: tick >= 3 ? "Drop déterministe" : tick >= 1 ? "Actif" : "Initial",
          detail:
            tick >= 3
              ? "À la fermeture de portée (t=3), le compilateur insère drop() automatiquement : même rapidité sans pause GC et sans risque d'oubli."
              : tick >= 1
                ? "Box / Vec alloue avec un propriétaire unique."
                : "Prêt.",
        },
        {
          trackId: "tracing-gc",
          title: "GC Traçant (.NET / JVM)",
          stackSummary: tick >= 1 && tick <= 2 ? "Root ref -> Tas" : "0 racine",
          heapSummary:
            tick >= 1 && !gcFreed
              ? "Bloc + métadonnées GC en RAM"
              : gcFreed
                ? "Balayé par GC"
                : "Vide",
          ramUnits: tick === 0 ? 0 : gcFreed ? 0 : 75,
          statusBadge: gcFreed ? "freed" : tick >= 3 ? "gc-pending" : tick >= 1 ? "ok" : "freed",
          statusLabel: gcFreed
            ? "Collecté (Mark & Sweep)"
            : tick >= 3
              ? "Orphelin (attend GC)"
              : tick >= 1
                ? "Actif"
                : "Initial",
          detail: gcFreed
            ? `Cycle Mark & Sweep déclenché à t=${gcCollectTick} (${gcFreq}) : plus aucune racine ne pointe l'objet, il est recyclé.`
            : tick >= 3
              ? "La référence pile a disparu, mais l'objet reste en RAM jusqu'au passage du ramasse-miettes."
              : tick >= 1
                ? "Alloué dans la génération jeune."
                : "Prêt.",
        },
      ],
      summary:
        tick === 3
          ? "À la sortie exacte de la fonction (t=3), C (via free explicite) et Rust (via drop automatique) libèrent immédiatement, alors que le GC diffère la libération."
          : "Comparez à chaque instant la durée d'occupation RAM et les garanties de sûreté des trois paradigmes.",
    };
  });
}
