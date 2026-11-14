---
id: TASK-017
title: Implémenter le registre à 12 états, les CLI (v4:plan, v4:mission, v4:audit) et curriculum-production
status: Done
verificationRef: continuity/validation/2026-11-14T08-50-49-049Z-1eeabe30-dc21-433b-b53e-0619c5057717/result.json
priority: P0
complexity: M
iteration: ITER-002
dependsOn: [TASK-014, TASK-016]
labels: [area:curriculum, area:agents, area:qa]
githubIssue: null
---

# TASK-017 — Registre de production, CLI V4 et skill curriculum-production

## Objectif

Offrir aux agents Codex, Claude Code et Gemini CLI un outillage CLI déterministe et borné pour planifier les lots éligibles, préparer les dossiers de mission et auditer les cours contre le contrat des 12 livrables.

## Critères d'acceptation

- [x] `production/registry.json` gère les 12 états de production et le contrat strict des 12 livrables avec blocage de publication sans validation humaine.
- [x] Les commandes `pnpm v4:plan`, `pnpm v4:mission -- --next --limit <1..5>` et `pnpm v4:audit -- --unit <id>` génèrent les dossiers dans `production/missions/` et les rapports QA dans `production/reports/`.
- [x] Le skill `.agents/skills/curriculum-production/SKILL.md` (ainsi que `lesson-design` et `iteration-planning`) est à jour et synchronisé octet pour octet vers `.claude/skills/`.
- [x] Aucun nouvel orchestrateur IA concurrent n'est introduit ; les trois agents existants consomment directement ces scripts et contrats.
