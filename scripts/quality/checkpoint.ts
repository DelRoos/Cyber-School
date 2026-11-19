import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  environmentIssues,
  readTasks,
  sha256,
  snapshot,
  validationFile,
  verifyEvidence,
  type Evidence,
} from "./core.ts";

export function createCheckpoint(
  root: string,
  options: {
    taskId: string;
    nextAction: string;
    validationRef?: string;
  },
): void {
  const { tasks } = readTasks(root);
  const task = tasks.get(options.taskId);
  if (!task) throw new Error(`Unknown active task: ${options.taskId}`);
  const source = snapshot(root);
  const issues = environmentIssues(root);
  let validation: { reference: string; status: string } | null = null;
  if (options.validationRef) {
    const target = validationFile(root, options.validationRef, true);
    const evidence = JSON.parse(fs.readFileSync(target, "utf8")) as Evidence;
    let status: string = evidence.source?.digest === source.digest ? evidence.status : "stale";
    if (status === "passed" && verifyEvidence(root, options.validationRef, { source, task }).length)
      status = "invalid";
    if (!["passed", "failed", "running", "stale", "invalid"].includes(status)) status = "invalid";
    validation = {
      reference: options.validationRef,
      status,
    };
  }
  const timestamp = new Date().toISOString();
  const validationLine = validation
    ? `${validation.status} — [rapport](${path.relative(path.join(root, "continuity"), path.resolve(root, validation.reference)).replaceAll("\\", "/")})`
    : "Non exécutée pour cette empreinte ; aucun succès présumé.";
  const current = `# État courant du projet\n\nCheckpoint généré par quality:checkpoint ; ne pas modifier ce fichier à la main.\n\n- Mise à jour UTC : ${timestamp}\n- Tâche active : ${task.id} (${task.status})\n- Base Git : ${source.gitHead ?? "AUCUN COMMIT — base non récupérable par Git"}\n- Empreinte du code/contenu/configuration : ${source.digest}\n- Fichiers contrôlés : ${source.fileCount}\n- Dernière validation : ${validationLine}\n\n## Prochaine action\n\n${options.nextAction}\n\n## Blocages observés automatiquement\n\n${issues.length ? issues.map((i) => `- ${i.code} : ${i.message}`).join("\n") : "Aucun blocage d'environnement détecté ; cela ne signifie pas que les tests ont passé."}\n\n## Reprise\n\nLire [STATE.json](STATE.json), [HANDOFF.md](HANDOFF.md), [BLOCKERS.md](BLOCKERS.md) et [le protocole](RESUME_PROTOCOL.md). Vérifier les leçons actives dans lessons/ et consulter les audits pour les prototypes retirés.\n`;
  const handoff = `# Relais actif\n\nGénéré le ${timestamp} (UTC).\n\n- Tâche : ${task.id} (${task.status})\n- Empreinte testable : ${source.digest}\n- Résultat enregistré : ${validationLine}\n\n## Reprise immédiate\n\n${options.nextAction}\n\n1. Lire [STATE.json](STATE.json), [CURRENT_STATE.md](CURRENT_STATE.md) et [BLOCKERS.md](BLOCKERS.md).\n2. Exécuter le diagnostic d'environnement ; ne pas installer ni créer un lockfile sans l'autorisation requise.\n3. Après correction autorisée de l'environnement, lancer quality:verify avec la tâche active.\n4. Garder les tâches ouvertes et les leçons in-review tant qu'une preuve complète et une revue réelle manquent.\n`;
  const dir = path.join(root, "continuity");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "CURRENT_STATE.md"), current);
  fs.writeFileSync(path.join(dir, "HANDOFF.md"), handoff);
  fs.writeFileSync(
    path.join(dir, "STATE.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        updatedAt: timestamp,
        activeTaskId: task.id,
        sourceDigest: source.digest,
        gitHead: source.gitHead,
        nextAction: options.nextAction,
        validation,
        blockers: issues.map((i) => i.code),
        documents: { "CURRENT_STATE.md": sha256(current), "HANDOFF.md": sha256(handoff) },
      },
      null,
      2,
    ) + "\n",
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const value = (name: string): string | undefined => {
    const index = process.argv.indexOf(name);
    return index < 0 ? undefined : process.argv[index + 1];
  };
  const taskId = value("--task"),
    nextAction = value("--next");
  if (!taskId || !nextAction)
    throw new Error('Usage: quality:checkpoint --task TASK-008 --next "Exact next action"');
  createCheckpoint(path.resolve(import.meta.dirname, "../.."), {
    taskId,
    nextAction,
    validationRef: value("--validation"),
  });
  console.log("Checkpoint and handoff regenerated from the current repository state.");
}
