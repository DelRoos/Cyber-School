# Synthèse exécutive — audit indépendant initial

**Date : 13 novembre 2026, Africa/Douala. Décision proposée : stabiliser et valider le socle avant d'ouvrir ITER-002. Aucune correction appliquée.**

Le dépôt constitue un **prototype substantiel, documenté, mais non validé comme infrastructure opérationnelle**. Il contient une application Next.js, quatre packages avec du code réel, des données pédagogiques, dix cas unitaires déclarés et un scénario Playwright décliné en deux viewports. Les technologies choisies correspondent globalement à l'ambition. L'installation reproductible, la continuité et plusieurs contrats d'intégrité restent défaillants.

Le périmètre initial comprend **120 fichiers, 200 520 octets**, tous non suivis dans un dépôt sans commit. Aucun lockfile ni dépendance locale installée. Les empreintes initiales et le contrôle final de conservation figurent dans les preuves. L'absence d'historique empêche d'attribuer indépendamment les travaux à Gemini ; le relais initial nomme Antigravity.

Le registre comprend **32 constats : 13 de gravité élevée, 17 moyenne et deux faible**, avec nature confirmée ou risque explicitement indiquée. Le contrôle final confirme **zéro fichier initial modifié/supprimé et zéro ajout hors du dossier d'audit**.

## Réponses aux dix questions de la mission

| Question | Réponse étayée |
| --- | --- |
| 1. Infrastructure réellement fonctionnelle ? | **Pas démontré.** Code réel, mais installation gelée impossible et huit commandes de validation/préparation en échec avant exécution des suites. |
| 2. Technologies cohérentes ? | **Oui dans leur principe.** Next/React/TS, Tailwind, Zod, GSAP/Motion et pnpm/Turbo ont des responsabilités plausibles. L'environnement Node annoncé ne respecte pas les moteurs de certains outils. |
| 3. Les trois agents peuvent travailler ensemble ? | **Partiellement.** Entrées et guide communs existent. Gemini charge réellement six agents/huit skills ; Codex expose les six rôles dans cette session, mais le CLI local ancien n'est pas validé ; les adaptateurs de skills Claude manquent. Aucune reprise complète entre les trois outils n'est prouvée. |
| 4. Skills et sous-agents exploitables ? | **Oui comme procédures et adaptateurs partiels.** Les huit skills ont les métadonnées et des étapes utilisables. Une instruction d'import est fausse et plusieurs contrôles restent exclusivement déclaratifs. |
| 5. Reprise après interruption ? | **Partielle et fragile.** Protocole utile, mais checkpoint obsolète, aucun commit, aucune preuve de tests persistée initialement, aucune coordination de travail simultané. |
| 6. Milliers de cours interactifs ? | **Base d'organisation pertinente, capacité non acquise.** Chargeur lié au seul TCP, curriculum unique, contenu/frames dupliqués, invariants incomplets et cache ignorant des données externes aux packages. |
| 7. Démonstrateur satisfaisant ? | **Storyboard nominal prometteur, non réceptionnable en l'état.** États et bonnes réponses numériques cohérents à la lecture ; défauts de feedback/score, clavier, pause et historique de perte. Aspect visuel, mobile, performances et console non observés. |
| 8. Défauts critiques ? | **Aucun défaut de gravité critique établi.** Plusieurs blocages élevés : reproductibilité, absence de base Git, intégrité des exercices, chemins Tailwind, adaptation Claude et continuité. Aucune compromission ou fuite de secret détectée par les contrôles limités. |
| 9. Corrections indispensables ? | Environnement compatible, lockfile autorisé, base Git, chaîne de validation cohérente, intégrité et cache, adaptation des agents et relais factuel, puis réception complète de la leçon. |
| 10. Prochaine itération ? | **ITER-001-R — Stabilisation et preuve de fonctionnement**, détaillée dans [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md). Reporter l'explorateur XYFlow et la 3D jusqu'à la sortie de cette itération. |

## Ce qui a effectivement été vérifié

- Installation gelée, typecheck, lint, tests unitaires, build, E2E, validation du curriculum et format : **commandes exécutées, échec de préparation ; aucune suite déclarée réussie**. `audit` échoue aussi faute de lockfile ; dev/start faute d'outils locaux.
- Validateur existant exécuté directement via Node, sans Zod/Vitest : **12 sondes**, cinq attentes satisfaites, dont acceptation du corpus actuel et rejet de quatre familles d'anomalies ; **sept anomalies relationnelles acceptées à tort**.
- 19 fichiers JSON, six TOML et les YAML/frontmatters inspectés ; trois sources Tailwind inexistantes et un lien Markdown cassé identifiés.
- Chargeurs natifs Gemini 0.64.0 : **six agents et huit skills chargés, zéro erreur d'agent**, sans session de modèle.
- Registre npm, après accord explicite de l'utilisateur : **29 couples nom/version publiés confirmés sur 29 interrogés**, après reprise de trois lectures initialement expirées. Pas de résolution des plages ni d'analyse des transitives.

## Ordre de décision recommandé

1. Valider le rapport et autoriser séparément les modifications nécessaires, notamment la création du lockfile.
2. Rendre le checkout installable et les commandes de validation réellement exécutables ; conserver les preuves dans la CI.
3. Réparer les contrats de contenu, le cache, le démarrage et les styles ; établir une reprise inter-outils testée.
4. Réceptionner le démonstrateur avec revue scientifique et navigateur, puis éprouver le contrat avec une seconde leçon légère.

Le registre [FINDINGS.md](FINDINGS.md) donne pour chacun des 32 constats emplacement, gravité, preuve, impact, cause probable, recommandation, effort, dépendances et critère de vérification. Les rapports thématiques distinguent défauts avérés, risques et mesures impossibles. Les sources officielles et limites figurent dans [EVIDENCE_INDEX.md](EVIDENCE_INDEX.md).
