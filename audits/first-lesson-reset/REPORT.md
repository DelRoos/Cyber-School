# Première leçon complète — 15 novembre 2026

Demande : retirer les anciens cours et éprouver une méthode pédagogique sur une seule vraie leçon. L’utilisateur confirme le premier sujet V4 et le terme « leçon ». Aucun autre cours n’est produit dans ce lot.

## Livraison

- Page : `/cours/observation-et-interpretation`, accessible depuis le tronc commun.
- Un seul dossier actif dans `lessons/`. Les quatre anciens cours sont retirés, leurs slugs renvoient 404. Leur dernier état a été vérifié dans `previous-courses.zip` avant suppression des répertoires actifs.
- V4 canonique conservé. Couverture exacte TC00.001 ; TC00.002 à TC00.008 restent dans l’unité suivante. Import idempotent : 54 modules, 1122 notions du V4, 160 unités de planification, sans nouvelle leçon implicite.
- Cinq étapes : découvrir, comprendre, manipuler, s’exercer, retenir. Explications, exemple résolu, expérience à données fixes, quatre exercices corrigés, rédaction personnelle avec auto-vérification, bilan, sources, fiche Markdown téléchargeable et suggestion de rappel le lendemain.
- Réponses et note conservées localement par révision ; édition invalidant une correction ; stockage bloqué toléré ; effacement confirmé et échec d’effacement annoncé. Aucun envoi distant des réponses.

## Relecture

Relecture contradictoire pédagogique et technique par un agent en contexte neuf. Ajustements appliqués : définition de la tâche automatique ; vraie rédaction avec grille ; précision des repères sources ; repli d’effacement du stockage avec avertissement si l’effacement et l’écrasement échouent. L’utilisateur décline une seconde relecture par un autre modèle.

La revue scientifique et l’approbation humaine restent `pending`. Le bilan des exercices n’est pas une certification de maîtrise ; la rédaction libre n’est pas notée automatiquement.

## Inspection du rendu

Captures de la compilation de production inspectées visuellement :

- [Début sur ordinateur](final-captures/desktop-start.png)
- [Atelier sur ordinateur](final-captures/desktop-workbench.png)
- [Bilan sur mobile](final-captures/mobile-recap.png)
- [Atelier à 320 px et mouvement réduit](final-captures/mobile-320.png)

Chromium, vues 1280 × 800, 375 × 812 et 320 × 740. Vérification des cinq étapes au clavier, focus visible, radios natives avec flèches, dialogue avec Échap et retour de focus, erreurs de formulaire, états annoncés, absence de débordement horizontal. Les captures ont conduit à répartir la navigation sur deux rangées sur les petits écrans. Aucun test manuel avec lecteur d’écran matériel n’est revendiqué.

## Réception

Les commandes et journaux de la dernière réception sont dans `continuity/validation/`. Le rapport officiel lié à cette tâche est enregistré dans son `verificationRef` et dans le checkpoint ; ce document ne remplace pas cette preuve générée.

La première réception a repéré les liens historiques vers les cours supprimés et l’absence de la tâche dans le backlog ; ils ont été corrigés. L’en-tête des critères de la tâche a aussi été normalisé avant la réception finale pour que leur contenu soit effectivement lié à la preuve.

Réception finale réussie : [rapport généré](../../continuity/validation/2026-11-15T00-23-45-707Z-50ed5997-f7d2-433f-aae3-a2c66b803ad1/result.json). Neuf contrôles réussis : test:guards (37), typecheck, lint, format:check, validate:governance, validate:curriculum (un seul manifeste), test:unit (33), build (une seule page de leçon), test:e2e (20 scénarios sur la compilation de production). Aucune modification du code ou du contenu après cette réception ; seules les métadonnées administratives et ce rapport sont mis à jour.
