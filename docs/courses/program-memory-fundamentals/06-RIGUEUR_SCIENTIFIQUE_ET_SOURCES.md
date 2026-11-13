# Rigueur scientifique, simplifications assumées et sources primaires

Ce document trace la frontière exacte entre les **simplifications visuelles nécessaires à la compréhension** et le **comportement réel des systèmes d'exploitation, compilateurs et matériels**. Il doit figurer visiblement dans les encarts « Ce que le simulateur simplifie » intégrés aux chapitres concernés.

---

## 1. Tableau de rigueur : modèle pédagogique vs réalité système

| Mécanisme                        | Simplification pédagogique dans le cours (`VIS-01..05`)                         | Réalité matérielle / OS / compilateur (à mentionner explicitement)                                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adresses mémoire**             | Adresses courtes lisibles (`0x0040`, `0x1008`, `0x7FF0`)                        | Sur x86-64 Linux, adresses virtuelles canoniques 48 bits (`0x00007fff...`, `0x00005555...`) randomisées à chaque lancement par **ASLR**.                                                                                                            |
| **Modèle de RAM & CPU**          | Lecture directe CPU ↔ RAM via bus pour isoler le mécanisme d'adressage          | Plusieurs niveaux de caches matériels (**L1/L2/L3**), _store buffers_ et **exécution spéculative / dans le désordre** séparent les cœurs de la DRAM.                                                                                                |
| **Pagination / MMU**             | Table des pages simplifiée 1-niveau montrant `Page Virtuelle → Cadre Physique`  | Tables hiérarchiques à **4 ou 5 niveaux** sous x86-64 accélérées par le **TLB** (_Translation Lookaside Buffer_) et gérées via VMAs (`maple_tree`) sous Linux.                                                                                      |
| **Variables & registres**        | Chaque variable locale reçoit une case lisible dans sa trame de pile (`VIS-03`) | Avec optimisation (`-O1`/`-O2`), le compilateur promeut la plupart des locales uniquement en **registres CPU**, sans jamais les allouer en RAM si `&x` n'est pas pris.                                                                              |
| **Trame de pile & `RBP`**        | `RBP` systématiquement présent pour matérialiser la base de chaque trame        | Sous `-fomit-frame-pointer` (défaut courant en release), tout est indexé directement depuis `RSP`. En feuilles sous Linux x86-64 ABI, la **Red Zone** (128 o sous `RSP`) dispense même parfois de modifier `RSP`.                                   |
| **Allocateur du tas (`malloc`)** | Modèle lisible avec en-tête `size + P/M` et fusion directe des blocs libres     | `ptmalloc2` (`glibc`) emploie des **tcache par thread**, _fastbins_ non immédiatement fusionnés, _unsorted/small/large bins_, plusieurs _arenas_ multi-thread et `mmap` au-delà d'un seuil dynamique.                                               |
| **Comportements indéfinis (C)**  | Visualisation de la valeur résiduelle ou de l'écrasement sur `dangling` / `UAF` | En ISO C, le comportement indéfini (**UB**) autorise le compilateur à optimiser en supposant qu'il n'arrive jamais (suppression de branches de garde, réordonnancement surprenant).                                                                 |
| **Pile vs Tas selon le langage** | Langage agnostique centré sur modèle système natif (C / ABI Linux x86-64)       | Un langage managé (Java, C#, JS) alloue les objets principalement sur le tas géré par GC (avec _escape analysis_ pouvant remettre sur pile), tandis que Go peut promouvoir une variable locale sur le tas automatiquement si son adresse s'échappe. |

---

## 2. Avertissements de spécificité plateforme et langage

Les encarts pédagogiques du cours doivent explicitement préciser :

1. **Architecture et ABI de référence** : sauf mention contraire, les exemples d'ordre des octets (_little-endian_), sens de croissance de la pile (vers les adresses basses) et conventions d'appel se réfèrent à **Linux x86-64 (System V AMD64 ABI)**. D'autres architectures existent (ex. systèmes _big-endian_ réseau, ou ABI Windows x64 sans Red Zone avec registres `RCX/RDX/R8/R9`).
2. **Ne pas généraliser « pointeur = erreur de compilation »** :
   - **C / C++** : retourner `&local` compile souvent avec un simple avertissement ; le danger survient silencieusement à l'exécution.
   - **Rust** : le _borrow checker_ refuse **à la compilation** toute référence dépassant la durée de vie du propriétaire.
   - **Java / C# / Python / JS** : les variables locales primitives ou références sont sur pile (ou _closure/heap_), et les objets survivent via le **GC** dès qu'une référence reste atteignable.

---

## 3. Sources techniques primaires vérifiées

Toutes les sources ci-dessous sont enregistrées et validées dans [resources/sources.json](../../../resources/sources.json) avec `trustLevel` vérifié et `untrustedContentNotice: true` :

| ID ressource             | Source & Éditeur                                                            | URL vérifiée                                                                      | Utilisation précise dans le cours                                                 |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `linux-mm-concepts`      | The Linux Kernel Documentation — Memory Management Concepts                 | https://docs.kernel.org/admin-guide/mm/concepts.html                              | Chap. 2 & 5 : espace virtuel, pagination, MMU, mémoire anonyme, OOM               |
| `linux-proc-pid-maps`    | Linux man-pages — `proc_pid_maps(5)`                                        | https://man7.org/linux/man-pages/man5/proc_pid_maps.5.html                        | Chap. 2 : régions `[heap]`, `[stack]`, `[vdso]`, permissions `rwxp`               |
| `sysv-amd64-abi`         | System V Application Binary Interface — AMD64 Architecture Processor Suppl. | https://github.com/hjl-tools/x86-64-psABI                                         | Chap. 1, 3, 4 : endianness, `RSP`/`RBP`, alignement 16 o, registres ABI, Red Zone |
| `glibc-malloc-internals` | GNU C Library (glibc) Wiki — Malloc Internals                               | https://sourceware.org/glibc/wiki/MallocInternals                                 | Chap. 5 & 6 : chunks `mchunk_size`, flags `A                                      | M   | P`, `tcache`, bins, `brk`/`mmap` |
| `rust-ownership-book`    | The Rust Programming Language — Ch. 4: Understanding Ownership              | https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html                     | Chap. 4, 5 & 6 : pile vs tas et libération déterministe par propriété             |
| `dotnet-gc-fundamentals` | Microsoft .NET Documentation — Fundamentals of Garbage Collection           | https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals | Chap. 6 : tas géré, racines GC (_roots_), générations                             |
| `godbolt-explorer`       | Compiler Explorer (Godbolt)                                                 | https://godbolt.org                                                               | Chap. 1, 3 & 6 : laboratoire externe en lecture seule (`-O0` vs `-O2`)            |

### Références de taxonomie sécurité citées en prose

- **MITRE CWE** : **CWE-416** (_Use After Free_), **CWE-787** (_Out-of-bounds Write_), **CWE-401** (_Missing Release of Memory after Effective Lifetime_) — référencés pour classer rigoureusement les pathologies du tas sans dériver vers des scénarios d'exploitation offensive.
- **Documentation GDB** (_Examining Memory_, commande `x/nfu addr`) — utilisée comme référence syntaxique de lecture passive (`x/16bx $rsp`) dans le guide de laboratoire en lecture seule.
