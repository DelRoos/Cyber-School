import { describe, expect, it } from "vitest";
import { compileMdxCourse, lintCompiledCourse, parseYaml } from "../index.js";

describe("YAML subset parser", () => {
  it("parses nested objects, sequences, quoted colons, inline arrays and multiline blocks", () => {
    const raw = `
# Sample config
schemaVersion: "2.0"
title: "08:14:02 UTC : journal sshd"
tags: [log, "source:sshd", 42, true]
steps:
  - id: step-1
    note: |
      Ligne 1: 08:14:02 UTC
      Ligne 2: Failed password
  - id: step-2
    note: >
      Première phrase longue
      rejointe sur une ligne.
`;
    const parsed = parseYaml(raw) as Record<string, unknown>;
    expect(parsed.schemaVersion).toBe("2.0");
    expect(parsed.title).toBe("08:14:02 UTC : journal sshd");
    expect(parsed.tags).toEqual(["log", "source:sshd", 42, true]);
    const steps = parsed.steps as Array<{ id: string; note: string }>;
    expect(steps).toHaveLength(2);
    expect(steps[0]?.note).toBe("Ligne 1: 08:14:02 UTC\nLigne 2: Failed password");
    expect(steps[1]?.note).toBe("Première phrase longue rejointe sur une ligne.");
  });
});

describe("MDX + YAML course compiler and quality linter", () => {
  const sampleMeta = `
schemaVersion: "2.0"
contentRevision: "2.0.0"
id: lesson-sample-log
slug: sample-log
unitId: unit-tc00-sample
conceptId: tc00-sample
microLessonIds: ["TC00.001"]
title: "Lire un journal sans conclure trop vite"
audience: "Débutants en cybersécurité souhaitant acquérir une méthode fiable."
levelLabel: "Fondamental"
estimatedMinutes: 15
medium: "2d-animated"
mediumJustification: "Un schéma 2D structuré permet d'isoler chaque champ discret d'un log sans surcharge spatiale."
status: "in-review"
review:
  status: "pending"
resourceIds: ["nist-sp800-92-logs", "nist-sp800-61r3-analysis"]
introduction: "Apprenez à séparer strictement les champs mesurés d'un journal des hypothèses à vérifier avant toute décision."
overviewNarrative:
  - "Lorsqu'une alerte tombe sur un serveur critique, couper la machine par réflexe peut paralyser la production."
  - "Dans ce cours, vous apprenez à extraire la trace brute et recouper des sources indépendantes."
learningObjectives:
  - "Isoler les champs factuels d'une ligne de journal sans inventer d'intention."
  - "Recouper deux sources indépendantes pour écarter une hypothèse incompatible."
prerequisites:
  - "Aucun prérequis technique préalable : chaque terme est défini dès sa première apparition."
finalTakeaway: "Isolez la source et ses champs exacts, listez les hypothèses compatibles, puis recoupez avant de conclure."
audio:
  model: "gemini-3.8-flash-tts"
  voiceName: "Sadaltager"
  persona: "Mentor cybersécurité clair, calme et direct"
  defaultStyle: "warm, clear French cybersecurity mentor speaking conversationally"
canonicalStep:
  id: chapter-sample-main
  title: "Isoler les faits d'un journal"
  summary: "Extraire les champs mesurés, tester les hypothèses et rédiger un constat."
  visualFocus: "Inspecteur de journal interactif"
canonicalChapter:
  id: chapter-sample-main
  title: "Isoler les faits d'un journal"
  estimatedMinutes: 15
  question: "Trois refus de mot de passe apparaissent dans auth.log : qu'est-ce qui est mesuré et qu'est-ce qui est supposé ?"
  objective: "Extraire les champs exacts d'un relevé et identifier les sources manquantes."
  explanation:
    - "Un journal système enregistre uniquement les paramètres reçus sur l'interface réseau du serveur."
    - "Pour départager plusieurs causes compatibles, il faut consulter une deuxième source indépendante."
  workedExample:
    title: "Autopsie d'une ligne sshd"
    startingPoint: "08:14:02 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19"
    steps:
      - "Relever la source nommée et les cinq champs horodatés sans ajouter de qualificatif."
      - "Lister les hypothèses compatibles puis ouvrir l'inventaire réseau pour trancher."
    conclusion: "Une seule ligne laisse plusieurs pistes ouvertes ; le recoupement réduit l'incertitude."
  experience:
    componentId: "observation-workbench"
    instruction: "Comparez les trois causes amont puis activez la source d'inventaire réseau."
    observe: "La trace sshd reste identique quelle que soit la cause amont simulée."
    modelLimits: "Modèle pédagogique à 3 sources ; en production, vérifiez aussi la synchronisation NTP."
  misconception:
    claim: "Trois refus rapides suffisent pour qualifier une attaque par force brute."
    correction: "Un script mal configuré ou une erreur humaine produit exactement la même trace."
  takeaway: "Distinguez toujours fait mesuré, hypothèses compatibles et sources à recouper."
  transferQuestion: "Rédigez l'observation brute et deux hypothèses pour un rejet UPLOAD_REJECTED (quota_exceeded)."
externalLabs: []
`;

  const sampleExercises = `
schemaVersion: "2.0"
predictionExerciseId: ex-sample-pred
assessments:
  - id: assess-sample
    title: "Évaluation finale"
    conceptIds: ["tc00-sample"]
    passingScorePercent: 75
    exerciseIds: ["ex-sample-pred", "ex-sample-mcq"]
exercises:
  - id: ex-sample-pred
    conceptId: tc00-sample
    kind: state-prediction
    scenario: "On remplace une saisie humaine au clavier par un script automatique envoyant le même mot de passe refusé."
    prompt: "Comment évoluent les champs hors horodatage enregistrés par sshd sur le serveur distant ?"
    correctOptionId: opt-same
    explanation: "Le serveur distant ne voit que les paquets réseau reçus, pas l'outil local qui les a émis."
    misconceptionTags:
      opt-diff: "confond-capteur-distant-et-poste-local"
    options:
      - id: opt-same
        label: "Ils restent identiques car sshd ne voit pas comment la requête a été déclenchée localement."
        feedback: "Exact : le serveur reçoit le même identifiant et le même refus, quelle que soit la cause locale."
      - id: opt-diff
        label: "Le champ event change de code pour indiquer un envoi automatisé plutôt qu'une frappe manuelle."
        feedback: "Piège classique : sshd valide uniquement la requête reçue sur le réseau et n'a pas accès au clavier local."
  - id: ex-sample-mcq
    conceptId: tc00-sample
    kind: multiple-choice
    prompt: "Quelle phrase formule une observation brute rigoureuse à partir des trois lignes AUTH_FAILURE ?"
    correctOptionId: opt-strict
    explanation: "Une observation brute nomme la source et restitue exactement les champs enregistrés."
    misconceptionTags:
      opt-hasty: "sur-interpretation-hostile"
    options:
      - id: opt-strict
        label: "Le journal sshd consigne trois événements AUTH_FAILURE sur c.moreau depuis 10.24.8.19."
        feedback: "Exact : la source est nommée et aucun motif non mesuré n'est ajouté."
      - id: opt-hasty
        label: "Le journal sshd prouve trois tentatives d'intrusion non autorisées contre le compte c.moreau."
        feedback: "Le terme « intrusion non autorisée » introduit une intention absente du code AUTH_FAILURE."
`;

  const sampleMdx = `
<Part id="part-1" number="1" title="Séparer faits et hypothèses" quizTitle="Quiz final">
  <PartSummary>
    Passez d'une alerte alarmiste à un constat technique rigoureux appuyé sur des sources vérifiées.
  </PartSummary>
  <QuizIntro>
    Testez votre capacité à isoler les faits mesurés et éviter les conclusions hâtives.
  </QuizIntro>

  <Chapter id="ch-1-intro" number="1" title="Décomposez la trace brute" subtitle="Log réel et méthode · 8 min" estimatedMinutes="8">
    <Scene id="ch1-s1-trace" title="Ouvrir le journal brut" pauseForAction="true">
      <Focus>
        - Lire les 5 champs réels du journal avant le titre d'alerte
        - Repérer les mots ajoutés par interprétation humaine
      </Focus>

      ## Lisez le journal avant le résumé d'alerte

      Un serveur de production n'écrit jamais une histoire complète dans ses journaux. Il enregistre uniquement les paramètres qu'il a mesurés sur son interface réseau.

      <Terminal label="srv-paie-01 : /var/log/auth.log">
08:14:02 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19
      </Terminal>

      <Slide layout="contrast-split">
      leftTitle: "Ce que l'alerte affirme"
      leftTone: danger
      leftItems:
        - "Attaquant externe depuis Internet"
      rightTitle: "Ce que sshd mesure"
      rightTone: fact
      rightItems:
        - "3 refus depuis 10.24.8.19"
      verdict: "3 -> 2 -> 1 : recoupez avant de conclure."
      </Slide>

      <WorkedExample title="Décomposer une ligne sshd" conclusion="3 -> 2 -> 1 : une seule ligne prouve un refus sur le réseau, jamais son auteur physique.">
        <Start>08:14:02 UTC | service=sshd | event=AUTH_FAILURE | account=c.moreau | source_ip=10.24.8.19</Start>
        <Step why="Isoler ce qui est objectivement enregistré évite de recopier une alerte exagérée.">Relevez l'horodatage UTC, le service sshd, le code AUTH_FAILURE, le compte c.moreau et l'IP 10.24.8.19.</Step>
        <Step why="L'adresse 10.24.8.19 appartient à un réseau privé interne et non à Internet.">Vérifiez immédiatement la portée de l'adresse IP avant de parler d'attaquant externe.</Step>
      </WorkedExample>

      <Visual id="signal-autopsy" caption="Schéma 1 · Séparation des champs mesurés et des ajouts supposés." />

      <MicroCheck id="mc-1" prompt="Que prouve le champ account=c.moreau ?" correct="mc-ok">
        <Option id="mc-ok" feedback="Exact : seul l'identifiant texte envoyé par le client est enregistré.">Que la chaîne c.moreau a été demandée lors de la tentative de connexion.</Option>
        <Option id="mc-wrong" feedback="Non : le serveur ne voit pas qui appuie physiquement sur le clavier.">Que Claire Moreau était physiquement connectée à ce moment précis.</Option>
        <Explain>Un service d'authentification enregistre l'identifiant demandé, jamais l'identité biologique de l'opérateur.</Explain>
      </MicroCheck>

      <Practice title="À vous de jouer" experienceId="observation-workbench" showTransferPad="true" solutionSummary="Formulez l'observation brute puis deux hypothèses à vérifier.">
        <Context>Testez les différentes causes amont et observez l'effet sur le relevé.</Context>
        <Steps>
          - Basculez la cause amont dans le simulateur.
          - Activez la deuxième source pour éliminer la piste incompatible.
        </Steps>
      </Practice>

      <ReferenceSheet title="Fiche réflexe · Lecture d'un journal">
        <Group title="Champs factuels">
          - **Horodatage UTC** :: Repère chronologique indépendant du fuseau local || Vérifier la synchronisation NTP entre machines.
          - **Compte demandé** :: Chaîne d'identifiant soumise au service || Ne prouve pas qui est devant le clavier.
        </Group>
      </ReferenceSheet>

      <Summary transition="Passons maintenant au recoupement multi-sources pour éliminer les fausses pistes.">
        - Une observation brute cite toujours sa source et ses champs exacts sans supposer l'intention.
        - Plusieurs causes très différentes peuvent produire une trace strictement identique.
        - Recouper une deuxième source indépendante permet d'éliminer les hypothèses incompatibles.
      </Summary>

      <AudioScript style="warm, calm and direct">
        Regardons ensemble ce qui s'affiche dans le journal du serveur de paie. Vous avez devant vous une seule ligne horodatée à huit heures quatorze zéro deux, indiquant un mot de passe refusé pour le compte c point moreau depuis l'adresse dix point vingt-quatre point huit point dix-neuf. Remarquez ce qui manque : le serveur ne dit jamais qui appuie sur le clavier, ni s'il s'agit d'une faute de frappe ou d'un script. Prenez quelques secondes pour tester la question rapide ci-dessous avant que nous passions au recoupement.
      </AudioScript>
    </Scene>
  </Chapter>
</Part>
`;

  it("compiles valid MDX + YAML sources into strict runtime manifests and passes the quality rubric", () => {
    const compiled = compileMdxCourse({
      metaYaml: sampleMeta,
      courseMdx: sampleMdx,
      exercisesYaml: sampleExercises,
    });

    expect(compiled.lesson.slug).toBe("sample-log");
    expect(compiled.page.courseParts?.[0]?.chapters[0]?.scenes).toHaveLength(1);
    expect(compiled.page.courseParts?.[0]?.chapters[0]?.scenes?.[0]?.slide?.layout).toBe(
      "contrast-split",
    );
    expect(compiled.audioScripts.chapters["ch-1-intro"]?.cues).toHaveLength(1);
    expect(compiled.audioScripts.chapters["ch-1-intro"]?.cues[0]?.blockId).toBe("ch1-s1-trace");
    expect(compiled.audioScripts.chapters["ch-1-intro"]?.cues[0]?.pauseForAction).toBe(true);

    const report = lintCompiledCourse(compiled);
    expect(report.passed).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("flags pompous audio tone, raw markdown in audio, internal ID leaks, and cartoon distractors", () => {
    const badMdx = sampleMdx.replace(
      "Regardons ensemble ce qui s'affiche",
      "Plongeons dans **l'épistémologie de l'investigation** pour TC00.001 avec une froideur géométrique",
    );
    const badExercises = sampleExercises.replace(
      "Le champ event change de code pour indiquer un envoi automatisé plutôt qu'une frappe manuelle.",
      "Parce qu'il est impossible de se connecter après minuit sans autorisation préfectorale.",
    );

    const compiled = compileMdxCourse({
      metaYaml: sampleMeta,
      courseMdx: badMdx,
      exercisesYaml: badExercises,
    });
    const report = lintCompiledCourse(compiled);
    expect(report.passed).toBe(false);
    const codes = report.issues.map((i) => i.code);
    expect(codes).toContain("POMPOUS_AUDIO_TONE");
    expect(codes).toContain("RAW_MARKDOWN_IN_AUDIO");
    expect(codes).toContain("INTERNAL_ID_IN_AUDIO");
    expect(codes).toContain("CARTOON_DISTRACTOR");
  });

  it("preserves plain markdown bullet lists, escaped pipes in tables, and rejects mismatched MicroCheck correct IDs", () => {
    const plainListAndEscapedTableMdx = sampleMdx.replace(
      "Un serveur de production n'écrit jamais une histoire complète dans ses journaux. Il enregistre uniquement les paramètres qu'il a mesurés sur son interface réseau.",
      `Un serveur de production n'écrit jamais une histoire complète dans ses journaux.

- Horodatage UTC brut
- Adresse IP source relevée sur l'interface

<Table caption="Syntaxe de journal">
| Champ | Exemple |
| --- | --- |
| Séparateur | A \\| B |
</Table>`,
    );

    const compiled = compileMdxCourse({
      metaYaml: sampleMeta,
      courseMdx: plainListAndEscapedTableMdx,
      exercisesYaml: sampleExercises,
    });

    const blocks = compiled.page.courseParts?.[0]?.chapters[0]?.scenes?.[0]?.blocks ?? [];
    const listBlock = blocks.find((b) => b.type === "list");
    expect(listBlock?.type).toBe("list");
    if (listBlock?.type === "list") {
      expect(listBlock.items).toEqual([
        { detail: "Horodatage UTC brut" },
        { detail: "Adresse IP source relevée sur l'interface" },
      ]);
    }
    const tableBlock = blocks.find((b) => b.type === "table");
    expect(tableBlock?.type).toBe("table");
    if (tableBlock?.type === "table") {
      expect(tableBlock.rows[0]).toEqual(["Séparateur", "A | B"]);
    }

    const brokenMicroCheckMdx = sampleMdx.replace('correct="mc-ok"', 'correct="mc-nonexistent"');
    expect(() =>
      compileMdxCourse({
        metaYaml: sampleMeta,
        courseMdx: brokenMicroCheckMdx,
        exercisesYaml: sampleExercises,
      }),
    ).toThrow(/correctOptionId/);
  });
});
