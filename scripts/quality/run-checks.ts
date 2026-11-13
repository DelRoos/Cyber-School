import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import {
  REQUIRED_CHECKS,
  criteriaDigest,
  environmentIssues,
  readTasks,
  sha256,
  snapshot,
  type CheckResult,
  type Evidence,
} from "./core.ts";
import { createCheckpoint } from "./checkpoint.ts";

const root = path.resolve(import.meta.dirname, "../..");
const taskIndex = process.argv.indexOf("--task");
const statePath = path.join(root, "continuity/STATE.json");
const activeTask = fs.existsSync(statePath)
  ? (JSON.parse(fs.readFileSync(statePath, "utf8")) as { activeTaskId?: string }).activeTaskId
  : null;
const taskId = taskIndex < 0 ? (activeTask ?? null) : (process.argv[taskIndex + 1] ?? null);
const { tasks, issues: taskIssues } = readTasks(root);
if (taskIssues.length || (taskId && !tasks.has(taskId)))
  throw new Error("Invalid task graph or unknown --task identifier.");
const task = taskId ? tasks.get(taskId) : undefined;
const startedAt = new Date().toISOString();
const runId = `${startedAt.replace(/[:.]/g, "-")}-${crypto.randomUUID()}`;
const directory = path.join(root, "continuity/validation", runId);
fs.mkdirSync(directory, { recursive: true });
const reference = path.relative(root, path.join(directory, "result.json")).replaceAll("\\", "/");
const evidence: Evidence = {
  schemaVersion: 1,
  runId,
  taskId,
  startedAt,
  finishedAt: null,
  status: "running",
  source: snapshot(root),
  criteriaDigest: task ? criteriaDigest(task) : null,
  environment: {
    nodeVersion: process.versions.node,
    platform: process.platform,
    packageManager: (
      JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
        packageManager: string;
      }
    ).packageManager,
  },
  checks: [],
  issues: environmentIssues(root),
};
const write = (): void => {
  const target = path.join(directory, "result.json");
  fs.writeFileSync(target + ".tmp", JSON.stringify(evidence, null, 2) + "\n");
  fs.renameSync(target + ".tmp", target);
};
write();

async function runCheck(name: string): Promise<CheckResult> {
  if (!REQUIRED_CHECKS.some((check) => check === name))
    throw new Error("Command is not allowlisted.");
  const begin = new Date().toISOString();
  const target = path.join(directory, `${name.replaceAll(":", "-")}.txt`);
  const fd = fs.openSync(target, "wx");
  fs.writeSync(fd, `Command: corepack pnpm ${name}\nStarted: ${begin}\n\n`);
  const windows = process.platform === "win32";
  const command = windows ? (process.env.ComSpec ?? "cmd.exe") : "corepack";
  // Only static allowlisted script names enter this command; user arguments never enter a shell.
  const args = windows ? ["/d", "/s", "/c", `corepack pnpm ${name}`] : ["pnpm", name];
  let exitCode: number | null = null;
  try {
    exitCode = await new Promise<number | null>((resolve) => {
      const child = spawn(command, args, {
        cwd: root,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        timeout: 15 * 60_000,
      });
      for (const stream of [child.stdout, child.stderr])
        stream?.on("data", (chunk: Buffer) => {
          fs.writeSync(fd, chunk);
          process.stdout.write(chunk);
        });
      child.on("error", (error) => {
        fs.writeSync(fd, `\nSpawn error: ${error.message}\n`);
      });
      child.on("close", (code) => resolve(code));
    });
  } finally {
    fs.closeSync(fd);
  }
  return {
    name,
    command: ["corepack", "pnpm", name],
    exitCode,
    startedAt: begin,
    finishedAt: new Date().toISOString(),
    logFile: path.relative(root, target).replaceAll("\\", "/"),
    logSha256: sha256(fs.readFileSync(target)),
  };
}

try {
  if (task)
    createCheckpoint(root, {
      taskId: task.id,
      nextAction: "Validation en cours ; attendre le résultat enregistré avant de conclure.",
    });
  if (evidence.issues.length === 0) {
    for (const name of REQUIRED_CHECKS) {
      console.log(`\nRunning ${name}`);
      const result = await runCheck(name);
      evidence.checks.push(result);
      write();
      if (result.exitCode !== 0) {
        evidence.issues.push({
          code: "CHECK_FAILED",
          message: `${name} failed with exit code ${result.exitCode}.`,
        });
        break;
      }
    }
  }
} catch (error) {
  evidence.issues.push({
    code: "RUNNER_FAILED",
    message: error instanceof Error ? error.message : String(error),
  });
} finally {
  if (snapshot(root).digest !== evidence.source.digest)
    evidence.issues.push({
      code: "SOURCE_CHANGED",
      message: "Source changed while checks ran; all evidence is invalidated.",
    });
  evidence.finishedAt = new Date().toISOString();
  evidence.status =
    evidence.issues.length === 0 && evidence.checks.length === REQUIRED_CHECKS.length
      ? "passed"
      : "failed";
  write();
  if (task)
    createCheckpoint(root, {
      taskId: task.id,
      validationRef: reference,
      nextAction:
        evidence.status === "passed"
          ? "Faire relire les critères et la preuve générée avant toute clôture ou publication."
          : "Résoudre les blocages et échecs du rapport, puis relancer quality:verify ; garder la tâche ouverte.",
    });
  console.log(`\nValidation ${evidence.status}: ${reference}`);
  for (const issue of evidence.issues) console.error(`[${issue.code}] ${issue.message}`);
  process.exitCode = evidence.status === "passed" ? 0 : 1;
}
