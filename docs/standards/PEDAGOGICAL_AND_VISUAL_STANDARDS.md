# Standards pédagogiques, visuels et 3D

Ce document fixe le niveau d'exigence minimal de tout futur cours publié sur **Cyber School**.

## 1. Principes pédagogiques fondamentaux

1. **Rendre l'abstrait visible** : Chaque mécanisme invisible (en-têtes réseau, automates d'états, files, pointeurs, transformations) doit disposer d'une représentation visuelle explicite de ses variables clés.
2. **Progression explicative** : Construire de l'intuition vers le mécanisme formel :
   - _Pourquoi le problème existe_ -> _Mécanisme étape par étape_ -> _Inspection des paramètres_ -> _Cas limites / pannes_ -> _Vérification par le raisonnement_.
3. **Couplage animation <-> raisonnement** : Une animation ne doit jamais être décorative. Chaque mouvement, changement de couleur ou transition d'état doit illustrer une cause et un effet précis décrits dans le texte synchronisé.
4. **Exploration interactive active** : L'apprenant doit pouvoir mettre en pause, avancer/reculer pas à pas, inspecter les valeurs internes et déclencher des scénarios alternatifs (ex: perte de paquet, timeout).
5. **Cas limites obligatoires** : Chaque leçon doit montrer au moins un cas limite ou scénario d'échec pour éviter les modèles mentaux naïfs.
6. **Exactitude scientifique** : Terminologie conforme aux standards primaires (ex: RFC 9293 pour TCP). Si une simplification pédagogique est faite (ex: ISN lisibles `100` / `300` au lieu d'entiers 32 bits pseudo-aléatoires), elle doit être explicitement signalée comme telle.
7. **Évaluation du raisonnement** : Varier les formats d'exercices (prédiction d'état, ordonnancement de séquence, diagnostic d'anomalie, QCM conceptuel) avec feedback ciblé pour chaque erreur.
8. **Accessibilité & multi-appareils** : Utilisable au clavier (`Tab`, `Enter`, `Space`, flèches), annonces ARIA pour les changements d'état, contrastes élevés, lisible sur mobile (`375px`) comme sur desktop, et respect strict de `prefers-reduced-motion`.

## 2. Règle d'arbitrage 2D vs 3D

> **La 3D ne doit jamais être imposée lorsqu'une animation 2D explique mieux un concept.**

- **Privilégier la 2D (SVG + GSAP + Motion, D3, XYFlow)** pour : diagrammes de séquence, protocoles réseau, machines à états, structures de données, algorithmes, graphes de dépendance, courbes mathématiques.
- **Autoriser la 3D (Three.js / R3F)** uniquement lorsque la troisième dimension apporte une information irremplaçable : géométrie spatiale, transformations matricielles 3D, topologie matérielle/physique, optique/champs, propagation spatiale.

## 3. Budgets et règles de performance pour les scènes 3D

Lorsqu'une scène 3D est justifiée et intégrée (via `packages/3d-scenes`) :

- **Chargement** : Composant `'use client'` importé dynamiquement via `next/dynamic(..., { ssr: false })` afin de ne pas alourdir le bundle initial des autres cours.
- **Complexité géométrique** : <= 100 000 triangles et <= 100 draw calls par scène active.
- **Textures & rendu** : Textures compressées <= 1024×1024 px par défaut ; `dpr={[1, 2]}` ; aucune allocation d'objet (`new THREE.Vector3`, etc.) dans la boucle `useFrame`.
- **Cycle de vie mémoire** : Libération explicite (`dispose()`) des géométries, matériaux et textures au démontage.
- **Accessibilité 3D** : Boutons de pré-réglages caméra accessibles au clavier, panneau texte synchronisé décrivant la scène, et mode fallback statique/2D si WebGL est indisponible.
