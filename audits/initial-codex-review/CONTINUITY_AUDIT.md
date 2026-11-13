# Audit de continuité et reprise entre modèles

## État observé

Le protocole en huit étapes constitue une bonne base : lire les règles, l'état et Git, identifier la tâche, confronter documentation/code, relancer les vérifications, puis mettre à jour les preuves. Il est présent dans les entrées des trois outils et dans le skill de handoff. Roadmap, backlog, trois fiches de tâches et quatre ADR existent.

Le mécanisme ne remplit pourtant pas encore sa garantie centrale. `CURRENT_STATE.md` décrit un checkpoint de configuration et demande de créer des packages/pages déjà présents. `HANDOFF.md` conserve un relais d'initialisation et ne contient pas les résultats d'exécution ni une prochaine commande précise. `BLOCKERS.md` ne décrit que l'absence de pnpm global, correctement contournée par Corepack, mais pas l'absence de lockfile et de dépendances. Aucun checkpoint supplémentaire ni résultat de tests initial n'a été trouvé. Le dépôt ne possède aucun commit : la « mémoire versionnée » est, à ce stade, uniquement locale et non enregistrée.

Le statut global est toujours In Progress ; il serait donc inexact d'accuser Gemini d'avoir clôturé une tâche en échec. En revanche, la leçon est marquée published et la page d'accueil dit « Démonstrateur opérationnel », sans preuve d'exécution fournie. L'attribution de l'initialisation à Gemini dans la mission et à Antigravity dans le relais ne peut être résolue faute d'historique.

## Résultat par scénario imposé

| Scénario | État | Preuve et limite | Contrôle concret proposé |
| --- | --- | --- | --- |
| A. Gemini interrompu au milieu d'une tâche | **Insuffisant** | Les fichiers existent, mais le dernier checkpoint ne dit ni quelle phase est réellement faite, ni quelle commande était en cours ; aucune base Git. | Checkpoint lié à tâche/base, étapes réalisées et critère restant, résultat machine écrit après chaque validation significative ; reprise simulée depuis une interruption. |
| B. Codex reprend sans conversation Gemini | **Partiel** | Les entrées et la vision suffisent à reconstituer le projet, comme cet audit l'a fait. Elles ne suffisent pas à reprendre exactement le point d'arrêt ; il faut réauditer le code et les outils. | Résumé de reprise contrôlé contre inventaire/diff et résultats identifiés ; test de reprise dans une session propre avec prochaine action vérifiable. |
| C. Claude constate un conflit entre documentation et code | **Partiel** | Le protocole impose la comparaison ; aucune règle de résolution ni trace de divergence requise. Les imports Claude ne sont pas automatiques dans leur forme actuelle. | Enregistrer la divergence et sa preuve, garder la tâche ouverte, distinguer décision produit et fait technique, obtenir arbitrage pour une modification structurante. |
| D. Deux agents sur des fonctionnalités différentes | **Insuffisant** | Pas de branches/worktrees prescrits, propriétaire de tâche, fichiers réservés ou responsable unique de CURRENT_STATE/HANDOFF. | Attribuer les lots et branches, consolider par un responsable, interdire les transitions de tâches incompatibles, revalider après intégration. |
| E. Décision architecturale remise en cause | **Partiel** | Quatre ADR et un modèle avec Superseded existent, validation humaine demandée pour architecture globale. Pas de lien stable vers l'approbation ni analyse d'impact imposée sur tâches/schémas. | Nouvel ADR Proposed référant l'ancien, variantes et impacts ; approbation traçable, puis lien Superseded et critères de migration vérifiés. |
| F. Un agent dit Done alors que les tests échouent | **Partiel** | Interdiction textuelle et étapes CI réelles présentes ; aucun validateur ne relie Done à une révision testée, et la CI est bloquée dès l'installation. | Porte CI requise, preuve liée à la révision et statut de tâche contrôlé ; test négatif de clôture sans résultats. La protection de branche distante est non vérifiable. |

« Suffisant » exigerait une preuve de reprise/réception dans le scénario, au-delà des fichiers et intentions. Aucun des six scénarios n'atteint actuellement ce niveau.

## Contrôles automatisables recommandés

1. **Contrôle de structure et liens** : champs obligatoires des fiches/checkpoints, unicité des IDs, liens locaux existants. Le lien `continuity/RESUME_PROTOCOL.md:10` doit viser le BLOCKERS du même répertoire.
2. **Contrôle du graphe de tâches** : dépendances existantes et sans cycle ; Ready incompatible avec un prérequis non terminé ; Done avec critères satisfaits et preuve associée. TASK-003 Ready / TASK-002 In Progress fournit un premier cas négatif réel.
3. **Preuve de validation structurée** : commande, code retour, date, outil/version, tâche, base Git et empreinte de l'arbre de travail. L'empreinte est nécessaire avant commit ou si l'arbre est modifié : un SHA de base seul ne prouve pas le code effectivement testé.
4. **Contrôle de changement** : si un lot modifie schéma, UI ou manifeste, exiger les vérifications adaptées ; si tâche active/architecture change, exiger une mise à jour correspondante du relais et/ou de l'ADR. Éviter un contrôle purement cosmétique fondé seulement sur la date de modification.
5. **Test de reprise** : session propre recevant uniquement le dépôt, devant retrouver tâche, preuves, limites et prochaine commande ; évaluer le résultat concret de cette commande. Aucune mémoire privée ou réexécution d'une ancienne conversation n'est nécessaire.

Ces contrôles peuvent rester de petits scripts et des portes CI du dépôt. Aucun orchestrateur supplémentaire ni service de suivi externe n'est nécessaire pour les premiers besoins. Les mises à jour doivent être consolidées par un responsable pour éviter que le contrôle lui-même ne crée des conflits.

## Planning et organisation

Les trois tâches disposent d'un frontmatter utile à une future synchronisation GitHub : IDs, priorité, complexité, dépendances, labels et itération. Les critères sont essentiellement vérifiables. TASK-001 mélange cependant monorepo, gouvernance, skills, ADR et quatre packages en une seule tâche L ; elle offre trop peu de checkpoints indépendants. TASK-004 à TASK-007 ne possèdent qu'une ligne de backlog et ne doivent pas être traitées comme des tâches déjà préparées.

Le README explique Corepack, routes et scripts. Le parcours installation/dev omet la construction des bibliothèques compilées et l'installation du navigateur Playwright. Ni procédure de publication/rollback, ni règle Git de réception, ni convention explicite de branche/commit n'est fournie. L'absence de cible d'hébergement empêche d'en déduire une procédure technique précise. Un nouvel agent doit d'abord stabiliser la chaîne, pas démarrer le graphe XYFlow parce que TASK-003 est Ready.

Les recommandations de continuité sont détaillées dans AUD-003, AUD-011 à AUD-015, AUD-018 et AUD-027. Leur exécution est proposée après validation du rapport. Durant cet audit, seules les preuves et les notes de reprise de `audits/initial-codex-review/` sont mises à jour, conformément à la mission spécifique.
