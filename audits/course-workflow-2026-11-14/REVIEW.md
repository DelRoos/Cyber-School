# Réception du workflow de cours — TASK-023

Pilote : `/lessons/understanding-alerts-and-evidence`.

- Quatre chapitres, huit notions V4 et huit exercices, deux moteurs déterministes.
- Réception ciblée en production : deux tests Playwright réussis (1280×800 et 375×812), 25,0 s au total.
- Contrôles effectifs : dénominateur, modification de paramètres, comparaison du taux de base, source indisponible, confrontation d’événements, clavier, huit réponses justes, invalidation après modification, navigation depuis l’évaluation, lecture complète, sources, aucune erreur console et aucun débordement horizontal.
- Captures inspectées : `pilot-corrected/understanding-alerts-and-e-d49d8-n-base-rates-and-provenance-chromium-desktop/complete-course-guided.png`, sa version `complete-course-full.png`, et la capture guidée correspondante `chromium-mobile`.
- Correction visuelle : explication des transformations en pleine largeur sur mobile ; taille du texte de 14 px dans la bannière.
- Correction du scénario : pointer le libellé visible du radio natif, sans clic forcé sur un champ masqué visuellement.
- Réception complète du dépôt : consulter le résultat effectivement produit par `quality:verify --task TASK-023`, aucune réussite anticipée ici.
- La présence d’un dossier, d’un test ou d’un identifiant d’expérience constitue une vérification structurelle. L’exécution QA et la revue humaine restent deux étapes distinctes.
- Revue scientifique et pédagogique humaine pending. Aucun accord ni publication effectuée par l’agent.

Les premiers essais ont conservé leurs échecs : refus de lecture du bac à sable Windows, dépassements de délai, test de clic sur un champ masqué. La réception ciblée finale utilise les permissions natives, une build de production, un port et un dossier de résultats isolés. Les essais interrompus ne servent jamais de preuve de validation.

Réception complète réussie : `continuity/validation/2026-11-14T14-02-38-289Z-a8a1439c-9314-4580-b81f-a94319196d3f/result.json`. Neuf commandes avec code zéro ; 36 garde-fous, 36 tests unitaires et 16 scénarios navigateur. Les trois cours précédents restent couverts par les scénarios de régression.
