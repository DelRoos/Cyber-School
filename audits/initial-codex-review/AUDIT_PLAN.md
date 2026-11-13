# Plan et journal de l'audit indépendant

Date de référence : 13 novembre 2026 (Africa/Douala). Auditeur : Codex.

## Périmètre et règles

Audit en lecture seule du code, des dépendances, des instructions et du planning. Seuls les documents et preuves de cet audit sont écrits dans `audits/initial-codex-review/`. Aucune correction, installation globale, modification du lockfile, publication ou opération Git de mutation. La consigne spécifique de la mission interdit aussi de mettre à jour `continuity/` ; les checkpoints sont consignés ici.

## Séquence

1. Lire les règles, la mission, le protocole de reprise et l'état Git ; inventorier tous les fichiers et les outils installés.
2. Reconstituer vision, exigences, ADR, jalons et frontières des packages.
3. Examiner tous les sources, schémas, données, tests, configurations et adaptateurs agents/skills ; vérifier les formats avec les outils locaux et les documentations officielles.
4. Exécuter les commandes de validation disponibles, avec journal des sorties et codes retour. Si les dépendances ne sont pas installées et qu'aucun lockfile n'existe, utiliser uniquement une tentative d'installation gelée, sans scripts ; ne pas produire un nouveau lockfile.
5. Vérifier indépendamment les invariants du curriculum et du scénario TCP ; tenter l'observation navigateur si l'application peut démarrer sans correction ni changement de dépendances.
6. Évaluer les scénarios de reprise A–F, la sécurité non destructive, l'accessibilité et les limites de passage à l'échelle.
7. Produire les huit livrables, un registre de preuves et un plan de remédiation atomique. Contrôler que les fichiers initiaux n'ont pas été modifiés.

## Checkpoint initial

- Branche `main`, aucun commit, tous les fichiers du projet non suivis ; `git diff` ne représente donc pas le contenu à auditer.
- Aucun `pnpm-lock.yaml` ni `node_modules` observé à la racine.
- `CURRENT_STATE.md` annonce encore les packages et le démonstrateur comme restant à implémenter, alors que leurs fichiers existent.
- Node local : `v23.9.0` ; Corepack fournit pnpm `10.28.0`.
- Aucune affirmation antérieure de validation n'est considérée comme une preuve.

## Checkpoint final — audit terminé, corrections non commencées

- Huit livrables demandés rédigés, plus index des preuves, inventaires et journaux ; 32 constats (13 élevés, 17 moyens, deux faibles), aucun critique établi.
- Installation gelée et sept commandes standard de validation tentées : outils non disponibles ou lockfile absent ; aucune suite Vitest/Playwright ni build déclaré réussi.
- Validateur original exécuté directement via strip-types : 12 sondes, sept contre-exemples acceptés. Ce résultat ne remplace pas le parsing Zod ni les tests unitaires.
- Chargeur natif Gemini 0.64.0 vérifié : six agents, huit skills, aucune erreur d'agent ; aucun sous-agent ni session de modèle lancé.
- Lecture publique npm explicitement autorisée par l'utilisateur après refus automatique initial ; 29 couples nom/version confirmés, après reprise ciblée des trois expirations initiales. Aucune installation ni modification des versions.
- Comparaison SHA-256 : les 120 fichiers initiaux sont intacts ; aucun ajout hors `audits/initial-codex-review/`. Détails dans `WORKSPACE_INTEGRITY.json`.
- Aucun fichier `continuity/`, instruction d'agent, manifeste, dépendance, source ou test applicatif modifié. Pas de commit, merge ou déploiement.
- Reprise suivante : lire `EXECUTIVE_SUMMARY.md`, `FINDINGS.md` et `REMEDIATION_PLAN.md` ; faire valider le rapport, puis autoriser les corrections et la création du lockfile avant toute implémentation.
