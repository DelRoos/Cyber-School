# Banque complète d'exercices de compréhension et de raisonnement

Tous les exercices sont **sans écriture de code manuelle**. Chaque exercice indique le type compatible avec `@cyber-school/exercises` (`multiple-choice`, `state-prediction`, `sequence-order`) ou l'extension proposée (`diagram-probe` / `AssessmentBlueprint` via [ADR-0006](../../decisions/ADR-0006-interactive-diagram-probe-and-assessment-runner.md)), la réponse attendue, la justification technique, la cartographie des erreurs fréquentes et les métriques de maîtrise.

---

## Matrice de couverture des 8 catégories requises

| Catégorie demandée                 | Exercices correspondants  | Type runtime actuel / proposé              |
| ---------------------------------- | ------------------------- | ------------------------------------------ |
| Compréhension conceptuelle         | `EX-01`, `EX-04`, `EX-14` | `multiple-choice`                          |
| Prédiction de comportement         | `EX-02`, `EX-08`, `EX-12` | `state-prediction` / `multiple-choice`     |
| Analyse de situation               | `EX-05`, `EX-10`, `EX-15` | `multiple-choice`                          |
| Ordonnancement d'étapes            | `EX-03`, `EX-07`          | `sequence-order`                           |
| Interprétation de schéma/diagramme | `EX-06`, `EX-13`          | `diagram-probe` (repli `state-prediction`) |
| Détection d'erreur / anomalie      | `EX-11`, `EX-15`          | `diagram-probe` / `multiple-choice`        |
| Raisonnement avancé                | `EX-09`, `EX-16`          | `multiple-choice` / `state-prediction`     |
| Problème cumulatif multi-concepts  | `EVAL-01` à `EVAL-04`     | `AssessmentBlueprint`                      |

---

## Chapitre 1 — Exécution CPU & octets en mémoire

### `EX-01` — Rôle de `RIP` et des données en mémoire _(Compréhension conceptuelle)_

- **Concept ciblé** : `cpu-fetch-decode-execute`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Au début d'une instruction de lecture mémoire `MOV EAX, [0x1008]`, `RIP` vaut `0x0040`. Quelle est la toute première adresse lue par le processeur sur le bus mémoire pendant la phase _Fetch_ ?
- **Choix** :
  - `A`: `0x1008`, pour récupérer directement la valeur à placer dans `EAX`.
  - `B`: `0x0040`, car le processeur doit d'abord lire les octets de l'instruction elle-même avant de savoir qu'elle référence `0x1008`.
  - `C`: `EAX`, car un registre possède une adresse RAM identique à celle d'une variable.
- **Réponse attendue** : **`B`**
- **Justification** : Le processeur ne connaît pas l'instruction avant de la charger depuis `[RIP]` (`0x0040`) vers le registre d'instruction `IR`. C'est seulement durant _Decode_ puis _Execute_ qu'il lit l'opérande à `0x1008`.
- **Erreurs fréquentes cartographiées** : `A` confond adresse d'instruction (`RIP`) et adresse d'opérande ; `C` confond registres internes du CPU et mémoire adressable par octet.

### `EX-02` — Encodage _Little-Endian_ d'un entier 32 bits _(Prédiction de comportement)_

- **Concept ciblé** : `memory-addressing-and-bytes`
- **Type schéma** : `state-prediction` (`fields`: `bytes_0x1008_to_0x100B`)
- **Énoncé** : On stocke l'entier 32 bits `0x1A2B3C4D` à l'adresse de base `0x1008` sur une architecture x86-64 (_little-endian_). Quels octets exacts (en hexadécimal) se trouvent respectivement à `0x1008`, `0x1009`, `0x100A`, `0x100B` ?
- **Réponse attendue** : **`4D 3C 2B 1A`**
- **Justification** : En _little-endian_, l'octet de poids faible (`4D`) occupe l'adresse la plus basse (`0x1008`), tandis que l'octet de poids fort (`1A`) occupe `0x100B`. Les deux chiffres hexadécimaux **d'un même octet** ne sont jamais inversés.
- **Erreurs fréquentes cartographiées** : `1A 2B 3C 4D` (modèle _big-endian_) ; `D4 C3 B2 A1` (erreur grave d'inversion intra-octet).

### `EX-03` — Séquencement du cycle matériel lors d'un saut _(Ordonnancement d'étapes)_

- **Concept ciblé** : `cpu-fetch-decode-execute`
- **Type schéma** : `sequence-order`
- **Énoncé** : Remettez dans l'ordre chronologique exact les opérations déclenchées lorsqu'un processeur exécute une instruction de saut `JMP 0x0060` située en `0x0048`.
- **Étapes à ordonner** :
  1. Placer l'adresse `0x0048` (`RIP`) sur le bus et charger les octets de l'instruction dans `IR` (_Fetch_).
  2. Identifier l'opcode `JMP` et extraire la cible `0x0060` (_Decode_).
  3. Remplacer la valeur de `RIP` par la cible `0x0060` au lieu de `0x0048 + taille` (_Execute / Update RIP_).
  4. Lancer le cycle suivant en lisant la nouvelle instruction à `0x0060`.
- **Réponse attendue** : **`1 → 2 → 3 → 4`**
- **Justification** : Un saut modifie `RIP` à l'issue du cycle courant ; la lecture à `0x0060` n'intervient qu'au _Fetch_ du cycle suivant.
- **Erreurs fréquentes cartographiées** : inverser 2 et 3 (croire que `RIP` bascule avant décodage) ou 3 et 4.

---

## Chapitre 2 — Espace virtuel, MMU & segments

### `EX-04` — Même adresse dans deux processus _(Compréhension conceptuelle)_

- **Concept ciblé** : `virtual-vs-physical-memory`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Deux instances indépendantes `P1` et `P2` d'un même programme affichent toutes deux que leur variable globale `score` est à l'adresse `0x404010`. `P1` modifie `score = 999`. Que lit `P2` à `0x404010` ?
- **Choix** :
  - `A`: `999`, car `0x404010` désigne la même case physique sur la barrette RAM.
  - `B`: sa propre valeur initiale de `score`, car la MMU et la table des pages de chaque processus traduisent `0x404010` vers deux cadres physiques distincts.
  - `C`: `SIGSEGV`, car deux processus ne peuvent pas ouvrir la même adresse virtuelle.
- **Réponse attendue** : **`B`**
- **Justification** : L'adresse affichée est **virtuelle**. Chaque processus possède sa propre table des pages gérée par l'OS et la MMU, isolant totalement les cadres physiques (sauf mémoire partagée explicite).
- **Erreurs fréquentes cartographiées** : `A` (confusion adresse virtuelle / physique) ; `C` (méconnaissance de l'espace virtuel privé par processus).

### `EX-05` — Violation d'écriture sur une constante _(Analyse de situation)_

- **Concept ciblé** : `process-memory-segments`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Un programme tente d'écrire `'Z'` sur le premier caractère d'un littéral de chaîne stocké dans `.rodata` (`r--`). Que fait le matériel / noyau ?
- **Choix** :
  - `A`: L'écriture réussit silencieusement mais la chaîne originale n'est pas modifiée pour les autres fonctions.
  - `B`: La MMU constate que le bit d'écriture `w` de la page est à `0`, déclenche une faute de protection et le noyau envoie `SIGSEGV`.
  - `C`: L'allocateur du tas déplace automatiquement la chaîne vers le tas pour la rendre modifiable.
- **Réponse attendue** : **`B`**
- **Justification** : Les droits `r`/`w`/`x` sont vérifiés par la MMU au niveau de la page virtuelle ; toute écriture dans une page sans permission `w` provoque un défaut de protection (`SIGSEGV` sous Linux).
- **Erreurs fréquentes cartographiées** : `A` (illusion de _copy-on-write_ automatique sur `.rodata`) ; `C` (anthropomorphisme de l'allocateur).

### `EX-06` — Cartographie des segments sur `/proc/maps` simplifié _(Interprétation de schéma)_

- **Concept ciblé** : `process-memory-segments`
- **Type schéma** : `diagram-probe` _(repli compatible immédiat : `state-prediction` associant 4 régions aux segments)_
- **Énoncé** : Sur le diagramme d'espace d'adressage de `VIS-02` affichant 4 plages avec permissions (`r-xp`, `rw-p` proche du binaire, `rw-p` croissant vers le haut, `rw-p` croissant vers le bas), associez : (1) code machine de `compute()`, (2) tampon créé par `malloc(4096)`, (3) tableau global non initialisé, (4) variable locale `int count`.
- **Réponse attendue** : **`1 → Text (r-xp)` ; `2 → Heap (rw-p montant)` ; `3 → BSS (rw-p fixe)` ; `4 → Stack (rw-p descendant)`**.
- **Justification** : Seul le code exécutable porte `x` (`r-xp`), les globales statiques non initialisées résident en `BSS`, les allocations dynamiques dans `Heap` et les locales automatiques sur `Stack`.

---

## Chapitre 3 — Variables, pile d'appels & ABI

### `EX-07` — Anatomie d'un appel `CALL` + prologue _(Ordonnancement d'étapes)_

- **Concept ciblé** : `function-prologue-epilogue-and-abi`
- **Type schéma** : `sequence-order`
- **Énoncé** : Ordonnez les 4 étapes exactes qui constituent l'entrée dans une fonction `helper()` avec cadre de pile standard sous System V AMD64.
- **Étapes à ordonner** :
  1. L'appelant place les premiers arguments dans les registres ABI (`RDI`, `RSI`...).
  2. L'instruction `CALL` empile l'adresse de retour (`RIP_suivant`) et saute vers `helper`.
  3. Le prologue sauvegarde l'ancien `RBP` sur la pile et fixe le nouveau `RBP = RSP`.
  4. Le prologue soustrait à `RSP` la taille nécessaire aux variables locales (en respectant l'alignement à 16 octets).
- **Réponse attendue** : **`1 → 2 → 3 → 4`**
- **Justification** : L'adresse de retour est empilée _par_ `CALL` avant toute instruction du prologue de l'appelé, puis le prologue chaîne `RBP` et réserve les locales en diminuant `RSP`.

### `EX-08` — Valeur résiduelle d'une variable locale non initialisée _(Prédiction de comportement)_

- **Concept ciblé** : `variable-value-vs-address-and-type`, `call-stack-and-frames`
- **Type schéma** : `state-prediction` (`fields`: `rsp_after_ret`, `uninit_var_outcome`)
- **Énoncé** : Dans `VIS-03`, `setup()` alloue `int secret = 0xCAFE` à `0x7FE0` puis retourne (`RSP` remonte de `0x7FD8` à `0x7FF0`). Immédiatement après, `main()` appelle `probe()` qui déclare `int x;` sans l'initialiser, précisément à `0x7FE0`. Que contient la case `0x7FE0` au moment où `probe()` commence ?
- **Réponse attendue** : **`0xCAFE` (donnée résiduelle non nettoyée ; lecture = comportement indéfini en C)**
- **Justification** : La libération d'une trame sur la pile en `O(1)` ne fait que remonter `RSP`. Les octets restent intacts jusqu'à être écrasés, expliquant pourquoi une variable non initialisée en C hérite de résidus imprévisibles (et constitue un UB).

### `EX-09` — Empilement de `RSP` et alignement _(Raisonnement avancé)_

- **Concept ciblé** : `function-prologue-epilogue-and-abi`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Avant `CALL helper`, `RSP = 0x7FF0` (multiple de 16). `CALL` empile l'adresse de retour de 8 octets. Pour respecter la règle System V AMD64 imposant que `RSP` soit aligné sur 16 octets _avant tout nouvel appel_ depuis `helper`, quelle ajustement minimum `helper` doit-il appliquer à `RSP` s'il a besoin de 12 octets de variables locales et appelle une fonction `leaf()` ?
- **Choix** :
  - `A`: `-12` octets seulement, car 12 octets suffisent exactement pour les variables.
  - `B`: `-24` octets (soit `12` de locales + `12` de padding après les 8 octets de l'adresse de retour, ou `-8` après `PUSH RBP` puis `-16`), ramenant `RSP` à un multiple de 16 avant `CALL leaf`.
  - `C`: `+16` octets pour remonter la pile vers les adresses hautes.
- **Réponse attendue** : **`B`**
- **Justification** : `0x7FF0 - 8 = 0x7FE8` (non multiple de 16 après `CALL`). Pour qu'un futur `CALL` retrouve `RSP % 16 == 0`, le décalage total dans la trame doit compenser les 8 octets de l'adresse de retour (`8 + 24 = 32`, multiple de 16).

---

## Chapitre 4 — Pointeurs & pièges sur la pile

### `EX-10` — Aliasing par pointeurs _(Analyse de situation)_

- **Concept ciblé** : `pointers-and-dereferencing`
- **Type schéma** : `state-prediction` (`fields`: `a`, `b`, `star_p`)
- **Énoncé** : `a = 10` (`0x7FF0`), `b = 20` (`0x7FE8`). Initialement `p = &a`, `q = &b`. On exécute successivement : (1) `p = q` ; (2) `*p = 77`. Quelles sont les valeurs finales de `a`, `b` et `*p` ?
- **Réponse attendue** : **`a = 10`, `b = 77`, `*p = 77`**
- **Justification** : `p = q` copie l'adresse contenue dans `q` (`0x7FE8`) dans `p` ; `p` et `q` pointent tous deux vers `b`. L'écriture `*p = 77` modifie donc `b` et laisse `a` inchangé.
- **Erreurs fréquentes cartographiées** : confondre `p = q` avec `*p = *q` (ce qui aurait laissé `p` pointant vers `a` et mis `a = 77`).

### `EX-11` — Diagnostic d'un pointeur pendant sur pile _(Détection d'erreur)_

- **Concept ciblé** : `stack-dangling-pointers-and-overflow`
- **Type schéma** : `diagram-probe` _(repli `multiple-choice` sur une trace numérotée T1..T4)_
- **Énoncé** : Dans la trace de `VIS-03` : `T1`: `make_bad()` initialise `local = 42` en `0x7FD0` ; `T2`: `make_bad()` retourne `&local` à `main.ptr` et `RET` remonte `RSP` à `0x7FF0` ; `T3`: `main` affiche `*ptr` qui vaut encore `42` ; `T4`: `main` appelle `trace_log()` dont la nouvelle trame écrit `0xBEEF` en `0x7FD0`. À quel instant le pointeur devient-il **sémantiquement invalide (pendant)** ?
- **Choix** :
  - `A`: Uniquement en `T4`, au moment où `trace_log()` modifie `0x7FD0`.
  - `B`: Dès `T2` au retour de `make_bad()`, car `0x7FD0` sort de la pile active ; la lecture `42` en `T3` n'est qu'un hasard dû aux octets non nettoyés.
  - `C`: Jamais, puisque l'adresse `0x7FD0` reste valide dans l'espace virtuel du processus.
- **Réponse attendue** : **`B`**
- **Justification** : Une adresse sous `RSP` n'appartient plus à aucune trame vivante ; son usage dès `T3` est déjà un comportement indéfini (lecture sur mémoire libérée), bien avant l'écrasement visible en `T4`.

---

## Chapitre 5 — Tas, allocateur & fragmentation

### `EX-12` — Fusion de chunks et fragmentation externe _(Prédiction de comportement)_

- **Concept ciblé** : `allocator-chunks-bins-and-fragmentation`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Le tas simulé (capacité courante 128 octets) contient dans l'ordre contigu : `[Bloc A : 32 o OCCUPÉ] [Bloc B : 32 o LIBRE] [Bloc C : 32 o OCCUPÉ] [Bloc D : 32 o LIBRE]`. On demande une allocation de **48 octets** (aucun agrandissement `brk` autorisé dans ce test). Que se passe-t-il ?
- **Choix** :
  - `A`: L'allocation réussit immédiatement car `32 + 32 = 64` octets sont libres au total (`64 >= 48`).
  - `B`: L'allocation échoue par **fragmentation externe**, car `Bloc B` et `Bloc D` sont séparés par `Bloc C` occupé et ne peuvent pas être fusionnés en un bloc contigu de 48 octets.
  - `C`: L'allocateur déplace automatiquement `Bloc C` en mémoire sans prévenir le programme qui détient un pointeur vers `C`.
- **Réponse attendue** : **`B`**
- **Justification** : En C/allocateur natif, les pointeurs stockent des adresses absolues virtuelles : l'allocateur **ne peut pas déplacer** un bloc actif (`C`). Malgré 64 octets libres cumulés, aucun créneau contigu de 48 octets n'existe.

### `EX-13` — Lecture d'un en-tête et coût réel d'un chunk _(Interprétation de schéma)_

- **Concept ciblé** : `allocator-chunks-bins-and-fragmentation`
- **Type schéma** : `state-prediction` (`fields`: `total_chunk_size`, `prev_inuse`)
- **Énoncé** : Sur le schéma `VIS-04` (alignement 16 octets, en-tête `mchunk_size` de 8 octets), un développeur appelle `malloc(20)`. L'en-tête affiché avant le pointeur utilisateur vaut `0x21` (soit taille totale `32` + bit `PREV_INUSE = 1`). Quelle est la quantité réelle d'octets réservés sur le tas et que signifie le bit `0x1` ?
- **Réponse attendue** : **`32 octets consommés` (20 demandés + 8 en-tête + 4 padding = fragmentation interne) ; le bit `P=1` indique que le chunk précédent en mémoire est actuellement occupé**.
- **Justification** : L'alignement sur 16 octets rend les 4 bits de poids faible de la taille toujours nuls, permettant à `glibc` d'y loger les drapeaux `A|M|P` sans octet supplémentaire.

---

## Chapitre 6 — Modèles de gestion, failles & réalité matérielle

### `EX-14` — Comparaison C vs Rust Ownership vs GC _(Compréhension conceptuelle)_

- **Concept ciblé** : `manual-vs-raii-vs-gc`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Un système temps réel audio impose une latence maximale stricte inférieure à `1 ms` à chaque cycle et interdit toute pause imprévisible. Le développeur veut tout de même éviter d'oublier des `free()` manuels. Quel modèle correspond le mieux ?
- **Choix** :
  - `A`: Un ramasse-miettes (_Stop-The-World_ périodique) qui libère tout sans jamais intervenir dans le code.
  - `B`: Le modèle _Ownership / RAII_ (Rust / C++ discipliné), qui insère la libération déterministe à la compilation exactement en fin de portée sans pause de traçage globale.
  - `C`: La pile uniquement, en interdisant toute donnée dépassant la durée d'une fonction.
- **Réponse attendue** : **`B`**
- **Justification** : Rust vérifie les propriétés de durée de vie à la compilation et détruit les objets à un instant exact et borné en fin de portée, sans surcoût ni pause de parcours du graphe d'objets.

### `EX-15` — Identification d'un Use-After-Free (CWE-416) _(Détection d'erreur / Analyse)_

- **Concept ciblé** : `heap-corruption-uaf-and-leaks`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Séquence observée dans `VIS-04` : (1) `user = malloc(32)` reçoit `0x602010` (`role = "guest"`) ; (2) `free(user)` place `0x602010` en tête de `tcache` sans mettre `user = NULL` ; (3) `admin = malloc(32)` récupère le même créneau `0x602010` et y écrit `role = "root"` ; (4) le code lit `user->role`. Quelle faille est illustrée et quel résultat observe-t-on ?
- **Choix** :
  - `A`: Une fuite mémoire ; `user->role` provoque toujours `SIGSEGV`.
  - `B`: Un _Double Free_ ; le système bloque la deuxième allocation `admin`.
  - `C`: Un _Use-After-Free_ (CWE-416) ; `user` pointe vers la même adresse réattribuée à `admin` et lit `"root"` (confusion d'objet / élévation de privilèges).
- **Réponse attendue** : **`C`**
- **Justification** : La réutilisation rapide d'un chunk libéré de même taille par `tcache`/free-list expose l'ancien pointeur restant aux données du nouvel occupant sans aucun crash immédiat.

### `EX-16` — Écart simulateur pédagogique vs binaire optimisé `-O2` _(Raisonnement avancé)_

- **Concept ciblé** : `compiler-optimizations-and-memory-reality`
- **Type schéma** : `multiple-choice`
- **Énoncé** : Un étudiant inspecte dans Compiler Explorer avec `-O2` une fonction simple qui crée `int temp = x + 1; return temp * 2;`. Il est surpris de ne voir aucune soustraction de `RSP` ni aucune adresse mémoire allouée sur la pile pour `temp`. Pourquoi ?
- **Choix** :
  - `A`: Compiler Explorer désactive toujours la pile sur Linux.
  - `B`: En l'absence de prise d'adresse (`&temp`), le compilateur promeut `temp` exclusivement dans un registre CPU (`EAX`), évitant tout accès lent en RAM.
  - `C`: La variable `temp` a été déplacée automatiquement sur le tas.
- **Réponse attendue** : **`B`**
- **Justification** : Conformément à la règle « _as-if_ », tant qu'aucune adresse n'est observée et qu'il reste des registres libres, le compilateur conserve les temporaires dans les registres du processeur.

---

## Évaluation cumulative finale (`AssessmentBlueprint` — `EVAL-01` à `EVAL-04`)

Proposée pour exécution via `AssessmentBlueprintSchema` dans [ADR-0006](../../decisions/ADR-0006-interactive-diagram-probe-and-assessment-runner.md) :

- **`EVAL-01` (CPU + Segments)** : Prédire à quel segment appartient chaque adresse d'une trace d'appel et identifier pourquoi une écriture dans `Text` échoue avant même d'atteindre la RAM physique.
- **`EVAL-02` (Pile + Pointeur)** : Suivre un scénario complet `main → create_pair → format` avec un pointeur sur pile retourné par erreur et déterminer quel octet précis d'une autre variable se retrouve lu après réemploi de la trame.
- **`EVAL-03` (Tas + Fragmentation + UAF)** : Sur une séquence de 6 allocations/libérations de tailles mixtes (`16`, `32`, `16`, `64`), calculer le plus grand bloc contigu disponible, décider si `Coalescing` permet une requête `48 o` et pointer l'opération déclenchant un UAF.
- **`EVAL-04` (Comparatif multi-langages)** : Diagnostiquer trois situations (fuite sur retour anticipé en C, erreur de borrow checker à la compilation en Rust, rétention involontaire dans un cache global en C#/.NET).

### Métriques globales de maîtrise et télémétrie suggérée

| Indicateur                                  | Seuil de réussite                      | Signal d'alerte pédagogique                                                                   |
| ------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Score par chapitre (`EX-01..16`)            | >= 75 % au premier essai, 100 % acquis | Répétition d'une même erreur de _misconception_ -> renvoi ciblé vers l'étape `VIS-*` associée |
| Score évaluation cumulative (`EVAL-01..04`) | >= 80 % pondéré sur les 3 modules      | Échec sur un module spécifique -> verrouillage du badge de maîtrise module jusqu'à révision   |
| Temps d'analyse moyen                       | Informatif uniquement (sans pénalité)  | Ne jamais pénaliser la réflexion approfondie                                                  |
