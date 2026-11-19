# Orientation Parcours — 14 novembre 2026

## Intention

Public : débutants et apprenants qui cherchent une spécialisation. Travail principal de la page : choisir une direction, comprendre les prérequis et ouvrir un cours réellement accessible.

Le catalogue `/parcours` devient une destination distincte du détail `/parcours/[slug]`. Le tronc commun est le point d’entrée recommandé. Les cinq autres parcours sont comparables par objectif et périmètre. Les disponibilités viennent du référentiel existant.

## Direction visuelle

- Graphite `#101312` : fond commun du site.
- Surface `#191e1b` : zones interactives.
- Ivoire `#f0f1e9` : texte principal.
- Végétal `#c8ed97` : point de départ et action principale.
- Bleu `#a9c7fa` : repères du réseau et spécialisations.
- Gris sauge `#a6b0a8` : descriptions et métadonnées.

Manrope locale : titres, texte et contrôles. Titres amples, alignés à gauche. Monospace réservé aux données de la petite illustration mémoire. Des rayons différents suivent la hiérarchie : grand cadre de départ, cartes de spécialisation, lignes du programme.

```text
Catalogue
Les parcours
Une base solide.                 Apprendre en manipulant.
Votre expertise ensuite.        Choisir selon son objectif.

┌ Tronc commun, recommandé ────── Chemin des fondations ┐
│ objectif / prérequis / action   preuve → mémoire      │
│                                systèmes → réseaux   │
└─────────────────────────────────────────────────────┘
Choisir sa spécialisation      recherche + filtres
cartes d’objectifs, disponibilité explicite, programme
Conseil de départ et accès au premier cours

Détail
retour aux parcours / sujet
titre + objectif                fiche de démarrage
programme dépliable              prérequis / disponibilité
chapitres accessibles et prévus  premier cours
objectifs pratiques et suites
```

## Revue avant réalisation

La première piste consistait à simplement embellir la carte technique existante. Elle ne résolvait pas le problème d’orientation : `/parcours` ouvrait implicitement un seul programme. La décision retenue sépare choix et lecture du programme. Une petite carte du chemin des fondations devient l’unique expression graphique forte ; elle représente des étapes réelles. Les textes techniques, jauges, numérotations des branches et commandes audio permanentes quittent le premier écran. Aucun effet de révélation ne masque le contenu au chargement.

## Références d’implémentation

- Next.js 16.4 : documentation embarquée `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` pour la navigation.
- [React : structurer l’état](https://react.dev/learn/choosing-the-state-structure) : filtres et résultats dérivés, sans état dupliqué.
- [WAI : accordéon](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) : boutons dans les titres, `aria-expanded`, `aria-controls`, Entrée/Espace et Tab.

## Vérification

Les captures et résultats réels sont consignés après réalisation dans `audits/parcours-redesign/REVIEW.md` et la preuve du runner `quality:verify`. Les contrôles portent aussi sur les liens directs `#noeud-*`, les filtres vides, leur réinitialisation et le changement de parcours.

## Adaptation lors de l’intégration

Une session simultanée a supprimé les routes de cours et le catalogue `/curriculum`, ainsi que leurs liens dans les composants Parcours. Ces modifications sont préservées. Les libellés « cours accessibles » et les appels vers un premier cours sont donc retirés de cette livraison : le catalogue oriente vers les programmes et leurs modules. Les métriques de volume sont celles du programme prévu ; aucun accès immédiat ni progression n’est annoncé. La suppression des routes et de leurs tests ne provient pas de la refonte.
