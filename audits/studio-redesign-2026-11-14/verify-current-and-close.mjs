import fs from "node:fs"; import path from "node:path";
import { snapshot, readTasks, verifyEvidence } from "../../scripts/quality/core.ts";
const root=process.cwd(); const reference="continuity/validation/2026-11-14T07-57-03-993Z-71232365-087a-4f2a-9205-068a06fd10a4/result.json";
const task=readTasks(root).tasks.get("TASK-015"); if(!task) throw new Error("Missing task");
const source=snapshot(root);const issues=verifyEvidence(root,reference,{source,task});
if(issues.length) throw new Error(JSON.stringify(issues));
console.log("All nine recorded checks still match the current source and acceptance criteria:",source.digest);
const file=path.join(root,"planning/tasks",task.fileName);
fs.writeFileSync(file,fs.readFileSync(file,"utf8").replace("status: In Progress","status: Done").replaceAll("- [ ]","- [x]"));
const backlog=path.join(root,"planning/backlog/BACKLOG.md");
fs.writeFileSync(backlog,fs.readFileSync(backlog,"utf8").split("\n").map(line=>line.includes("`TASK-015`")?line.replace("`In Progress`","`Done`"):line).join("\n"));

