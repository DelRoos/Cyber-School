export interface ChapterGuidance {
  title: string;
  minutes: number;
  question: string;
  intuition: string;
  takeaway: string;
  limit: string;
}

export const chapterGuidance: Record<string, ChapterGuidance> = {
  "step-cpu-bytes": {
    title: "Comment la machine lit un nombre",
    minutes: 8,
    question: "Quand vous écrivez 0x12345678, dans quel ordre les octets tombent-ils en RAM ?",
    intuition:
      "Chaque case RAM ne stocke qu'un seul octet (8 bits). Sur x86-64 (Little-Endian), l'octet de poids faible (LSB, ici 78) est écrit à l'adresse la plus basse (0x1008).",
    takeaway:
      "Une adresse repère une case d'un octet ; un nombre de 32 bits occupe quatre cases dont il faut connaître l'ordre.",
    limit:
      "Ce modèle abstrait les caches L1/L2/L3 et le pipeline superscalaire ; l'ordre little-endian des octets en RAM reste identique.",
  },
  "step-virtual-segments": {
    title: "Pourquoi chaque programme a son espace",
    minutes: 8,
    question: "Deux programmes peuvent-ils utiliser la même adresse 0x400000 sans collision ?",
    intuition:
      "Chaque processus manipule des adresses virtuelles traduites par la MMU vers des cadres physiques distincts, tout en contrôlant les droits r/w/x.",
    takeaway:
      "Une adresse ne suffit jamais : la MMU exige une traduction valide ET les bits r/w/x autorisés (sinon SIGSEGV).",
    limit:
      "Linux x86-64 utilise des tables de pages à 4/5 niveaux et un cache TLB ; l'isolation et le contrôle matériel rwx sont fidèles.",
  },
  "step-call-stack-abi": {
    title: "Suivre un appel de fonction",
    minutes: 10,
    question:
      "Que fait le CPU au return d'une fonction : efface-t-il les variables ou bouge-t-il juste RSP ?",
    intuition:
      "La pile croît vers les adresses basses. Au retour (RET), seul RSP remonte en O(1) : les anciens octets restent présents en fantôme jusqu'au prochain appel.",
    takeaway:
      "Fin de vie ne veut pas dire mise à zéro : les octets libérés demeurent lisibles tant qu'une nouvelle trame ne les écrase pas.",
    limit:
      "En -O2, un compilateur peut garder des locales en registres ou omettre RBP (-fomit-frame-pointer).",
  },
  "step-pointers-dangling": {
    title: "Une adresse n’est pas une garantie",
    minutes: 8,
    question: "Que lit un pointeur *p si l'objet qu'il désignait vient de disparaître ?",
    intuition:
      "Un pointeur ne contient qu'un numéro de case mémoire. Quand l'objet est libéré puis remplacé à la même adresse, le pointeur lit silencieusement la nouvelle donnée.",
    takeaway:
      "Même adresse ne garantit ni même objet, ni objet vivant. Toujours aligner la durée de vie ou mettre p = NULL après free().",
    limit:
      "En C, déréférencer un pointeur pendant est un Undefined Behavior (UB) dont le résultat réel dépend du compilateur et de la pile.",
  },
  "step-heap-allocators": {
    title: "Réserver et libérer de la mémoire",
    minutes: 10,
    question:
      "Pourquoi malloc(24) consomme-t-il plus de 24 octets et comment naît un Use-After-Free ?",
    intuition:
      "L'allocateur ajoute un en-tête de 8 octets, aligne sur 16 octets (padding) et réutilise les blocs libres : si ptrB reçoit le bloc tout juste libéré de ptrA, tous deux pointent dessus.",
    takeaway:
      "Sur le tas, réserver, utiliser et libérer ne mettent pas à jour les anciens pointeurs : free(ptrA) sans NULL ouvre la porte au CWE-416.",
    limit:
      "Les allocateurs réels (ptmalloc2, jemalloc, mimalloc) utilisent tcache/fastbins et basculent vers mmap vers 128 Ko.",
  },
  "step-models-uaf-reality": {
    title: "Qui décide de la durée de vie ?",
    minutes: 10,
    question:
      "C, Rust et un ramasse-miettes traitent-ils le même bug à la compilation ou à l'exécution ?",
    intuition:
      "C laisse le risque au développeur (fuite ou UAF), Rust prouve la possession à la compilation (Borrow Checker), et le GC balaie périodiquement depuis GC Roots.",
    takeaway:
      "Même code métier, trois garanties : manuel en C, statique en Rust, tracé à l'exécution en GC — et le compilateur peut même optimiser toute trame en registre.",
    limit:
      "En production, unsafe en Rust contourne le borrow checker et un comptage de références pur sans détecteur fuit sur les cycles.",
  },
};
