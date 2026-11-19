---
name: landing-page-design
description: Design, structure, and audit high-converting landing pages for Cyber School's interactive learning academy (Inspired by Brilliant, Stripe, and Linear). Use whenever designing or rebuilding the home page (/), navigation chrome, hero interactive proof, course showcase cards, or learner-facing entry points.
metadata:
  owner: frontend-experience
  version: "1.1"
---

# Landing Page Design — Cyber School

## Quand utiliser ce skill

- Dès qu'on conçoit, refond ou audite la landing page (`/`), le header/footer global ou la présentation publique des parcours et des cours.
- En complément obligatoire de [frontend-design](../frontend-design/SKILL.md), [visual-explanation](../visual-explanation/SKILL.md), [gsap-animation](../gsap-animation/SKILL.md) et [browser-validation](../browser-validation/SKILL.md).

## Règles non négociables

1. **Clarté en moins de 3 secondes (Above the Fold)** :
   - Le visiteur doit comprendre immédiatement **ce qu'il va maîtriser** (architecture système, mémoire, réseaux, sécurité offensive par le mécanisme), **comment** (en manipulant des expériences interactives sans installation) et **par où commencer** (1 CTA primaire dominant + 1 lien secondaire discret).
   - Interdit de multiplier les boutons concurrents au même niveau visuel dans le hero.

2. **Preuve produit vivante, zéro maquette morte** :
   - Le visuel principal du hero est une **mini-expérience interactive réelle** représentative de la plateforme (ex. registre/octet, pile/tas, paquet réseau ou bascule causale) dans laquelle l'utilisateur agit directement dès l'arrivée sur la page.
   - Chaque action produit un changement d'état lisible immédiatement sans scroll préalable.

3. **Zéro jargon interne ou identifiants techniques visibles (Règle Anti-Fuite V4)** :
   - **Strictement interdit** d'exposer sur la landing page ou les cartes destinées à l'apprenant :
     - des codes de modules ou identifiants de base (`TC-00`, `unit-tc00-*`, `B-01`, `EX-01`, slugs bruts) ;
     - du métalangage d'usine de production (`Référentiel atomique V4`, `Registre de production`, `Version en revue`, `Tronc commun —`, `Chaîne de production industrialisée`) ;
     - des états internes de workflow (`in-review`, `revue_necessaire`, `draft`).
   - Traduire systématiquement en **bénéfices et thèmes compréhensibles par un apprenant** (ex. _Systèmes & Mémoire_, _Réseaux & Protocoles_, _Raisonnement & Preuve_).
   - Si le parcours complet (`/curriculum`) ou un catalogue est lié depuis la landing page, présenter d'abord une **vue apprenant propre** (ou masquer les IDs de pipeline hors vue d'audit dédiée).

4. **Narration de scroll structurée (4 à 5 bandes distinctes, sans bruit)** :
   - **Bande 1 — Hero & Démo interactive** : Promesse orientée maîtrise + mini-labo tactile + CTA primaire.
   - **Bande 2 — Ce qui rend la méthode différente (_Predict → Manipulate → Understand_)** : Preuve concrète de la pédagogie _Explorable Explanation_ plutôt que 3 cartes génériques statiques.
   - **Bande 3 — Cours interactifs disponibles** : Cartes riches avec aperçu visuel authentique du mécanisme, durée, niveau d'entrée réel et action directe claire.
   - **Bande 4 — Progression du zéro vers la maîtrise** : Architecture claire des grandes étapes du cursus en langage humain (Systèmes, Réseaux, Sécurité appliquée), sans mur de 1 000 lignes.
   - **Bande 5 — Invitation finale ciblée & Footer sobre**.

5. **Hiérarchie visuelle, contraste et sobriété** :
   - Un axe fort d'accentuation (palette contrastée WCAG AA, bordures nettes 1px, hiérarchie typographique assumée avec `letter-spacing` serré sur les titres d'affichage et `max-width <= 68ch` sur les textes).
   - Aucun débordement horizontal sur desktop (`1440px`) comme sur mobile (`375px`).

6. **Chorégraphie d'animation, atmosphère & Scroll-Driven Motion (inspirée `MengTo/Skills`)** :
   - **Entrée orchestrée du Hero & parallaxe** : séquence GSAP courte au montage (`opacity` + `translateY`, `stagger: 0.08`, `power3.out`) couplée à un `<canvas>` atmosphérique bridé (`dpr <= 2`, pause hors viewport / onglet caché) et une parallaxe légère au scroll (`scrub: true`).
   - **Framing technique & Spotlight GPU** : guides verticaux de conteneur (`1px` + repères d'angle), faisceau supérieur animé discret (`.workbench-beam`) et halos de curseur (`--hero-mx/my`, `--card-mx/my` uniquement sur pointeur non tactile).
   - **Scroll-Progress Timeline & Marquee** : barre de progression sous le header (`scaleX`), ruban continu des mécanismes clés avec masque latéral (`prefers-reduced-motion` → grille statique), et frise de progression verticale `scroll-progress-timeline` avec compteur actif mis à jour au scroll.
   - **Micro-interactions réactives** : chaque clic ou survol sur le workbench, les boutons magnétiques (`gsap.quickTo`), les cartes et les schémas anime uniquement des propriétés GPU (`transform`, `opacity`).
   - **Accessibilité stricte** : vérifier `usePrefersReducedMotion()` avant d'initialiser toute animation GSAP/Canvas ; en mode réduit, tout reste immédiatement visible (`opacity: 1`, frise remplie à `100%`, aucun pin/scrub).

Consulter [references/interactive-academy-landing-checklist.md](references/interactive-academy-landing-checklist.md) pour la grille d'audit complète avant validation Playwright.
