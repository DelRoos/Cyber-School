# Parcours de formation ultra-atomique — cybersécurité offensive, plateformes Web/mobile/IA et investigations numériques

**Version approfondie — novembre 2026. Progression par dépendances, sans durée imposée.**

Ce parcours est un **inventaire structuré des acquis à maîtriser**, et non une promesse qu'une seule personne peut devenir experte dans tous les domaines par la lecture. Les exercices conceptuels peuvent valider la compréhension et le raisonnement ; l'expertise opérationnelle se vérifie ensuite en laboratoires externes, en missions autorisées et sous revue indépendante.

## Comment utiliser la granularité

- **Domaine → module → compétence atomique → micro-leçon.** Chaque micro-leçon ci-dessous enseigne un seul mécanisme ou une seule distinction testable.
- Pour chaque micro-leçon, construire une visualisation adaptée (diagramme, animation d'états, chronologie ou simulation), puis vérifier **définition → mécanisme → prédiction → contre-exemple → transfert**.
- Après un ensemble cohérent de micro-leçons, imposer une épreuve de synthèse, puis orienter vers les **laboratoires externes et ressources associés au module** dans la partie précédente.
- Les enseignements sont conçus pour comprendre, **spécifier, analyser et vérifier** ; l'IA peut rédiger l'implémentation, mais l'apprenant doit comprendre les algorithmes, les parties critiques du code et les preuves de correction.
- Les scénarios d'attaque active sont enseignés dans des laboratoires ou audits expressément autorisés. Les enquêtes privées n'incluent pas l'intrusion clandestine sur les appareils d'autrui.

## Structure et ordre recommandé

1. **TC** — logique, machine, systèmes, réseaux, Web/API, algorithmique et IA, maths/crypto, méthodologies.
2. **A** — audits Web, API, Android, iOS, AppSec, QA, fintech/Mobile Money, systèmes IA.
3. **B** — infrastructure, AD, Linux, méthodologie offensive, post-exploitation simulée, Red Team, bas niveau et malware.
4. **C** — OSINT, escroqueries, renseignement, forensics, attribution, preuves et sécurité des personnes.
5. **D** — missions professionnelles, rapports, copilotes IA, gouvernance et qualité.
6. **X** — approfondissements transversaux modernes : pédagogie cognitive, méthodes d'audit, identités, cloud-native, agents IA, sécurité mobile, contenus synthétiques et OPSEC.

Les branches A, B et C peuvent progresser en parallèle **après leurs prérequis du tronc commun**. Les modules X enrichissent les modules existants sans répéter inutilement leur socle.

---

# Modules fondamentaux et professionnels

## TC-00 — Logique, preuve et recherche

**Micro-leçons, dans l’ordre pédagogique :**

- **TC00.001** — Distinguer une observation brute d’une interprétation.
- **TC00.002** — Séparer hypothèse, prédiction et conclusion.
- **TC00.003** — Formuler une hypothèse falsifiable.
- **TC00.004** — Identifier les variables contrôlées d’une expérience.
- **TC00.005** — Définir une variable confondante.
- **TC00.006** — Décrire une chaîne causale et ses hypothèses.
- **TC00.007** — Reconnaître une corrélation sans causalité.
- **TC00.008** — Construire un contre-exemple minimal.
- **TC00.009** — Mesurer le risque de faux positif.
- **TC00.010** — Mesurer le risque de faux négatif.
- **TC00.011** — Appliquer les probabilités conditionnelles à une alerte.
- **TC00.012** — Intégrer le taux de base à une décision.
- **TC00.013** — Distinguer preuve directe et preuve circonstancielle.
- **TC00.014** — Qualifier la provenance d’une assertion.
- **TC00.015** — Reconnaître une information de seconde main.
- **TC00.016** — Confronter deux sources contradictoires.
- **TC00.017** — Définir les critères d’une reproduction indépendante.
- **TC00.018** — Interpréter un intervalle d’incertitude.
- **TC00.019** — Réviser une conclusion après un contre-indice.
- **TC00.020** — Reconnaître les limites d’un exemple pédagogique.
- **TC00.021** — Expliquer la récupération active.
- **TC00.022** — Planifier une révision espacée.
- **TC00.023** — Distinguer aisance de lecture et maîtrise durable.
- **TC00.024** — Réfuter une réponse IA avec une source vérifiable.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-01 — Représentation binaire et calcul

**Micro-leçons, dans l’ordre pédagogique :**

- **TC01.001** — Convertir décimal et binaire sans calculatrice.
- **TC01.002** — Convertir hexadécimal et binaire.
- **TC01.003** — Distinguer entier signé et non signé.
- **TC01.004** — Expliquer le complément à deux.
- **TC01.005** — Détecter un dépassement de capacité entier.
- **TC01.006** — Comprendre les représentations flottantes.
- **TC01.007** — Expliquer une erreur d’arrondi flottant.
- **TC01.008** — Construire une table de vérité.
- **TC01.009** — Calculer AND OR XOR NOT.
- **TC01.010** — Distinguer opérateur bit à bit et opérateur logique.
- **TC01.011** — Expliquer registre et compteur ordinal.
- **TC01.012** — Décrire le cycle fetch/decode/execute.
- **TC01.013** — Représenter les transferts entre registres et mémoire.
- **TC01.014** — Comparer hiérarchie cache RAM disque.
- **TC01.015** — Expliquer adresse virtuelle et physique.
- **TC01.016** — Décrire la traduction par tables de pages.
- **TC01.017** — Définir un défaut de page.
- **TC01.018** — Distinguer processus et thread.
- **TC01.019** — Identifier les context switches.
- **TC01.020** — Expliquer l’accès noyau et userland.
- **TC01.021** — Distinguer interruption et appel système.
- **TC01.022** — Représenter pile et tas.
- **TC01.023** — Suivre une variable locale jusqu’à sa destruction.
- **TC01.024** — Reconstituer les appels de fonctions imbriqués.
- **TC01.025** — Expliquer le format ELF et PE à haut niveau.
- **TC01.026** — Décrire compilation assemblage édition de liens.
- **TC01.027** — Reconnaître endianness et alignement.
- **TC01.028** — Identifier les limites d’une analogie mémoire.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-02 — Linux, Windows et isolation

**Micro-leçons, dans l’ordre pédagogique :**

- **TC02.001** — Interpréter une arborescence UNIX.
- **TC02.002** — Lire les chemins absolus et relatifs.
- **TC02.003** — Interpréter permissions rwx par utilisateur et groupe.
- **TC02.004** — Expliquer ACL et permissions effectives.
- **TC02.005** — Distinguer UID réel et effectif.
- **TC02.006** — Comprendre les bits setuid et setgid.
- **TC02.007** — Décrire le rôle de sudo.
- **TC02.008** — Examiner les variables PATH et HOME.
- **TC02.009** — Distinguer shell et terminal.
- **TC02.010** — Reconnaître une redirection et un pipeline.
- **TC02.011** — Décrire le lancement d’un service systemd.
- **TC02.012** — Lire un journal horodaté Linux.
- **TC02.013** — Distinguer processus zombie et orphelin.
- **TC02.014** — Identifier les points de persistance légitimes des services.
- **TC02.015** — Expliquer le rôle du registre Windows.
- **TC02.016** — Distinguer service et tâche planifiée Windows.
- **TC02.017** — Comprendre l’UAC.
- **TC02.018** — Lire un événement de sécurité Windows.
- **TC02.019** — Décrire PowerShell et ses pipelines d’objets.
- **TC02.020** — Distinguer virtualisation complète et conteneurs.
- **TC02.021** — Expliquer namespaces et cgroups.
- **TC02.022** — Comprendre image couche volume et snapshot.
- **TC02.023** — Définir les limites d’isolation d’un conteneur.
- **TC02.024** — Concevoir un réseau de laboratoire isolé.
- **TC02.025** — Formuler une procédure de restauration après test.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-03 — Réseaux de l’électricité à HTTP

**Micro-leçons, dans l’ordre pédagogique :**

- **TC03.001** — Distinguer signal trame paquet segment et message.
- **TC03.002** — Décrire les rôles des couches réseau.
- **TC03.003** — Représenter encapsulation et décapsulation.
- **TC03.004** — Expliquer une adresse MAC.
- **TC03.005** — Distinguer hub switch et routeur.
- **TC03.006** — Reconstruire la résolution ARP.
- **TC03.007** — Définir broadcast unicast multicast.
- **TC03.008** — Calculer un CIDR IPv4.
- **TC03.009** — Identifier adresse réseau et broadcast.
- **TC03.010** — Comparer IPv4 et IPv6.
- **TC03.011** — Distinguer route locale et route par défaut.
- **TC03.012** — Expliquer le TTL/Hop Limit.
- **TC03.013** — Décrire NAT et ses limites.
- **TC03.014** — Expliquer VLAN et segmentation.
- **TC03.015** — Distinguer VPN et proxy.
- **TC03.016** — Décrire un datagramme UDP.
- **TC03.017** — Expliquer SYN SYN-ACK ACK.
- **TC03.018** — Interpréter les numéros de séquence TCP.
- **TC03.019** — Expliquer ACK et retransmission.
- **TC03.020** — Comprendre fenêtrage et débit TCP.
- **TC03.021** — Interpréter timeout et RST.
- **TC03.022** — Distinguer congestion et limitation applicative.
- **TC03.023** — Expliquer requête DNS récursive.
- **TC03.024** — Distinguer A AAAA CNAME MX TXT.
- **TC03.025** — Expliquer cache DNS et TTL.
- **TC03.026** — Décrire certificat et chaîne de confiance TLS.
- **TC03.027** — Comparer TLS et chiffrement de bout en bout.
- **TC03.028** — Expliquer le rôle du SNI.
- **TC03.029** — Distinguer HTTP/1.1 HTTP/2 HTTP/3.
- **TC03.030** — Comprendre CDN reverse proxy et WAF.
- **TC03.031** — Reconstituer une requête du mobile au serveur.
- **TC03.032** — Replacer un événement réseau dans une chronologie.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-04 — Web, API et données

**Micro-leçons, dans l’ordre pédagogique :**

- **TC04.001** — Décrire les composants d’une URL.
- **TC04.002** — Distinguer origine site et domaine.
- **TC04.003** — Décrire méthode statut et en-têtes HTTP.
- **TC04.004** — Distinguer GET POST PUT PATCH DELETE.
- **TC04.005** — Expliquer idempotence et sûreté des méthodes.
- **TC04.006** — Comprendre Content-Type et négociation.
- **TC04.007** — Expliquer cookies et attributs Secure HttpOnly SameSite.
- **TC04.008** — Distinguer session serveur et token.
- **TC04.009** — Décrire un flux d’authentification.
- **TC04.010** — Distinguer authentification et autorisation.
- **TC04.011** — Expliquer contrôle d’accès à l’objet.
- **TC04.012** — Expliquer CORS et la same-origin policy.
- **TC04.013** — Distinguer XSS et injection côté serveur.
- **TC04.014** — Décrire DOM et événements navigateur.
- **TC04.015** — Décrire l’architecture SPA.
- **TC04.016** — Comparer monolithe et microservices.
- **TC04.017** — Distinguer REST GraphQL et RPC.
- **TC04.018** — Interpréter OpenAPI et schémas JSON.
- **TC04.019** — Expliquer pagination filtrage et tri.
- **TC04.020** — Expliquer transactions SQL et atomicité.
- **TC04.021** — Distinguer isolation transactionnelle et cohérence.
- **TC04.022** — Interpréter clé étrangère et unicité.
- **TC04.023** — Décrire une file de messages.
- **TC04.024** — Comprendre tâches asynchrones et retries.
- **TC04.025** — Définir race condition applicative.
- **TC04.026** — Raisonner sur la logique métier d’un paiement.
- **TC04.027** — Identifier les frontières de confiance d’une application.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-05 — Algorithmique et orchestration IA

**Micro-leçons, dans l’ordre pédagogique :**

- **TC05.001** — Décomposer un besoin en entrées sorties invariants.
- **TC05.002** — Différencier algorithme et implémentation.
- **TC05.003** — Lire un pseudo-code conditionnel.
- **TC05.004** — Tracer une boucle et son état.
- **TC05.005** — Identifier une condition d’arrêt.
- **TC05.006** — Distinguer valeur et référence.
- **TC05.007** — Comprendre tableau liste pile file et dictionnaire.
- **TC05.008** — Expliquer graphe et arbre.
- **TC05.009** — Comparer recherche linéaire et dichotomique.
- **TC05.010** — Expliquer récursion et pile d’appel.
- **TC05.011** — Estimer ordre de grandeur temporel.
- **TC05.012** — Expliquer complexité mémoire.
- **TC05.013** — Identifier une entrée invalide.
- **TC05.014** — Construire une table de cas limites.
- **TC05.015** — Distinguer test unitaire intégration et end-to-end.
- **TC05.016** — Lire une trace de débogage.
- **TC05.017** — Repérer un bug off-by-one.
- **TC05.018** — Distinguer erreur logique et erreur de syntaxe.
- **TC05.019** — Formaliser un contrat de fonction.
- **TC05.020** — Définir préconditions et postconditions.
- **TC05.021** — Formuler un cahier des charges pour une IA codeuse.
- **TC05.022** — Fournir des exemples et contre-exemples au générateur.
- **TC05.023** — Demander une suite de tests indépendante.
- **TC05.024** — Critiquer une modification IA non justifiée.
- **TC05.025** — Lire le diff d’une proposition.
- **TC05.026** — Analyser un test qui passe pour de mauvaises raisons.
- **TC05.027** — Rechercher une preuve externe avant acceptation.
- **TC05.028** — Définir un protocole de revue humaine.
- **TC05.029** — Documenter décision et compromis technique.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-06 — Mathématiques, crypto et identité

**Micro-leçons, dans l’ordre pédagogique :**

- **TC06.001** — Manipuler ensembles unions intersections.
- **TC06.002** — Décrire relations et fonctions.
- **TC06.003** — Lire un graphe orienté.
- **TC06.004** — Expliquer états probabilistes et distributions.
- **TC06.005** — Calculer fréquence conditionnelle simple.
- **TC06.006** — Comprendre entropie sans la confondre avec hasard.
- **TC06.007** — Distinguer hachage et chiffrement.
- **TC06.008** — Définir résistance aux collisions.
- **TC06.009** — Expliquer sel de mot de passe et KDF.
- **TC06.010** — Distinguer AES et RSA conceptuellement.
- **TC06.011** — Expliquer paire de clés et signature numérique.
- **TC06.012** — Comprendre certificats et PKI.
- **TC06.013** — Expliquer négociation de clés.
- **TC06.014** — Décrire l’intégrité de message par MAC.
- **TC06.015** — Différencier signature et MAC.
- **TC06.016** — Expliquer chiffrement authentifié AEAD.
- **TC06.017** — Reconnaître rôle des nonces.
- **TC06.018** — Comprendre secret rotation et révocation.
- **TC06.019** — Décrire menace de rejeu.
- **TC06.020** — Expliquer MFA et facteurs.
- **TC06.021** — Distinguer identité compte session appareil.
- **TC06.022** — Analyser récupération de compte et son risque.
- **TC06.023** — Distinguer confidentialité intégrité disponibilité authenticité.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## TC-07 — Fondations des méthodologies de sécurité

**Micro-leçons, dans l’ordre pédagogique :**

- **TC07.001** — Définir actif menace vulnérabilité exposition et impact.
- **TC07.002** — Représenter une frontière de confiance.
- **TC07.003** — Distinguer contrôle préventif détectif correctif.
- **TC07.004** — Construire une matrice vraisemblance-impact.
- **TC07.005** — Expliquer risque résiduel.
- **TC07.006** — Définir une surface d’attaque.
- **TC07.007** — Construire un diagramme de flux de données.
- **TC07.008** — Identifier les abus de logique métier.
- **TC07.009** — Distinguer CVE CWE et CVSS.
- **TC07.010** — Expliquer criticité technique versus criticité métier.
- **TC07.011** — Lire une exigence OWASP ASVS.
- **TC07.012** — Distinguer WSTG et ASVS.
- **TC07.013** — Décrire les phases PTES.
- **TC07.014** — Comparer boîte noire grise blanche.
- **TC07.015** — Établir périmètre et règles d’engagement.
- **TC07.016** — Définir comptes de test et données factices.
- **TC07.017** — Formuler un critère d’arrêt d’exploitation.
- **TC07.018** — Distinguer preuve de concept et dommage réel.
- **TC07.019** — Définir procédure d’escalade d’incident.
- **TC07.020** — Planifier re-test et clôture des constats.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-01 — Pentest Web : mécanismes fondamentaux

**Micro-leçons, dans l’ordre pédagogique :**

- **A01.001** — Distinguer cartographie de fonctionnalités et scan réseau.
- **A01.002** — Expliquer les erreurs de validation d’entrée.
- **A01.003** — Différencier injections SQL NoSQL et commandes.
- **A01.004** — Comprendre le rôle des requêtes paramétrées.
- **A01.005** — Distinguer XSS réfléchi stocké et DOM.
- **A01.006** — Comprendre encodage contextuel et CSP.
- **A01.007** — Expliquer CSRF et protections modernes.
- **A01.008** — Raisonner sur sessions et fixation de session.
- **A01.009** — Identifier une référence directe à un objet.
- **A01.010** — Comparer contrôle d’accès vertical et horizontal.
- **A01.011** — Comprendre mass assignment et surpostage.
- **A01.012** — Expliquer SSRF et impact sur services internes.
- **A01.013** — Comprendre traversée de chemin et manipulation de fichiers.
- **A01.014** — Analyser une politique d’upload.
- **A01.015** — Définir désérialisation non fiable.
- **A01.016** — Comprendre problèmes de concurrence web.
- **A01.017** — Analyser réinitialisation de mot de passe.
- **A01.018** — Examiner MFA et récupération de compte.
- **A01.019** — Distinguer OAuth 2.0 OpenID Connect SAML.
- **A01.020** — Comprendre redirections et validation du retour.
- **A01.021** — Construire une matrice rôle-action-objet.
- **A01.022** — Relier vulnérabilité et impact métier.
- **A01.023** — Expliquer l’intérêt d’un re-test.
- **A01.024** — Distinguer preuve technique et preuve contractuelle.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-02 — API et workflows complexes

**Micro-leçons, dans l’ordre pédagogique :**

- **A02.001** — Identifier une API depuis sa spécification.
- **A02.002** — Construire une matrice des ressources.
- **A02.003** — Distinguer identité appelant et identité propriétaire de ressource.
- **A02.004** — Comprendre BOLA et autorisation objet.
- **A02.005** — Comprendre BFLA et autorisation fonction.
- **A02.006** — Expliquer BOPLA et exposition de champs.
- **A02.007** — Différencier limite de débit et contrôle d’abus.
- **A02.008** — Comprendre pagination filtrage et fuite de ressources.
- **A02.009** — Examiner GraphQL au niveau du modèle.
- **A02.010** — Expliquer champs imbriqués et autorisations.
- **A02.011** — Comprendre sécurité de webhooks.
- **A02.012** — Distinguer signature de webhook et identité client.
- **A02.013** — Expliquer idempotency key.
- **A02.014** — Reconstituer un état de commande.
- **A02.015** — Comprendre retries et double traitement.
- **A02.016** — Identifier race condition dans paiement simulé.
- **A02.017** — Expliquer validation côté serveur.
- **A02.018** — Comparer montant affiché et montant autoritatif.
- **A02.019** — Distinguer authentification API et session mobile.
- **A02.020** — Analyser scopes de tokens.
- **A02.021** — Comprendre rotation des secrets API.
- **A02.022** — Expliquer abus de logique métier sans vulnérabilité technique classique.
- **A02.023** — Prioriser l’impact sur des données et comptes de démonstration.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-03 — Sécurité Android complète

**Micro-leçons, dans l’ordre pédagogique :**

- **A03.001** — Décrire architecture Android et sandbox.
- **A03.002** — Identifier le rôle d’une Activity.
- **A03.003** — Expliquer Services BroadcastReceiver et ContentProvider.
- **A03.004** — Comprendre intents explicites et implicites.
- **A03.005** — Distinguer permissions normales et dangereuses.
- **A03.006** — Lire manifest et composants exportés.
- **A03.007** — Expliquer signing et identités applicatives.
- **A03.008** — Décrire cycle de vie d’application.
- **A03.009** — Identifier stockage interne versus externe.
- **A03.010** — Comprendre SharedPreferences et limites.
- **A03.011** — Expliquer Keystore Android.
- **A03.012** — Distinguer secret statique et secret utilisateur.
- **A03.013** — Décrire trafic TLS d’application.
- **A03.014** — Comprendre network security configuration.
- **A03.015** — Comprendre WebView et frontière JavaScript.
- **A03.016** — Expliquer deep links et app links.
- **A03.017** — Analyser l’authentification biométrique conceptuellement.
- **A03.018** — Distinguer app locale et sécurité backend.
- **A03.019** — Interpréter une analyse statique MobSF.
- **A03.020** — Comprendre l’analyse dynamique et les états.
- **A03.021** — Lire du Kotlin d’authentification.
- **A03.022** — Lire une décompilation Java/Kotlin.
- **A03.023** — Définir menace d’un appareil compromis.
- **A03.024** — Comprendre limites de détection de root.
- **A03.025** — Interpréter résultats de tests OWASP MASTG.
- **A03.026** — Établir matrice de constatations Android.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-04 — Sécurité iOS complète

**Micro-leçons, dans l’ordre pédagogique :**

- **A04.001** — Décrire modèle de sandbox iOS.
- **A04.002** — Identifier App Bundle et signature.
- **A04.003** — Comprendre entitlements.
- **A04.004** — Expliquer provisioning et distribution.
- **A04.005** — Décrire cycle de vie d’une app Swift.
- **A04.006** — Distinguer Keychain et fichiers.
- **A04.007** — Expliquer classes de protection des fichiers.
- **A04.008** — Comprendre Secure Enclave conceptuellement.
- **A04.009** — Décrire App Transport Security.
- **A04.010** — Expliquer URL schemes et Universal Links.
- **A04.011** — Comprendre pasteboard et données partagées.
- **A04.012** — Différencier extensions et application hôte.
- **A04.013** — Comprendre permissions caméra micro localisation.
- **A04.014** — Examiner stockage Core Data et caches.
- **A04.015** — Décrire sauvegardes iCloud et menace de synchronisation.
- **A04.016** — Distinguer biométrie et gestion de session.
- **A04.017** — Lire un flux d’authentification Swift.
- **A04.018** — Interpréter traces de trafic d’app de test.
- **A04.019** — Comprendre les limites de l’analyse iOS.
- **A04.020** — Utiliser MASVS comme grille de contrôle.
- **A04.021** — Comparer risques Android et iOS sans généralisation.
- **A04.022** — Rédiger un constat d’audit iOS reproductible.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-05 — AppSec, chaîne logicielle et Cloud

**Micro-leçons, dans l’ordre pédagogique :**

- **A05.001** — Construire modèle STRIDE sur une architecture.
- **A05.002** — Décomposer confiance client API DB.
- **A05.003** — Définir exigences de sécurité par fonctionnalité.
- **A05.004** — Distinguer SAST DAST SCA et IAST.
- **A05.005** — Comprendre secret scanning.
- **A05.006** — Examiner politique de dépendances.
- **A05.007** — Comprendre SBOM et provenance des builds.
- **A05.008** — Distinguer signature et intégrité d’artefact.
- **A05.009** — Comprendre CI/CD et environnements.
- **A05.010** — Identifier risque d’un secret dans un pipeline.
- **A05.011** — Comprendre variables de configuration et coffre de secrets.
- **A05.012** — Décrire IAM et moindre privilège.
- **A05.013** — Distinguer rôles et politiques cloud.
- **A05.014** — Expliquer segmentation VPC.
- **A05.015** — Comparer conteneur et pod Kubernetes.
- **A05.016** — Comprendre service account et RBAC Kubernetes.
- **A05.017** — Expliquer stockage objet et accès public.
- **A05.018** — Décrire journalisation et alerting cloud.
- **A05.019** — Comprendre sauvegardes et restauration.
- **A05.020** — Lire une configuration IaC.
- **A05.021** — Vérifier une correction dans une version donnée.
- **A05.022** — Définir politique de exceptions et dette de sécurité.
- **A05.023** — Proposer mesures compensatoires réalistes.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-06 — QA, performance, disponibilité

**Micro-leçons, dans l’ordre pédagogique :**

- **A06.001** — Décrire critères d’acceptation mesurables.
- **A06.002** — Différencier bug de fonctionnalité et bug de sécurité.
- **A06.003** — Construire matrice de tests métier.
- **A06.004** — Définir test unitaire et contrat.
- **A06.005** — Définir test d’intégration des services.
- **A06.006** — Décrire test end-to-end.
- **A06.007** — Identifier cas limites de saisie.
- **A06.008** — Définir propriétés invariantes.
- **A06.009** — Expliquer tests basés sur propriétés.
- **A06.010** — Construire jeux de données de test.
- **A06.011** — Définir scénario de charge.
- **A06.012** — Distinguer débit latence et concurrence.
- **A06.013** — Interpréter p50 p95 p99.
- **A06.014** — Différencier saturation CPU et attente réseau.
- **A06.015** — Décrire test de montée en charge.
- **A06.016** — Distinguer stress endurance et spike test.
- **A06.017** — Interpréter traces de performance.
- **A06.018** — Comprendre disponibilité SLI SLO et SLA.
- **A06.019** — Définir budget d’erreur.
- **A06.020** — Expliquer circuit breaker et retry.
- **A06.021** — Évaluer accessibilité clavier.
- **A06.022** — Différencier bug intermittent et déterministe.
- **A06.023** — Construire une décision go/no-go.
- **A06.024** — Décrire re-test de régression.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-07 — Fintech, Mobile Money et systèmes de paiement

**Micro-leçons, dans l’ordre pédagogique :**

- **A07.001** — Décrire acteurs payeur bénéficiaire opérateur marchand.
- **A07.002** — Distinguer initiation autorisation capture et règlement.
- **A07.003** — Expliquer modèle ledger et solde dérivé.
- **A07.004** — Distinguer solde disponible et comptable.
- **A07.005** — Définir double entrée et invariants.
- **A07.006** — Analyser identifiant de transaction.
- **A07.007** — Distinguer transaction réussie échouée en attente.
- **A07.008** — Comprendre callbacks asynchrones.
- **A07.009** — Vérifier signature d’un callback en principe.
- **A07.010** — Expliquer idempotence des demandes de débit.
- **A07.011** — Comprendre doubles soumissions et retries.
- **A07.012** — Évaluer réconciliation de transactions.
- **A07.013** — Distinguer fraude opérationnelle et faille technique.
- **A07.014** — Examiner séparation des responsabilités.
- **A07.015** — Comprendre risque d’agent Mobile Money.
- **A07.016** — Évaluer limites et plafonds de compte.
- **A07.017** — Décrire processus de remboursement.
- **A07.018** — Reconstruire chronologie d’une transaction.
- **A07.019** — Définir preuve de non-duplication de débit.
- **A07.020** — Examiner gestion d’arrondis et devises.
- **A07.021** — Analyser cas d’indisponibilité opérateur.
- **A07.022** — Documenter risques sur transactions fictives.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-08 — Fondements IA, modèles et agents

**Micro-leçons, dans l’ordre pédagogique :**

- **A08.001** — Différencier IA statistique et système à règles.
- **A08.002** — Comprendre données d’entraînement validation test.
- **A08.003** — Décrire vecteur embedding.
- **A08.004** — Distinguer token et mot.
- **A08.005** — Expliquer transformer à haut niveau.
- **A08.006** — Visualiser attention sans anthropomorphisme.
- **A08.007** — Distinguer inférence et apprentissage.
- **A08.008** — Décrire prompt système développeur utilisateur.
- **A08.009** — Expliquer température et génération probabiliste.
- **A08.010** — Distinguer hallucination et erreur de récupération.
- **A08.011** — Comprendre chunking de documents.
- **A08.012** — Décrire RAG et retrieval.
- **A08.013** — Comparer recherche lexicale et vectorielle.
- **A08.014** — Définir métadonnées et filtrage d’accès au RAG.
- **A08.015** — Expliquer agent boucle observation-action.
- **A08.016** — Décrire tool calling.
- **A08.017** — Comprendre délégation agent à agent.
- **A08.018** — Définir protocoles connecteurs et MCP.
- **A08.019** — Décrire permissions des outils.
- **A08.020** — Comprendre mémoire de conversation.
- **A08.021** — Identifier opérations nécessitant approbation.
- **A08.022** — Expliquer traces et observabilité IA.
- **A08.023** — Distinguer évaluation modèle et évaluation système.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## A-09 — Sécurité IA et AI Red Team

**Micro-leçons, dans l’ordre pédagogique :**

- **A09.001** — Distinguer entrée non fiable et instruction de confiance.
- **A09.002** — Expliquer injection de prompt directe.
- **A09.003** — Expliquer injection indirecte via document.
- **A09.004** — Identifier frontières entre système utilisateur et outil.
- **A09.005** — Comprendre divulgation de données sensibles.
- **A09.006** — Analyser sortie structurée et risques de rendu.
- **A09.007** — Évaluer permissions d’un agent.
- **A09.008** — Expliquer principe du moindre privilège pour outils.
- **A09.009** — Distinguer résultat de RAG et instruction.
- **A09.010** — Comprendre empoisonnement des sources.
- **A09.011** — Identifier risque de dépendances de modèles.
- **A09.012** — Définir fuite inter-utilisateurs.
- **A09.013** — Comprendre isolation des tenants.
- **A09.014** — Expliquer erreurs d’autorisation d’un connecteur MCP.
- **A09.015** — Reconnaître décision nécessitant validation humaine.
- **A09.016** — Comprendre risques d’exécution de code déléguée.
- **A09.017** — Définir jeux de tests adversariaux.
- **A09.018** — Mesurer taux de réussite et faux positifs d’évaluation.
- **A09.019** — Expliquer régression de sécurité d’un modèle.
- **A09.020** — Distinguer garde-fou superficiel et propriété vérifiable.
- **A09.021** — Analyser journaux agent avec provenance.
- **A09.022** — Construire une matrice menace-contrôle-test.
- **A09.023** — Rédiger constat IA sans surestimer la sévérité.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-01 — Infrastructure et réseau d’entreprise

**Micro-leçons, dans l’ordre pédagogique :**

- **B01.001** — Distinguer inventaire d’actifs et reconnaissance intrusive.
- **B01.002** — Définir périmètre IP autorisé.
- **B01.003** — Comprendre ports TCP UDP et exposition.
- **B01.004** — Interpréter résultat de découverte de service.
- **B01.005** — Expliquer fingerprinting et ses incertitudes.
- **B01.006** — Décrire segmentation et zones de confiance.
- **B01.007** — Identifier chemins réseau possibles.
- **B01.008** — Comprendre DNS interne et résolution.
- **B01.009** — Distinguer proxy sortie et proxy entrée.
- **B01.010** — Comprendre architecture VPN d’entreprise.
- **B01.011** — Expliquer bastion et accès administrateur.
- **B01.012** — Décrire partage SMB et permissions.
- **B01.013** — Comprendre SSH et gestion des clés.
- **B01.014** — Interpréter service non corrigé versus exploitable.
- **B01.015** — Expliquer configuration par défaut risquée.
- **B01.016** — Construire cartographie d’exposition.
- **B01.017** — Prioriser systèmes critiques sans les perturber.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-02 — Identités Windows et Active Directory

**Micro-leçons, dans l’ordre pédagogique :**

- **B02.001** — Distinguer domaine forêt unité organisationnelle.
- **B02.002** — Expliquer contrôleur de domaine.
- **B02.003** — Comprendre Kerberos sans procédures d’abus.
- **B02.004** — Décrire ticket TGT et ticket de service.
- **B02.005** — Distinguer NTLM et Kerberos.
- **B02.006** — Comprendre groupes et groupes imbriqués.
- **B02.007** — Définir ACL et droits effectifs AD.
- **B02.008** — Comprendre GPO et héritage.
- **B02.009** — Décrire LDAP et annuaire.
- **B02.010** — Identifier comptes de service et risques.
- **B02.011** — Expliquer délégation d’authentification conceptuellement.
- **B02.012** — Comprendre rôles privilégiés.
- **B02.013** — Décrire relations de confiance inter-domaines.
- **B02.014** — Comprendre credential hygiene.
- **B02.015** — Analyser graphe de privilèges à partir de données de labo.
- **B02.016** — Distinguer risque d’une relation et preuve de compromission.
- **B02.017** — Décrire surveillance des accès.
- **B02.018** — Documenter chemin d’attaque hypothétique sans le confondre avec une exploitation réelle.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-03 — Linux, conteneurs et privilèges

**Micro-leçons, dans l’ordre pédagogique :**

- **B03.001** — Distinguer identité effective et réelle.
- **B03.002** — Lire permissions sur un fichier.
- **B03.003** — Comprendre sudoers et périmètres de commande.
- **B03.004** — Expliquer capabilities Linux.
- **B03.005** — Identifier isolation par namespace.
- **B03.006** — Comprendre cgroups et limites ressources.
- **B03.007** — Décrire sockets et IPC.
- **B03.008** — Expliquer montage et permissions.
- **B03.009** — Comprendre services root et utilisateur.
- **B03.010** — Analyser risques de secrets d’environnement.
- **B03.011** — Comprendre droits du démon Docker.
- **B03.012** — Distinguer host network et réseau isolé.
- **B03.013** — Expliquer RBAC Kubernetes.
- **B03.014** — Décrire ServiceAccount et tokens.
- **B03.015** — Comprendre séparation pod-nœud.
- **B03.016** — Reconnaître configuration risquée dans un labo.
- **B03.017** — Définir barrière de confiance à tester.
- **B03.018** — Décrire remediation par moindre privilège.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-04 — Méthodologie offensive professionnelle

**Micro-leçons, dans l’ordre pédagogique :**

- **B04.001** — Distinguer audit de conformité et test d’intrusion.
- **B04.002** — Lire une lettre d’autorisation et périmètre.
- **B04.003** — Définir règles d’engagement.
- **B04.004** — Identifier risques d’interruption de service.
- **B04.005** — Définir fenêtres de test.
- **B04.006** — Concevoir critères d’arrêt.
- **B04.007** — Organiser reconnaissance passive et active autorisée.
- **B04.008** — Établir carte des points d’entrée.
- **B04.009** — Formuler hypothèses d’exploitation.
- **B04.010** — Distinguer vulnérabilité probable et confirmée.
- **B04.011** — Construire arbre de chemins d’impact.
- **B04.012** — Définir preuve minimale suffisante.
- **B04.013** — Préparer comptes et données de démonstration.
- **B04.014** — Évaluer profondeur nécessaire de PoC.
- **B04.015** — Documenter chaque action significative.
- **B04.016** — Préserver journaux et observations.
- **B04.017** — Interpréter résultats inattendus.
- **B04.018** — Décider quand demander autorisation complémentaire.
- **B04.019** — Décrire nettoyage et restauration.
- **B04.020** — Produire rapport technique et exécutif.
- **B04.021** — Vérifier correction et régression.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-05 — Post-exploitation contrôlée et persistance simulée

**Micro-leçons, dans l’ordre pédagogique :**

- **B05.001** — Distinguer accès initial et état post-compromission.
- **B05.002** — Comprendre limites de privilèges obtenus.
- **B05.003** — Définir objectif de test post-exploitation.
- **B05.004** — Modéliser les relations de confiance.
- **B05.005** — Analyser permissions sur données fictives.
- **B05.006** — Identifier exposition de secrets de test.
- **B05.007** — Comprendre mouvement latéral comme concept ATT&CK.
- **B05.008** — Distinguer passage entre hôtes et entre identités.
- **B05.009** — Expliquer persistance comme mécanisme défensivement observable.
- **B05.010** — Classer points de persistance systèmes.
- **B05.011** — Représenter chronologie d’un accès simulé.
- **B05.012** — Analyser journaux de laboratoire.
- **B05.013** — Corréler changements d’état et événements.
- **B05.014** — Définir marqueur de persistance inoffensif de test.
- **B05.015** — Prévoir suppression et restauration.
- **B05.016** — Évaluer impact potentiel sans exfiltrer de données réelles.
- **B05.017** — Formaliser limites d’autorisation.
- **B05.018** — Décrire mesures de détection et remédiation.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-06 — Red Team, Purple Team et émulation

**Micro-leçons, dans l’ordre pédagogique :**

- **B06.001** — Définir objectifs d’une Red Team.
- **B06.002** — Distinguer pentest ciblé et émulation.
- **B06.003** — Définir scénario d’adversaire fictif.
- **B06.004** — Comprendre tactique technique et procédure.
- **B06.005** — Lire ATT&CK sans le confondre avec procédure d’attaque.
- **B06.006** — Construire matrice menace-détection.
- **B06.007** — Définir hypothèse de couverture de détection.
- **B06.008** — Expliquer rôle blue team.
- **B06.009** — Expliquer rôle purple team.
- **B06.010** — Définir métrique de détection.
- **B06.011** — Mesurer temps de découverte et réponse.
- **B06.012** — Distinguer réussite offensive et réussite de l’exercice.
- **B06.013** — Construire timeline d’exercice.
- **B06.014** — Décrire communications de sécurité entre équipes.
- **B06.015** — Identifier faux positifs de détection.
- **B06.016** — Analyser lacune de journalisation.
- **B06.017** — Proposer tests de régression défensifs.
- **B06.018** — Mener débriefing avec décisions mesurables.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-07 — Architecture machine, C et assembleur

**Micro-leçons, dans l’ordre pédagogique :**

- **B07.001** — Distinguer code source assembleur machine.
- **B07.002** — Expliquer convention d’appel conceptuellement.
- **B07.003** — Identifier registres principaux d’une architecture.
- **B07.004** — Décrire pile d’appels bas niveau.
- **B07.005** — Reconnaître prologue et épilogue de fonction.
- **B07.006** — Expliquer pointeur et déréférencement.
- **B07.007** — Distinguer tableau et pointeur.
- **B07.008** — Comprendre allocation heap et durée de vie.
- **B07.009** — Décrire accès mémoire hors limites.
- **B07.010** — Expliquer entiers signés et dépassements.
- **B07.011** — Comprendre alignement et padding.
- **B07.012** — Interpréter endian dans un dump.
- **B07.013** — Décrire sections ELF.
- **B07.014** — Décrire sections PE.
- **B07.015** — Comparer symboles présents et supprimés.
- **B07.016** — Comprendre relocation et liaison dynamique.
- **B07.017** — Lire branchements conditionnels simples.
- **B07.018** — Tracer une fonction désassemblée courte.
- **B07.019** — Décrire debugger et breakpoint.
- **B07.020** — Différencier analyse statique et exécution contrôlée.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-08 — Recherche de vulnérabilités en laboratoire

**Micro-leçons, dans l’ordre pédagogique :**

- **B08.001** — Définir un modèle de menace pour un parseur.
- **B08.002** — Distinguer défaut de validation et corruption mémoire.
- **B08.003** — Reconnaître catégorie CWE de corruption.
- **B08.004** — Comprendre dépassement de tampon conceptuellement.
- **B08.005** — Comprendre use-after-free conceptuellement.
- **B08.006** — Comprendre integer overflow et taille d’allocation.
- **B08.007** — Décrire race condition bas niveau.
- **B08.008** — Expliquer ASLR comme protection.
- **B08.009** — Expliquer NX/DEP.
- **B08.010** — Comprendre canaries de pile.
- **B08.011** — Lire trace de crash.
- **B08.012** — Distinguer crash et exploitation fiable.
- **B08.013** — Comprendre couverture de code.
- **B08.014** — Décrire fuzzing mutationnel.
- **B08.015** — Différencier faux positif de sanitizer.
- **B08.016** — Construire cas minimal de reproduction sur logiciel de test.
- **B08.017** — Définir impact et prérequis d’une vulnérabilité.
- **B08.018** — Expliquer divulgation coordonnée.
- **B08.019** — Rédiger analyse de cause racine.
- **B08.020** — Vérifier un patch et cas limite.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-09 — Reverse engineering logiciel et mobile

**Micro-leçons, dans l’ordre pédagogique :**

- **B09.001** — Lire chaînes et métadonnées d’un binaire.
- **B09.002** — Comprendre imports et exports.
- **B09.003** — Reconstituer graphe d’appels.
- **B09.004** — Interpréter conditions dans un désassembleur.
- **B09.005** — Expliquer graphe de flot de contrôle.
- **B09.006** — Comparer décompilation et source réelle.
- **B09.007** — Identifier variables reconstruites incertaines.
- **B09.008** — Distinguer obfuscation et compression.
- **B09.009** — Reconnaître packer conceptuellement.
- **B09.010** — Comprendre résolution dynamique de symboles.
- **B09.011** — Interpréter une trace de processus de labo.
- **B09.012** — Analyser dépendances et bibliothèques.
- **B09.013** — Décrire protocoles d’application à partir de données de test.
- **B09.014** — Comprendre particularités DEX Android.
- **B09.015** — Lire code Java décompilé de façon critique.
- **B09.016** — Distinguer mécanismes Swift Objective-C.
- **B09.017** — Comprendre limites de décompilation mobile.
- **B09.018** — Documenter hypothèses d’ingénierie inverse.
- **B09.019** — Évaluer une conclusion avec preuves indépendantes.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-10 — Analyse de malwares défensive

**Micro-leçons, dans l’ordre pédagogique :**

- **B10.001** — Définir isolement d’un échantillon.
- **B10.002** — Décrire danger d’une exécution non isolée.
- **B10.003** — Examiner hash taille type de fichier.
- **B10.004** — Interpréter import table et signatures.
- **B10.005** — Distinguer famille comportement et attribution.
- **B10.006** — Décrire persistance comme indice.
- **B10.007** — Identifier comportement d’accès fichiers.
- **B10.008** — Reconnaître processus enfant et injection comme indicateurs.
- **B10.009** — Comprendre réseau C2 au niveau de détection.
- **B10.010** — Interpréter DNS suspect en contexte.
- **B10.011** — Analyser chronologie de modifications sur un bac à sable.
- **B10.012** — Décrire détection YARA conceptuellement.
- **B10.013** — Expliquer Sigma et événements.
- **B10.014** — Distinguer IOC de TTP.
- **B10.015** — Identifier artefacts de malware dans un dossier de laboratoire.
- **B10.016** — Documenter incertitude de classification.
- **B10.017** — Construire recommandations de confinement.
- **B10.018** — Préserver preuves et environnement isolé.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## B-11 — Ingénierie logicielle offensive multiplateforme et recherche sur la persistance

**Micro-leçons, dans l’ordre pédagogique :**

**01 — Positionnement, frontières et architecture**

- **B11.001** — Distinguer agent d’administration légitime, implant offensif, malware et outil forensique.
- **B11.002** — Définir le modèle de menace d’une activité de maintien d’accès.
- **B11.003** — Identifier les frontières de confiance entre utilisateur, application, service et noyau.
- **B11.004** — Séparer architecture de logiciel, comportement observé et intention attribuée.
- **B11.005** — Décrire les droits et contraintes d’une mission offensive écrite.
- **B11.006** — Comparer preuve d’impact, persistance observée et contrôle durable hypothétique.
- **B11.007** — Distinguer modèle d’attaque historique et risque applicable à une version récente.
- **B11.008** — Définir des conditions d’arrêt, de restauration et de suppression de tous les artefacts de test.

**02 — Exécution logicielle multiplateforme**

- **B11.009** — Comparer processus, thread, service et tâche planifiée.
- **B11.010** — Expliquer la création et la terminaison d’un processus.
- **B11.011** — Décrire les espaces mémoire utilisateur et noyau.
- **B11.012** — Comprendre héritage d’environnement, identités et permissions des processus.
- **B11.013** — Comparer formats exécutables PE, ELF et Mach-O.
- **B11.014** — Expliquer signatures de code, notarisation et validation de chargement.
- **B11.015** — Décrire mécanismes de lancement et d’arrêt sur Windows, Linux et macOS.
- **B11.016** — Comparer application Android, service d’arrière-plan et restrictions d’exécution.
- **B11.017** — Comparer extension iOS, processus applicatif et sandbox.
- **B11.018** — Distinguer mécanismes de démarrage sur machines virtuelles, conteneurs et systèmes embarqués.

**03 — Modèles de privilèges et isolation**

- **B11.019** — Différencier autorisation, authentification et privilège effectif.
- **B11.020** — Expliquer jetons, sessions, groupes et droits de service.
- **B11.021** — Comparer ACL, capacités Linux et contrôles MAC.
- **B11.022** — Expliquer UAC, intégrité de processus et restrictions Windows à haut niveau.
- **B11.023** — Expliquer SELinux, AppArmor et isolation par namespaces.
- **B11.024** — Comparer sandbox mobile et isolation des applications de bureau.
- **B11.025** — Expliquer privilèges d’un conteneur et frontières avec l’hôte.
- **B11.026** — Analyser une matrice d’accès fictive et détecter les excès de privilèges.
- **B11.027** — Prédire les conséquences d’une mauvaise configuration sur un graphe de confiance.

**04 — Recherche de vulnérabilités et impact système**

- **B11.028** — Distinguer bug, vulnérabilité et possibilité réelle de compromission.
- **B11.029** — Expliquer types de corruption mémoire et erreurs logiques.
- **B11.030** — Comprendre une chaîne de préconditions d’exploitation.
- **B11.031** — Distinguer crash, exécution de code et élévation de privilèges.
- **B11.032** — Expliquer primitives d’exploitation à un niveau conceptuel.
- **B11.033** — Comprendre ASLR, DEP/NX, CFI et autres mitigations.
- **B11.034** — Comparer exploitation utilisateur, noyau, navigateur et hyperviseur.
- **B11.035** — Formuler une hypothèse de risque sur une application volontairement vulnérable.
- **B11.036** — Concevoir une preuve minimale avec données factices et sans effet persistant.
- **B11.037** — Expliquer les limites d’un exploit reproduit sur une version non représentative.

**05 — Persistance : modèles et traces**

- **B11.038** — Définir la persistance et la différencier de la simple durée d’exécution.
- **B11.039** — Classer les grandes familles de mécanismes de démarrage automatique.
- **B11.040** — Expliquer les services Windows comme surface de contrôle et de détection.
- **B11.041** — Expliquer unités systemd et autres gestionnaires de services Linux.
- **B11.042** — Expliquer launchd et les autorisations macOS.
- **B11.043** — Comparer persistance liée à un compte, à une machine et à une infrastructure.
- **B11.044** — Expliquer pourquoi la persistance mobile est différente selon OS et version.
- **B11.045** — Analyser conceptuellement des techniques de persistance firmware/UEFI.
- **B11.046** — Comprendre la persistance dans le cloud par identités, tâches et configurations.
- **B11.047** — Décrire les événements de journalisation susceptibles de révéler un changement de démarrage.
- **B11.048** — Distinguer éléments légitimes et indices contextuels de modification suspecte.
- **B11.049** — Construire une chronologie avant-après d’un marqueur inoffensif autorisé.
- **B11.050** — Concevoir un protocole de réversibilité et de vérification de nettoyage.

**06 — Commande distante et télémétrie**

- **B11.051** — Distinguer architecture client-serveur et modèle agent-contrôleur.
- **B11.052** — Comparer session interactive, collecte périodique et messagerie asynchrone.
- **B11.053** — Expliquer authentification mutuelle et séparation des rôles.
- **B11.054** — Analyser latence, fréquence de communication et métadonnées observables.
- **B11.055** — Distinguer trafic de supervision légitime et activité anormale selon contexte.
- **B11.056** — Identifier les traces DNS, TLS, HTTP et proxy utiles à une enquête.
- **B11.057** — Expliquer limites d’attribution à partir d’adresses IP et noms de domaine.
- **B11.058** — Concevoir une simulation de télémétrie transparente sur deux machines de laboratoire.
- **B11.059** — Interpréter journaux et captures d’une communication de test.
- **B11.060** — Définir rotation de clés, révocation et suppression d’accès d’un agent légitime.

**07 — Analyse et simulation des comportements adverses**

- **B11.061** — Lire les tactiques ATT&CK sans les traiter comme un tutoriel opérationnel.
- **B11.062** — Distinguer procédure observée, hypothèse et comportement simulé.
- **B11.063** — Créer un graphe de scénarios fictifs multi-étapes.
- **B11.064** — Définir objectifs et indicateurs de réussite d’un exercice Purple Team.
- **B11.065** — Associer chaque comportement simulé à un capteur ou un journal attendu.
- **B11.066** — Comparer visibilité hôte, réseau, identité et cloud.
- **B11.067** — Identifier les échecs de corrélation entre plusieurs sources de logs.
- **B11.068** — Évaluer risques de faux positif et faux négatif pour une détection.
- **B11.069** — Analyser un scénario de persistance bénigne après redémarrage en environnement isolé.
- **B11.070** — Définir procédures d’arrêt immédiat et de retour à l’état initial.

**08 — Reverse engineering et forensics**

- **B11.071** — Identifier les indices d’un comportement de lancement automatique dans des artefacts.
- **B11.072** — Lire la liste des modules et bibliothèques d’un binaire de test.
- **B11.073** — Interpréter un arbre de processus et ses relations temporelles.
- **B11.074** — Expliquer l’apport du désassemblage et de l’analyse dynamique.
- **B11.075** — Comparer artefacts mémoire, disque, registre et journaux.
- **B11.076** — Distinguer IOC spécifique et comportement durable.
- **B11.077** — Construire des hypothèses forensiques concurrentes.
- **B11.078** — Vérifier intégrité, horodatages et provenance des échantillons.
- **B11.079** — Rédiger un rapport de capacités sans supposer l’intention ou l’identité d’un auteur.
- **B11.080** — Proposer un plan de remédiation et de contrôle post-incident.

**09 — Ingénierie logicielle assistée par IA**

- **B11.081** — Rédiger une spécification claire d’un agent de supervision consentie.
- **B11.082** — Définir interfaces, données, permissions et limites attendues.
- **B11.083** — Faire générer par IA un composant de démonstration explicitement visible et révocable.
- **B11.084** — Lire le code généré et identifier les appels système sensibles.
- **B11.085** — Exiger tests unitaires, journaux et garde-fous dans la spécification.
- **B11.086** — Définir une stratégie de revue humaine des portions critiques.
- **B11.087** — Comparer comportement annoncé et comportement réel de la simulation.
- **B11.088** — Identifier une proposition IA qui introduit une capacité non demandée.
- **B11.089** — Définir menaces liées aux dépendances et à la chaîne d’approvisionnement.
- **B11.090** — Produire documentation de suppression, restauration et preuve d’exécution autorisée.

**10 — Validation experte et exercice de synthèse**

- **B11.091** — Expliquer à l’oral une chaîne de comportements de compromission fictive.
- **B11.092** — Distinguer constat prouvé, hypothèse plausible et scénario impossible.
- **B11.093** — Construire une cartographie multiplateforme des surfaces de persistance.
- **B11.094** — Justifier les limites d’une démonstration contrôlée.
- **B11.095** — Interpréter un jeu de journaux hétérogènes relatif à un changement de service.
- **B11.096** — Identifier les traces permettant de confirmer ou d’infirmer une hypothèse.
- **B11.097** — Définir une instrumentation permettant de mesurer la détection.
- **B11.098** — Produire une analyse de risques et une feuille de remédiation.
- **B11.099** — Présenter une preuve de remise en état du laboratoire.
- **B11.100** — Réussir une étude de cas inédite après une période sans révision.

**Preuves de compréhension attendues :** décrire les mécanismes, comparer les modèles Windows/Linux/macOS/Android/iOS/cloud/IoT, raisonner sur les privilèges et les traces, interpréter des cas inédits et concevoir des simulations transparentes, réversibles et limitées aux systèmes de laboratoire.

## C-01 — OSINT et vérification numérique

**Micro-leçons, dans l’ordre pédagogique :**

- **C01.001** — Distinguer source ouverte et donnée privée.
- **C01.002** — Définir question d’enquête.
- **C01.003** — Construire plan de collecte.
- **C01.004** — Qualifier provenance d’un post public.
- **C01.005** — Vérifier date d’une capture.
- **C01.006** — Différencier pseudonyme et identité légale.
- **C01.007** — Expliquer limites des moteurs de recherche.
- **C01.008** — Identifier recherche inversée d’image.
- **C01.009** — Analyser métadonnées documentaires fournies.
- **C01.010** — Relever indices géographiques d’image publique.
- **C01.011** — Distinguer localisation supposée et confirmée.
- **C01.012** — Examiner historique public d’un domaine.
- **C01.013** — Comparer déclarations sur plusieurs profils publics.
- **C01.014** — Vérifier un compte usurpé.
- **C01.015** — Construire graphe d’indices non conclusif.
- **C01.016** — Identifier risque de faux rapprochement.
- **C01.017** — Conserver copie et URL d’une source.
- **C01.018** — Décrire horodatage et fuseau.
- **C01.019** — Assigner degré de confiance et justification.
- **C01.020** — Distinguer information publique et autorisation d’usage.
- **C01.021** — Évaluer risques de représailles pour un témoin.
- **C01.022** — Rédiger note sans accusation prématurée.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-02 — Fraudes en Afrique et brouteurs

**Micro-leçons, dans l’ordre pédagogique :**

- **C02.001** — Décrire cycle d’une escroquerie sentimentale.
- **C02.002** — Différencier faux recrutement et vrai employeur.
- **C02.003** — Identifier mécanismes psychologiques de pression.
- **C02.004** — Reconnaître impersonation de marque.
- **C02.005** — Décrire faux vendeur de marketplace.
- **C02.006** — Identifier élément frauduleux dans un reçu de test.
- **C02.007** — Comprendre manipulation de preuve de paiement.
- **C02.008** — Décrire fraude Mobile Money sans intrusion.
- **C02.009** — Distinguer numéro appelant et propriétaire réel.
- **C02.010** — Expliquer spoofing d’identité.
- **C02.011** — Interpréter échange de messages consenti.
- **C02.012** — Reconstituer chronologie d’une demande de paiement.
- **C02.013** — Identifier point de contact et canal.
- **C02.014** — Corréler faux sites publiquement visibles.
- **C02.015** — Distinguer complice suspect et victime intermédiaire.
- **C02.016** — Reconnaître risque d’accuser une personne usurpée.
- **C02.017** — Décrire préservation d’une annonce supprimable.
- **C02.018** — Construire fiche de signalement structurée.
- **C02.019** — Définir limites d’une enquête privée.
- **C02.020** — Proposer orientation vers opérateur plateforme ou autorité.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-03 — Threat Intelligence et campagnes

**Micro-leçons, dans l’ordre pédagogique :**

- **C03.001** — Distinguer renseignement brut et analyse.
- **C03.002** — Définir IOC et contexte.
- **C03.003** — Distinguer indicateur faible et fort.
- **C03.004** — Expliquer tactique technique et procédure.
- **C03.005** — Lire ATT&CK avec précaution attributive.
- **C03.006** — Décrire Diamond Model.
- **C03.007** — Définir entité observée dans un graphe.
- **C03.008** — Différencier campagne et incident.
- **C03.009** — Définir période d’activité observée.
- **C03.010** — Identifier hypothèse de réutilisation d’infrastructure.
- **C03.011** — Comprendre données STIX et relations.
- **C03.012** — Décrire partage TAXII conceptuellement.
- **C03.013** — Expliquer marquage TLP.
- **C03.014** — Distinguer confiance de source et confiance d’analyse.
- **C03.015** — Construire deux hypothèses adverses.
- **C03.016** — Prévoir obsolescence d’un IOC.
- **C03.017** — Documenter une lacune de collecte.
- **C03.018** — Produire briefing CTI factuel.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-04 — Renseignement sur infrastructures

**Micro-leçons, dans l’ordre pédagogique :**

- **C04.001** — Comprendre domaine sous-domaine et TLD.
- **C04.002** — Distinguer DNS actuel et historique.
- **C04.003** — Interpréter enregistrements A AAAA MX NS.
- **C04.004** — Comprendre ASN et allocation IP.
- **C04.005** — Distinguer hébergeur CDN et propriétaire.
- **C04.006** — Expliquer certificat et Certificate Transparency.
- **C04.007** — Comprendre serveur virtuel mutualisé.
- **C04.008** — Distinguer cohébergement et lien criminel.
- **C04.009** — Identifier similarités techniques ambiguës.
- **C04.010** — Analyser date de première observation.
- **C04.011** — Construire graphe domaine-IP-certificat.
- **C04.012** — Documenter résolution à une date donnée.
- **C04.013** — Distinguer attribut d’infrastructure et attribut humain.
- **C04.014** — Évaluer risques d’enrichissement tiers.
- **C04.015** — Conserver provenance des données.
- **C04.016** — Proposer suivi périodique d’indicateurs.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-05 — Fondements forensiques et acquisition

**Micro-leçons, dans l’ordre pédagogique :**

- **C05.001** — Distinguer analyse sur système actif et image.
- **C05.002** — Définir volatilité des traces.
- **C05.003** — Expliquer copie bit à bit.
- **C05.004** — Comprendre écriture bloquée et intégrité.
- **C05.005** — Décrire hachage SHA-256 avant/après.
- **C05.006** — Définir chaîne de conservation.
- **C05.007** — Documenter réception d’un support.
- **C05.008** — Distinguer original copie de travail et extraction.
- **C05.009** — Expliquer métadonnées MACB.
- **C05.010** — Comprendre systèmes de fichiers et journaux.
- **C05.011** — Décrire fichiers supprimés et limites de récupération.
- **C05.012** — Distinguer donnée utilisateur et système.
- **C05.013** — Identifier horloge et fuseau.
- **C05.014** — Expliquer normalisation des timestamps.
- **C05.015** — Définir journal d’actions de l’analyste.
- **C05.016** — Reconnaître risque de contamination.
- **C05.017** — Vérifier reproductibilité d’un constat.
- **C05.018** — Préparer restitution structurée.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-06 — Forensics Windows et navigateurs

**Micro-leçons, dans l’ordre pédagogique :**

- **C06.001** — Définir artefact d’exécution programme.
- **C06.002** — Décrire journaux Event Log.
- **C06.003** — Distinguer connexion locale et distante.
- **C06.004** — Expliquer horodatages d’ouverture de session.
- **C06.005** — Comprendre journalisation PowerShell.
- **C06.006** — Identifier traces de fichiers récents.
- **C06.007** — Interpréter métadonnées de navigateur.
- **C06.008** — Distinguer historique cache cookies et sessions.
- **C06.009** — Comprendre IndexedDB et stockage local.
- **C06.010** — Expliquer extraction de messagerie consentie.
- **C06.011** — Distinguer en-têtes mail et corps.
- **C06.012** — Lire champs Received d’un e-mail.
- **C06.013** — Décrire SPF DKIM DMARC.
- **C06.014** — Reconstruire une chronologie à partir de trois sources.
- **C06.015** — Évaluer une incohérence temporelle.
- **C06.016** — Rédiger un constat sans sur-attribution.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-07 — Forensics mémoire

**Micro-leçons, dans l’ordre pédagogique :**

- **C07.001** — Distinguer dump mémoire et image disque.
- **C07.002** — Expliquer espace d’adressage processus.
- **C07.003** — Comprendre module chargé et bibliothèque.
- **C07.004** — Décrire arbre parent-enfant de processus.
- **C07.005** — Distinguer thread et processus.
- **C07.006** — Interpréter connexions observées dans une capture mémoire.
- **C07.007** — Expliquer injection de code comme indice de détection.
- **C07.008** — Identifier temps de capture et dégradation.
- **C07.009** — Comprendre faux positifs d’artefact.
- **C07.010** — Lire la sortie d’un outil forensique.
- **C07.011** — Distinguer artefact absent et preuve d’absence.
- **C07.012** — Corréler mémoire avec journaux et disque.
- **C07.013** — Décrire limites mémoire chiffrée ou paginée.
- **C07.014** — Documenter version d’outil et profil.
- **C07.015** — Produire hypothèse de compromission révisable.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-08 — Network forensics et détection

**Micro-leçons, dans l’ordre pédagogique :**

- **C08.001** — Définir capture pcap et NetFlow.
- **C08.002** — Distinguer métadonnée et contenu chiffré.
- **C08.003** — Interpréter 5-tuple d’un flux.
- **C08.004** — Expliquer logs DNS et proxy.
- **C08.005** — Reconstituer chronologie de connexions.
- **C08.006** — Reconnaître connexion refusée et timeout.
- **C08.007** — Distinguer anomalie et attaque.
- **C08.008** — Comprendre faux positif en détection.
- **C08.009** — Expliquer règles Sigma.
- **C08.010** — Comprendre analyse Zeek.
- **C08.011** — Décrire IDS et IPS.
- **C08.012** — Distinguer détection signature et anomalie.
- **C08.013** — Raisonner sur une alerte corrélée.
- **C08.014** — Définir hypothèse de threat hunting.
- **C08.015** — Comparer observation hôte et réseau.
- **C08.016** — Évaluer lacunes de journalisation.
- **C08.017** — Émettre conclusion proportionnée aux traces.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-09 — Forensics mobile et anti-stalkerware

**Micro-leçons, dans l’ordre pédagogique :**

- **C09.001** — Définir consentement valide d’analyse d’appareil.
- **C09.002** — Distinguer propriétaire utilisateur et compte partagé.
- **C09.003** — Examiner permissions Android.
- **C09.004** — Comprendre sessions liées de messagerie.
- **C09.005** — Décrire partages de localisation.
- **C09.006** — Comprendre sauvegardes et synchronisations.
- **C09.007** — Identifier risque de compte cloud compromis.
- **C09.008** — Distinguer application espionne et fonctionnalité native.
- **C09.009** — Comprendre limites de détection de stalkerware.
- **C09.010** — Définir procédure de préservation préalable.
- **C09.011** — Évaluer risque d’alerter un partenaire abusif.
- **C09.012** — Comprendre MVT et ses limites.
- **C09.013** — Distinguer réinitialisation de protection et perte de preuve.
- **C09.014** — Planifier remédiation graduelle.
- **C09.015** — Documenter traces sans extraire des données de tiers.
- **C09.016** — Décrire protection et orientation de la victime.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-10 — Attribution, graphes et critique

**Micro-leçons, dans l’ordre pédagogique :**

- **C10.001** — Distinguer adresse IP et personne.
- **C10.002** — Distinguer compte et personne.
- **C10.003** — Expliquer limites d’un numéro de téléphone.
- **C10.004** — Comprendre erreur de cooccurrence.
- **C10.005** — Définir nœud arête attribut temporel.
- **C10.006** — Construire un graphe de relations datées.
- **C10.007** — Distinguer lien observé et lien inféré.
- **C10.008** — Évaluer hypothèse alternative.
- **C10.009** — Décrire erreur de confirmation.
- **C10.010** — Expliquer taux de base dans une attribution.
- **C10.011** — Distinguer attribution infrastructure et groupe.
- **C10.012** — Comprendre seuil probatoire nécessaire.
- **C10.013** — Décrire demandes à fournisseurs via autorités.
- **C10.014** — Ne pas déduire une identité à partir d’un seul indice.
- **C10.015** — Produire tableau d’hypothèses et contre-indices.
- **C10.016** — Restituer degré de confiance transparent.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-11 — Preuves, procédure et communication

**Micro-leçons, dans l’ordre pédagogique :**

- **C11.001** — Définir élément de preuve et objet à prouver.
- **C11.002** — Distinguer preuve primaire et copie.
- **C11.003** — Documenter origine d’une capture.
- **C11.004** — Enregistrer hash d’une pièce.
- **C11.005** — Construire registre de transferts.
- **C11.006** — Documenter version d’outil forensique.
- **C11.007** — Rendre une procédure reproductible.
- **C11.008** — Distinguer fait technique et qualification juridique.
- **C11.009** — Définir numérotation stable des annexes.
- **C11.010** — Construire chronologie avec sources.
- **C11.011** — Expliquer limites du rapport.
- **C11.012** — Décrire chaîne de validation interne.
- **C11.013** — Gérer confidentialité et minimisation.
- **C11.014** — Définir durée de conservation.
- **C11.015** — Préparer résumé pour non-technicien.
- **C11.016** — Défendre une conclusion face à objection.
- **C11.017** — Prévoir procédure de correction d’erreur.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## C-12 — Protection personnelle et éthique des enquêtes

**Micro-leçons, dans l’ordre pédagogique :**

- **C12.001** — Distinguer enquête consentie et espionnage.
- **C12.002** — Décrire risque de relation coercitive.
- **C12.003** — Évaluer sécurité physique avant remédiation.
- **C12.004** — Définir espace confidentiel de consultation.
- **C12.005** — Comprendre conservation prudente de messages privés.
- **C12.006** — Évaluer nécessité de documenter une menace.
- **C12.007** — Distinguer assistance à une victime et collecte intrusive.
- **C12.008** — Décrire traitement des données sensibles.
- **C12.009** — Éviter divulgation publique d’un suspect.
- **C12.010** — Comprendre interdiction de manipuler un compte tiers.
- **C12.011** — Définir escalade en cas de danger immédiat.
- **C12.012** — Expliquer orientation vers conseil juridique.
- **C12.013** — Documenter refus d’une intervention hors mandat.
- **C12.014** — Définir politique de suppression sécurisée.
- **C12.015** — Préparer rapport compréhensible par le client.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## D-01 — Commercialisation et contrats

**Micro-leçons, dans l’ordre pédagogique :**

- **D01.001** — Distinguer offre commerciale et périmètre technique.
- **D01.002** — Définir cible startup SaaS fintech.
- **D01.003** — Construire question de découverte client.
- **D01.004** — Définir actifs en scope et hors scope.
- **D01.005** — Prévoir autorisation écrite d’audit.
- **D01.006** — Identifier sous-traitants et dépendances.
- **D01.007** — Définir fenêtres de maintenance.
- **D01.008** — Décrire clause de confidentialité.
- **D01.009** — Comprendre engagement de moyens et limites.
- **D01.010** — Définir niveau de service.
- **D01.011** — Expliquer tarification forfaitaire et régie.
- **D01.012** — Construire matrice de risques projet.
- **D01.013** — Préparer devis lisible.
- **D01.014** — Définir livrables d’audit.
- **D01.015** — Prévoir validation de fin de mission.
- **D01.016** — Gérer conflits d’intérêts.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## D-02 — Rapports et communication

**Micro-leçons, dans l’ordre pédagogique :**

- **D02.001** — Distinguer résumé exécutif et détail technique.
- **D02.002** — Rédiger titre de vulnérabilité non sensationnaliste.
- **D02.003** — Construire scénario d’impact compréhensible.
- **D02.004** — Documenter préconditions d’une PoC.
- **D02.005** — Séparer hypothèse et impact démontré.
- **D02.006** — Distinguer sévérité CVSS et impact métier.
- **D02.007** — Ajouter capture annotée sans données privées.
- **D02.008** — Proposer correction hiérarchisée.
- **D02.009** — Présenter mesure compensatoire.
- **D02.010** — Définir re-test et critères de succès.
- **D02.011** — Expliquer une limite technique avec honnêteté.
- **D02.012** — Présenter risque au dirigeant.
- **D02.013** — Répondre à une contestation du client.
- **D02.014** — Rédiger décision de risque résiduel.
- **D02.015** — Prévoir restitution sécurisée.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## D-03 — IA copilote d’audit et enquête

**Micro-leçons, dans l’ordre pédagogique :**

- **D03.001** — Distinguer génération et validation.
- **D03.002** — Définir tâches délégables à l’IA.
- **D03.003** — Comprendre risque de fuite de données vers un fournisseur.
- **D03.004** — Rédiger spécification technique non ambiguë.
- **D03.005** — Définir formats de sortie structurés.
- **D03.006** — Exiger références vérifiables.
- **D03.007** — Construire jeux d’essai de réponses.
- **D03.008** — Identifier hallucination de commande ou de CVE.
- **D03.009** — Réviser code généré par l’IA.
- **D03.010** — Vérifier les tests générés indépendamment.
- **D03.011** — Analyser journaux au lieu d’accepter récit IA.
- **D03.012** — Évaluer faux positifs et faux négatifs.
- **D03.013** — Documenter responsabilités humaines.
- **D03.014** — Définir politique d’usage pour données de clients.
- **D03.015** — Prévoir journal d’approbations.
- **D03.016** — Réviser une analyse IA à partir de contre-preuves.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## D-04 — Gouvernance et assurance qualité

**Micro-leçons, dans l’ordre pédagogique :**

- **D04.001** — Définir politique sécurité interne.
- **D04.002** — Expliquer classification des données.
- **D04.003** — Décrire minimisation et besoin d’accès.
- **D04.004** — Définir contrôle d’accès aux dossiers.
- **D04.005** — Séparer environnements clients et labos.
- **D04.006** — Concevoir coffre pour secrets.
- **D04.007** — Définir conservation et destruction des preuves.
- **D04.008** — Comprendre gestion d’incident de l’agence.
- **D04.009** — Prévoir sauvegardes et restauration.
- **D04.010** — Définir contrôle qualité des rapports.
- **D04.011** — Expliquer revue indépendante.
- **D04.012** — Mesurer indicateurs de service.
- **D04.013** — Formaliser veille de vulnérabilités et IA.
- **D04.014** — Documenter versions de procédures.
- **D04.015** — Définir amélioration continue.
- **D04.016** — Évaluer assurance et obligations locales.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

# Modules d’approfondissement transversal

## X-01 — Méthodes d’apprentissage conceptuel

**Micro-leçons, dans l’ordre pédagogique :**

- **X01.001** — Identifier connaissances préalables d’un concept.
- **X01.002** — Distinguer définition intuitive et définition formelle.
- **X01.003** — Construire modèle mental simple et ses limites.
- **X01.004** — Représenter un changement d’état.
- **X01.005** — Comparer exemple contre-exemple et cas frontière.
- **X01.006** — Prédire avant de révéler.
- **X01.007** — Justifier une prédiction fausse.
- **X01.008** — Manipuler une variable à la fois.
- **X01.009** — Décrire invariants du mécanisme.
- **X01.010** — Transférer vers un exemple d’un autre domaine.
- **X01.011** — Récupérer une notion après délai.
- **X01.012** — Expliquer sans jargon excessif.
- **X01.013** — Évaluer compréhension plutôt que reconnaissance.
- **X01.014** — Identifier dépendance conceptuelle manquante.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-02 — Méthodologies spécifiques Web/API/mobile

**Micro-leçons, dans l’ordre pédagogique :**

- **X02.001** — Construire inventaire des fonctions Web.
- **X02.002** — Établir matrice rôle-route Web.
- **X02.003** — Définir méthode de test des sessions.
- **X02.004** — Prioriser scénarios d’autorisation API.
- **X02.005** — Décrire examen des entrées-sorties.
- **X02.006** — Construire tests d’invariants métier.
- **X02.007** — Planifier audit application Android.
- **X02.008** — Réconcilier résultats statiques et dynamiques.
- **X02.009** — Planifier audit iOS.
- **X02.010** — Relier constats application et backend.
- **X02.011** — Évaluer gestion des secrets mobile.
- **X02.012** — Construire campagne de re-tests.
- **X02.013** — Éviter surinterprétation d’un scanner.
- **X02.014** — Définir seuil d’une PoC suffisante.
- **X02.015** — Comparer risques résiduels après correction.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-03 — Méthodologie des chaînes d’impact et validation

**Micro-leçons, dans l’ordre pédagogique :**

- **X03.001** — Distinguer point d’entrée et objectif métier.
- **X03.002** — Tracer frontières de confiance d’un parcours.
- **X03.003** — Définir état initial contrôlé.
- **X03.004** — Formuler hypothèse de chaîne.
- **X03.005** — Identifier vulnérabilité dépendante d’une autre.
- **X03.006** — Évaluer une combinaison en termes de préconditions.
- **X03.007** — Séparer impact potentiel et réellement observé.
- **X03.008** — Utiliser données de démonstration représentatives.
- **X03.009** — Définir preuve d’accès sans extraction massive.
- **X03.010** — Arrêter test avant destruction ou disponibilité critique.
- **X03.011** — Distinguer preuve durable et trace éphémère.
- **X03.012** — Vérifier résultat avec preuve indépendante.
- **X03.013** — Documenter alternatives non testées.
- **X03.014** — Planifier restauration et contrôles.
- **X03.015** — Transformer chaîne en plan de remédiation.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-04 — Sécurité des navigateurs et identités modernes

**Micro-leçons, dans l’ordre pédagogique :**

- **X04.001** — Comprendre passkeys et WebAuthn conceptuellement.
- **X04.002** — Distinguer cookie et token bearer.
- **X04.003** — Expliquer politique de sécurité navigateur.
- **X04.004** — Comprendre Trusted Types à haut niveau.
- **X04.005** — Décrire OAuth authorization code avec PKCE.
- **X04.006** — Distinguer ID token et access token.
- **X04.007** — Expliquer refresh tokens et rotation.
- **X04.008** — Comprendre federation d’identité.
- **X04.009** — Distinguer SAML et OIDC.
- **X04.010** — Décrire cycle de vie d’une session.
- **X04.011** — Analyser authentification multiappareil.
- **X04.012** — Identifier risque récupération de compte.
- **X04.013** — Comprendre device binding et limites.
- **X04.014** — Définir critères d’audit de session.
- **X04.015** — Documenter gestion des révocations.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-05 — Cloud-native et chaîne d’approvisionnement

**Micro-leçons, dans l’ordre pédagogique :**

- **X05.001** — Décrire relation dépôt-build-release.
- **X05.002** — Expliquer signature de provenance logicielle.
- **X05.003** — Comprendre attaque de dépendance comme menace.
- **X05.004** — Différencier dependency confusion et typosquatting conceptuellement.
- **X05.005** — Comprendre permissions de CI.
- **X05.006** — Décrire identité machine et secret éphémère.
- **X05.007** — Décrire conteneur image registre.
- **X05.008** — Comprendre admission contrôles Kubernetes.
- **X05.009** — Définir risque de service mesh.
- **X05.010** — Distinguer sécurité API Gateway et service.
- **X05.011** — Comprendre fonctions serverless et IAM.
- **X05.012** — Définir surveillance posture cloud.
- **X05.013** — Examiner cycle de rotation de secrets.
- **X05.014** — Décrire SBOM et suivi CVE.
- **X05.015** — Prévoir politique de rollback.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-06 — Systèmes IA modernes et agents multicomposants

**Micro-leçons, dans l’ordre pédagogique :**

- **X06.001** — Distinguer modèle produit et agent.
- **X06.002** — Décrire orchestrateur d’agents.
- **X06.003** — Reconstituer trace de tool call.
- **X06.004** — Comprendre protocole MCP sans confiance implicite.
- **X06.005** — Distinguer serveur MCP client MCP et outil.
- **X06.006** — Définir frontière de permissions d’un connecteur.
- **X06.007** — Évaluer action d’écriture versus lecture.
- **X06.008** — Comprendre déclenchement d’agent sans utilisateur.
- **X06.009** — Identifier documents RAG non fiables.
- **X06.010** — Décrire pollution du contexte.
- **X06.011** — Expliquer isolation conversationnelle.
- **X06.012** — Distinguer sandbox et exécution distante.
- **X06.013** — Comprendre approval gates.
- **X06.014** — Définir trace d’audit d’action IA.
- **X06.015** — Construire tests de non-régression d’agent.
- **X06.016** — Décrire risque de modèle multimodal.
- **X06.017** — Définir politique d’accès à fichiers d’entreprise.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-07 — Sécurité mobile récente et fraude d’appareil

**Micro-leçons, dans l’ordre pédagogique :**

- **X07.001** — Comprendre authentification par passkey mobile.
- **X07.002** — Distinguer device attestation et confiance absolue.
- **X07.003** — Expliquer Play Integrity conceptuellement.
- **X07.004** — Expliquer App Attest conceptuellement.
- **X07.005** — Identifier limites du certificate pinning.
- **X07.006** — Comprendre risque de deep link non vérifié.
- **X07.007** — Décrire notification push et information sensible.
- **X07.008** — Expliquer session sur appareils multiples.
- **X07.009** — Comprendre permissions de notification.
- **X07.010** — Décrire abus d’accessibilité et risques.
- **X07.011** — Distinguer sauvegarde chiffrée et synchronisation.
- **X07.012** — Définir cas fraude SIM swap à haut niveau.
- **X07.013** — Comprendre risque d’OTP détourné.
- **X07.014** — Vérifier résilience du parcours de récupération.
- **X07.015** — Évaluer risques d’appareil ancien.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-08 — Sécurité des preuves synthétiques et contenus IA

**Micro-leçons, dans l’ordre pédagogique :**

- **X08.001** — Distinguer image originale et version recompressée.
- **X08.002** — Comprendre métadonnées EXIF et leur fragilité.
- **X08.003** — Identifier indice de montage non concluant.
- **X08.004** — Comprendre limites détection deepfake.
- **X08.005** — Distinguer indice de génération et certitude d’origine.
- **X08.006** — Décrire provenance C2PA conceptuellement.
- **X08.007** — Examiner capture de messagerie sans présumer authenticité.
- **X08.008** — Construire plusieurs vérifications indépendantes.
- **X08.009** — Comprendre risque de preuve créée par IA.
- **X08.010** — Identifier transcription automatique incertaine.
- **X08.011** — Préserver original d’un fichier audiovisuel.
- **X08.012** — Documenter chainage de versions.
- **X08.013** — Évaluer impact d’une transformation sur preuve.
- **X08.014** — Expliquer provenance au décideur.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-09 — Sécurité opérationnelle d’une équipe d’investigation

**Micro-leçons, dans l’ordre pédagogique :**

- **X09.001** — Définir menace pesant sur l’équipe.
- **X09.002** — Séparer identités professionnelles et personnelles.
- **X09.003** — Comprendre gestion du risque de divulgation.
- **X09.004** — Contrôler accès aux dossiers.
- **X09.005** — Prévoir communications sécurisées.
- **X09.006** — Éviter interactions dangereuses avec suspects.
- **X09.007** — Documenter tentatives de manipulation de l’enquête.
- **X09.008** — Distinguer observation publique et intrusion.
- **X09.009** — Définir incident de fuite d’une preuve.
- **X09.010** — Préparer plan de transmission sécurisé.
- **X09.011** — Décrire protection de personnes vulnérables.
- **X09.012** — Définir vérification des demandes d’autorité.
- **X09.013** — Prévoir soutien psychologique face aux contenus difficiles.
- **X09.014** — Documenter décision d’interrompre une enquête.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

## X-10 — Audit de l’IA productrice de code

**Micro-leçons, dans l’ordre pédagogique :**

- **X10.001** — Définir une tâche de code par invariants.
- **X10.002** — Préparer exemples de réussite et d’échec.
- **X10.003** — Définir tests limites.
- **X10.004** — Lire diff avant intégration.
- **X10.005** — Examiner nouveaux appels externes.
- **X10.006** — Vérifier permissions des dépendances.
- **X10.007** — Repérer suppression d’un contrôle d’accès.
- **X10.008** — Interpréter résultat de SAST sans aveuglement.
- **X10.009** — Comprendre test mutationnel de validation.
- **X10.010** — Comparer implémentations alternatives.
- **X10.011** — Documenter arbitrage performance-sécurité.
- **X10.012** — Repérer surconfiance dans l’explication IA.
- **X10.013** — Évaluer reproductibilité d’une génération.
- **X10.014** — Définir politique de revue avant mise en production.

**Preuves de compréhension attendues :** représenter le mécanisme, expliquer chaque relation de cause à effet, anticiper un changement de paramètre, corriger une conclusion erronée et résoudre un cas inédit combinant les notions ci-dessus. Une réussite à un quiz de reconnaissance ne suffit pas.

---

# Contrôle de couverture et validation

Ce niveau supplémentaire définit **1022 micro-leçons** réparties en **53 modules**, en plus des compétences atomiques, des ressources, des visualisations et des laboratoires du référentiel original. Les micro-leçons ne constituent pas 1022 certifications ni des durées obligatoires.

Chaque micro-leçon doit être évaluée par au moins deux modes différents (par exemple prédiction d'état et explication causale). Chaque module exige un problème inédit et une revue différée. Pour les domaines opérationnels, la validation finale inclut des laboratoires externes explicitement autorisés et une restitution technique indépendante.

---

# Référentiel complémentaire — compétences atomiques, visualisations, exercices, ressources et laboratoires

## Référentiel antérieur détaillé (conservé intégralement)

**Référentiel pédagogique indépendant du temps | De zéro à l’expertise | Version : novembre 2026**

## Contrat d’apprentissage

- Chaque compétence atomique est un acquis distinct, démontré par une explication, une prédiction ou une décision correcte sur un cas inédit.
- Progression par **prérequis**, non par semaines ou mois. Une notion commune est enseignée une fois puis mobilisée dans les spécialisations.
- Chaque cours est destiné à être réalisé comme une expérience HTML/CSS/JavaScript avec visualisations animées 2D/3D justifiées par le concept.
- Évaluation interne **sans laboratoire de code** : schémas à compléter, scénarios, interprétation de traces, détection d’erreurs, diagnostic, argumentation, plans et cas de synthèse.
- Les laboratoires techniques sont **externes**, liés en fin de chapitre ou module. Leur validation ne peut pas être inférée d’un simple clic.
- L’IA peut produire du code à partir d’un plan conçu par l’apprenant ; celui-ci doit savoir comprendre les principes, lire et vérifier les parties critiques, interpréter les résultats et décider. Les compétences bas niveau conservent la lecture précise du code et de l’assembleur.
- Un acquis est validé après restitution sans assistance, transfert sur un cas inédit, analyse des cas limites et réévaluation différée ; le niveau expert exige également des preuves de travail pratique.
- Tous les scénarios offensifs impliquant exploitation, post-exploitation, persistance ou manipulation de systèmes sont étudiés dans des laboratoires ou des audits explicitement autorisés. Les investigations privées excluent l’intrusion clandestine dans les appareils ou comptes de tiers.

## Échelle de maîtrise

| Niveau                | Preuve attendue                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Découverte**    | Reconnaître les termes et les objets du concept.                                                                                       |
| **1 — Compréhension** | Expliquer le fonctionnement, les causes et les limites.                                                                                |
| **2 — Prédiction**    | Anticiper un résultat après modification d’un paramètre.                                                                               |
| **3 — Application**   | Résoudre un cas neuf et justifier les décisions.                                                                                       |
| **4 — Intégration**   | Croiser plusieurs concepts, contrôler les hypothèses et les preuves.                                                                   |
| **5 — Expertise**     | Traiter des cas complexes, expliquer les compromis, produire une restitution reproductible et réussir des épreuves pratiques externes. |

---

# Partie II — Carte globale des parcours

## 6. Ordre de progression sans durée imposée

**Tronc commun (TC)** : pensée scientifique et apprentissage → systèmes → réseaux → Web et API → programmation assistée par IA → données et cryptographie → fondamentaux sécurité → méthodologies.

**Branche A — Sécuriser les plateformes** : Web → API et logique métier → Android → iOS → AppSec et Cloud → QA/SRE → fintech et Mobile Money → IA/agents.

**Branche B — Offensive avancée** : réseaux internes → Windows/AD → sécurité Linux → adversary emulation → post-exploitation simulée → exploitation binaire → reverse engineering → malware analysis.

**Branche C — Investiguer** : OSINT → fraude et escroqueries → CTI → analyse de réseau → forensics systèmes → forensics mobiles et anti-stalkerware → attribution et dossier de preuve.

**Branche D — Professionnaliser l’agence** : cadrage de mission, gouvernance, confidentialité, acquisition client, rapports, re-tests et qualité du service.

Après les modules TC, les branches peuvent être suivies en parallèle, avec des examens transversaux régulièrement imposés. Il n’existe pas d’obligation de les terminer en un nombre de mois défini.

### Dépendances majeures

| Pour apprendre…                | Il faut déjà maîtriser…                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Pentest Web/API                | HTTP, navigateur, backend, SQL, authentification, logique applicative                |
| Android/iOS                    | Applications client-serveur, API, OS, stockage, crypto et sessions                   |
| Pentest d’infrastructure       | Réseaux, Linux/Windows, identité, journalisation                                     |
| Red Team avancée               | Pentest infrastructure, Active Directory, détection, méthodologie                    |
| Reverse engineering            | C, mémoire, compilation, architecture machine, assembleur                            |
| Sécurité IA                    | Python conceptuel, API, sécurité applicative, LLM/RAG/agents                         |
| DFIR et malware                | Systèmes, réseaux, journaux, formats fichiers, preuves                               |
| Investigation des escroqueries | OSINT, validation de sources, graphes, sécurité personnelle, conservation de preuves |
| Gestion d’une agence           | Audits reproductibles, communication, contrats, processus et qualité                 |

---

# Partie III — Tronc commun : comprendre avant de spécialiser

## TC-00 — Raisonnement technique, méthodes scientifiques et apprentissage

**Objectif :** apprendre à construire des explications causales, identifier les limites d’un modèle et vérifier une affirmation.

**Compétences atomiques :**

- **TC00.01** Distinguer observation, inférence, hypothèse, preuve et conclusion.
- **TC00.02** Décomposer un problème en mécanismes et relations causales.
- **TC00.03** Décrire préconditions, invariants, états et transitions.
- **TC00.04** Identifier les hypothèses implicites d’un raisonnement.
- **TC00.05** Construire un contre-exemple qui invalide une affirmation.
- **TC00.06** Comprendre probabilités conditionnelles, faux positifs et taux de base.
- **TC00.07** Lire une documentation, un schéma ou un article technique de manière critique.
- **TC00.08** Formuler une expérience reproductible et des critères de succès.
- **TC00.09** Utiliser la récupération active, l’entraînement espacé et l’interleaving.
- **TC00.10** Évaluer la confiance d’un résultat IA et demander une vérification indépendante.

**Visualisations :** arbre de causalité manipulable, diagramme de transitions, simulation de faux positifs, comparaison de deux hypothèses sur un même ensemble d’indices.

**Exercices internes :** prédire l’effet d’une hypothèse fausse ; annoter une chaîne causale ; classer dix propositions entre faits et déductions ; expliquer ce qui manque pour conclure.

**Ressources :** [Learning How to Learn (Coursera)](https://www.coursera.org/learn/learning-how-to-learn), [OpenStax Introductory Statistics](https://openstax.org/details/books/introductory-statistics), [NIST NICE Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center). **Livres :** _Make It Stick_ (Brown, Roediger, McDaniel) ; _Thinking, Fast and Slow_ (Kahneman, à lire de manière critique).

**Validation :** construire une note d’analyse comprenant faits, hypothèses, contre-indices et degré de confiance ; réussir des variantes après un délai.

## TC-01 — Architecture des ordinateurs

**Compétences atomiques :**

- **TC01.01** Représenter bits, octets, bases 2/10/16 et conversions.
- **TC01.02** Expliquer portes logiques, circuits combinatoires et séquentiels.
- **TC01.03** Comprendre registres, instructions, unité de calcul, cycle instruction.
- **TC01.04** Distinguer mémoire, cache, stockage et persistance des données.
- **TC01.05** Expliquer adressage, pointeurs et représentation des objets.
- **TC01.06** Comprendre interruptions, privilèges CPU, noyau et espace utilisateur.
- **TC01.07** Décrire appel système et transition user/kernel.
- **TC01.08** Comprendre pile d’exécution, tas, segments et durée de vie.
- **TC01.09** Différencier processus, thread et ordonnanceur.
- **TC01.10** Expliquer compilation, interprétation, binaire et bibliothèques.
- **TC01.11** Comprendre endianness, alignement et formats binaires.
- **TC01.12** Raisonner sur l’isolation mémoire et les frontières de confiance.

**Visualisations :** processeur 3D animé, propagation d’un bit, hiérarchie mémoire, pile/tas visualisés au pas à pas, pipeline simplifié.

**Exercices :** compléter les états d’un registre, prévoir les effets d’un appel de fonction, trouver les erreurs d’une analogie « disque = RAM », analyser un diagramme mémoire.

**Ressources :** [Nand2Tetris](https://www.nand2tetris.org/), [CS50x](https://cs50.harvard.edu/x/), [OpenSecurityTraining](https://opensecuritytraining.info/). **Livres :** _Code_ (Charles Petzold) ; _Computer Systems: A Programmer’s Perspective_ (Bryant & O’Hallaron) ; _Computer Organization and Design_ (Patterson & Hennessy).

**Validation :** décrire l’exécution complète d’une fonction, de son code à ses effets mémoire, et identifier trois limites du modèle simplifié.

## TC-02 — Linux, Windows et virtualisation

**Compétences atomiques :**

- **TC02.01** Expliquer arborescence des fichiers Linux et principaux répertoires.
- **TC02.02** Raisonner sur UID/GID, permissions, ACL et séparation des rôles.
- **TC02.03** Expliquer processus, services, démons et démarrage système.
- **TC02.04** Lire la logique d’un script Bash ; anticiper ses effets.
- **TC02.05** Expliquer variables d’environnement, PATH et gestion des secrets.
- **TC02.06** Comprendre journalisation Linux, événements et horodatages.
- **TC02.07** Comprendre registre Windows, services et mécanismes de démarrage.
- **TC02.08** Lire des commandes et scripts PowerShell sans exécution nécessaire.
- **TC02.09** Comprendre comptes locaux, groupes et UAC.
- **TC02.10** Distinguer machine virtuelle, conteneur, image, snapshot et volume.
- **TC02.11** Comprendre isolation, réseaux virtuels et limites d’une sandbox.
- **TC02.12** Décrire sauvegarde, restauration et stratégie de laboratoire.

**Visualisations :** machine virtuelle comme couches, arbre de permissions interactif, cycle de vie d’un processus, ligne de temps d’événements Windows.

**Exercices :** interpréter des permissions ; prédire l’accès d’un utilisateur ; lire des sorties de journaux ; choisir une configuration sûre d’un laboratoire.

**Ressources :** [Linux Journey](https://linuxjourney.com/), [OverTheWire Bandit](https://overthewire.org/wargames/bandit/), [Microsoft Learn](https://learn.microsoft.com/training/), [Docker Get Started](https://docs.docker.com/get-started/). **Livres :** _How Linux Works_ (Brian Ward) ; _The Linux Command Line_ (William Shotts) ; _Windows Internals_ (Pavel Yosifovich et al.).

**Labs externes :** [OverTheWire Bandit](https://overthewire.org/wargames/bandit/), [TryHackMe](https://tryhackme.com/).

**Validation :** expliquer le chemin d’une opération du terminal au système et interpréter des journaux et permissions d’un cas inédit.

## TC-03 — Réseaux : du signal à l’application

**Compétences atomiques :**

- **TC03.01** Distinguer topologie, couches, encapsulation et décapsulation.
- **TC03.02** Expliquer Ethernet, ARP, adressage MAC et domaine de broadcast.
- **TC03.03** Calculer masques, sous-réseaux et routage IPv4 ; comprendre IPv6.
- **TC03.04** Expliquer table de routage, passerelle, NAT, VLAN et VPN.
- **TC03.05** Décrire UDP et TCP, fiabilité, ordre et congestion.
- **TC03.06** Reconstituer TCP three-way handshake et fermeture.
- **TC03.07** Comprendre DNS, résolveurs, cache, enregistrements et TTL.
- **TC03.08** Expliquer TLS, certificats et authentification serveur.
- **TC03.09** Décrire HTTP/1.1, HTTP/2 et concepts fondamentaux HTTP/3.
- **TC03.10** Comprendre proxy, reverse proxy, CDN, WAF et load balancer.
- **TC03.11** Lire un flux réseau et reconnaître retransmissions, erreurs et timeouts.
- **TC03.12** Distinguer connexion, session, identité et autorisation.
- **TC03.13** Comprendre services exposés, ports et surface d’attaque.
- **TC03.14** Relier paquet, flux, journal applicatif et événement utilisateur.

**Visualisations :** paquets en circulation sur un réseau 3D, états TCP, routage par sauts, négociation TLS animée, variation du débit et des pertes.

**Exercices :** reconstruire une connexion à partir de fragments ; prédire un échec DNS ; interpréter un diagramme de trafic ; corriger une mauvaise explication de TLS.

**Ressources :** [Cisco Networking Academy](https://www.netacad.com/), [Wireshark Docs](https://www.wireshark.org/docs/), [Cloudflare Learning](https://www.cloudflare.com/learning/), [Nmap Network Scanning](https://nmap.org/book/). **Livres :** _Computer Networking: A Top-Down Approach_ (Kurose & Ross) ; _TCP/IP Illustrated, Vol. 1_ (Stevens) ; _Practical Packet Analysis_ (Chris Sanders).

**Labs externes :** [Wireshark Sample Captures](https://wiki.wireshark.org/SampleCaptures), [TryHackMe Networking](https://tryhackme.com/).

**Validation :** expliquer de bout en bout l’ouverture d’une session HTTPS, ses points de rupture et les indices qui permettraient de diagnostiquer un problème.

## TC-04 — Web, API, backend et données

**Compétences atomiques :**

- **TC04.01** Représenter navigateur, DOM, JavaScript, serveur et base de données.
- **TC04.02** Expliquer requête/réponse HTTP, méthodes, statuts, headers et corps.
- **TC04.03** Comprendre cookies, sessions, stockage Web et contraintes Same-Origin.
- **TC04.04** Distinguer CORS, CSP, CSRF et leurs objectifs respectifs.
- **TC04.05** Comprendre frontend/backend, routes, contrôleurs et services.
- **TC04.06** Expliquer REST, RPC, GraphQL, WebSocket et webhooks.
- **TC04.07** Concevoir un schéma de données, clés et relations.
- **TC04.08** Comprendre requêtes SQL, index, transactions et isolation.
- **TC04.09** Expliquer JWT, sessions côté serveur, tokens et expiration.
- **TC04.10** Distinguer identification, authentification et autorisation.
- **TC04.11** Décrire les modèles RBAC, ABAC et contrôle objet par objet.
- **TC04.12** Analyser une architecture microservices et une frontière de confiance.
- **TC04.13** Expliquer cache, files de messages, tâches asynchrones et idempotence.
- **TC04.14** Comprendre API de paiement, retries, concurrence et cohérence des états.

**Visualisations :** trajet d’une requête dans un SaaS, construction DOM, session et cookies, graphe relationnel SQL, transaction concurrencée.

**Exercices :** repérer une erreur d’autorisation dans un schéma ; anticiper deux écritures concurrentes ; choisir un mécanisme d’idempotence ; analyser un cycle de session.

**Ressources :** [MDN Learn](https://developer.mozilla.org/en-US/docs/Learn_web_development), [The Odin Project](https://www.theodinproject.com/), [SQLBolt](https://sqlbolt.com/), [Postman Learning](https://learning.postman.com/), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/). **Livres :** _Designing Data-Intensive Applications_ (Martin Kleppmann) ; _Web Application Security_ (Andrew Hoffman) ; _Database Internals_ (Alex Petrov).

**Validation :** dessiner un SaaS réaliste à authentification et paiement, expliquer les échanges et prévoir trois classes de défaillances.

## TC-05 — Programmation conceptuelle et orchestration de l’IA

**Compétences atomiques :**

- **TC05.01** Expliquer variables, types, portée et durée de vie.
- **TC05.02** Reconnaître conditions, boucles, fonctions et récursion.
- **TC05.03** Choisir structures de données : tableau, map, pile, file, graphe.
- **TC05.04** Raisonner sur invariants et complexité temporelle/spatiale.
- **TC05.05** Lire du Python et du JavaScript générés par IA.
- **TC05.06** Comprendre exceptions, validation d’entrée et gestion d’erreurs.
- **TC05.07** Distinguer concurrence, asynchronisme et parallélisme.
- **TC05.08** Formuler des spécifications testables et un pseudo-algorithme.
- **TC05.09** Concevoir des tests unitaires, d’intégration et de non-régression.
- **TC05.10** Définir un contrat d’API, des fixtures et des cas limites.
- **TC05.11** Lire un diff Git et évaluer une modification proposée.
- **TC05.12** Identifier du code généré incorrect, fragile ou dangereux.
- **TC05.13** Décomposer une tâche pour un assistant ou agent de développement.
- **TC05.14** Vérifier indépendamment une sortie IA et conserver les preuves.
- **TC05.15** Conduire une revue de code ciblée, notamment du code sécurité.

**Visualisations :** exécution d’un algorithme au pas à pas, graphe d’appels, event loop, complexité comparée, IA produisant une proposition face à tests indépendants.

**Exercices :** écrire une spécification sans code ; comparer deux propositions IA ; prédire la sortie d’un fragment ; repérer un bug de concurrence ; concevoir des tests manquants.

**Ressources :** [CS50x](https://cs50.harvard.edu/x/), [Automate the Boring Stuff](https://automatetheboringstuff.com/), [Python Tutorial](https://docs.python.org/3/tutorial/), [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide), [Git Book](https://git-scm.com/book/en/v2), [Google Engineering Practices](https://google.github.io/eng-practices/). **Livres :** _A Philosophy of Software Design_ (John Ousterhout) ; _The Pragmatic Programmer_ (Hunt & Thomas) ; _Code Complete_ (Steve McConnell).

**Validation :** proposer un plan pour un outil d’analyse de journaux, demander une implémentation IA et produire une revue argumentée de ses limites, résultats et tests.

## TC-06 — Mathématiques, statistiques et cryptographie

**Compétences atomiques :**

- **TC06.01** Manipuler ensembles, fonctions, relations et graphes.
- **TC06.02** Comprendre combinatoire et probabilités conditionnelles.
- **TC06.03** Expliquer entropie et aléatoire dans un système numérique.
- **TC06.04** Comprendre arithmétique modulaire et bases algébriques utiles.
- **TC06.05** Distinguer chiffrement, encodage, hachage et signature.
- **TC06.06** Expliquer clés symétriques, asymétriques et échange de clés.
- **TC06.07** Comprendre MAC, AEAD, nonce, IV et rejeu.
- **TC06.08** Expliquer certificats, PKI et vérification de chaîne.
- **TC06.09** Comprendre protection des mots de passe et dérivation de clés.
- **TC06.10** Reconnaître erreurs courantes de gestion des secrets.
- **TC06.11** Distinguer confidentialité, intégrité, authenticité et non-répudiation.
- **TC06.12** Interpréter distributions, corrélations, tests et biais de mesure.

**Visualisations :** transformations de chiffrement, clés et certificats en graphe de confiance, distributions de faux positifs, secrets vs signatures.

**Exercices :** choisir le bon mécanisme cryptographique ; expliquer pourquoi une méthode est incorrecte ; interpréter probabilités et faux positifs ; ordonner une vérification TLS.

**Ressources :** [Crypto 101](https://www.crypto101.io/), [Cryptopals](https://cryptopals.com/) (exercices facultatifs), [OpenStax Statistics](https://openstax.org/details/books/introductory-statistics), [Khan Academy Math](https://www.khanacademy.org/math). **Livres :** _Serious Cryptography_ (Jean-Philippe Aumasson) ; _Understanding Cryptography_ (Paar & Pelzl).

**Validation :** expliquer et défendre les mécanismes cryptographiques d’une application fictive, puis détecter des raisonnements cryptographiques faux dans un audit.

## TC-07 — Principes fondamentaux et méthodologie de sécurité

**Compétences atomiques :**

- **TC07.01** Définir actif, menace, vulnérabilité, exposition, impact et risque.
- **TC07.02** Distinguer surface d’attaque, frontière de confiance et scénario d’abus.
- **TC07.03** Comprendre CIA, défense en profondeur et moindre privilège.
- **TC07.04** Modéliser les menaces via STRIDE et arbres d’attaque.
- **TC07.05** Relier CWE, CVE, CVSS, EPSS, KEV à des usages distincts.
- **TC07.06** Expliquer détection, prévention, limitation et réponse.
- **TC07.07** Définir règles d’engagement, périmètre et seuils de sécurité d’une mission.
- **TC07.08** Comprendre PTES, NIST SP 800-115 et OSSTMM.
- **TC07.09** Comprendre les rôles différents de WSTG, ASVS et MASVS.
- **TC07.10** Séparer reconnaissance, validation, exploitation, post-exploitation et rapport.
- **TC07.11** Définir une preuve de concept sûre et reproductible.
- **TC07.12** Relier résultats techniques à impacts métier et corrections.
- **TC07.13** Raisonner sur les faux positifs d’outils automatiques.
- **TC07.14** Définir retest, preuve de correction et risque résiduel.

**Visualisations :** carte des frontières de confiance, matrice menace/impact, graphe de chemin d’attaque abstrait, cycle de mission.

**Exercices :** prioriser des risques ; critiquer une PoC mal documentée ; définir des règles d’engagement ; décider quand arrêter un test ; rédiger une chaîne cause-impact.

**Ressources :** [PTES](http://www.pentest-standard.org/), [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final), [OWASP WSTG](https://wstg.owasp.org/), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [MITRE ATT&CK](https://attack.mitre.org/), [CWE](https://cwe.mitre.org/). **Livres :** _Threat Modeling: Designing for Security_ (Adam Shostack) ; _Alice and Bob Learn Application Security_ (Tanya Janca).

**Validation :** constituer un plan de mission complet et justifier la méthode, les hypothèses, les risques de perturbation et les preuves attendues.

---

# Partie IV — Branche A : sécuriser les plateformes africaines

## A-01 — Pentest Web : de l’observation à l’impact métier

**Prérequis :** TC-03 à TC-07. **Finalité :** auditer de manière autonome une application Web, démontrer les impacts dans un périmètre autorisé et accompagner les corrections.

**Compétences atomiques :**

- **A01.01** Construire la cartographie fonctionnelle d’une application (rôles, routes, données, parcours).
- **A01.02** Distinguer reconnaissance passive et tests actifs ; définir la limite du mandat.
- **A01.03** Lire et comparer requêtes, cookies, headers et états d’authentification.
- **A01.04** Analyser la création de comptes, l’activation, la récupération et la révocation de sessions.
- **A01.05** Examiner la séparation des droits par fonction, rôle et objet.
- **A01.06** Comprendre les causes et les impacts des injections SQL et commandes.
- **A01.07** Comprendre XSS et les mécanismes de protection de contexte.
- **A01.08** Distinguer CSRF, CORS, SameSite et leurs mécanismes.
- **A01.09** Identifier les scénarios SSRF et leurs impacts théoriques sur les services internes.
- **A01.10** Analyser téléversements de fichiers, validation, stockage et traitement.
- **A01.11** Comprendre désérialisation, templates et classes de risques associées.
- **A01.12** Examiner la logique métier : prix, coupon, quota, privilèges, étapes obligatoires.
- **A01.13** Analyser concurrence, race conditions et cohérence des opérations.
- **A01.14** Distinguer vulnérabilité exploitable, simple mauvaise pratique et faux positif.
- **A01.15** Construire une hypothèse de chaîne de failles sans extrapoler l’impact.
- **A01.16** Définir une PoC avec comptes de test, données minimisées et rollback.
- **A01.17** Interpréter les preuves : requêtes, réponses, traces, changements d’état.
- **A01.18** Rédiger description, préconditions, impact, reproductibilité et remédiation.
- **A01.19** Vérifier les correctifs sans perturber les flux métier.
- **A01.20** Conduire une restitution intelligible pour le décideur et le développeur.

**Cours interactifs obligatoires :**

1. _Une requête n’a pas de privilège intrinsèque_ : flux navigateur/API, session, vérification des droits par objet.
2. _La confiance entre composants_ : manipuler des frontières de confiance et visualiser les assertions qui les traversent.
3. _Le navigateur comme machine d’états_ : DOM, cookies, origine, sessions et contexte d’exécution.
4. _La logique métier comme système de transitions_ : simuler coupon, remboursement, réservation et ordres d’opération.
5. _Une vulnérabilité isolée vs une chaîne_ : graphe de préconditions et conséquences hypothétiques ; distinguer observation prouvée et extrapolation.

**Exercices internes :** annoter une architecture ; repérer une autorisation manquante dans un pseudo-flux ; prédire l’effet d’une course entre deux transactions ; choisir la PoC suffisante ; critiquer une conclusion exagérée ; rédiger un plan d’audit sur une application fictive.

**Ressources principales :** [PortSwigger Web Security Academy](https://portswigger.net/web-security), [OWASP WSTG](https://wstg.owasp.org/), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [PentesterLab](https://pentesterlab.com/), [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/).

**Livres :** _The Web Application Hacker’s Handbook_ (Stuttard & Pinto, ancien mais fondateur) ; _Real-World Bug Hunting_ (Peter Yaworski) ; _Web Application Security_ (Andrew Hoffman) ; _The Tangled Web_ (Michal Zalewski).

**Labs externes :** [PortSwigger Labs](https://portswigger.net/web-security/all-labs), [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/), [WebGoat](https://owasp.org/www-project-webgoat/), [HTB Academy](https://academy.hackthebox.com/).

**Examen de module :** analyser un dossier fictif comportant diagramme d’application, trafic, rôles et changements d’état ; produire sans assistance un plan d’audit, trois hypothèses hiérarchisées, les preuves à obtenir et un rapport d’impact. **Preuve pratique externe :** rapport de laboratoire couvrant plusieurs familles de risques.

## A-02 — API modernes, autorisations et logique transactionnelle

**Prérequis :** TC-04 et A-01.

**Compétences atomiques :**

- **A02.01** Identifier des API REST, GraphQL, gRPC et leurs schémas.
- **A02.02** Lire OpenAPI/Swagger et construire une carte d’opérations et d’objets.
- **A02.03** Expliquer OAuth 2.0, OIDC, scopes, tokens, refresh et délégation.
- **A02.04** Distinguer authentification, autorisation par fonction et par objet.
- **A02.05** Reconnaître BOLA, BFLA et incohérences de contrôle d’accès.
- **A02.06** Comprendre injection, mass assignment et sur-exposition de champs.
- **A02.07** Expliquer rate limiting, quotas et abus de ressources.
- **A02.08** Analyser WebSocket, webhooks et signatures de callbacks.
- **A02.09** Comprendre idempotence et protection contre les doublons.
- **A02.10** Expliquer atomicité, isolation, rollback et états transactionnels.
- **A02.11** Reconnaître l’impact d’événements hors ordre ou de retries.
- **A02.12** Vérifier les frontières de confiance API mobile/backend/prestataire.
- **A02.13** Concevoir des scénarios de test métier sans données bancaires réelles.
- **A02.14** Documenter les effets et préparer les retests.

**Visualisations :** moteur de workflow transactionnel, file de webhooks, OAuth en séquence interactive, deux clients disputant un même état, animation des tokens et scopes.

**Exercices :** interpréter des journaux de paiement simulé ; choisir entre clé d’idempotence et verrou ; corriger une confusion OAuth/OIDC ; déduire les tests manquants d’un contrat OpenAPI.

**Ressources :** [OWASP API Security Top 10](https://owasp.org/API-Security/), [OAuth 2.0 RFC 6749](https://www.rfc-editor.org/rfc/rfc6749), [OpenID Connect](https://openid.net/developers/how-connect-works/), [Postman Learning Center](https://learning.postman.com/), [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests) (exemple de documentation métier). **Livres :** _Hacking APIs_ (Corey J. Ball) ; _API Security in Action_ (Neil Madden) ; _Designing Data-Intensive Applications_ (Martin Kleppmann).

**Labs externes :** [OWASP crAPI](https://owasp.org/www-project-crapi/), [PortSwigger API Testing](https://portswigger.net/web-security/api-testing), [HTB Academy](https://academy.hackthebox.com/).

**Validation :** rédiger un protocole de contrôle d’intégrité d’un portefeuille fictif avec erreurs, reprises, concurrence, rôles et comportements attendus.

## A-03 — Android : architecture, analyse de sécurité et applications mobiles

**Prérequis :** TC-02, TC-04, TC-06 et A-02.

**Compétences atomiques :**

- **A03.01** Expliquer architecture Android, sandbox et modèle d’applications.
- **A03.02** Comprendre APK, manifest, activités, services, receivers et providers.
- **A03.03** Distinguer permissions au runtime et permissions déclarées.
- **A03.04** Expliquer intents, deep links et composants exportés.
- **A03.05** Comprendre stockage local, préférences, fichiers et bases embarquées.
- **A03.06** Comprendre Android Keystore et gestion des secrets.
- **A03.07** Expliquer communication API, TLS et configuration réseau.
- **A03.08** Distinguer WebView, JS bridge et frontières de confiance.
- **A03.09** Reconnaître les risques d’authentification et de sessions mobiles.
- **A03.10** Lire les résultats d’analyse statique sans confondre indicateur et faille.
- **A03.11** Comprendre instrumentation et analyse dynamique en environnement de test.
- **A03.12** Interpréter la structure de code Java/Kotlin et du bytecode de manière conceptuelle.
- **A03.13** Comparer les choix d’obfuscation, d’intégrité et de protection applicative.
- **A03.14** Rédiger un rapport conforme aux catégories MASVS et à leurs limites.

**Visualisations :** architecture Android sous forme de couches, permissions comme graphe, parcours deep-link, donnée sensible dans mémoire/stockage, communication mobile↔API.

**Exercices :** lire un manifest fictif ; expliquer pourquoi un stockage est inadapté ; associer comportements observés à catégories MASVS ; concevoir une stratégie de test de session ; interpréter un résultat MobSF.

**Ressources :** [OWASP MASVS](https://mas.owasp.org/MASVS/), [OWASP MASTG](https://mas.owasp.org/MASTG/), [Android Developers](https://developer.android.com/courses), [MobSF Docs](https://mobsf.github.io/Mobile-Security-Framework-MobSF/), [Frida Docs](https://frida.re/docs/home/). **Livres :** _Android Security Internals_ (Nikolay Elenkov, vérifier ce qui a changé) ; _Android Hacker’s Handbook_ (Drake et al., historique).

**Labs externes :** [OWASP MASTG Apps](https://mas.owasp.org/MASTG/apps/), [InsecureBankv2](https://mas.owasp.org/MASTG/apps/), [TryHackMe](https://tryhackme.com/).

**Validation :** dossier Android incluant une cartographie d’application, une matrice stockage/authentification/permissions, un plan de test et l’interprétation de traces fictives ; preuve additionnelle dans une application de laboratoire.

## A-04 — iOS : modèle de sécurité et analyse des applications

**Prérequis :** A-03 (concepts mobiles communs), TC-02 et TC-04.

**Compétences atomiques :**

- **A04.01** Comprendre architecture iOS et modèle d’isolation.
- **A04.02** Distinguer code signing, provisioning, entitlements et sandbox.
- **A04.03** Comprendre IPA, bundles, frameworks et configuration.
- **A04.04** Expliquer Keychain, protection des fichiers et stockage local.
- **A04.05** Analyser permissions iOS et catégories de données sensibles.
- **A04.06** Comprendre Universal Links, URL schemes et communications inter-apps.
- **A04.07** Comprendre ATS, TLS, certificats et réseau iOS.
- **A04.08** Expliquer sessions, tokens et authentification biométrique côté client.
- **A04.09** Comprendre WebView/WKWebView et échanges avec JavaScript.
- **A04.10** Lire des structures Swift/Objective-C à un niveau analytique.
- **A04.11** Comprendre la différence entre analyse statique et dynamique.
- **A04.12** Distinguer limites d’une analyse sur appareil standard et environnement de recherche.
- **A04.13** Identifier risques liés aux sauvegardes, configurations et partage de données.
- **A04.14** Rédiger une analyse structurée via MASVS/MASTG.

**Visualisations :** coffre Keychain interactif, chaîne de signature, frontières d’apps, flux Universal Links, transitions d’une session iOS.

**Exercices :** choisir un stockage adapté ; repérer des conclusions non fondées dans un rapport ; analyser des entitlements fictifs ; prédire l’effet d’un état de session ; comparer Android et iOS sans les confondre.

**Ressources :** [Apple Platform Security](https://support.apple.com/guide/security/welcome/web), [Apple Developer Documentation](https://developer.apple.com/documentation/), [OWASP MASTG iOS](https://mas.owasp.org/MASTG/), [OWASP MASVS](https://mas.owasp.org/MASVS/). **Livres :** _iOS Application Security_ (David Thiel, historique) ; documentation Apple à privilégier pour l’état actuel.

**Labs externes :** [OWASP MASTG Apps](https://mas.owasp.org/MASTG/apps/) (DVIA, iGoat-Swift et autres selon disponibilité).

**Validation :** spécification d’un audit iOS avec plan de collecte consentie, hypothèses de sécurité et critères de preuve ; analyse d’une application de laboratoire.

## A-05 — AppSec, architecture sécurisée et DevSecOps

**Prérequis :** A-01 à A-04 et TC-07.

**Compétences atomiques :**

- **A05.01** Traduire une menace en exigences vérifiables.
- **A05.02** Appliquer moindre privilège et défense en profondeur à une architecture.
- **A05.03** Définir un modèle d’authentification et gestion de sessions.
- **A05.04** Organiser la validation des entrées, des sorties et des erreurs.
- **A05.05** Concevoir une gestion sûre des secrets et clés.
- **A05.06** Comprendre SAST, DAST, SCA et leurs faux positifs.
- **A05.07** Interpréter SBOM, dépendances et risques de supply chain.
- **A05.08** Comprendre CI/CD, artefacts signés et contrôles avant déploiement.
- **A05.09** Expliquer configuration sécurisée de Docker et Kubernetes.
- **A05.10** Comprendre IAM cloud, permissions et responsabilité partagée.
- **A05.11** Définir logs de sécurité, alertes et conservation.
- **A05.12** Prioriser des corrections avec criticité, exposition et exploitabilité.
- **A05.13** Vérifier un correctif par test de non-régression.
- **A05.14** Organiser une revue d’architecture avec les développeurs.
- **A05.15** Évaluer les modifications IA et les dépendances qu’elles introduisent.

**Visualisations :** pipeline CI/CD et barrières de sécurité, graphe de dépendances, propagation d’un secret dans l’architecture, matrice permissions cloud.

**Exercices :** critiquer un pipeline fictif ; lire un rapport SAST ; proposer des contrôles ASVS ; examiner une modification de code IA ; construire un plan de corrections par risque.

**Ressources :** [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/), [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/), [Semgrep Docs](https://semgrep.dev/docs/), [GitHub Code Security](https://docs.github.com/en/code-security), [Kubernetes Security](https://kubernetes.io/docs/concepts/security/), [AWS Security Learning](https://aws.amazon.com/training/). **Livres :** _Alice and Bob Learn Application Security_ (Tanya Janca) ; _Container Security_ (Liz Rice) ; _Threat Modeling_ (Adam Shostack).

**Validation :** audit de conception d’une plateforme SaaS fictive avec exigences, carte de menaces, propositions de contrôles et protocole de tests.

## A-06 — QA, fiabilité, performance et expérience produit

**Prérequis :** TC-04 et TC-05.

**Compétences atomiques :**

- **A06.01** Distinguer assurance qualité, test fonctionnel, test de sécurité et fiabilité.
- **A06.02** Définir critères d’acceptation et parcours critiques.
- **A06.03** Connaître équivalence, valeurs limites et partitions de données.
- **A06.04** Concevoir des scénarios fonctionnels et négatifs.
- **A06.05** Comprendre tests end-to-end, contrats API et mocks.
- **A06.06** Lire et critiquer un script Playwright généré par IA.
- **A06.07** Expliquer latence, débit, concurrence, saturation et percentiles.
- **A06.08** Différencier tests de charge, stress, endurance et montée en charge.
- **A06.09** Comprendre SLI, SLO, SLA et budgets d’erreur.
- **A06.10** Analyser logs, métriques et traces distribuées.
- **A06.11** Diagnostiquer une erreur intermittente et proposer une hypothèse.
- **A06.12** Vérifier résilience, timeouts, retries et récupération.
- **A06.13** Construire un rapport qualité et performance avec limites mesurées.

**Visualisations :** utilisateurs virtuels, files d’attente, courbe de latence percentiles, traces distribuées, état de la plateforme avant/après panne.

**Exercices :** interpréter des graphiques k6 ; expliquer pourquoi une moyenne masque une panne ; concevoir tests pour une réservation ; comparer deux SLO ; analyser un échec intermittent.

**Ressources :** [Playwright Docs](https://playwright.dev/docs/intro), [Cypress Docs](https://docs.cypress.io/), [Grafana k6 Docs](https://grafana.com/docs/k6/latest/), [Postman Learning](https://learning.postman.com/), [Google SRE Books](https://sre.google/books/), [ISTQB](https://istqb.org/). **Livres :** _Lessons Learned in Software Testing_ (Kaner, Bach & Pettichord) ; _Release It!_ (Michael Nygard) ; _Site Reliability Engineering_ (Google).

**Validation :** plan qualité d’une application de paiement fictive, comprenant tests de parcours, cas d’erreur, critères de performance et analyse critique de résultats simulés.

## A-07 — Fintech, Mobile Money et systèmes transactionnels africains

**Prérequis :** A-02, A-05 et A-06.

**Compétences atomiques :**

- **A07.01** Comprendre acteurs d’un paiement : client, marchand, PSP, opérateur, banque.
- **A07.02** Expliquer initiation, autorisation, confirmation, compensation et réconciliation selon les modèles.
- **A07.03** Comprendre distinction entre solde présenté, grand livre et état d’une transaction.
- **A07.04** Expliquer idempotence, anti-rejeu et duplication de callbacks.
- **A07.05** Analyser pannes réseau mobile et reprise d’opérations.
- **A07.06** Comprendre rôles d’agents, marchands, administrateurs et supports.
- **A07.07** Reconnaître les risques de manipulation d’états métier.
- **A07.08** Décrire fraude au compte, SIM swap, social engineering et abus de récupération.
- **A07.09** Comprendre journal d’audit, alertes anti-fraude et traçabilité.
- **A07.10** Distinguer données client, métadonnées et secrets de paiement.
- **A07.11** Construire des scénarios de test à partir de flux fictifs.
- **A07.12** Expliquer réconciliation et investigations des écarts.
- **A07.13** Identifier les questions réglementaires à faire confirmer pays par pays.
- **A07.14** Rédiger des conclusions proportionnées à un risque financier prouvé.

**Visualisations :** machine d’état d’un paiement, grand livre simplifié, réseau opérateur/PSP/marchand, retries asynchrones et réconciliation.

**Exercices :** reconstruire une anomalie de paiement depuis événements fictifs ; sélectionner les contrôles contre duplication ; interpréter trois écarts entre ledger et interface ; concevoir un jeu de données de test sûr.

**Ressources :** [GSMA Mobile Money](https://www.gsma.com/mobilemoney/), [PCI Security Standards Council](https://www.pcisecuritystandards.org/), [OWASP API Security](https://owasp.org/API-Security/), [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework), documentation publique des fournisseurs utilisés dans la mission. **Livres :** _Designing Data-Intensive Applications_ (Kleppmann) ; _Payments Systems in the U.S._ (Carol Coye Benson et Russ Jones, utile pour les principes, non pour la réglementation africaine).

**Validation :** concevoir l’audit fonctionnel et sécurité d’une plateforme Mobile Money fictive, avec cartes des états, risques, contrôles et preuves minimales requises.

## A-08 — Fondations de l’IA, LLM, RAG et agents

**Prérequis :** TC-04, TC-05, TC-06.

**Compétences atomiques :**

- **A08.01** Distinguer apprentissage supervisé, non supervisé et génératif.
- **A08.02** Comprendre paramètres, entraînement, inférence et généralisation.
- **A08.03** Expliquer tokens, embeddings et similarité vectorielle.
- **A08.04** Visualiser attention et architecture Transformer conceptuelle.
- **A08.05** Comprendre context window, sampling et variabilité des sorties.
- **A08.06** Distinguer prompt, instruction, donnée récupérée et outil.
- **A08.07** Expliquer le pipeline de RAG : indexation, recherche, contexte, réponse.
- **A08.08** Comprendre mémoire d’agent, boucle de décision et planification.
- **A08.09** Expliquer permissions d’outils et actions à effets externes.
- **A08.10** Comprendre interfaces et connecteurs d’agents, dont MCP.
- **A08.11** Distinguer évaluation, métriques, golden datasets et tests de régression.
- **A08.12** Reconnaître hallucination, dérive, non-déterminisme et limites de modèle.
- **A08.13** Définir intervention humaine et seuil d’autonomie.
- **A08.14** Modéliser menaces propres à une application IA.

**Visualisations :** tokens et embeddings en espace 3D simplifié, attention comme carte, RAG en pipeline, agent avec graphe d’outils et permissions.

**Exercices :** interpréter un pipeline RAG, prédire la conséquence d’un document obsolète, choisir une politique de permissions, expliquer pourquoi une réponse correcte une fois ne démontre pas la robustesse.

**Ressources :** [Hugging Face Learn](https://huggingface.co/learn), [DeepLearning.AI](https://www.deeplearning.ai/), [fast.ai](https://course.fast.ai/), [Full Stack Deep Learning](https://fullstackdeeplearning.com/), [Model Context Protocol](https://modelcontextprotocol.io/). **Livres :** _AI Engineering_ (Chip Huyen) ; _Hands-On Large Language Models_ (Alammar & Grootendorst) ; _Designing Machine Learning Systems_ (Chip Huyen).

**Validation :** dessiner et expliquer une application IA avec RAG et actions, incluant états, sources de données, limites et points de décision humaine.

## A-09 — Pentest et assurance de sécurité des systèmes IA

**Prérequis :** A-08, A-01, A-02 et TC-07.

**Compétences atomiques :**

- **A09.01** Identifier les surfaces d’attaque d’une application IA.
- **A09.02** Comprendre injection d’instructions et différence donnée/instruction.
- **A09.03** Distinguer prompt injection directe et indirecte.
- **A09.04** Expliquer risques de divulgation et de rétention de données sensibles.
- **A09.05** Comprendre empoisonnement de données et de contenu récupéré.
- **A09.06** Comprendre risques de supply chain de modèles, datasets et outils.
- **A09.07** Distinguer extraction, inversion et inférence d’appartenance conceptuellement.
- **A09.08** Examiner autorisation et isolation multi-tenant dans un RAG.
- **A09.09** Évaluer permissions d’outils, confirmations et actions critiques.
- **A09.10** Comprendre sécurité des connecteurs MCP et frontières de confiance.
- **A09.11** Comprendre attaques d’indisponibilité et d’épuisement des ressources.
- **A09.12** Construire un jeu d’évaluation de sécurité représentatif.
- **A09.13** Définir des critères de succès, faux positifs et reproductibilité malgré le non-déterminisme.
- **A09.14** Comparer garde-fous, contrôles d’application et contrôles d’infrastructure.
- **A09.15** Lire des résultats d’outils d’évaluation IA avec esprit critique.
- **A09.16** Rédiger un rapport d’audit IA avec preuve et remédiation.

**Visualisations :** frontière de confiance agent/outils/données, contamination d’une réponse par un document, flux RAG isolé/non isolé, arbre de décisions d’un agent.

**Exercices :** classer scénarios d’injection ; décider quels droits doivent être confirmés ; analyser une trace d’agent fictive ; critiquer une fausse affirmation de robustesse ; proposer les tests d’une politique de moindre privilège.

**Ressources :** [OWASP GenAI Security Project](https://genai.owasp.org/), [MITRE ATLAS](https://atlas.mitre.org/), [PortSwigger LLM Attacks](https://portswigger.net/web-security/llm-attacks), [Promptfoo](https://www.promptfoo.dev/), [garak](https://github.com/NVIDIA/garak), [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). **Livres :** _AI Engineering_ (Chip Huyen) ; _Hands-On Large Language Models_ (Alammar & Grootendorst).

**Labs externes :** [PortSwigger LLM Labs](https://portswigger.net/web-security/llm-attacks), [HTB Academy](https://academy.hackthebox.com/), laboratoires contrôlés conçus pour le cours.

**Validation :** plan d’audit d’un assistant IA fictif avec recherche documentaire, actions externes et données de plusieurs clients ; analyse de traces synthétiques et contre-mesures argumentées.

---

# Partie V — Branche B : hacking offensif avancé et recherche de vulnérabilités

## B-01 — Infrastructure réseau et cartographie de sécurité

**Prérequis :** TC-02, TC-03, TC-07.

**Compétences atomiques :**

- **B01.01** Identifier les segments réseau, zones de confiance et points de contrôle.
- **B01.02** Expliquer les effets des VLAN, ACL, pare-feu et politiques de routage.
- **B01.03** Analyser les résultats d’une découverte de services sur un réseau de laboratoire.
- **B01.04** Différencier exposition de port, service vulnérable et impact démontré.
- **B01.05** Lire une topologie avec NAT, VPN, proxys, tunnels et bastions.
- **B01.06** Identifier les chemins possibles entre deux zones réseau.
- **B01.07** Comprendre l’architecture des identités réseau et des partages.
- **B01.08** Analyser l’impact du DNS, DHCP et de la configuration des clients.
- **B01.09** Expliquer les risques des services d’administration exposés.
- **B01.10** Comparer détection réseau, journaux et télémétrie d’hôte.
- **B01.11** Évaluer la segmentation à partir de flux autorisés et interdits.
- **B01.12** Construire une matrice de surface d’attaque par actif.
- **B01.13** Analyser les conséquences d’une vulnérabilité sur des données de test.
- **B01.14** Définir les limites, dépendances et conditions d’arrêt d’un audit réseau.
- **B01.15** Rédiger les observations et distinguer suppositions et faits.

**Visualisations :** Topologie interactive, paquets animés, matrice de flux autorisés, propagation conceptuelle d’un risque.

**Exercices internes :** Annoter une topologie, détecter des chemins interdits, interpréter des sorties de scan fictives, choisir une séquence de validation à faible impact.

**Ressources :** [Nmap Network Scanning](https://nmap.org/book/) · [HTB Academy](https://academy.hackthebox.com/) · [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final) · [Wireshark](https://www.wireshark.org/docs/)

**Livres :** _Network Security Assessment_ — Chris McNab ; _Practical Packet Analysis_ — Chris Sanders

**Laboratoires externes :** [TryHackMe](https://tryhackme.com/) · [Hack The Box](https://www.hackthebox.com/)

**Validation :** Rapport de cartographie de réseau fictif, chemins possibles et contrôles à tester, sans confusion entre surface et compromission.

---

## B-02 — Windows, Active Directory et identités d’entreprise

**Prérequis :** TC-02, TC-03, B-01.

**Compétences atomiques :**

- **B02.01** Distinguer domaine, forêt, contrôleur et relation de confiance.
- **B02.02** Expliquer les rôles d’AD DS, LDAP, DNS et Kerberos.
- **B02.03** Comprendre les tickets Kerberos et les conditions de leur validation.
- **B02.04** Expliquer NTLM et les raisons de sa réduction.
- **B02.05** Lire une matrice de groupes, comptes et permissions.
- **B02.06** Différencier identités humaines, services et machines.
- **B02.07** Analyser le rôle des GPO dans la configuration.
- **B02.08** Comprendre délégation, privilèges et droits effectifs.
- **B02.09** Modéliser les risques des comptes de service.
- **B02.10** Identifier les configurations d’authentification faibles.
- **B02.11** Comprendre relations de confiance interdomaines et limites.
- **B02.12** Interpréter une représentation de chemins de privilèges.
- **B02.13** Évaluer les risques de permissions de fichiers et de partages.
- **B02.14** Expliquer détection, journalisation et audit des connexions.
- **B02.15** Distinguer une erreur de configuration d’une attaque validée.
- **B02.16** Décrire les risques liés aux identifiants et secrets de service.
- **B02.17** Proposer des remédiations et hiérarchiser les contrôles.
- **B02.18** Élaborer une matrice de tests AD autorisés.

**Visualisations :** Graphe des relations de confiance, parcours d’un ticket Kerberos, arbre des permissions effectives.

**Exercices internes :** Diagnostiquer des permissions excessives dans des graphes synthétiques, reconstruire un flux d’authentification et choisir les mesures de réduction de risque.

**Ressources :** [Microsoft Learn — Identity](https://learn.microsoft.com/en-us/entra/identity/) · [Microsoft AD DS](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview) · [MITRE ATT&CK](https://attack.mitre.org/)

**Livres :** _Active Directory Security_ — cours et guides Microsoft ; _Windows Internals_ — Pavel Yosifovich et al.

**Laboratoires externes :** [HTB Academy](https://academy.hackthebox.com/) · [TryHackMe](https://tryhackme.com/)

**Validation :** Expliquer et évaluer de bout en bout l’architecture d’identité d’une entreprise fictive et ses chemins de risques.

---

## B-03 — Sécurité Linux, conteneurs et élévation de privilèges

**Prérequis :** TC-01, TC-02, TC-07.

**Compétences atomiques :**

- **B03.01** Distinguer UID, GID, permissions Unix et ACL.
- **B03.02** Expliquer sudo, su, SUID et capabilities.
- **B03.03** Analyser l’héritage des permissions et des processus.
- **B03.04** Comprendre variables d’environnement et chemins d’exécution.
- **B03.05** Distinguer services système, tâches planifiées et unités systemd.
- **B03.06** Interpréter les journaux d’authentification et d’exécution.
- **B03.07** Comprendre namespaces, cgroups et isolation des conteneurs.
- **B03.08** Identifier les frontières de confiance entre hôte et conteneur.
- **B03.09** Comprendre profils seccomp et mécanismes LSM.
- **B03.10** Évaluer les risques d’une configuration de volume.
- **B03.11** Analyser les risques de secrets dans fichiers et environnements.
- **B03.12** Comprendre mises à jour et vulnérabilités de dépendances.
- **B03.13** Interpréter un graphe abstrait de privilèges.
- **B03.14** Définir une validation contrôlée des permissions.
- **B03.15** Concevoir des remédiations de moindre privilège.

**Visualisations :** Arbre de processus, hiérarchie des privilèges, couches des conteneurs et frontières du noyau.

**Exercices internes :** Comparer des permissions, diagnostiquer des chemins de privilèges hypothétiques et corriger une configuration fictive.

**Ressources :** [Linux Journey](https://linuxjourney.com/) · [Docker Security](https://docs.docker.com/engine/security/) · [Kubernetes Security](https://kubernetes.io/docs/concepts/security/)

**Livres :** _How Linux Works_ — Brian Ward ; _Container Security_ — Liz Rice

**Laboratoires externes :** [OverTheWire](https://overthewire.org/wargames/) · [HTB Academy](https://academy.hackthebox.com/)

**Validation :** Défendre une analyse de risque de privilèges et la remédiation d’une machine Linux et d’un conteneur fictifs.

---

## B-04 — Méthodologie offensive de bout en bout

**Prérequis :** TC-07, A-01, B-01.

**Compétences atomiques :**

- **B04.01** Formaliser le mandat et les règles d’engagement.
- **B04.02** Définir les frontières de l’environnement et les actifs critiques.
- **B04.03** Construire un arbre d’objectifs métier et techniques.
- **B04.04** Organiser la collecte de données initiales sans conclusions prématurées.
- **B04.05** Cartographier les composants et les hypothèses de chemins d’attaque.
- **B04.06** Établir critères de validité, preuve et reproductibilité.
- **B04.07** Distinguer vulnérabilité, primitive d’exploitation et conséquence.
- **B04.08** Construire une chaîne hypothétique de plusieurs faiblesses.
- **B04.09** Évaluer préconditions et dépendances de chaque étape.
- **B04.10** Mesurer les risques d’interruption et les effets de bord.
- **B04.11** Définir des paliers de profondeur de validation convenus.
- **B04.12** Choisir des démonstrations non destructives et des données de test.
- **B04.13** Documenter chaque observation, horodatage et artefact.
- **B04.14** Comprendre la post-exploitation comme validation de conséquences.
- **B04.15** Prévoir la restauration de l’environnement.
- **B04.16** Distinguer les résultats confirmés, inférés et non testés.
- **B04.17** Évaluer l’impact métier des chaînes de risques.
- **B04.18** Rédiger un rapport fondé sur preuves et limites.
- **B04.19** Planifier les corrections et contre-tests.
- **B04.20** Conduire une restitution adaptée à un décideur et à une équipe technique.

**Visualisations :** Graphe de chemins d’attaque, arbre d’objectifs, diagramme d’autorisation et jalons de validation.

**Exercices internes :** Ordonner les phases d’une mission, sélectionner une preuve suffisante à partir de plusieurs options, critiquer un rapport excessif et rédiger un plan sans commandes.

**Ressources :** [PTES](http://www.pentest-standard.org/) · [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final) · [OWASP WSTG](https://wstg.owasp.org/) · [MITRE ATT&CK](https://attack.mitre.org/)

**Livres :** _The Art of Network Penetration Testing_ — Royce Davis ; _Threat Modeling_ — Adam Shostack

**Laboratoires externes :** [HTB Academy](https://academy.hackthebox.com/) · [Hack The Box](https://www.hackthebox.com/)

**Validation :** Dossier intégral de mission avec hypothèses, chaîne conceptuelle, preuves contrôlées, restauration et rapport client.

---

## B-05 — Post-exploitation simulée et compréhension des impacts

**Prérequis :** B-02, B-03, B-04.

**Compétences atomiques :**

- **B05.01** Définir post-exploitation et objectifs de validation.
- **B05.02** Distinguer accès initial, privilèges et portée d’un compte.
- **B05.03** Comprendre le contexte d’un processus et ses jetons de sécurité.
- **B05.04** Modéliser les relations possibles entre machines et identités.
- **B05.05** Expliquer les classes de persistance observées en incident response.
- **B05.06** Distinguer persistance simulée et maintien d’accès non autorisé.
- **B05.07** Analyser les risques d’élévation de privilèges dans un cyber-range.
- **B05.08** Comprendre les mécanismes de déplacement latéral au niveau conceptuel.
- **B05.09** Représenter les relations de confiance et de délégation.
- **B05.10** Évaluer les contrôles qui empêchent un chemin de compromission.
- **B05.11** Comprendre les traces laissées par différentes actions d’un adversaire.
- **B05.12** Concevoir des marqueurs inoffensifs pour les simulations.
- **B05.13** Comparer validation par compte de test et accès à des données réelles.
- **B05.14** Expliquer comment limiter la collecte de données et les effets de bord.
- **B05.15** Construire un plan de restauration et de nettoyage.
- **B05.16** Définir les déclencheurs d’arrêt et d’escalade vers le client.
- **B05.17** Interpréter une chronologie d’actions et la télémétrie associée.
- **B05.18** Rédiger une démonstration de conséquence métier contrôlée.

**Visualisations :** Graphe d’identité et de déplacement, états de privilège, chronologie d’événements et traces de détection.

**Exercices internes :** À partir d’une chronologie fictive, identifier le changement de privilège, la portée, les contrôles et les preuves suffisantes ; choisir la réponse la moins intrusive.

**Ressources :** [MITRE ATT&CK](https://attack.mitre.org/) · [MITRE CALDERA](https://caldera.mitre.org/) · [Atomic Red Team](https://atomicredteam.io/)

**Livres :** _Intelligence-Driven Incident Response_ — Scott Roberts, Rebekah Brown ; _The Hacker Playbook 3_ — Peter Kim

**Laboratoires externes :** [HTB Academy](https://academy.hackthebox.com/) · [TryHackMe](https://tryhackme.com/)

**Validation :** Concevoir une émulation limitée, observable et réversible qui prouve une conséquence sans dépendre d’une compromission cachée.

---

## B-06 — Red Team, Purple Team et adversary emulation

**Prérequis :** B-04, B-05, C-03.

**Compétences atomiques :**

- **B06.01** Distinguer pentest, Red Team, Purple Team et exercice de crise.
- **B06.02** Formuler un objectif d’émulation observable.
- **B06.03** Choisir des scénarios fondés sur un modèle de menace.
- **B06.04** Associer les comportements adverses à MITRE ATT&CK.
- **B06.05** Comprendre le cycle de vie d’une campagne d’émulation.
- **B06.06** Définir un périmètre et des règles de sécurité mesurables.
- **B06.07** Concevoir des tests par phases avec points d’arrêt.
- **B06.08** Coordonner red team, blue team et responsable d’exercice.
- **B06.09** Définir des indicateurs de couverture de détection.
- **B06.10** Comprendre la différence entre absence d’alerte et absence de visibilité.
- **B06.11** Interpréter les événements d’hôte et réseau pendant une simulation.
- **B06.12** Analyser les ruptures de chaîne d’attaque.
- **B06.13** Comparer différents contrôles face au même comportement.
- **B06.14** Évaluer le temps de détection et de traitement sans inventer de métriques.
- **B06.15** Organiser l’apprentissage croisé après exercice.
- **B06.16** Rédiger le compte rendu des angles morts.
- **B06.17** Prioriser les actions correctives et leur re-test.
- **B06.18** Comprendre le rôle de la déception et des canaris défensifs.

**Visualisations :** Carte MITRE navigable, flux d’événements red/blue, matrice couverture et chaîne bloquée.

**Exercices internes :** Classer des observations par TTP, expliquer pourquoi un scénario est mal instrumenté, concevoir un jeu d’indicateurs de réussite.

**Ressources :** [MITRE ATT&CK](https://attack.mitre.org/) · [MITRE Adversary Emulation Plans](https://attack.mitre.org/resources/adversary-emulation-plans/) · [MITRE CALDERA](https://caldera.mitre.org/)

**Livres :** _Purple Teaming: Executing Security Tests_ — guide et lectures MITRE ; _Intelligence-Driven Incident Response_ — Roberts & Brown

**Laboratoires externes :** [TryHackMe](https://tryhackme.com/) · [HTB Academy](https://academy.hackthebox.com/)

**Validation :** Plan d’émulation avec objectifs, indicateurs, contrôle des risques, rapport des détections et réévaluation.

---

## B-07 — Architecture bas niveau, assembleur et formats exécutables

**Prérequis :** TC-01, TC-05.

**Compétences atomiques :**

- **B07.01** Représenter registres et opérations arithmétiques de l’architecture cible.
- **B07.02** Expliquer les conventions d’appel et la pile.
- **B07.03** Comprendre adresses virtuelles et pages mémoire.
- **B07.04** Distinguer code, données, heap et stack.
- **B07.05** Lire les formes principales de branchement et de boucle.
- **B07.06** Comprendre le rôle du compilateur et de l’éditeur de liens.
- **B07.07** Distinguer symboles, imports et exports.
- **B07.08** Lire conceptuellement les formats ELF et PE.
- **B07.09** Comprendre bibliothèques dynamiques et chargement.
- **B07.10** Expliquer les mécanismes d’exception et de signal.
- **B07.11** Comprendre représentation des chaînes et buffers.
- **B07.12** Identifier les risques des conversions de types.
- **B07.13** Expliquer integer overflow et comportement indéfini.
- **B07.14** Distinguer erreurs de logique et corruptions mémoire.
- **B07.15** Interpréter un graphe de flot de contrôle.
- **B07.16** Comparer code source, désassemblage et pseudo-code.
- **B07.17** Comprendre le fonctionnement des outils de débogage.
- **B07.18** Modéliser l’effet des protections mémoire modernes.

**Visualisations :** Processeur et registres animés, pile/tas, format ELF/PE, graphe de contrôle.

**Exercices internes :** Tracer un petit programme en pseudo-assembleur, expliquer son état mémoire, reconnaître les limites d’une traduction décompilée.

**Ressources :** [OpenSecurityTraining2](https://ost2.fyi/) · [pwn.college](https://pwn.college/) · [Ghidra](https://ghidra-sre.org/)

**Livres :** _Computer Systems: A Programmer’s Perspective_ — Bryant & O’Hallaron ; _Practical Binary Analysis_ — Dennis Andriesse

**Laboratoires externes :** [pwn.college](https://pwn.college/) · [crackmes.one](https://crackmes.one/)

**Validation :** Reconstituer le flot, les données et les contraintes d’un programme pédagogique inconnu.

---

## B-08 — Recherche de vulnérabilités et exploit development en laboratoire

**Prérequis :** B-07, TC-07.

**Compétences atomiques :**

- **B08.01** Construire une taxonomie de failles mémoire et de logique bas niveau.
- **B08.02** Comprendre dépassement de tampon, use-after-free et double free.
- **B08.03** Expliquer les problèmes de durées de vie et d’aliasing.
- **B08.04** Différencier plantage, corruption contrôlable et risque exploitable.
- **B08.05** Comprendre la notion de primitive et ses préconditions.
- **B08.06** Analyser les protections ASLR, DEP/NX, canaries et CFI.
- **B08.07** Comprendre principes et limites du fuzzing.
- **B08.08** Distinguer mutation, génération et instrumentation de couverture.
- **B08.09** Définir un oracle de test et un critère d’échec.
- **B08.10** Lire un rapport de crash et formuler une hypothèse.
- **B08.11** Concevoir une minimisation et une reproductibilité de cas de test.
- **B08.12** Comprendre les sources de non-déterminisme d’un crash.
- **B08.13** Prioriser les vulnérabilités par exposition et conséquences.
- **B08.14** Lire une annonce CVE/CWE et discuter sa portée.
- **B08.15** Comprendre les méthodes de divulgation coordonnée.
- **B08.16** Distinguer PoC de laboratoire et code dangereux réutilisable.
- **B08.17** Expliquer comment vérifier une correction et prévenir les régressions.
- **B08.18** Préparer une documentation technique non destructive.

**Visualisations :** Évolution du heap, pipeline de fuzzing, protections mémoire représentées par états, arbre de crash.

**Exercices internes :** Classer des crashs synthétiques, comparer hypothèses d’exploitabilité, concevoir une campagne de fuzzing sur un parseur de test.

**Ressources :** [pwn.college](https://pwn.college/) · [AFL++](https://aflplus.plus/) · [LLVM libFuzzer](https://llvm.org/docs/LibFuzzer.html) · [CWE](https://cwe.mitre.org/)

**Livres :** _Practical Binary Analysis_ — Dennis Andriesse ; _The Art of Exploitation_ — Jon Erickson

**Laboratoires externes :** [pwn.college](https://pwn.college/) · [OpenSecurityTraining2](https://ost2.fyi/)

**Validation :** Analyse reproductible d’une vulnérabilité de laboratoire, mécanisme, hypothèses, mitigation et tests de régression.

---

## B-09 — Reverse engineering de logiciels et composants mobiles

**Prérequis :** B-07, A-03, A-04.

**Compétences atomiques :**

- **B09.01** Distinguer analyse statique, dynamique et hybride.
- **B09.02** Lire les métadonnées, dépendances et symboles d’un binaire.
- **B09.03** Comprendre la limite des chaînes de caractères comme indicateurs.
- **B09.04** Construire le graphe d’appels d’une fonction importante.
- **B09.05** Comparer désassembleur, décompilateur et débogueur.
- **B09.06** Reconnaître les éléments de base d’un format APK/DEX.
- **B09.07** Comprendre structures Objective-C/Swift visibles dans un binaire.
- **B09.08** Interpréter des ressources et configurations mobiles.
- **B09.09** Comprendre instrumentation dynamique et ses limites.
- **B09.10** Analyser les branches d’authentification d’une application de laboratoire.
- **B09.11** Expliquer comment les protections d’intégrité affectent l’analyse.
- **B09.12** Différencier obfuscation et chiffrement.
- **B09.13** Comprendre packing et analyse après décompression autorisée.
- **B09.14** Documenter les comportements observés sans leur prêter une intention non démontrée.
- **B09.15** Identifier des modèles d’erreur logicielle dans un code décompilé.
- **B09.16** Comparer comportement observé et spécification attendue.
- **B09.17** Formuler des tests de validation sur des binaires pédagogiques.

**Visualisations :** Graphes d’appels, traduction code source/assembleur, organisation DEX, chronologie instrumentée.

**Exercices internes :** Associer fonctions à comportements à partir de pseudo-code, repérer une erreur de raisonnement dans une décompilation, expliquer une trace d’application mobile fictive.

**Ressources :** [Ghidra](https://ghidra-sre.org/) · [JADX](https://github.com/skylot/jadx) · [Frida Docs](https://frida.re/docs/home/) · [OWASP MASTG](https://mas.owasp.org/MASTG/)

**Livres :** _The Ghidra Book_ — Chris Eagle & Kara Nance ; _Practical Reverse Engineering_ — Bruce Dang et al.

**Laboratoires externes :** [crackmes.one](https://crackmes.one/) · [OWASP MASTG Apps](https://mas.owasp.org/MASTG/apps/)

**Validation :** Rapport d’analyse d’un programme inconnu d’entraînement, flux, limites, assertions vérifiables.

---

## B-10 — Malware analysis et protocoles malveillants en environnement isolé

**Prérequis :** B-07, B-09, C-05.

**Compétences atomiques :**

- **B10.01** Distinguer type, famille, campagne et comportement malveillant.
- **B10.02** Comprendre les risques d’ouverture d’échantillons inconnus.
- **B10.03** Expliquer l’isolation d’un environnement d’analyse.
- **B10.04** Lire hashes, signatures et métadonnées d’un échantillon.
- **B10.05** Analyser des comportements fichiers et registres enregistrés.
- **B10.06** Reconnaître les catégories de persistance dans une chronologie.
- **B10.07** Interpréter les créations de processus et relations parent/enfant.
- **B10.08** Comprendre les modèles de communications C2 observés.
- **B10.09** Différencier beaconing, trafic normal et faux positifs.
- **B10.10** Analyser une trace DNS/HTTP provenant d’un échantillon pédagogique.
- **B10.11** Comprendre les rôles des packers et techniques d’obfuscation.
- **B10.12** Extraire conceptuellement les indicateurs utiles sans généralisation abusive.
- **B10.13** Distinguer indicateurs périssables et comportements durables.
- **B10.14** Écrire une logique de détection YARA au niveau conceptuel.
- **B10.15** Comprendre la logique des règles Sigma.
- **B10.16** Confronter l’analyse statique aux comportements observés.
- **B10.17** Construire une chronologie d’exécution cohérente.
- **B10.18** Rédiger un rapport de malware sans attribution infondée.

**Visualisations :** Arbre de processus, chronologie réseau, sandbox isolée, chaîne logique YARA/Sigma.

**Exercices internes :** Interpréter un rapport de sandbox fictif, classer les IOC et proposer des règles de détection conceptualisées.

**Ressources :** [REMnux](https://docs.remnux.org/) · [FLARE-VM](https://github.com/mandiant/flare-vm) · [YARA](https://virustotal.github.io/yara-x/) · [Sigma](https://sigmahq.io/)

**Livres :** _Practical Malware Analysis_ — Sikorski & Honig ; _The Art of Memory Forensics_ — Ligh et al.

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/) · [FLARE-ON](https://flare-on.com/)

**Validation :** Rapport d’analyse d’un échantillon pédagogique, indices, comportements, hypothèses et détections.

---

---

## B-11 — Ingénierie logicielle offensive multiplateforme et recherche sur la persistance

**Position dans le cursus :** spécialisation experte après B-05, B-07, B-08, B-09 et B-10 ; liens avec C-06 à C-09, A-03/A-04 et D-03.

**Finalité :** comprendre techniquement les mécanismes utilisés par des logiciels d’exploitation et de maintien d’accès sur postes, serveurs, appareils mobiles, systèmes embarqués et environnements cloud. Développer des démonstrateurs visibles, consentis et réversibles pour évaluer les contrôles, détecter les traces et documenter les risques. Aucun objectif de déploiement clandestin ni de surveillance non consentie.

**Compétences atomiques et progression :**

### B-11.01 — Positionnement, frontières et architecture

- **B11.001** Distinguer agent d’administration légitime, implant offensif, malware et outil forensique.
- **B11.002** Définir le modèle de menace d’une activité de maintien d’accès.
- **B11.003** Identifier les frontières de confiance entre utilisateur, application, service et noyau.
- **B11.004** Séparer architecture de logiciel, comportement observé et intention attribuée.
- **B11.005** Décrire les droits et contraintes d’une mission offensive écrite.
- **B11.006** Comparer preuve d’impact, persistance observée et contrôle durable hypothétique.
- **B11.007** Distinguer modèle d’attaque historique et risque applicable à une version récente.
- **B11.008** Définir des conditions d’arrêt, de restauration et de suppression de tous les artefacts de test.

### B-11.02 — Exécution logicielle multiplateforme

- **B11.009** Comparer processus, thread, service et tâche planifiée.
- **B11.010** Expliquer la création et la terminaison d’un processus.
- **B11.011** Décrire les espaces mémoire utilisateur et noyau.
- **B11.012** Comprendre héritage d’environnement, identités et permissions des processus.
- **B11.013** Comparer formats exécutables PE, ELF et Mach-O.
- **B11.014** Expliquer signatures de code, notarisation et validation de chargement.
- **B11.015** Décrire mécanismes de lancement et d’arrêt sur Windows, Linux et macOS.
- **B11.016** Comparer application Android, service d’arrière-plan et restrictions d’exécution.
- **B11.017** Comparer extension iOS, processus applicatif et sandbox.
- **B11.018** Distinguer mécanismes de démarrage sur machines virtuelles, conteneurs et systèmes embarqués.

### B-11.03 — Modèles de privilèges et isolation

- **B11.019** Différencier autorisation, authentification et privilège effectif.
- **B11.020** Expliquer jetons, sessions, groupes et droits de service.
- **B11.021** Comparer ACL, capacités Linux et contrôles MAC.
- **B11.022** Expliquer UAC, intégrité de processus et restrictions Windows à haut niveau.
- **B11.023** Expliquer SELinux, AppArmor et isolation par namespaces.
- **B11.024** Comparer sandbox mobile et isolation des applications de bureau.
- **B11.025** Expliquer privilèges d’un conteneur et frontières avec l’hôte.
- **B11.026** Analyser une matrice d’accès fictive et détecter les excès de privilèges.
- **B11.027** Prédire les conséquences d’une mauvaise configuration sur un graphe de confiance.

### B-11.04 — Recherche de vulnérabilités et impact système

- **B11.028** Distinguer bug, vulnérabilité et possibilité réelle de compromission.
- **B11.029** Expliquer types de corruption mémoire et erreurs logiques.
- **B11.030** Comprendre une chaîne de préconditions d’exploitation.
- **B11.031** Distinguer crash, exécution de code et élévation de privilèges.
- **B11.032** Expliquer primitives d’exploitation à un niveau conceptuel.
- **B11.033** Comprendre ASLR, DEP/NX, CFI et autres mitigations.
- **B11.034** Comparer exploitation utilisateur, noyau, navigateur et hyperviseur.
- **B11.035** Formuler une hypothèse de risque sur une application volontairement vulnérable.
- **B11.036** Concevoir une preuve minimale avec données factices et sans effet persistant.
- **B11.037** Expliquer les limites d’un exploit reproduit sur une version non représentative.

### B-11.05 — Persistance : modèles et traces

- **B11.038** Définir la persistance et la différencier de la simple durée d’exécution.
- **B11.039** Classer les grandes familles de mécanismes de démarrage automatique.
- **B11.040** Expliquer les services Windows comme surface de contrôle et de détection.
- **B11.041** Expliquer unités systemd et autres gestionnaires de services Linux.
- **B11.042** Expliquer launchd et les autorisations macOS.
- **B11.043** Comparer persistance liée à un compte, à une machine et à une infrastructure.
- **B11.044** Expliquer pourquoi la persistance mobile est différente selon OS et version.
- **B11.045** Analyser conceptuellement des techniques de persistance firmware/UEFI.
- **B11.046** Comprendre la persistance dans le cloud par identités, tâches et configurations.
- **B11.047** Décrire les événements de journalisation susceptibles de révéler un changement de démarrage.
- **B11.048** Distinguer éléments légitimes et indices contextuels de modification suspecte.
- **B11.049** Construire une chronologie avant-après d’un marqueur inoffensif autorisé.
- **B11.050** Concevoir un protocole de réversibilité et de vérification de nettoyage.

### B-11.06 — Commande distante et télémétrie

- **B11.051** Distinguer architecture client-serveur et modèle agent-contrôleur.
- **B11.052** Comparer session interactive, collecte périodique et messagerie asynchrone.
- **B11.053** Expliquer authentification mutuelle et séparation des rôles.
- **B11.054** Analyser latence, fréquence de communication et métadonnées observables.
- **B11.055** Distinguer trafic de supervision légitime et activité anormale selon contexte.
- **B11.056** Identifier les traces DNS, TLS, HTTP et proxy utiles à une enquête.
- **B11.057** Expliquer limites d’attribution à partir d’adresses IP et noms de domaine.
- **B11.058** Concevoir une simulation de télémétrie transparente sur deux machines de laboratoire.
- **B11.059** Interpréter journaux et captures d’une communication de test.
- **B11.060** Définir rotation de clés, révocation et suppression d’accès d’un agent légitime.

### B-11.07 — Analyse et simulation des comportements adverses

- **B11.061** Lire les tactiques ATT&CK sans les traiter comme un tutoriel opérationnel.
- **B11.062** Distinguer procédure observée, hypothèse et comportement simulé.
- **B11.063** Créer un graphe de scénarios fictifs multi-étapes.
- **B11.064** Définir objectifs et indicateurs de réussite d’un exercice Purple Team.
- **B11.065** Associer chaque comportement simulé à un capteur ou un journal attendu.
- **B11.066** Comparer visibilité hôte, réseau, identité et cloud.
- **B11.067** Identifier les échecs de corrélation entre plusieurs sources de logs.
- **B11.068** Évaluer risques de faux positif et faux négatif pour une détection.
- **B11.069** Analyser un scénario de persistance bénigne après redémarrage en environnement isolé.
- **B11.070** Définir procédures d’arrêt immédiat et de retour à l’état initial.

### B-11.08 — Reverse engineering et forensics

- **B11.071** Identifier les indices d’un comportement de lancement automatique dans des artefacts.
- **B11.072** Lire la liste des modules et bibliothèques d’un binaire de test.
- **B11.073** Interpréter un arbre de processus et ses relations temporelles.
- **B11.074** Expliquer l’apport du désassemblage et de l’analyse dynamique.
- **B11.075** Comparer artefacts mémoire, disque, registre et journaux.
- **B11.076** Distinguer IOC spécifique et comportement durable.
- **B11.077** Construire des hypothèses forensiques concurrentes.
- **B11.078** Vérifier intégrité, horodatages et provenance des échantillons.
- **B11.079** Rédiger un rapport de capacités sans supposer l’intention ou l’identité d’un auteur.
- **B11.080** Proposer un plan de remédiation et de contrôle post-incident.

### B-11.09 — Ingénierie logicielle assistée par IA

- **B11.081** Rédiger une spécification claire d’un agent de supervision consentie.
- **B11.082** Définir interfaces, données, permissions et limites attendues.
- **B11.083** Faire générer par IA un composant de démonstration explicitement visible et révocable.
- **B11.084** Lire le code généré et identifier les appels système sensibles.
- **B11.085** Exiger tests unitaires, journaux et garde-fous dans la spécification.
- **B11.086** Définir une stratégie de revue humaine des portions critiques.
- **B11.087** Comparer comportement annoncé et comportement réel de la simulation.
- **B11.088** Identifier une proposition IA qui introduit une capacité non demandée.
- **B11.089** Définir menaces liées aux dépendances et à la chaîne d’approvisionnement.
- **B11.090** Produire documentation de suppression, restauration et preuve d’exécution autorisée.

### B-11.10 — Validation experte et exercice de synthèse

- **B11.091** Expliquer à l’oral une chaîne de comportements de compromission fictive.
- **B11.092** Distinguer constat prouvé, hypothèse plausible et scénario impossible.
- **B11.093** Construire une cartographie multiplateforme des surfaces de persistance.
- **B11.094** Justifier les limites d’une démonstration contrôlée.
- **B11.095** Interpréter un jeu de journaux hétérogènes relatif à un changement de service.
- **B11.096** Identifier les traces permettant de confirmer ou d’infirmer une hypothèse.
- **B11.097** Définir une instrumentation permettant de mesurer la détection.
- **B11.098** Produire une analyse de risques et une feuille de remédiation.
- **B11.099** Présenter une preuve de remise en état du laboratoire.
- **B11.100** Réussir une étude de cas inédite après une période sans révision.

### Visualisations à produire pour l’académie

- Modèle 3D/2D des couches utilisateur → système → noyau → hyperviseur, montrant les frontières de confiance.
- Animation du cycle de vie processus/service, avec événements de démarrage, arrêt, redémarrage et traces.
- Comparateur interactif Windows / Linux / macOS / Android / iOS : permissions, isolement et mécanismes de lancement.
- Graphe d’attaque fictif montrant préconditions et impacts, sans instructions d’intrusion sur tiers.
- Simulateur de journalisation et de détection montrant comment des changements légitimes ou suspects deviennent visibles.
- Visualiseur de chronologie multi-sources : événements hôte, réseau, identité et cloud.

### Exercices internes de compréhension (sans exécution de code)

1. **Reconstruction :** remettre en ordre 12 événements fictifs (installation autorisée, modification de service, redémarrage, journaux, révocation).
2. **Prédiction :** anticiper si une simulation restera active après fermeture de session ou redémarrage, selon le modèle présenté.
3. **Comparaison :** expliquer pourquoi un mécanisme de service Linux ne se transpose pas directement à iOS.
4. **Diagnostic :** classifier des événements parmi activité normale, suspecte et indéterminée, avec justifications et niveaux de confiance.
5. **Threat modeling :** représenter les préconditions d’une hypothèse de compromission en évitant les affirmations non prouvées.
6. **Lecture de traces :** identifier à partir de logs synthétiques les hypothèses compatibles et celles à rejeter.
7. **Architecture :** rédiger la spécification d’un agent de supervision transparent et révocable, sans coder manuellement.
8. **Critique IA :** repérer dans une proposition de code généré les fonctionnalités excessives, permissions injustifiées et tests manquants.
9. **Évaluation de défense :** relier des événements simulés à ATT&CK, Sigma et à des contrôles de détection.
10. **Synthèse :** produire un rapport d’analyse multiplateforme et démontrer la suppression de tous les éléments de laboratoire.

### Ressources de référence (liens directs)

- [MITRE ATT&CK — Persistence](https://attack.mitre.org/tactics/TA0003/) et [MITRE ATT&CK — Enterprise](https://attack.mitre.org/matrices/enterprise/) : taxonomie et comportements observés.
- [MITRE CALDERA](https://caldera.readthedocs.io/en/latest/) : émulation d’adversaires autorisée et exercices Purple Team.
- [Atomic Red Team](https://github.com/redcanaryco/atomic-red-team) : tests de comportements à n’exécuter que sur une infrastructure de test sous contrôle.
- [Microsoft Learn — Windows Security](https://learn.microsoft.com/en-us/windows/security/) : modèles et contrôles Windows.
- [Microsoft Sysinternals](https://learn.microsoft.com/en-us/sysinternals/) : inspection des processus et démarrages automatiques.
- [Linux man-pages](https://man7.org/linux/man-pages/) et [systemd documentation](https://www.freedesktop.org/software/systemd/man/latest/) : comportements et interfaces des systèmes Linux.
- [Apple Platform Security](https://support.apple.com/guide/security/welcome/web) et [Apple Developer Documentation](https://developer.apple.com/documentation/) : sécurité des plateformes Apple.
- [Android Security Overview](https://source.android.com/docs/security/overview) : architecture et mécanismes de sécurité Android.
- [OWASP MASTG](https://mas.owasp.org/MASTG/) : analyse mobile et pratiques de laboratoire.
- [pwn.college](https://pwn.college/) et [OpenSecurityTraining](https://opensecuritytraining.info/) : architecture et exploitation bas niveau sur exercices prévus à cet effet.
- [Ghidra](https://ghidra-sre.org/) et [REMnux](https://docs.remnux.org/) : reverse engineering et analyse isolée.
- [Sigma](https://sigmahq.io/) et [YARA-X](https://virustotal.github.io/yara-x/) : détection et analyse de comportements.
- [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final) et [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) : audits techniques et forensics.

### Livres à étudier

- _Windows Internals_ — Pavel Yosifovich et coauteurs.
- _How Linux Works_ — Brian Ward.
- _Practical Reverse Engineering_ — Bruce Dang et coauteurs.
- _Practical Malware Analysis_ — Michael Sikorski & Andrew Honig.
- _Practical Binary Analysis_ — Dennis Andriesse.
- _The Ghidra Book_ — Chris Eagle & Kara Nance.
- _The Art of Memory Forensics_ — Michael Hale Ligh et coauteurs.

### Laboratoires externes et projet de maîtrise

- [CyberDefenders](https://cyberdefenders.org/) : investigations sur la persistance et artefacts système.
- [Hack The Box Academy](https://academy.hackthebox.com/catalogue/paths) : systèmes, AD, analyse des mécanismes et environnements encadrés.
- [TryHackMe](https://tryhackme.com/paths) : Red Team/Purple Team et analyses de systèmes en laboratoire.
- [FLARE-ON](https://flare-on.com/) : compréhension de binaires et de comportements.
- [pwn.college](https://pwn.college/) : exploit development sur cibles pédagogiques.

**Projet final :** bâtir une simulation de gestion d’un agent _consenti_ sur machines virtuelles isolées (enrôlement explicite, permissions minimales, communication authentifiée, journaux exhaustifs, mécanisme de démarrage transparent, arrêt/révocation et désinstallation vérifiable). Comparer le fonctionnement sur deux systèmes, analyser les traces forensiques, mesurer les détections et remettre un rapport professionnel.

**Validation expert :** expliquer les choix d’architecture et les frontières de sécurité ; anticiper des comportements à partir des événements ; détecter les cas limites ; distinguer marqueurs de laboratoire et compromissions réelles ; analyser indépendamment des cas inédits ; prouver la remise en état. Les évaluations théoriques seules ne confèrent pas le niveau expert opérationnel.

# Partie VI — Branche C : investigation cybercriminelle, fraude et forensics

## C-01 — Investigation scientifique et renseignement de sources ouvertes

**Prérequis :** TC-00, TC-03, TC-07.

**Compétences atomiques :**

- **C01.01** Définir question d’enquête et hypothèses concurrentes.
- **C01.02** Distinguer source primaire, secondaire et commentaire.
- **C01.03** Évaluer fiabilité, actualité et authenticité d’une source.
- **C01.04** Comprendre les limites d’une recherche par moteur.
- **C01.05** Utiliser archives publiques et historique de pages de manière critique.
- **C01.06** Analyser métadonnées de documents licitement obtenus.
- **C01.07** Reconnaître les informations falsifiées et sorties de contexte.
- **C01.08** Concevoir une grille de corroboration indépendante.
- **C01.09** Distinguer coïncidence, similarité et relation établie.
- **C01.10** Construire une chronologie avec incertitudes explicites.
- **C01.11** Documenter URL, date, contexte et mode de conservation.
- **C01.12** Évaluer les risques de divulgation de données personnelles.
- **C01.13** Concevoir une méthode de travail à faible exposition.
- **C01.14** Comprendre les limites des inférences d’identité à partir de pseudos.
- **C01.15** Rédiger une conclusion proportionnelle aux preuves.
- **C01.16** Préparer un dossier reproductible par un tiers.

**Visualisations :** Carte provenance-source, chronologie incertaine, score de confiance non magique, comparaison d’indices.

**Exercices internes :** Distinguer preuves et suppositions dans un dossier fictif, identifier les hypothèses alternatives et la meilleure pièce justificative.

**Ressources :** [Bellingcat Toolkit](https://bellingcat.gitbook.io/toolkit) · [Berkeley Protocol](https://www.ohchr.org/en/publications/policy-and-methodological-publications/berkeley-protocol-digital-open-source) · [OSINT Framework](https://osintframework.com/)

**Livres :** _Open Source Intelligence Techniques_ — Michael Bazzell ; _We Are Bellingcat_ — Eliot Higgins

**Laboratoires externes :** [Bellingcat Guides](https://www.bellingcat.com/resources/) · [Trace Labs](https://www.tracelabs.org/) (selon règles)

**Validation :** Enquête fictive avec sources citées, chronologie, hypothèses alternatives et limites.

---

## C-02 — Investigation des fraudes et escroqueries numériques africaines

**Prérequis :** C-01, A-02, A-07.

**Compétences atomiques :**

- **C02.01** Identifier les étapes habituelles d’une fraude à la vente.
- **C02.02** Identifier les étapes d’une arnaque sentimentale.
- **C02.03** Comprendre les mécanismes sociaux de faux recrutement.
- **C02.04** Distinguer phishing, usurpation et fraude au paiement.
- **C02.05** Lire des conversations fournies avec accord et en établir une chronologie.
- **C02.06** Évaluer les liens entre faux profils sans attribuer une identité réelle trop vite.
- **C02.07** Comparer comptes, annonces et sites réutilisant les mêmes artefacts publics.
- **C02.08** Analyser les indices techniques d’un faux site de commerce.
- **C02.09** Distinguer numéro de contact, détenteur du compte et opérateur réel.
- **C02.10** Comprendre les limites des traces de transfert Mobile Money.
- **C02.11** Analyser un reçu et distinguer authentique, suspect et insuffisant.
- **C02.12** Reconstituer les événements de prélèvement et de contact d’une victime.
- **C02.13** Définir les mesures de conservation et de signalement prioritaires.
- **C02.14** Construire des graphes de campagnes sans doxxing.
- **C02.15** Identifier les besoins d’informations supplémentaires à demander aux autorités ou fournisseurs.
- **C02.16** Évaluer les risques pour la victime et les tiers.
- **C02.17** Rédiger une note de signalement technique et compréhensible.
- **C02.18** Distinguer récupération de fonds, signalement et enquête pénale.

**Visualisations :** Graphe de faux profils, chronologie d’une escroquerie, parcours de transaction simulée, tableau de corroboration.

**Exercices internes :** Reconstruire une fraude fictive, choisir les indices réellement probants, rejeter une attribution fallacieuse, préparer un dossier de signalement.

**Ressources :** [Bellingcat Toolkit](https://bellingcat.gitbook.io/toolkit) · [INTERPOL Cybercrime](https://www.interpol.int/en/Crimes/Cybercrime) · [UNODC Cybercrime](https://www.unodc.org/) · [ENISA Threat Landscape](https://www.enisa.europa.eu/topics/cyber-threats/threats-and-trends)

**Livres :** _Digital Evidence and Computer Crime_ — Eoghan Casey ; _The OSINT Handbook_ — Dale Meredith

**Laboratoires externes :** [Bellingcat Resources](https://www.bellingcat.com/resources/) · cas synthétiques créés pour le module

**Validation :** Dossier d’arnaque simulée avec faits, préjudices déclarés, connexions corroborées et actions de transmission.

---

## C-03 — Cyber Threat Intelligence, TTP et renseignement opérationnel

**Prérequis :** C-01, B-01, TC-07.

**Compétences atomiques :**

- **C03.01** Distinguer information brute, indicateur et renseignement exploitable.
- **C03.02** Décrire le cycle de renseignement : direction, collecte, analyse, diffusion.
- **C03.03** Différencier niveaux stratégique, opérationnel et tactique.
- **C03.04** Comprendre le modèle diamant d’analyse d’intrusion.
- **C03.05** Interpréter tactiques et techniques MITRE ATT&CK.
- **C03.06** Distinguer groupes, campagnes, clusters et acteurs individuels.
- **C03.07** Construire des hypothèses d’infrastructure partagée.
- **C03.08** Identifier les limites des indicateurs IP, domaine et hash.
- **C03.09** Comprendre STIX et TAXII conceptuellement.
- **C03.10** Comprendre le rôle d’une plateforme de threat intelligence.
- **C03.11** Évaluer la fraîcheur et la confiance d’un IOC.
- **C03.12** Lire une règle Sigma/YARA dans son contexte.
- **C03.13** Créer des exigences de renseignement prioritaires.
- **C03.14** Analyser des contradictions entre rapports de menaces.
- **C03.15** Distinguer attribution comportementale et attribution juridique.
- **C03.16** Proposer des détections et contre-mesures liées au renseignement.
- **C03.17** Rédiger un bulletin à plusieurs niveaux de détail.

**Visualisations :** Diamond Model manipulable, graphe STIX, cycle de renseignement, historique de confidence.

**Exercices internes :** Comparer deux rapports contradictoires, classifier IOC/TTP, formuler une exigence de collecte manquante.

**Ressources :** [MITRE ATT&CK](https://attack.mitre.org/) · [OpenCTI](https://docs.opencti.io/) · [MISP](https://www.misp-project.org/) · [STIX](https://oasis-open.github.io/cti-documentation/)

**Livres :** _Intelligence-Driven Incident Response_ — Roberts & Brown ; _The Diamond Model of Intrusion Analysis_ — Caltagirone et al.

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/) · [Blue Team Labs Online](https://blueteamlabs.online/)

**Validation :** Bulletin CTI publiable avec fiabilité explicite, IOC contextualisés, TTP et recommandations.

---

## C-04 — Infrastructure OSINT et analyse des relations techniques

**Prérequis :** C-01, TC-03.

**Compétences atomiques :**

- **C04.01** Expliquer domaine, sous-domaine, zone DNS et délégation.
- **C04.02** Interpréter enregistrements DNS et leur variation temporelle.
- **C04.03** Comprendre WHOIS/RDAP et limites de confidentialité.
- **C04.04** Expliquer les relations entre certificats, domaines et services.
- **C04.05** Différencier IP partagée, CDN et serveur d’origine.
- **C04.06** Comprendre ASN et relations d’hébergement.
- **C04.07** Analyser un changement historique de domaine.
- **C04.08** Distinguer faux lien d’infrastructure et lien corroboré.
- **C04.09** Interpréter les métadonnées de pages publiques.
- **C04.10** Reconnaître l’effet des services mutualisés sur l’attribution.
- **C04.11** Construire un graphe d’infrastructure avec dates et confiance.
- **C04.12** Comprendre la différence entre index de recherche et réalité actuelle.
- **C04.13** Identifier les conditions de partage responsable d’indicateurs.
- **C04.14** Évaluer les risques liés à l’analyse active d’un système tiers.
- **C04.15** Préparer une demande structurée de conservation d’éléments par les acteurs habilités.

**Visualisations :** Graphe DNS dans le temps, structure ASN, relation domaine/certificat/CDN.

**Exercices internes :** Critiquer une attribution fondée sur une IP partagée, compléter un graphe historique et classer les indices par robustesse.

**Ressources :** [ICANN Lookup](https://lookup.icann.org/) · [Censys](https://search.censys.io/) · [urlscan.io](https://urlscan.io/) · [VirusTotal](https://www.virustotal.com/)

**Livres :** _Practical Packet Analysis_ — Chris Sanders ; documentation RDAP de l’ICANN

**Laboratoires externes :** [Bellingcat Toolkit](https://bellingcat.gitbook.io/toolkit) · scénarios d’infrastructure synthétique

**Validation :** Graphe horodaté d’une campagne fictive avec sources et contre-hypothèses.

---

## C-05 — Fondements DFIR, systèmes de fichiers et collecte

**Prérequis :** TC-01, TC-02, TC-06, C-01.

**Compétences atomiques :**

- **C05.01** Comprendre acquisition logique et acquisition physique.
- **C05.02** Distinguer original, copie de travail et dérivé.
- **C05.03** Expliquer le rôle d’un hachage cryptographique.
- **C05.04** Comprendre les métadonnées de systèmes de fichiers.
- **C05.05** Identifier timestamps et limites de leur interprétation.
- **C05.06** Comprendre artefacts de fichiers supprimés.
- **C05.07** Distinguer stockage persistant et mémoire volatile.
- **C05.08** Décrire une procédure de collecte documentée.
- **C05.09** Expliquer le rôle des écritures accidentelles sur une preuve.
- **C05.10** Connaître les bases NTFS et ext4.
- **C05.11** Comprendre journaux systèmes et rotation.
- **C05.12** Construire une chronologie d’événements issus de sources multiples.
- **C05.13** Distinguer heure locale, UTC, fuseau et dérive d’horloge.
- **C05.14** Évaluer la provenance d’un artefact et son degré de fiabilité.
- **C05.15** Expliquer le principe de chaîne de conservation.
- **C05.16** Documenter les transformations et outils employés.
- **C05.17** Énoncer ce qu’un artefact ne permet pas de conclure.
- **C05.18** Préparer un rapport forensique vérifiable.

**Visualisations :** Système de fichiers exploratoire, timeline multi-horloges, chaîne de possession, vérification de hash.

**Exercices internes :** Classer des artefacts, identifier une incohérence de temps, comparer l’intégrité de deux copies synthétiques, critiquer un défaut de traçabilité.

**Ressources :** [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) · [Autopsy](https://www.autopsy.com/) · [The Sleuth Kit](https://www.sleuthkit.org/) · [SWGDE](https://www.swgde.org/)

**Livres :** _File System Forensic Analysis_ — Brian Carrier ; _Digital Evidence and Computer Crime_ — Eoghan Casey

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/) · [DFIR Training](https://www.dfir.training/)

**Validation :** Rapport forensique d’une image fictive avec provenance, horodatage et incertitudes.

---

## C-06 — Forensics Windows, navigateur et messagerie

**Prérequis :** C-05, B-02.

**Compétences atomiques :**

- **C06.01** Distinguer événements de connexion et traces d’activité utilisateur.
- **C06.02** Comprendre le registre Windows et les hives principaux.
- **C06.03** Interpréter les artefacts de programmes récemment exécutés.
- **C06.04** Comprendre les journaux Windows Event Logs.
- **C06.05** Analyser les traces de fichiers et téléchargements.
- **C06.06** Expliquer les artefacts de navigation et leurs limites.
- **C06.07** Comprendre cookies, sessions, caches et stockage local.
- **C06.08** Distinguer en-têtes email et contenu du message.
- **C06.09** Lire conceptuellement Received, SPF, DKIM et DMARC.
- **C06.10** Identifier les limites de l’adresse affichée comme identité.
- **C06.11** Reconstituer des événements d’usage à partir de plusieurs artefacts.
- **C06.12** Distinguer présence d’un fichier et son exécution démontrée.
- **C06.13** Identifier une hypothèse d’accès non autorisé à confirmer.
- **C06.14** Construire une chronologie sans effacer les incertitudes.
- **C06.15** Définir des requêtes d’analyse adaptées à une question d’enquête.

**Visualisations :** Registre et fichiers liés, chemin d’un email, timeline navigateur/OS, chaîne de validation d’expéditeur.

**Exercices internes :** Lire un lot de journaux fictifs, reconstituer un usage navigateur, repérer un faux positif de présence de fichier.

**Ressources :** [13Cubed](https://www.13cubed.com/) · [Microsoft Learn](https://learn.microsoft.com/) · [Autopsy](https://www.autopsy.com/)

**Livres :** _Windows Forensic Analysis Toolkit_ — Harlan Carvey ; _Digital Evidence and Computer Crime_ — Eoghan Casey

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/) · [Blue Team Labs Online](https://blueteamlabs.online/)

**Validation :** Chronologie Windows/navigateur/email soutenue par des artefacts et une matrice de confiance.

---

## C-07 — Memory forensics et analyse de processus

**Prérequis :** C-05, B-07.

**Compétences atomiques :**

- **C07.01** Comprendre la mémoire volatile et son évolution.
- **C07.02** Distinguer processus, threads, modules et handles.
- **C07.03** Interpréter conceptuellement une table des processus.
- **C07.04** Comprendre l’empreinte des connexions réseau en mémoire.
- **C07.05** Expliquer les conditions d’une capture mémoire fiable.
- **C07.06** Distinguer un processus suspect d’un processus confirmé malveillant.
- **C07.07** Comprendre les risques des symboles et profils de version.
- **C07.08** Lire les résultats de plugins forensiques.
- **C07.09** Construire des hypothèses à partir d’un arbre de processus.
- **C07.10** Confronter mémoire, disque et journaux.
- **C07.11** Comprendre injection de code comme catégorie de comportement observé.
- **C07.12** Identifier les limites dues à l’absence d’artefacts.
- **C07.13** Comparer hypothèses alternatives et degré de confiance.
- **C07.14** Documenter les contrôles de reproductibilité.

**Visualisations :** Carte mémoire/processus, graphe parent-enfant, synchronisation RAM/disque.

**Exercices internes :** Interpréter un tableau Volatility fictif, réfuter une hypothèse trop rapide et reconstruire une chaîne d’événements.

**Ressources :** [Volatility 3](https://volatility3.readthedocs.io/) · [13Cubed](https://www.13cubed.com/) · [REMnux](https://docs.remnux.org/)

**Livres :** _The Art of Memory Forensics_ — Michael Hale Ligh et al.

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/)

**Validation :** Rapport d’analyse mémoire de scénario pédagogique, corrélation avec artefacts systèmes et incertitudes.

---

## C-08 — Network forensics, SOC et threat hunting

**Prérequis :** TC-03, C-03, C-05.

**Compétences atomiques :**

- **C08.01** Distinguer paquets, flux et journaux applicatifs.
- **C08.02** Comprendre les contraintes de visibilité TLS.
- **C08.03** Interpréter PCAP et fenêtres temporelles.
- **C08.04** Reconnaître les effets de NAT, proxy, VPN et CDN.
- **C08.05** Comprendre la normalisation des événements.
- **C08.06** Distinguer SIEM, EDR, NDR et SOAR.
- **C08.07** Construire une question de chasse aux menaces.
- **C08.08** Comprendre taux de base, faux positifs et faux négatifs.
- **C08.09** Comparer signature, anomalie et corrélation comportementale.
- **C08.10** Interpréter un graphe de flux sortants.
- **C08.11** Analyser les indices de phishing et d’activité de compte.
- **C08.12** Comprendre l’effet des horloges et des pertes de paquets.
- **C08.13** Relier une alerte à une hypothèse vérifiable.
- **C08.14** Définir une stratégie de triage priorisé.
- **C08.15** Comprendre le rôle des règles Sigma.
- **C08.16** Construire une chronologie réseau + hôte.
- **C08.17** Rédiger un rapport de hunting avec résultats négatifs explicites.

**Visualisations :** Flux animés, filtrage d’événements, pipeline SIEM, arbre de triage.

**Exercices internes :** Analyser une chronologie de logs, choisir des requêtes conceptuelles, expliquer un faux positif et la preuve manquante.

**Ressources :** [Zeek](https://docs.zeek.org/) · [Suricata](https://docs.suricata.io/) · [Sigma](https://sigmahq.io/) · [Wireshark](https://www.wireshark.org/docs/)

**Livres :** _Practical Packet Analysis_ — Chris Sanders ; _Applied Network Security Monitoring_ — Chris Sanders

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/) · [Blue Team Labs Online](https://blueteamlabs.online/)

**Validation :** Triage argumenté d’un incident synthétique et proposition de détections mesurables.

---

## C-09 — Mobile forensics, comptes et surveillance abusive

**Prérequis :** A-03, A-04, C-05.

**Compétences atomiques :**

- **C09.01** Comprendre différences acquisition Android/iOS et restrictions d’accès.
- **C09.02** Distinguer sauvegarde, extraction logique et système de fichiers.
- **C09.03** Identifier les artefacts de comptes et sessions sur son propre appareil.
- **C09.04** Comprendre appareils liés, authentification et révocation de sessions.
- **C09.05** Expliquer les mécanismes de partage de localisation.
- **C09.06** Comprendre autorisations applicatives et services d’accessibilité.
- **C09.07** Identifier les catégories de stalkerware et leurs traces possibles.
- **C09.08** Distinguer anomalie observable et preuve de surveillance.
- **C09.09** Évaluer l’impact des synchronisations et sauvegardes partagées.
- **C09.10** Comprendre la dangerosité d’une remédiation qui alerte un partenaire violent.
- **C09.11** Définir un plan de sécurité avec la personne concernée.
- **C09.12** Préserver les artefacts avant de modifier les comptes lorsque cela est sûr.
- **C09.13** Lire les limites et avertissements de MVT.
- **C09.14** Documenter des indices sans attribuer automatiquement un auteur.
- **C09.15** Préparer l’orientation vers des professionnels de protection compétents.
- **C09.16** Rédiger un rapport compréhensible par la victime et son conseil.

**Visualisations :** Graphe des appareils liés, permissions et capteurs, parcours de synchronisation, chronologie d’accès.

**Exercices internes :** Analyser un scénario de téléphone surveillé fictif, choisir les actions qui ne mettent pas en danger, distinguer indicateurs et conclusions.

**Ressources :** [Amnesty MVT](https://docs.mvt.re/en/latest/) · [Apple Personal Safety](https://support.apple.com/guide/personal-safety/welcome/web) · [Coalition Against Stalkerware](https://stopstalkerware.org/) · [Tech Safety Canada](https://techsafety.ca/)

**Livres :** _Practical Mobile Forensics_ — Satish Bommisetty et al. ; _Digital Evidence and Computer Crime_ — Eoghan Casey

**Laboratoires externes :** [OWASP MASTG Apps](https://mas.owasp.org/MASTG/apps/) · appareils personnels ou consentis de laboratoire

**Validation :** Compte rendu de diagnostic consenti et de protection numérique sans intrusion dans des données de tiers.

---

## C-10 — Attribution, graphes et analyse critique des réseaux de fraude

**Prérequis :** C-02, C-03, C-04, C-05.

**Compétences atomiques :**

- **C10.01** Distinguer attribution à un artefact, à une infrastructure, à une campagne et à un individu.
- **C10.02** Construire un graphe de relations avec provenances.
- **C10.03** Comprendre biais de confirmation et effet de clustering.
- **C10.04** Évaluer le poids d’indices indépendants et dépendants.
- **C10.05** Comprendre le problème des IP mutualisées et VPN.
- **C10.06** Distinguer propriétaire d’un compte et personne qui l’utilise.
- **C10.07** Comprendre les risques de fausse identité et de tiers innocents.
- **C10.08** Analyser l’effet de données manquantes sur un graphe.
- **C10.09** Construire une chronologie liée au graphe.
- **C10.10** Définir des hypothèses alternatives et tenter de les réfuter.
- **C10.11** Identifier les relations encore à confirmer.
- **C10.12** Formuler les informations nécessaires à une demande officielle.
- **C10.13** Distinguer résultat investigatif et conclusion judiciaire.
- **C10.14** Documenter les limites de chaque inférence.
- **C10.15** Produire une note d’attribution graduée sans accusation catégorique.

**Visualisations :** Graphes probabilistes illustratifs, chronologie croisée, matrices de preuves indépendantes.

**Exercices internes :** Corriger un graphe faux, identifier une relation déduite abusivement, argumenter deux scénarios concurrents.

**Ressources :** [Bellingcat](https://www.bellingcat.com/resources/) · [OpenCTI](https://docs.opencti.io/) · [Berkeley Protocol](https://www.ohchr.org/en/publications/policy-and-methodological-publications/berkeley-protocol-digital-open-source)

**Livres :** _We Are Bellingcat_ — Eliot Higgins ; _Intelligence-Driven Incident Response_ — Roberts & Brown

**Laboratoires externes :** Cas synthétiques de corrélation ; [Bellingcat Toolkit](https://bellingcat.gitbook.io/toolkit)

**Validation :** Dossier d’attribution prudent avec indicateurs, niveaux de confiance et hypothèses alternatives.

---

## C-11 — Chaîne de conservation, rapport d’expertise et coopération

**Prérequis :** C-05, C-10.

**Compétences atomiques :**

- **C11.01** Identifier les objets probatoires et les finalités de leur collecte.
- **C11.02** Distinguer conservation, analyse et diffusion.
- **C11.03** Expliquer authentification, intégrité et provenance.
- **C11.04** Créer une matrice de possession et de transfert.
- **C11.05** Comprendre journal des manipulations et versions de preuves.
- **C11.06** Distinguer note de terrain, hypothèse, constat et conclusion.
- **C11.07** Expliquer les limites des captures d’écran comme preuves uniques.
- **C11.08** Identifier risques de modification de métadonnées.
- **C11.09** Évaluer les chaînes d’acquisition et de traitement.
- **C11.10** Comprendre les contraintes de confidentialité et minimisation.
- **C11.11** Distinguer qualification technique et qualification juridique.
- **C11.12** Organiser un dossier paginé et indexé.
- **C11.13** Préparer un glossaire pour un lecteur non technique.
- **C11.14** Présenter les conclusions avec niveaux de confiance.
- **C11.15** Formuler des demandes de conservation aux fournisseurs via voies habilitées.
- **C11.16** Comprendre coopération transfrontalière à haut niveau.
- **C11.17** Définir le traitement des données des victimes et témoins.
- **C11.18** Préparer une restitution contradictoire, falsifiable et traçable.

**Visualisations :** Chaîne de conservation, ligne temporelle de versions, arbre preuves-conclusions, rapports comparés.

**Exercices internes :** Auditer une chaîne de preuve fictive, corriger les erreurs de documentation, préparer une synthèse destinée aux autorités.

**Ressources :** [SWGDE](https://www.swgde.org/) · [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) · [Berkeley Protocol](https://www.ohchr.org/en/publications/policy-and-methodological-publications/berkeley-protocol-digital-open-source)

**Livres :** _Digital Evidence and Computer Crime_ — Eoghan Casey ; _File System Forensic Analysis_ — Brian Carrier

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/) (rédaction d’un rapport sur cas pédagogique)

**Validation :** Dossier complet conservant l’intégrité, la provenance, la chronologie et une restitution prudente.

---

## C-12 — Protection des personnes, intervention et sécurité opérationnelle

**Prérequis :** C-01, C-09, C-11.

**Compétences atomiques :**

- **C12.01** Distinguer fraude, coercition, harcèlement et compromission technique.
- **C12.02** Comprendre le principe de consentement libre et éclairé.
- **C12.03** Identifier les risques de représailles liés aux modifications d’un appareil.
- **C12.04** Évaluer la sécurité de la personne avant toute action technique.
- **C12.05** Construire un canal de communication sûr selon le contexte.
- **C12.06** Comprendre OPSEC des enquêteurs et des victimes.
- **C12.07** Définir la minimisation des données des tiers.
- **C12.08** Reconnaître le risque de biais dans les conflits privés.
- **C12.09** Distinguer preuve licite et accès clandestin à un compte.
- **C12.10** Comprendre les limites d’un diagnostic de stalkerware.
- **C12.11** Évaluer les conséquences d’une révocation de session.
- **C12.12** Préparer une stratégie de protection des sauvegardes.
- **C12.13** Documenter les actions sans exposer les informations intimes.
- **C12.14** Savoir décider de ne pas intervenir techniquement.
- **C12.15** Prévoir orientation vers autorités et associations compétentes.
- **C12.16** Rédiger un plan d’intervention sûr et proportionné.

**Visualisations :** Arbre de décision sécurité personnelle, diagramme appareils liés, modèle risque/bénéfice.

**Exercices internes :** Choisir une intervention parmi des options risquées, expliquer l’absence de preuve d’auteur, construire un plan de protection fictif.

**Ressources :** [Tech Safety Canada](https://techsafety.ca/) · [Coalition Against Stalkerware](https://stopstalkerware.org/) · [Apple Personal Safety](https://support.apple.com/guide/personal-safety/welcome/web)

**Livres :** _Digital Evidence and Computer Crime_ — Eoghan Casey ; guides publics des organismes de protection

**Laboratoires externes :** Scénarios fictifs encadrés et analyse d’appareils personnels consentis

**Validation :** Plan de protection et de preuves respectant la sécurité de la personne et la confidentialité.

---

# Partie VII — Branche D : pratique professionnelle et exploitation de l’agence

## D-01 — Gestion commerciale, contrats et cadrage d’audit

**Prérequis :** TC-07, B-04, A-01.

**Compétences atomiques :**

- **D01.01** Distinguer services de pentest, audit de code, QA, forensic et conseil.
- **D01.02** Définir les livrables, exclusions et hypothèses d’un service.
- **D01.03** Rédiger un périmètre contractuel techniquement testable.
- **D01.04** Définir règles d’engagement et contacts d’urgence.
- **D01.05** Comprendre NDA, confidentialité et traitement des données.
- **D01.06** Évaluer les risques spécifiques aux systèmes de production.
- **D01.07** Construire une grille de complexité de mission.
- **D01.08** Estimer effort, incertitudes et dépendances sans garanties abusives.
- **D01.09** Construire une proposition commerciale orientée impact métier.
- **D01.10** Préparer une lettre de mission et un calendrier de restitution.
- **D01.11** Définir les responsabilités de correction et de re-test.
- **D01.12** Distinguer constat de sécurité et garantie de sécurité.
- **D01.13** Organiser la protection des preuves et des données clients.
- **D01.14** Comprendre gouvernance qualité et revue entre pairs.
- **D01.15** Définir une politique de conflits d’intérêts.
- **D01.16** Construire un portfolio anonymisé et autorisé.

**Visualisations :** Flux de mission client, matrice de responsabilité, grille de périmètre.

**Exercices internes :** Critiquer un contrat incomplet, rédiger une proposition pour fintech fictive, établir règles d’engagement.

**Ressources :** [PTES](http://www.pentest-standard.org/) · [NIST NICE](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center) · [CREST](https://www.crest-approved.org/)

**Livres :** _The Consulting Bible_ — Alan Weiss ; _Threat Modeling_ — Adam Shostack

**Laboratoires externes :** Projets simulés avec soutenance et revue par pairs

**Validation :** Proposition commerciale, dossier de cadrage et rapport modèle approuvables par un client fictif.

---

## D-02 — Rédaction, communication et évaluation d’impact

**Prérequis :** TC-00, B-04, C-11.

**Compétences atomiques :**

- **D02.01** Distinguer résumé exécutif, preuve technique et annexe.
- **D02.02** Rédiger une vulnérabilité avec préconditions et portée.
- **D02.03** Décrire une PoC non destructive sans ambiguïté.
- **D02.04** Attribuer une sévérité avec justification contextuelle.
- **D02.05** Comprendre limites d’un score CVSS.
- **D02.06** Exprimer clairement risque technique et risque métier.
- **D02.07** Prioriser les recommandations par réduction de risque.
- **D02.08** Différencier correctif provisoire et durable.
- **D02.09** Relier une correction à un test de régression.
- **D02.10** Éviter formulations catégoriques non justifiées.
- **D02.11** Préparer une démonstration claire au client.
- **D02.12** Répondre aux objections sans surinterpréter les données.
- **D02.13** Construire une synthèse d’enquête compatible avec confidentialité.
- **D02.14** Structurer une chronologie et des pièces jointes.
- **D02.15** Préparer revue interne des erreurs et ambiguïtés.
- **D02.16** Assurer accessibilité du rapport pour lecteurs variés.

**Visualisations :** Avant/après remédiation, chaîne cause-risque-preuve, CVSS contextualisé.

**Exercices internes :** Réécrire un rapport trompeur, estimer une sévérité en contexte, produire un résumé de décision.

**Ressources :** [FIRST CVSS](https://www.first.org/cvss/) · [OWASP ASVS](https://asvs.owasp.org/) · [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final)

**Livres :** _The Pyramid Principle_ — Barbara Minto ; _On Writing Well_ — William Zinsser

**Laboratoires externes :** Revue de rapports issus de laboratoires externes autorisés

**Validation :** Rapport complet compréhensible par décideur, développeur et analyste sécurité.

---

## D-03 — IA appliquée aux audits et aux enquêtes : copilote sous contrôle

**Prérequis :** TC-05, A-05, C-01.

**Compétences atomiques :**

- **D03.01** Définir le rôle de l’IA dans une mission technique.
- **D03.02** Structurer une demande et un contrat de résultat.
- **D03.03** Définir entrées, contraintes, tests et limites du code généré.
- **D03.04** Reconnaître les erreurs plausibles d’un modèle.
- **D03.05** Distinguer citation générée et source vérifiée.
- **D03.06** Comprendre la confidentialité des prompts et logs.
- **D03.07** Définir les données à anonymiser ou exclure.
- **D03.08** Critiquer une architecture générée par IA.
- **D03.09** Concevoir une revue de code critique sans écrire manuellement tout le code.
- **D03.10** Interpréter les résultats et corriger les hypothèses.
- **D03.11** Concevoir des tests de sécurité contre les sorties erronées.
- **D03.12** Comparer deux implémentations et argumenter le choix.
- **D03.13** Comprendre non-déterminisme et vérifications répétées.
- **D03.14** Identifier les limites des assistants d’investigation automatique.
- **D03.15** Documenter les décisions humaines et les interventions de l’IA.
- **D03.16** Définir les actions sensibles qui nécessitent approbation humaine.
- **D03.17** Mettre à jour modèles et outils sans perdre la reproductibilité.

**Visualisations :** Chaîne prompt-plan-code-tests, comparaison de résultats, modèle de supervision.

**Exercices internes :** Diagnostiquer des sorties d’IA fictives erronées, rédiger un plan de réalisation et une batterie de tests, justifier le rejet d’un résultat.

**Ressources :** [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) · [OWASP GenAI](https://genai.owasp.org/) · [Hugging Face Learn](https://huggingface.co/learn)

**Livres :** _AI Engineering_ — Chip Huyen ; _Designing Machine Learning Systems_ — Chip Huyen

**Laboratoires externes :** Projets autorisés sur code synthétique ; évaluations IA dans des environnements de test

**Validation :** Dossier de solution produite avec IA et contrôlée par humain : plan, tests, risques, décisions et traçabilité.

---

## D-04 — Gouvernance, protection des données et qualité opérationnelle

**Prérequis :** D-01, D-02, C-11.

**Compétences atomiques :**

- **D04.01** Définir rôles, habilitations et séparation des responsabilités.
- **D04.02** Comprendre classifications et durées de conservation des données.
- **D04.03** Définir accès minimal aux preuves et rapports.
- **D04.04** Comprendre auditabilité des accès et journaux.
- **D04.05** Évaluer le risque des prestataires et services cloud.
- **D04.06** Définir processus de réponse aux incidents internes.
- **D04.07** Comprendre sauvegarde, restauration et gestion des clés.
- **D04.08** Identifier les obligations de sécurité et de protection des données selon pays.
- **D04.09** Distinguer certification d’organisation et qualification individuelle.
- **D04.10** Comprendre management ISO/IEC 27001 à haut niveau.
- **D04.11** Comprendre qualité ISO 9001 à haut niveau.
- **D04.12** Définir contrôle qualité des rapports et des PoC.
- **D04.13** Planifier tests de non-régression des méthodes.
- **D04.14** Gérer versions des modèles de rapport et checklists.
- **D04.15** Prévoir processus de traitement des réclamations.
- **D04.16** Définir indicateurs utiles de qualité sans métriques superficielles.

**Visualisations :** Matrice de responsabilités, cycle de données, processus de revue et incident interne.

**Exercices internes :** Auditer un processus fictif de traitement de preuves, proposer des améliorations et évaluer la conservation.

**Ressources :** [ISO 27001 overview](https://www.iso.org/standard/27001) · [NIST CSF](https://www.nist.gov/cyberframework) · [OWASP SAMM](https://owaspsamm.org/)

**Livres :** _Security Engineering_ — Ross Anderson ; _Threat Modeling_ — Adam Shostack

**Laboratoires externes :** Exercices de gouvernance sur agence fictive

**Validation :** Politique de traitement de preuves et processus qualité opérationnel révisés.

---

# Partie VIII — Intégration : examens de maîtrise de zéro à expert

Les examens suivants sont **transversaux**. Ils mobilisent plusieurs modules sans réenseigner les connaissances fondamentales. Une réussite théorique ne remplace pas les preuves pratiques externes.

## EX-01 — Fondations techniques

**Prérequis :** TC-00 à TC-07.

- **EX01.01** Reconstruire le parcours d’une requête HTTPS, du navigateur au serveur.
- **EX01.02** Expliquer les rôles du système, de la mémoire, du réseau et du backend.
- **EX01.03** Prévoir les changements de comportement après modification de trois paramètres.
- **EX01.04** Détecter cinq erreurs conceptuelles dans une architecture fictive.
- **EX01.05** Formuler une spécification de programme destinée à une IA.
- **EX01.06** Examiner une proposition de code généré et concevoir des tests sans le recopier.
- **EX01.07** Justifier les frontières de confiance et les contrôles prioritaires.

**Épreuve :** dossier d’architecture annoté, cas inédit, soutenance sans IA.

## EX-02 — Pentest Web et API de niveau professionnel

**Prérequis :** A-01, A-02, A-05, B-04, D-02.

- **EX02.01** Cartographier les fonctions, rôles et données d’une SaaS fictive.
- **EX02.02** Sélectionner les tests adaptés aux hypothèses et aux règles d’engagement.
- **EX02.03** Analyser les indices de vulnérabilité contenus dans des traces synthétiques.
- **EX02.04** Relier plusieurs défauts à une conséquence métier plausible.
- **EX02.05** Distinguer conséquences prouvées, possibles et non évaluées.
- **EX02.06** Définir une PoC sûre avec jeux de données autorisés.
- **EX02.07** Prioriser remédiations et plans de re-test.
- **EX02.08** Produire un rapport exécutable par une équipe technique.

**Laboratoires externes :** [PortSwigger](https://portswigger.net/web-security), [HTB](https://www.hackthebox.com/), [PentesterLab](https://pentesterlab.com/).

## EX-03 — Sécurité mobile complète

**Prérequis :** A-02, A-03, A-04, A-07.

- **EX03.01** Comparer les modèles de sécurité Android et iOS.
- **EX03.02** Évaluer le stockage local, les sessions, les permissions et les API.
- **EX03.03** Analyser une logique de paiement simulée.
- **EX03.04** Concevoir une matrice de tests multi-appareils.
- **EX03.05** Lire un rapport MobSF et rejeter les faux positifs.
- **EX03.06** Proposer des corrections et tests de non-régression.
- **EX03.07** Rédiger un rapport mobile unique distinguant client et backend.

**Laboratoires externes :** [OWASP MASTG Apps](https://mas.owasp.org/MASTG/apps/), [MobSF](https://mobsf.github.io/Mobile-Security-Framework-MobSF/).

## EX-04 — Opérations offensives avancées et recherche

**Prérequis :** B-01 à B-10.

- **EX04.01** Définir une mission de simulation et ses limites techniques.
- **EX04.02** Construire un graphe des relations de privilèges et chemins de risque.
- **EX04.03** Expliquer une chaîne de vulnérabilités sans surestimer l’impact.
- **EX04.04** Justifier la profondeur de la preuve et ses conditions d’arrêt.
- **EX04.05** Interpréter des événements de post-exploitation simulée.
- **EX04.06** Décrire les traces observables côté défense.
- **EX04.07** Analyser un programme pédagogique et produire ses hypothèses de comportement.
- **EX04.08** Critiquer un crash et proposer une campagne de vérification.
- **EX04.09** Définir restauration, re-test et restitution de l’exercice.

**Laboratoires externes :** [HTB Academy](https://academy.hackthebox.com/), [TryHackMe](https://tryhackme.com/), [pwn.college](https://pwn.college/).

## EX-05 — Audit d’IA et d’agents autonomes

**Prérequis :** A-08, A-09, D-03.

- **EX05.01** Décrire intégralement un pipeline LLM/RAG/outils.
- **EX05.02** Identifier les frontières entre instruction, donnée et action.
- **EX05.03** Concevoir des tests de permissions et d’isolation des clients.
- **EX05.04** Interpréter des traces d’agent et leur niveau de fiabilité.
- **EX05.05** Évaluer mesures d’atténuation et faux sentiment de sécurité.
- **EX05.06** Définir jeux de tests et critères de robustesse.
- **EX05.07** Produire un rapport IA avec limites et recommandations.

**Laboratoires externes :** [PortSwigger LLM](https://portswigger.net/web-security/llm-attacks), [OWASP GenAI](https://genai.owasp.org/).

## EX-06 — Investigation d’une campagne de fraude fictive

**Prérequis :** C-01 à C-04, C-10, C-11.

- **EX06.01** Reconstituer le récit à partir des pièces initiales.
- **EX06.02** Séparer faits, rumeurs et hypothèses.
- **EX06.03** Construire un graphe temporel sourcé de comptes et infrastructures.
- **EX06.04** Réfuter au moins une hypothèse trompeuse.
- **EX06.05** Distinguer comptes, campagne et individus.
- **EX06.06** Identifier les informations officielles manquantes.
- **EX06.07** Proposer une stratégie de conservation et signalement.
- **EX06.08** Produire un dossier à destination des autorités compétentes.

## EX-07 — Enquête forensique complète

**Prérequis :** C-05 à C-09, C-11.

- **EX07.01** Décrire un plan d’acquisition documenté.
- **EX07.02** Interpréter artefacts disque, journaux, navigateur et mémoire.
- **EX07.03** Réconcilier les horodatages et exposer l’incertitude.
- **EX07.04** Vérifier l’intégrité et la traçabilité des copies.
- **EX07.05** Évaluer les hypothèses alternatives d’incident.
- **EX07.06** Produire un rapport factuel avec annexes et provenance.

**Laboratoires externes :** [CyberDefenders](https://cyberdefenders.org/), [DFIR Training](https://www.dfir.training/).

## EX-08 — Protection d’une personne contre la surveillance abusive

**Prérequis :** C-09, C-11, C-12.

- **EX08.01** Évaluer la situation et le risque de représailles.
- **EX08.02** Choisir un protocole de diagnostic consenti.
- **EX08.03** Interpréter des signaux d’appareils liés et de surveillance potentielle.
- **EX08.04** Distinguer preuve technique, soupçon et attribution d’auteur.
- **EX08.05** Construire un plan de sécurité sans alerter inutilement l’auteur possible.
- **EX08.06** Organiser la conservation des preuves et les orientations utiles.

## EX-09 — Examen intégrateur « agence »

**Prérequis :** tous les modules A, B, C, D, EX-01 à EX-08.

- **EX09.01** Recevoir une demande d’audit d’une fintech fictive et établir contrat/périmètre.
- **EX09.02** Réaliser une revue de conception Web/mobile/API/transaction.
- **EX09.03** Conduire une analyse de risque et définir les tests prioritaires.
- **EX09.04** Interpréter les résultats d’audit et les transformer en conclusions vérifiables.
- **EX09.05** Définir une démonstration contrôlée d’impact métier.
- **EX09.06** Confronter un rapport de sécurité à une analyse QA/performance.
- **EX09.07** Examiner les risques d’un assistant IA intégré.
- **EX09.08** Produire rapports technique, exécutif et plan de re-test.
- **EX09.09** En parallèle, conduire une investigation fictive sur une fraude liée à la plateforme.
- **EX09.10** Présenter une chronologie, le graphe de preuves et les limites d’attribution.
- **EX09.11** Défendre ses décisions lors d’une revue contradictoire.
- **EX09.12** Documenter les compétences encore insuffisantes pour une mission réelle autonome.

**Critère final :** aucun statut « expert » n’est octroyé sur la seule réussite aux exercices internes. Il requiert les examens conceptuels, les laboratoires externes, des projets complets, une revue indépendante et une capacité répétée à gérer des cas inédits.

---

# Partie IX — Index de progression et vérification de couverture

**Ordre obligatoire du socle :** TC-00 → TC-01 → TC-02 → TC-03 → TC-04 → TC-05 → TC-06 → TC-07. Certains modules peuvent être appris en parallèle après maîtrise des prérequis.

**Séquence de vente d’audit :** A-01 → A-02 → B-04 → A-03/A-04 → A-05 → A-06 → A-07 → D-01 → D-02.

**Séquence offensive avancée :** B-01 → B-02/B-03 → B-04 → B-05 → B-06 ; TC-01/TC-05 → B-07 → B-08/B-09 → B-10 → B-11.

**Séquence IA :** TC-04/TC-05 → A-08 → A-09 → D-03.

**Séquence enquête :** C-01 → C-02/C-04 → C-03 → C-05 → C-06/C-07/C-08/C-09 → C-10 → C-11 → C-12.

**Séquence organisation :** D-01 → D-02 → D-03 → D-04.

## Grille de validation exigée pour chaque compétence atomique

1. **Restitution :** expliquer le concept, ses conditions et ses limites sans aide.
2. **Visualisation :** annoter, manipuler ou reconstruire correctement un modèle de fonctionnement.
3. **Prédiction :** prédire un effet causé par une modification d’état.
4. **Critique :** identifier une erreur plausible ou un contre-exemple.
5. **Transfert :** réussir un exercice inédit en combinant des concepts.
6. **IA sous contrôle :** quand une implémentation est nécessaire, rédiger le plan, décrire les tests, interpréter les résultats et rejeter les sorties incorrectes.
7. **Validation différée :** retrouver la compréhension après une période sans réexposition intensive.
8. **Validation pratique externe :** lorsque le module implique une expertise opérationnelle, produire un compte rendu autorisé depuis un laboratoire spécialisé.
