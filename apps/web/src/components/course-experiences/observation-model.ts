export type SimulatedUpstreamCause =
  "h1-human-typo" | "h2-scheduled-script-old-password" | "h3-unauthorized-lateral";

export type ObservationContextMode =
  | "sshd-only"
  | "with-inventory"
  | "with-inventory-and-backup-log"
  | "with-inventory-and-interactive-shell";

export type SelectedHypothesisId = "none" | SimulatedUpstreamCause;

export type ObservationVerdict =
  | "observing"
  | "no-hypothesis-selected"
  | "contradicted-hypothesis"
  | "contradicted-claim"
  | "unverified-hypothesis"
  | "premature-conclusion"
  | "corroborated-with-limits"
  | "overclaimed-certainty";

export interface NormalizedSshdLogEntry {
  id: string;
  timestamp: string;
  service: "sshd";
  event: "AUTH_FAILURE";
  account: "c.moreau";
  sourceIp: "10.24.8.19";
  rawLine: string;
}

export interface UpstreamCauseDescriptor {
  id: SimulatedUpstreamCause;
  shortTitle: string;
  label: string;
  upstreamActionSummary: string;
  networkPacketSummary: string;
}

export interface ContextSourceDescriptor {
  id: "source-1-sshd" | "source-2-inventory" | "source-3a-backup-log" | "source-3b-shell-log";
  title: string;
  sourceName: string;
  active: boolean;
  observedFact: string;
  eliminatesHypothesisId: SimulatedUpstreamCause | null;
}

export interface HypothesisStatusEvaluation {
  id: SimulatedUpstreamCause;
  title: string;
  mechanism: string;
  requiredCheck: string;
  status: "compatible" | "contradicted" | "corroborated";
  reason: string;
}

export interface ObservationWorkbenchInput {
  simulatedCause: SimulatedUpstreamCause;
  contextMode: ObservationContextMode;
  selectedHypothesisId: SelectedHypothesisId;
  claimedAsEstablishedFact: boolean;
}

export interface ObservationWorkbenchState {
  input: ObservationWorkbenchInput;
  upstreamCause: UpstreamCauseDescriptor;
  initialLog: {
    host: "srv-paie-01";
    service: "sshd";
    recordedEntryCount: 3;
    timeSpanSeconds: 7;
    recordedFieldCount: 5;
    differencesInNonTimestampFields: 0;
    containsHumanIdentityOrMotive: false;
    entries: readonly NormalizedSshdLogEntry[];
  };
  activeSourcesCount: 1 | 2 | 3;
  sources: readonly ContextSourceDescriptor[];
  compatibleHypothesisIds: readonly SimulatedUpstreamCause[];
  compatibleHypothesesCount: 1 | 2 | 3;
  corroboratedHypothesisId: SimulatedUpstreamCause | null;
  hypotheses: readonly HypothesisStatusEvaluation[];
  verdict: ObservationVerdict;
  verdictTitle: string;
  verdictExplanation: string;
  unsupportedClaimCount: 0 | 1;
  transformSummary: {
    beforeLabel: string;
    afterLabel: string;
    invariantRule: string;
  };
}

export const UPSTREAM_CAUSES: ReadonlyArray<UpstreamCauseDescriptor> = [
  {
    id: "h1-human-typo",
    shortTitle: "Saisie clavier (H1)",
    label: "H1 · Erreur de frappe humaine au clavier",
    upstreamActionSummary:
      "Une personne tape trois fois un mauvais mot de passe au clavier vers c.moreau.",
    networkPacketSummary:
      "Requête SSH depuis 10.24.8.19 : user=c.moreau, password=<erroné> (aucun nom d'opérateur physique dans le paquet).",
  },
  {
    id: "h2-scheduled-script-old-password",
    shortTitle: "Script de backup (H2)",
    label: "H2 · Script de backup automatique non mis à jour",
    upstreamActionSummary:
      "Le script planifié sync-paie-backup envoie automatiquement un ancien mot de passe à 3 reprises.",
    networkPacketSummary:
      "Requête SSH depuis 10.24.8.19 : user=c.moreau, password=<erroné> (indiscernable côté cible d'une frappe clavier).",
  },
  {
    id: "h3-unauthorized-lateral",
    shortTitle: "Shell interactif (H3)",
    label: "H3 · Essais manuels depuis un shell interactif sur 10.24.8.19",
    upstreamActionSummary:
      "Un opérateur connecté en shell interactif sur 10.24.8.19 teste 3 mots de passe vers c.moreau.",
    networkPacketSummary:
      "Requête SSH depuis 10.24.8.19 : user=c.moreau, password=<erroné> (mêmes champs reçus par srv-paie-01).",
  },
];

export const NORMALIZED_SSHD_ENTRIES: ReadonlyArray<NormalizedSshdLogEntry> = [
  {
    id: "entry-1",
    timestamp: "08:14:02 UTC",
    service: "sshd",
    event: "AUTH_FAILURE",
    account: "c.moreau",
    sourceIp: "10.24.8.19",
    rawLine:
      "08:14:02 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19",
  },
  {
    id: "entry-2",
    timestamp: "08:14:05 UTC",
    service: "sshd",
    event: "AUTH_FAILURE",
    account: "c.moreau",
    sourceIp: "10.24.8.19",
    rawLine:
      "08:14:05 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19",
  },
  {
    id: "entry-3",
    timestamp: "08:14:09 UTC",
    service: "sshd",
    event: "AUTH_FAILURE",
    account: "c.moreau",
    sourceIp: "10.24.8.19",
    rawLine:
      "08:14:09 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19",
  },
];

export const CONTEXT_MODE_ORDER: ReadonlyArray<ObservationContextMode> = [
  "sshd-only",
  "with-inventory",
  "with-inventory-and-backup-log",
  "with-inventory-and-interactive-shell",
];

export const DEFAULT_OBSERVATION_INPUT: ObservationWorkbenchInput = {
  simulatedCause: "h1-human-typo",
  contextMode: "sshd-only",
  selectedHypothesisId: "none",
  claimedAsEstablishedFact: false,
};

export function evaluateObservationWorkbench(
  input: ObservationWorkbenchInput = DEFAULT_OBSERVATION_INPUT,
): ObservationWorkbenchState {
  const upstreamCause =
    UPSTREAM_CAUSES.find((cause) => cause.id === input.simulatedCause) ?? UPSTREAM_CAUSES[0]!;

  const activeSourcesCount: 1 | 2 | 3 =
    input.contextMode === "sshd-only" ? 1 : input.contextMode === "with-inventory" ? 2 : 3;

  const compatibleHypothesisIds: readonly SimulatedUpstreamCause[] =
    input.contextMode === "sshd-only"
      ? ["h1-human-typo", "h2-scheduled-script-old-password", "h3-unauthorized-lateral"]
      : input.contextMode === "with-inventory"
        ? ["h2-scheduled-script-old-password", "h3-unauthorized-lateral"]
        : input.contextMode === "with-inventory-and-backup-log"
          ? ["h2-scheduled-script-old-password"]
          : ["h3-unauthorized-lateral"];

  const compatibleHypothesesCount = compatibleHypothesisIds.length as 1 | 2 | 3;

  const corroboratedHypothesisId: SimulatedUpstreamCause | null =
    compatibleHypothesisIds.length === 1 ? (compatibleHypothesisIds[0] ?? null) : null;

  const sources: readonly ContextSourceDescriptor[] = [
    {
      id: "source-1-sshd",
      title: "Source 1 · Log sshd cible (srv-paie-01)",
      sourceName: "/var/log/auth.log (normalisé à 5 champs)",
      active: true,
      observedFact:
        "3 log entries AUTH_FAILURE en 7 secondes (08:14:02 à 08:14:09 UTC) visant c.moreau depuis source_ip=10.24.8.19.",
      eliminatesHypothesisId: null,
    },
    {
      id: "source-2-inventory",
      title: "Source 2 · Fiche d'inventaire réseau (CMDB)",
      sourceName: "cmdb/hosts/10.24.8.19",
      active: input.contextMode !== "sshd-only",
      observedFact:
        "Le host 10.24.8.19 est le serveur automatisé srv-backup-interne en salle machine ; le poste de bureau de Claire Moreau est 10.24.2.45.",
      eliminatesHypothesisId: "h1-human-typo",
    },
    {
      id: "source-3a-backup-log",
      title: "Source 3 (Cas 3A) · Log du script de backup sur 10.24.8.19",
      sourceName: "/var/log/sync-paie-backup.log (10.24.8.19)",
      active: input.contextMode === "with-inventory-and-backup-log",
      observedFact:
        "Tâche planifiée lancée à 08:14:00 UTC : 3 essais d'authentification vers c.moreau@srv-paie-01 à 08:14:02, 08:14:05 et 08:14:09 UTC avec un ancien mot de passe expiré.",
      eliminatesHypothesisId: "h3-unauthorized-lateral",
    },
    {
      id: "source-3b-shell-log",
      title: "Source 3 (Cas 3B) · Log des sessions locales sur 10.24.8.19",
      sourceName: "/var/log/audit-sessions.log (10.24.8.19)",
      active: input.contextMode === "with-inventory-and-interactive-shell",
      observedFact:
        "Aucune exécution de sync-paie-backup à 08:14 UTC ; un shell interactif ouvert à 08:13:55 UTC sur 10.24.8.19 lance 3 commandes ssh manuelles vers c.moreau@srv-paie-01.",
      eliminatesHypothesisId: "h2-scheduled-script-old-password",
    },
  ];

  const hypotheses: readonly HypothesisStatusEvaluation[] = [
    {
      id: "h1-human-typo",
      title: "H1 · Erreur de saisie humaine de Claire Moreau depuis son poste",
      mechanism:
        "Claire Moreau tente d'ouvrir sa session et tape un mot de passe erroné trois fois de suite en 7 secondes.",
      requiredCheck: "Vérifier dans l'inventaire réseau à quel host correspond l'IP 10.24.8.19.",
      status: compatibleHypothesisIds.includes("h1-human-typo") ? "compatible" : "contradicted",
      reason:
        input.contextMode === "sshd-only"
          ? "Compatible avec le seul log sshd : le champ account=c.moreau ne précise pas quel type de machine est 10.24.8.19."
          : "Contredite par la Source 2 : 10.24.8.19 est un serveur en salle machine et non le poste de bureau de Claire Moreau (10.24.2.45).",
    },
    {
      id: "h2-scheduled-script-old-password",
      title: "H2 · Script de backup planifié utilisant un ancien mot de passe",
      mechanism:
        "Le script sync-paie-backup sur 10.24.8.19 exécute 3 tentatives automatiques avec un mot de passe non mis à jour.",
      requiredCheck:
        "Consulter le log applicatif sync-paie-backup.log sur le host 10.24.8.19 autour de 08:14 UTC.",
      status:
        corroboratedHypothesisId === "h2-scheduled-script-old-password"
          ? "corroborated"
          : compatibleHypothesisIds.includes("h2-scheduled-script-old-password")
            ? "compatible"
            : "contradicted",
      reason:
        input.contextMode === "with-inventory-and-backup-log"
          ? "Corroborée par les 3 sources (Cas 3A) : les 3 essais du script sync-paie-backup coïncident à la seconde près avec le log sshd."
          : input.contextMode === "with-inventory-and-interactive-shell"
            ? "Contredite par le Cas 3B : aucune tâche de backup ne s'est exécutée à 08:14 UTC sur 10.24.8.19."
            : "Compatible avec les traces actives : il reste à inspecter les logs locaux de 10.24.8.19 pour vérifier si le script a tourné.",
    },
    {
      id: "h3-unauthorized-lateral",
      title: "H3 · Essais manuels non autorisés depuis un shell interactif sur 10.24.8.19",
      mechanism:
        "Une personne connectée en shell interactif sur 10.24.8.19 tente manuellement de rebondir vers le compte c.moreau.",
      requiredCheck:
        "Consulter le log des sessions interactives et des commandes sur le host 10.24.8.19.",
      status:
        corroboratedHypothesisId === "h3-unauthorized-lateral"
          ? "corroborated"
          : compatibleHypothesisIds.includes("h3-unauthorized-lateral")
            ? "compatible"
            : "contradicted",
      reason:
        input.contextMode === "with-inventory-and-interactive-shell"
          ? "Corroborée par les 3 sources (Cas 3B) : un shell interactif ouvert à 08:13:55 UTC sur 10.24.8.19 a lancé les 3 commandes ssh."
          : input.contextMode === "with-inventory-and-backup-log"
            ? "Contredite par le Cas 3A : les 3 tentatives proviennent du script automatisé sync-paie-backup et non d'un shell interactif."
            : "Compatible avec les traces actives : il faut consulter les logs de session de 10.24.8.19 pour savoir si un shell était actif.",
    },
  ];

  let verdict: ObservationVerdict;
  let verdictTitle: string;
  let verdictExplanation: string;
  let unsupportedClaimCount: 0 | 1;

  if (input.selectedHypothesisId === "none") {
    if (!input.claimedAsEstablishedFact) {
      verdict = "observing";
      unsupportedClaimCount = 0;
      verdictTitle = "Observation factuelle en cours (0 affirmation non soutenue)";
      verdictExplanation =
        "Vous examinez les champs rapportés par les sources actives sans transformer prématurément une piste en fait établi.";
    } else {
      verdict = "no-hypothesis-selected";
      unsupportedClaimCount = 1;
      verdictTitle = "Affirmation sans hypothèse explicite (1 affirmation non soutenue)";
      verdictExplanation =
        "Cocher « Affirmer comme fait prouvé » sans même désigner et tester une hypothèse précisera une conclusion vide de justification.";
    }
  } else if (!compatibleHypothesisIds.includes(input.selectedHypothesisId)) {
    if (!input.claimedAsEstablishedFact) {
      verdict = "contradicted-hypothesis";
      unsupportedClaimCount = 0;
      verdictTitle = "Piste contredite par le recoupement (écartée avec raison)";
      verdictExplanation =
        "Vous inspectez une hypothèse qui est directement réfutée par les sources secondaires actives : elle doit être écartée du rapport.";
    } else {
      verdict = "contradicted-claim";
      unsupportedClaimCount = 1;
      verdictTitle = "Conclusion contredite maintenue à tort (1 affirmation non soutenue)";
      verdictExplanation =
        "Affirmer comme un fait prouvé une hypothèse déjà contredite par l'inventaire ou le log local introduit une erreur directe dans le ticket.";
    }
  } else if (compatibleHypothesesCount > 1) {
    if (!input.claimedAsEstablishedFact) {
      verdict = "unverified-hypothesis";
      unsupportedClaimCount = 0;
      verdictTitle = `Hypothèse de travail recevable (${compatibleHypothesesCount} pistes encore ouvertes)`;
      verdictExplanation =
        "Cette hypothèse est compatible avec les traces consultées, et vous la présentez honnêtement comme une piste à recouper.";
    } else {
      verdict = "premature-conclusion";
      unsupportedClaimCount = 1;
      verdictTitle = `Conclusion prématurée (1 affirmation non soutenue · ${compatibleHypothesesCount} pistes ouvertes)`;
      verdictExplanation =
        "Affirmer cette piste comme un fait prouvé alors que d'autres hypothèses expliquent exactement les mêmes logs constitue une sur-interprétation.";
    }
  } else {
    if (!input.claimedAsEstablishedFact) {
      verdict = "corroborated-with-limits";
      unsupportedClaimCount = 0;
      verdictTitle = "Conclusion corroborée par 3 sources (avec mention des limites)";
      verdictExplanation =
        "Les 3 sources convergent vers une seule hypothèse du modèle, et vous documentez ce constat en rappelant les sources consultées et leurs limites.";
    } else {
      verdict = "overclaimed-certainty";
      unsupportedClaimCount = 1;
      verdictTitle = "Certitude absolue sans réserve (1 affirmation non soutenue)";
      verdictExplanation =
        "Même avec 3 sources convergentes, affirmer un fait absolu sans mentionner le périmètre des logs ni leurs limites (horloge, collecte) dépasse ce que prouve la trace.";
    }
  }

  const transformSummary = {
    beforeLabel: `Capteur sshd : 5 champs fixes (${upstreamCause.shortTitle})`,
    afterLabel: `${activeSourcesCount} source(s) active(s) -> ${compatibleHypothesesCount} hypothèse(s) compatible(s)`,
    invariantRule:
      "Le log sshd reste identique quelle que soit la cause amont (0 différence hors timestamp) ; seul le recoupement réduit les hypothèses compatibles.",
  };

  return {
    input,
    upstreamCause,
    initialLog: {
      host: "srv-paie-01",
      service: "sshd",
      recordedEntryCount: 3,
      timeSpanSeconds: 7,
      recordedFieldCount: 5,
      differencesInNonTimestampFields: 0,
      containsHumanIdentityOrMotive: false,
      entries: NORMALIZED_SSHD_ENTRIES,
    },
    activeSourcesCount,
    sources,
    compatibleHypothesisIds,
    compatibleHypothesesCount,
    corroboratedHypothesisId,
    hypotheses,
    verdict,
    verdictTitle,
    verdictExplanation,
    unsupportedClaimCount,
    transformSummary,
  };
}
