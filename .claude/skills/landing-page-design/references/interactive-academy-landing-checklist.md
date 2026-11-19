# Checklist d'audit — Landing Page Cyber School

Avant de valider une refonte de landing page via `browser-validation`, vérifier chaque point :

## 1. Premier écran (`Above the Fold` desktop 1440x900 et mobile 375x812)

- [ ] Proposition de valeur compréhensible en < 3 s (titre orienté résultat + sous-titre en 1-2 lignes).
- [ ] Un seul CTA primaire à contraste élevé (`Commencer ...` ou `Explorer ...`) + au plus un lien secondaire discret.
- [ ] La mini-expérience interactive est immédiatement utilisable au clavier et à la souris sans scroller sur desktop.
- [ ] Aucun jargon de pipeline (`TC-00`, `unit-tc00-*`, `Version en revue`, `V4`, `Registre`) visible au premier regard.

## 2. Preuve pédagogique et catalogue

- [ ] Chaque carte de cours affiche un **aperçu visuel fidèle** au mécanisme enseigné (pas une image décorative).
- [ ] Chaque carte n'expose que des métadonnées utiles à l'apprenant (thème, durée, objectif concret, prérequis humain).
- [ ] Les états de filtrage, recherche et vide (`Aucun résultat`) offrent une action immédiate de réinitialisation.

## 3. Navigation, lisibilité et accessibilité

- [ ] Le header reste compact (< 84px), lisible sur mobile sans couper de lien ni créer de barre de défilement horizontale.
- [ ] Tous les contrastes texte/fond respectent WCAG AA (>= 4.5:1 corps, >= 3:1 grands titres).
- [ ] Focus clavier visible sur chaque bouton, lien et contrôle interactif (`:focus-visible`).
- [ ] Aucun débordement (`document.documentElement.scrollWidth <= window.innerWidth`) sur desktop et `375x812`.
- [ ] Zéro erreur console, zéro erreur React/hydratation, zéro avertissement d'accessibilité bloquant.
