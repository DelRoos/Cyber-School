import fs from "node:fs";
import path from "node:path";
import {
  readTasks,
  snapshot,
  validateContinuity,
  validatePublications,
  validateTasks,
} from "../../scripts/quality/core.ts";

const rootDir = path.resolve(import.meta.dirname, "../..");

const SCAN_FILES = ["AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md"];
const SCAN_DIRS = ["docs", "continuity", "planning", ".agents", ".claude", ".gemini"];
interface GovernanceIssue {
  category: string;
  message: string;
}

const issues: GovernanceIssue[] = [];

function collectMarkdownFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files.sort();
}

function stripFencesAndInlineCode(markdown: string): string {
  const withoutFences = markdown.replace(/```[\s\S]*?```/g, "");
  return withoutFences.replace(/`[^`]*`/g, "");
}

function validateMarkdownLinks(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const cleaned = stripFencesAndInlineCode(raw);
  const linkRegex = /\[[^\]]*\]\(([^)\s]+)\)/g;

  for (const match of cleaned.matchAll(linkRegex)) {
    const target = match[1];
    if (!target) continue;
    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("#")
    ) {
      continue;
    }

    const [relativePath] = target.split("#");
    if (!relativePath) continue;
    const resolved = path.resolve(path.dirname(filePath), relativePath);
    if (!fs.existsSync(resolved)) {
      issues.push({
        category: "link",
        message: `Broken local link in ${path.relative(rootDir, filePath)}: ${target} -> ${path.relative(rootDir, resolved)}`,
      });
    }
  }
}

// 1. Validate local Markdown links & CLAUDE.md @imports
const markdownFiles = [
  ...SCAN_FILES.map((name) => path.join(rootDir, name)).filter((p) => fs.existsSync(p)),
  ...SCAN_DIRS.flatMap((dir) => collectMarkdownFiles(path.join(rootDir, dir))),
];

for (const mdFile of markdownFiles) {
  validateMarkdownLinks(mdFile);
}

const claudePath = path.join(rootDir, "CLAUDE.md");
if (fs.existsSync(claudePath)) {
  const claudeCleaned = stripFencesAndInlineCode(fs.readFileSync(claudePath, "utf8"));
  const importRegex = /(?:^|\s)@([A-Za-z0-9_./-]+\.md)\b/gm;
  const imports = [...claudeCleaned.matchAll(importRegex)].map((m) => m[1]).filter(Boolean);
  if (imports.length === 0) {
    issues.push({
      category: "link",
      message: "CLAUDE.md must contain at least one unbackticked @path.md import.",
    });
  }
  for (const imp of imports) {
    if (!imp) continue;
    const resolved = path.resolve(rootDir, imp);
    if (!fs.existsSync(resolved)) {
      issues.push({
        category: "link",
        message: `Broken CLAUDE.md @import: @${imp}`,
      });
    }
  }
}

// 2. Validate .agents/skills/ <-> .claude/skills/ byte-for-byte mirror parity
function collectRelativeFiles(baseDir: string, currentDir = baseDir): string[] {
  if (!fs.existsSync(currentDir)) return [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectRelativeFiles(baseDir, full));
    } else if (entry.isFile()) {
      results.push(path.relative(baseDir, full).replace(/\\/g, "/"));
    }
  }
  return results.sort();
}

const canonicalSkillsDir = path.join(rootDir, ".agents/skills");
const claudeSkillsDir = path.join(rootDir, ".claude/skills");
const canonicalSkillFiles = collectRelativeFiles(canonicalSkillsDir);
const claudeSkillFiles = collectRelativeFiles(claudeSkillsDir);

if (canonicalSkillFiles.length === 0) {
  issues.push({
    category: "skills-mirror",
    message: "No files found under canonical .agents/skills/ directory.",
  });
}

if (JSON.stringify(canonicalSkillFiles) !== JSON.stringify(claudeSkillFiles)) {
  issues.push({
    category: "skills-mirror",
    message: `.claude/skills/ file tree differs from .agents/skills/ (canonical=${canonicalSkillFiles.length}, mirror=${claudeSkillFiles.length}).`,
  });
} else {
  for (const relPath of canonicalSkillFiles) {
    const a = fs.readFileSync(path.join(canonicalSkillsDir, relPath));
    const b = fs.readFileSync(path.join(claudeSkillsDir, relPath));
    if (!a.equals(b)) {
      issues.push({
        category: "skills-mirror",
        message: `Skill mirror mismatch for ${relPath}: run mirror sync from .agents/skills/ to .claude/skills/.`,
      });
    }
  }
}

// 3. Check the task graph, executable evidence, publication and checkpoint freshness.
const source = snapshot(rootDir);
const loadedTasks = readTasks(rootDir);
const tasksById = loadedTasks.tasks;
for (const issue of [
  ...loadedTasks.issues,
  ...validateTasks(rootDir, tasksById, source),
  ...validatePublications(rootDir, source),
  ...validateContinuity(rootDir, source, tasksById),
])
  issues.push({ category: issue.code, message: issue.message });

const backlogPath = path.join(rootDir, "planning/backlog/BACKLOG.md");
if (fs.existsSync(backlogPath)) {
  const backlogText = fs.readFileSync(backlogPath, "utf8");
  for (const task of tasksById.values()) {
    const rowRegex = new RegExp(
      `\\|\\s*\`${task.id}\`\\s*\\|[^\\n]*\\|\\s*\`([^|\`]+)\`\\s*\\|`,
      "m",
    );
    const rowMatch = rowRegex.exec(backlogText);
    if (!rowMatch) {
      issues.push({
        category: "task-governance",
        message: `Task ${task.id} missing from planning/backlog/BACKLOG.md.`,
      });
    } else if (rowMatch[1]?.trim() !== task.status) {
      issues.push({
        category: "task-governance",
        message: `Status drift for ${task.id}: BACKLOG.md says "${rowMatch[1]?.trim()}" vs task file "${task.status}".`,
      });
    }
  }
}

// 4. Verify read-only constraints on security-auditor subagent adapters
const geminiAuditorPath = path.join(rootDir, ".gemini/agents/security-auditor.md");
if (fs.existsSync(geminiAuditorPath)) {
  const geminiAuditor = fs.readFileSync(geminiAuditorPath, "utf8");
  if (!/^kind:\s*local$/m.test(geminiAuditor) || !/^tools:\s*$/m.test(geminiAuditor)) {
    issues.push({
      category: "agent-security",
      message:
        ".gemini/agents/security-auditor.md must declare kind: local and an explicit read-only tools list.",
    });
  }
  if (/\b(?:write_file|replace|run_shell_command|edit_file)\b/.test(geminiAuditor)) {
    issues.push({
      category: "agent-security",
      message: ".gemini/agents/security-auditor.md must not allow mutating or shell tools.",
    });
  }
}

const claudeAuditorPath = path.join(rootDir, ".claude/agents/security-auditor.md");
if (fs.existsSync(claudeAuditorPath)) {
  const claudeAuditor = fs.readFileSync(claudeAuditorPath, "utf8");
  if (/\b(?:Write|Edit|Bash)\b/.test(claudeAuditor)) {
    issues.push({
      category: "agent-security",
      message: ".claude/agents/security-auditor.md must not allow Write, Edit, or Bash tools.",
    });
  }
}

if (issues.length > 0) {
  console.error("Governance validation failed:");
  for (const issue of issues) {
    console.error(`- [${issue.category}] ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `Governance validation passed: ${markdownFiles.length} markdown file(s), ${canonicalSkillFiles.length} mirrored skill file(s), ${tasksById.size} task(s).`,
);
