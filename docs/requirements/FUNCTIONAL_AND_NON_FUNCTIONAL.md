# Exigences fonctionnelles et non fonctionnelles

## Exigences fonctionnelles (Phase Socle & Corpus Initial)

1. **Modèle de curriculum atomique** : Représenter `Domaine -> Module -> Chapitre -> Concept atomique -> Leçon -> Exercices -> Évaluations -> Laboratoires externes` avec réutilisation d'un concept dans plusieurs parcours sans duplication.
2. **Moteur de leçons interactives** : Charger et valider des manifestes de leçons structurés, exposer des composants de leçon isolés mais alimentés par un design system et un runtime d'animations/exercices partagés.
3. **Démonstrateur initial** : Offrir une leçon interactive fonctionnelle sur le **protocole TCP et le Three-Way Handshake** (schéma animé, SYN / SYN-ACK / ACK, transitions d'état, cas limite perte/retransmission, exercice de compréhension).
4. **Continuité inter-agents** : Permettre à Codex, Claude Code ou Gemini CLI de reprendre une tâche exactement là où un autre agent l'a laissée via les fichiers versionnés (`continuity/`, `planning/`, `docs/`).

## Exigences non fonctionnelles

1. **Typage & intégrité** : TypeScript `strict: true` partout ; validation Zod de toutes les données pédagogiques et de l'intégrité du graphe de prérequis (détection des références manquantes et cycles).
2. **Accessibilité (WCAG 2.1 AA ciblé)** : Navigation complète au clavier, annonces ARIA live pour les changements d'étape, contrastes suffisants, prise en charge de `prefers-reduced-motion`.
3. **Responsive & performance** : Expérience fluide de `375px` (mobile) à `1440px+` (desktop) sans débordement horizontal, zéro erreur console, chargement rapide et budgets stricts pour toute future scène 3D.
4. **Sécurité IA** : Aucun secret versionné ; ressources externes traitées comme données non fiables ; isolation future des codes de leçons exécutables.
