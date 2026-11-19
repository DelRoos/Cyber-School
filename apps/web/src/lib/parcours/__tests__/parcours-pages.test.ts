import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { findRepoRoot } from "../../curriculum-data";
import { TRANSVERSAL_FAMILIES } from "../parcours-structure";
import {
  listAllParcoursSlugs,
  loadBespokeParcoursPage,
  loadParcoursCatalog,
} from "../parcours-pages";

describe("Bespoke Parcours pages", () => {
  it("keeps all modules and micro-lessons faithful to the supplied V4, without artificial X prerequisites", () => {
    const markdown = readFileSync(
      path.join(
        findRepoRoot(),
        "Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md",
      ),
      "utf8",
    );
    const sourceTitles = new Map(
      [...markdown.matchAll(/^## (X-\d{2}) — (.+)$/gm)].map((match) => [
        match[1],
        match[2]?.trim(),
      ]),
    );
    const sourceMicroLessons = new Map(
      [...markdown.matchAll(/^- \*\*([A-Z]+\d{2}\.\d{3})\*\* — (.+)$/gm)].map((match) => [
        match[1],
        match[2]?.trim().replace(/\s+/g, " ").replace(/\.$/, ""),
      ]),
    );
    const catalog = loadParcoursCatalog();
    expect(catalog.filter((track) => track.slug.startsWith("v4-branche-"))).toHaveLength(4);
    const groupedIds = TRANSVERSAL_FAMILIES.flatMap((family) => [...family.moduleIds]);
    expect(new Set(groupedIds).size).toBe(10);
    expect([...groupedIds].sort()).toEqual([...sourceTitles.keys()].sort());
    let microLessonsCount = 0;
    for (const track of catalog) {
      const { page } = loadBespokeParcoursPage(track.slug);
      for (const node of page?.nodes ?? []) {
        expect(node.microLessons).toHaveLength(node.microLessonsCount);
        microLessonsCount += node.microLessons.length;
        for (const microLesson of node.microLessons)
          expect(microLesson.title).toBe(sourceMicroLessons.get(microLesson.id));
        if (track.slug === "v4-approfondissements") {
          expect(node.title).toBe(sourceTitles.get(node.id));
          expect(node.externalDeps).toEqual([]);
          expect(node.relatedModules.length).toBeGreaterThan(0);
        }
      }
    }
    expect(microLessonsCount).toBe(1122);
    const { page: complements } = loadBespokeParcoursPage("v4-approfondissements");
    expect(complements?.edges).toEqual([]);
    expect(complements?.nodes.find((node) => node.id === "X-09")?.relatedModules[0]?.href).toBe(
      "/parcours/v4-branche-c#noeud-C-12",
    );
    expect(complements?.nodes.find((node) => node.id === "X-10")?.relatedModules[0]?.href).toBe(
      "/parcours/v4-tronc-commun#noeud-TC-05",
    );
  });
  it("catalog availability agrees with the distinct courses in every programme", () => {
    const catalog = loadParcoursCatalog();
    expect(catalog.map((track) => track.slug)).toEqual(listAllParcoursSlugs());
    expect(catalog.reduce((total, track) => total + track.totalModules, 0)).toBe(54);
    for (const track of catalog) {
      const { page } = loadBespokeParcoursPage(track.slug);
      const lessonSlugs = new Set(
        page?.nodes.flatMap((node) =>
          node.chapters.flatMap((chapter) => (chapter.lessonSlug ? [chapter.lessonSlug] : [])),
        ),
      );
      expect(track.openLessonsCount).toBe(lessonSlugs.size);
      expect(track.entryLessonSlug).toBe(lessonSlugs.values().next().value);
      expect(track.totalModules).toBe(page?.nodes.length);
    }
  });
  it("loads all 6 V4 parcours pages without raw unit placeholders", () => {
    const slugs = listAllParcoursSlugs();
    expect(slugs).toEqual([
      "v4-tronc-commun",
      "v4-branche-a",
      "v4-branche-b",
      "v4-branche-c",
      "v4-branche-d",
      "v4-approfondissements",
    ]);

    for (const slug of slugs) {
      const { page, navTabs } = loadBespokeParcoursPage(slug);
      expect(page).toBeDefined();
      expect(navTabs).toHaveLength(6);
      if (!page) continue;

      expect(page.nodes.length).toBeGreaterThan(0);
      expect(page.calibratorQuestions.length).toBeGreaterThan(0);
      expect(page.audio.cues.length).toBeGreaterThan(0);

      const nodeIds = new Set(page.nodes.map((n) => n.id));
      for (const edge of page.edges) {
        expect(nodeIds.has(edge.fromId)).toBe(true);
        expect(nodeIds.has(edge.toId)).toBe(true);
      }

      for (const node of page.nodes) {
        expect(node.chapters.length).toBeGreaterThan(0);
        for (const chapter of node.chapters) {
          expect(chapter.title).not.toMatch(/Unité\s+\d+/i);
          expect(chapter.title).not.toMatch(/^\[/);
          expect(chapter.microLessonsCount).toBeGreaterThan(0);
        }
      }
    }
  });

  it("reports zero open entry lessons cleanly when no courses are published yet", () => {
    const { page: tronc } = loadBespokeParcoursPage("v4-tronc-commun");
    expect(tronc?.entryLessonSlug).toBeUndefined();
    expect(tronc?.openLessonsCount).toBe(0);

    const { page: brancheA } = loadBespokeParcoursPage("v4-branche-a");
    expect(brancheA?.nodes.length).toBeGreaterThan(0);
    expect(brancheA?.totalMicroLessons).toBeGreaterThan(0);
  });
});
