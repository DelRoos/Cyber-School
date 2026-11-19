# ADR-0008 — Pages de cours structurées et workflow de fabrication

- Date : 2026-11-14
- Statut : décision d'implémentation additive, en cours de validation
- Tâche : TASK-023

## Problème

La mission V4 liste les livrables mais ne formalise ni le contenu complet d'un chapitre ni son assemblage dans la page. Le rendu générique actuel affiche surtout des résumés. Les expériences sur mesure restent utiles et doivent continuer de fonctionner.

## Décision

Ajouter, sans modifier le contrat existant des manifestes, un fichier facultatif `lessons/<slug>/course.page.json`, validé par Zod. Il contient le texte réellement affiché, les exemples résolus, les prédictions, les références aux exercices et aux composants d'expérience enregistrés. Un rendu partagé l'affiche automatiquement ; une nouvelle page de ce format n'exige pas de route ni de composant de page propres.

Les expériences restent des composants React et des moteurs déterministes testés, enregistrés explicitement dans le code. Une chaîne de caractères ou une donnée externe ne devient jamais du code exécutable. Les pages sur mesure sans ce fichier gardent leur rendu actuel.

Un script de workflow prépare les entrées et inspecte les sorties. Il indique l'étape suivante à l'agent, sans lancer de modèles ni orchestrer des services externes. Une structure complète ne constitue pas une QA réussie : les preuves du système existant et la revue humaine restent requises. Les commandes d'inspection sont en lecture seule ; écrire les rapports ou la conception se fait avant la QA afin de ne pas invalider son empreinte.

## Alternatives

Continuer à coder chaque page et ses textes dans un composant autonome rend la réception pédagogique difficile à automatiser. Générer une page à la volée ajoute un service, un coût et une surface de confiance hors du périmètre. Le contrat additif conserve la liberté des simulations tout en donnant une structure contrôlable aux pages produites.

## Validation prévue

Tests négatifs du contrat et du workflow ; compatibilité des trois cours existants ; pilote complet issu d'une unité V4 ; parcours clavier, erreurs pédagogiques, retour aux exercices et affichage mobile ; suite de qualité existante. Aucun changement de statut published sans approbation humaine réelle.
