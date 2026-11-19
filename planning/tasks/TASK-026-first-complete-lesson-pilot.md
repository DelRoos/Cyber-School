---
id: TASK-026
title: Remplacer les anciens cours par une première leçon complète
status: In Progress
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-021]
labels: [area:web, area:curriculum, area:qa]
---

# TASK-026 — Observer avant de conclure

## Demande et périmètre

L’utilisateur demande de supprimer les cours existants et de construire une vraie première leçon pour éprouver la méthode sur un seul sujet. Il confirme le sujet « Distinguer une observation d’une interprétation » et refuse le terme « micro-leçon » dans l’expérience apprenant. Le V4 reste la référence complète, intacte. Ses identifiants atomiques servent uniquement à la traçabilité interne.

Les anciens manifestes sont retirés du catalogue actif, avec une archive locale de leur état avant suppression. Les anciens prototypes ne doivent plus apparaître comme cours disponibles. Les autres modifications de la session parallèle sont conservées.

## Critères d'acceptation

- [x] Un seul manifeste actif, anciens slugs en 404 et couverture exacte TC00.001 ; revue scientifique pending.
- [x] La route principale expose une leçon complète et continue, en huit sections développées, avec un sommaire latéral synchronisé au défilement et un sommaire mobile accessible.
- [x] L’élève lit un relevé, suit un exemple résolu, corrige une phrase, compare deux explications, examine un contexte, rédige sa conclusion et transfère la méthode à un autre cas, avec quatre exercices réellement corrigés.
- [x] Une narration intégrale fidèle au texte utilise les bornes réelles des paragraphes ; navigation, recherche dans l’audio, pause/reprise, vitesse lente, suivi facultatif et pauses pédagogiques fonctionnent sans autoplay.
- [x] Chaque transformation correspond à une action et à un invariant explicite ; sélectionner une hypothèse ne la transforme pas en cause établie.
- [x] Réponses et rapport conservés au rechargement, anciennes réponses reprises, corrections invalidées après modification, stockage bloqué et effacement explicite gérés.
- [x] Clavier, noms et états accessibles, focus, mouvement réduit, mobile 320 px et captures de production vérifiés ; aucun test manuel avec lecteur d’écran n’est revendiqué.
- [x] Neuf contrôles officiels réussis sur les sources finales et checkpoint généré.

## Conception et méthode

Voir `docs/courses/observation-et-interpretation/COURSE_DOSSIER.md` et `EXPERIENCE_V2.md` dans ce même dossier.

## Réception

Première version livrée et testée, puis rejetée par l’utilisateur le 15 novembre 2026 : il demande une refonte complète pour vivre une vraie expérience. La tâche est donc rouverte, sans présumer que sa preuve précédente valide la nouvelle page. La V2 transforme la leçon en enquête guidée ; son nouveau rapport sera enregistré après les changements.

Le contenu reste `in-review/pending` : l’approbation scientifique et pédagogique humaine est une étape distincte, non fournie par cette tâche technique. Prochaine étape : revue de cette seule leçon et de sa méthode avec l’utilisateur avant d’étendre la production.

## Coordination de la V2

La proposition d’enquête reste isolée à `/cours/observation-et-interpretation/experience`. Le 15 novembre 2026, l’utilisateur demande explicitement de remplacer la page principale par une leçon entière avec sommaire à gauche et audio synchronisé. Cette instruction autorise la nouvelle intégration sur la route principale. Voir `docs/courses/observation-et-interpretation/LESSON_READER.md`. L’audit pédagogique audio est terminé : `audits/audio-pedagogy-2026-11-15/REPORT.md`. Les anciennes pistes ne sont pas utilisées par la nouvelle page. La narration est générée localement depuis le texte affiché, sans API payante.
