import { describe, expect, it } from "vitest";
import {
  assertCanPublishRecord,
  CoursePageSchema,
  createEmptyDeliverablesRecord,
  CurriculumCatalogSchema,
  LessonManifestSchema,
  ResourceMetadataSchema,
  ResourcesCatalogSchema,
  V4_DELIVERABLE_KINDS,
  V4_PRODUCTION_STATES,
  V4ImportedCurriculumSchema,
  V4ProductionRegistrySchema,
  validateCurriculumIntegrity,
  verifyUnitCoverage,
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

  it("validates diagram-probe exercises and rejects invalid targets", () => {
    const validProbe = LessonManifestSchema.safeParse({
      version: "1.0",
      contentRevision: "1.0.0",
      id: "lesson-probe-test",
      slug: "lesson-probe-test",
      title: "Test diagram probe",
      conceptId: "tcp-three-way-handshake",
      estimatedMinutes: 5,
      medium: "2d-animated",
      mediumJustification: "Schéma 2D interactif adapté aux sondes de zones.",
      status: "draft",
      steps: [
        {
          id: "step-1",
          title: "Observation",
          summary: "Identifier la zone exacte sur le diagramme.",
          visualFocus: "diagram",
        },
      ],
      exercises: [
        {
          kind: "diagram-probe",
          id: "ex-probe-1",
          conceptId: "tcp-three-way-handshake",
          prompt: "Sélectionnez les deux zones représentant les états d'attente.",
          diagramTitle: "Carte d'états",
          diagramCaption: "Cliquez sur les zones correspondantes dans le schéma.",
          allowMultiple: true,
          explanation: "Les deux extrémités passent en état d'attente pendant l'échange.",
          zones: [
            { id: "z1", label: "SYN_SENT", region: "Client", feedback: "Zone valide côté client." },
            {
              id: "z2",
              label: "CLOSED",
              region: "Client",
              feedback: "État initial avant connect().",
            },
            {
              id: "z3",
              label: "SYN_RCVD",
              region: "Serveur",
              feedback: "Zone valide côté serveur.",
            },
          ],
          correctZoneIds: ["z1", "z3"],
        },
      ],
      externalLabs: [],
      resourceIds: ["rfc-9293"],
    });
    expect(validProbe.success).toBe(true);

    const badProbe = LessonManifestSchema.safeParse({
      ...(validProbe.success ? validProbe.data : {}),
      exercises: [
        {
          kind: "diagram-probe",
          id: "ex-probe-bad",
          conceptId: "tcp-three-way-handshake",
          prompt: "Sélectionnez une zone cible.",
          diagramTitle: "Carte",
          diagramCaption: "Test de cible unique invalide.",
          allowMultiple: false,
          explanation: "Explication suffisamment longue pour passer la longueur minimale.",
          zones: [
            { id: "z1", label: "Zone 1", region: "A", feedback: "Feedback valide 1." },
            { id: "z2", label: "Zone 2", region: "B", feedback: "Feedback valide 2." },
          ],
          correctZoneIds: ["z1", "z2"],
        },
      ],
    });
    expect(badProbe.success).toBe(false);
  });
});

describe("V4 Curriculum Industrialization contracts", () => {
  it("exposes all 12 production states and 12 deliverable kinds", () => {
    expect(V4_PRODUCTION_STATES).toHaveLength(12);
    expect(V4_DELIVERABLE_KINDS).toHaveLength(12);
    const empty = createEmptyDeliverablesRecord();
    for (const kind of V4_DELIVERABLE_KINDS) {
      expect(empty[kind].status).toBe("missing");
    }
  });

  it("verifies unit coverage cleanly and detects missing, duplicate, unknown, and cyclic units", () => {
    const imported = V4ImportedCurriculumSchema.parse({
      schemaVersion: "1.0",
      sourceFile: "Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md",
      sourceSha256: "a".repeat(64),
      stats: { moduleCount: 1, microLessonCount: 2, competencyCount: 1, examCount: 0 },
      modules: [
        {
          id: "TC-00",
          title: "Méthode scientifique",
          domainId: "v4-tronc-commun",
          domainTitle: "Tronc commun",
          moduleOrder: 1,
          microLessonIds: ["TC00.001", "TC00.002"],
          competencies: [{ id: "TC00.01", title: "Observer sans confondre", line: 1700 }],
          explicitPrerequisites: [],
          proposedDependencies: [],
          resources: [],
          books: [],
          hasPart2Spec: true,
          provenancePart1Line: 20,
          provenancePart2Line: 1650,
        },
      ],
      microLessons: [
        {
          id: "TC00.001",
          domainId: "v4-tronc-commun",
          domainTitle: "Tronc commun",
          moduleId: "TC-00",
          moduleTitle: "Méthode scientifique",
          title: "Observation, fait, modèle",
          position: { moduleOrder: 1, microOrder: 1, globalOrder: 1 },
          sourceProvenance: {
            file: "Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md",
            lineStart: 25,
            lineEnd: 25,
            sectionHeading: "Module TC-00",
          },
          learningObjectives: ["Distinguer observation, hypothèse et modèle"],
          explicitPrerequisites: [],
          proposedDependencies: [],
          linkedCompetencyIds: ["TC00.01"],
          associatedResources: [],
          coverageState: "uncovered",
          productionState: "a_planifier",
          mappedLessonSlugs: [],
        },
        {
          id: "TC00.002",
          domainId: "v4-tronc-commun",
          domainTitle: "Tronc commun",
          moduleId: "TC-00",
          moduleTitle: "Méthode scientifique",
          title: "Causalité vs corrélation",
          position: { moduleOrder: 1, microOrder: 2, globalOrder: 2 },
          sourceProvenance: {
            file: "Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md",
            lineStart: 26,
            lineEnd: 26,
            sectionHeading: "Module TC-00",
          },
          learningObjectives: ["Identifier une variable confondante"],
          explicitPrerequisites: [],
          proposedDependencies: [],
          linkedCompetencyIds: ["TC00.01"],
          associatedResources: [],
          coverageState: "uncovered",
          productionState: "a_planifier",
          mappedLessonSlugs: [],
        },
      ],
      exams: [],
    });

    const validUnits = {
      schemaVersion: "1.0" as const,
      units: [
        {
          id: "unit-a",
          slug: "unit-a",
          title: "Unité A",
          moduleId: "TC-00",
          domainId: "v4-tronc-commun",
          rationale: "Regroupement fondationnel observation et causalité.",
          microLessonIds: ["TC00.001"],
          prerequisiteUnitIds: [],
          recommendedMedium: "2d-animated" as const,
          estimatedMinutes: 15,
          groupingStatus: "curated" as const,
        },
        {
          id: "unit-b",
          slug: "unit-b",
          title: "Unité B",
          moduleId: "TC-00",
          domainId: "v4-tronc-commun",
          rationale: "Regroupement causalité et preuve.",
          microLessonIds: ["TC00.002"],
          prerequisiteUnitIds: ["unit-a"],
          recommendedMedium: "2d-graph" as const,
          estimatedMinutes: 15,
          groupingStatus: "curated" as const,
        },
      ],
    };

    expect(verifyUnitCoverage(imported, validUnits)).toMatchObject({
      valid: true,
      totalMicroLessons: 2,
      assignedMicroLessons: 2,
      cycleDetected: false,
    });

    const brokenUnits = {
      schemaVersion: "1.0" as const,
      units: [
        {
          ...validUnits.units[0]!,
          microLessonIds: ["TC00.001", "TC00.999"],
          prerequisiteUnitIds: ["unit-b"],
        },
        {
          ...validUnits.units[1]!,
          microLessonIds: ["TC00.001"],
          prerequisiteUnitIds: ["unit-a", "missing-unit"],
        },
      ],
    };
    const brokenReport = verifyUnitCoverage(imported, brokenUnits);
    expect(brokenReport.valid).toBe(false);
    expect(brokenReport.missingMicroLessonIds).toEqual(["TC00.002"]);
    expect(brokenReport.duplicateAssignments[0]?.microLessonId).toBe("TC00.001");
    expect(brokenReport.unknownMicroLessonIds).toEqual(["TC00.999"]);
    expect(brokenReport.missingPrerequisiteUnitIds).toHaveLength(1);
    expect(brokenReport.cycleDetected).toBe(true);
  });

  it("blocks publishing a V4 production record without verified deliverables and human sign-off", () => {
    const registry = V4ProductionRegistrySchema.parse({
      schemaVersion: "1.0",
      records: [
        {
          unitId: "unit-a",
          slug: "unit-a",
          title: "Unité A",
          moduleId: "TC-00",
          state: "revue_necessaire",
          version: "0.1.0",
          taskIds: ["TASK-018"],
          deliverables: createEmptyDeliverablesRecord(),
          validationEvidenceRefs: [],
          blockerReasons: [],
          updatedAt: "2026-11-14",
        },
      ],
    });

    const blockers = assertCanPublishRecord(registry.records[0]!, "in-review", false);
    expect(blockers.length).toBeGreaterThanOrEqual(14);

    const allVerified = createEmptyDeliverablesRecord();
    for (const kind of V4_DELIVERABLE_KINDS) {
      allVerified[kind] = { status: "verified", artifactPath: `docs/courses/${kind}.md` };
    }
    const publishable = {
      ...registry.records[0]!,
      deliverables: allVerified,
      validationEvidenceRefs: ["continuity/validation/task-018/result.json"],
    };
    expect(assertCanPublishRecord(publishable, "published", true)).toEqual([]);
    expect(assertCanPublishRecord(publishable, "published", false)).toHaveLength(1);
  });

  it("validates optional editorial callouts, summaryPoints and transitionToNext on CoursePageSchema", () => {
    const baseChapter = {
      id: "chapter-one",
      title: "Séparez le relevé brut de l'alerte",
      estimatedMinutes: 20,
      question:
        "Une alerte affirme qu'un attaquant agit depuis 10.24.8.19, alors que le log ne montre que trois refus de mot de passe.",
      objective:
        "Extraire les cinq champs techniques d'un relevé sans ajouter d'auteur ni d'intention.",
      explanation: [
        "Un capteur note un résultat technique sans voir qui tient le clavier ni pourquoi la demande a été envoyée.",
        "Une observation brute cite toujours le journal source et restitue ses cinq champs exacts sans interprétation.",
      ],
      workedExample: {
        title: "Décomposer le relevé initial",
        startingPoint:
          "08:14:02 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19",
        steps: [
          "Étape 1 : relever les cinq champs factuels consignés par le démon sshd.",
          "Étape 2 : recenser les hypothèses compatibles avant d'ouvrir une autre source.",
        ],
        conclusion: "Avec une seule source, trois hypothèses restent compatibles.",
      },
      predictionExerciseId: "ex-predict",
      experience: {
        componentId: "observation-workbench",
        instruction: "Basculez la cause amont et activez les sources complémentaires une par une.",
        observe:
          "Le relevé initial reste inchangé tandis que les pistes compatibles diminuent de trois à une.",
        modelLimits:
          "Modèle borné à trois hypothèses et trois sources ; vérifiez l'horloge NTP en réel.",
      },
      practiceExerciseIds: ["ex-practice"],
      misconception: {
        claim: "Écrire tentative d'intrusion dans les faits observés est plus prudent.",
        correction:
          "Mélanger fait et supposition oriente vers une fausse piste ; séparez relevé et hypothèses.",
      },
      takeaway:
        "Citez d'abord la source et ses champs exacts, puis listez les hypothèses à recouper.",
      transferQuestion:
        "Face à une ligne UPLOAD_REJECTED sur backup-agent, rédigez l'observation brute et deux pistes.",
      resourceIds: ["rfc-9293"],
      conceptIds: ["tcp-ports-and-sockets"],
      microLessonIds: ["TC00.001"],
    };

    const validPage = {
      schemaVersion: "1.0",
      lessonId: "lesson-first",
      unitId: "unit-tc00-observation-interpretation",
      audience: "Débutants complets sans prérequis techniques préalables.",
      introduction:
        "Apprenez à lire ce qu'un relevé technique enregistre réellement avant d'interpréter l'intention.",
      overviewNarrative: [
        "Lorsqu'une alerte tombe sur un serveur, les mots utilisés dans un outil de supervision suggèrent souvent une histoire complète avant toute vérification.",
        "Ce cours vous apprend à revenir à la source brute et à recouper des journaux indépendants.",
      ],
      learningObjectives: [
        "Isoler les cinq champs factuels d'une entrée de journal horodatée.",
        "Recouper des sources indépendantes pour départager plusieurs hypothèses.",
      ],
      prerequisites: ["Aucun prérequis technique n'est nécessaire pour démarrer cette leçon."],
      chapters: [
        {
          ...baseChapter,
          callouts: [
            {
              id: "callout-q1",
              kind: "question",
              placement: "opening",
              title: "Le serveur ne sait-il pas qui tape ?",
              body: "Non : le service distant reçoit seulement un identifiant, un mot de passe et une adresse réseau.",
            },
          ],
          summaryPoints: [
            "Une entrée de journal enregistre des paramètres techniques mesurés.",
            "Citez toujours le relevé source et ses cinq champs exacts.",
            "Plusieurs causes amont peuvent produire exactement la même trace.",
          ],
          transitionToNext:
            "Vous savez séparer fait et interprétation ; passons maintenant à la formulation d'hypothèses falsifiables.",
        },
      ],
      courseParts: [
        {
          id: "part-1",
          number: 1,
          title: "Séparez le fait mesuré du scénario supposé",
          summary:
            "Comprenez ce qu'un journal enregistre et vérifiez vos hypothèses par recoupement.",
          quizTitle: "Quiz : Validez vos acquis",
          quizIntro: "Répondez aux questions ci-dessous pour vérifier votre compréhension.",
          chapters: [
            {
              id: "ch-1",
              number: 1,
              title: "Tirez un maximum de ce cours",
              subtitle: "Méthode et fil rouge · 3 min",
              estimatedMinutes: 3,
              blocks: [
                {
                  type: "prose",
                  paragraphs: [
                    "Ce chapitre pose la méthode d'observation sur le cas concret du serveur de paie.",
                  ],
                },
                {
                  type: "banner",
                  variant: "welcome",
                  caption: "Ouverture visuelle du cours.",
                },
                {
                  type: "quote",
                  paragraphs: [
                    "Alerte reçue à 08:15 UTC : trois refus sur srv-paie-01 depuis 10.24.8.19.",
                  ],
                  attribution: "Console de supervision",
                },
                {
                  type: "callout",
                  kind: "question",
                  body: "Le service distant voit-il réellement qui appuie sur le clavier ?",
                },
                {
                  type: "table",
                  headers: ["Champ", "Mesure exacte"],
                  rows: [
                    ["service", "sshd"],
                    ["event", "AUTH_FAILURE"],
                  ],
                  caption: "Champs observés dans auth.log",
                },
                {
                  type: "summary",
                  points: [
                    "Une trace système consigne uniquement des champs techniques.",
                    "Nommez toujours la source avant d'énoncer les faits observés.",
                    "Recoupez plusieurs journaux avant de conclure sur la cause.",
                  ],
                  transition:
                    "Passons maintenant au chapitre suivant pour étudier les cinq champs du journal.",
                },
              ],
            },
          ],
        },
      ],
      finalTakeaway:
        "Conservez cette séparation entre observation brute et hypothèse dans toute enquête.",
    };

    expect(CoursePageSchema.safeParse(validPage).success).toBe(true);

    const invalidSummary = {
      ...validPage,
      chapters: [{ ...validPage.chapters[0]!, summaryPoints: ["Un seul point insuffisant."] }],
    };
    expect(CoursePageSchema.safeParse(invalidSummary).success).toBe(false);
  });
});
