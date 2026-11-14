# Studio scientifique d'apprentissage

Direction validée par l'utilisateur le 14 novembre 2026 : sombre, scientifique, débutants accompagnés.

## Identité et composition

Fond graphite #101312, surfaces #191e1b, texte ivoire #f0f1e9, accent végétal #c8ed97, bleu expérimental #a9c7fa, bordures #303932. Manrope locale pour la lecture et les titres ; monospace système pour les adresses, états et valeurs. Titres généreux, alignés à gauche ; lignes courtes et espaces de respiration.

L'élément distinctif de l'accueil est une expérience de mémoire directement manipulable : une valeur décimale devient un octet dans une grille d'adresses. Les autres zones restent calmes. Les numéros servent exclusivement la progression des chapitres.

```text
Ordinateur
marque / cours / méthode                         aide au démarrage
intention et premier pas          expérience mémoire manipulable
rechercher / filtrer
cours mémoire                    cours réseau
méthode : observer → manipuler → expliquer

Cours
retour / sujet / durée
titre et promesse concrète
sommaire des chapitres | idée → exemple → expérience → vérification
                     | précédent / suivant / bilan

Mobile
navigation compacte
titre puis expérience
sommaire repliable et chapitre courant
une seule colonne ; boutons tactiles
```

## Règles d'expérience

- Aucun faux compte, taux de réussite, avis, progression ou cours indisponible présenté comme accessible.
- Le score mesure les réponses réellement vérifiées pendant cette session. Visiter un chapitre ne signifie pas le maîtriser.
- Le mode guidé montre un chapitre. La lecture complète reste disponible. Changer de chapitre garde les réponses d'exercices en mémoire pendant la session.
- Les données du simulateur expliquent une relation causale. Les animations ne tournent pas sans demande.
- Les termes spécialisés sont définis avant leur usage ; les détails avancés et les références se déplient à la demande.
- Les contenus en revue restent identifiés comme tels, sans suggérer une approbation scientifique acquise.

## Validation

Pour un aperçu isolé sur Windows, préfixer le PATH du processus avec le Node LTS installé, définir `CYBER_SCHOOL_PREVIEW=1`, puis lancer `corepack pnpm --filter @cyber-school/web exec next dev --hostname 127.0.0.1 --port 3100`. Le cache est dédié sous `node_modules/.cache/cyber-school-next-studio`. Avec cet aperçu actif, définir `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100` pour les vérifications navigateur. Le build de production garde son répertoire habituel.

Captures 1280 × 800 et 375 × 812, recherche sans résultat, retour aux cours, navigation des chapitres au clavier, réponses conservées, cas d'erreur pédagogique, mouvements réduits, console vide. Exécuter la suite de qualité commune après les changements.
