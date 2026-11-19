import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  compileMdxCourse,
  lintCompiledCourse,
  type CourseQualityReport,
} from "@cyber-school/lesson-runtime";

const rootDir = path.resolve(import.meta.dirname, "../..");

function parseArgs(argv: string[]) {
  let slug: string | null = null;
  let all = false;
  let checkOnly = false;
  let lintOnly = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--slug" && argv[i + 1]) {
      slug = argv[i + 1]!;
      i += 1;
    } else if (arg === "--all") {
      all = true;
    } else if (arg === "--check") {
      checkOnly = true;
    } else if (arg === "--lint-only") {
      lintOnly = true;
    }
  }
  return { slug, all, checkOnly, lintOnly };
}

function discoverMdxCourseSlugs(): string[] {
  const lessonsDir = path.join(rootDir, "lessons");
  if (!fs.existsSync(lessonsDir)) return [];
  return fs
    .readdirSync(lessonsDir, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isDirectory()) return false;
      const dir = path.join(lessonsDir, entry.name);
      return (
        fs.existsSync(path.join(dir, "meta.yaml")) &&
        fs.existsSync(path.join(dir, "course.mdx")) &&
        fs.existsSync(path.join(dir, "exercises.yaml"))
      );
    })
    .map((entry) => entry.name)
    .sort();
}

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2) + "\n";
}

function printReport(report: CourseQualityReport) {
  const statusTag = report.passed ? "PASS" : "FAIL";
  console.log(`\n[${statusTag}] ${report.slug} — Score qualité : ${report.score}/100`);
  console.log(
    `  Audio/Sync: ${report.breakdown.audioSync}/25 | Éditorial: ${report.breakdown.editorial}/20 | Pédagogie: ${report.breakdown.pedagogy}/30 | Rigueur: ${report.breakdown.rigor}/25`,
  );
  console.log(
    `  Volume : ${report.stats.chapters} chapitres · ${report.stats.scenes} scènes · ~${report.stats.estimatedAudioMinutes} min audio (${report.stats.totalAudioWords} mots) · ${report.stats.exercises} exercices · ${report.stats.microChecks} micro-vérifs · ${report.stats.workedExamples} exemples résolus`,
  );
  if (report.issues.length > 0) {
    for (const issue of report.issues) {
      console.log(`  - [${issue.severity.toUpperCase()}][${issue.code}] ${issue.message}`);
    }
  } else {
    console.log("  Aucune anomalie détectée.");
  }
}

export function compileCourseDirectory(
  slug: string,
  options: { checkOnly?: boolean; lintOnly?: boolean } = {},
): { report: CourseQualityReport; staleFiles: string[] } {
  const dir = path.join(rootDir, "lessons", slug);
  const metaPath = path.join(dir, "meta.yaml");
  const mdxPath = path.join(dir, "course.mdx");
  const exPath = path.join(dir, "exercises.yaml");

  for (const required of [metaPath, mdxPath, exPath]) {
    if (!fs.existsSync(required)) {
      throw new Error(`Missing required course source file: ${path.relative(rootDir, required)}`);
    }
  }

  const compiled = compileMdxCourse({
    metaYaml: fs.readFileSync(metaPath, "utf8"),
    courseMdx: fs.readFileSync(mdxPath, "utf8"),
    exercisesYaml: fs.readFileSync(exPath, "utf8"),
  });

  const report = lintCompiledCourse(compiled);

  const outputs: Array<{ file: string; content: string }> = [
    { file: path.join(dir, "lesson.json"), content: formatJson(compiled.lesson) },
    { file: path.join(dir, "course.page.json"), content: formatJson(compiled.page) },
    {
      file: path.join(dir, "lesson-audio-scripts.json"),
      content: formatJson(compiled.audioScripts),
    },
  ];

  const staleFiles: string[] = [];
  for (const out of outputs) {
    if (options.lintOnly) continue;
    if (options.checkOnly) {
      let matches = false;
      if (fs.existsSync(out.file)) {
        try {
          const currentParsed = JSON.parse(fs.readFileSync(out.file, "utf8"));
          const expectedParsed = JSON.parse(out.content);
          matches = JSON.stringify(currentParsed) === JSON.stringify(expectedParsed);
        } catch {
          matches = false;
        }
      }
      if (!matches) {
        staleFiles.push(path.relative(rootDir, out.file));
      }
    } else {
      fs.writeFileSync(out.file, out.content, "utf8");
    }
  }

  return { report, staleFiles };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const slugs = args.slug ? [args.slug] : discoverMdxCourseSlugs();

  if (slugs.length === 0) {
    console.log("Aucun cours MDX+YAML trouvé sous lessons/.");
    return;
  }

  let hasFailure = false;
  for (const slug of slugs) {
    const { report, staleFiles } = compileCourseDirectory(slug, {
      checkOnly: args.checkOnly,
      lintOnly: args.lintOnly,
    });
    printReport(report);
    if (!report.passed) {
      hasFailure = true;
    }
    if (staleFiles.length > 0) {
      hasFailure = true;
      console.error(
        `  [STALE] Artefacts compilés non synchronisés avec MDX+YAML : ${staleFiles.join(", ")}. Lancez : corepack pnpm course:compile -- --slug ${slug}`,
      );
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
