import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

export interface Issue {
  code: string;
  message: string;
}
export interface Snapshot {
  digest: string;
  fileCount: number;
  gitHead: string | null;
}
export interface Task {
  id: string;
  status: string;
  dependsOn: string[];
  body: string;
  fileName: string;
  verificationRef?: string;
}
export interface CheckResult {
  name: string;
  command: string[];
  exitCode: number | null;
  startedAt: string;
  finishedAt: string;
  logFile: string;
  logSha256: string;
}
export interface Evidence {
  schemaVersion: 1;
  runId: string;
  taskId: string | null;
  status: "running" | "passed" | "failed";
  startedAt: string;
  finishedAt: string | null;
  source: Snapshot;
  criteriaDigest: string | null;
  environment: { nodeVersion: string; platform: string; packageManager: string };
  checks: CheckResult[];
  issues: Issue[];
}

export const REQUIRED_CHECKS = [
  "test:guards",
  "typecheck",
  "lint",
  "format:check",
  "validate:governance",
  "validate:curriculum",
  "test:unit",
  "build",
  "test:e2e",
] as const;

export const sha256 = (value: string | Buffer): string =>
  crypto.createHash("sha256").update(value).digest("hex");

const excludedDirectories = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
  ".pnpm-store",
  "audits",
  "continuity",
  "planning",
]);

export function snapshot(root: string): Snapshot {
  const entries: string[] = [];
  function visit(dir: string): void {
    const children = fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const child of children) {
      if (child.isDirectory() && excludedDirectories.has(child.name)) continue;
      const full = path.join(dir, child.name);
      const relative = path.relative(root, full).replaceAll("\\", "/");
      if (child.isSymbolicLink()) throw new Error(`Unsupported source symlink: ${relative}`);
      if (child.isDirectory()) {
        visit(full);
        continue;
      }
      if (
        !child.isFile() ||
        /(?:\.log|\.tsbuildinfo|\.tmp)$/.test(child.name) ||
        child.name === "next-env.d.ts"
      )
        continue;
      let content: string | Buffer = fs.readFileSync(full);
      if (/^lessons\/[^/]+\/lesson\.json$/.test(relative)) {
        // Administrative promotion follows QA; scientific content and revision remain hashed.
        const lesson = JSON.parse(content.toString()) as Record<string, unknown>;
        const testedContent = { ...lesson };
        delete testedContent.status;
        delete testedContent.review;
        content = JSON.stringify(testedContent);
      }
      entries.push(`${relative}\0${sha256(content)}`);
    }
  }
  visit(root);
  let gitHead: string | null = null;
  try {
    gitHead = execFileSync("git", ["rev-parse", "--verify", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    /* An unborn repository is reported, never treated as a validated base. */
  }
  return { digest: sha256(entries.join("\n")), fileCount: entries.length, gitHead };
}

export function environmentIssues(
  root: string,
  options: {
    beforeInstall?: boolean;
    nodeVersion?: string;
    requireGitBase?: boolean;
  } = {},
): Issue[] {
  const issues: Issue[] = [];
  const version = options.nodeVersion ?? process.versions.node;
  const [major, minor] = version.split(".").map(Number);
  if (
    !/^\d+\.\d+\.\d+$/.test(version) ||
    ![22, 24, 26].includes(major ?? 0) ||
    (major === 22 && (minor ?? 0) < 12)
  ) {
    issues.push({
      code: "NODE_UNSUPPORTED",
      message: `Node ${version}: use Node 22.12+ (22.x), 24.x or 26.x LTS.`,
    });
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
    packageManager?: string;
  };
  if (!/^pnpm@\d+\.\d+\.\d+(?:\+.+)?$/.test(manifest.packageManager ?? "")) {
    issues.push({
      code: "PACKAGE_MANAGER_UNPINNED",
      message: "packageManager must pin an exact pnpm version.",
    });
  }
  const lock = path.join(root, "pnpm-lock.yaml");
  if (!fs.existsSync(lock) || fs.statSync(lock).size === 0) {
    issues.push({
      code: "LOCKFILE_MISSING",
      message:
        "pnpm-lock.yaml missing. A frozen installation and a reviewed lockfile are required; do not regenerate it silently.",
    });
  }
  if (!options.beforeInstall) {
    for (const bin of ["turbo", "tsc", "eslint", "prettier", "playwright"]) {
      if (
        ![bin, `${bin}.cmd`].some((name) =>
          fs.existsSync(path.join(root, "node_modules/.bin", name)),
        )
      ) {
        issues.push({
          code: "LOCAL_TOOL_MISSING",
          message: `Missing local node_modules/.bin/${bin}; a global executable is not a substitute.`,
        });
      }
    }
    if (!fs.existsSync(path.join(root, "node_modules/@cyber-school/lesson-runtime/package.json"))) {
      issues.push({
        code: "WORKSPACE_UNLINKED",
        message: "The root lesson-runtime workspace dependency is not linked.",
      });
    }
  }
  if (options.requireGitBase !== false) {
    try {
      execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: root, stdio: "ignore" });
    } catch {
      issues.push({
        code: "GIT_BASE_MISSING",
        message:
          "No Git commit identifies a recoverable base. Do not claim a completed, validated repository.",
      });
    }
  }
  return issues;
}

export function criteriaDigest(task: Task): string {
  const section =
    /## Critères d'acceptation\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/.exec(task.body)?.[1] ?? "";
  return sha256(
    section
      .replace(/\[[xX ]\]/g, "[ ]")
      .replaceAll("\r\n", "\n")
      .trim(),
  );
}

export function readTasks(root: string): { tasks: Map<string, Task>; issues: Issue[] } {
  const tasks = new Map<string, Task>();
  const issues: Issue[] = [];
  for (const fileName of fs
    .readdirSync(path.join(root, "planning/tasks"))
    .filter((n) => n.endsWith(".md"))
    .sort()) {
    const raw = fs.readFileSync(path.join(root, "planning/tasks", fileName), "utf8");
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
    const field = (name: string): string =>
      new RegExp(`^${name}:\\s*(.*)$`, "m")
        .exec(match?.[1] ?? "")?.[1]
        ?.trim()
        .replace(/^["']|["']$/g, "") ?? "";
    const id = field("id");
    const status = field("status");
    const dependencies = /^\[([^\]]*)\]$/.exec(field("dependsOn"));
    if (
      !match ||
      !/^TASK-\d+$/.test(id) ||
      !["Backlog", "Ready", "In Progress", "Blocked", "Done"].includes(status) ||
      !dependencies
    ) {
      issues.push({ code: "TASK_FORMAT", message: `Invalid task metadata: ${fileName}` });
      continue;
    }
    if (tasks.has(id)) {
      issues.push({ code: "DUPLICATE_TASK", message: `Duplicate task ID ${id}` });
      continue;
    }
    tasks.set(id, {
      id,
      status,
      dependsOn: (dependencies[1] ?? "")
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean),
      body: match[2] ?? "",
      fileName,
      verificationRef: field("verificationRef") || undefined,
    });
  }
  return { tasks, issues };
}

export function validationFile(root: string, reference: string, jsonOnly = false): string {
  if (
    !reference.startsWith("continuity/validation/") ||
    reference.includes("\\") ||
    (jsonOnly && !reference.endsWith(".json"))
  ) {
    throw new Error(
      "Evidence and logs must live under continuity/validation/ (JSON evidence required).",
    );
  }
  const directory = fs.realpathSync(path.join(root, "continuity/validation"));
  if (
    !directory.startsWith(fs.realpathSync(root) + path.sep) ||
    fs.lstatSync(path.join(root, "continuity/validation")).isSymbolicLink()
  )
    throw new Error("Validation directory must stay inside the workspace and cannot be a symlink.");
  const target = fs.realpathSync(path.resolve(root, reference));
  if (!target.startsWith(directory + path.sep))
    throw new Error("Evidence path escapes the validation directory.");
  return target;
}

export function verifyEvidence(
  root: string,
  reference: string | undefined,
  expected: {
    source: Snapshot;
    task?: Task;
  },
): Issue[] {
  const fail = (message: string): Issue[] => [{ code: "INVALID_EVIDENCE", message }];
  if (!reference)
    return fail(
      "A generated verificationRef is required; a checklist or test source is not evidence.",
    );
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(validationFile(root, reference, true), "utf8"));
    if (!raw || typeof raw !== "object") return fail("Malformed evidence object.");
    const evidence = raw as Evidence;
    if (
      !evidence.runId ||
      !Array.isArray(evidence.issues) ||
      evidence.issues.length > 0 ||
      !evidence.environment?.nodeVersion ||
      !evidence.environment.packageManager
    )
      return fail("Incomplete or contradictory validation metadata.");
    if (
      evidence.schemaVersion !== 1 ||
      evidence.status !== "passed" ||
      !Array.isArray(evidence.checks)
    )
      return fail("The generated validation run must have passed.");
    if (!evidence.source?.gitHead || !expected.source.gitHead)
      return fail("A real Git base is required.");
    if (evidence.source.digest !== expected.source.digest)
      return fail("Evidence is stale: source/content/configuration changed after validation.");
    if (evidence.source.gitHead !== expected.source.gitHead) {
      try {
        execFileSync(
          "git",
          ["merge-base", "--is-ancestor", evidence.source.gitHead, expected.source.gitHead],
          { cwd: root, stdio: "ignore" },
        );
      } catch {
        return fail("The tested Git base is not an ancestor of the current revision.");
      }
    }
    if (
      expected.task &&
      (evidence.taskId !== expected.task.id ||
        evidence.criteriaDigest !== criteriaDigest(expected.task))
    )
      return fail("Evidence does not cover this task and its current acceptance criteria.");
    const started = Date.parse(evidence.startedAt);
    const finished = Date.parse(evidence.finishedAt ?? "");
    if (!Number.isFinite(started) || !Number.isFinite(finished) || finished < started)
      return fail("Invalid validation timestamps.");
    if (evidence.checks.length !== REQUIRED_CHECKS.length)
      return fail("Missing, extra or repeated checks.");
    for (const name of REQUIRED_CHECKS) {
      const check = evidence.checks.find((c) => c.name === name);
      if (
        !check ||
        check.exitCode !== 0 ||
        JSON.stringify(check.command) !== JSON.stringify(["corepack", "pnpm", name])
      )
        return fail(`Check ${name} did not run successfully with the required command.`);
      const begin = Date.parse(check.startedAt),
        end = Date.parse(check.finishedAt);
      if (
        !Number.isFinite(begin) ||
        !Number.isFinite(end) ||
        begin < started ||
        end < begin ||
        end > finished
      )
        return fail(`Invalid timestamps for ${name}.`);
      const log = fs.readFileSync(validationFile(root, check.logFile));
      if (log.length === 0 || sha256(log) !== check.logSha256)
        return fail(`Missing, empty or modified log for ${name}.`);
    }
    return [];
  } catch (error) {
    return fail(
      `Cannot verify evidence: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** A committed completion is a historical fact, not certification of today's source. */
export function verifyTaskCompletion(root: string, task: Task, source: Snapshot): Issue[] {
  const current = verifyEvidence(root, task.verificationRef, { source, task });
  if (current.length === 0) return current;
  try {
    if (!source.gitHead || !/^[a-f0-9]{40,64}$/.test(source.gitHead) || !task.verificationRef)
      return current;
    const committed = (relative: string): string =>
      execFileSync("git", ["show", `${source.gitHead}:${relative}`], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 20 * 1024 * 1024,
      }).replaceAll("\r\n", "\n");
    const taskText = committed(`planning/tasks/${task.fileName}`);
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(taskText);
    const field = (name: string): string =>
      new RegExp(`^${name}:\\s*(.*)$`, "m")
        .exec(match?.[1] ?? "")?.[1]
        ?.trim()
        .replace(/^["']|["']$/g, "") ?? "";
    if (
      field("id") !== task.id ||
      field("status") !== "Done" ||
      field("verificationRef") !== task.verificationRef ||
      criteriaDigest({ ...task, body: match?.[2] ?? "" }) !== criteriaDigest(task)
    )
      return current;
    const referencePath = validationFile(root, task.verificationRef, true);
    const raw = fs.readFileSync(referencePath, "utf8");
    if (committed(task.verificationRef) !== raw.replaceAll("\r\n", "\n")) return current;
    const evidence = JSON.parse(raw) as Evidence;
    // Recheck all metadata, task criteria, ancestry, nine checks and log hashes.
    const historical = verifyEvidence(root, task.verificationRef, {
      source: { ...source, digest: evidence.source.digest },
      task,
    });
    if (historical.length) return current;
    for (const check of evidence.checks) {
      const logPath = validationFile(root, check.logFile);
      if (committed(check.logFile) !== fs.readFileSync(logPath, "utf8").replaceAll("\r\n", "\n"))
        return current;
    }
    return [];
  } catch {
    return current;
  }
}

export function validateTasks(root: string, tasks: Map<string, Task>, source: Snapshot): Issue[] {
  const issues: Issue[] = [];
  const visiting = new Set<string>(),
    visited = new Set<string>();
  function visit(id: string): void {
    if (visiting.has(id)) {
      issues.push({ code: "TASK_CYCLE", message: `Task dependency cycle at ${id}` });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const task = tasks.get(id);
    if (task)
      for (const dependency of task.dependsOn) {
        if (!tasks.has(dependency))
          issues.push({ code: "MISSING_TASK", message: `${id} references missing ${dependency}` });
        else visit(dependency);
      }
    visiting.delete(id);
    visited.add(id);
  }
  for (const task of tasks.values()) {
    visit(task.id);
    if (
      ["Ready", "Done"].includes(task.status) &&
      task.dependsOn.some((id) => tasks.get(id)?.status !== "Done")
    )
      issues.push({
        code: "TASK_DEPENDENCY",
        message: `${task.id} cannot be ${task.status} while dependencies are unfinished.`,
      });
    if (task.status === "Done") {
      const acceptance =
        /## Critères d'acceptation\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/.exec(task.body)?.[1] ?? "";
      if (!/- \[[xX]\] /.test(acceptance) || /- \[ \] /.test(task.body))
        issues.push({
          code: "TASK_CRITERIA",
          message: `${task.id}: explicit checked acceptance criteria are required.`,
        });
      issues.push(
        ...verifyTaskCompletion(root, task, source).map((i) => ({
          ...i,
          message: `${task.id}: ${i.message}`,
        })),
      );
    }
  }
  return issues;
}

export function validatePublications(root: string, source: Snapshot): Issue[] {
  const issues: Issue[] = [];
  for (const entry of fs.readdirSync(path.join(root, "lessons"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const lesson = JSON.parse(
      fs.readFileSync(path.join(root, "lessons", entry.name, "lesson.json"), "utf8"),
    ) as {
      status?: string;
      contentRevision?: string;
      review?: {
        status?: string;
        scientificReviewer?: string;
        approvedBy?: string;
        reviewedAt?: string;
        qaEvidenceRef?: string;
      };
    };
    if (lesson.status !== "published") continue;
    const review = lesson.review;
    if (
      !lesson.contentRevision ||
      review?.status !== "approved" ||
      !review.scientificReviewer?.trim() ||
      !review.approvedBy?.trim() ||
      !review.reviewedAt ||
      !Number.isFinite(Date.parse(review.reviewedAt))
    ) {
      issues.push({
        code: "PUBLICATION_REVIEW",
        message: `${entry.name}: publication requires an explicit contentRevision, scientific review, human approvedBy and approved status.`,
      });
    }
    issues.push(
      ...verifyEvidence(root, review?.qaEvidenceRef, { source }).map((i) => ({
        ...i,
        message: `${entry.name}: ${i.message}`,
      })),
    );
  }
  return issues;
}

export function validateContinuity(
  root: string,
  source: Snapshot,
  tasks: Map<string, Task>,
): Issue[] {
  try {
    const state = JSON.parse(fs.readFileSync(path.join(root, "continuity/STATE.json"), "utf8")) as {
      schemaVersion?: number;
      sourceDigest?: string;
      activeTaskId?: string;
      documents?: Record<string, string>;
    };
    if (
      state.schemaVersion !== 1 ||
      state.sourceDigest !== source.digest ||
      !state.activeTaskId ||
      !tasks.has(state.activeTaskId)
    )
      throw new Error("Checkpoint missing, stale, or bound to an unknown task.");
    for (const name of ["CURRENT_STATE.md", "HANDOFF.md"]) {
      if (state.documents?.[name] !== sha256(fs.readFileSync(path.join(root, "continuity", name))))
        throw new Error(`Checkpoint document changed outside the generator: ${name}`);
    }
    return [];
  } catch (error) {
    return [
      {
        code: "STALE_CONTINUITY",
        message: `${error instanceof Error ? error.message : String(error)} Run quality:checkpoint before claiming validation.`,
      },
    ];
  }
}
