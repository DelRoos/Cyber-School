export interface ChapterGuidance {
  title: string;
  minutes: number;
  question: string;
  intuition: string;
  example: string;
  experiment: string;
  takeaway: string;
  limit: string;
}

export const chapterGuidance: Record<string, ChapterGuidance> = {
  "step-cpu-bytes": {
    title: "Comment la machine lit un nombre",
    minutes: 35,
    question: "Quand vous écrivez 42, que contient réellement la mémoire ?",
    intuition:
      "Imaginez une longue rangée de cases numérotées. Chaque case contient un octet, soit huit bits. Son numéro est son adresse ; son contenu est sa valeur. Le processeur est la partie de la machine qui suit les instructions pour lire, calculer et écrire dans ces cases.",
    example:
      "Prenons 0x12345678. Le préfixe 0x indique une écriture en base 16 : chaque paire de chiffres représente un octet. Ce nombre occupe quatre cases. Sur x86-64, l’octet de poids faible vient à l’adresse la plus basse : 78 à 0x1008, puis 56, 34 et 12. La valeur du nombre reste la même ; seul l’ordre de rangement change.",
    experiment:
      "Avancez avec « Suivant » jusqu’à l’écriture. Repérez les quatre cases à partir de 0x1008. Avant le dernier pas, prédisez l’octet qui va apparaître dans la première case.",
    takeaway:
      "Une adresse indique où lire. Un octet indique ce qui est stocké. Pour reconstruire une valeur de plusieurs octets, il faut aussi connaître leur ordre.",
    limit:
      "Ce modèle représente une exécution simplifiée x86-64. Il ne modélise ni les caches, ni les instructions exécutées en parallèle. D’autres architectures peuvent ranger les octets dans un autre ordre.",
  },
  "step-virtual-segments": {
    title: "Pourquoi chaque programme a son espace",
    minutes: 40,
    question: "Deux programmes peuvent-ils utiliser la même adresse sans partager la même donnée ?",
    intuition:
      "Oui : une adresse vue par un programme est généralement virtuelle. Le système d’exploitation et le matériel traduisent cette adresse vers la mémoire physique. Chaque processus, c’est-à-dire chaque programme en cours d’exécution, possède ses propres correspondances et permissions.",
    example:
      "Pensez à deux immeubles ayant chacun un appartement 12. Le numéro seul ne désigne pas le même logement. De la même façon, l’adresse virtuelle 0x400000 dans deux processus peut désigner des pages physiques différentes. Dans un processus, la zone .text contient normalement les instructions et n’autorise pas leur réécriture ordinaire.",
    experiment:
      "Comparez les processus P1 et P2, puis tentez une écriture dans .text. Prédisez d’abord si la présence d’une adresse suffit à autoriser l’écriture.",
    takeaway:
      "Pour accéder à une donnée, une adresse ne suffit pas : la traduction doit exister et les permissions doivent autoriser l’opération.",
    limit:
      "La carte représente un processus Linux simplifié. Les adresses et les tailles sont illustratives. L’ASLR fait varier certaines positions ; il ne remplace pas le contrôle des permissions.",
  },
  "step-call-stack-abi": {
    title: "Suivre un appel de fonction",
    minutes: 50,
    question: "Comment une fonction retrouve-t-elle son chemin après en avoir appelé une autre ?",
    intuition:
      "La pile d’appels garde les informations nécessaires aux fonctions en cours. Chaque appel peut ajouter une trame : une zone qui contient notamment des données locales et des informations de retour. Au retour, cette zone redevient disponible. Disponible ne signifie pas effacée.",
    example:
      "main appelle calculer, qui appelle doubler. La trame de doubler est ajoutée au sommet. Quand doubler termine, calculer reprend ; quand calculer termine, main reprend. Dans le modèle x86-64 présenté, la pile grandit vers les adresses plus basses. RSP repère le sommet ; RBP sert ici de repère dans la trame.",
    experiment:
      "Avancez jusqu’à un appel imbriqué, puis jusqu’au retour. Regardez quelles cases ne sont plus utilisées et vérifiez si leurs octets ont été remis à zéro.",
    takeaway:
      "La durée de vie d’une variable locale se termine avec son contexte. Les anciens octets peuvent rester présents sans que la variable existe encore.",
    limit:
      "La forme exacte d’une trame dépend de l’architecture, des conventions d’appel et des optimisations. Un compilateur peut conserver une variable dans un registre et ne pas utiliser RBP comme ici.",
  },
  "step-pointers-dangling": {
    title: "Une adresse n’est pas une garantie",
    minutes: 40,
    question: "Que reste-t-il d’un pointeur quand la donnée qu’il désignait n’existe plus ?",
    intuition:
      "Un pointeur contient une adresse. Lire à travers ce pointeur s’appelle le déréférencer. Ce nombre ne vous dit pas si l’objet est encore vivant. Quand l’objet disparaît, le pointeur peut conserver son adresse : il devient pendant.",
    example:
      "Une fonction crée une variable locale contenant 42 et renvoie son adresse. Après le retour, cette variable n’existe plus. Un autre appel réutilise la même zone et y place 99. L’ancien pointeur n’a pas changé, mais il n’autorise plus une lecture valide de la variable d’origine.",
    experiment:
      "Ouvrez le laboratoire de la pile, choisissez « Pointeur pendant », puis avancez jusqu’à la réutilisation de la trame. Revenez à ce chapitre pour répondre aux questions.",
    takeaway:
      "Même adresse ne signifie ni même objet, ni objet vivant. La validité d’un pointeur dépend aussi de la durée de vie de sa cible.",
    limit:
      "En C, utiliser une adresse vers un objet dont la durée de vie est terminée peut avoir un comportement indéfini. La réécriture montrée est une illustration possible, pas un résultat garanti.",
  },
  "step-heap-allocators": {
    title: "Réserver et libérer de la mémoire",
    minutes: 50,
    question: "Comment conserver des données après le retour d’une fonction ?",
    intuition:
      "Une allocation dynamique réserve un bloc dont la durée de vie ne suit pas automatiquement celle de la fonction. Un allocateur organise ces blocs dans le tas. En C, malloc demande un bloc et free le rend disponible. Libérer un bloc ne met pas automatiquement tous les pointeurs qui le désignent à zéro.",
    example:
      "Vous réservez 16 octets et gardez leur adresse dans p. Après free(p), l’allocateur peut attribuer la même zone à q. Relire p est une utilisation après libération, appelée use-after-free : l’adresse a pu rester identique, mais l’ancien objet n’est plus valide.",
    experiment:
      "Comparez une allocation normale et le scénario « Use-After-Free ». Observez les blocs libres puis réutilisés. Distinguez la taille demandée et la place réellement occupée.",
    takeaway:
      "Réserver, utiliser, libérer : ces trois moments définissent la durée de vie d’un bloc. Une zone libérée peut être réutilisée sans que les anciens pointeurs soient informés.",
    limit:
      "L’allocateur est un modèle pédagogique. Les tailles d’en-tête, règles d’alignement et stratégies de réutilisation dépendent de l’implémentation ; elles ne décrivent pas tous les malloc.",
  },
  "step-models-uaf-reality": {
    title: "Qui décide de la durée de vie ?",
    minutes: 55,
    question: "Les langages résolvent-ils tous la gestion mémoire de la même façon ?",
    intuition:
      "Non. En C, le programmeur gère explicitement de nombreuses libérations. En Rust, les règles de possession encadrent les usages et la libération des valeurs. Un ramasse-miettes traçant repère les objets encore accessibles et peut récupérer les autres plus tard.",
    example:
      "Supposons qu’une valeur passe d’une variable à une autre. Dans le scénario Rust montré, un déplacement transfère la possession : l’ancien nom ne peut plus être utilisé. Le scénario C laisse la responsabilité au programmeur. Le modèle avec ramasse-miettes suit les références encore accessibles.",
    experiment:
      "Lancez le scénario « Use after move » et comparez le moment où chaque modèle accepte ou refuse l’opération. Distinguez un refus à la compilation d’un problème observé pendant l’exécution.",
    takeaway:
      "Chaque modèle fixe des règles différentes pour savoir qui peut utiliser une valeur et quand sa mémoire peut être récupérée. Le code optimisé peut aussi différer fortement de notre dessin pédagogique.",
    limit:
      "La comparaison est volontairement réduite. Rust unsafe et les cycles de références ont d’autres contraintes. Les ramasse-miettes ne se comportent pas tous de la même façon ; une trace de compilation dépend du programme et du compilateur exacts.",
  },
};
