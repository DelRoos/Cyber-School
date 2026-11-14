# Rapport d'audit du cursus V4 (`Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md`)

> Analyse réalisée sur la source canonique sans réécriture arbitraire du Markdown original (`3 550` lignes, `224 530` octets).

## 1. Structure réelle et identifiants observés

Le document comporte deux couches complémentaires :

1. **Couche atomique principale (lignes 30–1621)** :
   - **54 modules** répartis en 6 familles :
     - Tronc commun `TC-00` à `TC-07` (`8` modules)
     - Branche A `A-01` à `A-09` (`9` modules)
     - Branche B `B-01` à `B-11` (`11` modules)
     - Branche C `C-01` à `C-12` (`12` modules)
     - Branche D `D-01` à `D-04` (`4` modules)
     - Approfondissements transversaux `X-01` à `X-10` (`10` modules)
   - **1 122 micro-leçons** au format `- **XXYY.NNN** — Intitulé`.
   - Aucun doublon d'identifiant micro-leçon (`0` doublon) et aucune rupture de numérotation séquentielle `.001..N` dans les 54 modules.

2. **Référentiel complémentaire & intégration (lignes 1632–3550)** :
   - **44 modules détaillés** (`TC-00` à `D-04`) précisant finalité, compétences atomiques (`672` items à 2 chiffres pour `TC-00..B-10, C-01..D-04` + `100` items `B11.001..B11.100` sous 10 sous-sections `### B-11.01..B-11.10`, soit `772` items au total), visualisations attendues, exercices internes, ressources externes HTTPS, livres, labs externes et critères de validation.
   - **9 examens transversaux intégrateurs** (`EX-01` à `EX-09`, lignes 3395–3523) avec prérequis explicites.
   - **Partie IX** (lignes 3526–3550) définissant l'ordre recommandé du socle (`TC-00 -> TC-01 -> ... -> TC-07`) et des séquences spécialisées.

## 2. Incohérences, écarts et prérequis manquants identifiés

| Catégorie                            | Observation vérifiée                                                                                                                                                                                                       | Impact pour l'importateur                                                            | Stratégie retenue                                                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compteur textuel obsolète            | La ligne 1625 annonce « 1022 micro-leçons réparties en 53 modules », alors que le corps contient **1 122 micro-leçons** et **54 modules** (`B-11` ajoute 100 micro-leçons, et `X-01..X-10` sont absents de la Partie II+). | Un test strict sur le chiffre `1022` ou `53` échouerait à tort.                      | L'importateur consigne l'écart dans `import-report.json` sans modifier ni tronquer le fichier Markdown V4.                                                  |
| Prérequis `TC-00`..`TC-07`           | Aucun champ `**Prérequis :**` n'apparaît dans les fiches Part 2 de `TC-00..TC-07`, mais la Partie IX (ligne 3528) fixe `TC-00 -> TC-01 -> ... -> TC-07`.                                                                   | Risque de considérer `TC-07` sans prérequis si seule l'en-tête locale est lue.       | Conserver `explicitPrerequisites: []` et émettre des `proposedDependencies` explicites (`status: "proposed"`) issues de la Partie IX.                       |
| Format hétérogène de `B-11`          | `B-11` utilise `**Position dans le cursus :**` au lieu de `**Prérequis :**`, et structure sa Partie 2 en 10 sous-chapitres `### B-11.01..10` avec des items à 3 chiffres (`B11.001..100`) sans tiret `—`.                  | Un parseur naïf manquerait les prérequis de `B-11` ou dupliquerait ses micro-leçons. | Support dédié dans l'importateur et extraction des dépendances explicites (`B-05, B-07, B-08, B-09, B-10`) + liens transverses (`C-06..09, A-03/04, D-03`). |
| `EX-04` incomplet sur `B-11`         | `EX-04` liste `B-01 à B-10` sans mentionner `B-11`.                                                                                                                                                                        | `B-11` reste couvert par sa propre position experte.                                 | Signalé dans le rapport d'audit ; pas de réécriture du texte V4.                                                                                            |
| Modules `X-01..X-10` sans Partie 2   | Les 10 modules `X-*` possèdent des micro-leçons en Partie 1 (`148` items au total) mais aucune section Part 2 ni champ `**Prérequis :**`.                                                                                  | Aucun prérequis explicite ni ressource dédiée dans le Markdown.                      | Génération de `proposedDependencies` vers le tronc commun et branches cibles (`X-01 -> TC-00`, `X-02 -> TC-01`, etc.) marquées `à valider`.                 |
| Liens textuels naturels dans `EX-09` | `EX-09` écrit `tous les modules A, B, C, D, EX-01 à EX-08`.                                                                                                                                                                | Nécessite résolution sémantique des plages (`A-01..09`, etc.).                       | Résolveur de plages (`XX-01 à XX-NN`) + résolution explicite de `tous les modules A, B, C, D`.                                                              |

## 3. Pont avec l'existant dans `cyber-school`

Deux leçons interactives déjà développées couvrent partiellement des concepts du tronc commun V4 :

- [tcp-three-way-handshake](../../lessons/tcp-three-way-handshake/lesson.json) : pont partiel vers `TC-03` (`TC03.017`..`TC03.021` : SYN/SYN-ACK/ACK, séquences, retransmission, timeout/RST).
- [program-memory-fundamentals](../../lessons/program-memory-fundamentals/lesson.json) : pont partiel vers `TC-01` (`TC01.011`..`TC01.028` : registres, cycle fetch/decode/execute, RAM/cache, mémoire virtuelle/pages, processus/threads, pile/tas, endianness, limites d'analogie).

Aucun des 54 modules complets n'est encore intégralement couvert, et **`TC-00` (`TC00.001..TC00.024`) constitue le point d'entrée racine sans prérequis** idéal pour le premier lot de production industrialisée.
