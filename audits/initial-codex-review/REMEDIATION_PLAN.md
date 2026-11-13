# Plan de remédiation proposé

**Statut : proposé, aucune tâche exécutée.** Ce document ne change ni la roadmap ni les fiches de tâches existantes. Les corrections doivent commencer après validation du rapport. La création du lockfile, toute nouvelle dépendance et tout changement d'environnement nécessitant une autorisation restent soumis aux règles de la mission.

## Prochaine itération recommandée : ITER-001-R

Objectif : produire une base installable, vérifiable, reprenable entre outils et démontrée par une leçon TCP réceptionnée. Suspendre le démarrage de TASK-003 tant que les critères de sortie du socle ne sont pas atteints. P0 = nécessaire à la confiance dans le socle ; P1 = réception du démonstrateur et du processus ; P2 = extension ou simplification après stabilisation. XS ≈ 0,25–1 h ; S ≈ 1–4 h ; M ≈ 0,5–1,5 j. Estimations indicatives, à réévaluer après le premier vrai build ; aucun planning calendaire n'est imposé.

Les rôles ci-dessous désignent des responsabilités. Ils n'impliquent pas de lancer des sous-agents ; chaque tâche peut être assurée par le principal. Un seul responsable consolide le relais, et des travaux simultanés doivent avoir des lots de fichiers/branches distincts.

## A. Rendre les vérifications possibles

| ID | Priorité / taille | Responsable | Livrable et constats | Dépendances | Acceptation vérifiable |
| --- | --- | --- | --- | --- | --- |
| R01 | P0 / XS | Architecte | Choix Node compatible, bornes moteur et instructions alignées (AUD-002) | Validation du rapport | Version choisie satisfait moteurs de toutes les dépendances résolues et existe en local/CI |
| R02 | P0 / S | Architecte / QA | Résolution examinée et lockfile reproductible (AUD-001) | R01 ; autorisation de créer le lockfile | Installation gelée sur checkout neuf, aucune modification du lockfile ; audit des transitives exécuté ou indisponibilité explicitée |
| R03 | P0 / XS | Continuité | Base Git de référence sans secrets (AUD-003) | Revue humaine du périmètre | Commit identifié, inventaire suivi, clone/checkout indépendant ; statut incomplet ou validé décrit fidèlement |
| R04 | P0 / XS | Architecte | Consommateur explicite du runtime dans le script de validation (AUD-004) | R02 | Script résolu sous pnpm isolé et validation du corpus actuel exécutée |
| R05 | P0 / S | Frontend | Préparation/watch des bibliothèques compilées en dev (AUD-005) | R02 | Install puis dev depuis zéro artefact ; modification d'une primitive reflétée sans build manuel |
| R06 | P0 / S | Architecte | Entrées Turbo des contenus et règles communes (AUD-006) | R02 | Cache chaud : modification JSON/règle commune invalide les tâches requises ; changement sans impact ne les invalide pas inutilement |
| R07 | P0 / XS | Frontend | Chemins de sources Tailwind corrects (AUD-007) | R02 | Trois chemins existants ; CSS et états visuels/focus des packages présents dans le rendu |

R03 peut enregistrer une base honnêtement incomplète avant les corrections ; il ne doit pas prétendre à une validation absente. Chaque correction suivante devient ainsi diffable et réversible. R02 ne doit ni contourner la CI gelée ni remplacer arbitrairement les versions pour obtenir un résultat vert.

## B. Fermer les contrats et rendre le travail inter-outils fiable

| ID | Priorité / taille | Responsable | Livrable et constats | Dépendances | Acceptation vérifiable |
| --- | --- | --- | --- | --- | --- |
| R08 | P0 / M | Architecte / pédagogue | Invariants des choix, ordres et concepts d'exercices (AUD-008) | R02 | Bon choix appartenant aux options ; IDs uniques ; ordre permutation exacte ; concept existant ; contre-exemples rejetés par schéma/validateur |
| R09 | P0 / S | Architecte | Références des évaluations et unicité des identités de contenu (AUD-008) | R08 | Évaluations orphelines, slugs/chapitres/exercices dupliqués rejetés selon périmètre d'unicité documenté |
| R10 | P0 / S | Architecte / frontend | Validation obligatoire avant génération du corpus (AUD-009) | R04, R08, R09 | Build applicatif direct avec cycle/référence manquante échoue ; corpus valide construit |
| R11 | P0 / S | Continuité / QA | Matrice versions et diagnostic de découverte pour trois outils (AUD-012) | R03 | Preuves instructions/skills/agents par outil, distinction CLI local/session/hébergement et versions minimales documentées |
| R12 | P0 / S | Continuité | Adaptation Claude des huit skills canoniques (AUD-010) | R11 | Découverte et préchargement réels ; contrôle automatique de non-divergence, y compris sur Windows |
| R13 | P1 / XS | Continuité | Imports Claude conformes à l'intention (AUD-011) | R11 | Contexte chargé inspecté, guide/protocole disponibles sans ambiguïté |
| R14 | P0 / S | Sécurité | Restrictions effectives des auditeurs par outil (AUD-013) | R11 | Capacités inspectées ; essai d'écriture refusé en environnement jetable ; aucun réglage de sandbox fictif |
| R15 | P1 / XS | Frontend / continuité | Skill animation aligné sur exports existants (AUD-016) | R05 | Exemple minimal compilé ; aucun helper inexistant prescrit |
| R16 | P0 / S | QA | Politique de lint React des bibliothèques (AUD-017) | R02 ; accord si nouveau plugin | Lint exécuté, règle hooks reconnue ; régression de dépendance de hook détectée |
| R17 | P0 / S | QA | Porte locale/CI commune, scripts et tests typés (AUD-018) | R04, R10, R16 | Commande unique inclut curriculum ; tous les types de fichiers annoncés couverts et erreurs de contrôle détectées |
| R18 | P0 / XS | Continuité | Checkpoint et relais réconciliés (AUD-014) | R03 | Tâche active, base, réalisés/restants, commandes et résultats réels ; liens locaux valides ; aucune tâche faussement terminée |
| R19 | P1 / M | Planificateur / QA | Contrôle statuts/preuves et convention de travail simultané (AUD-015) | R18 | Ready avec dépendance ouverte rejeté ; Done sans preuve rejeté ; deux lots distincts consolidés sans perte de relais |
| R32 | P1 / S | Sécurité / architecte | Politique de validation des ressources explicite (AUD-032) | R02 | Tests champ inconnu et URL non HTTPS alignés sur rejet/suppression ; frontière de confiance décrite sans garantie excessive |

Les sondes fournies dans l'audit sont des contre-exemples à intégrer ensuite aux vrais tests Zod/Vitest, pas un nouveau framework de test. Les diagnostics doivent identifier le fichier et la référence défectueuse, pour rester utiles à grande échelle.

## C. Réceptionner la leçon de référence

| ID | Priorité / taille | Responsable | Livrable et constats | Dépendances | Acceptation vérifiable |
| --- | --- | --- | --- | --- | --- |
| R20 | P1 / S | Frontend / exercices | État de tentative et score agrégé cohérents (AUD-020) | R08 | Réussite puis reset, autre option ou réordonnancement donnent l'état et le compteur attendus |
| R21 | P1 / S | Frontend / QA | Radios natives ou pattern clavier complet (AUD-021) | R07 | Tab, flèches, Espace et Entrée éprouvés sur les groupes de choix, focus conservé |
| R22 | P1 / S | Animation / QA | Préférence de mouvement dès montage et CSS (AUD-022) | R07 | Navigation initiale en reduced-motion sans transition non demandée ; comportement dynamique cohérent |
| R23 | P1 / S | Animation | Contrat de pause visuelle (AUD-023) | R15 | Pause/reprise en cours de tween testée selon contrat explicite, état final déterministe |
| R24 | P1 / S | Animation / pédagogue | Historique de perte et retransmission distincts (AUD-024) | R07 | À l'étape de retransmission, segment perdu conservé et segment réémis identifiable ; retour/reset cohérents |
| R25 | P1 / S | Expert scientifique | Instants et compteurs TCP non ambigus (AUD-025) | Aucune autre correction | Revue sourcée des états/en-têtes ; explication corrigée ; question sur l'attente du troisième ACK |
| R26 | P1 / S | Chercheur / pédagogue | Activité Wireshark réalisable et correctement référencée (AUD-026) | Sources/support autorisés | Filtre, support, consignes et résultat vérifiables sans recherche improvisée par l'apprenant |
| R31 | P1 / XS | Design system / QA | Paire destructive conforme aux usages prévus (AUD-031) | R07 | Contraste requis mesuré sur couleurs finales, états pertinents inclus |
| R27 | P1 / M | QA | Réception navigateur et artefacts de preuve (AUD-029) | R17, R20–R26, R31 | Build puis flux nominal/perte complets, trois exercices, clavier, reduced-motion, console, mobile/desktop et captures ; navigateur identifié |
| R28 | P1 / M | Pédagogue / continuité | Statut de publication et révisions traçables (AUD-027) | R19, R25, R26, R27 | Brouillon non publié ; publication sans revue/preuve refusée ; révision de contenu, sources et décision humaine reliées |

## D. Après la sortie de stabilisation

| ID | Priorité / taille | Responsable | Livrable et constats | Dépendances | Acceptation vérifiable |
| --- | --- | --- | --- | --- | --- |
| R29 | P2 / M | Architecte / pédagogue | Registre éprouvé avec un deuxième cours léger (AUD-019) | Critères ITER-001-R atteints ; ADR si structurant | Deux leçons et deux catalogues détectés sans modification du chargeur commun ; IDs d'étapes liés au scénario |
| R30 | P2 / M | Exercices / architecte | Premier historique/persistance de tentatives et évaluation cumulative (AUD-028) | R20, R28 | Rechargement cohérent, tentatives liées à une révision, agrégation multi-concepts et feedback conservé |
| R33 | P2 / XS | Architecte / QA | Examen ciblé des dépendances candidates à simplification (AUD-030) | R02, suites exécutables | Usage justifié ou retrait autorisé ; build et tests inchangés ; React DOM conservé selon besoin du framework |

L'explorateur XYFlow initialement prévu peut ensuite redevenir une tâche Ready en fonction de ses prérequis réellement terminés. Les bibliothèques 3D restent conditionnelles à une première leçon démontrant leur avantage pédagogique. Le modèle de tentatives et les formats d'exercices supplémentaires doivent répondre à des objectifs vérifiables, sans introduire d'exécution de code apprenant.

## Critères de sortie de ITER-001-R

- Checkout versionné et installation gelée reproductible sur Node compatible ; versions/outils consignés.
- Typecheck, lint, format, validation complète des données, tests unitaires, build et E2E effectivement exécutés après les dernières corrections ; aucune commande sautée présentée comme réussie.
- Contre-exemples d'intégrité et de cache correctement traités ; démarrage et styles vérifiés depuis un environnement propre.
- Démonstrateur réceptionné scientifiquement et en navigateur, avec preuves desktop/mobile et limites documentées.
- Découverte des trois outils prouvée ; reprise sans conversation réussie et relais factuel lié à la révision vérifiée.
- Publication définie et approuvée, sans dépendre d'un déploiement de production pour prouver le socle.

Le premier build réel peut révéler d'autres défauts, aujourd'hui masqués par l'installation absente. Leur correction doit s'inscrire dans les critères concernés, sans prétendre que cette liste garantit par avance un build vert. Les mesures de trafic massif et de GPU sont hors de cette réception tant qu'aucun cas concret ne les justifie.
