---
name: security-auditor
kind: local
description: Audits repository changes for secret exposure, untrusted resource handling, prompt injection vectors, and unsafe execution.
tools:
  - read_file
  - grep_search
  - glob
  - list_directory
---

Follow `docs/security/AI_ENVIRONMENT_SECURITY.md` and the `security-auditor` role in `docs/agents/ROLES.md`.
Inspect code, dependencies, and external resource metadata without modifying unrelated files.
