# Architecture pédagogique et progression du cours

Le cours suit une montée en abstraction contrôlée en **6 chapitres répartis sur 3 modules**, complétée par une **synthèse transversale et évaluation cumulative**. Chaque chapitre respecte le schéma invariant : _Problème initial → Intuition juste → Mécanismes internes → Visualisation manipulable → Exemples → Cas limites → Exercices → Critères de réussite_.

---

## Chapitre 1 — Exécution d'une instruction et mémoire adressée par octets

- **Module** : `execution-and-address-space`
- **Durée estimée** : `40 min`
- **Problème initial à expliquer** : _« Comment un processeur qui ne manipule que des bits sait-il quelle opération exécuter maintenant et où lire un entier sur plusieurs octets ? »_
- **Notions enseignées** :
  - `cpu-fetch-decode-execute`
  - `memory-addressing-and-bytes`
- **Intuition à construire** :
  - La mémoire vive vue par un programme est une immense armoire de casiers numérotés **octet par octet** (`1 octet = 8 bits`).
  - Les instructions machine et les nombres qu'elles manipulent vivent **dans le même espace d'adresses** ; seul un registre spécial (`PC`/`RIP`) indique l'adresse de la prochaine instruction à lire.
- **Mécanismes internes** :
  - Boucle matérielle à 4 temps : **Fetch** (lecture des octets à `[RIP]` via le bus mémoire vers `IR`), **Decode** (identification de l'opcode et des opérandes), **Execute** (opération ALU dans registres ou transfert RAM), **Update `RIP`** (`RIP + taille_instruction` ou cible de branchement).
  - Représentation _little-endian_ (x86-64) : l'octet de poids faible d'un entier 32/64 bits est rangé à l'adresse la plus basse.
- **Visualisations nécessaires** : `VIS-01` — Simulateur CPU Fetch-Decode-Execute & RAM adressable ([03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md#vis-01--cpu-fetch-decode-execute--ram-adressable)).
- **Exemples** :
  - Pas-à-pas d'une instruction `MOV EAX, [0x1008]` suivie d'un `ADD EAX, 5` puis d'un saut `JMP 0x0040`.
  - Stockage de `0x12345678` à l'adresse `0x1008` : observation exacte de `78` en `0x1008`, `56` en `0x1009`, `34` en `0x100A`, `12` en `0x100B`.
- **Cas limites** :
  - Saut conditionnel qui écrase l'incrément séquentiel normal de `RIP`.
  - Confusion _little-endian_ : les chiffres **à l'intérieur** d'un octet (`0x78`) ne s'inversent jamais.
  - Accès non aligné ou lecture d'une adresse contenant des octets de code interprétés comme un entier.
- **Exercices associés** : `EX-01`, `EX-02`, `EX-03`.
- **Critères de réussite** : 100 % de réussite sur la reconstitution des 4 octets little-endian et le calcul du prochain `RIP` après un saut.

---

## Chapitre 2 — Espace d'adressage virtuel, MMU et segments d'un processus

- **Module** : `execution-and-address-space`
- **Durée estimée** : `45 min`
- **Problème initial à expliquer** : _« Pourquoi deux programmes lancés en même temps peuvent-ils afficher la même adresse `0x401000` sans écraser leurs données réciproques, et pourquoi modifier une chaîne constante fait-il planter le programme ? »_
- **Notions enseignées** :
  - `virtual-vs-physical-memory`
  - `process-memory-segments`
- **Intuition à construire** :
  - Chaque processus reçoit de l'OS un **plan d'immeuble virtuel privé** (son espace d'adressage) traduit vers des chambres physiques distinctes (la RAM) par un traducteur matériel rapide : la **MMU**.
  - Chaque quartier du plan porte un badge d'accès strict : lire (`r`), écrire (`w`) ou exécuter (`x`).
- **Mécanismes internes** :
  - Traduction **Adresse Virtuelle → Table des Pages → Cadre Physique** par pages de 4 Kio.
  - Défaut de page légitime (_demand paging_) vs violation de droits ou adresse non mappée → interruption matérielle → signal `SIGSEGV`.
  - Anatomie canonique inspirée de `/proc/[pid]/maps` : `Text` (`r-x`), `Data` initialisée (`rw-`), `BSS` initialisée à zéro (`rw-`), `Heap` (croissant vers adresses hautes), zone `mmap` (bibliothèques partagées et gros blocs), `Stack` (croissant vers adresses basses), avec **ASLR** randomisant les bases à chaque lancement.
- **Visualisations nécessaires** : `VIS-02` — Carte de l'Espace Virtuel & Traduction MMU ([03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md#vis-02--espace-virtuel-mmu--segments-du-processus)).
- **Exemples** :
  - Processus `A` et `B` accédant tous deux à `0x401000`, dirigés respectivement vers les cadres physiques `0x02F000` et `0x091000`.
  - Placement de `main()` (`Text`), `const banner[]` (`rodata`), `global_counter = 7` (`Data`), `global_buf[1024]` (`BSS`), `malloc()` (`Heap`) et `int x` (`Stack`).
- **Cas limites** :
  - Tentative d'écriture dans `Text` ou `rodata` (`SIGSEGV` par bit `w=0`).
  - Tentative d'exécution d'octets écrits dans `Stack` ou `Heap` bloquée par `NX` (`x=0`).
  - Réalité de l'ASLR : les adresses exactes changent d'une exécution à l'autre, seul l'ordre relatif et les permissions restent invariants.
- **Exercices associés** : `EX-04`, `EX-05`, `EX-06`.
- **Critères de réussite** : distinguer faute de permission (`rwx`), adresse non mappée et isolation inter-processus sur diagramme.

---

## Chapitre 3 — Variables, pile d'appels et conventions ABI

- **Module** : `variables-stack-and-pointers`
- **Durée estimée** : `50 min`
- **Problème initial à expliquer** : _« Lorsque `f()` appelle `g()` qui possède aussi une variable nommée `x`, comment le programme évite-t-il que le `x` de `g()` écrase celui de `f()`, et comment sait-il exactement où reprendre dans `f()` ? »_
- **Notions enseignées** :
  - `variable-value-vs-address-and-type`
  - `call-stack-and-frames`
  - `function-prologue-epilogue-and-abi`
- **Intuition à construire** :
  - Un **nom de variable** disparaît presque toujours après compilation ; il devient un déplacement fixe relatif au repère de la fonction en cours.
  - La **pile d'appels** fonctionne comme une pile d'assiettes extrêmement rapide : chaque appel réserve une tranche d'un seul coup (`RSP -= taille`), et le retour libère toute la tranche sans nettoyer les octets (`RSP += taille`).
- **Mécanismes internes** :
  - Distinction nom / adresse (ou registre) / taille typée / valeur ; copie par valeur de variables primitives.
  - `CALL` empile l'adresse de retour `RIP_retour` et saute ; prologue sauvegarde `RBP` et réserve les locales ; épilogue restaure et `RET` dépile `RIP_retour`.
  - Éléments clés System V AMD64 ABI : 6 premiers arguments entiers/pointeurs en registres (`RDI, RSI, RDX, RCX, R8, R9`), alignement de `RSP` à 16 octets avant `CALL`, registres _caller-saved_ vs _callee-saved_.
- **Visualisations nécessaires** : `VIS-03` — Simulateur de Pile d'Appels (mode Trames & ABI) ([03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md#vis-03--pile-dappels-rsprbp-abi-et-pointeurs-pendants)).
- **Exemples** :
  - Trace complète de `main()` → `compute(10)` → `helper(3)` → retour avec observation des octets résiduels conservés dans l'ancienne trame.
  - Lecture d'une variable locale non initialisée recevant l'ancienne valeur laissée par un appel précédent au même décalage.
- **Cas limites** :
  - Croissance vers les adresses **décroissantes** (`0x7FFF_F000` → `0x7FFF_EFD0`).
  - Variable promue uniquement en registre à `-O2` (préfiguration du chapitre 6, explicitement signalée).
  - Récursion profonde faisant croître la pile jusqu'à la _guard page_ (`Stack Overflow`).
- **Exercices associés** : `EX-07`, `EX-08`, `EX-09`.
- **Critères de réussite** : prédire `RSP`, les offsets relatifs et l'adresse de retour après une séquence d'appels imbriqués.

---

## Chapitre 4 — Pointeurs, aliasing et pièges de la pile

- **Module** : `variables-stack-and-pointers`
- **Durée estimée** : `45 min`
- **Problème initial à expliquer** : _« Si une fonction retourne l'adresse d'une de ses variables locales, pourquoi le résultat affiché peut-il être correct la première milliseconde puis devenir absurde après un autre appel ? »_
- **Notions enseignées** :
  - `pointers-and-dereferencing`
  - `stack-dangling-pointers-and-overflow`
- **Intuition à construire** :
  - Un **pointeur** est une simple boîte contenant un numéro de casier mémoire plutôt qu'une donnée finale.
  - Garder le numéro d'une chambre d'hôtel après avoir rendu les clés (_dangling pointer_) ne détruit pas immédiatement les meubles, mais le prochain client qui reçoit la même chambre écrase vos affaires sans prévenir.
- **Mécanismes internes** :
  - Anatomie `&p` vs `p` vs `*p` ; différence entre modifier l'adresse dans `p` (`p = &y`) et modifier l'objet cible (`*p = 99`) ; aliasing multi-pointeurs.
  - Retour d'adresse locale sur pile : dès `RET`, la zone située sous `RSP` est libre pour la prochaine trame → corruption silencieuse lors de l'appel suivant.
  - Comparaison avec le _Stack Overflow_ (dépassement du quota de pile, déclenchant la _guard page_).
- **Visualisations nécessaires** : `VIS-03` — Mode _Pointeur Pendant & Stack Overflow_ ([03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md#vis-03--pile-dappels-rsprbp-abi-et-pointeurs-pendants)).
- **Exemples** :
  - `make_bad_ptr()` retourne `&local` (`0x7FF0`) ; `log_message()` s'exécute ensuite, installe sa propre trame sur `0x7FF0`, puis `*p` lit un morceau d'argument de `log_message()`.
  - Fonction récursive sans cas de base consommant les trames jusqu'à la limite rouge de pile.
- **Cas limites** :
  - Pointeur `NULL` (`0x0`, page zéro non mappée → crash immédiat déterministe) vs pointeur pendant (crash aléatoire ou corruption silencieuse).
  - Double indirection (`int **pp`) illustrée uniquement comme « pointeur vers pointeur » en annexe visuelle optionnelle.
- **Exercices associés** : `EX-10`, `EX-11`.
- **Critères de réussite** : identifier sur un tracé temporel le moment exact de création du pointeur pendant puis le moment de l'écrasement effectif.

---

## Chapitre 5 — Tas, allocation dynamique et anatomie d'un allocateur

- **Module** : `heap-allocation-ownership-and-safety`
- **Durée estimée** : `50 min`
- **Problème initial à expliquer** : _« Comment conserver des données créées dynamiquement dont la taille ou la durée de vie dépasse celle d'une fonction, et pourquoi `free(p)` ne rend-il pas immédiatement la RAM au système d'exploitation ? »_
- **Notions enseignées** :
  - `heap-allocation-and-lifetime`
  - `allocator-chunks-bins-and-fragmentation`
- **Intuition à construire** :
  - Le **tas** est un entrepôt géré par un intendant (l'**allocateur**, ex. `glibc malloc`) : il loue de grandes salles au système d'exploitation (`brk`/`mmap`), y découpe des emplacements sur mesure avec une étiquette de taille avant chaque emplacement, et recycle les places libérées pour les prochains clients.
- **Mécanismes internes** :
  - Couplage pile ↔ tas : un pointeur sur la pile (8 octets) survit au retour s'il est **retourné par valeur** (`return ptr`), tandis que le bloc du tas reste intact tant qu'il n'est pas libéré.
  - Structure simplifiée fidèle d'un _chunk_ (`mchunk_size` aligné + bit `PREV_INUSE` `P` + bit `IS_MMAPPED` `M`), séparation (_splitting_), recyclage dans les listes libres (`tcache` / _bins_) et fusion des voisins libres (_coalescing_).
  - Fragmentation interne (arrondi/alignement + en-tête) vs fragmentation externe (mémoire libre totale suffisante mais morcelée en îlots non contigus).
- **Visualisations nécessaires** : `VIS-04` — Laboratoire du Tas & Allocateur ([03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md#vis-04--tas-allocateur-chunks-fragmentation-et-uaf)).
- **Exemples** :
  - Série `alloc(24)` → `alloc(40)` → `alloc(24)` → `free(B)` → tentative `alloc(56)` qui échoue ou force l'agrandissement du tas malgré `40+` octets libres cumulés si l'espace contigu manque.
  - Bascule d'une très grande allocation (`>= 128 Kio` par défaut sous `glibc`, tunable) directement sur `mmap` anonyme.
- **Cas limites** :
  - Coût caché : `malloc(1)` consomme typiquement au moins 32 octets sur x86-64 `glibc` (en-tête + taille minimale de chunk 32 octets pour chaîner les pointeurs libres).
  - Non-fusion temporaire en `tcache`/fastbin (signalée comme nuance réelle sans alourdir l'intuition).
- **Exercices associés** : `EX-12`, `EX-13`.
- **Critères de réussite** : prévoir si deux blocs libérés fusionnent et diagnostiquer un échec d'allocation par fragmentation externe.

---

## Chapitre 6 — Modèles de gestion mémoire, failles critiques et réalité matérielle

- **Module** : `heap-allocation-ownership-and-safety`
- **Durée estimée** : `40 min`
- **Problème initial à expliquer** : _« Pourquoi les langages modernes ont-ils inventé l'Ownership (Rust) ou le Ramasse-miettes (Java/.NET/Go), et comment un bug de libération en C se transforme-t-il en faille de sécurité critique ? »_
- **Notions enseignées** :
  - `manual-vs-raii-vs-gc`
  - `heap-corruption-uaf-and-leaks`
  - `compiler-optimizations-and-memory-reality`
- **Intuition à construire** :
  - Trois contrats pour libérer le tas : **tu te souviens de tout** (C), **le compilateur prouve un propriétaire unique et libère automatiquement à la fin de portée** (Rust/C++ RAII), **un agent trace périodiquement tout ce qui reste atteignable depuis la pile et balaie le reste** (GC).
  - Quand le contrat manuel échoue, les conséquences vont du gaspillage progressif (fuite) à la prise de contrôle d'un objet par un autre (_Use-After-Free_).
- **Mécanismes internes** :
  - Comparaison structurée C vs Rust Ownership vs GC traçant générationnel (_GC Roots_ sur pile/registres/globales).
  - Chronologie des 4 pathologies du tas : **Fuite mémoire** (perte du dernier pointeur, CWE-401), **Double Free** (corruption de liste libre), **Heap Buffer Overflow** (écrasement de l'en-tête du chunk voisin, CWE-787), **Use-After-Free** (`free(p)` → réallocation au profit d'un objet `Admin` dans le même créneau → déréférencement de l'ancien `p`, CWE-416).
  - Réalité compilateur/CPU : promotion en registres (`-O2`), _dead-store elimination_, hiérarchie de caches CPU L1/L2/L3 et caractère imprévisible des _Undefined Behaviors_.
- **Visualisations nécessaires** : `VIS-04` (scénarios _UAF / Heap Overflow_) et `VIS-05` — Comparateur Manuel vs RAII vs Ramasse-miettes ([03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md#vis-05--comparateur-manuel-c-vs-raiiownership-vs-gc)).
- **Exemples** :
  - Scénario complet d'un _Use-After-Free_ : un ancien pointeur `session_ptr` libéré lit ou modifie les champs d'un nouvel objet `privilege_token` placé par `tcache` au même emplacement exact.
  - Comparaison dans `VIS-05` d'un même tampon transmis à une sous-fonction sous C, Rust (transfert _move_) et .NET/JVM (traçage depuis racines).
- **Cas limites** :
  - Rétention involontaire sous GC (une liste statique continue de référencer des objets inutilisés : « fuite logique » malgré le GC).
  - En C avec `-O2`, une variable locale n'apparaît souvent pas sur la pile (vérifiable dans l'activité externe en lecture seule sous Compiler Explorer).
- **Exercices associés** : `EX-14`, `EX-15`, `EX-16`.
- **Critères de réussite** : classer sans erreur Fuite, Double Free, Heap Overflow et UAF sur trace ; comparer C, Rust et GC sur 3 contraintes d'ingénierie.

---

## Synthèse & Évaluation cumulative finale

- **Format** : Parcours intégré reprenant l'enchaînement complet d'un programme (code en `Text` → `main` crée une trame sur `Stack` → alloue un objet sur `Heap` → libération puis anomalie) sans écriture de code, suivi d'un laboratoire externe facultatif en lecture seule (`Compiler Explorer` + lecture guidée d'un examen GDB `x/16bx $rsp`).
- **Seuil de validation du cours** : Score >= 80 % sur l'évaluation cumulative et maîtrise validée sur chacun des 3 modules.
