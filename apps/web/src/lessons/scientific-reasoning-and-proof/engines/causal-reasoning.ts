export type CausalStageId =
  "raw-observation" | "naive-correlation" | "confounder-revealed" | "controlled-intervention";

export interface CausalStageState {
  id: CausalStageId;
  stepNumber: number;
  label: string;
  shortTitle: string;
  explanation: string;
  sshAlertsPerHour: number;
  edrRestartsPerHour: number;
  apparentCorrelationR: number;
  controlledCausalEffectPct: number;
  activeEdges: Array<"Z->X" | "Z->Y" | "X->Y-spurious">;
  confounderVisible: boolean;
  interventionApplied: boolean;
}

export const CAUSAL_STAGES: CausalStageState[] = [
  {
    id: "raw-observation",
    stepNumber: 1,
    label: "Observation brute (faits journalisés)",
    shortTitle: "1. Observation",
    explanation:
      "Chaque lundi à 08:00 UTC, deux événements horodatés apparaissent séparément : redémarrage du démon EDR (X) et 410 échecs SSH (Y). Aucune causalité n'est encore démontrée.",
    sshAlertsPerHour: 410,
    edrRestartsPerHour: 1,
    apparentCorrelationR: 0.91,
    controlledCausalEffectPct: 0,
    activeEdges: [],
    confounderVisible: false,
    interventionApplied: false,
  },
  {
    id: "naive-correlation",
    stepNumber: 2,
    label: "Corrélation trompeuse X ↔ Y",
    shortTitle: "2. Corrélation",
    explanation:
      "Sur 12 semaines, quand EDR redémarre (X=1), les alertes SSH montent à 410/h (r = 0.91). Conclure « X cause Y » oublie de vérifier les autres variables variant le lundi matin.",
    sshAlertsPerHour: 410,
    edrRestartsPerHour: 1,
    apparentCorrelationR: 0.91,
    controlledCausalEffectPct: 0,
    activeEdges: ["X->Y-spurious"],
    confounderVisible: false,
    interventionApplied: false,
  },
  {
    id: "confounder-revealed",
    stepNumber: 3,
    label: "Révélation de la variable confondante Z",
    shortTitle: "3. Confondant Z",
    explanation:
      "L'audit cron montre qu'une tâche hebdomadaire Z (lundi 08:00 UTC) lance à la fois la mise à jour EDR (Z → X) et un scan d'inventaire SSH (Z → Y).",
    sshAlertsPerHour: 410,
    edrRestartsPerHour: 1,
    apparentCorrelationR: 0.91,
    controlledCausalEffectPct: 0,
    activeEdges: ["Z->X", "Z->Y"],
    confounderVisible: true,
    interventionApplied: false,
  },
  {
    id: "controlled-intervention",
    stepNumber: 4,
    label: "Expérience contrôlée do(X = OFF) à Z constant",
    shortTitle: "4. Intervention",
    explanation:
      "On désactive la mise à jour EDR sur un serveur test en gardant le scanner Z actif : les alertes SSH restent à 408/h (effet causal réel de X sur Y ≈ 0 %).",
    sshAlertsPerHour: 408,
    edrRestartsPerHour: 0,
    apparentCorrelationR: 0.02,
    controlledCausalEffectPct: 0,
    activeEdges: ["Z->Y"],
    confounderVisible: true,
    interventionApplied: true,
  },
];

export interface ConditionOption {
  id: string;
  label: string;
  essentialForCounterexample: boolean;
}

export const COUNTEREXAMPLE_CLAIM =
  "Affirmation universelle : « Toute requête recevant HTTP 200 prouve que l'utilisateur dispose d'un jeton JWT authentifié. »";

export const COUNTEREXAMPLE_CONDITIONS: ConditionOption[] = [
  {
    id: "public-healthz",
    label: "C1 : Route `/healthz` exclue du middleware JWT (statut 200 public)",
    essentialForCounterexample: true,
  },
  {
    id: "firefox-linux",
    label: "C2 : Client exécutant Firefox sur Linux x86_64",
    essentialForCounterexample: false,
  },
  {
    id: "low-latency",
    label: "C3 : Latence réseau inférieure à 15 ms",
    essentialForCounterexample: false,
  },
];

export interface CounterexampleEvaluation {
  falsified: boolean;
  isMinimal: boolean;
  activeEssentialCount: number;
  redundantIds: string[];
  verdictTitle: string;
  verdictDetail: string;
}

export function evaluateCounterexample(selectedConditionIds: string[]): CounterexampleEvaluation {
  const selectedSet = new Set(selectedConditionIds);
  const essentialSelected = COUNTEREXAMPLE_CONDITIONS.filter(
    (c) => c.essentialForCounterexample && selectedSet.has(c.id),
  );
  const redundant = COUNTEREXAMPLE_CONDITIONS.filter(
    (c) => !c.essentialForCounterexample && selectedSet.has(c.id),
  );

  const falsified = essentialSelected.length >= 1;
  const isMinimal = falsified && redundant.length === 0;

  if (!falsified) {
    return {
      falsified: false,
      isMinimal: false,
      activeEssentialCount: 0,
      redundantIds: redundant.map((r) => r.id),
      verdictTitle: "Affirmation non réfutée",
      verdictDetail:
        "Sans déclencher de chemin renvoyant 200 hors vérification JWT, l'affirmation universelle n'est pas encore contredite.",
    };
  }

  if (isMinimal) {
    return {
      falsified: true,
      isMinimal: true,
      activeEssentialCount: essentialSelected.length,
      redundantIds: [],
      verdictTitle: "Contre-exemple minimal valide !",
      verdictDetail:
        "Une seule prémisse légale (C1 : GET /healthz sans jeton -> HTTP 200) suffit à réfuter « Toute réponse 200 ». Aucune condition superflue.",
    };
  }

  return {
    falsified: true,
    isMinimal: false,
    activeEssentialCount: essentialSelected.length,
    redundantIds: redundant.map((r) => r.id),
    verdictTitle: "Réfutation valide mais non minimale",
    verdictDetail:
      "L'affirmation est contredite grâce à C1, mais les conditions annexes sélectionnées (" +
      redundant.map((r) => r.id).join(", ") +
      ") sont superflues et brouillent la cause réelle.",
  };
}
