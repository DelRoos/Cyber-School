# Mise en œuvre des garde-fous

13 novembre 2026. Autorisation : demande explicite de l'utilisateur d'ajouter des garde-fous après la vérification des corrections. Le périmètre passe de l'audit seul à l'implémentation des contrôles nécessaires. Aucun changement de version de dépendance, aucune installation, aucun commit, aucun déploiement et aucun réglage système global.

## Contrôles livrés

- Diagnostic sans dépendances : Node LTS autorisé, gestionnaire épinglé, lockfile, outils locaux, lien workspace et base Git. Présence d'un store partiel ou d'un outil global insuffisante.
- Runner unique local/CI : commandes fixes, vrais codes retour, journaux, horodatages, environnement et empreinte des sources. Échec ou interruption ne produit jamais une preuve réussie. Le résultat actuel est failed, avec zéro commande de la chaîne exécutée après le refus du prérequis.
- Gouvernance : Ready/Done dépendent de prérequis terminés ; IDs uniques, références et cycles contrôlés ; Done exige critères vérifiés et preuve générée liée à cette tâche, aux critères et au contenu courant.
- Publication : révision explicite, revue scientifique, approbateur humain et rapport QA réussi requis. Schéma et contrôle du fichier de preuve se complètent. La leçon TCP est in-review/pending et l'accueil ne la qualifie plus d'opérationnelle.
- Continuité : STATE.json, CURRENT_STATE.md et HANDOFF.md générés depuis le dépôt. Changements de code sans checkpoint et modifications manuelles du relais détectés.
- CI et commandes build/dev reliées aux contrôles ; artefacts QA conservés. Une protection de branche distante devra être configurée lorsque le dépôt distant existera.
- Corrections des trois tests identifiés : résolution depuis la racine réelle, distracteur Playwright issu du manifeste validé, nouvelle remise en ordre nécessaire après reset. Captures séparées par test/projet et respect du viewport de chaque projet.

Les règles communes se trouvent dans `docs/standards/QUALITY_GATES.md` et `docs/agents/AGENT_GUIDE.md`, référencés par les points d'entrée des trois agents. L'ADR-0005 décrit les frontières et les limites. TASK-008 conserve les critères non réceptionnés ouverts.

## Vérifications réellement exécutées

| Contrôle | Résultat |
| --- | --- |
| `corepack pnpm test:guards` | **26 tests réussis**, aucun échec, aucun test ignoré |
| `corepack pnpm validate:governance` | **Succès**, 61 Markdown, neuf fichiers miroirs, quatre tâches |
| Typage ciblé du tooling | **Succès**, TypeScript 6.0.3 déjà présent dans le store, options strict et noUncheckedIndexedAccess ; ce contrôle ciblé ne remplace pas `pnpm typecheck` du monorepo |
| Six sondes du schéma de publication | **Six attentes satisfaites**, dont refus de published sans revue, révision manquante, revue pending et fichier de test fourni comme preuve |
| Formatage des fichiers édités | Prettier 3.10.1 du store utilisé sur la liste explicite de fichiers de cette tâche ; les audits historiques sont conservés |
| `corepack pnpm typecheck`, `lint`, `test:unit` | Commandes exécutées, échec avant les suites : turbo non relié |
| `corepack pnpm build` | Refus explicite par le diagnostic, avant construction |
| `corepack pnpm test:e2e` | Commande exécutée, module Playwright local absent ; aucun rendu navigateur/capture validé |
| `validate:curriculum`, `format:check` | Échec de préparation : outils locaux manquants |
| `quality:environment`, `quality:verify --task TASK-008` | Échec attendu, détaillé et enregistré ; aucun succès global revendiqué |

Les sorties sont dans CHECK_RESULTS.json et les journaux adjacents. Les sondes de publication utilisent le schéma source réel et Zod 4.6.7 déjà présent, avec résolution en mémoire, sans créer de liens de dépendances. Les exemples de revue synthétiques n'existent que dans les tests et ne sont pas des approbations du produit.

## Reprise exacte

Lire `continuity/STATE.json` puis le rapport référencé par `validation.reference`. Régulariser Node LTS, lockfile, installation et base Git avec les autorisations requises, puis relancer `corepack pnpm quality:verify --task TASK-008`. Faire relire les critères et les résultats avant toute clôture ou publication.

Les empreintes et journaux détectent les erreurs et les preuves périmées ; ils ne certifient pas l'identité d'un humain et n'empêchent pas un éditeur autorisé à modifier tout le dépôt de réécrire les contrôles. La revue et la protection des branches constituent la barrière complémentaire contre ce contournement. Les protections distantes n'ont pas été configurées par cette tâche.
