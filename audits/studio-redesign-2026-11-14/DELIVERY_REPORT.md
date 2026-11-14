# Refonte du studio d'apprentissage — TASK-015

Direction retenue : studio scientifique sombre, débutants accompagnés. Implémentation et validation terminées le 14 novembre 2026.

## Résultat

- Accueil reconçu : typographie Manrope locale, expérience binaire manipulable, catalogue réel, recherche tolérante aux accents, filtres, état vide et accès au parcours.
- Cours mémoire : sommaire, un chapitre à la fois, intuition, exemple résolu, prédiction, expérience, limites du modèle et bilan pour chacun des six chapitres. Lecture complète disponible. Les réponses sont conservées pendant la session ; les simulateurs masqués sont démontés et leurs animations nettoyées.
- Cours TCP : introduction accessible, exemple numérique, consigne de prédiction et synthèse lisible. Scénarios nominal et perte de paquet, commandes clavier et exercices conservés.
- Bilans : mise en page mobile corrigée ; un lien de révision ouvre le chapitre contenant l'exercice et y déplace le focus. Modifier une réponse vérifiée invalide son score.
- Interface commune : navigation, fil d'Ariane, typographie, palette, focus, contrôles tactiles et références repliables. Les ajouts V4 et le cours de raisonnement présents dans le dépôt sont conservés et testés.

## Compétences et agents

Les 18 adaptateurs des six rôles Codex/Claude/Gemini et les huit skills initiaux sont renforcés. Le contrat commun impose des exemples expliqués, une prédiction, une manipulation et un feedback qui traite les erreurs de compréhension.

Le skill frontend-design d'Anthropic est installé à une révision figée, avec sa licence Apache 2.0 et un miroir Claude identique. Codex et Gemini consomment la copie canonique. Les dix skills présents passent le validateur de métadonnées et les six adaptateurs Codex passent le parseur TOML. Voir [la provenance et les licences](../../docs/design/EXTERNAL_RESOURCES.md) et [le contrat de production](../../docs/standards/COURSE_AUTHORING.md).

## Vérifications

Preuve générée : [résultat complet](../../continuity/validation/2026-11-14T07-57-03-993Z-71232365-087a-4f2a-9205-068a06fd10a4/result.json).

| Contrôle | Résultat |
| --- | --- |
| test:guards | 31 tests réussis |
| typecheck | Réussi |
| lint | Réussi |
| format:check | Réussi |
| validate:governance | Réussi, également après clôture de TASK-015 |
| validate:curriculum | Réussi : 3 catalogues, 3 leçons, 26 concepts |
| test:unit | 27 tests réussis |
| build | Build de production réussi |
| test:e2e | 14 tests réussis, ordinateur et mobile |

Les contrôles tournent sous Node LTS 22.23.5. Les tests navigateur utilisent l'aperçu isolé au port 3100 ; le build de production est exécuté séparément par la suite. Le rapport final ne contient aucune erreur ni changement de source pendant les vérifications. Une passe précédente, invalidée par les derniers ajustements, est conservée comme échec historique et ne sert pas de preuve.

Après une actualisation temporaire du registre V4 par une session parallèle, son empreinte est revenue à celle de la passe réussie. Le contrôle strict `verifyEvidence` a confirmé la correspondance des sources, des critères et des neuf journaux avant clôture. Le formatage des statuts administratifs a ensuite été corrigé et `format:check` relancé avec succès sur tout le dépôt. Les rapports failed/running restent conservés et ne sont jamais transformés en succès ; le relais référence explicitement la preuve complète toujours valide.

Captures supplémentaires : [ordinateur](home-desktop-final.png), [mobile](home-mobile-final.png), [cours mémoire](memory-desktop-final.png), [cours TCP](tcp-desktop-final.png). Six vues contrôlées à 1280 × 800 et 375 × 812 : réponses HTTP 200, aucun débordement et aucune erreur de console ou d'exécution. Les captures ont été inspectées. Voir [les mesures](visual-checks.json).

## Garde-fous

Correction du blocage de gouvernance qui invalidait toutes les clôtures passées à chaque nouvelle fonctionnalité. Une clôture historique exige désormais une tâche Done, ses critères, son rapport et ses neuf journaux déjà enregistrés et inchangés dans Git. Elle ne certifie pas le nouveau code. Une nouvelle clôture, un checkpoint et une publication exigent toujours une preuve correspondant aux sources courantes. Quatre tests supplémentaires couvrent cette distinction et les tentatives de substitution.

## Aperçu et limites

Aperçu local : http://127.0.0.1:3100. Les commandes de reprise sont dans [le brief du studio](../../docs/design/LEARNING_STUDIO.md).

Les cours restent en revue scientifique. Aucune approbation humaine ni publication n'a été inventée. La conservation des réponses concerne la session courante, sans compte ni synchronisation entre appareils. Aucun déploiement distant et aucune installation globale n'ont été effectués par cette tâche. Les changements restent dans l'arbre de travail pour revue, sans commit global des travaux des autres sessions.
