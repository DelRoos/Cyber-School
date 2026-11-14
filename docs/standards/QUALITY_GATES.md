# Garde-fous de validation et de reprise

Ces contrôles s'appliquent à Codex, Claude Code et Gemini CLI. Ils empêchent les erreurs de validation observées dans les audits. Les scripts restent locaux, versionnés et sans nouvelle dépendance ; ils ne constituent pas un orchestrateur.

## Avant de développer

Exécuter `corepack pnpm quality:environment`. Le diagnostic refuse une version Node hors des branches autorisées, un package manager non épinglé, un lockfile absent, une base Git inexistante et des outils locaux non reliés. La présence d'un dossier `.pnpm` ou d'un outil global ne prouve pas une installation terminée.

Le diagnostic avant installation est `node --experimental-strip-types scripts/quality/preflight.ts --before-install`. L'installation normale reste gelée. Si le lockfile manque, sa création exige l'accord humain prévu par la mission ; ne pas supprimer le gel pour faire passer la CI. Le contrôle ne change pas le Node du poste, n'installe rien et ne crée pas de commit.

## Produire une preuve

```sh
corepack pnpm quality:verify --task TASK-008
```

Le runner exécute des commandes fixes, conserve leurs sorties et codes retour et écrit `continuity/validation/<run-id>/result.json`. `check:all` appelle le même runner ; sans argument, il utilise la tâche active du checkpoint.

Les contrôles obligatoires sont : test:guards, typecheck, lint, format:check, validate:governance, validate:curriculum, test:unit, build et test:e2e. Une erreur de préparation, une commande en échec ou une modification du code pendant l'exécution produit un résultat failed. Une interruption peut laisser running, jamais passed. Une commande non exécutée n'est jamais comptée comme un succès.

Les journaux comportent des empreintes et des heures d'exécution. Ne jamais y afficher de secrets. Les rapports d'audit historiques et les résultats générés ne sont pas reformattés par Prettier.

## Clôturer une tâche

Pour une tâche Done, renseigner le champ de frontmatter `verificationRef` avec le chemin du JSON généré. La gouvernance vérifie :

- dépendances terminées, identifiant unique et absence de cycle ;
- critères explicites cochés, sans critère restant ;
- rapport réussi concernant cette tâche et l'empreinte de ses critères ;
- neuf commandes obligatoires réussies, journaux présents et intacts ;
- pour une nouvelle clôture, empreinte actuelle identique à celle testée et base Git cohérente ;
- pour une clôture historique déjà enregistrée dans Git, tâche Done, critères, rapport réussi et ses neuf journaux inchangés par rapport à HEAD. Ce contrôle conserve l'historique, sans certifier les sources nouvelles.

Une tâche passée ne redevient pas inachevée à chaque nouvelle fonctionnalité. Le contrôle historique exige que sa clôture et toutes ses preuves soient déjà commitées ; il refuse une nouvelle clôture avec une preuve périmée, des critères modifiés ou des journaux remplacés. La validation du code actuel, le checkpoint et la publication restent strictement liés à l'empreinte actuelle : ils n'utilisent jamais cette exception historique.

Une section Vérifications, un fichier `.spec.ts`, une affirmation d'agent ou un rapport failed ne remplace aucun de ces contrôles. Ne jamais fabriquer ou éditer le JSON pour contourner un échec. Le runner ne marque pas les tâches Done automatiquement ; une revue des critères reste nécessaire.

## Publier une leçon

La révision `contentRevision` doit être explicite. Le statut published exige `review.status: approved`, un `scientificReviewer`, un `approvedBy` humain réel, une date de revue et `qaEvidenceRef` vers un rapport QA généré et réussi pour les sources courantes. Le schéma Zod vérifie les champs ; la gouvernance vérifie le fichier et ses résultats. Aucun nom d'approbateur ou accord humain ne doit être inventé.

La leçon TCP reste in-review tant que sa réception n'est pas démontrée. Les pages locales peuvent servir à la prévisualisation d'auteur ; leur accessibilité en développement ne constitue pas une publication validée ni un déploiement.

Le passage de in-review à published et les métadonnées de revue ne modifient pas l'empreinte scientifique, ce qui permet de référencer une QA effectuée avant promotion. Toute modification de la révision, des étapes, des exercices, des sources ou du code invalide la preuve. Les critères de tâches sont empreintés séparément pour permettre de cocher les critères après test sans accepter une exigence modifiée.

## Produire le relais

```sh
corepack pnpm quality:checkpoint --task TASK-008 --next "Action exacte à reprendre"
```

Le générateur écrit STATE.json, CURRENT_STATE.md et HANDOFF.md à partir de la tâche, de Git, du diagnostic et de l'empreinte actuelle. La validation détecte un changement de source non suivi d'un checkpoint ainsi qu'une modification manuelle des deux documents générés. Ne pas les éditer à la main. Les blocages et décisions explicatifs restent dans BLOCKERS.md, les tâches et les ADR.

Le runner rafraîchit le checkpoint avant et après la validation et y lie le résultat réel. Un seul consolidateur met à jour l'état commun ; utiliser des lots distincts et des branches/worktrees pour les contributions simultanées.

## Périmètre de confiance

L'empreinte couvre code, données pédagogiques, tests, scripts, dépendances déclarées, configurations et instructions. Elle exclut dépendances installées, caches, artefacts, audits, planning et continuité ; ces deux derniers sont contrôlés séparément. Les liens symboliques dans les sources ou les preuves ne peuvent pas faire lire des fichiers hors du périmètre autorisé.

Des tests négatifs natifs, `corepack pnpm test:guards`, prouvent que les contrôles refusent les situations précédentes. Ces tests isolés sont exécutables même avant une installation complète, mais ne remplacent pas les tests du produit.

Un éditeur disposant de l'écriture sur tout le dépôt pourrait modifier à la fois les contrôles et les preuves. Pour une protection contre ce contournement, la CI doit être un statut requis sur une branche protégée avec revue humaine et droits adaptés. Le workflow est fourni ; aucun dépôt distant ni protection serveur n'est configuré par cette tâche. Les contrôles locaux réduisent les erreurs et les déclarations infondées, sans garantir le comportement de tout agent ou une identité humaine par la seule présence d'un nom dans un JSON.
