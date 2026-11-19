"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@cyber-school/ui";

interface SensorBoundaryDiagramProps {
  activeCueId?: string;
  activeCueIndex?: number;
  isPlaying?: boolean;
}

type UpstreamSource = "human" | "cron" | "intruder";

export function SensorBoundaryDiagram({
  activeCueId,
  activeCueIndex = 0,
  isPlaying = false,
}: SensorBoundaryDiagramProps) {
  const [selectedSource, setSelectedSource] = useState<UpstreamSource>("cron");
  const [packetProgress, setPacketProgress] = useState<number>(100);
  const [isInspectingPacket, setIsInspectingPacket] = useState<boolean>(false);

  // Synchronisation avec la narration
  const isBoundaryActive = Boolean(
    activeCueId?.startsWith("ch2-s2") ||
    activeCueId?.startsWith("ch2-s6") ||
    activeCueId?.startsWith("ch2-cue-6") ||
    activeCueId?.startsWith("ch2-cue-7") ||
    activeCueId?.startsWith("ch2-cue-8") ||
    activeCueIndex === 1 ||
    activeCueIndex === 5,
  );
  const isFiveFieldsActive = Boolean(
    activeCueId?.startsWith("ch2-s1") ||
    activeCueId?.startsWith("ch2-s5") ||
    activeCueId?.startsWith("ch2-cue-9") ||
    activeCueId?.startsWith("ch2-cue-10") ||
    activeCueIndex === 0 ||
    activeCueIndex === 4,
  );
  const isInvarianceActive = Boolean(
    activeCueId?.startsWith("ch2-s2") ||
    activeCueId?.startsWith("ch2-s6") ||
    activeCueId?.startsWith("ch2-cue-12") ||
    activeCueId?.startsWith("ch2-cue-13") ||
    activeCueId?.startsWith("ch2-cue-15") ||
    activeCueIndex === 5,
  );

  // Animation continue du paquet lors de la lecture (respecte prefers-reduced-motion)
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isPlaying || prefersReduced) return;
    const interval = setInterval(() => {
      setPacketProgress(0);
      let p = 0;
      const subTimer = setInterval(() => {
        p += 5;
        if (p >= 100) {
          setPacketProgress(100);
          clearInterval(subTimer);
        } else {
          setPacketProgress(p);
        }
      }, 35);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Alternance automatique des sources amont pendant la démonstration
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isInvarianceActive && isPlaying && !prefersReduced) {
      const interval = setInterval(() => {
        setSelectedSource((prev) =>
          prev === "human" ? "cron" : prev === "cron" ? "intruder" : "human",
        );
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isInvarianceActive, isPlaying]);

  const triggerPacket = (src: UpstreamSource) => {
    setSelectedSource(src);
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setPacketProgress(100);
      return;
    }
    setPacketProgress(0);
    const step = 5;
    const interval = setInterval(() => {
      setPacketProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + step;
      });
    }, 25);
  };

  const SOURCE_DATA = {
    human: {
      name: "Cas A · Erreur humaine (clavier sur 10.24.8.19)",
      ip: "10.24.8.19 (Hypothèse saisie manuelle)",
      reality: "Touche majuscule activée par erreur lors de la saisie.",
      icon: "👤",
    },
    cron: {
      name: "Cas B · Script automatique (Sauvegarde)",
      ip: "10.24.8.19 (Serveur en baie)",
      reality: "Tâche planifiée avec un mot de passe qui a expiré.",
      icon: "⚙️",
    },
    intruder: {
      name: "Cas C · Utilisateur non autorisé",
      ip: "10.24.8.19 (Session shell interne)",
      reality: "Tentative de connexion pour tester le compte.",
      icon: "🦹",
    },
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#233528] bg-[#0b120e] p-4 sm:p-6 shadow-2xl transition-all duration-500"
      data-testid="sensor-boundary-diagram"
    >
      {/* En-tête */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2b20] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#10b981] motion-safe:animate-pulse" />
          <h4 className="text-sm font-semibold tracking-wide text-[#e3ece5]">
            Schéma 2 · Le trajet réseau et les limites du serveur
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all",
              isPlaying
                ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                : "bg-muted/30 text-muted-foreground",
            )}
          >
            {isPlaying ? "Synchronisé avec la voix off" : "Testez les boutons"}
          </span>
        </div>
      </div>

      {/* Boutons d'action simples */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#8ea394]">
          Choisissez la cause au départ :
        </span>
        {(["human", "cron", "intruder"] as const).map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => triggerPacket(src)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              selectedSource === src
                ? "bg-[#10b981] text-black font-semibold shadow-md shadow-[#10b981]/20"
                : "bg-[#141d17] text-[#c2d3c6] border border-[#233528] hover:bg-[#1a261f]",
            )}
          >
            <span>{SOURCE_DATA[src].icon}</span>
            <span>
              {src === "human"
                ? "1. Erreur humaine"
                : src === "cron"
                  ? "2. Script automatique"
                  : "3. Tentative suspecte"}
            </span>
          </button>
        ))}
      </div>

      {/* SVG Vectoriel Réactif avec Géométrie Parfaite */}
      <div className="relative w-full aspect-[1000/500] max-h-[500px]">
        <svg
          viewBox="0 0 1000 500"
          className="h-full w-full select-none"
          aria-label="Trajet du paquet et frontière du serveur"
        >
          <defs>
            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>

            <filter id="boundaryGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="packetGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. ZONE GAUCHE : L'UTILISATEUR OU LA MACHINE ÉMETTRICE (x=16..266) */}
          <g id="upstream-zone">
            <rect
              x="16"
              y="16"
              width="250"
              height="468"
              rx="12"
              fill="#101713"
              stroke="#223326"
              strokeWidth="1.5"
            />
            <text x="32" y="44" fill="#a7f3d0" fontSize="12" fontWeight="bold">
              CE QUI SE PASSE EN AMONT
            </text>
            <text x="32" y="60" fill="#94a3b8" fontSize="9.5">
              Invisible depuis le serveur cible
            </text>

            {/* Source A : Salariée */}
            <g
              transform="translate(28, 76)"
              role="button"
              tabIndex={0}
              aria-label="Simuler une erreur humaine depuis la machine 10.24.8.19"
              className="cursor-pointer"
              onClick={() => triggerPacket("human")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  triggerPacket("human");
                }
              }}
            >
              <rect
                width="226"
                height="74"
                rx="8"
                fill={selectedSource === "human" ? "#132b20" : "#141c17"}
                stroke={selectedSource === "human" ? "#10b981" : "#223326"}
                strokeWidth={selectedSource === "human" ? "2" : "1"}
              />
              <text x="12" y="22" fill="#f1f5f9" fontSize="11" fontWeight="bold">
                👤 SAISIE MANUELLE (Hypothèse H1)
              </text>
              <text x="12" y="40" fill="#cbd5e1" fontSize="9.5">
                IP testée : 10.24.8.19
              </text>
              <text x="12" y="58" fill="#94a3b8" fontSize="9">
                Faute de frappe dans le mot de passe
              </text>
            </g>

            {/* Source B : Script automatique */}
            <g
              transform="translate(28, 160)"
              role="button"
              tabIndex={0}
              aria-label="Simuler le script automatique depuis le serveur de sauvegarde"
              className="cursor-pointer"
              onClick={() => triggerPacket("cron")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  triggerPacket("cron");
                }
              }}
            >
              <rect
                width="226"
                height="74"
                rx="8"
                fill={selectedSource === "cron" ? "#132b20" : "#141c17"}
                stroke={selectedSource === "cron" ? "#10b981" : "#223326"}
                strokeWidth={selectedSource === "cron" ? "2" : "1"}
              />
              <text x="12" y="22" fill="#f1f5f9" fontSize="11" fontWeight="bold">
                ⚙️ SERVEUR DE SAUVEGARDE
              </text>
              <text x="12" y="40" fill="#cbd5e1" fontSize="9.5">
                IP : 10.24.8.19 (Salle serveurs)
              </text>
              <text x="12" y="58" fill="#94a3b8" fontSize="9">
                Script avec mot de passe expiré
              </text>
            </g>

            {/* Source C : Intrus / Rebond */}
            <g
              transform="translate(28, 244)"
              role="button"
              tabIndex={0}
              aria-label="Simuler une tentative malveillante depuis une machine compromise"
              className="cursor-pointer"
              onClick={() => triggerPacket("intruder")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  triggerPacket("intruder");
                }
              }}
            >
              <rect
                width="226"
                height="74"
                rx="8"
                fill={selectedSource === "intruder" ? "#132b20" : "#141c17"}
                stroke={selectedSource === "intruder" ? "#10b981" : "#223326"}
                strokeWidth={selectedSource === "intruder" ? "2" : "1"}
              />
              <text x="12" y="22" fill="#f1f5f9" fontSize="11" fontWeight="bold">
                🦹 MACHINE COMPROMISE
              </text>
              <text x="12" y="40" fill="#cbd5e1" fontSize="9.5">
                IP : 10.24.8.19 (Session shell)
              </text>
              <text x="12" y="58" fill="#94a3b8" fontSize="9">
                Tentative de connexion malveillante
              </text>
            </g>

            {/* Encadré d'explication simple */}
            <rect x="28" y="328" width="226" height="142" rx="8" fill="#0d1410" stroke="#243328" />
            <text x="40" y="352" fill="#fbbf24" fontSize="11" fontWeight="bold">
              💡 Ce que le serveur ignore :
            </text>
            <text x="40" y="372" fill="#94a3b8" fontSize="9.5">
              Le serveur ne voit pas la personne.
            </text>
            <text x="40" y="390" fill="#94a3b8" fontSize="9.5">
              Il ne voit ni l&apos;écran, ni le clavier.
            </text>
            <text x="40" y="412" fill="#cbd5e1" fontSize="9" fontStyle="italic">
              Il reçoit seulement des signaux
            </text>
            <text x="40" y="428" fill="#cbd5e1" fontSize="9" fontStyle="italic">
              sur son câble réseau, sans savoir
            </text>
            <text x="40" y="446" fill="#a7f3d0" fontSize="9" fontWeight="bold">
              qui se cache derrière.
            </text>
          </g>

          {/* 2. ZONE CENTRALE : LE CÂBLE RÉSEAU (x=266..555) */}
          <g id="medium-zone">
            {/* Ligne du câble réseau */}
            <path d="M 266 230 L 555 230" stroke="#1b2e22" strokeWidth="14" strokeLinecap="round" />
            <path
              d="M 266 230 L 555 230"
              stroke="url(#cableGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Texte au-dessus du câble (aucun chevauchement avec le paquet) */}
            <text
              x="410"
              y="140"
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              CÂBLE RÉSEAU INTERNE
            </text>
            <text x="410" y="158" fill="#94a3b8" fontSize="9.5" textAnchor="middle">
              Réseau de l&apos;entreprise (IP 10.24.8.19)
            </text>
            <text x="410" y="174" fill="#94a3b8" fontSize="9" textAnchor="middle">
              Connexion sécurisée SSH (Port 22)
            </text>

            {/* Paquet animé le long du câble */}
            {(() => {
              const startX = 272;
              const endX = 450;
              const packetX = startX + (packetProgress / 100) * (endX - startX);
              return (
                <g
                  transform={`translate(${packetX}, 206)`}
                  role="button"
                  tabIndex={0}
                  aria-label="Inspecter le contenu du paquet réseau"
                  className="cursor-pointer"
                  onClick={() => setIsInspectingPacket(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsInspectingPacket(true);
                    }
                  }}
                >
                  <rect
                    width="98"
                    height="48"
                    rx="8"
                    fill="#0284c7"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    filter="url(#packetGlow)"
                  />
                  <text
                    x="49"
                    y="16"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    PAQUET RÉSEAU
                  </text>
                  <text
                    x="49"
                    y="29"
                    fill="#e0f2fe"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Demande de connexion
                  </text>
                  <text
                    x="49"
                    y="41"
                    fill="#bae6fd"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    compte : &quot;c.moreau&quot;
                  </text>
                </g>
              );
            })()}
          </g>

          {/* 3. FRONTIÈRE DU SERVEUR (x=555) */}
          <g id="sensor-boundary-line">
            <line
              x1="555"
              y1="16"
              x2="555"
              y2="484"
              stroke={isBoundaryActive ? "#f59e0b" : "#eab308"}
              strokeWidth={isBoundaryActive ? "3.5" : "2"}
              strokeDasharray="6 4"
              filter={isBoundaryActive ? "url(#boundaryGlow)" : undefined}
            />

            {/* Badge centré à x=555 (de 480 à 630, s'arrête avant 640 : zéro collision) */}
            <rect
              x="480"
              y="18"
              width="150"
              height="26"
              rx="6"
              fill="#78350f"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <text
              x="555"
              y="35"
              fill="#fef3c7"
              fontSize="9.5"
              fontWeight="bold"
              letterSpacing="0.05em"
              textAnchor="middle"
            >
              LIMITE DU SERVEUR
            </text>

            <rect x="500" y="450" width="110" height="22" rx="5" fill="#1b281f" stroke="#2e4835" />
            <text
              x="555"
              y="465"
              fill="#a7f3d0"
              fontSize="8.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              POINT DE MESURE
            </text>
          </g>

          {/* 4. ZONE DROITE : SERVEUR DE PAIE (x=640..984, width=344) */}
          <g id="downstream-zone">
            <rect
              x="640"
              y="16"
              width="344"
              height="468"
              rx="12"
              fill="#0e1712"
              stroke="#1b2c20"
              strokeWidth="1.5"
            />
            <text x="656" y="44" fill="#10b981" fontSize="12" fontWeight="bold">
              CE QUE LE SERVEUR ENREGISTRE
            </text>
            <text x="656" y="60" fill="#94a3b8" fontSize="9.5">
              Serveur de paie (srv-paie-01)
            </text>

            {/* Réception réseau */}
            <g transform="translate(654, 76)">
              <rect width="316" height="66" rx="8" fill="#13231a" stroke="#24382a" />
              <text x="12" y="22" fill="#a7f3d0" fontSize="10.5" fontWeight="bold">
                1. CONNEXION RÉSEAU REÇUE
              </text>
              <text x="12" y="40" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
                Données reçues sur le port 22
              </text>
              <text x="12" y="54" fill="#94a3b8" fontSize="9">
                Adresse de la machine distante : 10.24.8.19
              </text>
            </g>

            {/* Service SSH */}
            <g transform="translate(654, 150)">
              <rect
                width="316"
                height="84"
                rx="8"
                fill="#16291e"
                stroke="#10b981"
                strokeWidth="1.5"
              />
              <text x="12" y="22" fill="#ecfdf5" fontSize="11" fontWeight="bold">
                2. VÉRIFICATION DU MOT DE PASSE (sshd)
              </text>
              <text x="12" y="40" fill="#a7f3d0" fontSize="9.5">
                • Le mot de passe proposé ne correspond pas.
              </text>
              <text x="12" y="56" fill="#a7f3d0" fontSize="9.5">
                • Le service rejette la connexion demandée.
              </text>
              <text x="12" y="72" fill="#f87171" fontSize="9" fontWeight="bold">
                → Statut : Échec d&apos;authentification (AUTH_FAILURE)
              </text>
            </g>

            {/* Sortie journal auth.log */}
            <g transform="translate(654, 242)">
              <rect
                width="316"
                height="104"
                rx="8"
                fill="#070c09"
                stroke={isFiveFieldsActive || isInvarianceActive ? "#10b981" : "#1f3325"}
                strokeWidth="1.5"
              />
              <text x="12" y="20" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                📄 3. LIGNE ÉCRITE DANS LE JOURNAL (auth.log)
              </text>

              {/* Ligne de log */}
              <g transform="translate(10, 30)">
                <rect width="296" height="64" rx="6" fill="#0f1912" stroke="#253d2d" />
                <text x="8" y="20" fill="#fef08a" fontSize="9.5" fontFamily="monospace">
                  Oct 24 08:14:02 srv-paie-01 sshd[18420]:
                </text>
                <text
                  x="8"
                  y="36"
                  fill="#fca5a5"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Failed password for c.moreau
                </text>
                <text x="8" y="52" fill="#93c5fd" fontSize="9.5" fontFamily="monospace">
                  from 10.24.8.19 port 42118 ssh2
                </text>
              </g>
            </g>

            {/* Règle pédagogique clé */}
            <g transform="translate(654, 354)">
              <rect
                width="316"
                height="112"
                rx="8"
                fill="#142118"
                stroke="#10b981"
                strokeDasharray="4 2"
                strokeWidth="1.5"
              />
              <text x="12" y="24" fill="#10b981" fontSize="10.5" fontWeight="bold">
                💡 RÈGLE CLÉ DU DIAGNOSTIC :
              </text>
              <text x="12" y="44" fill="#cbd5e1" fontSize="9.5">
                Que la cause réelle soit :
              </text>
              <text x="12" y="60" fill="#a7f3d0" fontSize="9.5">
                • Claire, un script ou un attaquant,
              </text>
              <text x="12" y="78" fill="#fef08a" fontSize="9.5" fontWeight="bold">
                le journal écrit EXACTEMENT la même chose !
              </text>
              <text x="12" y="96" fill="#86efac" fontSize="9" fontStyle="italic">
                Une seule trace ne permet donc jamais d&apos;accuser.
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Inspecteur de paquet */}
      {isInspectingPacket && (
        <div className="mt-4 rounded-xl border border-[#38bdf8]/40 bg-[#082f49]/30 p-4 text-xs animate-in fade-in-50">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-sm text-[#7dd3fc]">
                Contenu du paquet reçu sur le câble
              </span>
              <p className="font-mono text-[11px] text-[#bae6fd]">
                Données reçues : [Demande de connexion] [Nom demandé: &quot;c.moreau&quot;] [Adresse
                : 10.24.8.19]
              </p>
              <p className="text-[#e0f2fe] text-[11.5px] leading-relaxed">
                Le câble transporte seulement ces informations techniques. Aucune indication
                n&apos;indique si c&apos;est une personne distraite, un script automatique ou une
                attaque.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsInspectingPacket(false)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Pied du schéma */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#8ea394]">
        <span>💡 Cliquez sur les boutons du haut pour voir que le journal reste identique.</span>
        <span className="font-mono text-[#a3b8aa]">Cybersécurité fondamentale</span>
      </div>
    </div>
  );
}
