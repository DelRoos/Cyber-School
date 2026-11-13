import path from "node:path";
import { environmentIssues } from "./core.ts";

const root = path.resolve(import.meta.dirname, "../..");
const issues = environmentIssues(root, {
  beforeInstall: process.argv.includes("--before-install"),
});
if (issues.length) {
  for (const issue of issues) console.error(`[${issue.code}] ${issue.message}`);
  process.exitCode = 1;
} else
  console.log(
    "Environment verified: supported Node, pinned package manager, lockfile, Git base and local tools.",
  );
