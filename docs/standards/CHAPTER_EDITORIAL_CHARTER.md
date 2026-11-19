# Charte rédactionnelle et structurelle des chapitres

Ce document complète le [contrat de production des cours](./COURSE_AUTHORING.md), les [standards pédagogiques et visuels](./PEDAGOGICAL_AND_VISUAL_STANDARDS.md) et le [brief du studio](../design/LEARNING_STUDIO.md).

Il codifie la manière d'écrire, découper, rythmer et illustrer chaque leçon **tout en respectant strictement le programme V4 déjà conçu** ([référentiel V4](../../Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md), graphe de concepts atomiques, prérequis, simulateurs déterministes et sources primaires).

---

## 1. Principe directeur : clarté d'une leçon OpenClassrooms, rigueur d'un laboratoire Cyber School

Nous reprenons la **mécanique rédactionnelle et le confort de lecture** éprouvés sur les leçons OpenClassrooms (titres à l'impératif d'action, cas réel en accroche, analogie avant abstraction, paragraphes courts, encarts typés, bilan structuré et transition), tout en conservant **nos exigences Cyber School non négociables** :

1. **Programme V4 inchangé** : les modules, l'ordre des dépendances et les unités du référentiel V4 restent la source de vérité. Les identifiants internes (`TC00.001`, `unit-tc00-...`) ne figurent jamais dans la prose élève.
2. **Interactivité active avant explication passive** : contrairement aux leçons vidéo passives ou aux corrigés PDF statiques, chaque chapitre intègre une **prédiction avant manipulation** (`predictionExerciseId`), un **simulateur déterministe 2D/3D** (`experience`) et des **limites de modèle explicites** (`modelLimits`).
3. **Accessibilité immédiate sans compte** : aucun quiz, aucune explication clé ni aucun exercice n'est bloqué derrière une inscription ; tout est testable dans la session.

---

## 2. Anatomie éditoriale d'un chapitre

Sauf contrainte explicite d'une leçon courte, un chapitre suit cette progression lisible en **6 temps** (alignant la séquence en 7 points de [COURSE_AUTHORING.md](./COURSE_AUTHORING.md) avec la fluidité de lecture) :

| Temps                                   | Rôle pédagogique                                                    | Format rédactionnel attendu                                                                                                                                                                         | Ancrage dans [course-page.ts](../../packages/lesson-runtime/src/course-page.ts) |
| :-------------------------------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **0. Titre (`H1`) & Accroche**          | Nommer une capacité observable et raccrocher au chapitre précédent. | Titre à l'**impératif d'action** (ex. _« Identifiez les champs bruts avant de conclure »_) + 1 à 2 phrases reliant le chapitre à un **fil rouge continu du module**.                                | `title`, `question`                                                             |
| **1. Cas réel & Question socratique**   | Créer le besoin d'apprendre avant la théorie.                       | Incident concret, extrait de log, trace réseau ou spécification problématique, suivi d'une **question réflexive du lecteur** (encart `question`) et de la prédiction.                               | `question`, `predictionExerciseId`                                              |
| **2. Intuition & Mécanisme fragmenté**  | Passer du quotidien au modèle exact sans mur de texte.              | Analogie du quotidien (avec ses limites), puis sous-sections `H3` à l'impératif expliquant le mécanisme étape par étape. Définitions techniques placées au fil de l'eau ou en encart `information`. | `explanation[]`                                                                 |
| **3. Exemple résolu & Manipulation**    | Montrer la méthode puis faire tester le mécanisme.                  | Exemple résolu chiffré avec étapes numérotées (`Amorce grasse : explication`), suivi du simulateur interactif et de ses `modelLimits` visibles.                                                     | `workedExample`, `experience`                                                   |
| **4. Anti-patterns & Mise en pratique** | Corriger les confusions réelles et vérifier le raisonnement.        | Contraste entre erreur fréquente (encart `error` / `warning`) et réflexe rigoureux, suivi d'exercices diagnostiques à feedback ciblé (`practiceExerciseIds`).                                       | `misconception`, `practiceExerciseIds`                                          |
| **5. `En résumé` & Transition**         | Fixer l'essentiel en mémoire et ouvrir l'étape suivante.            | Liste courte de **4 à 6 puces** (`1 idée = 1 puce`), question de transfert sur un cas inédit, puis **phrase de transition** validant l'acquis et annonçant la suite du module V4.                   | `takeaway`, `transferQuestion`, `finalTakeaway`                                 |

---

## 3. Règles d'écriture et de lisibilité

### 3.1 Titres orientés action (jamais de titres encyclopédiques)

- **À faire** : commencer `chapter.title` et chaque `H3` de section par un verbe d'action à l'impératif (`Séparez…`, `Repérez…`, `Vérifiez…`, `Appliquez…`, `Tracez…`).
- **À éviter** : les titres nominaux abstraits (_« Introduction aux journaux »_, _« Concepts fondamentaux »_, _« Séquence d'investigation SOC »_).

### 3.2 Fil rouge continu par module V4

- Chaque module V4 (ex. `TC-00` Logique, preuve et recherche) s'ancre dans un **environnement réaliste fil rouge** cohérent entre chapitres (par ex. le parc applicatif et les serveurs de l'entreprise fictive _TechNova_ / `srv-paie-01`), tout en réservant un **cas inédit** pour `transferQuestion` et les `externalLabs`.

### 3.3 Rythme visuel et densité des paragraphes

- **Paragraphes courts** : viser **2 à 4 lignes** par paragraphe (environ **40 à 75 mots**). Scinder tout bloc dépassant 5 lignes en deux paragraphes ou en liste structurée.
- **Largeur et respiration** : maintenir une colonne de lecture confortable (environ `50–75` caractères par ligne, corps minimal `14 px` mobile / `16 px` desktop, interligne `>= 1.6`).
- **Listes à amorce grasse** : structurer les étapes, règles et critères sous la forme :
  `1. **Verbe ou notion clé :** explication courte et vérifiable.`
- **Gras sélectif** : mettre en **gras** uniquement les termes définis pour la première fois et les verbes/pivots logiques utiles au balayage visuel (sans surligner des phrases entières).

### 3.4 Ton et posture pédagogique

- **Vouvoiement constant (`vous`)** associé à un ton direct, clair et rigoureux : expliquer le _pourquoi_ avant d'imposer la règle.
- **Zéro jargon non défini** : tout terme technique (`event`, `log entry`, `UTC`, `sshd`, `IDOR`) est défini simplement dès sa première occurrence, puis nommé avec son terme standard exact.
- **Aucun effet d'annonce vide** : pas de formules creuses (« C'est très simple », « Comme tout le monde le sait », « N'oubliez jamais que la sécurité est importante »).

---

## 4. Les 4 blocs sémantiques typés (adaptés au Studio sombre)

Pour éviter de noyer le récit principal dans des incises techniques ou des mises en garde, la rédaction distingue quatre rôles éditoriaux explicites dans `@cyber-school/ui` (identifiés par une icône circulaire flottante, une teinte de surface dédiée et un `aria-label` accessible, sans surcharger l'intérieur de la bulle avec des badges textuels répétitifs) :

| Type              | Rôle sémantique & Icône    | Rôle éditorial strict                                                                                                | Exemples d'usage                                                                                   |
| :---------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **`information`** | `Repère` (`i` bleu)        | Précision terminologique, note de contexte ou lien utile qui ne doit pas couper la fluidité du paragraphe principal. | Définir `UTC`, rappeler ce que contient un paquet réseau réel vs la version simplifiée à 5 champs. |
| **`question`**    | `Question` (`?` gris/vert) | Formule à voix haute l'objection ou la confusion spontanée d'un débutant juste avant d'y répondre.                   | _« Pourquoi trois causes différentes produisent-elles exactement la même ligne de log ? »_         |
| **`warning`**     | `Vigilance` (`!` ambre)    | Nuance critique, cas limite ou borne de validité d'un modèle simplifié (`modelLimits`).                              | Horloges non synchronisées (NTP), collecte partielle d'un agent, hypothèse bornée à 3 pistes.      |
| **`error`**       | `Erreur` (`×` rose)        | Anti-pattern concret ou conclusion fallacieuse à ne jamais écrire (`misconception`).                                 | Écrire _« attaque par force brute »_ dans la rubrique _Observation brute_ d'un ticket.             |

En complément, les chapitres utilisent la mise en forme en ligne (`**mots-clés**` et `` `jetons` ``), les blocs de citation (`quote` avec barre latérale) pour les scènes ou brouillons fautifs à auditer, les tableaux comparatifs (`table`) et les bannières visuelles d'ouverture ou de mise en pratique (`banner`).

> Règle de couplage : sur une notion sensible, associer volontiers une règle (`information`) et le piège qui guette si on l'ignore (`warning` ou `error`).

---

## 5. Gabarit de clôture de chapitre (`En résumé` + Transition)

Tout chapitre se termine par deux éléments distincts après les exercices et l'activité de transfert :

1. **`En résumé`** : une liste à puces de **4 à 6 points** maximum, chacun formulant un invariant ou un réflexe actionnable (pas un résumé narratif flou).
2. **Phrase de transition** : un court paragraphe final en deux moitiés :
   - ce que l'apprenant maîtrise désormais ;
   - la limite ou le nouveau problème qui appelle **la prochaine étape du programme V4** (sans exposer d'identifiant interne).

---

## 6. Checklist éditoriale avant revue (`course-page-production`)

- [ ] Le titre du chapitre et les sous-sections `H3` sont formulés à l'impératif orienté action.
- [ ] Le chapitre s'inscrit dans le programme V4 sans exposer d'identifiants internes (`TC00.001`, `unit-...`).
- [ ] Aucun paragraphe d'explication ne forme un bloc massif (2–4 lignes max) et aucun paragraphe de `course.page.json` n'est omis au rendu.
- [ ] Chaque terme technique est défini avant usage ou isolé dans un bloc `information`.
- [ ] Au moins une question socratique (`question`), un cas limite (`warning`) et une erreur fréquente (`error` / `misconception`) structurent la lecture.
- [ ] La séquence interactive reste complète : question → prédiction → simulateur déterministe + `modelLimits` → exercices diagnostiques → `En résumé` (4–6 puces) → transfert et transition.
- [ ] Les nombres, champs et états cités dans la prose et l'exemple résolu correspondent exactement au moteur déterministe et aux sources primaires ([COMPLETE_COURSE_WORKFLOW.md](../curriculum/COMPLETE_COURSE_WORKFLOW.md)).
