# Audit pédagogique, visuel et du démonstrateur TCP

## Contrat de connaissance et scénario

La hiérarchie Domain → Module → Chapter → AtomicConcept est effectivement représentée par les schémas et les JSON. Quatre concepts possèdent définition, objectifs, prérequis, relations typées, sources, niveau et critères de validation. Le handshake est réutilisé dans deux chapitres. Une leçon comprend médium justifié, étapes, exercices et laboratoire. Les ressources sont indexées et marquées comme contenu externe non fiable.

Le corpus sépare donc déjà connaissances conceptuelles et métadonnées d'expérience. La séparation avec le scénario scientifique et la vue reste partielle : le composant TCP contient les événements, explications, numéros et états sous forme de frames TSX ; le manifeste reproduit un autre ensemble d'étapes avec des IDs différents. Ni la cohérence entre ces deux descriptions ni la correspondance animation/explication n'est validée automatiquement (AUD-019).

`AssessmentBlueprint` permet de décrire concepts, seuil et exercices, mais rien ne l'évalue ni ne vérifie ses liens. La révision de contenu n'est pas distinguée de la version de format 1.0. Les sources n'ont ni section précise, date de vérification, version documentaire, ni trace de revue. Ces lacunes compliqueraient le maintien d'un vaste corpus plus que l'absence d'une bibliothèque visuelle supplémentaire (AUD-008/026/027/028/032).

## Capacité des exercices

| Besoin de la mission | Capacité actuelle | Limite |
| --- | --- | --- |
| QCM argumenté | Implémenté, distracteurs avec feedback et explication | Sémantique clavier radio incomplète ; choix correct non relié par invariant à ses options |
| Compréhension / prédiction | Prédiction sous forme de choix ; trois exercices réels | Pas de réponse ouverte structurée ni de diagnostic indépendant de la sélection |
| Ordonnancement | Liste avec boutons Monter/Descendre | Validation de permutation absente ; test dit clavier utilisant des clics |
| Classement / association | Pas de type ni de renderer | Futur format, sans obligation de l'installer pour M1 |
| Analyse de diagramme / erreur conceptuelle / problème | Possible comme QCM rédigé | Aucun mécanisme spécifique de réponse sur diagramme ni de raisonnement en étapes |
| Multi-concepts / évaluation cumulative | Schéma de blueprint uniquement | Pas de moteur, couverture ou agrégation des concepts |
| Conservation des réponses / maîtrise | État React par carte et booléens du parent | Rechargement perdant l'état ; pas d'historique, révision, tentative ou maîtrise attestée |

La plateforme n'exécute aucun code d'apprenant et n'inclut pas d'éditeur de code. Cela correspond à l'objectif de compréhension. Les réponses correctes présentes dans le manifeste client sont normales pour cet usage d'autoévaluation ; elles ne constitueraient pas une protection d'examen certifiant.

Les trois exercices du TCP ont des réponses numériques/chronologiques correctes et des distracteurs qui expliquent des confusions réelles. Le deuxième comporte néanmoins une faute temporelle : connaissance du client attribuée après émission plutôt qu'après réception du SYN-ACK (AUD-025). Le compteur peut conserver une réussite quand la carte est remise à zéro ou modifiée (AUD-020). L'explication commune de l'ordonnancement ne diagnostique pas la position exacte erronée ; c'est une limite de feedback, pas une mauvaise correction de la séquence actuelle.

## Audit scientifique du TCP

Le déroulé nominal correspond à l'ouverture active/passive classique : serveur LISTEN, client SYN_SENT après SYN(100), réponse SYN-ACK(300,101), client ESTABLISHED et ACK(101,301), puis serveur ESTABLISHED après réception. Le SYN consomme bien une position de séquence et le troisième ACK est distingué de sa réception serveur. Ce parcours et les valeurs concordent avec l'exemple de la norme. [RFC 9293, établissement de connexion](https://datatracker.ietf.org/doc/html/rfc9293#section-3.5).

Les ISN simplifiés sont signalés. `SYN_RCVD` est ici une abréviation d'implémentation de SYN-RECEIVED, pas une erreur de transition. Le port 443 et la séparation TCP/TLS dans les distracteurs sont appropriés. La synchronisation ne fournit cependant pas de garantie de livraison future ; les expressions de fiabilité devraient rester attachées aux mécanismes TCP correspondants.

Le scénario de perte montre un SYN-ACK perdu, client SYN_SENT et serveur SYN_RCVD, puis retransmission du même segment. Ce chemin est plausible, mais sélectionné à l'avance : les timers concurrents client/serveur et autres pertes ne sont pas simulés. Le backoff est mentionné sans être quantifié ; le timeout de 2,2 s est une horloge de lecture, pas un RTO réseau. Il faut expliciter ce modèle simplifié au lieu de laisser supposer un simulateur TCP complet. Les labels de compteurs doivent définir clairement en-tête courant, SND.NXT et RCV.NXT (AUD-025).

Le laboratoire ne tient pas sa promesse : la page liée décrit le suivi de flux, et non une activité guidée de filtrage des segments d'ouverture. Une source officielle peut être exacte sans être le bon support pour une activité précise. [Wireshark, Following Protocol Streams](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html).

## Moteur visuel : présent, futur et non mesuré

| Capacité | Observation |
| --- | --- |
| 2D animée / diagramme | SVG réseau avec trois directions et badges d'états ; GSAP déplace la capsule |
| Progression / retour / accès direct | État explicite d'index, bornage, reset, boutons de navigation et flèches sur la région |
| Lecture / pause | Timer nettoyé ; pause de progression sans pause du tween courant (AUD-023) |
| Explication synchronisée | Panneau Motion indexé par frame ; annonces ARIA présentes dans le code |
| Historique des événements | Perte initiale effacée visuellement quand la retransmission remplace son tracé (AUD-024) |
| Simulation manipulable | Choix nominal/perte uniquement ; pas de paramètres ISN/latence/RTO éditables |
| Graphes / D3 / XYFlow | Documentés pour M2, absents du code et des dépendances |
| Three.js / R3F / GPU | Documentés pour M3, aucune scène ou ressource GPU actuelle |

La 2D est le bon choix pour cet échange séquentiel ; les règles du dépôt le justifient explicitement. Installer Three.js pour démontrer une ambition future n'améliorerait pas cette leçon. Les budgets 3D, fallback WebGL et disposal restent des exigences écrites sans preuve de capacité actuelle.

Le nettoyage existant est pertinent : timeout annulé au changement/démontage, `gsap.context().revert()`, écouteur matchMedia retiré. Aucun handler global ou boucle infinie n'a été identifié. Cela réduit certains risques ; aucune mesure de fuite mémoire, FPS, CPU, bundle ou stabilité à long terme n'a été réalisée. Le rendu serveur des hooks n'accède pas directement à window avant les effets. Le hook de préférence initialisé à false et le re-montage du panneau/live region nécessitent une observation au premier affichage et avec lecteur d'écran.

## Accessibilité, responsive et qualité visuelle

Signaux favorables du code : `lang="fr"`, lien d'évitement, navigation/main nommés, boutons HTML, légende textuelle du paquet, texte d'explication indépendant du mouvement, focus visibles prévus, progression avec attributs ARIA et responsive par classes. Les boutons de réordonnancement sont nommés.

Défauts ou limites spécifiques : radios custom sans comportement aux flèches ; transition de progression non neutralisée en reduced-motion ; variante destructive calculée à 3,34:1 pour du petit texte ; chemins de génération des styles faux ; possible perte d'annonce sur un panneau remonté à chaque étape, non vérifiée (AUD-007/021/022/031). La présence de role/status et aria-live ne suffit pas à certifier les annonces.

Les tests déclarent 1280×800 et 375×812, mais le projet n'a pas démarré. **Aucune capture d'écran, observation mobile, mesure de contraste final, performance, erreur console ou conformité WCAG globale n'est produite.** Une capture d'un mock ou du seul SVG aurait donné une fausse preuve de rendu ; elle n'a pas été substituée à l'application.

Le ratio de contraste calculé concerne uniquement une paire de tokens d'une variante non utilisée par le démonstrateur. Les autres couleurs ne sont pas déclarées non conformes. Le modèle clavier attendu pour un radiogroup inclut focus géré et flèches ; les boutons actuels restent activables par Tab/Entrée/Espace. [Modèle radio WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

## Réception pédagogique proposée

Faire relire instants, compteurs et simplifications ; corriger la correspondance du laboratoire ; relier les étapes au modèle événementiel ; vérifier les trois exercices et l'invalidation de leur résultat. Ensuite observer nominal/perte, lecture/pause, clavier et préférence de mouvement sur les deux viewports, avec captures et console. Les prérequis eux-mêmes sont des concepts planifiés sans cours : les badges actuels ne constituent pas encore un parcours complet du débutant. Ces limites doivent rester explicites au moment de la publication.
