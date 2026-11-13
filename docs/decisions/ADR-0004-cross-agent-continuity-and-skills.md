# ADR-0004: Continuité inter-agents et skills portables sans orchestrateur personnalisé

- **Status**: Accepted
- **Date**: 2026-11-13
- **Author(s)**: product-software-architect, continuity-keeper

## Context

Trois agents IA différents (**Codex**, **Claude Code**, **Gemini CLI**) travaillent tour à tour sur le dépôt. Nous ne voulons ni orchestrateur propriétaire ni divergence entre trois copies des mêmes règles.

## Decision

1. Centraliser les règles dans `docs/agents/AGENT_GUIDE.md` et `docs/agents/ROLES.md`, et faire pointer `AGENTS.md`, `CLAUDE.md` et `GEMINI.md` vers ces documents.
2. Stocker les skills partagés au format **Agent Skills** dans `.agents/skills/<skill>/SKILL.md` (format reconnu nativement).
3. Fournir des adaptateurs légers pour les sous-agents natifs dans `.codex/agents/*.toml`, `.claude/agents/*.md` et `.gemini/agents/*.md`.
4. Imposer un protocole de reprise et de checkpoint dans `continuity/` (`RESUME_PROTOCOL.md`, `CURRENT_STATE.md`, `HANDOFF.md`, `BLOCKERS.md`).

## Alternatives Considered

1. **Développer un orchestrateur Node/Python maison** : Hors périmètre et fragile face aux évolutions des CLI natifs.
2. **Dupliquer les règles dans AGENTS.md, CLAUDE.md et GEMINI.md** : Risque élevé de dérive documentaire.

## Consequences

- N'importe quel agent peut reprendre une tâche en lisant des fichiers versionnés déterministes.
- Aucun secret ou état conversationnel privé n'est requis pour continuer le projet.

## Verification Criteria

Présence et validité syntaxique des fichiers d'entrée, des 8 `SKILL.md` et des adaptateurs de sous-agents ; test de relecture autonome via `continuity/RESUME_PROTOCOL.md`.
