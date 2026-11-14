# Contrat de production des cours

Ce contrat s'applique à Codex, Claude Code et Gemini, aux leçons sur mesure et aux lots du curriculum. Les schémas et les garde-fous de publication restent obligatoires. Un plan JSON valide ne prouve pas qu'un cours est compréhensible.

## Avant d'écrire

Définir le public, ce qu'il sait déjà et une action observable qu'il saura accomplir. Pour un débutant, partir d'une question concrète et définir chaque nouveau terme avant son utilisation. Réutiliser les prérequis du graphe ; ne pas annoncer une maîtrise sans preuve.

Créer une fiche de conception dans `docs/courses/<slug>/` : objectif, prérequis, sources primaires précises, affirmations vérifiables, simplifications, erreurs fréquentes, séquence d'apprentissage et critères de validation. Ne pas multiplier les fichiers sans usage.

## Séquence minimale d'un chapitre

1. **Question** : un problème réel et une seule idée principale.
2. **Intuition** : explication courte avec vocabulaire défini. Une analogie précise ses limites.
3. **Exemple résolu** : données initiales, étapes et résultat ; nombres identiques au simulateur.
4. **Prédiction** : demander ce qui devrait changer avant une manipulation.
5. **Expérience** : contrôle, état observable et conséquence expliquée côte à côte.
6. **Vérification** : raisonnement, contre-exemple ou diagnostic ; feedback ciblé pour chaque erreur.
7. **Bilan et transfert** : une phrase à retenir, une variante du problème, lien vers le prérequis à revoir.

Ce déroulé est une décision de conception du projet. Il s'appuie notamment sur l'alternance exemples/exercices, les représentations visuelles accompagnées de texte et les questions explicatives décrites dans le [guide de l'Institute of Education Sciences](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). Ce guide ne valide pas automatiquement nos cours ni tous les détails de ce déroulé.

## Rigueur scientifique

- Relier les affirmations à une section de source primaire. Distinguer spécification, comportement d'une implémentation, simplification et résultat non garanti.
- Un moteur déterministe, testé indépendamment de l'interface, produit les états. Les valeurs, flèches, couleurs et explications représentent ces états.
- Toute animation respecte le [playbook d'animations pédagogiques](../design/PEDAGOGICAL_ANIMATION_PLAYBOOK.md) et le skill `pedagogical-animation` : elle rend visibles les objets réels du concept (pointeurs, chunks, portes logiques, flèches causales) avec un delta explicite `avant → après`.
- Ne jamais présenter une illustration d'un comportement indéfini comme une conséquence garantie. Les traces de compilateur indiquent leurs hypothèses et ne sont pas dites mesurées si elles sont seulement illustratives.
- Les distracteurs correspondent à de vraies confusions. Le retour explique la cause, la correction et quoi réobserver ; le score seul n'enseigne rien.
- Prévoir une occasion de rappel ultérieur. Ne pas fabriquer de notifications, de calendrier de révision ou de progression persistante si ces fonctions n'existent pas.

## Expérience et mise en page

Lire le [brief du studio](../design/LEARNING_STUDIO.md). La prose principale vise au moins 14 px sur mobile, un interligne généreux et environ 50–75 caractères par ligne. Les adresses et légendes peuvent être plus petites si elles restent lisibles. Ne pas compresser le cours pour faire tenir toutes ses notions dans un écran.

Le mode guidé expose une étape, un exemple et une tâche identifiables. La lecture complète est disponible. Changer de chapitre conserve les réponses de la session. L'état courant, le score et les contrôles ont des intitulés explicites. Un chapitre visité n'est pas un chapitre maîtrisé.

Navigation et manipulation au clavier ; focus visible ; cibles tactiles de 44 px pour les contrôles principaux. Pas de lecture automatique au chargement. Une animation réduite conserve toutes les informations d'état. Couleur et mouvement ne portent jamais seuls une information.

## Réception avant publication

| Responsabilité         | Preuve attendue                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Conception pédagogique | Un objectif observable, un exemple résolu, une prédiction et une explication du résultat par chapitre                  |
| Exactitude             | Sources primaires, limites du modèle et invariants vérifiés                                                            |
| Frontend               | Rendu réel ordinateur/mobile, hiérarchie cohérente, recherche et liens fonctionnels                                    |
| QA                     | Scénario nominal, erreur, changement de réponse, retour de chapitre, clavier, mouvement réduit, console et débordement |
| Continuité             | Commandes réellement exécutées, captures inspectées et preuve valide après la dernière modification                    |
| Publication            | Revue scientifique et approbation humaine réelles selon les garde-fous communs                                         |

Toute ligne absente reste à traiter. Une compétence importée améliore les consignes ; elle ne remplace ni la revue ni les tests.
