# ADR-0005 : Preuves exécutables de validation et relais vérifiable

- Status : Accepted pour mise en œuvre des garde-fous demandés ; réception globale encore ouverte dans TASK-008.
- Date : 2026-11-13.
- Autorisation : demande explicite de l'utilisateur d'ajouter des garde-fous après la vérification des corrections. Aucune approbation de publication de leçon n'est déduite de cette demande.

## Contexte

L'audit et la contre-vérification ont montré qu'une tâche pouvait passer Done avec une simple section Vérifications, qu'une leçon published pouvait omettre sa revue, et que le relais restait obsolète malgré des modifications importantes. La présence de tests et d'un dossier de dépendances ne garantissait pas leur exécution.

## Décision

Ajouter des scripts TypeScript utilisant uniquement Node pour diagnostiquer l'environnement, exécuter la chaîne de commandes existante, enregistrer leurs résultats et vérifier les preuves. Lier les preuves aux sources, aux critères de tâche et aux journaux. Contrôler publications et transitions par le même validateur de gouvernance en local et en CI. Générer un checkpoint vérifiable plutôt que conserver des états édités sans contrôle.

Le runtime Zod reste indépendant du système de fichiers : il valide les champs de revue ; le contrôle de gouvernance vérifie les preuves sur disque. Aucun package ou orchestrateur n'est ajouté et les versions des dépendances ne sont pas modifiées.

## Alternatives

1. Ajouter seulement des instructions : insuffisant, les affirmations non exécutées resteraient acceptées.
2. Développer un orchestrateur ou un service de preuves : complexité inutile avant stabilisation du socle.
3. Déclarer les tâches terminées au succès des seuls tests des garde-fous : rejeté, ils ne valident pas le produit.

## Conséquences

Les tâches existantes restent ouvertes et le démonstrateur repasse in-review. Le poste actuel, sans Node LTS autorisé, lockfile, liens de dépendances ni commit, échoue explicitement au diagnostic. L'activation des protections de branche reste une opération distincte lorsqu'un dépôt distant existera.

Les changements administratifs de tâche/continuité et la promotion/revue d'une leçon sont séparés de l'empreinte du contenu testé pour éviter une dépendance circulaire. L'approbation humaine reste une responsabilité de revue, pas une identité certifiée par ces scripts.

## Vérification

Tests négatifs natifs des gardes, tests Zod de publication, commande réelle de gouvernance, tentative de chaîne complète avec preuve d'échec honnête et reprise par STATE.json. Les suites produit devront être exécutées après réparation autorisée de l'environnement.
