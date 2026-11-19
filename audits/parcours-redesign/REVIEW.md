# Revue de la refonte Parcours — 14 novembre 2026

## Résultat

`/parcours` est une page d’orientation : point de départ dans le tronc commun, cinq directions complémentaires, recherche, filtres, récupération après une recherche vide. Les six programmes possèdent un détail cohérent, avec objectifs, prérequis, recherche dans les modules et chapitres dépliables.

Le tronc commun est mis en avant sans progression fictive. La carte des fondations explique une séquence ; elle ne représente pas un score ni une maîtrise acquise. La navigation entre parcours réinitialise correctement le programme courant. Les liens directs `#noeud-*` ouvrent le module demandé.

## Captures effectivement inspectées

| Vue | Dimensions | Capture |
| --- | --- | --- |
| Catalogue ordinateur | 1280 × 800 | [catalog-desktop.png](catalog-desktop.png) |
| Catalogue mobile | 375 × 812 | [catalog-mobile.png](catalog-mobile.png) |
| Programme ordinateur | 1280 × 800 | [programme-desktop.png](programme-desktop.png) |
| Programme mobile | 375 × 812 | [programme-mobile.png](programme-mobile.png) |
| Titre long et programme étroit | 320 × 812 | [programme-320.png](programme-320.png) |

Les captures finales proviennent du serveur local existant, après activation des contrôles pour vérifier leur hydratation. Les cinq vues ont zéro erreur de console, zéro exception et aucun débordement horizontal. Le titre « Approfondissements » reste entier à 320 px. Les captures ne masquent pas le bouton de développement Next.js.

## Preuve officielle

[Rapport généré réussi](../../continuity/validation/2026-11-14T18-49-45-317Z-555c90eb-4142-4923-b8e0-bfbba7e0dcbd/result.json), empreinte `0b9614eb3a293684841981c56447854b26ad185edcc49b35f360f4be10bbc3a5`.

Commande exécutée : `corepack pnpm quality:verify --task TASK-024`, sous Node 22.23.5. Les neuf commandes passent : `test:guards`, `typecheck`, `lint`, `format:check`, `validate:governance`, `validate:curriculum`, `test:unit`, `build`, `test:e2e`.

- Garde-fous : 36 tests réussis.
- Tests unitaires : 25 tests réussis sur les packages actuels, dont 6 dans l’application Web.
- Navigateur : 10 scénarios réussis sur le build de production, dont 6 scénarios indépendants couvrant la refonte.
- Recherche insensible aux accents et à la casse, filtres combinés, résultats vides et réinitialisation : vérifiés.
- Accordéons avec Entrée et Espace, déplier/replier, navigation du sélecteur, fermeture avec Échap et restitution du focus : vérifiés.
- Six programmes et liens directs de modules à 320 px, mouvement réduit : vérifiés.

Les vérifications initiales ont aussi identifié un test de référentiel trop lent : les données étaient relues et validées pour chaque résumé de domaine. La lecture et la validation sont désormais mutualisées à l’échelle d’une requête, sans cache global périmé. Le test de chargement des six parcours prend environ 315 ms dans la preuve finale, contre un dépassement initial de la limite de cinq secondes.

## Accessibilité et rédaction

| Sévérité initiale | Emplacement | Avant | Après | Effet |
| --- | --- | --- | --- | --- |
| HIGH | `apps/web/src/components/parcours/parcours-studio-page.tsx:68` | Deux éléments main imbriqués dans l’ancienne composition | Un seul main, fourni par le layout | Repères de navigation cohérents |
| HIGH | `apps/web/src/components/parcours/parcours-studio-page.tsx:338` | Des cours annoncés accessibles après leur retrait par une autre session | Programme en construction et accès au programme | Disponibilité fidèle à l’état des routes |
| MEDIUM | `apps/web/src/components/parcours/parcours-catalog.tsx:133` | Choix du parcours mêlé à une carte technique dense | Orientation explicite, choix puis détail | Identification du premier pas |
| MEDIUM | `apps/web/src/components/parcours/parcours-studio-page.tsx:186` | Petites commandes et lecture technique chargée | Boutons natifs, état développé et panneau associé | Usage au clavier et exposition de l’état |
| MEDIUM | `apps/web/src/app/parcours.css:1` | Mise en page et titre long à revoir au format étroit | Reflow à 320 px et titre adapté | Lecture sans défilement horizontal |

Focus visible mesuré : contour plein de 2 px sur les filtres et boutons de modules. L’échantillon de contrastes calculés sur les textes significatifs présente un minimum de 5,56:1 ; le séparateur décoratif masqué aux technologies d’assistance est exclu de ce résultat. Aucun mouvement automatique n’est introduit. Les contrôles sont natifs ; les champs possèdent un label, les résultats une région de statut. Les descriptions principales sur mobile font au moins 14 px. Les libellés annoncent leur destination effective.

Non vérifié : restitution vocale dans un lecteur d’écran, Safari et Firefox. Aucun audit WCAG exhaustif n’est revendiqué.

## Intégration simultanée et limites

Une autre session, confirmée par l’utilisateur, a retiré les routes de cours et `/curriculum`, leurs liens, des composants pédagogiques et leurs tests. Ces changements sont conservés. Les pages Parcours annoncent donc des programmes consultables, avec des modules et cours à venir ; aucun accès immédiat à un cours absent n’est promis. Le retour des pages de cours est hors du périmètre de TASK-024.

Les tentatives de validation interrompues par ces modifications restent enregistrées avec leurs échecs et empreintes invalidées. TASK-023 reste rouverte : sa preuve locale était périmée et ses critères concernant les cours doivent être réexaminés après leur retrait. Aucune preuve ou approbation scientifique n’a été inventée.

Approve pour la refonte Parcours sur l’empreinte vérifiée.
