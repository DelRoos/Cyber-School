# Playbook d'animations pédagogiques (`cyber-school`)

Ce document formalise les principes cognitifs issus de la recherche en éducation scientifique et informatique pour garantir que chaque animation **touche directement le mécanisme du concept** et reste immédiatement lisible pour un apprenant débutant ou avancé.

## 1. Fondements scientifiques appliqués

| Cadre de référence                                                    | Principe clé                              | Traduction concrète dans Cyber School                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Richard E. Mayer — Cognitive Theory of Multimedia Learning (CTML)** | _Signaling Principle_                     | Mettre en évidence en temps réel la cause active, le chemin emprunté et la variable modifiée (spotlights, flèches orientées).  |
| **Richard E. Mayer — CTML**                                           | _Spatial & Temporal Contiguity_           | Afficher la micro-explication (`Cause → Effet`) et les deltas numériques directement sur l'élément visuel animé à cet instant. |
| **Richard E. Mayer — CTML / IES Practice Guide**                      | _Segmenting & Worked-Example Scaffolding_ | Découper chaque mécanisme en micro-étapes contrôlées par l'apprenant (`Précédent`, `Suivant`, `Play/Pause`, clavier).          |
| **Bret Victor — _Explorable Explanations_**                           | _Direct Manipulation & Reactive Models_   | Permettre de basculer une hypothèse (`do(X=OFF)`, `ASLR`, `coalescing`, `perte SYN-ACK`) et voir le graphe/schéma se déformer. |

## 2. Règle d'or : L'animation doit montrer la transformation du concept

Une animation échoue pédagogiquement si :

- un cercle anonyme se contente de glisser sur une ligne sans montrer **quelle donnée circule** ou **quel invariant change** ;
- un utilisateur doit lire un long paragraphe à droite pour deviner ce qui a bougé dans un schéma figé à gauche ;
- une notion de logique, de mémoire ou de sécurité reste purement textuelle sans schéma de flux ou de structure interne.

Toute animation de cours doit donc combiner **trois couches synchronisées** :

1. **Couche structurelle (SVG / DOM)** : les objets réels du domaine (nœuds causaux, portes logiques, registres/octets, MMU `rwx`, frames de pile + `RSP`, chunks du tas, paquets TCP).
2. **Couche causale animée (GSAP / Motion via `@cyber-school/animations`)** : propagation le long des arcs exacts, découpage/transfert de jetons étiquetés, verrou/coupure d'intervention, barre de comparaison avant/après, surbrillance des cellules modifiées.
3. **Bandeau de transformation (`ConceptTransformBanner`)** : phrase courte à côté ou au-dessus du canvas résumant « _Ce qui vient de se passer → Pourquoi c'est important_ », accompagnée d'un delta explicite.

## 3. Cartographie de mise en conformité des cours existants

| Cours                            | Composant                                 | Ce que l'animation montre visuellement                                                                                                                          |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scientific-reasoning-and-proof` | `VIS-01` (`Vis01CausalConfounder`)        | Double propagation simultanée `Z→X` et `Z→Y`, ciseaux d'intervention `do(X=OFF)` coupant `Z→X`, barres comparatives `P(Y\|X=1)` vs `P(Y\|do(X=0))`.             |
| `scientific-reasoning-and-proof` | `VIS-02` (`Vis02CounterexampleFalsifier`) | Pipeline animé d'évaluation de règle sécurité (`port`, `TLS`, `proxy` -> filtre naïf -> verdict réel) avec trace rouge de bypass et alerte condition superflue. |
| `program-memory-fundamentals`    | `VIS-01` (`Vis01CpuMemory`)               | Token animé sur le bus d'adresses vs bus de données + décomposition visuelle de `0x12345678` vers `0x78 56 34 12` en ordre Little-Endian.                       |
| `program-memory-fundamentals`    | `VIS-02` (`Vis02VirtualMemory`)           | Faisceau animé de traduction `Adresse Virtuelle → MMU (rwx) → Cadre Physique RAM` ou blocage rouge `SIGSEGV`.                                                   |
| `program-memory-fundamentals`    | `VIS-03` (`Vis03CallStack`)               | Curseur animé `RSP` descendant/montant en `O(1)`, empilement fluide des frames et flèche `Pointeur pendant` vers la zone libérée.                               |
| `program-memory-fundamentals`    | `VIS-04` (`Vis04HeapAllocator`)           | Animation du découpage/fusion (`coalescing`) des chunks et double flèche rouge `CWE-416 Use-After-Free` vers le même bloc réalloué.                             |
| `program-memory-fundamentals`    | `VIS-05` (`Vis05MemoryModels`)            | Flux synchronisés Manuel C vs Ownership Rust (transfert de jeton / blocage compilateur) vs GC (vague de marquage/balayage).                                     |
| `tcp-three-way-handshake`        | `TcpHandshakeSimulator`                   | Propagation diagonale Client ↔ Serveur synchronisée avec l'automate d'états, inspection d'en-tête TCP et jauge de timer RTO sur perte `SYN-ACK`.                |
