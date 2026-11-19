import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateCurriculumIntegrity } from "@cyber-school/lesson-runtime";
import { loadCompleteCourseBySlug } from "../course-pages.js";
import { findRepoRoot, loadAcademyData } from "../curriculum-data.js";

const rootDir = findRepoRoot();

function lessonFixture(conceptId: string, slug: string) {
  const mkMcq = (id: string) => ({
    kind: "multiple-choice",
    id,
    conceptId,
    prompt: `Question ${id} pour ${conceptId} ?`,
    explanation: `Explication de l'exercice ${id}.`,
    options: [
      {
        id: "a",
        label: "Réponse exacte",
        feedback: "Exact : cette affirmation s'appuie sur le mécanisme vérifié.",
      },
      {
        id: "b",
        label: "Réponse erronée",
        feedback: "Incorrect : vérifie la condition du protocole.",
      },
    ],
    correctOptionId: "a",
  });

  return {
    version: "1.0",
    contentRevision: "1.0.0",
    id: `lesson-${slug}`,
    slug,
    title: `Leçon ${slug}`,
    conceptId,
    estimatedMinutes: 10,
    medium: "2d-animated",
    mediumJustification:
      "Une animation 2D claire permet de visualiser les états et transitions sans surcharge.",
    status: "in-review",
    steps: [
      {
        id: "step-1",
        title: "État initial",
        summary: "Observer les invariants avant de modifier un paramètre.",
        visualFocus: "overview",
      },
    ],
    exercises: [mkMcq(`${slug}-ex-1`), mkMcq(`${slug}-ex-2`)],
    assessments: [
      {
        id: `${slug}-assess-1`,
        title: "Évaluation de synthèse",
        conceptIds: [conceptId],
        passingScorePercent: 80,
        exerciseIds: [`${slug}-ex-1`, `${slug}-ex-2`],
      },
    ],
    externalLabs: [],
    resourceIds: ["rfc-9293"],
    review: {
      status: "pending",
    },
  };
}

describe("Repository curriculum and lesson manifests", () => {
  it("loads all catalogs dynamically, validates the active pilot lesson, and passes when no active lessons exist", () => {
    const { curriculum, resources, lessons, featuredLesson } = loadAcademyData();
    const report = validateCurriculumIntegrity(curriculum, resources, lessons);
    expect(report.valid).toBe(true);
    expect(report.issues).toEqual([]);
    expect(lessons.map((lesson) => lesson.slug)).toEqual(["observation-et-interpretation"]);
    expect(featuredLesson?.slug).toBe("observation-et-interpretation");

    const bundle = loadCompleteCourseBySlug("observation-et-interpretation");
    expect(bundle?.lesson.id).toBe("lesson-observation-et-interpretation");
    expect(bundle?.page.unitId).toBe("unit-tc00-observation-interpretation");
    expect(loadCompleteCourseBySlug("tcp-three-way-handshake")).toBeUndefined();
    expect(loadCompleteCourseBySlug("program-memory-fundamentals")).toBeUndefined();

    // Also verify empty lessons directory behavior
    const emptyTmp = fs.mkdtempSync(path.join(os.tmpdir(), "cyber-school-empty-"));
    try {
      fs.mkdirSync(path.join(emptyTmp, "resources"));
      fs.mkdirSync(path.join(emptyTmp, "curriculum"));
      fs.copyFileSync(
        path.join(rootDir, "resources/sources.json"),
        path.join(emptyTmp, "resources/sources.json"),
      );
      fs.copyFileSync(
        path.join(rootDir, "curriculum/tc00-logic-proof-research.json"),
        path.join(emptyTmp, "curriculum/tc00-logic-proof-research.json"),
      );
      const emptyLoaded = loadAcademyData(emptyTmp);
      expect(emptyLoaded.lessons).toEqual([]);
      expect(emptyLoaded.featuredLesson).toBeUndefined();
    } finally {
      fs.rmSync(emptyTmp, { recursive: true, force: true });
    }
  });

  it("supports multiple curriculum catalogs and lessons without hardcoding a single slug", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cyber-school-multi-"));
    try {
      fs.mkdirSync(path.join(tmpDir, "resources"));
      fs.mkdirSync(path.join(tmpDir, "curriculum"));
      fs.mkdirSync(path.join(tmpDir, "lessons", "custom-lesson"), {
        recursive: true,
      });

      fs.copyFileSync(
        path.join(rootDir, "resources/sources.json"),
        path.join(tmpDir, "resources/sources.json"),
      );
      fs.copyFileSync(
        path.join(rootDir, "curriculum/networking-foundations.json"),
        path.join(tmpDir, "curriculum/01-networking.json"),
      );

      const secondCatalog = {
        version: "1.0",
        domains: [
          {
            id: "web-security",
            title: "Sécurité Web",
            summary: "Principes fondamentaux de sécurité applicative.",
            modules: [
              {
                id: "http-tls",
                title: "TLS et transport sécurisé",
                summary: "Négociation cryptographique et intégrité.",
                chapters: [
                  {
                    id: "tls-basics",
                    title: "Bases TLS",
                    summary: "Introduction à la couche d'enregistrement TLS.",
                    conceptIds: ["tls-record-layer"],
                  },
                ],
              },
            ],
          },
        ],
        concepts: [
          {
            id: "tls-record-layer",
            title: "Couche d'enregistrement TLS",
            definition: "Encapsulation et protection des messages applicatifs après négociation.",
            prerequisites: ["tcp-three-way-handshake"],
            learningObjectives: ["Relier TCP et TLS"],
            relations: [],
            depthLevel: "foundational",
            resourceIds: ["rfc-9293"],
            validationCriteria: ["Identifier le rôle de la couche d'enregistrement"],
          },
        ],
      };
      fs.writeFileSync(
        path.join(tmpDir, "curriculum/02-security.json"),
        JSON.stringify(secondCatalog),
      );

      const customLesson = lessonFixture("tls-record-layer", "tls-record-layer");
      customLesson.title = "Couche d'enregistrement TLS";
      customLesson.exercises = customLesson.exercises.map((ex) => ({
        ...ex,
        conceptId: "tls-record-layer",
      }));
      fs.writeFileSync(
        path.join(tmpDir, "lessons/custom-lesson/lesson.json"),
        JSON.stringify(customLesson),
      );

      const loaded = loadAcademyData(tmpDir);
      expect(loaded.curriculum.domains).toHaveLength(2);
      expect(loaded.lessons).toHaveLength(1);
      expect(loaded.featuredLesson?.slug).toBe("tls-record-layer");
    } finally {
      if (
        !path
          .resolve(tmpDir)
          .startsWith(path.resolve(os.tmpdir()) + path.sep + "cyber-school-multi-")
      ) {
        throw new Error("Refuse cleanup outside the test fixture directory.");
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("throws when loading a broken curriculum with a prerequisite cycle", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cyber-school-bad-"));
    try {
      fs.mkdirSync(path.join(tmpDir, "resources"));
      fs.mkdirSync(path.join(tmpDir, "curriculum"));
      fs.mkdirSync(path.join(tmpDir, "lessons", "tcp-three-way-handshake"), {
        recursive: true,
      });

      fs.copyFileSync(
        path.join(rootDir, "resources/sources.json"),
        path.join(tmpDir, "resources/sources.json"),
      );
      fs.writeFileSync(
        path.join(tmpDir, "lessons/tcp-three-way-handshake/lesson.json"),
        JSON.stringify(lessonFixture("tcp-three-way-handshake", "tcp-three-way-handshake")),
      );

      const brokenCurriculum = JSON.parse(
        fs.readFileSync(path.join(rootDir, "curriculum/networking-foundations.json"), "utf8"),
      );
      brokenCurriculum.concepts[0].prerequisites = ["tcp-three-way-handshake"];
      fs.writeFileSync(
        path.join(tmpDir, "curriculum/networking-foundations.json"),
        JSON.stringify(brokenCurriculum),
      );

      expect(() => loadAcademyData(tmpDir)).toThrow(/PREREQUISITE_CYCLE/);
    } finally {
      if (
        !path.resolve(tmpDir).startsWith(path.resolve(os.tmpdir()) + path.sep + "cyber-school-bad-")
      ) {
        throw new Error("Refuse cleanup outside the test fixture directory.");
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
