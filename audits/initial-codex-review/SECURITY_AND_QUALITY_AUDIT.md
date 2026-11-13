# Audit de sécurité, qualité et vérifications

## Cadre et environnement

Inspection non destructive du dépôt local. Aucun exploit, accès à un service de déploiement, message externe, installation globale, changement de permissions système, modification de manifeste/lockfile ou code applicatif. Les commandes disponibles ont été inspectées avant exécution. Les lectures Web concernent des documentations publiques et le registre npm autorisé.

Environnement observé : Windows/PowerShell ; Node **23.9.0**, pnpm **10.28.0** via Corepack ; Codex CLI **0.87.0**, Claude Code **2.1.145**, Gemini CLI **0.64.0**. Les shims PowerShell de Codex/Gemini sont bloqués par la politique d'exécution ; les shims `.cmd` existants permettent de lire versions/aides sans modifier cette politique. Le registre des blocages initial ne mentionne que pnpm global, dont l'absence est effectivement contournée.

## Vérifications standard exécutées

| Commande | Code retour | Résultat exact / portée |
| --- | --- | --- |
| `corepack pnpm install --frozen-lockfile --ignore-scripts` | 1 | `ERR_PNPM_NO_LOCKFILE` ; pas d'installation ni de création de lockfile |
| `corepack pnpm typecheck` | 1 | `turbo` introuvable ; aucun typecheck de package exécuté |
| `corepack pnpm lint` | 1 | `turbo` introuvable ; aucun résultat ESLint |
| `corepack pnpm test:unit` | 1 | `turbo` introuvable ; aucun cas Vitest exécuté |
| `corepack pnpm build` | 1 | `turbo` introuvable ; aucun build Next/TS validé |
| `corepack pnpm test:e2e` | 1 | Un Playwright global est trouvé, mais `@playwright/test` local est absent lors du chargement de la configuration ; zéro cas du projet exécuté |
| `corepack pnpm validate:curriculum` | 1 | Étape de build `turbo` introuvable ; script Zod non atteint |
| `corepack pnpm format:check` | 1 | `prettier` introuvable ; aucun verdict de formatage |
| `corepack pnpm list -r --depth 0` | 0 | Sortie vide ; ne prouve pas des dépendances installées |
| `corepack pnpm dev` | 1 | `turbo` introuvable |
| `corepack pnpm --filter @cyber-school/web start` | 1 | `next` introuvable |
| `corepack pnpm audit --json` | 1 | `ERR_PNPM_AUDIT_NO_LOCKFILE` ; pas de rapport CVE |

Les huit premières commandes sont consignées dans [CHECK_RESULTS.json](CHECK_RESULTS.json) et les journaux `check-*.txt`. Les trois commandes supplémentaires ont leurs propres journaux. Les échecs de préparation ne prouvent pas que tous les types/tests applicatifs échoueraient après installation. Inversement, aucun succès de ces suites ne peut être annoncé.

L'installation sans lockfile produirait un nouvel état de dépendances et nécessite l'autorisation prévue par la mission. Elle n'a pas été effectuée. Aucun remplacement des bibliothèques par des versions globales ni assouplissement des scripts n'a été utilisé pour faire passer les contrôles.

## Contrôles complémentaires réellement exécutés

| Contrôle | Résultat | Limite |
| --- | --- | --- |
| Inventaire et empreintes SHA-256 | 120 fichiers initiaux, 200 520 octets | Pas de base Git versionnée |
| JSON/TOML | 19 JSON et six TOML parsés | Les schémas externes de configuration ne sont pas tous exécutés |
| YAML/frontmatters | Workspace, CI et frontmatters analysés avec parseur local | Syntaxe YAML ≠ validité native de chaque outil ; schéma GitHub Actions non exécuté |
| Liens locaux Markdown | Un lien cassé : RESUME_PROTOCOL vers BLOCKERS | Analyse des liens Markdown simples, pas de toute référence dans du texte/code |
| Sources Tailwind | Trois répertoires cibles inexistants | CSS final non construit |
| Imports/dépendances | 95 occurrences d'import relevées ; dépendance runtime du script racine absente ; candidats inutilisés identifiés | Analyse statique simple, pas de résolution TypeScript globale ni outil spécialisé installé |
| Chargement Gemini natif | Six agents chargés, aucune erreur ; huit skills canoniques | Chargement direct, pas de génération IA ni de session authentifiée |
| Validateur original via Node strip-types | 12 sondes, dont sept anomalies acceptées | Pas de parsing Zod et pas de Vitest ; ne pas comptabiliser comme « suite unitaire passée » |
| Recherche de secrets structurés | Aucun match des motifs sélectionnés sur les fichiers initiaux | Pas une garantie d'absence de tout secret, d'entropie ou de contenu ignoré/hors périmètre |
| Recherche de sinks dans les sources | Aucun `eval`, `new Function`, `dangerouslySetInnerHTML` ou exécuteur de code externe relevé | Revue du code présent, pas des dépendances transitives non installées |
| Contraste d'une paire de tokens | 3,34:1 pour destructive foreground/background | Pas de contrôle global des couleurs calculées de l'UI |

Les cinq attentes satisfaites des sondes comprennent le corpus nominal et quatre anomalies : cycle, prérequis manquant, concept dupliqué, concept de chapitre manquant. Les sept contre-exemples acceptés sont détaillés dans [INTEGRITY_PROBES.json](INTEGRITY_PROBES.json). Ils justifient AUD-008 sans prétendre à une exécution des schémas Zod.

`gemini.cmd skills list --all` a été tenté, n'a pas fourni de sortie dans le délai observé et a été interrompu. Le résultat probant provient ensuite des fonctions `loadAgentsFromDirectory` / `loadSkillsFromDir` du bundle 0.64.0 installé, sans lancer le moteur de modèle. Aucune conclusion de panne Gemini générale n'est déduite de cette commande bloquée.

## Versions et dépendances

Après le refus automatique initial d'exporter des métadonnées du projet, l'utilisateur a explicitement autorisé l'envoi des seuls noms et versions au registre npm. Une tentative de contrôle d'approbation a ensuite expiré ; l'unique reprise autorisée a pu s'exécuter. Les lectures HTTPS finales confirment **29 couples nom/version publiés sur 29**. Trois lectures initialement expirées (`@types/node@24.0.0`, `eslint@10.14.0`, `eslint-config-next@16.4.6`) ont abouti lors d'une reprise ciblée.

Ce contrôle porte sur les bornes exactes des déclarations, y compris les peers React 19.0.0, pas sur les versions effectivement résolues par `^`/`~`. Sans lockfile, on ne connaît pas l'arbre transitif ni ses vulnérabilités. Aucun package n'a été déclaré vulnérable sans preuve.

Les moteurs officiels excluent Node 23 pour les versions consultées de Vitest et jsdom ; le moteur racine `>=22.0.0` est donc trop permissif. [Métadonnées Vitest 5.1.0](https://registry.npmjs.org/vitest/5.1.0), [métadonnées jsdom 31.0.1](https://registry.npmjs.org/jsdom/31.0.1). Node 23 est aussi en fin de support ; il convient de sélectionner une branche LTS compatible et une version commune aux développeurs/CI. [Versions Node.js](https://nodejs.org/en/about/previous-releases).

La compatibilité TypeScript 6.0.3 / typescript-eslint 8.72.2 est cohérente avec la plage peer consultée `>=4.8.4 <6.1.0`. Il n'y a donc pas de raison étayée de recommander un downgrade arbitraire. La détection d'inutilisés reste préliminaire : Motion direct dans web et le plugin React Vite méritent examen ; React DOM reste nécessaire même sans import direct.

## Sécurité des contenus et agents

Points positifs : `.env`/`.env.*`, clés et caches ignorés ; aucun `.env`/clé privée dans l'inventaire initial ; pas de secret nécessaire aux leçons actuelles ; liens externes HTTPS et `rel="noopener noreferrer"` sur les nouvelles fenêtres ; pas d'import réseau exécuté ni de code d'apprenant serveur. La politique demande explicitement de traiter RFC, pages et JSON importés comme données non fiables. Aucun script de lifecycle applicatif d'installation suspect n'est déclaré.

La politique décrit toutefois un schéma « strict » interdisant les champs exécutables alors que `z.object` retire les clés inconnues du résultat. Il faut aligner le comportement et la politique, sans assimiler cette divergence à une exécution arbitraire. [Objets et clés inconnues dans Zod](https://zod.dev/api#objects). Les chaînes de texte restent capables de contenir des instructions hostiles à un agent ; le schéma ne remplace pas la frontière de confiance.

L'auditeur Claude dispose d'une liste de lecture réelle. L'auditeur Gemini hérite des outils du parent ; le Codex de ce dépôt énonce surtout une consigne. Leur exécution doit s'appuyer sur les restrictions natives effectives du parent et/ou les listes d'outils, avec une vérification de capacités (AUD-013). Les politiques personnelles et connexions MCP des trois outils n'ont pas été inspectées pour éviter l'accès à des informations hors dépôt ; l'absence de règle dans ce dépôt ne signifie pas une permission globale illimitée.

Le workflow CI effectue une véritable séquence installation/qualité/données/build/navigateur, sans publication ni déploiement. Il ne conserve pas de résultats de tests/captures et ne contrôle pas les transitions des tâches. Branch protection, statut requis, réglages du dépôt distant, secrets CI et historique de runs sont non vérifiables : aucun remote ni commit n'existe localement et aucun accès distant de mutation n'a été tenté. Les tags majeurs checkout/setup-node ne prouvent pas une compromission de chaîne d'approvisionnement.

## Performance et navigateur : frontière de ce rapport

Pas d'application démarrée, donc pas de capture Playwright, HTTP 200 observé, console inspectée, score Lighthouse, axe, FPS, trace mémoire ou budget GPU mesuré. Aucun outil d'accessibilité intégré n'est déclaré. Le test E2E ne fournit qu'un contrôle de DOMContentLoaded sous 5 s, avec valeur 0 si entrée de navigation absente : cela n'est pas une preuve générale de performance.

La reprise des mesures exige un Node compatible, l'installation autorisée avec lockfile, un build puis le navigateur attendu. Les défauts statiques et les contrôles négatifs restent valables indépendamment de ces mesures manquantes. Voir AUD-001/002/007/013/017/018/021/022/029/031/032 pour les critères de réception précis.
