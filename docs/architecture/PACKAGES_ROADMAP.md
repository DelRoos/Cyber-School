# Feuille de route des packages spécialisés

Conformément au principe d'éviter les packages vides ou les dépendances inutiles lors de l'initialisation, seuls les packages nécessaires au socle et au démonstrateur TCP sont créés dès maintenant (`ui`, `animations`, `exercises`, `lesson-runtime`).

Les emplacements suivants sont **réservés et documentés** pour les prochaines itérations :

## 1. `packages/visualizations` (À activer lors de l'Itération 2)

- **Bibliothèques prévues** : `d3`, `@types/d3`, `@xyflow/react` (React Flow / XYFlow).
- **Cas d'usage** :
  - Exploration interactive du graphe de compétences et des prérequis (XYFlow).
  - Courbes quantitatives, distributions de latence, fenêtres glissantes TCP et métriques (D3.js).
- **Critère d'activation** : Premier cours ou vue curriculum nécessitant un graphe interactif ou une visualisation statistique D3.

## 2. `packages/3d-scenes` (À activer lors de l'Itération 3)

- **Bibliothèques prévues** : `three`, `@types/three`, `@react-three/fiber` (`^9.x` compatible React 19), `@react-three/drei`.
- **Cas d'usage** :
  - Topologies matérielles/réseau 3D manipulables, propagation physique, architectures mémoire/CPU spatialisées, cryptographie géométrique.
- **Contraintes d'architecture obligatoires** :
  - Composants `'use client'` importés via `next/dynamic(..., { ssr: false })`.
  - Respect des budgets de performance 3D définis dans [PEDAGOGICAL_AND_VISUAL_STANDARDS.md](../standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md).
  - Justification pédagogique documentée avant toute création de scène 3D.
