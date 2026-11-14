---
name: pedagogical-animation
description: Design and implement concept-coupled pedagogical animations grounded in Mayer's Cognitive Theory of Multimedia Learning (CTML) and Bret Victor's Explorable Explanations. Use whenever creating, reviewing, or upgrading interactive visualizations so motion directly shows cause, state transformation, and invariant proof rather than decorative movement.
metadata:
  owner: visual-scenario-designer
  version: "1.0"
---

# Pedagogical Animation (CTML + Explorable Explanations)

## Quand utiliser ce skill

- Dès qu'une notion technique doit être rendue perceptible par le mouvement ou l'interaction directe (`VIS-xx`, simulateurs, schémas causaux).
- Lorsqu'une animation existante paraît « décorative », « abstraite » ou déconnectée de la mécanique réelle du concept.

## Les 5 règles non négociables

1. **Mécanisme avant mouvement (Zero Decorative Pulse)** :
   - **Interdit** : animer un rond générique sans étiquette sur une ligne abstraite ou faire vibrer un badge sans montrer _pourquoi_ et _ce qui change_.
   - **Obligatoire** : chaque élément animé est un objet authentique du modèle (une frame de pile qui s'empile pendant que `RSP` glisse vers les adresses basses ; deux impulsions simultanées `Z -> X` et `Z -> Y` coupées net par `do(X = OFF)` ; un octet `0x78` qui se détache du registre `RAX` vers `0x1008` ; une requête testant chaque porte logique d'une règle avant de révéler un bypass).
2. **Principe de signalisation (Mayer — Signaling)** :
   - Mettre en surbrillance simultanément la **cause** (ex. instruction `CALL`, bit `W=0`, condition `TLS=false`), le **lien de propagation** (flèche vectorielle orientée + marqueur animé) et l'**effet** (nouvel état, piège `SIGSEGV`, compteur modifié).
   - Comparer visuellement l'état **avant -> après** ou **observé vs intervention** (ex. barres parallèles `P(Y|X=1)` vs `P(Y|do(X=0))`).
3. **Contiguïté spatiale et temporelle (Mayer — Spatial & Temporal Contiguity)** :
   - L'étiquette courte de transformation (`« Z déclenche X et Y »`, `« RSP - 32 o »`, `« Bypass: TLS=0 accepté »`) apparaît **dans ou immédiatement à côté du schéma animé** au moment exact où l'étape s'exécute.
   - Ne jamais séparer une légende en bas de page d'un diagramme muet en haut de page.
4. **Segmenting & Contrôle actif (Explorable Explanations)** :
   - L'apprenant contrôle le temps : `Précédent`, `Suivant`, `Lecture/Pause`, `Réinitialiser`, raccourcis clavier (`ArrowLeft` / `ArrowRight` / `Home`) et clic direct sur les jalons ou paramètres.
   - Modifier un paramètre (ASLR, coalescing, `do(X)`, perte réseau, profondeur récursive) déforme **immédiatement** le modèle visuel et explique la différence résultante.
5. **Accessibilité & `prefers-reduced-motion`** :
   - Toujours utiliser `usePrefersReducedMotion`, `getStepDuration` et `useGsapScope` depuis `@cyber-school/animations`.
   - En mouvement réduit (`duration = 0`), toutes les flèches orientées, valeurs, badges de delta (`avant -> après`), cibles surlignées et explications causales restent 100 % lisibles à l'écran.

## Matrice obligatoire avant de coder une animation

Avant d'écrire une ligne de JSX/GSAP, remplir explicitement ce tableau dans le dossier de conception (`COURSE_DOSSIER.md` ou commentaire JSDoc du composant) :

| Question                                      | Ce que l'animation doit montrer physiquement                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Quelle confusion précise détruit-on ?**     | Ex. « Croire qu'une corrélation X↔Y prouve X→Y » ou « Croire que `free()` efface la RAM » |
| **Quels objets bougent ou se transforment ?** | Ex. « Ciseaux d'intervention sur `Z→X`, signal orange maintenu sur `Z→Y` »                |
| **Quelle est la preuve visuelle finale ?**    | Ex. « Barre `P(Y                                                                          | do(X=0))`reste à 408 alertes/h face à`410` avant coupure » |

Consulter aussi [references/ctml-explorable-patterns.md](references/ctml-explorable-patterns.md) pour les motifs concrets par famille de concepts et les anti-patrons à rejeter en revue QA.
