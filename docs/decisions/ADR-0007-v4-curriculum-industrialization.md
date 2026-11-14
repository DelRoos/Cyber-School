# ADR-0007 : Industrialisation de la production de cours depuis le cursus atomique V4

- **Statut** : `Accepted`
- **Date** : `2026-11-14`
- **Décideurs** : Architecte principal & Gouvernance AI-First (`cyber-school`)
- **Liens** : [PEDAGOGICAL_MODEL.md](../architecture/PEDAGOGICAL_MODEL.md), [QUALITY_GATES.md](../standards/QUALITY_GATES.md), [V4_AUDIT_REPORT.md](../curriculum/V4_AUDIT_REPORT.md)

## Contexte

Le fichier source `Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md` définit l'inventaire complet de l'académie (`54` modules, `1 122` micro-leçons, `9` examens intégrateurs). Produire les cours un par un via des missions rédigées à la main ne passe pas à l'échelle et expose à trois risques :

1. Oublis ou chevauchements de micro-leçons par rapport au cursus V4.
2. Perte de suivi d'avancement entre Codex, Claude Code et Gemini CLI lors de réimportations ou de changements d'agent.
3. Collisions avec le validateur existant (`validate:curriculum`), qui exige aujourd'hui que tous les fichiers top-level `curriculum/*.json` respectent `CurriculumCatalogSchema` (`Domain -> Module -> Chapter -> AtomicConcept`).

## Décision

1. **Séparation stricte entre import structurel et état de production persistant** :
   - Les artefacts structurés issus du Markdown V4 vivent dans `curriculum/v4/` (`imported-curriculum.json`, `import-report.json`), hors du glob top-level `curriculum/*.json` afin de ne pas casser `validate:curriculum`.
   - Les unités pédagogiques regroupées et leur cycle de vie vivent dans `production/` (`units.json`, `registry.json`, `missions/`, `reports/`).
   - L'importateur (`pnpm v4:import`) est **idempotent** : relancer l'import met à jour la provenance et les textes du Markdown V4 tout en préservant les unités validées, les dépendances approuvées, les livrables et l'état de production dans `production/registry.json`.

2. **Granularité en unités pédagogiques cohérentes (`V4PedagogicalUnit`)** :
   - Une unité regroupe typiquement `4` à `12` micro-leçons consécutives ou thématiquement homogènes d'un module en un cours interactif (`/lessons/<slug>`), tout en vérifiant mathématiquement que **100 % des `1 122` micro-leçons** sont affectées sans omission ni duplication.
   - Les cours hérités (`tcp-three-way-handshake`, `program-memory-fundamentals`) peuvent être raccordés via des ponts explicites sans réécriture destructive.

3. **Machine à états à 12 statuts & contrat à 12 livrables dans `@cyber-school/lesson-runtime`** :
   - Les schémas Zod (`packages/lesson-runtime/src/v4-factory.ts`) formalisent :
     - Les **12 états** (`a_planifier`, `sources_a_completer`, `conception_en_cours`, `conception_a_valider`, `pret_a_developper`, `developpement_en_cours`, `tests_en_cours`, `revue_necessaire`, `valide`, `publie`, `a_reviser`, `bloque`).
     - Les **12 livrables** attendus par unité (`scientific_sheet` à `publication_metadata`).
   - Garde-fou strict : aucune unité ne peut atteindre l'état `publie` si son manifeste `lessons/<slug>/lesson.json` n'est pas réellement `published` avec approbation humaine (`approvedBy`, `scientificReviewer`, `qaEvidenceRef`) et ses 12 livrables vérifiés.

4. **Automatisation CLI sans orchestrateur externe** :
   - `v4:import`, `v4:plan`, `v4:mission`, `v4:audit` sont de purs scripts TypeScript Node (`--experimental-strip-types`) sans nouvelle dépendance npm (préservant `pnpm-lock.yaml`).
   - Les agents natifs (Codex, Claude Code, Gemini CLI) pilotent les lots via les skills canoniques `.agents/skills/` (miroir exact `.claude/skills/`).

## Conséquences

- Les développeurs et apprenants disposent d'un explorateur `/curriculum` reflétant en direct les modules V4, la couverture des micro-leçons, les états de production et les prochaines unités éligibles.
- Le passage à l'échelle vers des dizaines de cours repose sur des lots bornés (`v4:mission --next --limit N`) plutôt que sur des boucles autonomes incontrôlées.
