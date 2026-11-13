# Storyboards visuels et spécifications des simulateurs (`VIS-01` à `VIS-05`)

Tous les simulateurs utilisent exclusivement des **scènes 2D SVG interactives animées via `@cyber-school/animations` (`createGsapTimelineScope` + Motion) et D3.js** (pour les graphiques de fragmentation et d'empreinte). Aucune scène 3D n'est employée conformément à l'arbitrage de [00-FICHE_REFERENCE.md](./00-FICHE_REFERENCE.md#4-arbitrage-technologique-et-choix-2d-vs-3d).

---

## `VIS-01` — CPU Fetch-Decode-Execute & RAM adressable

- **Concepts couverts** : `cpu-fetch-decode-execute`, `memory-addressing-and-bytes`
- **Technologie** : SVG structuré + `createGsapTimelineScope` (flux de paquets entre bus et registres) + bascule hexadécimal/octets.

### Objets visibles

- **Panneau gauche — Processeur simplifié** :
  - Boîte `RIP` (Pointeur d'instruction, affichage hexadécimal `0x0040`).
  - Boîte `IR` (Registre d'instruction contenant l'instruction décodée courante).
  - Registres généraux `RAX`, `RBX`, `ZF` (Zero Flag).
  - Badge de phase active (`FETCH` | `DECODE` | `EXECUTE` | `UPDATE RIP`).
- **Centre — Bus bidirectionnel** : deux pistes SVG dédiées (_Bus d'adresses_ et _Bus de données/instructions_) avec jeton animé.
- **Panneau droit — Bande mémoire linéaire adressée par octet** :
  - Zone Code (`0x0040..0x004F`) contenant 4 instructions machine symboliques annotées.
  - Zone Données (`0x1000..0x1013`) affichée octet par octet (ex. `0x1008: 78`, `0x1009: 56`, `0x100A: 34`, `0x100B: 12`), avec accolade groupant les 4 octets d'un `int32`.

### Éléments interactifs

- Boutons **Lecture / Pause**, **Phase suivante** (avance d'une micro-phase Fetch/Decode/Execute/Update), **Instruction suivante**, **Réinitialiser**.
- Sélecteur de programme préchargé (`Chargement & Addition` | `Branchement conditionnel` | `Écriture Little-Endian int32`).
- Interrupteur **Vue Octets bruts ↔ Groupement 32 bits Little-Endian** sur la zone Données.

### États

- `idle` (avant la 1re phase), `fetching`, `decoding`, `executing`, `updating_pc`, `halted`.

### Transitions et animations

- **`idle → fetching`** (`450 ms`, GSAP) : halo doré sur `RIP`, impulsion le long du _Bus d'adresses_ jusqu'à l'adresse d'instruction, puis retour des octets d'instruction vers `IR` sur le _Bus de données_.
- **`fetching → decoding`** (`300 ms`) : décomposition colorée de l'instruction dans `IR` (Opcode vs Opérande source/cible).
- **`decoding → executing`** (`500 ms`) : si lecture/écriture RAM, trajet de l'adresse cible sur le _Bus d'adresses_ puis mise en surbrillance simultanée des **4 cellules contiguës** `0x1008..0x100B` en little-endian avant transfert dans `RAX` (ou inversement).
- **`executing → updating_pc`** (`300 ms`) : incrément numérique fluide de `RIP` (+4 octets) ou saut visuel vers l'adresse cible lors d'un `JMP`/`JZ`.
- **Mode `prefers-reduced-motion`** : saut immédiat à l'état cible avec anneau de mise au point net, sans translation du jeton sur le bus.

### Paramètres modifiables

- **Valeur initiale du registre / donnée à écrire** (3 presets numériques sûrs, ex. `0x12345678`, `0x00000042`, `0xAABBCCDD` — sans saisie de code libre).
- **Vitesse d'animation** (`0.5x`, `1x`, `2x`).

### Événements déclenchés

- `onStepChange(stepIndex, phase, rip, memorySnapshot)`
- `onProgramComplete(finalRegisters)`

### Résultats observables

- L'apprenant voit explicitement que l'instruction `MOV [0x1008], 0x12345678` écrit **`78`** en premier à `0x1008` et **`12`** à `0x100B`.
- Il voit `RIP` pointer sur la zone Code tandis que les opérandes pointent sur la zone Données.

### Explications synchronisées

- Bandeau sous la scène affichant à chaque phase une phrase courte et rigoureuse : ex. _« Phase EXECUTE (Little-Endian) : l'octet de poids faible `0x78` est placé à l'adresse la plus basse `0x1008`. »_

---

## `VIS-02` — Espace virtuel, MMU & segments du processus

- **Concepts couverts** : `virtual-vs-physical-memory`, `process-memory-segments`
- **Technologie** : SVG 2 colonnes + pont MMU central + table interactive des segments.

### Objets visibles

- **Colonne gauche — Vue Processus A** : carte verticale de l'espace d'adressage virtuel (`Text r-x`, `Rodata r--`, `Data/BSS rw-`, `Heap rw-`, `mmap rw-/r-x`, `Stack rw-`) avec graduations d'adresses symboliques en bas vers haut.
- **Colonne optionnelle Processus B** (mode _Isolation_) montrant exactement la **même plage d'adresses virtuelles** (`0x401000`, `0x7FF000`).
- **Centre — Boîte MMU & Table des Pages** : table de correspondance `(Processus, Page Virtuelle, Permissions rwx) → (Cadre Physique RAM)`.
- **Colonne droite — RAM Physique** : grille de cadres physiques montrant que les pages virtuelles contiguës sont dispersées physiquement et totalement isolées entre Processus A et Processus B.

### Éléments interactifs

- Bouton de bascule **Vue Processus unique ↔ Isolation Processus A / B**.
- Clic/sélection sur n'importe quel segment (`Text`, `Data`, `BSS`, `Heap`, `mmap`, `Stack`) pour afficher ses permissions et des artefacts réels typiques.
- Panneau **Tester une opération mémoire** : sélecteur d'action (`Lire Text`, `Écrire dans Text`, `Allouer Heap`, `Exécuter un octet de Stack`, `Accéder page non mappée`).

### États

- `browsing_segments`, `translating_valid`, `demand_page_fault_resolved`, `sigsegv_permission_denied`, `sigsegv_unmapped`.

### Transitions et animations

- **Traduction valide** : faisceau partant d'une adresse virtuelle du Processus A, passant par la ligne correspondante de la MMU (badge `r`/`w`/`x` vert) et allumant le cadre physique correspondant à droite.
- **Violation de permission (`Écrire dans Text`)** : faisceau heurte la colonne `w=0` de la MMU → secousse discrète (désactivée en `reduced-motion`), badge rouge **`SIGSEGV — Écriture interdite (w=0)`**.
- **Allocation paresseuse (Demand Paging)** : page marquée « réservée non encore en RAM » → transition « Le noyau attribue un cadre physique libre » → page devient verte.

### Paramètres modifiables

- **Mode ASLR** (`Désactivé` vs `Activé — bases randomisées entre exécutions`) : décale visuellement les adresses de départ de `Text`, `Heap`, `mmap`, `Stack` entre deux redémarrages tout en conservant l'ordre logique.

### Événements déclenchés

- `onSegmentSelect(segmentId)`
- `onMemoryAccessAttempt(action, outcome)`

### Résultats observables

- Preuve visuelle immédiate que `0x401000` dans A et `0x401000` dans B aboutissent à deux cadres physiques distincts.
- Visualisation nette des droits `r-x` / `rw-` et de l'espace libre immense entre `Heap` et `Stack`.

### Explications synchronisées

- Carte explicative latérale liant le segment inspecté à une ligne réelle commentée de `/proc/[pid]/maps`.

---

## `VIS-03` — Pile d'appels (`RSP`/`RBP`, ABI et pointeurs pendants)

- **Concepts couverts** : `variable-value-vs-address-and-type`, `call-stack-and-frames`, `function-prologue-epilogue-and-abi`, `pointers-and-dereferencing`, `stack-dangling-pointers-and-overflow`
- **Technologie** : Panneau double sync (Pseudocode surligné non éditable à gauche + Pile SVG croissante vers les adresses basses à droite).

### Objets visibles

- **Colonne gauche — Trace d'exécution guidée** : lignes numérotées avec curseur d'instruction active (`main()`, `compute()`, `helper()`, `make_bad_ptr()`, `overwrite()`, `recurse(n)`).
- **Colonne droite — Pile d'appels adressée** (`0x7FF0` en haut vers `0x7F60` en bas, croissance vers le bas !) :
  - Chaque **Stack Frame** encadrée par sa couleur fonction (`main`, `compute`, `helper`), découpée en cases exactes : `Paramètre / Passage ABI`, `Adresse de retour (CALL)`, `Ancien RBP`, `Variables locales`.
  - Deux pointeurs flottants animés : **`RBP`** (base de la trame active) et **`RSP`** (sommet courant de la pile).
  - **Zone grise « mémoire libérée non effacée »** sous `RSP` après un `RET` (les anciens octets restent visibles en grisé pâle avec mention _« hors trame active — réutilisable à tout instant »_).
  - **Ligne rouge `Guard Page / Limite de pile`** en bas de fenêtre.
  - **Flèche de pointeur SVG** dans le scénario _Pointeur Pendant_ reliant `ptr` (dans `main`) à une adresse située dans l'ancienne trame de `make_bad_ptr()`.

### Éléments interactifs

- Sélecteur de scénario (3 onglets) :
  1. **Appels imbriqués & résidus** (`main → compute → helper → retour`)
  2. **Pointeur pendant (Dangling Pointer)** (`main` reçoit `&local` de `make_bad_ptr`, puis appelle `log_msg`)
  3. **Stack Overflow** (appels récursifs successifs jusqu'à la _Guard Page_)
- Contrôles **Pas précédent**, **Pas suivant**, **Lecture auto**, **Réinitialiser**.
- **Toggle « Vue ABI détaillée »** : affiche ou masque les registres d'arguments `RDI`/`RSI`, l'alignement 16 octets et `RIP_retour`.

### États

- Chaque scénario est une machine à états finie déterministe (`step 0..N`).
- En scénario 2 : `valid_before_ret` → `dangling_intact_bytes` → `dangling_overwritten` !
- En scénario 3 : `depth_1..depth_k` → `guard_page_hit_sigsegv`.

### Transitions et animations

- **Appel (`CALL`)** : apparition progressive des cases `Adresse de retour`, `Ancien RBP`, `Locales` sous `RSP` avec glissement fluide de l'accolade `RSP` vers le bas (`350 ms`).
- **Retour (`RET`)** : `RSP` remonte instantanément ; la bordure de trame disparaît mais les octets grisés restent visibles à l'écran pour casser le mythe de la « remise à zéro ».
- **Dangling overwrite** : lors de l'appel suivant `log_msg()`, la nouvelle trame recouvre exactement l'adresse pointée par la flèche rouge de `main.ptr` — un badge passe de `Valeur résiduelle trompeuse (42)` à `ÉCRASÉE (0x0000DEAD)`.

### Paramètres modifiables

- Profondeur d'appel cible dans le scénario récursif (`N = 2` à `Overflow`).
- Toggle **Afficher registres ABI (`RDI`, `RSI`, `RIP`)**.

### Événements déclenchés

- `onFramePush(fnName, rsp, rbp)`
- `onFramePop(fnName, newRsp)`
- `onStackHazardDetected("dangling-read" | "dangling-overwritten" | "stack-overflow")`

### Résultats observables

- Visibilité immédiate de la libération `O(1)` par déplacement de `RSP`.
- Démonstration frappante du pourquoi une valeur « semble encore là » juste après `return &x` puis explose au prochain appel.

### Explications synchronisées

- Sous-titre pas à pas décrivant l'instruction exécutée et les registres `RSP`, `RBP`, `RIP` avant/après.

---

## `VIS-04` — Tas, allocateur (`chunks`), fragmentation & _Use-After-Free_

- **Concepts couverts** : `heap-allocation-and-lifetime`, `allocator-chunks-bins-and-fragmentation`, `heap-corruption-uaf-and-leaks`
- **Technologie** : Bande SVG horizontale/en grille du Tas + Pile compacte à gauche (stockant les pointeurs) + mini-histogramme **D3.js** d'occupation et fragmentation.

### Objets visibles

- **Panneau gauche — Variables pointeurs sur la Pile** (`p1`, `p2`, `p3`, `legacy_ptr`) avec flèches SVG reliant chaque pointeur vers son adresse utilisateur sur le tas (ou badge `PERDU / FUITE` si réassigné sans `free`, ou badge `DANGLING` après `free`).
- **Centre — Tas géré par l'allocateur (blocs/chunks)** :
  - Chaque chunk affiche son **En-tête caché** (`8 o : size + flags A|M|P`) en teinte sombre + sa **Zone utilisateur** en teinte claire + **Padding d'alignement éventuel** hachuré.
  - Les chunks libres deviennent bleu pâle avec flèches de **Liste libre (Bin / Tcache)**.
  - Quand deux chunks libres sont adjacents, une animation de **fusion (_coalescing_)** réunit leurs deux bordures en un grand bloc libre.
  - Bande distincte en bas pour les très gros blocs envoyés à **`mmap`** directement.
- **Bas/Droite — Jauge D3.js en temps réel** :
  - Octets demandés vs octets réellement consommés (en-têtes + padding = **fragmentation interne**).
  - Taux de **fragmentation externe** (`1 - plus_grand_bloc_libre / total_octets_libres`).

### Éléments interactifs

- **Bac à sable guidé (boutons d'actions contrôlés, pas de code libre)** :
  - `Allouer 16 o`, `Allouer 32 o`, `Allouer 64 o`, `Allouer 256 Ko (via mmap)`.
  - Bouton `free()` directement sur chaque bloc occupé.
  - **Toggle Fusion automatique (`Coalescing`)** pour comparer l'impact sur la fragmentation externe !
- **Sélecteur de scénarios guidés (4 presets)** :
  1. `Cycle pile ↔ tas sain`
  2. `Fragmentation externe` (3 blocs → libérer les extrêmes → échec ou extension pour gros bloc contigu)
  3. `Fuite mémoire & Double Free`
  4. `Use-After-Free (CWE-416)` (`alloc User` → `free` → `alloc Admin` récupère le même chunk → `legacy_ptr` accède aux droits d'`Admin` !)

### États

- `allocated`, `freed_in_bin`, `coalesced`, `split`, `leaked_unreachable`, `double_free_corrupted_bin`, `uaf_aliased`, `oom_or_mmap_fallback`.

### Transitions et animations

- **Split** : un bloc libre est coupé en un nouveau chunk alloué + un reste replacé dans la liste libre.
- **Coalescing** : deux bordures adjacentes glissent et fusionnent en un bloc unique avec mise à jour de l'en-tête `size`.
- **Use-After-Free** : l'ancien pointeur `user_ptr` conserve visuellement ses coordonnées sur le chunk désormais coloré en rouge/violet `Admin`, avec alerte explicite sur la confusion de types.

### Paramètres modifiables

- Capacité simulée du tas initial (`256 octets` avant extension `brk`).
- Mode `Coalescing ON / OFF`.
- Toggle `Afficher en-têtes & alignement` (pour passer de la vue simplifiée à la vue interne allocateur).

### Événements déclenchés

- `onHeapAlloc(sizeRequested, chunkSize, usedMmap)`
- `onHeapFree(chunkId, coalesced)`
- `onHeapHazard("leak" | "double-free" | "uaf" | "external-fragmentation")`

### Résultats observables

- L'apprenant constate avec exactitude que `malloc(16)` occupe `32 o` au total (en-tête + minimum chunk) et comprend immédiatement la différence entre total libre et **plus grand bloc contigu libre**.

### Explications synchronisées

- Journal structuré des 4 dernières opérations de l'allocateur + explication causale de l'état de la jauge D3.

---

## `VIS-05` — Comparateur : Manuel (C) vs Ownership/RAII (Rust) vs GC Traçant

- **Concepts couverts** : `manual-vs-raii-vs-gc`
- **Technologie** : Vue 3 colonnes synchronisées + graphe D3/SVG de racines et références + chronologie animée.

### Objets visibles

- **Même scénario logique joué en parallèle sur 3 pistes** :
  1. **Manuel (C)** : `malloc()` → `transfert pointeur` → oubli `free()` ou `free()` prématuré selon le cas choisi.
  2. **Ownership / RAII (Rust)** : création propriétaire `box_a` → déplacement _Move_ vers `fonction_b` (l'ancienne liaison `box_a` est grisée/invalide à la compilation) → `drop()` automatique exact en fin de portée.
  3. **GC Traçant (JVM / .NET)** : allocation dans la génération jeune → fin de portée locale laisse l'objet « orphelin » un moment → passage du cycle **Mark & Sweep** partant des **GC Roots** (pile/globales) qui conserve les atteignables et balaie les inatteignables (y compris un cycle isolé).
- **Mini-tableau D3 comparatif dynamique** : latence de libération (déterministe vs pics de pause GC), pic d'occupation RAM, risque d'erreur à l'exécution.

### Éléments interactifs

- **Sélecteur de cas comparé** :
  - `Cycle nominal`
  - `Oubli de libération / cycle d'objets`
  - `Utilisation après transfert (prévenue à la compilation vs bug runtime)`
- **Curseur temporel partagé** (`t = 0 .. t = 6`, clavier `ArrowLeft`/`ArrowRight`) avançant simultanément les 3 modèles.

### États

- Pour chaque piste et instant `t` : `{ stackBindings, heapObjects, reachabilityStatus, runtimeEvent }`.

### Transitions et animations

- Sous **Rust**, au transfert `move`, la flèche quitte `A` vers `B` et un cadenas « Interdit à la compilation » se pose sur `A`.
- Sous **GC**, au déclenchement du cycle Mark, une onde part des racines (`Stack`, `Globals`) pour colorer les nœuds atteignables, puis les nœuds gris (y compris un cycle A↔B isolé) sont balayés.

### Paramètres modifiables

- Fréquence de passage du GC (`Agressif` vs `Paresseux` pour observer l'effet sur le pic d'empreinte RAM).

### Événements déclenchés

- `onTimelineTick(stepIndex)`
- `onGcTrigger(collectedCount)`

### Résultats observables

- Mise en évidence irréfutable qu'un **ramasse-miettes libère plus tard avec surcoût mémoire**, que **Rust libère au moment exact sans pause GC ni `free()` manuel**, et que **le C offre le contrôle brut au prix de la responsabilité totale**.

### Explications synchronisées

- Synthèse côte à côte expliquant à chaque instant `t` pourquoi l'objet vit encore ou est libéré dans chacun des 3 langages.
