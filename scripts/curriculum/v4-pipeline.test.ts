import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import { V4ProductionRegistrySchema, verifyUnitCoverage } from "@cyber-school/lesson-runtime";
import { runV4Import } from "./v4-import.ts";
import { generateMissionBriefs } from "./v4-mission.ts";
import { V4_SOURCE_FILENAME } from "./v4-parser.ts";
import { computePlanSummary, loadV4PlanningState } from "./v4-plan.ts";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("v4 importer extracts 54 modules, 1122 micro-lessons, 772 competencies, 9 exams idempotently and preserves registry state", () => {
  const tmpRoot = mkdtempSync(path.join(os.tmpdir(), "cyber-school-v4-test-"));
  tempDirs.push(tmpRoot);
  copyFileSync(path.join(REPO_ROOT, V4_SOURCE_FILENAME), path.join(tmpRoot, V4_SOURCE_FILENAME));

  const first = runV4Import(tmpRoot);
  assert.equal(first.modules, 54);
  assert.equal(first.microLessons, 1122);
  assert.equal(first.competencies, 772);
  assert.equal(first.exams, 9);
  assert.equal(first.coverageValid, true);

  const importedBefore = readFileSync(
    path.join(tmpRoot, "curriculum/v4/imported-curriculum.json"),
    "utf8",
  );
  const unitsBefore = readFileSync(path.join(tmpRoot, "production/units.json"), "utf8");
  const registryBefore = readFileSync(path.join(tmpRoot, "production/registry.json"), "utf8");

  const second = runV4Import(tmpRoot);
  assert.deepEqual(second, first);

  assert.equal(
    readFileSync(path.join(tmpRoot, "curriculum/v4/imported-curriculum.json"), "utf8"),
    importedBefore,
  );
  assert.equal(readFileSync(path.join(tmpRoot, "production/units.json"), "utf8"), unitsBefore);
  assert.equal(
    readFileSync(path.join(tmpRoot, "production/registry.json"), "utf8"),
    registryBefore,
  );

  // Verify coverage and root eligibility on TC-00
  const state = loadV4PlanningState(tmpRoot);
  assert.equal(verifyUnitCoverage(state.imported, state.units).valid, true);
  const plan = computePlanSummary(state.imported, state.units, state.registry, 3);
  assert.deepEqual(
    plan.eligibleNextUnits.map((u) => u.unitId),
    [
      "unit-tc00-observation-hypotheses",
      "unit-tc00-uncertainty-errors",
      "unit-tc00-evidence-calibration",
    ],
  );

  // Mutate a registry record and re-import -> state and deliverables must be preserved
  const regParsed = V4ProductionRegistrySchema.parse(JSON.parse(registryBefore));
  const target = regParsed.records.find((r) => r.unitId === "unit-tc00-observation-hypotheses");
  assert.ok(target);
  target.state = "conception_en_cours";
  target.taskIds = ["TASK-018"];
  target.deliverables.scientific_sheet = {
    status: "ready",
    artifactPath: "docs/courses/scientific-reasoning-and-proof/COURSE_DOSSIER.md",
  };
  writeFileSync(
    path.join(tmpRoot, "production/registry.json"),
    `${JSON.stringify(regParsed, null, 2)}\n`,
    "utf8",
  );

  runV4Import(tmpRoot);
  const afterState = loadV4PlanningState(tmpRoot);
  const preserved = afterState.registry.records.find(
    (r) => r.unitId === "unit-tc00-observation-hypotheses",
  );
  assert.equal(preserved?.state, "conception_en_cours");
  assert.deepEqual(preserved?.taskIds, ["TASK-018"]);
  assert.equal(preserved?.deliverables.scientific_sheet.status, "ready");

  const mission = generateMissionBriefs(["unit-tc00-observation-hypotheses"], tmpRoot);
  assert.equal(mission.briefs.length, 1);
  assert.equal(mission.briefs[0]?.microLessons.length, 8);
});
