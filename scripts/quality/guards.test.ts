import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  REQUIRED_CHECKS,
  criteriaDigest,
  environmentIssues,
  readTasks,
  sha256,
  snapshot,
  validateContinuity,
  validatePublications,
  validateTasks,
  verifyEvidence,
  verifyTaskCompletion,
  type Evidence,
  type Snapshot,
  type Task,
} from "./core.ts";
import { createCheckpoint } from "./checkpoint.ts";

const temporaryRoots: string[] = [];
afterEach(() => {
  const prefix = path.resolve(os.tmpdir()) + path.sep + "cyber-school-guards-";
  for (const root of temporaryRoots.splice(0)) {
    assert.ok(
      path.resolve(root).startsWith(prefix),
      "Refuse cleanup outside the test fixture directory",
    );
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cyber-school-guards-"));
  temporaryRoots.push(root);
  for (const name of ["planning/tasks", "lessons/example", "continuity/validation"])
    fs.mkdirSync(path.join(root, name), { recursive: true });
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ packageManager: "pnpm@10.28.0" }),
  );
  fs.writeFileSync(path.join(root, "source.ts"), "export const answer = 42;\n");
  fs.writeFileSync(
    path.join(root, "lessons/example/lesson.json"),
    JSON.stringify({ status: "in-review", contentRevision: "1.0.0", title: "Fixture only" }),
  );
  fs.writeFileSync(
    path.join(root, "planning/tasks/example.md"),
    "---\nid: TASK-999\nstatus: In Progress\ndependsOn: []\n---\n## Critères d'acceptation\n- [x] Reject invalid evidence\n",
  );
  const task = readTasks(root).tasks.get("TASK-999")!;
  // A synthetic Git base exists only in temporary fixtures, never in project evidence.
  const source: Snapshot = { ...snapshot(root), gitHead: "f".repeat(40) };
  const evidence: Evidence = {
    schemaVersion: 1,
    runId: "fixture",
    taskId: task.id,
    status: "passed",
    startedAt: "2026-11-13T12:00:00.000Z",
    finishedAt: "2026-11-13T12:01:00.000Z",
    source,
    criteriaDigest: criteriaDigest(task),
    issues: [],
    environment: { nodeVersion: "22.12.0", platform: "fixture", packageManager: "pnpm@10.28.0" },
    checks: REQUIRED_CHECKS.map((name) => {
      const logFile = `continuity/validation/${name.replaceAll(":", "-")}.txt`;
      const log = `Fixture output for ${name}\n`;
      fs.writeFileSync(path.join(root, logFile), log);
      return {
        name,
        command: ["corepack", "pnpm", name],
        exitCode: 0,
        startedAt: "2026-11-13T12:00:01.000Z",
        finishedAt: "2026-11-13T12:00:02.000Z",
        logFile,
        logSha256: sha256(log),
      };
    }),
  };
  const reference = "continuity/validation/result.json";
  const save = () => fs.writeFileSync(path.join(root, reference), JSON.stringify(evidence));
  save();
  return { root, task, source, evidence, reference, save };
}

test("accepts complete matching evidence with all actual result fields", () => {
  const f = fixture();
  assert.deepEqual(verifyEvidence(f.root, f.reference, { source: f.source, task: f.task }), []);
});

function committedCompletion() {
  const f = fixture();
  const git = (...args: string[]) => execFileSync("git", args, { cwd: f.root, stdio: "ignore" });
  const commit = () => {
    git("add", ".");
    git(
      "-c",
      "user.name=QA Fixture",
      "-c",
      "user.email=qa@example.invalid",
      "-c",
      "core.autocrlf=false",
      "commit",
      "-m",
      "QA fixture",
    );
  };
  git("init");
  commit();
  f.evidence.source = snapshot(f.root);
  f.task.status = "Done";
  f.task.verificationRef = f.reference;
  fs.writeFileSync(
    path.join(f.root, "planning/tasks/example.md"),
    `---\nid: TASK-999\nstatus: Done\ndependsOn: []\nverificationRef: ${f.reference}\n---\n${f.task.body}`,
  );
  f.save();
  commit();
  fs.appendFileSync(path.join(f.root, "source.ts"), "export const nextFeature = true;\n");
  return { ...f, current: snapshot(f.root) };
}

test("committed completion survives later work but never certifies current sources", () => {
  const f = committedCompletion();
  assert.deepEqual(verifyTaskCompletion(f.root, f.task, f.current), []);
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.current, task: f.task }).length);
});

test("historical completion rejects modified criteria", () => {
  const f = committedCompletion();
  f.task.body += "\n- [x] An additional requirement\n";
  assert.ok(verifyTaskCompletion(f.root, f.task, f.current).length);
});

test("historical completion rejects altered logs or evidence", () => {
  const f = committedCompletion();
  const log = f.evidence.checks[0]!;
  fs.appendFileSync(path.join(f.root, log.logFile), "changed");
  // Even a matching replacement hash cannot rewrite the committed history.
  log.logSha256 = sha256(fs.readFileSync(path.join(f.root, log.logFile)));
  f.save();
  assert.ok(verifyTaskCompletion(f.root, f.task, f.current).length);
});

test("a newly claimed completion cannot reuse a stale committed report", () => {
  const f = committedCompletion();
  f.task.fileName = "uncommitted-task.md";
  assert.ok(verifyTaskCompletion(f.root, f.task, f.current).length);
});

for (const status of ["failed", "running"] as const)
  test(`rejects a ${status} validation run`, () => {
    const f = fixture();
    f.evidence.status = status;
    f.save();
    assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
  });

test("rejects a checklist, a test source or a missing report as evidence", () => {
  const f = fixture();
  for (const reference of [
    undefined,
    "tests/e2e/example.spec.ts",
    "continuity/validation/missing.json",
  ]) {
    assert.ok(verifyEvidence(f.root, reference, { source: f.source }).length);
  }
});

test("rejects a skipped, failed or missing command", () => {
  const f = fixture();
  f.evidence.checks[0]!.exitCode = 1;
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
  f.evidence.checks[0]!.exitCode = null;
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
  f.evidence.checks.pop();
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
});

test("rejects substituted commands even when their exit code is zero", () => {
  const f = fixture();
  f.evidence.checks[0]!.command = ["echo", "passed"];
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
});

test("rejects repeated checks replacing an unexecuted check", () => {
  const f = fixture();
  f.evidence.checks[1] = { ...f.evidence.checks[0]! };
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
});

test("rejects evidence after code or content changes", () => {
  const f = fixture();
  fs.appendFileSync(path.join(f.root, "source.ts"), "export const changed = true;");
  assert.ok(
    verifyEvidence(f.root, f.reference, {
      source: { ...snapshot(f.root), gitHead: f.source.gitHead },
    }).length,
  );
});

test("requires a recoverable Git base", () => {
  const f = fixture();
  assert.ok(verifyEvidence(f.root, f.reference, { source: { ...f.source, gitHead: null } }).length);
});

test("binds evidence to the task ID and its acceptance criteria", () => {
  const f = fixture();
  assert.ok(
    verifyEvidence(f.root, f.reference, { source: f.source, task: { ...f.task, id: "TASK-998" } })
      .length,
  );
  assert.ok(
    verifyEvidence(f.root, f.reference, {
      source: f.source,
      task: { ...f.task, body: f.task.body + "- [x] A new requirement\n" },
    }).length,
  );
  assert.equal(
    criteriaDigest(f.task),
    criteriaDigest({ ...f.task, body: f.task.body.replace("[x]", "[ ]") }),
  );
});

test("rejects missing, modified and empty logs", () => {
  const f = fixture();
  const log = path.join(f.root, f.evidence.checks[0]!.logFile);
  fs.writeFileSync(log, "altered");
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
  fs.writeFileSync(log, "");
  f.evidence.checks[0]!.logSha256 = sha256("");
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
  fs.unlinkSync(log);
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
});

test("rejects traversal outside the validation directory", () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.root, "outside.json"), JSON.stringify(f.evidence));
  assert.ok(
    verifyEvidence(f.root, "continuity/validation/../../outside.json", { source: f.source }).length,
  );
});

test("rejects malformed reports and impossible timestamps", () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.root, f.reference), "{}");
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
  f.evidence.checks[0]!.finishedAt = "invalid";
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
});

test("Done with all checkboxes and a decorative evidence heading still fails", () => {
  const f = fixture();
  const task = {
    ...f.task,
    status: "Done",
    body: f.task.body + "\n## Vérifications\nNo command was executed.\n",
  };
  assert.ok(
    validateTasks(f.root, new Map([[task.id, task]]), f.source).some(
      (i) => i.code === "INVALID_EVIDENCE",
    ),
  );
});

test("Done with genuine matching fixture evidence passes, unchecked criteria do not", () => {
  const f = fixture();
  const task = { ...f.task, status: "Done", verificationRef: f.reference };
  assert.deepEqual(validateTasks(f.root, new Map([[task.id, task]]), f.source), []);
  task.body = task.body.replace("[x]", "[ ]");
  assert.ok(
    validateTasks(f.root, new Map([[task.id, task]]), f.source).some(
      (i) => i.code === "TASK_CRITERIA",
    ),
  );
});

test("Ready and Done cannot bypass unfinished dependencies", () => {
  const f = fixture();
  for (const status of ["Ready", "Done"]) {
    const child: Task = { ...f.task, id: "TASK-998", status, dependsOn: [f.task.id] };
    assert.ok(
      validateTasks(
        f.root,
        new Map([
          [f.task.id, f.task],
          [child.id, child],
        ]),
        f.source,
      ).some((i) => i.code === "TASK_DEPENDENCY"),
    );
  }
});

test("missing dependencies and cycles are rejected even in Backlog", () => {
  const f = fixture();
  const a = { ...f.task, status: "Backlog", dependsOn: ["TASK-998"] };
  assert.ok(
    validateTasks(f.root, new Map([[a.id, a]]), f.source).some((i) => i.code === "MISSING_TASK"),
  );
  const b = { ...a, id: "TASK-998", dependsOn: [a.id] };
  assert.ok(
    validateTasks(
      f.root,
      new Map([
        [a.id, a],
        [b.id, b],
      ]),
      f.source,
    ).some((i) => i.code === "TASK_CYCLE"),
  );
});

test("duplicate task IDs are rejected instead of silently overwritten", () => {
  const f = fixture();
  fs.copyFileSync(
    path.join(f.root, "planning/tasks/example.md"),
    path.join(f.root, "planning/tasks/duplicate.md"),
  );
  assert.ok(readTasks(f.root).issues.some((i) => i.code === "DUPLICATE_TASK"));
});

test("publication without a real approval and generated QA evidence is refused", () => {
  const f = fixture();
  fs.writeFileSync(
    path.join(f.root, "lessons/example/lesson.json"),
    JSON.stringify({ status: "published", contentRevision: "1.0.0" }),
  );
  const issues = validatePublications(f.root, f.source);
  assert.ok(issues.some((i) => i.code === "PUBLICATION_REVIEW"));
  assert.ok(issues.some((i) => i.code === "INVALID_EVIDENCE"));
});

test("pending content remains authorable, approved publication requires passing evidence", () => {
  const f = fixture();
  assert.deepEqual(validatePublications(f.root, f.source), []);
  fs.writeFileSync(
    path.join(f.root, "lessons/example/lesson.json"),
    JSON.stringify({
      status: "published",
      contentRevision: "1.0.0",
      title: "Fixture only",
      review: {
        status: "approved",
        scientificReviewer: "Fixture reviewer",
        approvedBy: "Fixture human",
        reviewedAt: "2026-11-13",
        qaEvidenceRef: f.reference,
      },
    }),
  );
  assert.deepEqual(validatePublications(f.root, f.source), []);
  f.evidence.status = "failed";
  f.save();
  assert.ok(validatePublications(f.root, f.source).length);
});

test("administrative promotion does not stale QA, but changing scientific content does", () => {
  const f = fixture();
  const before = snapshot(f.root).digest;
  const file = path.join(f.root, "lessons/example/lesson.json");
  fs.writeFileSync(
    file,
    JSON.stringify({
      status: "published",
      review: { status: "approved" },
      contentRevision: "1.0.0",
      title: "Fixture only",
    }),
  );
  assert.equal(snapshot(f.root).digest, before);
  fs.writeFileSync(
    file,
    JSON.stringify({
      status: "published",
      contentRevision: "1.0.1",
      title: "Changed scientific content",
    }),
  );
  assert.notEqual(snapshot(f.root).digest, before);
});

test("preflight refuses Node 23, a missing lockfile and global tool fallbacks", () => {
  const f = fixture();
  const issues = environmentIssues(f.root, { nodeVersion: "23.9.0", requireGitBase: false });
  for (const code of [
    "NODE_UNSUPPORTED",
    "LOCKFILE_MISSING",
    "LOCAL_TOOL_MISSING",
    "WORKSPACE_UNLINKED",
  ])
    assert.ok(issues.some((i) => i.code === code));
});

test("before-install preflight accepts supported Node with a pinned manager and lockfile", () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  for (const nodeVersion of ["22.12.0", "24.0.0", "26.0.0"])
    assert.deepEqual(
      environmentIssues(f.root, { beforeInstall: true, nodeVersion, requireGitBase: false }),
      [],
    );
  assert.ok(
    environmentIssues(f.root, {
      beforeInstall: true,
      nodeVersion: "22.11.0",
      requireGitBase: false,
    }).length,
  );
});

test("generated checkpoints become stale on code changes or manual handoff edits", () => {
  const f = fixture();
  const tasks = readTasks(f.root).tasks;
  assert.ok(validateContinuity(f.root, snapshot(f.root), tasks).length);
  createCheckpoint(f.root, { taskId: f.task.id, nextAction: "Run the fixture checks" });
  assert.deepEqual(validateContinuity(f.root, snapshot(f.root), tasks), []);
  fs.appendFileSync(path.join(f.root, "continuity/HANDOFF.md"), "Unverified manual claim");
  assert.ok(validateContinuity(f.root, snapshot(f.root), tasks).length);
  createCheckpoint(f.root, { taskId: f.task.id, nextAction: "Run the fixture checks" });
  fs.appendFileSync(path.join(f.root, "source.ts"), "// changed");
  assert.ok(validateContinuity(f.root, snapshot(f.root), tasks).length);
});

test("a passed label with recorded errors is not accepted as validation", () => {
  const f = fixture();
  f.evidence.issues.push({ code: "CHECK_FAILED", message: "The run really failed" });
  f.save();
  assert.ok(verifyEvidence(f.root, f.reference, { source: f.source }).length);
});

test("checkpoint generation does not promote an invalid report to passed", () => {
  const f = fixture();
  f.evidence.source.gitHead = null;
  f.save();
  createCheckpoint(f.root, { taskId: f.task.id, nextAction: "Fix QA", validationRef: f.reference });
  const state = JSON.parse(fs.readFileSync(path.join(f.root, "continuity/STATE.json"), "utf8")) as {
    validation: { status: string };
  };
  assert.equal(state.validation.status, "invalid");
});
