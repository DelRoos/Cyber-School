# Index des preuves, sources et limites

Date de référence de l'audit : **13 novembre 2026, Africa/Douala**. Périmètre : dépôt local initial et ressources publiques officielles pertinentes. Les captures d'état ne disposent pas de SHA de commit initial ; l'identité du contenu est assurée par les empreintes de fichier.

## Documents à lire

1. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) : verdict, dix réponses et ordre de décision.
2. [FINDINGS.md](FINDINGS.md) : 32 constats détaillés et critères de correction.
3. [ARCHITECTURE_AUDIT.md](ARCHITECTURE_AUDIT.md), [AGENTS_AND_SKILLS_AUDIT.md](AGENTS_AND_SKILLS_AUDIT.md), [CONTINUITY_AUDIT.md](CONTINUITY_AUDIT.md), [PEDAGOGY_AND_VISUAL_AUDIT.md](PEDAGOGY_AND_VISUAL_AUDIT.md), [SECURITY_AND_QUALITY_AUDIT.md](SECURITY_AND_QUALITY_AUDIT.md) : analyses par domaine.
4. [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md) : tâches proposées, dépendances et réception de l'itération de stabilisation.
5. [AUDIT_PLAN.md](AUDIT_PLAN.md) : plan, périmètre et checkpoints propres à cet audit.

## Preuves locales conservées

| Fichier | Contenu | Ce qu'il ne prouve pas |
| --- | --- | --- |
| `BASELINE_INVENTORY.json` | 120 chemins, tailles et SHA-256 initiaux | Versionnement Git ou origine des fichiers |
| `WORKSPACE_INTEGRITY.json` | Comparaison finale des fichiers et des ajouts | Absence de tout effet hors du périmètre inspecté |
| `GIT_AND_TOOL_STATE.txt` | État Git, versions locales et features Codex | Invocation fonctionnelle des sous-agents dans chaque CLI |
| `CHECK_RESULTS.json` et `check-*.txt` | Commandes standard, codes retour, sorties | Succès des suites quand les outils manquent |
| `check-extra-*.txt` | dev, start et audit de dépendances tentés | Application démarrée ou analyse CVE obtenue |
| `INTEGRITY_PROBES.json` | Résultats de 12 sondes sur le validateur original | Parsing Zod, compilation complète ou passage de Vitest |
| `STATIC_CHECKS.json` | Syntaxe JSON/TOML, imports, liens, sources Tailwind et recherche de motifs de secrets | Typage/lint complets ou absence exhaustive de secret |
| `STRUCTURE_CHECKS.json` | Syntaxe YAML/frontmatters et décompte statique des tests | Exécution des dix cas unitaires ou des deux configurations E2E |
| `GEMINI_NATIVE_LOAD.json` | Chargeurs natifs Gemini 0.64.0, six agents et huit skills | Authentification, génération IA ou exécution d'une tâche par un agent |
| `DEPENDENCY_STATIC_USAGE.json` | Imports source comparés aux dépendances runtime | Analyse complète des usages implicites par frameworks/configurations |
| `SECURITY_STATIC_CHECKS.json` | Absence de motifs dangereux dans les fichiers contrôlés et calcul de contraste | Audit des transitives, rendu final ou conformité WCAG générale |
| `REGISTRY_VERSION_CHECKS.json` | Première tentative réseau sandboxée, indisponible | Existence ou inexistence des versions |
| `REGISTRY_VERSION_CHECKS_NETWORK.json` | 29 couples nom/version publiés confirmés, moteurs et peers retournés | Résolution des plages, installation, vulnérabilités des transitives |
| `LINE_REFERENCES.txt` | Repères de ligne des fichiers initiaux | Remplacement de la lecture du source complet |

Les sondes exécutent l'original `packages/lesson-runtime/src/validator.ts` par le strip-types de Node ; ses imports sont de types et ne requièrent pas Zod à l'exécution. Des copies JSON en mémoire sont mutées, jamais les fichiers du corpus. Les sorties donnent pour chaque cas le résultat attendu, le résultat observé et les diagnostics.

Le chargement Gemini utilise les fonctions exportées du bundle installé `C:/Users/Emerite/AppData/Roaming/npm/node_modules/@google/gemini-cli/bundle/chunk-NR7L3FXV.js`. Il inspecte les adaptateurs sans lancer un sous-agent. La clé enableAgents est également présente dans le schéma de settings du bundle local. Ces observations valent pour 0.64.0 et ne constituent pas une API de test à maintenir comme dépendance du projet.

## Sources officielles consultées

Les rapports citent les sources à proximité des conclusions concernées. Ce catalogue permet de retrouver les contrôles dépendant d'une version :

| Sujet | Source primaire et usage |
| --- | --- |
| Codex | [Sous-agents](https://learn.chatgpt.com/docs/agent-configuration/subagents) et [skills](https://learn.chatgpt.com/docs/build-skills), depuis les URL officielles developers.openai.com redirigées : formats et découverte actuels |
| Claude Code | [Skills](https://code.claude.com/docs/en/skills), [sous-agents](https://code.claude.com/docs/en/sub-agents), [mémoire/imports](https://code.claude.com/docs/en/memory) : chemins, permissions et imports littéraux |
| Gemini CLI | [Sous-agents](https://geminicli.com/docs/core/subagents/) et [skills](https://geminicli.com/docs/cli/skills/) : settings, héritage d'outils et chemin partagé |
| TCP | [RFC 9293](https://datatracker.ietf.org/doc/html/rfc9293), notamment §3.5 : valeurs et transitions du handshake ; la RFC 6528 est signalée comme obsolétée par 9293 sur la fiche officielle |
| Laboratoire | [Wireshark — Following Protocol Streams](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html) : comparaison entre page réelle et activité annoncée |
| Styles | [Sources Tailwind](https://tailwindcss.com/docs/detecting-classes-in-source-files) : résolution des chemins CSS |
| Cache | [Configuration Turborepo](https://turborepo.dev/docs/reference/configuration) : entrées hors packages et globales |
| Validation | [Objets Zod](https://zod.dev/api#objects) : suppression ou rejet des clés inconnues |
| Clavier | [Pattern radio WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) : comportement de focus et flèches |
| Node | [Calendrier et versions](https://nodejs.org/en/about/previous-releases) : support de la branche locale |
| Dépendances | [Registre npm](https://registry.npmjs.org/vitest/5.1.0) : lectures HTTPS exactes par nom/version, détaillées dans les preuves JSON ; aucune archive de package téléchargée/exécutée |

Les documentations Web peuvent évoluer. La compatibilité d'une ancienne version locale est distinguée de la spécification actuelle ; aucun format n'est déclaré fictif uniquement parce qu'il est absent d'un souvenir du modèle. Le contenu technique a été traité comme une source de données, sans suivre d'instructions issues de ressources externes.

## Limites finales

L'absence de lockfile et de dépendances empêche la chaîne standard, le navigateur, l'accessibilité instrumentée, la mesure du bundle, des performances et de la mémoire. Aucun site n'a été déployé et aucune capture fictive n'a été produite. Aucune recherche de dépendance vulnérable ne peut être conclue à partir de simples métadonnées de publication.

La lecture npm avait été refusée par le contrôle automatique au motif d'export potentiel de métadonnées ; l'accord explicite de l'utilisateur a ensuite permis cette lecture limitée. Aucun refus n'a été contourné. Les trois timeouts initiaux ont été résolus par une reprise ciblée autorisée. Les remédiations, écritures de continuité et modifications du code sont laissées à une phase ultérieure autorisée.
