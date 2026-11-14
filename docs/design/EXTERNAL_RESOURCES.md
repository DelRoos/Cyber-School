# Ressources importées pour le studio

## Compétence frontend-design

- Source : [Anthropic / skills](https://github.com/anthropics/skills/tree/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/frontend-design).
- Révision : `2c5958ecac7cee2b583967a2c4981d0f4a75c579`.
- Licence : Apache 2.0, conservée dans chaque copie du skill.
- Installation : outil officiel `skill-installer`, destination canonique `.agents/skills/frontend-design`, miroir `.claude/skills/frontend-design`. Gemini et Codex utilisent la source canonique ; aucun paquet global ajouté.
- Contrôle : instructions et licence lues avant utilisation. Aucun script exécutable dans ce skill. SHA-256 du SKILL.md importé : `d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d3`.

Les préférences du demandeur et les règles du dépôt restent prioritaires. Les choix esthétiques sont documentés dans le brief ; la compétence ne donne aucune approbation scientifique.

## Police Manrope

- Source : [Google Fonts / Manrope](https://github.com/google/fonts/tree/main/ofl/manrope).
- Fichier variable `Manrope[wght].ttf`, copié dans `apps/web/src/app/fonts/Manrope.ttf` et servi localement par Next.js.
- Licence SIL Open Font License 1.1 conservée dans `apps/web/src/app/fonts/OFL.txt`.
- SHA-256 : `3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6`.
- Aucun appel à Google Fonts depuis le navigateur ni téléchargement de police nécessaire au build.

## Référence pédagogique

Le [guide IES sur l'organisation de l'apprentissage](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) est une référence consultée, pas un logiciel installé. Sa synthèse locale sert à orienter les exemples, les manipulations et les questions. Le contenu des cours reste fondé sur leurs sources techniques propres.
