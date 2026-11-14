# Motifs cognitifs CTML & Explorable Explanations par famille de concepts

Synthèse opérationnelle issue de la théorie cognitive de l'apprentissage multimédia (Richard E. Mayer : _Signaling_, _Spatial/Temporal Contiguity_, _Segmenting_) et des _Explorable Explanations_ (Bret Victor / Nicky Case).

## 1. Correspondance Famille de concepts -> Encodage visuel obligatoire

| Famille de concepts                           | Ce qui DOIT s'animer visuellement (GSAP / SVG / Motion)                                                                                                                                                                         | Anti-patron à rejeter                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Graphes causaux & biais (ex. confondant)**  | Deux impulsions simultanées `Z→X` et `Z→Y` avec flèches orientées ; ciseaux/verrou `do(X=OFF)` coupant visuellement l'arc entrant ; barres `P(Y\|X=1)` vs `P(Y\|do(X=0))` mises à jour en direct.                               | Un seul point orange décorrélé qui glisse sans suivre les deux arcs du graphe.            |
| **Logique formelle & contre-exemple minimal** | Circuit d'évaluation de règle en pipeline : jetons traversant les portes (`port`, `TLS`, `proxy`), alerte rouge `BYPASS` sur la branche non couverte et étiquette `Superflu` sur toute condition inutile.                       | Trois boutons texte et un encadré d'alerte sans visualisation du circuit de décision.     |
| **CPU, Bus & Little-Endian**                  | Pipeline lumineux `Fetch → Decode → Execute → Bus`, paquet étiqueté (`0x78`, `0x56`, `0x34`, `0x12`) découpé depuis `RAX` et déposé octet par octet en ordre inverse sur `0x1008..0x100B`.                                      | Un point non étiqueté sur une ligne fixe sans lien avec les octets RAM.                   |
| **Mémoire virtuelle & MMU (`rwx`)**           | Faisceau d'adresse virtuelle (`VA`) traversant le bloc MMU (vérification PID + bits `R\|W\|X`), soit dévié vers un cadre physique vert, soit bloqué contre un bouclier rouge `SIGSEGV`.                                         | Des listes statiques de segments sans représentation du contrôle MMU.                     |
| **Pile d'appels (`RSP`/`RBP`, Dangling)**     | Glissière animée des adresses hautes vers adresses basses, curseur `RSP` mobile, empilement/dépilement fluide des frames, hachurage des octets résiduels libérés, et flèche rouge `Pointeur pendant` pointant au-delà de `RSP`. | Des cartes conditionnelles qui apparaissent brutalement sans mouvement du pointeur `RSP`. |
| **Tas (`malloc`/`free`, fragmentation, UAF)** | Découpage visuel des chunks (en-tête + payload), flash de fusion (_coalescing_) entre blocs adjacents libres, et double flèche rouge sur le même chunk pour `Use-After-Free (CWE-416)`.                                         | Un changement de couleur de bordure sans pointeurs ni géométrie de chunk.                 |
| **Protocoles réseau (TCP, états, timers)**    | Trajet diagonal Client ↔ Serveur synchronisé avec l'automate (`CLOSED → SYN_SENT → ESTABLISHED`), inspection d'en-tête sur la trame en vol et jauge de timer de retransmission visible lors d'une perte.                        | Transition instantanée sans état intermédiaire visible ni mécanique de timer.             |

## 2. Checklist de revue visuelle (avant validation QA)

- [ ] L'utilisateur voit-il **immédiatement** quel élément vient de changer entre `t` et `t+1` (Signalisation) ?
- [ ] L'explication de l'étape est-elle collée **visuellement** à l'objet transformé, avec changement `avant → après` explicite (Contiguïté) ?
- [ ] Peut-on avancer/reculer pas à pas, mettre en pause et modifier un paramètre hypothétique (Segmenting + Exploration) ?
- [ ] En mode `prefers-reduced-motion: reduce`, toutes les flèches orientées, états bloqués/actifs et deltas numériques restent-ils 100 % compréhensibles ?
