# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: program-memory.spec.ts >> Program Memory Fundamentals interactive course >> navigates from home, exercises all 5 simulators, checks reduced-motion and assessments
- Location: tests\e2e\program-memory.spec.ts:4:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Aller au contenu principal" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Cyber School, accueil" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e9]: cyberschool.
      - navigation "Navigation principale" [ref=e10]:
        - link "Les cours" [ref=e11] [cursor=pointer]:
          - /url: /#courses
        - link "Cursus V4" [ref=e12] [cursor=pointer]:
          - /url: /curriculum
  - main [ref=e13]:
    - generic [ref=e14]:
      - navigation "Fil d’Ariane" [ref=e15]:
        - link "Tous les cours" [ref=e16] [cursor=pointer]:
          - /url: /#courses
        - generic [aria-hidden] [ref=e19]: /
        - generic [ref=e20]: Systèmes
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: Depuis les bases
          - generic [ref=e25]: 270 min à votre rythme
          - generic [ref=e29]: Version en revue
        - heading "Dans la mémoire d’un programme" [level=1] [ref=e30]
        - paragraph [ref=e31]: Où va une variable ? Que reste-t-il après un appel de fonction ? Suivez les données dans la machine, de la première instruction à la gestion de leur durée de vie.
      - group [ref=e32]:
        - 'generic "Avant de commencer : ce qu’il faut savoir" [ref=e33] [cursor=pointer]'
      - generic [ref=e34]:
        - complementary "Sommaire du cours" [ref=e35]:
          - heading "Votre parcours" [level=2] [ref=e37]
          - navigation "Chapitres" [ref=e38]:
            - button "01 Comment la machine lit un nombre 35 min · 3 exercices" [ref=e39] [cursor=pointer]:
              - generic [ref=e40]: "01"
              - generic [ref=e41]:
                - text: Comment la machine lit un nombre
                - generic [ref=e42]: 35 min · 3 exercices
            - button "02 Pourquoi chaque programme a son espace 40 min · 3 exercices" [ref=e43] [cursor=pointer]:
              - generic [ref=e44]: "02"
              - generic [ref=e45]:
                - text: Pourquoi chaque programme a son espace
                - generic [ref=e46]: 40 min · 3 exercices
            - button "03 Suivre un appel de fonction 50 min · 3 exercices" [ref=e47] [cursor=pointer]:
              - generic [ref=e48]: "03"
              - generic [ref=e49]:
                - text: Suivre un appel de fonction
                - generic [ref=e50]: 50 min · 3 exercices
            - button "04 Une adresse n’est pas une garantie 40 min · 2 exercices" [ref=e51] [cursor=pointer]:
              - generic [ref=e52]: "04"
              - generic [ref=e53]:
                - text: Une adresse n’est pas une garantie
                - generic [ref=e54]: 40 min · 2 exercices
            - button "05 Réserver et libérer de la mémoire 50 min · 2 exercices" [ref=e55] [cursor=pointer]:
              - generic [ref=e56]: "05"
              - generic [ref=e57]:
                - text: Réserver et libérer de la mémoire
                - generic [ref=e58]: 50 min · 2 exercices
            - button "06 Qui décide de la durée de vie ? 55 min · 3 exercices" [ref=e59] [cursor=pointer]:
              - generic [ref=e60]: "06"
              - generic [ref=e61]:
                - text: Qui décide de la durée de vie ?
                - generic [ref=e62]: 55 min · 3 exercices
          - button "Revenir au parcours guidé" [active] [pressed] [ref=e64] [cursor=pointer]
          - generic [ref=e65]:
            - generic [ref=e66]: 0 / 16 exercices validés
            - generic [ref=e67]: Réponses vérifiées pendant cette session.
        - generic [ref=e68]:
          - generic [ref=e69]:
            - region "Comment la machine lit un nombre" [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Chapitre 1 sur 6 · 35 min environ
                - heading "Comment la machine lit un nombre" [level=2] [ref=e73]
                - paragraph [ref=e74]: Quand vous écrivez 42, que contient réellement la mémoire ?
              - generic [ref=e75]:
                - heading "L’idée en clair" [level=3] [ref=e76]
                - paragraph [ref=e77]: Imaginez une longue rangée de cases numérotées. Chaque case contient un octet, soit huit bits. Son numéro est son adresse ; son contenu est sa valeur. Le processeur est la partie de la machine qui suit les instructions pour lire, calculer et écrire dans ces cases.
              - generic [ref=e78]:
                - heading "Un exemple, pas à pas" [level=3] [ref=e79]
                - paragraph [ref=e80]: "Prenons 0x12345678. Le préfixe 0x indique une écriture en base 16 : chaque paire de chiffres représente un octet. Ce nombre occupe quatre cases. Sur x86-64, l’octet de poids faible vient à l’adresse la plus basse : 78 à 0x1008, puis 56, 34 et 12. La valeur du nombre reste la même ; seul l’ordre de rangement change."
              - generic [ref=e81]: À vous d’expérimenter
              - paragraph [ref=e84]: Avancez avec « Suivant » jusqu’à l’écriture. Repérez les quatre cases à partir de 0x1008. Avant le dernier pas, prédisez l’octet qui va apparaître dans la première case.
              - generic "Simulateur VIS-01 CPU Fetch-Decode-Execute et RAM Little-Endian" [ref=e86]:
                - generic [ref=e87]:
                  - generic [ref=e88]:
                    - heading "VIS-01 · Cycle Fetch-Decode-Execute & octets en RAM" [level=3] [ref=e93]
                    - generic [ref=e94]: "Phase : IDLE"
                  - paragraph [ref=e95]:
                    - text: Observez le compteur d'instruction
                    - code [ref=e96]: RIP
                    - text: ", les bus et le stockage octet par octet en représentation"
                    - strong [ref=e97]: little-endian
                    - text: (x86-64).
                  - tablist "Programmes VIS-01" [ref=e98]:
                    - tab "Chargement & Addition" [ref=e99] [cursor=pointer]
                    - tab "Branchement conditionnel (JZ)" [ref=e100] [cursor=pointer]
                    - tab "Écriture Little-Endian int32" [selected] [ref=e101] [cursor=pointer]
                  - generic [ref=e102]:
                    - generic [ref=e103]:
                      - generic [ref=e104]: "Valeur 32 bits :"
                      - button "0x12345678" [ref=e105] [cursor=pointer]
                      - button "0x00000042" [ref=e106] [cursor=pointer]
                      - button "0xAABBCCDD" [ref=e107] [cursor=pointer]
                    - generic [ref=e108]:
                      - button "Vue int32 groupée" [pressed] [ref=e109] [cursor=pointer]
                      - button "Vitesse 1x" [ref=e110] [cursor=pointer]
                - generic [ref=e111]:
                  - generic [ref=e112]:
                    - generic [ref=e113]:
                      - generic [ref=e114]:
                        - generic [ref=e115]: Processeur (CPU)
                        - generic [ref=e116]: ZF=0
                      - generic [ref=e117]:
                        - generic [ref=e118]:
                          - generic [ref=e119]: RIP (Instruction Ptr)
                          - generic [ref=e120]: "0x0040"
                        - generic [ref=e121]:
                          - generic [ref=e122]: IR (Décodage)
                          - generic [ref=e123]: —
                        - generic [ref=e124]:
                          - generic [ref=e125]: RAX / EAX
                          - generic [ref=e126]: "0x00000000"
                        - generic [ref=e127]:
                          - generic [ref=e128]: RBX / EBX
                          - generic [ref=e129]: "0x00000000"
                      - generic [ref=e130]:
                        - generic [ref=e131]: Instructions (Zone Code 0x0040..)
                        - list [ref=e132]:
                          - listitem [ref=e133]:
                            - generic [ref=e134]: "0x0040"
                            - generic [ref=e135]: MOV DWORD PTR [0x1008], val
                          - listitem [ref=e136]:
                            - generic [ref=e137]: "0x0044"
                            - generic [ref=e138]: MOV EBX, [0x1008]
                          - listitem [ref=e139]:
                            - generic [ref=e140]: "0x0048"
                            - generic [ref=e141]: HLT
                    - generic [ref=e142]:
                      - generic [ref=e143]: Bus système
                      - 'img "Bus mémoire : idle" [ref=e144]'
                      - generic [ref=e146]: Bus inactif
                    - generic [ref=e147]:
                      - generic [ref=e148]:
                        - generic [ref=e149]: Mémoire Données (1 case = 1 octet)
                        - generic [ref=e150]: int32 @0x1008 = 0x00000010 [10 00 00 00]
                      - generic [ref=e151]:
                        - generic [ref=e152]:
                          - generic [ref=e153]: "0x1000"
                          - generic [ref=e154]: "00"
                        - generic [ref=e155]:
                          - generic [ref=e156]: "0x1001"
                          - generic [ref=e157]: "00"
                        - generic [ref=e158]:
                          - generic [ref=e159]: "0x1002"
                          - generic [ref=e160]: "00"
                        - generic [ref=e161]:
                          - generic [ref=e162]: "0x1003"
                          - generic [ref=e163]: "00"
                        - generic [ref=e164]:
                          - generic [ref=e165]: "0x1004"
                          - generic [ref=e166]: 0A
                        - generic [ref=e167]:
                          - generic [ref=e168]: "0x1005"
                          - generic [ref=e169]: "00"
                        - generic [ref=e170]:
                          - generic [ref=e171]: "0x1006"
                          - generic [ref=e172]: "00"
                        - generic [ref=e173]:
                          - generic [ref=e174]: "0x1007"
                          - generic [ref=e175]: "00"
                        - generic [ref=e176]:
                          - generic [ref=e177]: "0x1008"
                          - generic [ref=e178]: "10"
                        - generic [ref=e179]:
                          - generic [ref=e180]: "0x1009"
                          - generic [ref=e181]: "00"
                        - generic [ref=e182]:
                          - generic [ref=e183]: "0x100A"
                          - generic [ref=e184]: "00"
                        - generic [ref=e185]:
                          - generic [ref=e186]: "0x100B"
                          - generic [ref=e187]: "00"
                        - generic [ref=e188]:
                          - generic [ref=e189]: "0x100C"
                          - generic [ref=e190]: "00"
                        - generic [ref=e191]:
                          - generic [ref=e192]: "0x100D"
                          - generic [ref=e193]: "00"
                        - generic [ref=e194]:
                          - generic [ref=e195]: "0x100E"
                          - generic [ref=e196]: "00"
                        - generic [ref=e197]:
                          - generic [ref=e198]: "0x100F"
                          - generic [ref=e199]: "00"
                  - generic [ref=e200]:
                    - generic [ref=e201]:
                      - button "Précédent" [disabled]
                      - button "Lecture auto" [ref=e202] [cursor=pointer]
                      - button "Phase suivante" [ref=e205] [cursor=pointer]
                      - button "Réinitialiser" [ref=e208] [cursor=pointer]
                    - generic [ref=e212]: Étape 1 / 7
                  - status [ref=e213]:
                    - heading "Explication synchronisée" [level=4] [ref=e214]
                    - generic [ref=e215]: "État initial : RIP pointe sur 0x0040 en zone Code. Prêt à écrire 0x12345678 à l'adresse 0x1008."
                  - generic [ref=e219]:
                    - strong [ref=e220]: "Ce que le simulateur simplifie :"
                    - text: un processeur réel sépare ses cœurs de la DRAM via des caches L1/L2/L3, des tampons d'écriture et un pipeline superscalaire. L'ordre exact des octets en little-endian reste toutefois strictement identique.
              - group [ref=e221]:
                - generic "Ce que ce modèle simplifie" [ref=e222] [cursor=pointer]
              - generic [ref=e223]:
                - heading "Faites le point" [level=3] [ref=e224]
                - paragraph [ref=e228]: Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si vous bloquez.
                - generic [ref=e229]:
                  - generic [ref=e230]:
                    - generic [ref=e231]:
                      - generic [ref=e232]:
                        - generic [ref=e233]: Exercice 1 · Compréhension
                        - button "Afficher un indice" [ref=e234] [cursor=pointer]
                      - heading "À quel instant précis le processeur utilise-t-il le registre PC (RIP sur x86-64) pour savoir quelle opération exécuter ensuite ?" [level=3] [ref=e238]
                    - generic [ref=e239]:
                      - group "À quel instant précis le processeur utilise-t-il le registre PC (RIP sur x86-64) pour savoir quelle opération exécuter ensuite ?" [ref=e240]:
                        - generic [ref=e242] [cursor=pointer]:
                          - radio "Pendant la phase Fetch, pour lire les octets de l'instruction à l'adresse contenue dans PC/RIP" [ref=e243]
                          - generic [ref=e245]: Pendant la phase Fetch, pour lire les octets de l'instruction à l'adresse contenue dans PC/RIP
                        - generic [ref=e246] [cursor=pointer]:
                          - radio "Uniquement pendant Execute pour stocker le résultat du calcul" [ref=e247]
                          - generic [ref=e249]: Uniquement pendant Execute pour stocker le résultat du calcul
                        - generic [ref=e250] [cursor=pointer]:
                          - radio "Uniquement lors d'une allocation malloc() sur le tas" [ref=e251]
                          - generic [ref=e253]: Uniquement lors d'une allocation malloc() sur le tas
                      - generic [ref=e254]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e255]:
                    - generic [ref=e256]:
                      - generic [ref=e257]:
                        - generic [ref=e258]: Exercice 2 · Prédiction d'état
                        - button "Afficher un indice" [ref=e259] [cursor=pointer]
                      - heading "Dans VIS-01, quel octet est lu à l'adresse 0x1008 après l'écriture little-endian de l'entier 32 bits 0x12345678 à partir de 0x1008 ?" [level=3] [ref=e263]
                      - paragraph [ref=e264]: "L'instruction `mov dword ptr [0x1008], 0x12345678` s'exécute sur une architecture x86-64 (little-endian)."
                    - generic [ref=e265]:
                      - group "Dans VIS-01, quel octet est lu à l'adresse 0x1008 après l'écriture little-endian de l'entier 32 bits 0x12345678 à partir de 0x1008 ?" [ref=e266]:
                        - generic [ref=e268] [cursor=pointer]:
                          - radio "0x78 à 0x1008 (et 0x56, 0x34, 0x12 aux adresses 0x1009..0x100B)" [ref=e269]
                          - generic [ref=e271]: 0x78 à 0x1008 (et 0x56, 0x34, 0x12 aux adresses 0x1009..0x100B)
                        - generic [ref=e272] [cursor=pointer]:
                          - radio "0x12 à 0x1008 (ordre big-endian)" [ref=e273]
                          - generic [ref=e275]: 0x12 à 0x1008 (ordre big-endian)
                        - generic [ref=e276] [cursor=pointer]:
                          - radio "0x00 car un entier ne prend qu'un octet" [ref=e277]
                          - generic [ref=e279]: 0x00 car un entier ne prend qu'un octet
                      - generic [ref=e280]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e281]:
                    - generic [ref=e282]:
                      - generic [ref=e283]:
                        - generic [ref=e284]: Exercice 3 · Ordonnancement
                        - button "Afficher un indice" [ref=e285] [cursor=pointer]
                      - heading "Remettez dans l'ordre chronologique les étapes d'exécution d'une instruction séquentielle dans le processeur." [level=3] [ref=e289]
                    - generic [ref=e290]:
                      - list "Séquence à ordonner" [ref=e291]:
                        - listitem [ref=e292]:
                          - generic [ref=e293]:
                            - generic [ref=e294]: "1"
                            - generic [ref=e295]: "Decode : identifier l'opération et les opérandes"
                          - generic [ref=e296]:
                            - 'button "Monter Decode : identifier l''opération et les opérandes" [disabled]'
                            - 'button "Descendre Decode : identifier l''opération et les opérandes" [ref=e297] [cursor=pointer]'
                        - listitem [ref=e300]:
                          - generic [ref=e301]:
                            - generic [ref=e302]: "2"
                            - generic [ref=e303]: "Fetch : charger l'instruction pointée par PC/RIP"
                          - generic [ref=e304]:
                            - 'button "Monter Fetch : charger l''instruction pointée par PC/RIP" [ref=e305] [cursor=pointer]'
                            - 'button "Descendre Fetch : charger l''instruction pointée par PC/RIP" [ref=e308] [cursor=pointer]'
                        - listitem [ref=e311]:
                          - generic [ref=e312]:
                            - generic [ref=e313]: "3"
                            - generic [ref=e314]: "Update PC : faire pointer RIP vers l'instruction suivante"
                          - generic [ref=e315]:
                            - 'button "Monter Update PC : faire pointer RIP vers l''instruction suivante" [ref=e316] [cursor=pointer]'
                            - 'button "Descendre Update PC : faire pointer RIP vers l''instruction suivante" [ref=e319] [cursor=pointer]'
                        - listitem [ref=e322]:
                          - generic [ref=e323]:
                            - generic [ref=e324]: "4"
                            - generic [ref=e325]: "Execute : calculer dans l'ALU ou accéder à la RAM"
                          - generic [ref=e326]:
                            - 'button "Monter Execute : calculer dans l''ALU ou accéder à la RAM" [ref=e327] [cursor=pointer]'
                            - 'button "Descendre Execute : calculer dans l''ALU ou accéder à la RAM" [disabled]'
                      - button "Vérifier ma réponse" [ref=e331] [cursor=pointer]
              - generic [ref=e332]:
                - heading "À emporter" [level=3] [ref=e333]
                - paragraph [ref=e334]: Une adresse indique où lire. Un octet indique ce qui est stocké. Pour reconstruire une valeur de plusieurs octets, il faut aussi connaître leur ordre.
            - region "Pourquoi chaque programme a son espace" [ref=e335]:
              - generic [ref=e336]:
                - paragraph [ref=e337]: Chapitre 2 sur 6 · 40 min environ
                - heading "Pourquoi chaque programme a son espace" [level=2] [ref=e338]
                - paragraph [ref=e339]: Deux programmes peuvent-ils utiliser la même adresse sans partager la même donnée ?
              - generic [ref=e340]:
                - heading "L’idée en clair" [level=3] [ref=e341]
                - paragraph [ref=e342]: "Oui : une adresse vue par un programme est généralement virtuelle. Le système d’exploitation et le matériel traduisent cette adresse vers la mémoire physique. Chaque processus, c’est-à-dire chaque programme en cours d’exécution, possède ses propres correspondances et permissions."
              - generic [ref=e343]:
                - heading "Un exemple, pas à pas" [level=3] [ref=e344]
                - paragraph [ref=e345]: Pensez à deux immeubles ayant chacun un appartement 12. Le numéro seul ne désigne pas le même logement. De la même façon, l’adresse virtuelle 0x400000 dans deux processus peut désigner des pages physiques différentes. Dans un processus, la zone .text contient normalement les instructions et n’autorise pas leur réécriture ordinaire.
              - generic [ref=e346]: À vous d’expérimenter
              - paragraph [ref=e349]: Comparez les processus P1 et P2, puis tentez une écriture dans .text. Prédisez d’abord si la présence d’une adresse suffit à autoriser l’écriture.
              - generic [ref=e350]:
                - generic [ref=e351]:
                  - generic [ref=e352]:
                    - heading "VIS-02 · Espace d'adressage virtuel, MMU & segments" [level=3] [ref=e358]
                    - generic [ref=e359]: Traduction MMU valide
                  - paragraph [ref=e360]:
                    - text: Inspectez chaque région de
                    - code [ref=e361]: /proc/[pid]/maps
                    - text: ", observez comment deux processus partagent les mêmes adresses virtuelles sans collision physique, et testez la protection"
                    - code [ref=e362]: rwx
                    - text: .
                  - generic [ref=e363]:
                    - button "Isolation P1 ↔ P2 active" [pressed] [ref=e364] [cursor=pointer]
                    - button "Cibler Processus P1" [ref=e365] [cursor=pointer]
                    - button "Cibler Processus P2" [ref=e366] [cursor=pointer]
                    - 'button "ASLR : Désactivé" [ref=e367] [cursor=pointer]'
                - generic [ref=e368]:
                  - generic [ref=e369]:
                    - generic [ref=e370]:
                      - generic [ref=e371]:
                        - generic [ref=e372]: Espace virtuel de P1 (haut → bas)
                        - generic [ref=e373]: Permissions
                      - listbox "Segments mémoire du processus" [ref=e374]:
                        - option "Stack (Pile d'appels) 0x7FE000–0x7FFFFF · ↓ adresses basses rw-p RAM 0x0C4000" [ref=e375] [cursor=pointer]:
                          - generic [ref=e376]:
                            - generic [ref=e377]: Stack (Pile d'appels)
                            - generic [ref=e378]: 0x7FE000–0x7FFFFF · ↓ adresses basses
                          - generic [ref=e379]:
                            - generic [ref=e380]: rw-p
                            - generic [ref=e381]: RAM 0x0C4000
                        - option "Zone mmap & bibliothèques 0x700000–0x708FFF · ↓ adresses basses r-xp / rw-p RAM 0x055000 (partagé)" [ref=e382] [cursor=pointer]:
                          - generic [ref=e383]:
                            - generic [ref=e384]: Zone mmap & bibliothèques
                            - generic [ref=e385]: 0x700000–0x708FFF · ↓ adresses basses
                          - generic [ref=e386]:
                            - generic [ref=e387]: r-xp / rw-p
                            - generic [ref=e388]: RAM 0x055000 (partagé)
                        - option "Heap (Tas dynamique) 0x602000–0x623FFF · ↑ adresses hautes rw-p RAM 0x08B000" [ref=e389] [cursor=pointer]:
                          - generic [ref=e390]:
                            - generic [ref=e391]: Heap (Tas dynamique)
                            - generic [ref=e392]: 0x602000–0x623FFF · ↑ adresses hautes
                          - generic [ref=e393]:
                            - generic [ref=e394]: rw-p
                            - generic [ref=e395]: RAM 0x08B000
                        - option "Data & BSS 0x404000–0x405FFF · taille fixe rw-p RAM 0x04A000" [ref=e396] [cursor=pointer]:
                          - generic [ref=e397]:
                            - generic [ref=e398]: Data & BSS
                            - generic [ref=e399]: 0x404000–0x405FFF · taille fixe
                          - generic [ref=e400]:
                            - generic [ref=e401]: rw-p
                            - generic [ref=e402]: RAM 0x04A000
                        - option "Rodata (Constantes) 0x402000–0x402FFF · taille fixe r--p RAM 0x031000" [ref=e403] [cursor=pointer]:
                          - generic [ref=e404]:
                            - generic [ref=e405]: Rodata (Constantes)
                            - generic [ref=e406]: 0x402000–0x402FFF · taille fixe
                          - generic [ref=e407]:
                            - generic [ref=e408]: r--p
                            - generic [ref=e409]: RAM 0x031000
                        - option "Text (Code machine) 0x401000–0x401FFF · taille fixe r-xp RAM 0x02F000" [selected] [ref=e410] [cursor=pointer]:
                          - generic [ref=e411]:
                            - generic [ref=e412]: Text (Code machine)
                            - generic [ref=e413]: 0x401000–0x401FFF · taille fixe
                          - generic [ref=e414]:
                            - generic [ref=e415]: r-xp
                            - generic [ref=e416]: RAM 0x02F000
                    - generic [ref=e417]:
                      - generic [ref=e418]:
                        - generic [ref=e419]: Tester une opération mémoire via la MMU
                        - generic [ref=e420]:
                          - button "Lire Text (r-x)" [ref=e421] [cursor=pointer]
                          - button "Écrire dans Text" [ref=e422] [cursor=pointer]
                          - button "Allouer page Heap" [ref=e423] [cursor=pointer]
                          - button "Exécuter dans Stack" [ref=e424] [cursor=pointer]
                          - button "Déréférencer NULL (0x0)" [ref=e425] [cursor=pointer]
                        - generic [ref=e426]:
                          - generic [ref=e427]:
                            - text: "Processus :"
                            - strong [ref=e428]: P1
                            - text: "· Adresse virtuelle :"
                            - strong [ref=e429]: "0x401040"
                          - generic [ref=e430]: "Table des pages : Page 0x401000 (r-x) -> Cadre 0x02F000"
                          - generic [ref=e431]: "Cadre physique RAM : 0x02F040"
                      - generic [ref=e432]:
                        - generic [ref=e433]:
                          - generic [ref=e434]: "Segment inspecté : Text (Code machine)"
                          - generic [ref=e435]: r-xp
                        - paragraph [ref=e436]: Instructions machine exécutables (main, compute, helper), non modifiables.
                        - generic [ref=e437]: "/proc/self/maps : 401000-401fff r-xp 00001000 08:01 /usr/bin/app"
                  - status [ref=e438]:
                    - generic [ref=e443]:
                      - heading "Traduction MMU" [level=4] [ref=e444]
                      - generic [ref=e445]: "Accès autorisé : dans P1, l'adresse virtuelle 0x401040 est traduite par la MMU vers le cadre physique isolé 0x02F040 (droit r=1)."
                  - generic [ref=e449]:
                    - strong [ref=e450]: "Ce que le simulateur simplifie :"
                    - text: Linux x86-64 utilise des adresses virtuelles canoniques 48 bits, des tables de pages à 4/5 niveaux et un cache
                    - code [ref=e451]: TLB
                    - text: . L'isolation par processus et les droits
                    - code [ref=e452]: rwx
                    - text: fonctionnent exactement comme illustré.
              - group [ref=e453]:
                - generic "Ce que ce modèle simplifie" [ref=e454] [cursor=pointer]
              - generic [ref=e455]:
                - heading "Faites le point" [level=3] [ref=e456]
                - paragraph [ref=e460]: Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si vous bloquez.
                - generic [ref=e461]:
                  - generic [ref=e462]:
                    - generic [ref=e463]:
                      - generic [ref=e464]:
                        - generic [ref=e465]: Exercice 4 · Compréhension
                        - button "Afficher un indice" [ref=e466] [cursor=pointer]
                      - heading "Deux processus P1 et P2 accèdent chacun à l'adresse virtuelle 0x401000. Pourquoi P1 n'écrase-t-il pas les données de P2 ?" [level=3] [ref=e470]
                    - generic [ref=e471]:
                      - group "Deux processus P1 et P2 accèdent chacun à l'adresse virtuelle 0x401000. Pourquoi P1 n'écrase-t-il pas les données de P2 ?" [ref=e472]:
                        - generic [ref=e474] [cursor=pointer]:
                          - radio "Chaque processus possède sa propre table des pages qui traduit 0x401000 vers un cadre physique distinct" [ref=e475]
                          - generic [ref=e477]: Chaque processus possède sa propre table des pages qui traduit 0x401000 vers un cadre physique distinct
                        - generic [ref=e478] [cursor=pointer]:
                          - radio "Le CPU met le processus P2 en pause jusqu'à la fin de P1" [ref=e479]
                          - generic [ref=e481]: Le CPU met le processus P2 en pause jusqu'à la fin de P1
                        - generic [ref=e482] [cursor=pointer]:
                          - radio "Le compilateur réécrit automatiquement toutes les adresses de P2 avant le lancement" [ref=e483]
                          - generic [ref=e485]: Le compilateur réécrit automatiquement toutes les adresses de P2 avant le lancement
                      - generic [ref=e486]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e487]:
                    - generic [ref=e488]:
                      - generic [ref=e489]:
                        - generic [ref=e490]: Exercice 5 · Compréhension
                        - button "Afficher un indice" [ref=e491] [cursor=pointer]
                      - heading "Que déclenche matériellement le CPU + OS lorsqu'un bug tente d'écrire un octet dans le segment Text (.text, permissions r-x) ?" [level=3] [ref=e495]
                    - generic [ref=e496]:
                      - group "Que déclenche matériellement le CPU + OS lorsqu'un bug tente d'écrire un octet dans le segment Text (.text, permissions r-x) ?" [ref=e497]:
                        - generic [ref=e499] [cursor=pointer]:
                          - radio "Une faute de protection (Segmentation Fault / SIGSEGV) car la page Text n'a pas le droit d'écriture (w)" [ref=e500]
                          - generic [ref=e502]: Une faute de protection (Segmentation Fault / SIGSEGV) car la page Text n'a pas le droit d'écriture (w)
                        - generic [ref=e503] [cursor=pointer]:
                          - radio "L'OS déplace silencieusement la donnée vers le segment BSS" [ref=e504]
                          - generic [ref=e506]: L'OS déplace silencieusement la donnée vers le segment BSS
                        - generic [ref=e507] [cursor=pointer]:
                          - radio "L'instruction devient automatiquement une allocation malloc()" [ref=e508]
                          - generic [ref=e510]: L'instruction devient automatiquement une allocation malloc()
                      - generic [ref=e511]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e512]:
                    - generic [ref=e513]:
                      - generic [ref=e514]:
                        - generic [ref=e515]: Exercice 6 · Inspection de schéma
                        - button "Afficher un indice" [ref=e516] [cursor=pointer]
                      - 'heading "Pointez sur le schéma la zone mémoire exacte où est stockée une variable globale initialisée `static int port = 443;`." [level=3] [ref=e520]'
                      - paragraph [ref=e521]: Carte des segments mémoire d'un processus — Sélectionnez la zone correspondant aux variables globales initialisées à une valeur non nulle.
                    - generic [ref=e522]:
                      - group "Carte des segments mémoire d'un processus" [ref=e523]:
                        - generic [ref=e525]:
                          - generic [ref=e526] [cursor=pointer]:
                            - radio "0x401000 · r-x Zone Segment Text (.text) Code machine exécutable en lecture seule" [ref=e527]
                            - generic [ref=e528]:
                              - generic [ref=e529]: 0x401000 · r-x
                              - generic [ref=e530]: Zone
                            - generic [ref=e531]: Segment Text (.text)
                            - generic [ref=e532]: Code machine exécutable en lecture seule
                          - generic [ref=e533] [cursor=pointer]:
                            - radio "0x404000 · rw- Zone Segment Data (.data) Variables globales/statiques initialisées" [ref=e534]
                            - generic [ref=e535]:
                              - generic [ref=e536]: 0x404000 · rw-
                              - generic [ref=e537]: Zone
                            - generic [ref=e538]: Segment Data (.data)
                            - generic [ref=e539]: Variables globales/statiques initialisées
                          - generic [ref=e540] [cursor=pointer]:
                            - radio "0x404100 · rw- Zone Segment BSS (.bss) Globales initialisées à 0" [ref=e541]
                            - generic [ref=e542]:
                              - generic [ref=e543]: 0x404100 · rw-
                              - generic [ref=e544]: Zone
                            - generic [ref=e545]: Segment BSS (.bss)
                            - generic [ref=e546]: Globales initialisées à 0
                          - generic [ref=e547] [cursor=pointer]:
                            - radio "0x7FFF0000 · rw- Zone Pile (Stack) Trames temporaires des fonctions" [ref=e548]
                            - generic [ref=e549]:
                              - generic [ref=e550]: 0x7FFF0000 · rw-
                              - generic [ref=e551]: Zone
                            - generic [ref=e552]: Pile (Stack)
                            - generic [ref=e553]: Trames temporaires des fonctions
                      - generic [ref=e554]:
                        - button "Vérifier ma réponse" [disabled]
              - generic [ref=e555]:
                - heading "À emporter" [level=3] [ref=e556]
                - paragraph [ref=e557]: "Pour accéder à une donnée, une adresse ne suffit pas : la traduction doit exister et les permissions doivent autoriser l’opération."
            - region "Suivre un appel de fonction" [ref=e558]:
              - generic [ref=e559]:
                - paragraph [ref=e560]: Chapitre 3 sur 6 · 50 min environ
                - heading "Suivre un appel de fonction" [level=2] [ref=e561]
                - paragraph [ref=e562]: Comment une fonction retrouve-t-elle son chemin après en avoir appelé une autre ?
              - generic [ref=e563]:
                - heading "L’idée en clair" [level=3] [ref=e564]
                - paragraph [ref=e565]: "La pile d’appels garde les informations nécessaires aux fonctions en cours. Chaque appel peut ajouter une trame : une zone qui contient notamment des données locales et des informations de retour. Au retour, cette zone redevient disponible. Disponible ne signifie pas effacée."
              - generic [ref=e566]:
                - heading "Un exemple, pas à pas" [level=3] [ref=e567]
                - paragraph [ref=e568]: main appelle calculer, qui appelle doubler. La trame de doubler est ajoutée au sommet. Quand doubler termine, calculer reprend ; quand calculer termine, main reprend. Dans le modèle x86-64 présenté, la pile grandit vers les adresses plus basses. RSP repère le sommet ; RBP sert ici de repère dans la trame.
              - generic [ref=e569]: À vous d’expérimenter
              - paragraph [ref=e572]: Avancez jusqu’à un appel imbriqué, puis jusqu’au retour. Regardez quelles cases ne sont plus utilisées et vérifiez si leurs octets ont été remis à zéro.
              - generic "Simulateur VIS-03 Pile d'appels, RSP RBP et pointeur pendant" [ref=e573]:
                - generic [ref=e574]:
                  - generic [ref=e575]:
                    - heading [level=3] [ref=e581]:
                      - text: VIS-03 · Pile d'appels (
                      - code [ref=e582]: RSP
                      - text: /
                      - code [ref=e583]: RBP
                      - text: ), ABI & pointeurs pendants
                    - generic [ref=e584]: "Fonction : main"
                  - paragraph [ref=e585]:
                    - text: La pile croît vers les
                    - strong [ref=e586]: adresses basses
                    - text: . Au retour (
                    - code [ref=e587]: RET
                    - text: ), seul
                    - code [ref=e588]: RSP
                    - text: "remonte en O(1) : les octets libérés restent visibles en grisé jusqu'au prochain appel."
                  - generic [ref=e589]:
                    - tablist "Scénarios de pile" [ref=e590]:
                      - tab "Appels imbriqués & résidus" [selected] [ref=e591] [cursor=pointer]
                      - tab "Pointeur pendant (Dangling)" [ref=e592] [cursor=pointer]
                      - tab "Stack Overflow (Récursion)" [ref=e593] [cursor=pointer]
                    - button "Masquer détails ABI" [pressed] [ref=e595] [cursor=pointer]
                - generic [ref=e596]:
                  - generic [ref=e597]:
                    - generic [ref=e598]:
                      - generic [ref=e599]:
                        - generic [ref=e600]: Trace d'exécution guidée
                        - list [ref=e601]:
                          - listitem [ref=e602]: "1: int main() { int a = 10; return compute(a); }"
                          - listitem [ref=e603]: "2: int compute(int x) { int y = x * 2; return helper(y); }"
                          - listitem [ref=e604]: "3: int helper(int z) { int tmp = z + 1; return tmp; }"
                          - listitem [ref=e605]: "4: // Retour vers compute -> retour vers main -> appel probe()"
                          - listitem [ref=e606]: "5: int probe() { int uninit; /* lit l'ancienne case ! */ }"
                      - generic [ref=e607]:
                        - generic [ref=e608]:
                          - generic [ref=e609]: RSP (Sommet)
                          - generic [ref=e610]: "0x7FE8"
                        - generic [ref=e611]:
                          - generic [ref=e612]: RBP (Base trame)
                          - generic [ref=e613]: "0x7FF0"
                        - generic [ref=e614]:
                          - generic [ref=e615]: RIP courant
                          - generic [ref=e616]: "0x401020"
                      - generic [ref=e617]:
                        - strong [ref=e618]: "Convention System V AMD64 ABI :"
                        - text: "Prologue de main : RSP aligné à 16 octets avant tout CALL."
                    - generic [ref=e619]:
                      - generic [ref=e620]:
                        - generic [ref=e621]: Pile d'appels (adresses hautes → basses ↓)
                        - generic [ref=e622]: 0x7FF0 ↓ 0x7F50
                      - list [ref=e623]:
                        - listitem [ref=e624]:
                          - generic [ref=e625]:
                            - generic [ref=e626]: "0x7FF0"
                            - generic [ref=e627]: main
                            - generic [ref=e628]: Base main (RBP)
                          - generic [ref=e629]: "0x7FF8"
                        - listitem [ref=e630]:
                          - generic [ref=e631]:
                            - generic [ref=e632]: "0x7FE8"
                            - generic [ref=e633]: main
                            - generic [ref=e634]: int a
                            - generic [ref=e635]: ← RSP
                          - generic [ref=e636]: "10"
                  - generic [ref=e637]:
                    - generic [ref=e638]:
                      - button "Pas précédent" [disabled]
                      - button "Pas suivant" [ref=e639] [cursor=pointer]
                      - button "Réinitialiser" [ref=e642] [cursor=pointer]
                    - generic [ref=e646]: Étape 1 / 4
                  - status [ref=e647]:
                    - heading "État de la pile" [level=4] [ref=e648]
                    - generic [ref=e649]: "main() crée sa trame à 0x7FF0 et stocke `a = 10` en 0x7FE8. RDI reçoit `10` pour appeler compute(10)."
                  - generic [ref=e653]:
                    - strong [ref=e654]: "Ce que le simulateur simplifie :"
                    - text: en compilation optimisée (
                    - code [ref=e655]: "-O2"
                    - text: ), le compilateur peut placer certaines locales uniquement en registres, omettre
                    - code [ref=e656]: RBP
                    - text: (
                    - code [ref=e657]: "-fomit-frame-pointer"
                    - text: ) et utiliser la Red Zone de 128 octets sous
                    - code [ref=e658]: RSP
                    - text: dans les fonctions feuilles Linux x86-64.
              - group [ref=e659]:
                - generic "Ce que ce modèle simplifie" [ref=e660] [cursor=pointer]
              - generic [ref=e661]:
                - heading "Faites le point" [level=3] [ref=e662]
                - paragraph [ref=e666]: Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si vous bloquez.
                - generic [ref=e667]:
                  - generic [ref=e668]:
                    - generic [ref=e669]:
                      - generic [ref=e670]:
                        - generic [ref=e671]: Exercice 7 · Ordonnancement
                        - button "Afficher un indice" [ref=e672] [cursor=pointer]
                      - 'heading "Ordonnez la séquence exacte de création d''une trame d''activation lors d''un appel `f()` sur x86-64 (System V ABI)." [level=3] [ref=e676]'
                    - generic [ref=e677]:
                      - list "Séquence à ordonner" [ref=e678]:
                        - listitem [ref=e679]:
                          - generic [ref=e680]:
                            - generic [ref=e681]: "1"
                            - generic [ref=e682]: "sub rsp, N : réserver l'espace des variables locales"
                          - generic [ref=e683]:
                            - 'button "Monter sub rsp, N : réserver l''espace des variables locales" [disabled]'
                            - 'button "Descendre sub rsp, N : réserver l''espace des variables locales" [ref=e684] [cursor=pointer]'
                        - listitem [ref=e687]:
                          - generic [ref=e688]:
                            - generic [ref=e689]: "2"
                            - generic [ref=e690]: "push rbp : sauvegarder le RBP de la fonction appelante"
                          - generic [ref=e691]:
                            - 'button "Monter push rbp : sauvegarder le RBP de la fonction appelante" [ref=e692] [cursor=pointer]'
                            - 'button "Descendre push rbp : sauvegarder le RBP de la fonction appelante" [ref=e695] [cursor=pointer]'
                        - listitem [ref=e698]:
                          - generic [ref=e699]:
                            - generic [ref=e700]: "3"
                            - generic [ref=e701]: "call f : empiler l'adresse de retour et sauter vers f"
                          - generic [ref=e702]:
                            - 'button "Monter call f : empiler l''adresse de retour et sauter vers f" [ref=e703] [cursor=pointer]'
                            - 'button "Descendre call f : empiler l''adresse de retour et sauter vers f" [ref=e706] [cursor=pointer]'
                        - listitem [ref=e709]:
                          - generic [ref=e710]:
                            - generic [ref=e711]: "4"
                            - generic [ref=e712]: "mov rbp, rsp : ancrer la base de la nouvelle trame"
                          - generic [ref=e713]:
                            - 'button "Monter mov rbp, rsp : ancrer la base de la nouvelle trame" [ref=e714] [cursor=pointer]'
                            - 'button "Descendre mov rbp, rsp : ancrer la base de la nouvelle trame" [disabled]'
                      - button "Vérifier ma réponse" [ref=e718] [cursor=pointer]
                  - generic [ref=e719]:
                    - generic [ref=e720]:
                      - generic [ref=e721]:
                        - generic [ref=e722]: Exercice 8 · Prédiction d'état
                        - button "Afficher un indice" [ref=e723] [cursor=pointer]
                      - 'heading "Lorsqu''une fonction se termine par `ret` sans écraser explicitement ses variables locales, que contiennent les octets de son ancienne trame en RAM ?" [level=3] [ref=e727]'
                      - paragraph [ref=e728]: "Dans VIS-03, étape 4 (`ret` depuis `inner()` vers `outer()`), RSP remonte à l'adresse haute de l'appelant."
                    - generic [ref=e729]:
                      - 'group "Lorsqu''une fonction se termine par `ret` sans écraser explicitement ses variables locales, que contiennent les octets de son ancienne trame en RAM ?" [ref=e730]':
                        - generic [ref=e732] [cursor=pointer]:
                          - radio "Les anciens octets restent temporairement en mémoire comme données résiduelles jusqu'à réutilisation par un appel futur" [ref=e733]
                          - generic [ref=e735]: Les anciens octets restent temporairement en mémoire comme données résiduelles jusqu'à réutilisation par un appel futur
                        - generic [ref=e736] [cursor=pointer]:
                          - radio "Le CPU efface systématiquement toute la trame à 0x00 au retour" [ref=e737]
                          - generic [ref=e739]: Le CPU efface systématiquement toute la trame à 0x00 au retour
                        - generic [ref=e740] [cursor=pointer]:
                          - radio "L'OS transfère les variables locales sur le tas" [ref=e741]
                          - generic [ref=e743]: L'OS transfère les variables locales sur le tas
                      - generic [ref=e744]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e745]:
                    - generic [ref=e746]:
                      - generic [ref=e747]:
                        - generic [ref=e748]: Exercice 11 · Inspection de schéma
                        - button "Afficher un indice" [ref=e749] [cursor=pointer]
                      - 'heading "Identifiez sur le schéma de trame x86-64 l''emplacement contenant l''adresse de retour empilée par `CALL`." [level=3] [ref=e753]'
                      - paragraph [ref=e754]: "Anatomie d'une trame de pile x86-64 — Cliquez sur le slot où `CALL` a enregistré l'adresse de reprise de la fonction appelante."
                    - generic [ref=e755]:
                      - group "Anatomie d'une trame de pile x86-64" [ref=e756]:
                        - generic [ref=e758]:
                          - generic [ref=e759] [cursor=pointer]:
                            - radio "Adresse de reprise · 8 octets Zone Slot [RBP + 8] Empilé automatiquement par CALL" [ref=e760]
                            - generic [ref=e761]:
                              - generic [ref=e762]: Adresse de reprise · 8 octets
                              - generic [ref=e763]: Zone
                            - generic [ref=e764]: Slot [RBP + 8]
                            - generic [ref=e765]: Empilé automatiquement par CALL
                          - generic [ref=e766] [cursor=pointer]:
                            - 'radio "Ancien RBP · 8 octets Zone Slot [RBP] Empilé par `push rbp`" [ref=e767]'
                            - generic [ref=e768]:
                              - generic [ref=e769]: Ancien RBP · 8 octets
                              - generic [ref=e770]: Zone
                            - generic [ref=e771]: Slot [RBP]
                            - generic [ref=e772]: "Empilé par `push rbp`"
                          - generic [ref=e773] [cursor=pointer]:
                            - 'radio "Variable locale · 4 octets Zone Slot [RBP - 4] Allouée par `sub rsp, 16`" [ref=e774]'
                            - generic [ref=e775]:
                              - generic [ref=e776]: Variable locale · 4 octets
                              - generic [ref=e777]: Zone
                            - generic [ref=e778]: Slot [RBP - 4]
                            - generic [ref=e779]: "Allouée par `sub rsp, 16`"
                      - generic [ref=e780]:
                        - button "Vérifier ma réponse" [disabled]
              - generic [ref=e781]:
                - heading "À emporter" [level=3] [ref=e782]
                - paragraph [ref=e783]: La durée de vie d’une variable locale se termine avec son contexte. Les anciens octets peuvent rester présents sans que la variable existe encore.
            - region "Une adresse n’est pas une garantie" [ref=e784]:
              - generic [ref=e785]:
                - paragraph [ref=e786]: Chapitre 4 sur 6 · 40 min environ
                - heading "Une adresse n’est pas une garantie" [level=2] [ref=e787]
                - paragraph [ref=e788]: Que reste-t-il d’un pointeur quand la donnée qu’il désignait n’existe plus ?
              - generic [ref=e789]:
                - heading "L’idée en clair" [level=3] [ref=e790]
                - paragraph [ref=e791]: "Un pointeur contient une adresse. Lire à travers ce pointeur s’appelle le déréférencer. Ce nombre ne vous dit pas si l’objet est encore vivant. Quand l’objet disparaît, le pointeur peut conserver son adresse : il devient pendant."
              - generic [ref=e792]:
                - heading "Un exemple, pas à pas" [level=3] [ref=e793]
                - paragraph [ref=e794]: Une fonction crée une variable locale contenant 42 et renvoie son adresse. Après le retour, cette variable n’existe plus. Un autre appel réutilise la même zone et y place 99. L’ancien pointeur n’a pas changé, mais il n’autorise plus une lecture valide de la variable d’origine.
              - generic [ref=e795]: À vous d’expérimenter
              - paragraph [ref=e798]: Ouvrez le laboratoire de la pile, choisissez « Pointeur pendant », puis avancez jusqu’à la réutilisation de la trame. Revenez à ce chapitre pour répondre aux questions.
              - generic [ref=e800]:
                - 'heading "Observation guidée sur la pile : alias et données résiduelles" [level=3] [ref=e801]'
                - paragraph [ref=e806]:
                  - text: Utilisez l'onglet
                  - strong [ref=e807]: Pointeur pendant (Dangling)
                  - text: du simulateur
                  - button "Ouvrir le laboratoire de la pile" [ref=e808] [cursor=pointer]
                  - text: pour observer comment une nouvelle trame peut réutiliser la zone contenant la valeur pointée à
                  - code [ref=e809]: "0x7FFF0FC0"
                  - text: .
              - group [ref=e810]:
                - generic "Ce que ce modèle simplifie" [ref=e811] [cursor=pointer]
              - generic [ref=e812]:
                - heading "Faites le point" [level=3] [ref=e813]
                - paragraph [ref=e817]: Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si vous bloquez.
                - generic [ref=e818]:
                  - generic [ref=e819]:
                    - generic [ref=e820]:
                      - generic [ref=e821]:
                        - generic [ref=e822]: Exercice 9 · Compréhension
                        - button "Afficher un indice" [ref=e823] [cursor=pointer]
                      - 'heading "Soient `int a = 10; int *p = &a; *p = 25;`. Que désigne précisément `*p` ?" [level=3] [ref=e827]'
                    - generic [ref=e828]:
                      - 'group "Soient `int a = 10; int *p = &a; *p = 25;`. Que désigne précisément `*p` ?" [ref=e829]':
                        - generic [ref=e831] [cursor=pointer]:
                          - 'radio "L''accès en lecture/écriture à la valeur entière stockée à l''adresse contenue dans p (donc `a` devient 25)" [ref=e832]'
                          - generic [ref=e834]: "L'accès en lecture/écriture à la valeur entière stockée à l'adresse contenue dans p (donc `a` devient 25)"
                        - generic [ref=e835] [cursor=pointer]:
                          - radio "L'adresse en mémoire où vit le pointeur p lui-même" [ref=e836]
                          - generic [ref=e838]: L'adresse en mémoire où vit le pointeur p lui-même
                        - generic [ref=e839] [cursor=pointer]:
                          - 'radio "Une copie indépendante de `a` laissant `a` égal à 10" [ref=e840]'
                          - generic [ref=e842]: "Une copie indépendante de `a` laissant `a` égal à 10"
                      - generic [ref=e843]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e844]:
                    - generic [ref=e845]:
                      - generic [ref=e846]:
                        - generic [ref=e847]: Exercice 10 · Prédiction d'état
                        - button "Afficher un indice" [ref=e848] [cursor=pointer]
                      - 'heading "Une fonction `bad_ptr()` retourne l''adresse `&secret` de sa variable locale sur la pile, puis `other()` est appelée. Que lit `*p` ?" [level=3] [ref=e852]'
                      - paragraph [ref=e853]: "Dans VIS-03 onglet 'Pointeur pendant', `bad_ptr()` retourne `0x7FFF0FC0` puis `other()` crée sa trame au même emplacement."
                    - generic [ref=e854]:
                      - 'group "Une fonction `bad_ptr()` retourne l''adresse `&secret` de sa variable locale sur la pile, puis `other()` est appelée. Que lit `*p` ?" [ref=e855]':
                        - generic [ref=e857] [cursor=pointer]:
                          - 'radio "Des données corrompues appartenant désormais à la nouvelle trame de `other()` (comportement indéfini / CWE-825)" [ref=e858]'
                          - generic [ref=e860]: "Des données corrompues appartenant désormais à la nouvelle trame de `other()` (comportement indéfini / CWE-825)"
                        - generic [ref=e861] [cursor=pointer]:
                          - 'radio "Une interruption matérielle instantanée dès la fin de `bad_ptr()`" [ref=e862]'
                          - generic [ref=e864]: "Une interruption matérielle instantanée dès la fin de `bad_ptr()`"
                        - generic [ref=e865] [cursor=pointer]:
                          - 'radio "Toujours l''ancienne valeur de `secret` protégée par le CPU" [ref=e866]'
                          - generic [ref=e868]: "Toujours l'ancienne valeur de `secret` protégée par le CPU"
                      - generic [ref=e869]:
                        - button "Vérifier ma réponse" [disabled]
              - generic [ref=e870]:
                - heading "À emporter" [level=3] [ref=e871]
                - paragraph [ref=e872]: Même adresse ne signifie ni même objet, ni objet vivant. La validité d’un pointeur dépend aussi de la durée de vie de sa cible.
            - region "Réserver et libérer de la mémoire" [ref=e873]:
              - generic [ref=e874]:
                - paragraph [ref=e875]: Chapitre 5 sur 6 · 50 min environ
                - heading "Réserver et libérer de la mémoire" [level=2] [ref=e876]
                - paragraph [ref=e877]: Comment conserver des données après le retour d’une fonction ?
              - generic [ref=e878]:
                - heading "L’idée en clair" [level=3] [ref=e879]
                - paragraph [ref=e880]: Une allocation dynamique réserve un bloc dont la durée de vie ne suit pas automatiquement celle de la fonction. Un allocateur organise ces blocs dans le tas. En C, malloc demande un bloc et free le rend disponible. Libérer un bloc ne met pas automatiquement tous les pointeurs qui le désignent à zéro.
              - generic [ref=e881]:
                - heading "Un exemple, pas à pas" [level=3] [ref=e882]
                - paragraph [ref=e883]: "Vous réservez 16 octets et gardez leur adresse dans p. Après free(p), l’allocateur peut attribuer la même zone à q. Relire p est une utilisation après libération, appelée use-after-free : l’adresse a pu rester identique, mais l’ancien objet n’est plus valide."
              - generic [ref=e884]: À vous d’expérimenter
              - paragraph [ref=e887]: Comparez une allocation normale et le scénario « Use-After-Free ». Observez les blocs libres puis réutilisés. Distinguez la taille demandée et la place réellement occupée.
              - generic "Simulateur VIS-04 Tas et Allocateur" [ref=e888]:
                - generic [ref=e889]:
                  - generic [ref=e890]:
                    - heading [level=3] [ref=e902]:
                      - text: VIS-04 · Tas (
                      - code [ref=e903]: heap
                      - text: ), métadonnées d'allocateur & dérives (
                      - code [ref=e904]: UAF
                      - text: ", fuite, fragmentation)"
                    - generic [ref=e905]: Tas cohérent
                  - paragraph [ref=e906]:
                    - text: Observez l'en-tête caché de 8 octets (
                    - code [ref=e907]: taille | A|M|P
                    - text: ), l'alignement sur 16 octets, la bascule vers
                    - code [ref=e908]: mmap
                    - text: pour les gros tampons et la réutilisation d'adresse à l'origine du Use-After-Free.
                  - group "Scénarios préconfigurés" [ref=e909]:
                    - button "Cycle sain" [ref=e910] [cursor=pointer]
                    - button "Fragmentation externe" [ref=e911] [cursor=pointer]
                    - button "Fuite & Double Free" [ref=e912] [cursor=pointer]
                    - button "Use-After-Free (CWE-416)" [ref=e913] [cursor=pointer]
                  - generic [ref=e914]:
                    - button "malloc(16)" [ref=e915] [cursor=pointer]
                    - button "malloc(24)" [ref=e917] [cursor=pointer]
                    - button "malloc(40)" [ref=e919] [cursor=pointer]
                    - button "malloc(256 Ko → mmap)" [ref=e921] [cursor=pointer]
                    - 'button "Fusion (Coalescing) : ON" [pressed] [ref=e923] [cursor=pointer]'
                    - 'button "En-têtes 8 o : Visibles" [pressed] [ref=e924] [cursor=pointer]'
                    - button "Réinitialiser le tas simulé" [ref=e925] [cursor=pointer]: Reset
                - generic [ref=e929]:
                  - generic [ref=e930]:
                    - generic [ref=e931]:
                      - generic [ref=e932]: Arène tas simulée (256 o · base 0x602000)
                      - generic [ref=e933]:
                        - text: Cliquez sur
                        - code [ref=e934]: free()
                        - text: sur n'importe quel bloc (y compris un bloc déjà libéré pour observer un Double Free).
                    - generic [ref=e936]:
                      - generic [ref=e937]:
                        - generic [ref=e938]:
                          - generic [ref=e939]: Libre (Wilderness)
                          - generic [ref=e940]: 256 o total
                        - paragraph [ref=e941]: "payload @ 0x602008 · demandé : 0 o"
                        - generic [ref=e942]: En-tête [0x602000] = 0x101 (P=1)
                      - generic [ref=e943]:
                        - generic [ref=e944]: offset +0 o
                        - button "free()" [ref=e945] [cursor=pointer]
                  - generic [ref=e949]:
                    - generic [ref=e950]:
                      - heading [level=4] [ref=e951]:
                        - text: Pointeurs côté Pile (
                        - code [ref=e952]: stack -> heap
                        - text: )
                      - paragraph [ref=e953]: Aucun pointeur sur la pile pour l'instant. Allouez un bloc ou chargez un scénario.
                    - generic [ref=e954]:
                      - generic [ref=e955]:
                        - heading "Métriques & Fragmentation" [level=4] [ref=e956]
                        - generic [ref=e957]: "Frag. externe : 0%"
                      - 'img "Répartition du tas : 0% données utiles, 0% surcoût interne, 100% libre, fragmentation externe 0%" [ref=e958]':
                        - generic [ref=e960]: "Utile: 0o (0%) · Surcoût interne: 0o (0%) · Libre: 256o"
                        - generic [ref=e961]: "Plus grand bloc libre contigu : 256 o"
                  - generic [ref=e962]:
                    - generic [ref=e963]: Journal de l'allocateur
                    - list [ref=e965]:
                      - listitem [ref=e966]: "• Tas initialisé : 256 octets libres contigus à partir de 0x602000."
                  - status [ref=e967]:
                    - heading "Simplification pédagogique vs implémentations réelles" [level=4] [ref=e970]
                    - generic [ref=e971]:
                      - text: Les allocateurs modernes (
                      - code [ref=e972]: glibc ptmalloc2
                      - text: ","
                      - code [ref=e973]: jemalloc
                      - text: ","
                      - code [ref=e974]: mimalloc
                      - text: ) maintiennent plusieurs arènes par thread, des caches rapides (
                      - code [ref=e975]: tcache
                      - text: /
                      - code [ref=e976]: fastbins
                      - text: ) sans fusion immédiate, et basculent vers
                      - code [ref=e977]: mmap
                      - text: autour de 128 Ko plutôt qu'à 256 o. L'en-tête caché et l'effet de réutilisation (Use-After-Free) restent toutefois fidèles.
              - group [ref=e978]:
                - generic "Ce que ce modèle simplifie" [ref=e979] [cursor=pointer]
              - generic [ref=e980]:
                - heading "Faites le point" [level=3] [ref=e981]
                - paragraph [ref=e985]: Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si vous bloquez.
                - generic [ref=e986]:
                  - generic [ref=e987]:
                    - generic [ref=e988]:
                      - generic [ref=e989]:
                        - generic [ref=e990]: Exercice 12 · Prédiction d'état
                        - button "Afficher un indice" [ref=e991] [cursor=pointer]
                      - 'heading "Pourquoi un appel `malloc(64)` échoue-t-il alors que l''arène dispose encore de 96 octets libres au total dans le scénario ''Fragmentation externe'' de VIS-04 ?" [level=3] [ref=e995]'
                      - paragraph [ref=e996]: "Deux blocs libres de 32 octets chacun sont séparés par un bloc alloué `blkB` de 48 octets qui empêche leur fusion."
                    - generic [ref=e997]:
                      - 'group "Pourquoi un appel `malloc(64)` échoue-t-il alors que l''arène dispose encore de 96 octets libres au total dans le scénario ''Fragmentation externe'' de VIS-04 ?" [ref=e998]':
                        - generic [ref=e1000] [cursor=pointer]:
                          - 'radio "Aucun trou libre contigu n''atteint la taille requise (les blocs libres ne peuvent pas fusionner tant que `blkB` est actif)" [ref=e1001]'
                          - generic [ref=e1003]: "Aucun trou libre contigu n'atteint la taille requise (les blocs libres ne peuvent pas fusionner tant que `blkB` est actif)"
                        - generic [ref=e1004] [cursor=pointer]:
                          - radio "Parce que l'en-tête caché pèse 128 octets à lui seul" [ref=e1005]
                          - generic [ref=e1007]: Parce que l'en-tête caché pèse 128 octets à lui seul
                        - generic [ref=e1008] [cursor=pointer]:
                          - radio "Parce que 64 octets déclenchent toujours un appel mmap() refusé" [ref=e1009]
                          - generic [ref=e1011]: Parce que 64 octets déclenchent toujours un appel mmap() refusé
                      - generic [ref=e1012]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e1013]:
                    - generic [ref=e1014]:
                      - generic [ref=e1015]:
                        - generic [ref=e1016]: Exercice 13 · Inspection de schéma
                        - button "Afficher un indice" [ref=e1017] [cursor=pointer]
                      - 'heading "Dans l''anatomie d''un chunk sur le tas (VIS-04), identifiez la zone que `malloc()` garde invisible juste avant l''adresse retournée au code utilisateur." [level=3] [ref=e1021]'
                      - paragraph [ref=e1022]: Structure interne d'un chunk alloué sur le tas — Sélectionnez la zone contenant la taille du chunk et les bits A|M|P.
                    - generic [ref=e1023]:
                      - group "Structure interne d'un chunk alloué sur le tas" [ref=e1024]:
                        - generic [ref=e1026]:
                          - generic [ref=e1027] [cursor=pointer]:
                            - radio "0x602000 · 8 octets Zone En-tête [addr - 8] Taille alignée + drapeaux A|M|P" [ref=e1028]
                            - generic [ref=e1029]:
                              - generic [ref=e1030]: 0x602000 · 8 octets
                              - generic [ref=e1031]: Zone
                            - generic [ref=e1032]: En-tête [addr - 8]
                            - generic [ref=e1033]: Taille alignée + drapeaux A|M|P
                          - generic [ref=e1034] [cursor=pointer]:
                            - radio "0x602008 · N octets Zone Payload utilisateur [addr] Adresse retournée par malloc()" [ref=e1035]
                            - generic [ref=e1036]:
                              - generic [ref=e1037]: 0x602008 · N octets
                              - generic [ref=e1038]: Zone
                            - generic [ref=e1039]: Payload utilisateur [addr]
                            - generic [ref=e1040]: Adresse retournée par malloc()
                          - generic [ref=e1041] [cursor=pointer]:
                            - 'radio "0x7FFF0FD0 · 8 octets Zone Pointeur sur la pile Variable locale `void *p`" [ref=e1042]'
                            - generic [ref=e1043]:
                              - generic [ref=e1044]: 0x7FFF0FD0 · 8 octets
                              - generic [ref=e1045]: Zone
                            - generic [ref=e1046]: Pointeur sur la pile
                            - generic [ref=e1047]: "Variable locale `void *p`"
                      - generic [ref=e1048]:
                        - button "Vérifier ma réponse" [disabled]
              - generic [ref=e1049]:
                - heading "À emporter" [level=3] [ref=e1050]
                - paragraph [ref=e1051]: "Réserver, utiliser, libérer : ces trois moments définissent la durée de vie d’un bloc. Une zone libérée peut être réutilisée sans que les anciens pointeurs soient informés."
            - region "Qui décide de la durée de vie ?" [ref=e1052]:
              - generic [ref=e1053]:
                - paragraph [ref=e1054]: Chapitre 6 sur 6 · 55 min environ
                - heading "Qui décide de la durée de vie ?" [level=2] [ref=e1055]
                - paragraph [ref=e1056]: Les langages résolvent-ils tous la gestion mémoire de la même façon ?
              - generic [ref=e1057]:
                - heading "L’idée en clair" [level=3] [ref=e1058]
                - paragraph [ref=e1059]: Non. En C, le programmeur gère explicitement de nombreuses libérations. En Rust, les règles de possession encadrent les usages et la libération des valeurs. Un ramasse-miettes traçant repère les objets encore accessibles et peut récupérer les autres plus tard.
              - generic [ref=e1060]:
                - heading "Un exemple, pas à pas" [level=3] [ref=e1061]
                - paragraph [ref=e1062]: "Supposons qu’une valeur passe d’une variable à une autre. Dans le scénario Rust montré, un déplacement transfère la possession : l’ancien nom ne peut plus être utilisé. Le scénario C laisse la responsabilité au programmeur. Le modèle avec ramasse-miettes suit les références encore accessibles."
              - generic [ref=e1063]: À vous d’expérimenter
              - paragraph [ref=e1066]: Lancez le scénario « Use after move » et comparez le moment où chaque modèle accepte ou refuse l’opération. Distinguez un refus à la compilation d’un problème observé pendant l’exécution.
              - generic "Comparateur VIS-05 Gestion manuelle C, Ownership Rust et GC traçant" [ref=e1067]:
                - generic [ref=e1068]:
                  - generic [ref=e1069]:
                    - 'heading "VIS-05 · Comparateur de modèles mémoire : Manuel C vs Ownership Rust vs GC traçant" [level=3] [ref=e1076]'
                    - generic [ref=e1077]: t = 0 / 6 · Initialisation
                  - paragraph [ref=e1078]:
                    - text: "Même scénario métier, trois philosophies d'ingénierie : responsabilité manuelle à l'exécution, preuve statique à la compilation ("
                    - code [ref=e1079]: borrow checker
                    - text: ), ou traçage périodique depuis les racines (
                    - code [ref=e1080]: GC Roots
                    - text: ).
                  - generic [ref=e1081]:
                    - button "Cycle nominal" [ref=e1082] [cursor=pointer]
                    - button "Oubli de free() / Réf. circulaire" [ref=e1083] [cursor=pointer]
                    - button "Réutilisation après libération / Move" [ref=e1084] [cursor=pointer]
                    - 'button "Fréquence GC : Agressif (t=4)" [ref=e1085] [cursor=pointer]'
                  - generic [ref=e1086]:
                    - button "Précédent" [disabled]
                    - button "Suivant" [ref=e1087] [cursor=pointer]
                    - button "Début" [ref=e1090] [cursor=pointer]
                    - generic [ref=e1094]:
                      - generic [ref=e1095]: Timeline
                      - slider "Position temporelle dans la comparaison" [ref=e1096]: "0"
                - generic [ref=e1097]:
                  - generic [ref=e1098]:
                    - generic [ref=e1099]:
                      - generic [ref=e1100]:
                        - generic [ref=e1101]:
                          - heading "Manuel (C)" [level=4] [ref=e1102]
                          - generic [ref=e1103]: Initial
                        - generic [ref=e1104]:
                          - generic [ref=e1105]: "Pile : (hors portée)"
                          - generic [ref=e1106]: "Tas : Vide"
                        - paragraph [ref=e1107]: Prêt.
                      - generic [ref=e1108]: "Occupation RAM simulée : 0%"
                    - generic [ref=e1109]:
                      - generic [ref=e1110]:
                        - generic [ref=e1111]:
                          - heading "Ownership / RAII (Rust)" [level=4] [ref=e1112]
                          - generic [ref=e1113]: Initial
                        - generic [ref=e1114]:
                          - generic [ref=e1115]: "Pile : (portée fermée)"
                          - generic [ref=e1116]: "Tas : Vide"
                        - paragraph [ref=e1117]: Prêt.
                      - generic [ref=e1118]: "Occupation RAM simulée : 0%"
                    - generic [ref=e1119]:
                      - generic [ref=e1120]:
                        - generic [ref=e1121]:
                          - heading "GC Traçant (.NET / JVM)" [level=4] [ref=e1122]
                          - generic [ref=e1123]: Initial
                        - generic [ref=e1124]:
                          - generic [ref=e1125]: "Pile : 0 racine"
                          - generic [ref=e1126]: "Tas : Vide"
                        - paragraph [ref=e1127]: Prêt.
                      - generic [ref=e1128]: "Occupation RAM simulée : 0%"
                  - generic [ref=e1129]:
                    - generic [ref=e1130]:
                      - generic [ref=e1131]: Empreinte RAM comparative à t = 0
                      - generic [ref=e1132]: "GC Roots actifs : 0"
                    - 'img "Empreinte RAM à t=0 : C 0%, Rust 0%, GC 0%" [ref=e1133]':
                      - generic [ref=e1134]:
                        - generic [ref=e1135]: Manuel C
                        - generic [ref=e1137]: 0% (freed)
                      - generic [ref=e1138]:
                        - generic [ref=e1139]: Rust RAII
                        - generic [ref=e1141]: 0% (freed)
                      - generic [ref=e1142]:
                        - generic [ref=e1143]: GC Traçant
                        - generic [ref=e1145]: 0% (freed)
                  - generic [ref=e1146]: "Analyse comparative : Comparez à chaque instant la durée d'occupation RAM et les garanties de sûreté des trois paradigmes."
                  - status [ref=e1147]:
                    - heading "Nuance d'architecture" [level=4] [ref=e1150]
                    - generic [ref=e1151]:
                      - text: En production,
                      - code [ref=e1152]: unsafe
                      - text: en Rust contourne le borrow checker, un GC générationnel ne balaie la majorité des objets courts qu'en Gen0, et le comptage de références pur (sans collecteur de cycles) fuit sur
                      - code [ref=e1153]: A <-> B
                      - text: contrairement au GC traçant montré ici.
              - generic [ref=e1154]:
                - generic [ref=e1155]:
                  - heading [level=3] [ref=e1156]:
                    - text: "Trace réelle comparée : compilateur ("
                    - code [ref=e1159]: "-O0"
                    - text: vs
                    - code [ref=e1160]: "-O2"
                    - text: ) & GDB
                  - paragraph [ref=e1161]: Comparez l'image pédagogique (trame complète en RAM) avec la réalité d'un binaire optimisé observée dans Compiler Explorer / GDB en lecture seule.
                - generic [ref=e1162]:
                  - generic [ref=e1163]:
                    - generic [ref=e1164]: Sans optimisation (gcc -O0)
                    - generic [ref=e1165]: "sub rsp, 16 mov DWORD PTR [rbp-4], 42 ; variable locale stockée sur la pile mov eax, DWORD PTR [rbp-4] ; relue depuis la RAM (gdb) x/4bx $rbp-4 0x7fffffffe3fc: 0x2a 0x00 0x00 0x00 ; little-endian"
                  - generic [ref=e1166]:
                    - generic [ref=e1167]: Optimisé (gcc -O2)
                    - generic [ref=e1168]: mov eax, 42 ; constante pliée directement en registre ret ; aucune trame pile ni adresse &x en RAM ! ; Si vous prenez &x en C mais provoquez un UB, le compilateur peut même ; supprimer une branche jugée impossible.
              - group [ref=e1169]:
                - generic "Ce que ce modèle simplifie" [ref=e1170] [cursor=pointer]
              - generic [ref=e1171]:
                - heading "Faites le point" [level=3] [ref=e1172]
                - paragraph [ref=e1176]: Essayez d’expliquer votre choix avant de le vérifier. Les indices sont là si vous bloquez.
                - generic [ref=e1177]:
                  - generic [ref=e1178]:
                    - generic [ref=e1179]:
                      - generic [ref=e1180]:
                        - generic [ref=e1181]: Exercice 14 · Compréhension
                        - button "Afficher un indice" [ref=e1182] [cursor=pointer]
                      - 'heading "Quel mécanisme exact transforme un `free(user)` suivi d''un `malloc()` de même taille pour `admin` en faille Use-After-Free critique ?" [level=3] [ref=e1186]'
                    - generic [ref=e1187]:
                      - 'group "Quel mécanisme exact transforme un `free(user)` suivi d''un `malloc()` de même taille pour `admin` en faille Use-After-Free critique ?" [ref=e1188]':
                        - generic [ref=e1190] [cursor=pointer]:
                          - 'radio "L''allocateur recycle le même chunk libre pour `admin` à la même adresse ; l''ancien pointeur `user` devient un alias actif sur l''objet `admin`" [ref=e1191]'
                          - generic [ref=e1193]: "L'allocateur recycle le même chunk libre pour `admin` à la même adresse ; l'ancien pointeur `user` devient un alias actif sur l'objet `admin`"
                        - generic [ref=e1194] [cursor=pointer]:
                          - 'radio "`free(user)` met automatiquement `user = NULL` partout en RAM" [ref=e1195]'
                          - generic [ref=e1197]: "`free(user)` met automatiquement `user = NULL` partout en RAM"
                        - generic [ref=e1198] [cursor=pointer]:
                          - radio "Le noyau change les permissions de l'ancien chunk en lecture seule" [ref=e1199]
                          - generic [ref=e1201]: Le noyau change les permissions de l'ancien chunk en lecture seule
                      - generic [ref=e1202]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e1203]:
                    - generic [ref=e1204]:
                      - generic [ref=e1205]:
                        - generic [ref=e1206]: Exercice 15 · Compréhension
                        - button "Afficher un indice" [ref=e1207] [cursor=pointer]
                      - heading "Dans le scénario 'Réutilisation après Move / Libération' de VIS-05, comment Rust empêche-t-il le Use-After-Free comparé au C ?" [level=3] [ref=e1211]
                    - generic [ref=e1212]:
                      - group "Dans le scénario 'Réutilisation après Move / Libération' de VIS-05, comment Rust empêche-t-il le Use-After-Free comparé au C ?" [ref=e1213]:
                        - generic [ref=e1215] [cursor=pointer]:
                          - radio "Le borrow checker bloque la compilation dès qu'une référence tente d'utiliser une ressource après transfert de propriété ou destruction" [ref=e1216]
                          - generic [ref=e1218]: Le borrow checker bloque la compilation dès qu'une référence tente d'utiliser une ressource après transfert de propriété ou destruction
                        - generic [ref=e1219] [cursor=pointer]:
                          - radio "Rust lance un garbage collector traçant en arrière-plan toutes les 10 ms" [ref=e1220]
                          - generic [ref=e1222]: Rust lance un garbage collector traçant en arrière-plan toutes les 10 ms
                        - generic [ref=e1223] [cursor=pointer]:
                          - radio "Rust interdit totalement d'allouer sur le tas" [ref=e1224]
                          - generic [ref=e1226]: Rust interdit totalement d'allouer sur le tas
                      - generic [ref=e1227]:
                        - button "Vérifier ma réponse" [disabled]
                  - generic [ref=e1228]:
                    - generic [ref=e1229]:
                      - generic [ref=e1230]:
                        - generic [ref=e1231]: Exercice 16 · Compréhension
                        - button "Afficher un indice" [ref=e1232] [cursor=pointer]
                      - 'heading "En observant la comparaison `-O0` vs `-O2`, pourquoi une variable locale simple peut-elle ne posséder aucune adresse RAM dans le binaire optimisé ?" [level=3] [ref=e1236]'
                    - generic [ref=e1237]:
                      - 'group "En observant la comparaison `-O0` vs `-O2`, pourquoi une variable locale simple peut-elle ne posséder aucune adresse RAM dans le binaire optimisé ?" [ref=e1238]':
                        - generic [ref=e1240] [cursor=pointer]:
                          - 'radio "Le compilateur la promeut directement en registre CPU (ex. `eax`) ou la plie en constante tant que son adresse `&x` n''est pas exposée" [ref=e1241]'
                          - generic [ref=e1243]: "Le compilateur la promeut directement en registre CPU (ex. `eax`) ou la plie en constante tant que son adresse `&x` n'est pas exposée"
                        - generic [ref=e1244] [cursor=pointer]:
                          - 'radio "Le compilateur `-O2` déplace toutes les locales vers le segment `.bss`" [ref=e1245]'
                          - generic [ref=e1247]: "Le compilateur `-O2` déplace toutes les locales vers le segment `.bss`"
                        - generic [ref=e1248] [cursor=pointer]:
                          - 'radio "Parce que le tas remplace entièrement la pile sous `-O2`" [ref=e1249]'
                          - generic [ref=e1251]: "Parce que le tas remplace entièrement la pile sous `-O2`"
                      - generic [ref=e1252]:
                        - button "Vérifier ma réponse" [disabled]
              - generic [ref=e1253]:
                - heading "À emporter" [level=3] [ref=e1254]
                - paragraph [ref=e1255]: Chaque modèle fixe des règles différentes pour savoir qui peut utiliser une valeur et quand sa mémoire peut être récupérée. Le code optimisé peut aussi différer fortement de notre dessin pédagogique.
          - region "Évaluations cumulatives par module" [ref=e1257]:
            - generic [ref=e1258]:
              - generic [ref=e1259]:
                - heading "Évaluations cumulatives par module" [level=2] [ref=e1260]
                - paragraph [ref=e1261]: Les seuils de maîtrise sont calculés dynamiquement à partir de vos réponses validées aux exercices correspondants.
              - generic [ref=e1262]: 4 jalon(s) cumulatifs
            - generic [ref=e1267]:
              - generic [ref=e1268]:
                - generic [ref=e1269]:
                  - generic [ref=e1270]:
                    - heading "Palier 1 · Exécution CPU, octet & segments virtuels" [level=3] [ref=e1271]
                    - generic [ref=e1272]: 0 / 6 traités
                  - paragraph [ref=e1273]: "Seuil requis : 75% · 0 / 6 réponse(s) exacte(s)"
                - generic [ref=e1274]:
                  - 'progressbar "Score de Palier 1 · Exécution CPU, octet & segments virtuels : 0%" [ref=e1275]'
                  - generic [ref=e1276]:
                    - generic [ref=e1277]: cpu-fetch-decode-execute
                    - generic [ref=e1278]: memory-addressing-and-bytes
                    - generic [ref=e1279]: virtual-vs-physical-memory
                    - generic [ref=e1280]: process-memory-segments
                  - list [ref=e1281]:
                    - listitem [ref=e1282]:
                      - link "À quel instant précis le processeur utilise-t-il le registre PC (RIP sur x86-64) pour savoir quelle opération exécuter ensuite ? En attente" [ref=e1283] [cursor=pointer]:
                        - /url: "#exercise-ex-mem-01"
                        - generic [ref=e1284]: À quel instant précis le processeur utilise-t-il le registre PC (RIP sur x86-64) pour savoir quelle opération exécuter ensuite ?
                        - generic [ref=e1285]: En attente
                    - listitem [ref=e1286]:
                      - link "Dans VIS-01, quel octet est lu à l'adresse 0x1008 après l'écriture little-endian de l'entier 32 bits 0x12345678 à partir de 0x1008 ? En attente" [ref=e1287] [cursor=pointer]:
                        - /url: "#exercise-ex-mem-02"
                        - generic [ref=e1288]: Dans VIS-01, quel octet est lu à l'adresse 0x1008 après l'écriture little-endian de l'entier 32 bits 0x12345678 à partir de 0x1008 ?
                        - generic [ref=e1289]: En attente
                    - listitem [ref=e1290]:
                      - link "Remettez dans l'ordre chronologique les étapes d'exécution d'une instruction séquentielle dans le processeur. En attente" [ref=e1291] [cursor=pointer]:
                        - /url: "#exercise-ex-mem-03"
                        - generic [ref=e1292]: Remettez dans l'ordre chronologique les étapes d'exécution d'une instruction séquentielle dans le processeur.
                        - generic [ref=e1293]: En attente
                    - listitem [ref=e1294]:
                      - link "Deux processus P1 et P2 accèdent chacun à l'adresse virtuelle 0x401000. Pourquoi P1 n'écrase-t-il pas les données de P2 ? En attente" [ref=e1295] [cursor=pointer]:
                        - /url: "#exercise-ex-mem-04"
                        - generic [ref=e1296]: Deux processus P1 et P2 accèdent chacun à l'adresse virtuelle 0x401000. Pourquoi P1 n'écrase-t-il pas les données de P2 ?
                        - generic [ref=e1297]: En attente
                    - listitem [ref=e1298]:
                      - link "Que déclenche matériellement le CPU + OS lorsqu'un bug tente d'écrire un octet dans le segment Text (.text, permissions r-x) ? En attente" [ref=e1299] [cursor=pointer]:
                        - /url: "#exercise-ex-mem-05"
                        - generic [ref=e1300]: Que déclenche matériellement le CPU + OS lorsqu'un bug tente d'écrire un octet dans le segment Text (.text, permissions r-x) ?
                        - generic [ref=e1301]: En attente
                    - listitem [ref=e1302]:
                      - 'link "Pointez sur le schéma la zone mémoire exacte où est stockée une variable globale initialisée `static int port = 443;`. En attente" [ref=e1303] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-06"
                        - generic [ref=e1304]: "Pointez sur le schéma la zone mémoire exacte où est stockée une variable globale initialisée `static int port = 443;`."
                        - generic [ref=e1305]: En attente
              - generic [ref=e1306]:
                - generic [ref=e1307]:
                  - generic [ref=e1308]:
                    - heading "Palier 2 · Variables, Pile, ABI & Pointeurs pendants" [level=3] [ref=e1309]
                    - generic [ref=e1310]: 0 / 5 traités
                  - paragraph [ref=e1311]: "Seuil requis : 75% · 0 / 5 réponse(s) exacte(s)"
                - generic [ref=e1312]:
                  - 'progressbar "Score de Palier 2 · Variables, Pile, ABI & Pointeurs pendants : 0%" [ref=e1313]'
                  - generic [ref=e1314]:
                    - generic [ref=e1315]: variable-value-vs-address-and-type
                    - generic [ref=e1316]: call-stack-and-frames
                    - generic [ref=e1317]: function-prologue-epilogue-and-abi
                    - generic [ref=e1318]: pointers-and-dereferencing
                    - generic [ref=e1319]: stack-dangling-pointers-and-overflow
                  - list [ref=e1320]:
                    - listitem [ref=e1321]:
                      - 'link "Ordonnez la séquence exacte de création d''une trame d''activation lors d''un appel `f()` sur x86-64 (System V ABI). En attente" [ref=e1322] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-07"
                        - generic [ref=e1323]: "Ordonnez la séquence exacte de création d'une trame d'activation lors d'un appel `f()` sur x86-64 (System V ABI)."
                        - generic [ref=e1324]: En attente
                    - listitem [ref=e1325]:
                      - 'link "Lorsqu''une fonction se termine par `ret` sans écraser explicitement ses variables locales, que contiennent les octets de son ancienne trame en RAM ? En attente" [ref=e1326] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-08"
                        - generic [ref=e1327]: "Lorsqu'une fonction se termine par `ret` sans écraser explicitement ses variables locales, que contiennent les octets de son ancienne trame en RAM ?"
                        - generic [ref=e1328]: En attente
                    - listitem [ref=e1329]:
                      - 'link "Soient `int a = 10; int *p = &a; *p = 25;`. Que désigne précisément `*p` ? En attente" [ref=e1330] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-09"
                        - generic [ref=e1331]: "Soient `int a = 10; int *p = &a; *p = 25;`. Que désigne précisément `*p` ?"
                        - generic [ref=e1332]: En attente
                    - listitem [ref=e1333]:
                      - 'link "Une fonction `bad_ptr()` retourne l''adresse `&secret` de sa variable locale sur la pile, puis `other()` est appelée. Que lit `*p` ? En attente" [ref=e1334] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-10"
                        - generic [ref=e1335]: "Une fonction `bad_ptr()` retourne l'adresse `&secret` de sa variable locale sur la pile, puis `other()` est appelée. Que lit `*p` ?"
                        - generic [ref=e1336]: En attente
                    - listitem [ref=e1337]:
                      - 'link "Identifiez sur le schéma de trame x86-64 l''emplacement contenant l''adresse de retour empilée par `CALL`. En attente" [ref=e1338] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-11"
                        - generic [ref=e1339]: "Identifiez sur le schéma de trame x86-64 l'emplacement contenant l'adresse de retour empilée par `CALL`."
                        - generic [ref=e1340]: En attente
              - generic [ref=e1341]:
                - generic [ref=e1342]:
                  - generic [ref=e1343]:
                    - heading "Palier 3 · Tas, Allocateur & Sûreté dynamique" [level=3] [ref=e1344]
                    - generic [ref=e1345]: 0 / 3 traités
                  - paragraph [ref=e1346]: "Seuil requis : 75% · 0 / 3 réponse(s) exacte(s)"
                - generic [ref=e1347]:
                  - 'progressbar "Score de Palier 3 · Tas, Allocateur & Sûreté dynamique : 0%" [ref=e1348]'
                  - generic [ref=e1349]:
                    - generic [ref=e1350]: heap-allocation-and-lifetime
                    - generic [ref=e1351]: allocator-chunks-bins-and-fragmentation
                    - generic [ref=e1352]: heap-corruption-uaf-and-leaks
                  - list [ref=e1353]:
                    - listitem [ref=e1354]:
                      - 'link "Pourquoi un appel `malloc(64)` échoue-t-il alors que l''arène dispose encore de 96 octets libres au total dans le scénario ''Fragmentation externe'' de VIS-04 ? En attente" [ref=e1355] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-12"
                        - generic [ref=e1356]: "Pourquoi un appel `malloc(64)` échoue-t-il alors que l'arène dispose encore de 96 octets libres au total dans le scénario 'Fragmentation externe' de VIS-04 ?"
                        - generic [ref=e1357]: En attente
                    - listitem [ref=e1358]:
                      - 'link "Dans l''anatomie d''un chunk sur le tas (VIS-04), identifiez la zone que `malloc()` garde invisible juste avant l''adresse retournée au code utilisateur. En attente" [ref=e1359] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-13"
                        - generic [ref=e1360]: "Dans l'anatomie d'un chunk sur le tas (VIS-04), identifiez la zone que `malloc()` garde invisible juste avant l'adresse retournée au code utilisateur."
                        - generic [ref=e1361]: En attente
                    - listitem [ref=e1362]:
                      - 'link "Quel mécanisme exact transforme un `free(user)` suivi d''un `malloc()` de même taille pour `admin` en faille Use-After-Free critique ? En attente" [ref=e1363] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-14"
                        - generic [ref=e1364]: "Quel mécanisme exact transforme un `free(user)` suivi d'un `malloc()` de même taille pour `admin` en faille Use-After-Free critique ?"
                        - generic [ref=e1365]: En attente
              - generic [ref=e1366]:
                - generic [ref=e1367]:
                  - generic [ref=e1368]:
                    - heading "Palier 4 · Modèles C/Rust/GC & réalité matériel/compilateur" [level=3] [ref=e1369]
                    - generic [ref=e1370]: 0 / 2 traités
                  - paragraph [ref=e1371]: "Seuil requis : 75% · 0 / 2 réponse(s) exacte(s)"
                - generic [ref=e1372]:
                  - 'progressbar "Score de Palier 4 · Modèles C/Rust/GC & réalité matériel/compilateur : 0%" [ref=e1373]'
                  - generic [ref=e1374]:
                    - generic [ref=e1375]: manual-vs-raii-vs-gc
                    - generic [ref=e1376]: compiler-optimizations-and-memory-reality
                  - list [ref=e1377]:
                    - listitem [ref=e1378]:
                      - link "Dans le scénario 'Réutilisation après Move / Libération' de VIS-05, comment Rust empêche-t-il le Use-After-Free comparé au C ? En attente" [ref=e1379] [cursor=pointer]:
                        - /url: "#exercise-ex-mem-15"
                        - generic [ref=e1380]: Dans le scénario 'Réutilisation après Move / Libération' de VIS-05, comment Rust empêche-t-il le Use-After-Free comparé au C ?
                        - generic [ref=e1381]: En attente
                    - listitem [ref=e1382]:
                      - 'link "En observant la comparaison `-O0` vs `-O2`, pourquoi une variable locale simple peut-elle ne posséder aucune adresse RAM dans le binaire optimisé ? En attente" [ref=e1383] [cursor=pointer]':
                        - /url: "#exercise-ex-mem-16"
                        - generic [ref=e1384]: "En observant la comparaison `-O0` vs `-O2`, pourquoi une variable locale simple peut-elle ne posséder aucune adresse RAM dans le binaire optimisé ?"
                        - generic [ref=e1385]: En attente
      - group [ref=e1386]:
        - 'generic "Pour aller plus loin : sources et laboratoires +" [ref=e1387] [cursor=pointer]'
  - contentinfo [ref=e1388]:
    - link "cyberschool ." [ref=e1389] [cursor=pointer]:
      - /url: /
      - text: cyberschool
      - generic [ref=e1390]: .
    - paragraph [ref=e1391]: Comprendre ce qui se passe sous la surface.
    - link "Retour aux cours" [ref=e1392] [cursor=pointer]:
      - /url: /#courses
  - button "Open Next.js Dev Tools" [ref=e1401] [cursor=pointer]
  - alert [ref=e1405]: Dans la mémoire d’un programme
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Program Memory Fundamentals interactive course", () => {
  4   |   test("navigates from home, exercises all 5 simulators, checks reduced-motion and assessments", async ({
  5   |     page,
  6   |   }) => {
  7   |     const consoleErrors: string[] = [];
  8   |     const pageErrors: string[] = [];
  9   | 
  10  |     page.on("console", (msg) => {
  11  |       if (msg.type() === "error") consoleErrors.push(msg.text());
  12  |     });
  13  |     page.on("pageerror", (err) => {
  14  |       pageErrors.push(err.message);
  15  |     });
  16  | 
  17  |     await page.emulateMedia({ reducedMotion: "reduce" });
  18  | 
  19  |     // 1. Navigate from Home -> Course
  20  |     const res = await page.goto("/");
  21  |     expect(res?.status()).toBe(200);
  22  |     await page.getByTestId("home-lesson-link-program-memory-fundamentals").click();
  23  |     await expect(page).toHaveURL(/\/lessons\/program-memory-fundamentals/);
  24  |     await expect(page.getByTestId("memory-course-experience")).toBeVisible();
  25  |     await expect(page.getByTestId("vis-02-virtual-memory")).toHaveCount(0);
  26  |     await page.getByTestId("chapter-filter-all").click();
  27  | 
  28  |     // Verify no desktop horizontal overflow
  29  |     const desktopOverflow = await page.evaluate(
  30  |       () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  31  |     );
> 32  |     expect(desktopOverflow).toBe(false);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  33  | 
  34  |     // 2. VIS-01: Step forward through CPU execution & observe little-endian bytes 78 56 34 12
  35  |     const vis01 = page.getByTestId("vis-01-cpu-memory");
  36  |     await expect(vis01).toBeVisible();
  37  |     await page.getByTestId("vis01-next-step").click();
  38  |     await expect(page.getByTestId("vis01-phase-badge")).not.toHaveText("");
  39  |     // Step to write completion (total steps ~ 8 in default write preset; press ArrowRight until little-endian 0x1008 updates)
  40  |     await vis01.focus();
  41  |     for (let i = 0; i < 10; i++) {
  42  |       await page.keyboard.press("ArrowRight");
  43  |     }
  44  |     await expect(page.getByTestId("vis01-byte-0x1008")).toContainText("78");
  45  | 
  46  |     // 3. VIS-02: Trigger SIGSEGV when writing into .text
  47  |     await expect(page.getByTestId("vis-02-virtual-memory")).toBeVisible();
  48  |     await page.getByTestId("vis02-action-write-text").click();
  49  |     await expect(page.getByTestId("vis02-outcome-badge")).toContainText(/SIGSEGV/i);
  50  | 
  51  |     // 4. VIS-03: Switch to Dangling Pointer scenario and step until overwrite hazard appears
  52  |     await expect(page.getByTestId("vis-03-call-stack")).toBeVisible();
  53  |     await page.getByTestId("vis03-tab-dangling-pointer").click();
  54  |     for (let i = 0; i < 6; i++) {
  55  |       const nextBtn = page.getByTestId("vis03-next-step");
  56  |       if (await nextBtn.isEnabled()) {
  57  |         await nextBtn.click();
  58  |       }
  59  |     }
  60  |     await expect(page.getByTestId("vis03-hazard-badge")).not.toContainText("Fonction :");
  61  | 
  62  |     // 5. VIS-04: Load Use-After-Free preset and verify hazard + SVG chart
  63  |     await expect(page.getByTestId("vis-04-heap-allocator")).toBeVisible();
  64  |     await page.getByTestId("vis04-preset-use-after-free").click();
  65  |     await expect(page.getByTestId("vis04-hazard-badge")).toContainText(/Use-After-Free/i);
  66  |     await expect(page.getByTestId("vis04-svg-chart")).toBeVisible();
  67  | 
  68  |     // 6. VIS-05: Compare use-after-move across C / Rust / GC and inspect Rust compile-blocked
  69  |     await expect(page.getByTestId("vis-05-memory-models")).toBeVisible();
  70  |     await page.getByTestId("vis05-scenario-use-after-move").click();
  71  |     for (let i = 0; i < 4; i++) {
  72  |       await page.getByTestId("vis05-next-step").click();
  73  |     }
  74  |     await expect(page.getByTestId("vis05-status-rust-raii")).toContainText(
  75  |       /Refusé à la compilation/i,
  76  |     );
  77  |     await expect(page.getByTestId("vis05-svg-chart")).toBeVisible();
  78  | 
  79  |     // 7. Complete representative exercises (MC, state-prediction, diagram-probe) & check AssessmentRunner
  80  |     // EX-01 (multiple-choice)
  81  |     const ex01 = page.getByTestId("exercise-card-ex-mem-01");
  82  |     await ex01.scrollIntoViewIfNeeded();
  83  |     await ex01.getByText(/Pendant la phase Fetch/i).click();
  84  |     await ex01.getByRole("button", { name: /Vérifier/i }).click();
  85  |     await expect(ex01.getByRole("heading", { name: "Raisonnement exact" })).toBeVisible();
  86  | 
  87  |     // EX-02 (state-prediction)
  88  |     const ex02 = page.getByTestId("exercise-card-ex-mem-02");
  89  |     await ex02.getByText(/0x78 à 0x1008/i).click();
  90  |     await ex02.getByRole("button", { name: /Vérifier/i }).click();
  91  | 
  92  |     // EX-06 (diagram-probe)
  93  |     const ex06 = page.getByTestId("exercise-card-ex-mem-06");
  94  |     await ex06.getByText(/Segment Data \(\.data\)/i).click();
  95  |     await ex06.getByRole("button", { name: /Vérifier/i }).click();
  96  |     await expect(ex06.getByRole("heading", { name: "Raisonnement exact" })).toBeVisible();
  97  | 
  98  |     // Verify AssessmentRunner updates dynamically
  99  |     await expect(page.getByTestId("assessment-card-eval-mem-01-execution-segments")).toContainText(
  100 |       /3 \/ 6 traités/,
  101 |     );
  102 | 
  103 |     // 8. Check GDB -O0 vs -O2 card & chapter filter
  104 |     await expect(page.getByTestId("gdb-compiler-reality-card")).toBeVisible();
  105 |     await page.getByTestId("chapter-filter-step-cpu-bytes").click();
  106 |     await expect(page.getByTestId("vis-01-cpu-memory")).toBeVisible();
  107 |     await expect(page.getByTestId("vis-02-virtual-memory")).toHaveCount(0);
  108 |     await page.getByTestId("chapter-filter-all").click();
  109 |     await expect(page.getByTestId("vis-02-virtual-memory")).toBeVisible();
  110 | 
  111 |     // 9. Verify 375x812 responsive mobile viewport without horizontal overflow
  112 |     await page.setViewportSize({ width: 375, height: 812 });
  113 |     const mobileOverflow = await page.evaluate(
  114 |       () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  115 |     );
  116 |     expect(mobileOverflow).toBe(false);
  117 | 
  118 |     expect(consoleErrors).toEqual([]);
  119 |     expect(pageErrors).toEqual([]);
  120 |   });
  121 | });
  122 | 
```