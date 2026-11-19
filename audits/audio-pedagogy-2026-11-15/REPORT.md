# Audit pédagogique des audios — 15 novembre 2026

## Avis

La chaîne de production est structurée, mais les audios actuels ne sont pas prêts à servir de référence pédagogique. Corriger le modèle expliqué et la cohérence entre voix, texte et visuel passe avant une nouvelle génération ou un changement de voix.

Audit en lecture seule des scripts, du lecteur, des manifestes et des neuf WAV locaux. Aucune génération payante ni aucun appel d’alignement n’a été lancé. Le timbre, la prononciation et le naturel perçus à l’écoute ne sont pas évalués : ces propriétés ne se déduisent pas du script ou de l’analyse PCM. Les fichiers ne contiennent pas de transcription indépendante permettant de vérifier que tout le texte prévu a réellement été prononcé.

## Chaîne réellement implémentée

`scripts/audio/create-audio-script.ts` construit vingt segments écrits à la main. Le générateur lit surtout le titre et le slug du manifeste ; le corps parlé est distinct des explications du cours. Les deux fichiers de cours figurent dans `sourceFiles`, ce qui ne prouve pas un contrôle automatique de leur cohérence.

`scripts/audio/generate-lesson-audio.ts` configure `gemini-3.8-flash-tts`, la voix `fr-fr-podcaster-8` et la langue `fr-FR`. Il synthétise une piste maître, demande des bornes de segments au modèle configuré `gemini-4-hydrogen`, recherche une zone faible en énergie près des coupures puis extrait cinq pistes d’étape et trois pistes d’animation. Des fondus de 8 ms réduisent les discontinuités aux bords. Ces identifiants décrivent la configuration du dépôt, pas une validation indépendante des services ou de leurs résultats.

Le lecteur utilise le temps du fichier audio pour piloter les segments et les animations. Le minutage des mots est cependant calculé selon la longueur des mots et la ponctuation de `displayText` : ce n’est pas un alignement acoustique mot à mot. Le repli des segments utilise lui aussi des proportions de longueur de texte si l’alignement externe échoue. Dans les fichiers actuels, toutes les pistes déclarent la source d’alignement Gemini ; cela n’ajoute aucune mesure acoustique au calcul des mots.

## Mesures locales

Piste maître : 281,120 s, soit 4 min 41 ; PCM mono, 24 kHz, 16 bits ; crête −1,01 dBFS ; RMS global −22,48 dBFS ; aucun échantillon à proximité de la saturation selon le seuil de mesure 32760/32768. Ce RMS n’est pas une mesure LUFS et n’atteste pas d’une intelligibilité satisfaisante. Les durées déclarées correspondent aux durées des données PCM.

| Piste | Durée réelle | Mots prévus par le script | Débit estimé |
| --- | ---: | ---: | ---: |
| Découvrir | 81,500 s | 236 | 174 mots/min |
| Comprendre | 85,760 s | 243 | 170 mots/min |
| Manipuler | 44,248 s | 131 | 178 mots/min |
| S’exercer | 35,332 s | 93 | 158 mots/min |
| Retenir | 34,280 s | 100 | 175 mots/min |

Le débit est une estimation calculée à partir du texte prévu, hors balises de pause, et de la durée réelle du WAV. Il n’est pas issu d’une transcription écoutée. Le maître prévoit 803 mots, environ 171 mots/min. Ces valeurs n’établissent pas un seuil pédagogique universel ; la densité de nouveaux termes et le temps laissé à l’action doivent être testés avec des débutants.

## Constats prioritaires

### P1 — Un mécanisme inventé est enseigné comme un fait

`create-audio-script.ts:147` affirme que la requête transporte auteur et motif, puis que le logger les tranche. `observation-visuals.tsx:262` renforce cette image en annonçant qu’un journal enrichi permettrait de n’avoir « plus de doute possible ». Ces éléments ne proviennent pas du cas canonique. Une intention humaine n’est pas un champ technique établi que le logger aurait nécessairement supprimé.

Correction : montrer un événement d’exercice et les champs effectivement enregistrés, avec auteur et intention indiqués comme inconnus dans notre relevé. Si l’on compare plusieurs scénarios, les garder explicitement hypothétiques. Des champs supplémentaires sont eux-mêmes des informations à qualifier, pas une garantie absolue d’identité et d’intention.

### P1 — La source est transformée en vérité incontestable

`create-audio-script.ts:214` qualifie les chiffres sourcés d’« indéboulonnables ». Les variantes affichées utilisent « prouvé » pour ce qui est écrit. La source canonique explique au contraire qu’un journal peut être incomplet ou erroné. La narration doit dire « le journal rapporte » et conserver les limites de provenance et de fidélité.

### P1 — L’audio, le visuel et l’exercice ne racontent pas le même transfert

Le script `sexercer-transfer-graphic` parle d’un nom de fichier et d’une extension inhabituelle. Le visuel `ObservationTransferGraphic` affiche « Une mise à jour a échoué ». L’exercice canonique demande de raisonner sur « Fichier suspect bloqué à 14:02 ». Choisir une seule situation et la partager entre le script, le visuel et l’évaluation.

### P2 — La « transcription mot à mot » est une reformulation avec minutage estimé

Les vingt segments du maître ont un texte affiché différent du texte destiné à la synthèse, même après suppression des balises de pause. Le lecteur propose pourtant des mots cliquables synchronisés. La longueur des tokens ne permet pas de déterminer quand une syllabe a été prononcée. Le libellé « aligné par Gemini » concerne les segments, pas les mots.

Correction : une transcription fidèle et vérifiée ; un vrai alignement temporel si le surlignage mot à mot est conservé. À défaut, afficher une synthèse nommée comme telle et surligner seulement la phrase ou l’étape.

### P2 — La lecture avance pendant que l’élève devrait agir

La piste S’exercer passe de l’exercice 1 au suivant à 10,700 s, puis au transfert à 21,024 s. Le lecteur ne possède pas de jalon d’attente de réponse ; les vingt segments ne comportent que des repères de lecture/animation et de courtes pauses de diction. La vitesse disponible est 1×, 1,25×, 1,5×, 1,75× ou 2× : aucun ralentissement n’est proposé.

Correction : une question brève, arrêt explicite, action de l’élève, retour ciblé, puis reprise choisie. Ajouter un rythme ralenti et laisser le suivi visuel désactivable. Éviter qu’un défilement automatique éloigne la zone de réponse pendant la rédaction.

### P2 — Des détails techniques et des promesses dépassent la première leçon

La narration introduit 401, logger, disque, champs, filtre et comparaison de secrets sans préparation suffisante. L’énoncé « chaque erreur comprise évite une fausse alerte » promet un résultat individuel non démontré. Une introduction à l’observation peut rester sur le compte, l’heure et le résultat, avec leurs définitions ; les mécanismes d’authentification et de journalisation appartiennent à des approfondissements.

## Ce qui mérite d’être conservé

Un cas commun aux séquences principales, une voix configurée de façon constante, la réutilisation des mêmes extraits entre cours et animation, la lecture volontaire, les boutons pause/reprise et le repérage des pièces du dossier sont de bons points de départ. L’absence d’écrêtage mesuré écarte un défaut technique simple. Ces propriétés ne prouvent ni le naturel de la voix ni l’efficacité pédagogique.

## Ordre de correction recommandé

1. Réconcilier le modèle scientifique, le transfert et le vocabulaire avec le cours canonique.
2. Transformer les longs commentaires en interventions liées aux décisions : question, attente, manipulation, explication du résultat.
3. Unifier le texte parlé et sa transcription ; rendre l’approximation du minutage explicite ou remplacer le calcul par un alignement vérifié.
4. Générer un petit échantillon, faire une écoute réelle de prononciation et tester avec un débutant avant de régénérer l’ensemble.

L’[IES Practice Guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), recommandations 2, 3 et 7, étaye l’alternance exemples/exercices, l’association graphique/explication et les questions explicatives. Il ne valide pas notre débit ou notre interface. Le [W3C, critère 1.2.1](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html) demande une information équivalente accessible pour l’audio préenregistré selon son contexte ; il ne prescrit pas de karaoké mot à mot. Sources consultées le 15 novembre 2026.
