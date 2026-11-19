import {
  formatMinutesHuman,
  loadDomainRealFacts,
  loadParcoursFactsSource,
  loadParcoursAudio,
  type ParcoursAudioData,
  type RealChapterFact,
  type RealExamFact,
} from "./curriculum-facts";
import { findRepoRoot } from "../curriculum-data";

export type ParcoursTopologyKind =
  | "ascension-pipeline"
  | "trust-chain"
  | "dual-convergence"
  | "evidence-timeline"
  | "mission-loop"
  | "constellation";

export interface TopologyNodeView {
  id: string;
  order: number;
  title: string;
  shortLabel: string;
  x: number;
  y: number;
  stageKind: "fondation" | "coeur" | "specialisation";
  durationLabel: string;
  microLessonsCount: number;
  microLessons: Array<{ id: string; title: string }>;
  mechanicalQuestion: string;
  summary: string;
  competencies: string[];
  chapters: RealChapterFact[];
  openLessonSlug?: string;
  dependsOnIds: string[];
  externalDeps: Array<{ label: string; href: string }>;
  relatedModules: Array<{ label: string; href: string }>;
}

export interface TopologyEdgeView {
  id: string;
  fromId: string;
  toId: string;
  signalLabel: string;
}

export interface CalibratorQuestion {
  id: string;
  topic: string;
  prompt: string;
  targetNodeId: string;
  options: Array<{
    id: string;
    label: string;
    explanation: string;
    mastered: boolean;
  }>;
}

export interface BespokeParcoursPageData {
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  tagline: string;
  audienceSummary: string;
  useCases: string[];
  prerequisiteNote: string;
  prerequisiteLinks: Array<{ label: string; href: string }>;
  totalDurationLabel: string;
  totalModules: number;
  totalChapters: number;
  totalMicroLessons: number;
  openLessonsCount: number;
  entryLessonSlug?: string;
  topologyKind: ParcoursTopologyKind;
  topologyCaption: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
  nodes: TopologyNodeView[];
  edges: TopologyEdgeView[];
  calibratorQuestions: CalibratorQuestion[];
  masteryThresholdPercent: number;
  passingCriteria: string[];
  projects: Array<{
    title: string;
    hours: number;
    scenario: string;
    deliverable: string;
    nodeIds: string[];
  }>;
  exams: RealExamFact[];
  nextTracks: Array<{ slug: string; title: string; reason: string }>;
  relatedComplements: Array<{ title: string; href: string }>;
  audio: ParcoursAudioData;
}

export interface ParcoursNavTab {
  slug: string;
  order: number;
  shortTitle: string;
  openCount: number;
}

export interface ParcoursCatalogTrack {
  slug: string;
  title: string;
  tagline: string;
  totalModules: number;
  openLessonsCount: number;
  topics: string[];
  modules: Array<{
    id: string;
    title: string;
    microLessonsCount: number;
    relatedModules: Array<{ label: string; href: string }>;
  }>;
  entryLessonSlug?: string;
}

export function loadParcoursCatalog(rootDir = findRepoRoot()): ParcoursCatalogTrack[] {
  const source = loadParcoursFactsSource(rootDir);
  return PARCOURS_CONFIGS.map((config) => {
    const facts = loadDomainRealFacts(config.slug, rootDir, source);
    const openLessons = new Set(
      facts.modules.flatMap((module) =>
        module.chapters.flatMap((chapter) => (chapter.lessonSlug ? [chapter.lessonSlug] : [])),
      ),
    );
    return {
      slug: config.slug,
      title: config.title,
      tagline: config.tagline,
      totalModules: facts.modules.length,
      openLessonsCount: openLessons.size,
      topics: facts.modules.map((module) => module.title),
      modules: facts.modules.map((module) => ({
        id: module.id,
        title: module.title,
        microLessonsCount: module.microLessonsCount,
        relatedModules: module.relatedModules.map((related) => ({
          label: related.title,
          href: `/parcours/${related.parcoursId}#noeud-${related.id}`,
        })),
      })),
      entryLessonSlug: openLessons.values().next().value,
    };
  });
}

interface NodeCoordinateSpec {
  shortLabel: string;
  x: number;
  y: number;
  stageKind: "fondation" | "coeur" | "specialisation";
  mechanicalQuestion: string;
}

const TRACK_NODES_LAYOUT: Record<string, Record<string, NodeCoordinateSpec>> = {
  "v4-tronc-commun": {
    "TC-00": {
      shortLabel: "Logique & Preuve",
      x: 110,
      y: 88,
      stageKind: "fondation",
      mechanicalQuestion: "Comment distinguer une corrélation répétée d'une véritable cause ?",
    },
    "TC-01": {
      shortLabel: "Binaire & RAM",
      x: 330,
      y: 88,
      stageKind: "fondation",
      mechanicalQuestion: "Où vit le nombre 42 dans le processeur et que reste-t-il après return ?",
    },
    "TC-02": {
      shortLabel: "OS & Isolation",
      x: 550,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion: "Comment le noyau empêche-t-il un processus de lire la RAM d'un autre ?",
    },
    "TC-03": {
      shortLabel: "Réseaux & TCP",
      x: 770,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion: "Pourquoi faut-il exactement trois messages avant d'échanger en TCP ?",
    },
    "TC-04": {
      shortLabel: "Web & API",
      x: 770,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion:
        "Que se passe-t-il entre une action navigateur et une requête HTTP serveur ?",
    },
    "TC-05": {
      shortLabel: "Algo & IA",
      x: 550,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion:
        "Comment concevoir, vérifier et borner un algorithme ou un agent logiciel ?",
    },
    "TC-06": {
      shortLabel: "Maths & Crypto",
      x: 330,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion:
        "Qu'est-ce qu'une preuve mathématique apporte face à un attaquant actif ?",
    },
    "TC-07": {
      shortLabel: "Méthodes Sécu",
      x: 110,
      y: 256,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment tracer les vraies frontières de confiance avant d'auditer ?",
    },
  },
  "v4-branche-a": {
    "A-01": {
      shortLabel: "Pentest Web",
      x: 120,
      y: 92,
      stageKind: "fondation",
      mechanicalQuestion:
        "Comment une requête HTTP valide franchit-elle un contrôle d'autorisation ?",
    },
    "A-02": {
      shortLabel: "API & Workflows",
      x: 335,
      y: 92,
      stageKind: "fondation",
      mechanicalQuestion:
        "Pourquoi deux appels parallèles cassent-ils une règle de solde serveur ?",
    },
    "A-03": {
      shortLabel: "Sécurité Android",
      x: 550,
      y: 92,
      stageKind: "coeur",
      mechanicalQuestion: "Quels secrets un client Android expose-t-il hors du serveur ?",
    },
    "A-04": {
      shortLabel: "Sécurité iOS",
      x: 765,
      y: 92,
      stageKind: "coeur",
      mechanicalQuestion: "Comment le trousseau iOS et les permissions bloquent-ils les fuites ?",
    },
    "A-05": {
      shortLabel: "AppSec & Cloud",
      x: 765,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion:
        "Où la chaîne de compilation et de déploiement introduit-elle un risque ?",
    },
    "A-06": {
      shortLabel: "QA & Perf",
      x: 580,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion:
        "Comment charge et tolérance aux pannes révèlent-elles des défauts critiques ?",
    },
    "A-07": {
      shortLabel: "Fintech & Paiement",
      x: 395,
      y: 256,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment auditer un flux Mobile Money et son idempotence comptable ?",
    },
    "A-08": {
      shortLabel: "Modèles IA",
      x: 215,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion: "Quelle est la frontière exacte entre contexte texte et appel d'outil ?",
    },
    "A-09": {
      shortLabel: "AI Red Team",
      x: 80,
      y: 174,
      stageKind: "specialisation",
      mechanicalQuestion:
        "Comment une donnée externe non fiable détourne-t-elle un agent autonome ?",
    },
  },
  "v4-branche-b": {
    "B-01": {
      shortLabel: "Infra Réseau",
      x: 115,
      y: 88,
      stageKind: "fondation",
      mechanicalQuestion: "Comment segmentation et routage d'entreprise isolent-ils les zones ?",
    },
    "B-02": {
      shortLabel: "Active Directory",
      x: 300,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion:
        "Comment les délégations forment-elles des chemins vers les privilèges AD ?",
    },
    "B-03": {
      shortLabel: "Linux & Privilèges",
      x: 485,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion: "Où la séparation conteneur / noyau cède-t-elle sous mauvais réglages ?",
    },
    "B-04": {
      shortLabel: "Méthode Offensive",
      x: 670,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion: "Comment encadrer une preuve d'impact sans dépasser le périmètre ?",
    },
    "B-05": {
      shortLabel: "Post-Exploitation",
      x: 800,
      y: 172,
      stageKind: "specialisation",
      mechanicalQuestion: "Quelles traces mécaniques subsistent lors d'une persistance simulée ?",
    },
    "B-06": {
      shortLabel: "Red / Purple Team",
      x: 670,
      y: 258,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment traduire une séquence offensive en règle de détection durable ?",
    },
    "B-07": {
      shortLabel: "C & Assembleur",
      x: 115,
      y: 258,
      stageKind: "fondation",
      mechanicalQuestion:
        "Comment une instruction C manipule-t-elle réellement pile, tas et registres ?",
    },
    "B-08": {
      shortLabel: "Recherche Vulns",
      x: 270,
      y: 258,
      stageKind: "coeur",
      mechanicalQuestion: "Comment passer d'un crash reproductible à l'invariant mémoire rompu ?",
    },
    "B-09": {
      shortLabel: "Reverse Software",
      x: 420,
      y: 258,
      stageKind: "coeur",
      mechanicalQuestion: "Comment reconstruire la logique d'un programme compilé sans sources ?",
    },
    "B-10": {
      shortLabel: "Analyse Malwares",
      x: 545,
      y: 172,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment caractériser un binaire suspect en environnement confiné ?",
    },
    "B-11": {
      shortLabel: "Persistance Labo",
      x: 800,
      y: 258,
      stageKind: "specialisation",
      mechanicalQuestion:
        "Comment les protections noyaux modernes résistent-elles ou cèdent-elles ?",
    },
  },
  "v4-branche-c": {
    "C-01": {
      shortLabel: "OSINT Vérifié",
      x: 110,
      y: 88,
      stageKind: "fondation",
      mechanicalQuestion:
        "Comment recouper une source ouverte sans jamais surestimer sa fiabilité ?",
    },
    "C-02": {
      shortLabel: "Fraudes & Scams",
      x: 280,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion:
        "Comment modéliser les circuits financiers et leviers d'une fraude en ligne ?",
    },
    "C-03": {
      shortLabel: "Threat Intel",
      x: 450,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion:
        "Qu'est-ce qui relie techniquement deux campagnes sans attribuer trop vite ?",
    },
    "C-04": {
      shortLabel: "Infra Enquête",
      x: 620,
      y: 88,
      stageKind: "coeur",
      mechanicalQuestion: "Que disent certificats, DNS et hébergement sur une infrastructure ?",
    },
    "C-05": {
      shortLabel: "Acquisition DFIR",
      x: 780,
      y: 88,
      stageKind: "fondation",
      mechanicalQuestion: "Pourquoi toucher le disque original détruit-il la valeur d'une preuve ?",
    },
    "C-06": {
      shortLabel: "Forensics OS",
      x: 780,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion: "Quels artefacts fiables laissent navigateurs et registres Windows ?",
    },
    "C-07": {
      shortLabel: "Forensics RAM",
      x: 620,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion: "Que retrouve-t-on uniquement dans la mémoire vive avant extinction ?",
    },
    "C-08": {
      shortLabel: "Network DFIR",
      x: 450,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion: "Comment corréler captures réseau et journaux pour isoler un pivot ?",
    },
    "C-09": {
      shortLabel: "Mobile & Anti-Spy",
      x: 280,
      y: 256,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment détecter un stalkerware ou accès abusif sur téléphone ?",
    },
    "C-10": {
      shortLabel: "Attribution",
      x: 110,
      y: 256,
      stageKind: "coeur",
      mechanicalQuestion: "Quelle est la frontière entre cluster technique et personne physique ?",
    },
    "C-11": {
      shortLabel: "Preuve & Dossier",
      x: 110,
      y: 172,
      stageKind: "coeur",
      mechanicalQuestion: "Comment préserver l'intégrité et exposer l'incertitude en procédure ?",
    },
    "C-12": {
      shortLabel: "Protection Humaine",
      x: 450,
      y: 172,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment sécuriser une personne exposée sans alerter l'attaquant ?",
    },
  },
  "v4-branche-d": {
    "D-01": {
      shortLabel: "Contrat & Périmètre",
      x: 180,
      y: 96,
      stageKind: "fondation",
      mechanicalQuestion:
        "Où s'arrête votre autorisation légale face à une découverte hors champ ?",
    },
    "D-02": {
      shortLabel: "Rapports & Preuves",
      x: 680,
      y: 96,
      stageKind: "coeur",
      mechanicalQuestion: "Comment rendre un constat immédiatement reproductible et corrigeable ?",
    },
    "D-03": {
      shortLabel: "IA Copilote d'Audit",
      x: 680,
      y: 248,
      stageKind: "coeur",
      mechanicalQuestion: "Comment superviser un assistant IA sans jamais lui déléguer la preuve ?",
    },
    "D-04": {
      shortLabel: "Gouvernance & QA",
      x: 180,
      y: 248,
      stageKind: "specialisation",
      mechanicalQuestion: "Quels contrôles indépendants valident la qualité avant livraison ?",
    },
  },
  "v4-approfondissements": {
    "X-01": {
      shortLabel: "Méthode Conceptuelle",
      x: 440,
      y: 172,
      stageKind: "fondation",
      mechanicalQuestion: "Comment maîtriser vite une technologie inédite sans suivre de recette ?",
    },
    "X-02": {
      shortLabel: "Web/API Avancé",
      x: 180,
      y: 80,
      stageKind: "coeur",
      mechanicalQuestion: "Quels angles morts subsistent sur les frameworks applicatifs modernes ?",
    },
    "X-03": {
      shortLabel: "Chaînes d'Impact",
      x: 440,
      y: 66,
      stageKind: "coeur",
      mechanicalQuestion:
        "Comment relier trois défauts faibles en une preuve rigoureuse d'impact ?",
    },
    "X-04": {
      shortLabel: "Navigateurs & Auth",
      x: 700,
      y: 80,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment isolations d'origine et jetons modernes évoluent-ils ?",
    },
    "X-05": {
      shortLabel: "Cloud & Supply Chain",
      x: 750,
      y: 172,
      stageKind: "specialisation",
      mechanicalQuestion: "Où se cachent les dépendances implicites d'une usine logicielle ?",
    },
    "X-06": {
      shortLabel: "Agents Multi-Systèmes",
      x: 700,
      y: 266,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment auditer un graphe d'agents communiquant entre outils ?",
    },
    "X-07": {
      shortLabel: "Fraude Mobile",
      x: 440,
      y: 278,
      stageKind: "specialisation",
      mechanicalQuestion:
        "Comment falsification d'appareil et attaques mobiles ciblent la Fintech ?",
    },
    "X-08": {
      shortLabel: "Preuves Synthétiques",
      x: 180,
      y: 266,
      stageKind: "specialisation",
      mechanicalQuestion: "Comment vérifier l'authenticité face aux médias synthétiques IA ?",
    },
    "X-09": {
      shortLabel: "OpSec d'Équipe",
      x: 115,
      y: 172,
      stageKind: "coeur",
      mechanicalQuestion: "Comment protéger la sécurité opérationnelle d'une cellule d'enquête ?",
    },
    "X-10": {
      shortLabel: "Audit Code IA",
      x: 280,
      y: 172,
      stageKind: "specialisation",
      mechanicalQuestion: "Quels défauts récurrents introduit le code généré par grands modèles ?",
    },
  },
};

interface ParcoursNarrativeConfig {
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  tagline: string;
  audienceSummary: string;
  useCases: string[];
  prerequisiteNote: string;
  prerequisiteLinks: Array<{ label: string; href: string }>;
  topologyKind: ParcoursTopologyKind;
  topologyCaption: string;
  edges: Array<{ fromId: string; toId: string; signalLabel: string }>;
  calibratorQuestions: CalibratorQuestion[];
  masteryThresholdPercent: number;
  passingCriteria: string[];
  projects: Array<{
    title: string;
    hours: number;
    scenario: string;
    deliverable: string;
    nodeIds: string[];
  }>;
  examIds: string[];
  nextTracks: Array<{ slug: string; title: string; reason: string }>;
}

const PARCOURS_CONFIGS: ParcoursNarrativeConfig[] = [
  {
    slug: "v4-tronc-commun",
    order: 1,
    title: "Tronc commun",
    shortTitle: "Tronc commun",
    tagline:
      "Passez de zéro à une vision exacte de la machine : preuve logique, mémoire vive, systèmes, réseaux et frontières de sécurité.",
    audienceSummary:
      "Conçu pour débuter sans prérequis techniques tout en armant aussi les développeurs et techniciens qui veulent voir ce qui se passe sous les abstractions.",
    useCases: [
      "Comprendre exactement où vivent données, processus et paquets avant d'auditer quoi que ce soit.",
      "Acquérir une méthode scientifique pour prouver une cause et réfuter une fausse hypothèse.",
    ],
    prerequisiteNote: "Aucun prérequis technique : vous commencez au premier étage logique.",
    prerequisiteLinks: [
      {
        label: "Explorer Logique, preuve et recherche",
        href: "/parcours/v4-tronc-commun#noeud-TC-00",
      },
    ],
    topologyKind: "ascension-pipeline",
    topologyCaption:
      "Cliquez sur un étage de la machine pour inspecter ses chapitres réels, ses prérequis et lancer son atelier.",
    edges: [
      { fromId: "TC-00", toId: "TC-01", signalLabel: "méthode → octets" },
      { fromId: "TC-01", toId: "TC-02", signalLabel: "RAM → isolation" },
      { fromId: "TC-02", toId: "TC-03", signalLabel: "hôte → réseau" },
      { fromId: "TC-03", toId: "TC-04", signalLabel: "TCP → HTTP" },
      { fromId: "TC-04", toId: "TC-05", signalLabel: "flux → logique" },
      { fromId: "TC-05", toId: "TC-06", signalLabel: "calcul → preuve" },
      { fromId: "TC-06", toId: "TC-07", signalLabel: "confiance → audit" },
    ],
    calibratorQuestions: [
      {
        id: "tc-q1",
        topic: "Raisonnement causal",
        prompt:
          "Un capteur déclenche une alerte juste après un pic réseau répété. Quelle action prouve un lien causal réel ?",
        targetNodeId: "TC-00",
        options: [
          {
            id: "rep",
            label: "Constater que les deux courbes montent ensemble plusieurs fois de suite.",
            explanation:
              "La répétition montre une corrélation, pas encore la cause : une troisième source peut provoquer les deux.",
            mastered: false,
          },
          {
            id: "do",
            label: "Isoler une variable par intervention et tester s'il existe un contre-exemple.",
            explanation:
              "Exact : seul un test interventionnel ou un contre-exemple tranche entre coïncidence et mécanisme.",
            mastered: true,
          },
        ],
      },
      {
        id: "tc-q2",
        topic: "Mémoire d'un programme",
        prompt:
          "Une fonction se termine avec return après avoir posé secret = 42 sur la pile. Que contient l'adresse juste après le retour ?",
        targetNodeId: "TC-01",
        options: [
          {
            id: "zero",
            label: "Le CPU nettoie automatiquement la zone mémoire à 0x00.",
            explanation:
              "Le retour déplace seulement le pointeur de pile : les anciens octets restent en RAM tant qu'ils ne sont pas écrasés.",
            mastered: false,
          },
          {
            id: "stays",
            label: "La valeur 42 subsiste en RAM jusqu'à sa prochaine réécriture.",
            explanation:
              "Exact : c'est précisément cette persistance d'octets qui explique les fuites et lectures hors limites.",
            mastered: true,
          },
        ],
      },
      {
        id: "tc-q3",
        topic: "Poignée de main TCP",
        prompt:
          "Quel échange prouve enfin au serveur que le client a reçu ses propres paramètres d'ouverture TCP ?",
        targetNodeId: "TC-03",
        options: [
          {
            id: "synack",
            label: "Dès l'envoi du SYN-ACK, le serveur considère la session synchronisée.",
            explanation:
              "Sans le troisième paquet ACK du client, le serveur ignore si son SYN-ACK est parvenu au destinataire.",
            mastered: false,
          },
          {
            id: "ack3",
            label: "Le troisième paquet ACK du client qui acquitte le numéro serveur.",
            explanation:
              "Exact : ce troisième échange boucle la synchronisation bilatérale avant les données applicatives.",
            mastered: true,
          },
        ],
      },
    ],
    masteryThresholdPercent: 75,
    passingCriteria: [
      "Valider au moins 75 % des prédictions et exercices corrigés sans confondre corrélation et causalité.",
      "Réussir au moins 5 des 7 situations pratiques de l'épreuve finale Fondations techniques.",
      "Expliciter systématiquement les limites des modèles simplifiés manipulés en cours.",
    ],
    projects: [
      {
        title: "Tracer une requête HTTPS complète du clavier au serveur",
        hours: 3,
        scenario:
          "Reliez capture mémoire locale, résolution DNS, ouverture TCP, échange cryptographique et traitement applicatif sur un cas concret.",
        deliverable: "Schéma causal annoté avec points de rupture et frontières de confiance.",
        nodeIds: ["TC-01", "TC-02", "TC-03", "TC-04", "TC-06"],
      },
      {
        title: "Réfuter cinq affirmations techniques trompeuses",
        hours: 2.5,
        scenario:
          "Inspectez une architecture web contenant cinq erreurs de conception (pile, autorisation, crypto, alertes) et apportez un contre-exemple pour chacune.",
        deliverable: "Note de diagnostic argumentée et priorités de contrôle.",
        nodeIds: ["TC-00", "TC-04", "TC-05", "TC-07"],
      },
    ],
    examIds: ["EX-01"],
    nextTracks: [
      {
        slug: "v4-branche-a",
        title: "Sécurité applicative, Fintech & IA",
        reason: "Auditer SaaS, API de paiement mobile et agents IA.",
      },
      {
        slug: "v4-branche-b",
        title: "Infrastructure, Offensive & Recherche",
        reason: "Explorer Active Directory, systèmes, assembleur et recherche de failles.",
      },
      {
        slug: "v4-branche-c",
        title: "OSINT, Fraudes, Forensics & Protection",
        reason: "Conduire des enquêtes numériques probantes et protéger des personnes.",
      },
    ],
  },
  {
    slug: "v4-branche-a",
    order: 2,
    title: "Sécurité applicative, Fintech & IA",
    shortTitle: "Applicative, Fintech & IA",
    tagline:
      "Inspectez chaque maillon de la chaîne applicative : navigateur, mobile Android/iOS, API critiques, paiements et agents IA.",
    audienceSummary:
      "Conçu pour les apprenants qui maîtrisent HTTP, les données et l'identité et veulent auditer des produits logiciels complets.",
    useCases: [
      "Évaluer la logique métier d'une API financière et déjouer les défauts d'autorisation ou de concurrence.",
      "Tester la robustesse réelle d'un assistant IA connecté à des outils internes.",
    ],
    prerequisiteNote:
      "Requiert les bases Web, API, algorithmique et cryptographie du Tronc commun.",
    prerequisiteLinks: [
      { label: "Revoir ou vérifier le Tronc commun", href: "/parcours/v4-tronc-commun" },
      { label: "Module Réseaux du Tronc commun", href: "/parcours/v4-tronc-commun#noeud-TC-03" },
    ],
    topologyKind: "trust-chain",
    topologyCaption:
      "Explorez la chaîne de confiance de la surface cliente jusqu'aux flux de paiement et modèles d'intelligence artificielle.",
    edges: [
      { fromId: "A-01", toId: "A-02", signalLabel: "HTTP → workflows" },
      { fromId: "A-02", toId: "A-03", signalLabel: "API → Android" },
      { fromId: "A-03", toId: "A-04", signalLabel: "mobile → iOS" },
      { fromId: "A-04", toId: "A-05", signalLabel: "clients → AppSec" },
      { fromId: "A-05", toId: "A-06", signalLabel: "build → charge" },
      { fromId: "A-06", toId: "A-07", signalLabel: "atomicité → Fintech" },
      { fromId: "A-07", toId: "A-08", signalLabel: "flux → modèles IA" },
      { fromId: "A-08", toId: "A-09", signalLabel: "agents → Red Team" },
      { fromId: "A-09", toId: "A-01", signalLabel: "outils → API" },
    ],
    calibratorQuestions: [
      {
        id: "a-q1",
        topic: "Autorisations API",
        prompt:
          "Un utilisateur connecté avec un jeton valide télécharge la facture d'un autre compte en changeant un identifiant d'URL. Quel est le défaut ?",
        targetNodeId: "A-01",
        options: [
          {
            id: "sig",
            label: "Signature du jeton absente.",
            explanation:
              "Le jeton est authentique, mais le serveur omet de vérifier l'appartenance de la ressource.",
            mastered: false,
          },
          {
            id: "bola",
            label: "Contrôle d'autorisation par objet (BOLA / IDOR) absent côté serveur.",
            explanation:
              "Exact : authentification ne veut jamais dire autorisation sur un objet tierce.",
            mastered: true,
          },
        ],
      },
      {
        id: "a-q2",
        topic: "Concurrence financière",
        prompt:
          "Deux virements simultanés passent le contrôle de solde avant le débit en base. Où corriger ?",
        targetNodeId: "A-07",
        options: [
          {
            id: "btn",
            label: "Désactiver le bouton d'envoi pendant une seconde sur mobile.",
            explanation:
              "L'API reste directement appelable en parallèle sans passer par l'interface graphique.",
            mastered: false,
          },
          {
            id: "tx",
            label: "Rendre vérification et débit atomiques par verrou ou transaction serveur.",
            explanation: "Exact : seule l'atomicité côté stockage garantit l'invariant comptable.",
            mastered: true,
          },
        ],
      },
    ],
    masteryThresholdPercent: 80,
    passingCriteria: [
      "Rejeter les faux positifs d'outils automatisés par vérification mécanique.",
      "Réussir l'épreuve Pentest Web/API ainsi que la spécialisation Mobile/Fintech ou IA.",
      "Distinguer conséquence métier prouvée et hypothèse non testée.",
    ],
    projects: [
      {
        title: "Audit de bout en bout d'un portefeuille Fintech mobile + API",
        hours: 5,
        scenario:
          "Testez sessions mobiles, contrôle d'autorisation par rôle et intégrité d'un virement concurrent sur environnement simulé.",
        deliverable: "Rapport priorisé distinction client / backend + matrice de non-régression.",
        nodeIds: ["A-01", "A-02", "A-03", "A-07"],
      },
      {
        title: "Red Team d'un assistant IA doté d'outils internes",
        hours: 4,
        scenario:
          "Évaluez l'isolation entre documents externes lus par le modèle et appels de fonctions privilégiées.",
        deliverable: "Batterie de scénarios adversariaux reproductibles et limites documentées.",
        nodeIds: ["A-08", "A-09"],
      },
    ],
    examIds: ["EX-02", "EX-03", "EX-05"],
    nextTracks: [
      {
        slug: "v4-branche-d",
        title: "Pratique professionnelle, Gouvernance & Qualité",
        reason: "Transformer vos audits techniques en livrables professionnels défendables.",
      },
      {
        slug: "v4-branche-b",
        title: "Infrastructure, Offensive & Recherche",
        reason: "Descendre sous la couche applicative vers les systèmes et binaires.",
      },
    ],
  },
  {
    slug: "v4-branche-b",
    order: 3,
    title: "Infrastructure, Offensive & Recherche",
    shortTitle: "Offensive & Recherche",
    tagline:
      "Faites converger la maîtrise d'Active Directory et des systèmes d'entreprise avec l'assembleur C, le reverse et l'analyse de failles.",
    audienceSummary:
      "Conçu pour comprendre comment infrastructures d'entreprise et programmes compilés s'articulent face aux attaques et à la détection.",
    useCases: [
      "Cartographier des chemins de privilèges Active Directory en liant chaque action aux télémétries de détection.",
      "Analyser un binaire compilé et diagnostiquer une corruption mémoire reproductible.",
    ],
    prerequisiteNote:
      "Exige le Tronc commun (architecture mémoire, OS Linux/Windows, réseaux TCP).",
    prerequisiteLinks: [
      { label: "Tronc commun complet", href: "/parcours/v4-tronc-commun" },
      {
        label: "Module Architecture & Mémoire du Tronc commun",
        href: "/parcours/v4-tronc-commun#noeud-TC-01",
      },
    ],
    topologyKind: "dual-convergence",
    topologyCaption:
      "Voie haute : infrastructures & Active Directory. Voie basse : C, assembleur & reverse engineering convergeant vers l'émulation et la recherche.",
    edges: [
      { fromId: "B-01", toId: "B-02", signalLabel: "réseau → AD" },
      { fromId: "B-02", toId: "B-03", signalLabel: "identités → OS" },
      { fromId: "B-03", toId: "B-04", signalLabel: "privilèges → méthode" },
      { fromId: "B-04", toId: "B-05", signalLabel: "accès → persistance" },
      { fromId: "B-05", toId: "B-06", signalLabel: "traces → détection" },
      { fromId: "B-07", toId: "B-08", signalLabel: "CPU → crashs" },
      { fromId: "B-08", toId: "B-09", signalLabel: "failles → reverse" },
      { fromId: "B-09", toId: "B-10", signalLabel: "binaire → malware" },
      { fromId: "B-10", toId: "B-11", signalLabel: "défense → noyau" },
      { fromId: "B-06", toId: "B-11", signalLabel: "convergence labo" },
    ],
    calibratorQuestions: [
      {
        id: "b-q1",
        topic: "Protections mémoire CPU",
        prompt: "Qu'empêche exactement la propriété matérielle W^X (NX) ?",
        targetNodeId: "B-07",
        options: [
          {
            id: "write",
            label: "Toute modification de variables locales sur la pile.",
            explanation:
              "Le programme doit pouvoir écrire en pile ; W^X bloque l'exécution de code depuis une page inscriptible.",
            mastered: false,
          },
          {
            id: "exec",
            label:
              "L'exécution par le CPU d'instructions situées dans une page autorisée en écriture.",
            explanation:
              "Exact : une page mémoire ne doit jamais être simultanément inscriptible et exécutable.",
            mastered: true,
          },
        ],
      },
      {
        id: "b-q2",
        topic: "Chemins Active Directory",
        prompt: "Pourquoi raisonner par graphe de délégations dans Active Directory ?",
        targetNodeId: "B-02",
        options: [
          {
            id: "single",
            label: "Parce que seul le mot de passe administrateur compte.",
            explanation:
              "Des droits transitifs légitimes relient souvent un compte modeste à un actif critique.",
            mastered: false,
          },
          {
            id: "transitive",
            label:
              "Pour révéler des enchaînements indirects de droits jusqu'au contrôleur de domaine.",
            explanation:
              "Exact : le graphe expose les maillons faibles transversaux invisibles à plat.",
            mastered: true,
          },
        ],
      },
    ],
    masteryThresholdPercent: 80,
    passingCriteria: [
      "Définir conditions d'arrêt, preuves bornées et restauration avant toute simulation.",
      "Relier systématiquement chaque action offensive simulée à ses traces côté défense.",
      "Réussir l'épreuve Opérations offensives avancées et recherche.",
    ],
    projects: [
      {
        title: "Graphe d'élévation AD et télémétrie Purple Team",
        hours: 6,
        scenario:
          "Identifiez un chemin de délégation critique dans un domaine fictif et documentez les journaux permettant sa détection précoce.",
        deliverable: "Graphe annoté + fiches de détection et procédure de remise en état.",
        nodeIds: ["B-01", "B-02", "B-04", "B-06"],
      },
      {
        title: "Triage d'un crash mémoire et rétro-ingénierie contrôlée",
        hours: 6,
        scenario:
          "Analysez un programme pédagogique en C/assembleur pour isoler la cause exacte d'un débordement et valider son correctif.",
        deliverable: "Trace mémoire commentée + reproducer minimal.",
        nodeIds: ["B-07", "B-08", "B-09"],
      },
    ],
    examIds: ["EX-04"],
    nextTracks: [
      {
        slug: "v4-branche-c",
        title: "OSINT, Fraudes, Forensics & Protection",
        reason: "Croiser vision offensive et investigation numérique bas niveau.",
      },
      {
        slug: "v4-branche-d",
        title: "Pratique professionnelle, Gouvernance & Qualité",
        reason: "Préparer les restitutions client et l'examen intégrateur agence.",
      },
    ],
  },
  {
    slug: "v4-branche-c",
    order: 4,
    title: "OSINT, Fraudes, Forensics & Protection",
    shortTitle: "OSINT, Fraudes & Forensics",
    tagline:
      "Enquêtez sur les fraudes numériques, collectez et analysez des preuves intègres (disque, RAM, réseau, mobile) et protégez les personnes exposées.",
    audienceSummary:
      "Destiné aux analystes OSINT, intervenants DFIR et défenseurs confrontés aux campagnes de fraude et de surveillance abusive.",
    useCases: [
      "Reconstruire la chronologie exacte d'une intrusion sans rompre la chaîne de conservation.",
      "Établir un protocole de sécurité consenti face à un soupçon de stalkerware.",
    ],
    prerequisiteNote: "Requiert rigueur causale, OS et réseaux du Tronc commun.",
    prerequisiteLinks: [
      { label: "Tronc commun (socle requis)", href: "/parcours/v4-tronc-commun" },
      {
        label: "Module Logique & Preuve du Tronc commun",
        href: "/parcours/v4-tronc-commun#noeud-TC-00",
      },
    ],
    topologyKind: "evidence-timeline",
    topologyCaption:
      "Parcourez la chaîne probante de la collecte ouverte vérifiée jusqu'à l'acquisition forensique, l'attribution critique et la protection humaine.",
    edges: [
      { fromId: "C-01", toId: "C-02", signalLabel: "sources → fraude" },
      { fromId: "C-02", toId: "C-03", signalLabel: "signaux → campagnes" },
      { fromId: "C-03", toId: "C-04", signalLabel: "IOC → infra" },
      { fromId: "C-04", toId: "C-05", signalLabel: "collecte → copie intègre" },
      { fromId: "C-05", toId: "C-06", signalLabel: "copie → OS" },
      { fromId: "C-06", toId: "C-07", signalLabel: "disque → RAM" },
      { fromId: "C-07", toId: "C-08", signalLabel: "hôte → réseau" },
      { fromId: "C-08", toId: "C-09", signalLabel: "flux → mobile" },
      { fromId: "C-09", toId: "C-10", signalLabel: "artefacts → critique" },
      { fromId: "C-10", toId: "C-11", signalLabel: "faits → dossier" },
      { fromId: "C-11", toId: "C-12", signalLabel: "preuve → protection" },
    ],
    calibratorQuestions: [
      {
        id: "c-q1",
        topic: "Chaîne de preuve",
        prompt: "Pourquoi ne jamais travailler directement sur le support original saisi ?",
        targetNodeId: "C-05",
        options: [
          {
            id: "slow",
            label: "Uniquement pour aller plus vite sur un disque SSD.",
            explanation:
              "Toute lecture directe risque d'altérer horodatages et métadonnées, invalidant la preuve.",
            mastered: false,
          },
          {
            id: "hash",
            label: "Pour préserver l'intégrité sur copie vérifiée par empreinte cryptographique.",
            explanation:
              "Exact : acquisition bit-à-bit, hachage et journalisation prouvent qu'aucun octet n'a été altéré.",
            mastered: true,
          },
        ],
      },
      {
        id: "c-q2",
        topic: "Limite d'attribution",
        prompt: "Deux domaines frauduleux partagent un serveur. Que pouvez-vous affirmer ?",
        targetNodeId: "C-10",
        options: [
          {
            id: "civil",
            label: "Qu'une même personne civile en est forcément l'auteure.",
            explanation:
              "Un hébergement ou kit partagé ne prouve jamais à lui seul une identité physique unique.",
            mastered: false,
          },
          {
            id: "infra",
            label:
              "Un recoupement d'infrastructure technique, distinct de l'identification civile.",
            explanation:
              "Exact : distinguer infrastructure, comptes et individu évite les erreurs d'attribution.",
            mastered: true,
          },
        ],
      },
    ],
    masteryThresholdPercent: 80,
    passingCriteria: [
      "Traçabilité complète et empreintes documentées sur chaque artefact analysé.",
      "Exposition honnête des incertitudes et hypothèses alternatives écartées.",
      "Réussite d'au moins deux des trois épreuves finales d'enquête et protection.",
    ],
    projects: [
      {
        title: "Reconstruire une campagne de fraude et réfuter une piste trompeuse",
        hours: 5,
        scenario:
          "Triez faits prouvés, rumeurs et corrélations fragiles sur une campagne simulée pour bâtir un graphe temporel sourcé.",
        deliverable:
          "Dossier d'enquête structuré + liste des vérifications officielles manquantes.",
        nodeIds: ["C-01", "C-02", "C-03", "C-10", "C-11"],
      },
    ],
    examIds: ["EX-06", "EX-07", "EX-08"],
    nextTracks: [
      {
        slug: "v4-branche-d",
        title: "Pratique professionnelle, Gouvernance & Qualité",
        reason: "Restituer vos dossiers au plus haut standard contractuel et probant.",
      },
    ],
  },
  {
    slug: "v4-branche-d",
    order: 5,
    title: "Pratique professionnelle, Gouvernance & Qualité",
    shortTitle: "Pratique pro & Gouvernance",
    tagline:
      "Du contrat initial jusqu'à la soutenance contradictoire : transformez vos compétences techniques en missions rigoureuses et gouvernables.",
    audienceSummary:
      "Destiné aux profils avancés prêts à cadrer légalement, piloter un copilote IA sans perdre la maîtrise et défendre des conclusions face à un jury.",
    useCases: [
      "Définir un périmètre d'audit sans zone grise juridique ni perte de preuve.",
      "Affronter l'examen intégrateur combinant audit fintech et investigation parallèle.",
    ],
    prerequisiteNote:
      "Requiert le Tronc commun et au moins une spécialisation technique (Web/IA, Offensive ou Forensics).",
    prerequisiteLinks: [
      { label: "Tronc commun", href: "/parcours/v4-tronc-commun" },
      { label: "Sécurité applicative, Fintech & IA", href: "/parcours/v4-branche-a" },
    ],
    topologyKind: "mission-loop",
    topologyCaption:
      "Visualisez la boucle qualité complète d'une mission professionnelle encadrée jusqu'à la revue contradictoire.",
    edges: [
      { fromId: "D-01", toId: "D-02", signalLabel: "périmètre → preuves" },
      { fromId: "D-02", toId: "D-03", signalLabel: "rapport → copilote supervisé" },
      { fromId: "D-03", toId: "D-04", signalLabel: "vérification → qualité" },
      { fromId: "D-04", toId: "D-01", signalLabel: "amélioration continue" },
    ],
    calibratorQuestions: [
      {
        id: "d-q1",
        topic: "Respect du périmètre",
        prompt:
          "En plein audit autorisé, une clé trouvée donne accès à un serveur tiers hors contrat. Quelle conduite ?",
        targetNodeId: "D-01",
        options: [
          {
            id: "enter",
            label: "Y accéder brièvement pour démontrer l'impact maximal.",
            explanation:
              "Franchir une limite contractuelle rompt le cadre légal quelle que soit l'intention.",
            mastered: false,
          },
          {
            id: "halt",
            label: "S'arrêter à la frontière autorisée, prouver l'exposition et alerter.",
            explanation: "Exact : la preuve professionnelle respecte strictement le mandat écrit.",
            mastered: true,
          },
        ],
      },
      {
        id: "d-q2",
        topic: "Livrables exploitables",
        prompt: "Comment rendre un rapport utile autant à la direction qu'aux ingénieurs ?",
        targetNodeId: "D-02",
        options: [
          {
            id: "dump",
            label: "Exporter l'ensemble brut des alertes de scanner.",
            explanation:
              "Sans tri des faux positifs ni étapes de reproduction, les équipes corrigent à l'aveugle.",
            mastered: false,
          },
          {
            id: "split",
            label: "Séparer risque métier, reproduction reproductible et plan de re-test.",
            explanation:
              "Exact : chaque destinataire obtient immédiatement de quoi décider ou corriger.",
            mastered: true,
          },
        ],
      },
    ],
    masteryThresholdPercent: 85,
    passingCriteria: [
      "Respect absolu des périmètres et critères d'arrêt dans les simulations.",
      "Livrables reproductibles de bout en bout par un pair indépendant.",
      "Défense argumentée et mention explicite des limites hors compétence.",
    ],
    projects: [
      {
        title: "Mission agence complète sur fintech fictive",
        hours: 8,
        scenario:
          "Enchaînez cadrage contrat, revue Web/mobile/IA, enquête fraude associée et soutenance devant revue contradictoire.",
        deliverable: "Contrat de périmètre, rapports technique/exécutif et dossier probant.",
        nodeIds: ["D-01", "D-02", "D-03", "D-04"],
      },
    ],
    examIds: ["EX-09"],
    nextTracks: [
      {
        slug: "v4-approfondissements",
        title: "Approfondissements transversaux",
        reason:
          "Prolonger votre pratique sur le cloud-native, les navigateurs et l'audit de code IA.",
      },
    ],
  },
  {
    slug: "v4-approfondissements",
    order: 6,
    title: "Approfondissements transversaux",
    shortTitle: "Approfondissements",
    tagline:
      "Dix modules pour compléter un acquis précis : méthodes, plateformes, cloud, IA, enquête et protection. Choisissez selon le sujet que vous travaillez.",
    audienceSummary:
      "Pensé comme une constellation modulaire pour consolider une compétence spécifique sans suivre un chemin rigide.",
    useCases: [
      "Renforcer une méthode d’apprentissage ou de validation selon le problème traité.",
      "Approfondir les navigateurs, la chaîne logicielle, le mobile et les systèmes IA.",
      "Vérifier des contenus synthétiques et protéger une équipe d’investigation.",
    ],
    prerequisiteNote:
      "Ces modules enrichissent le tronc commun et les branches. Il n’existe pas d’ordre de passage unique entre eux.",
    prerequisiteLinks: [
      { label: "Socle Tronc commun", href: "/parcours/v4-tronc-commun" },
      { label: "Sécurité applicative & IA", href: "/parcours/v4-branche-a" },
    ],
    topologyKind: "constellation",
    topologyCaption:
      "Choisissez un complément selon votre sujet. Les liens thématiques proposés ne constituent pas un ordre de passage obligatoire.",
    edges: [],
    calibratorQuestions: [
      {
        id: "x-q1",
        topic: "Apprentissage autonome",
        prompt: "Comment valider votre compréhension d'un protocole récent sans cours pré-digéré ?",
        targetNodeId: "X-01",
        options: [
          {
            id: "cmd",
            label: "Mémoriser une suite de commandes trouvées en ligne.",
            explanation:
              "Les commandes deviennent obsolètes dès qu'une hypothèse ou version change.",
            mastered: false,
          },
          {
            id: "spec",
            label:
              "Identifier spécifications primaires, invariants de confiance et tests minimaux.",
            explanation: "Exact : cette démarche transférable est le cœur du module X-01.",
            mastered: true,
          },
        ],
      },
      {
        id: "x-q2",
        topic: "Code produit par IA",
        prompt: "Quel réflexe prime face à une fonction critique générée par un copilote IA ?",
        targetNodeId: "X-10",
        options: [
          {
            id: "trust",
            label: "Accepter si la syntaxe compile sans avertissement.",
            explanation:
              "Un code qui compile proprement peut omettre autorisations, validation ou bornes mémoire.",
            mastered: false,
          },
          {
            id: "audit",
            label: "Vérifier frontières de confiance, hypothèses implicites et tests adversariaux.",
            explanation:
              "Exact : la relecture mécanique reste entièrement sous responsabilité humaine.",
            mastered: true,
          },
        ],
      },
    ],
    masteryThresholdPercent: 85,
    passingCriteria: [
      "Appuyer chaque analyse avancée sur la documentation primaire vérifiée.",
      "Justifier le lien causal avec les prérequis système, web ou investigation sous-jacents.",
    ],
    projects: [
      {
        title: "Revue supply chain et code IA sur service cloud-native",
        hours: 5,
        scenario:
          "Vérifiez dépendances, identités navigateur et logique produite par copilote IA sur un service conteneurisé.",
        deliverable: "Grille de contrôle causale et tests ciblés sur le code critique.",
        nodeIds: ["X-04", "X-05", "X-10"],
      },
    ],
    examIds: ["EX-05", "EX-09"],
    nextTracks: [
      {
        slug: "v4-branche-d",
        title: "Pratique professionnelle, Gouvernance & Qualité",
        reason: "Intégrer ces approfondissements dans l'épreuve finale complète.",
      },
    ],
  },
];

export function loadBespokeParcoursPage(
  slug: string,
  rootDir = findRepoRoot(),
): {
  page: BespokeParcoursPageData | undefined;
  navTabs: ParcoursNavTab[];
} {
  const source = loadParcoursFactsSource(rootDir);
  const navTabs: ParcoursNavTab[] = PARCOURS_CONFIGS.map((cfg) => {
    const facts = loadDomainRealFacts(cfg.slug, rootDir, source);
    const openCount = facts.modules.reduce(
      (sum, m) => sum + m.chapters.filter((c) => c.isOpen).length,
      0,
    );
    return {
      slug: cfg.slug,
      order: cfg.order,
      shortTitle: cfg.shortTitle,
      openCount,
    };
  });

  const cfg = PARCOURS_CONFIGS.find((c) => c.slug === slug);
  if (!cfg) return { page: undefined, navTabs };

  const facts = loadDomainRealFacts(cfg.slug, rootDir, source);
  const layout = TRACK_NODES_LAYOUT[cfg.slug] ?? {};
  const localIds = new Set(facts.modules.map((m) => m.id));

  const nodes: TopologyNodeView[] = facts.modules.map((mod, idx) => {
    const pos = layout[mod.id] ?? {
      shortLabel: mod.title.slice(0, 22),
      x: 120 + (idx % 4) * 210,
      y: 90 + Math.floor(idx / 4) * 165,
      stageKind: "coeur" as const,
      mechanicalQuestion: `Quel mécanisme fondamental structure ${mod.title} ?`,
    };

    const internalDeps = mod.prerequisiteModuleIds.filter((id) => localIds.has(id));
    const externalDeps = mod.prerequisiteModuleIds
      .filter((id) => !localIds.has(id))
      .slice(0, 3)
      .map((id) => {
        const info = facts.moduleTitleById[id];
        return {
          label: info?.title ?? id,
          href: info ? `/parcours/${info.parcoursId}#noeud-${id}` : "/parcours/v4-tronc-commun",
        };
      });

    const summary =
      mod.competencies.length >= 2
        ? `${mod.competencies[0]} · ${mod.competencies[1]}.`
        : `${mod.title} structuré autour de ${mod.chapters.length} séquences progressives et ${mod.microLessonsCount} leçons.`;

    return {
      id: mod.id,
      order: mod.order,
      title: mod.title,
      shortLabel: pos.shortLabel,
      x: pos.x,
      y: pos.y,
      stageKind: pos.stageKind,
      durationLabel: formatMinutesHuman(mod.totalMinutes),
      microLessonsCount: mod.microLessonsCount,
      microLessons: mod.microLessons,
      mechanicalQuestion: pos.mechanicalQuestion,
      summary,
      competencies:
        mod.competencies.length > 0
          ? mod.competencies
          : mod.chapters.slice(0, 3).map((ch) => ch.title),
      chapters: mod.chapters,
      ...(mod.openLessonSlug ? { openLessonSlug: mod.openLessonSlug } : {}),
      dependsOnIds: internalDeps,
      externalDeps,
      relatedModules: mod.relatedModules.map((related) => ({
        label: related.title,
        href: `/parcours/${related.parcoursId}#noeud-${related.id}`,
      })),
    };
  });

  const validIds = new Set(nodes.map((n) => n.id));
  const edges: TopologyEdgeView[] = cfg.edges
    .filter((e) => validIds.has(e.fromId) && validIds.has(e.toId))
    .map((e, i) => ({
      id: `edge-${i}-${e.fromId}-${e.toId}`,
      fromId: e.fromId,
      toId: e.toId,
      signalLabel: e.signalLabel,
    }));

  const entryLessonSlug = nodes.find((n) => n.openLessonSlug)?.openLessonSlug;
  const openLessonsCount = nodes.reduce(
    (sum, n) => sum + n.chapters.filter((c) => c.isOpen).length,
    0,
  );
  const exams = cfg.examIds
    .map((id) => facts.examsById[id])
    .filter((ex): ex is RealExamFact => Boolean(ex));

  const audio = loadParcoursAudio(cfg.slug, rootDir);

  return {
    navTabs,
    page: {
      slug: cfg.slug,
      order: cfg.order,
      title: cfg.title,
      shortTitle: cfg.shortTitle,
      tagline: cfg.tagline,
      audienceSummary: cfg.audienceSummary,
      useCases: cfg.useCases,
      prerequisiteNote: cfg.prerequisiteNote,
      prerequisiteLinks: cfg.prerequisiteLinks,
      totalDurationLabel: formatMinutesHuman(facts.totalMinutes),
      totalModules: facts.modules.length,
      totalChapters: facts.totalChapters,
      totalMicroLessons: facts.totalMicroLessons,
      openLessonsCount,
      ...(entryLessonSlug ? { entryLessonSlug } : {}),
      topologyKind: cfg.topologyKind,
      topologyCaption: cfg.topologyCaption,
      viewBoxWidth: 880,
      viewBoxHeight: 344,
      nodes,
      edges,
      calibratorQuestions: cfg.calibratorQuestions,
      masteryThresholdPercent: cfg.masteryThresholdPercent,
      passingCriteria: cfg.passingCriteria,
      projects: cfg.projects,
      exams,
      nextTracks: cfg.nextTracks,
      relatedComplements:
        cfg.slug === "v4-approfondissements"
          ? []
          : loadDomainRealFacts("v4-approfondissements", rootDir, source)
              .modules.filter((module) =>
                module.relatedModules.some((related) => related.parcoursId === cfg.slug),
              )
              .map((module) => ({
                title: module.title,
                href: `/parcours/v4-approfondissements#noeud-${module.id}`,
              })),
      audio,
    },
  };
}

export function listAllParcoursSlugs(): string[] {
  return PARCOURS_CONFIGS.map((c) => c.slug);
}
