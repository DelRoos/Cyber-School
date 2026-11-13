import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateCurriculumIntegrity } from "@cyber-school/lesson-runtime";
import { findRepoRoot, loadAcademyData } from "../curriculum-data.js";

const rootDir = findRepoRoot();

describe("Repository curriculum and lesson manifests", () => {
  it("loads all catalogs and lessons dynamically and passes integrity validation", () => {
    const { curriculum, resources, lessons, featuredLesson } = loadAcademyData();
    const report = validateCurriculumIntegrity(curriculum, resources, lessons);
    expect(report.valid).toBe(true);
    expect(report.issues).toEqual([]);
    expect(featuredLesson).toBeDefined();
    expect(featuredLesson?.status).toBe("in-review");
    expect(featuredLesson?.exercises.length).toBeGreaterThanOrEqual(4);
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

      const customLesson = JSON.parse(
        fs.readFileSync(path.join(rootDir, "lessons/tcp-three-way-handshake/lesson.json"), "utf8"),
      );
      customLesson.id = "lesson-tls-record";
      customLesson.slug = "tls-record-layer";
      customLesson.conceptId = "tls-record-layer";
      customLesson.title = "Couche d'enregistrement TLS";
      customLesson.exercises = customLesson.exercises.map((ex: Record<string, unknown>) => ({
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
      fs.copyFileSync(
        path.join(rootDir, "lessons/tcp-three-way-handshake/lesson.json"),
        path.join(tmpDir, "lessons/tcp-three-way-handshake/lesson.json"),
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
