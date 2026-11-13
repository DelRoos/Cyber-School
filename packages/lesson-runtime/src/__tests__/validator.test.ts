import { describe, expect, it } from "vitest";
import {
  CurriculumCatalogSchema,
  LessonManifestSchema,
  ResourceMetadataSchema,
  ResourcesCatalogSchema,
  validateCurriculumIntegrity,
} from "../index.js";

const validResources = ResourcesCatalogSchema.parse({
  version: "1.0",
  resources: [
    {
      id: "rfc-9293",
      title: "RFC 9293: Transmission Control Protocol (TCP)",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc9293",
      publishedYear: 2022,
      trustLevel: "primary-standard",
      untrustedContentNotice: true,
      summary:
        "Norme officielle de référence définissant le protocole TCP et son automate d'états.",
    },
  ],
});

const validCurriculum = CurriculumCatalogSchema.parse({
  version: "1.0",
  domains: [
    {
      id: "networking",
      title: "Réseaux & Protocoles",
      summary: "Comprendre les échanges de données de la couche liaison jusqu'aux applications.",
      modules: [
        {
          id: "transport-layer",
          title: "Couche Transport",
          summary: "Fiabilité, multiplexage et contrôle de flux.",
          chapters: [
            {
              id: "tcp-lifecycle",
              title: "Cycle de vie d'une connexion TCP",
              summary: "Ouverture, transfert et fermeture de session.",
              conceptIds: ["tcp-ports-and-sockets", "tcp-three-way-handshake"],
            },
          ],
        },
      ],
    },
  ],
  concepts: [
    {
      id: "tcp-ports-and-sockets",
      title: "Ports et sockets TCP",
      definition:
        "Mécanisme d'adressage applicatif permettant de multiplexer plusieurs flux sur un hôte.",
      prerequisites: [],
      learningObjectives: ["Distinguer adresse IP et numéro de port TCP"],
      relations: [],
      resourceIds: ["rfc-9293"],
      depthLevel: "foundational",
      validationCriteria: ["Identifier le couple IP:port d'un client et d'un serveur"],
    },
    {
      id: "tcp-three-way-handshake",
      title: "Three-Way Handshake TCP",
      definition:
        "Poignée de main en trois temps (SYN, SYN-ACK, ACK) synchronisant les numéros de séquence initiaux.",
      prerequisites: ["tcp-ports-and-sockets"],
      learningObjectives: ["Expliquer le rôle des drapeaux SYN et ACK et des numéros de séquence"],
      relations: [{ targetConceptId: "tcp-ports-and-sockets", type: "builds_on" }],
      resourceIds: ["rfc-9293"],
      depthLevel: "foundational",
      validationCriteria: ["Prédire les numéros seq et ack d'une ouverture de connexion"],
    },
  ],
});

const validLesson = LessonManifestSchema.parse({
  version: "1.0",
  contentRevision: "1.0.0",
  id: "lesson-tcp-handshake",
  slug: "tcp-three-way-handshake",
  title: "Protocole TCP et Three-Way Handshake",
  conceptId: "tcp-three-way-handshake",
  estimatedMinutes: 12,
  medium: "2d-animated",
  mediumJustification:
    "Un diagramme de séquence 2D animé permet de suivre simultanément les segments et les transitions d'états.",
  status: "in-review",
  steps: [
    {
      id: "step-init",
      title: "État initial",
      summary: "Le serveur écoute passivement sur un port pendant que le client est fermé.",
      visualFocus: "state-machines",
    },
  ],
  exercises: [
    {
      kind: "multiple-choice",
      id: "ex-1",
      conceptId: "tcp-three-way-handshake",
      prompt: "Pourquoi le client doit-il envoyer un troisième message ACK ?",
      explanation:
        "Le serveur doit savoir que le client a bien reçu son SYN-ACK et son ISN serveur.",
      options: [
        {
          id: "a",
          label: "Pour confirmer la réception du SYN-ACK et de l'ISN du serveur",
          feedback: "Exact : les deux sens de communication sont ainsi synchronisés.",
        },
        {
          id: "b",
          label: "Pour chiffrer immédiatement les données applicatives",
          feedback: "Incorrect : TCP ne chiffre pas les données ; c'est le rôle de TLS.",
        },
      ],
      correctOptionId: "a",
    },
  ],
  externalLabs: [],
  resourceIds: ["rfc-9293"],
});

describe("validateCurriculumIntegrity & strict Zod schemas", () => {
  it("refuses publication without explicit revision, scientific review and human approval", () => {
    expect(LessonManifestSchema.safeParse({ ...validLesson, status: "published" }).success).toBe(
      false,
    );
    expect(
      LessonManifestSchema.safeParse({ ...validLesson, contentRevision: undefined }).success,
    ).toBe(false);
    const approved = {
      ...validLesson,
      status: "published",
      review: {
        status: "approved",
        scientificReviewer: "Synthetic fixture reviewer",
        approvedBy: "Synthetic fixture human",
        reviewedAt: "2026-11-13",
        qaEvidenceRef: "continuity/validation/fixture/result.json",
      },
    };
    expect(LessonManifestSchema.safeParse(approved).success).toBe(true);
    expect(
      LessonManifestSchema.safeParse({
        ...approved,
        review: { ...approved.review, approvedBy: undefined },
      }).success,
    ).toBe(false);
    expect(
      LessonManifestSchema.safeParse({
        ...approved,
        review: { ...approved.review, qaEvidenceRef: "tests/e2e/example.spec.ts" },
      }).success,
    ).toBe(false);
  });

  it("accepts a coherent DAG curriculum, resources, and lesson manifest", () => {
    const report = validateCurriculumIntegrity(validCurriculum, validResources, [validLesson]);
    expect(report.valid).toBe(true);
    expect(report.issues).toEqual([]);
  });

  it("rejects unknown fields and non-HTTPS URLs in ResourceMetadataSchema", () => {
    const withUnknownField = ResourceMetadataSchema.safeParse({
      ...validResources.resources[0],
      unexpectedExecutableField: "alert(1)",
    });
    expect(withUnknownField.success).toBe(false);

    const withHttpUrl = ResourceMetadataSchema.safeParse({
      ...validResources.resources[0],
      url: "http://example.com/rfc9293",
    });
    expect(withHttpUrl.success).toBe(false);
  });

  it("rejects invalid choice options and invalid sequence permutations at Zod parse time", () => {
    const invalidChoice = LessonManifestSchema.safeParse({
      ...validLesson,
      exercises: [
        {
          ...validLesson.exercises[0],
          correctOptionId: "non-existent",
        },
      ],
    });
    expect(invalidChoice.success).toBe(false);

    const invalidSequence = LessonManifestSchema.safeParse({
      ...validLesson,
      exercises: [
        {
          kind: "sequence-order",
          id: "ex-seq",
          conceptId: "tcp-three-way-handshake",
          prompt: "Ordonnez les trois segments du handshake.",
          explanation: "SYN, puis SYN-ACK, puis ACK.",
          items: [
            { id: "syn", label: "SYN" },
            { id: "syn-ack", label: "SYN-ACK" },
          ],
          expectedOrder: ["syn", "syn"],
        },
      ],
    });
    expect(invalidSequence.success).toBe(false);
  });

  it("detects prerequisite cycles, missing refs, and all structural integrity probes", () => {
    const cyclic = structuredClone(validCurriculum);
    cyclic.concepts[0]!.prerequisites = ["tcp-three-way-handshake"];
    const cycleReport = validateCurriculumIntegrity(cyclic, validResources, [validLesson]);
    expect(cycleReport.valid).toBe(false);
    expect(cycleReport.issues.some((i) => i.code === "PREREQUISITE_CYCLE")).toBe(true);

    const brokenCurriculum = structuredClone(validCurriculum);
    brokenCurriculum.concepts[1]!.prerequisites.push("non-existent-concept");
    brokenCurriculum.concepts[1]!.resourceIds.push("non-existent-resource");
    brokenCurriculum.domains[0]!.modules[0]!.chapters.push({
      id: "tcp-lifecycle",
      title: "Chapitre en doublon",
      summary: "Test de détection des doublons de chapitres.",
      conceptIds: ["missing-chapter-concept"],
    });

    const brokenLesson = structuredClone(validLesson);
    brokenLesson.exercises[0]!.conceptId = "missing-exercise-concept";
    brokenLesson.assessments = [
      {
        id: "assess-1",
        title: "Évaluation cassée",
        conceptIds: ["missing-assessment-concept"],
        passingScorePercent: 80,
        exerciseIds: ["missing-assessment-exercise"],
      },
    ];

    const duplicateLesson = structuredClone(validLesson);
    duplicateLesson.id = "lesson-tcp-handshake-2";
    // Same slug & same exercise id as brokenLesson

    const report = validateCurriculumIntegrity(brokenCurriculum, validResources, [
      brokenLesson,
      duplicateLesson,
    ]);

    const codes = new Set(report.issues.map((i) => i.code));
    expect(report.valid).toBe(false);
    expect(codes.has("MISSING_PREREQUISITE")).toBe(true);
    expect(codes.has("MISSING_RESOURCE")).toBe(true);
    expect(codes.has("DUPLICATE_CHAPTER_ID")).toBe(true);
    expect(codes.has("MISSING_CHAPTER_CONCEPT")).toBe(true);
    expect(codes.has("MISSING_EXERCISE_CONCEPT")).toBe(true);
    expect(codes.has("DUPLICATE_LESSON_SLUG")).toBe(true);
    expect(codes.has("DUPLICATE_EXERCISE_ID")).toBe(true);
    expect(codes.has("MISSING_ASSESSMENT_CONCEPT")).toBe(true);
    expect(codes.has("MISSING_ASSESSMENT_EXERCISE")).toBe(true);
  });
});
