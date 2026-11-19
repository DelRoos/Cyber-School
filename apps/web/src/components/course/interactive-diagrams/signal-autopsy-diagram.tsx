"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@cyber-school/ui";

interface SignalAutopsyDiagramProps {
  activeCueId?: string;
  activeCueIndex?: number;
  isPlaying?: boolean;
}

export function SignalAutopsyDiagram({
  activeCueId,
  activeCueIndex = 0,
  isPlaying = false,
}: SignalAutopsyDiagramProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [activeScanToken, setActiveScanToken] = useState<string | null>(null);

  // Synchronisation avec les segments audio
  const isSiemAlertActive = Boolean(
    activeCueId?.startsWith("ch1-s1") ||
    activeCueId?.startsWith("ch1-s2") ||
    activeCueId?.startsWith("ch1-cue-7") ||
    activeCueId?.startsWith("ch1-cue-8") ||
    activeCueIndex === 0 ||
    activeCueIndex === 1,
  );
  const isFissionActive = Boolean(
    activeCueId?.startsWith("ch1-s3") ||
    activeCueId?.startsWith("ch1-s6") ||
    activeCueId?.startsWith("ch1-cue-9") ||
    activeCueId?.startsWith("ch1-cue-10") ||
    activeCueIndex === 2 ||
    activeCueIndex === 5,
  );
  const isFalsifiedActive = isFissionActive;

  const activateOnKey = (token: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedToken(token);
    }
  };

  // Défilement lumineux sur les 5 faits mesurés pendant la narration (respecte prefers-reduced-motion)
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isPlaying || !isFissionActive || prefersReduced) {
      const timer = setTimeout(() => setActiveScanToken(null), 0);
      return () => clearTimeout(timer);
    }
    const tokens = ["timestamp", "daemon", "event", "account", "ip"];
    let idx = 0;
    const firstToken = tokens[0];
    const initTimer = setTimeout(() => {
      if (firstToken) {
        setActiveScanToken(firstToken);
      }
    }, 0);
    const interval = setInterval(() => {
      idx = (idx + 1) % tokens.length;
      const nextToken = tokens[idx];
      if (nextToken) {
        setActiveScanToken(nextToken);
      }
    }, 2500);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [isPlaying, isFissionActive]);

  // Détails pédagogiques accessibles
  const TOKEN_DETAILS: Record<
    string,
    { title: string; type: "fact" | "fiction"; ref: string; desc: string }
  > = {
    timestamp: {
      title: "1. Heure exacte : 08:14:02 UTC",
      type: "fact",
      ref: "Horloge du serveur",
      desc: "L'heure exacte enregistrée par le serveur. 3 tentatives ont eu lieu en 7 secondes (à 08:14:02, 08:14:05 et 08:14:09).",
    },
    daemon: {
      title: "2. Programme récepteur : sshd",
      type: "fact",
      ref: "Service OpenSSH",
      desc: "Le programme qui gère les connexions à distance sécurisées sur le serveur. Il a reçu les demandes sur son port 22.",
    },
    event: {
      title: "3. Résultat : Mot de passe refusé (Failed password)",
      type: "fact",
      ref: "Code retour d'authentification",
      desc: "Le mot de passe saisi ne correspondait pas au mot de passe enregistré. La connexion a été immédiatement refusée.",
    },
    account: {
      title: "4. Nom de compte demandé : c.moreau",
      type: "fact",
      ref: "Identifiant transmis",
      desc: "Ce texte a été envoyé dans la demande. Cela ne prouve absolument pas que Claire Moreau était elle-même devant l'ordinateur.",
    },
    ip: {
      title: "5. Adresse de l'ordinateur source : 10.24.8.19",
      type: "fact",
      ref: "Adresse IP interne (RFC 1918)",
      desc: "L'adresse réseau de la machine qui a envoyé la demande. C'est une adresse privée interne à l'entreprise, pas un pirate sur Internet.",
    },
    fiction_external: {
      title: "Ajout supposé n°1 · « Attaquant externe »",
      type: "fiction",
      ref: "Erreur d'interprétation",
      desc: "L'alerte parle d'un attaquant externe, mais l'adresse 10.24.8.19 est une IP interne à l'entreprise ! Affirmer que cela vient d'Internet est faux.",
    },
    fiction_bruteforce: {
      title: "Ajout supposé n°2 · « Pirater par force brute »",
      type: "fiction",
      ref: "Conclusion hâtive",
      desc: "Trois erreurs en 7 secondes peuvent très bien être une personne qui se trompe ou un script automatique. Parler tout de suite d'attaque massive est une pure supposition.",
    },
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#233528] bg-[#0c130f] p-4 sm:p-6 shadow-2xl transition-all duration-500"
      data-testid="signal-autopsy-diagram"
    >
      {/* En-tête */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2b20] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#10b981] motion-safe:animate-pulse" />
          <h4 className="text-sm font-semibold tracking-wide text-[#e3ece5]">
            Schéma 1 · Ce qui est prouvé vs ce qui est supposé
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
            {isPlaying ? "Asservi à la voix off" : "Cliquez sur les éléments"}
          </span>
        </div>
      </div>

      {/* SVG Vectoriel Réactif avec Géométrie Parfaite */}
      <div className="relative w-full aspect-[960/480] max-h-[500px]">
        <svg
          viewBox="0 0 960 480"
          className="h-full w-full select-none"
          aria-label="Séparation entre faits réels et ajouts supposés"
        >
          <defs>
            <linearGradient id="siemGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>

            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. BANDEAU DE L'ALERTE DE SÉCURITÉ */}
          <g
            id="siem-alert-banner"
            role="button"
            tabIndex={0}
            aria-label="Réinitialiser la sélection sur le bandeau d'alerte"
            className={cn(
              "cursor-pointer transition-all duration-500",
              isSiemAlertActive && "motion-safe:animate-pulse",
            )}
            onClick={() => setSelectedToken(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedToken(null);
              }
            }}
          >
            <rect
              x="40"
              y="20"
              width="880"
              height="58"
              rx="12"
              fill="#181315"
              stroke={isSiemAlertActive ? "#ef4444" : "#4a2528"}
              strokeWidth={isSiemAlertActive ? "2.5" : "1.5"}
              className="transition-colors duration-300"
            />
            <rect
              x="40"
              y="20"
              width="880"
              height="5"
              rx="2"
              fill={isSiemAlertActive ? "url(#siemGlow)" : "#ef4444"}
            />
            <text
              x="65"
              y="45"
              fill="#f87171"
              fontSize="11"
              fontWeight="bold"
              letterSpacing="0.08em"
            >
              [MESSAGE D&apos;ALERTE REÇU PAR L&apos;ÉQUIPE DE SÉCURITÉ]
            </text>
            <text
              x="65"
              y="63"
              fill="#f3f4f6"
              fontSize="12.5"
              fontWeight="500"
              fontFamily="sans-serif"
            >
              « Un attaquant externe tente de pirater le compte de Claire Moreau par force brute
              depuis 10.24.8.19 sur srv-paie-01 »
            </text>
          </g>

          {/* 2. ARBRE DE SÉPARATION DES FAITS ET DES SUPPOSITIONS */}
          <g id="fission-tree" opacity={isFissionActive || isSiemAlertActive ? 1 : 0.4}>
            <path d="M 480 78 L 480 115" stroke="#64748b" strokeWidth="2.5" strokeDasharray="4 4" />
            <path
              d="M 480 115 C 480 145, 260 140, 260 175"
              stroke={isFissionActive ? "#10b981" : "#334155"}
              strokeWidth="2.5"
              fill="none"
              className="transition-colors duration-500"
            />
            <path
              d="M 480 115 C 480 145, 700 140, 700 320"
              stroke={isFalsifiedActive ? "#ef4444" : "#334155"}
              strokeWidth="2.5"
              fill="none"
              className="transition-colors duration-500"
            />
          </g>

          {/* 3. LES 5 FAITS RÉELLEMENT ENREGISTRÉS PAR LE SERVEUR */}
          <g id="measured-signals-group">
            <text
              x="40"
              y="160"
              fill="#10b981"
              fontSize="12.5"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              ✓ 5 DONNÉES RÉELLES ENREGISTRÉES DANS LE JOURNAL
            </text>

            {/* 1: Heure */}
            <g
              id="token-timestamp"
              transform="translate(40, 175)"
              role="button"
              tabIndex={0}
              aria-label="Heure exacte : 08:14:02 UTC"
              className="cursor-pointer transition-all duration-300 group"
              onClick={() => setSelectedToken("timestamp")}
              onKeyDown={activateOnKey("timestamp")}
            >
              <rect
                width="165"
                height="62"
                rx="8"
                fill={
                  selectedToken === "timestamp" || activeScanToken === "timestamp"
                    ? "#064e3b"
                    : "#0d281e"
                }
                stroke="#10b981"
                strokeWidth={
                  selectedToken === "timestamp" || activeScanToken === "timestamp" ? "2.5" : "1"
                }
                filter={activeScanToken === "timestamp" ? "url(#emeraldGlow)" : undefined}
                className="transition-colors group-hover:fill-[#0a382a]"
              />
              <text
                x="12"
                y="24"
                fill={activeScanToken === "timestamp" ? "#c8ed97" : "#a7f3d0"}
                fontSize="10"
                fontWeight="bold"
              >
                1. HEURE EXACTE (UTC)
              </text>
              <text
                x="12"
                y="44"
                fill="#ecfdf5"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                08:14:02 UTC
              </text>
            </g>

            {/* 2: Programme */}
            <g
              id="token-daemon"
              transform="translate(215, 175)"
              role="button"
              tabIndex={0}
              aria-label="Service réseau : sshd"
              className="cursor-pointer transition-all duration-300 group"
              onClick={() => setSelectedToken("daemon")}
              onKeyDown={activateOnKey("daemon")}
            >
              <rect
                width="165"
                height="62"
                rx="8"
                fill={
                  selectedToken === "daemon" || activeScanToken === "daemon" ? "#064e3b" : "#0d281e"
                }
                stroke="#10b981"
                strokeWidth={
                  selectedToken === "daemon" || activeScanToken === "daemon" ? "2.5" : "1"
                }
                filter={activeScanToken === "daemon" ? "url(#emeraldGlow)" : undefined}
                className="transition-colors group-hover:fill-[#0a382a]"
              />
              <text
                x="12"
                y="24"
                fill={activeScanToken === "daemon" ? "#c8ed97" : "#a7f3d0"}
                fontSize="10"
                fontWeight="bold"
              >
                2. SERVICE RÉSEAU
              </text>
              <text
                x="12"
                y="44"
                fill="#ecfdf5"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                sshd[18420]
              </text>
            </g>

            {/* 3: Événement */}
            <g
              id="token-event"
              transform="translate(390, 175)"
              role="button"
              tabIndex={0}
              aria-label="Résultat du mot de passe : Failed password"
              className="cursor-pointer transition-all duration-300 group"
              onClick={() => setSelectedToken("event")}
              onKeyDown={activateOnKey("event")}
            >
              <rect
                width="175"
                height="62"
                rx="8"
                fill={
                  selectedToken === "event" || activeScanToken === "event" ? "#064e3b" : "#0d281e"
                }
                stroke="#10b981"
                strokeWidth={selectedToken === "event" || activeScanToken === "event" ? "2.5" : "1"}
                filter={activeScanToken === "event" ? "url(#emeraldGlow)" : undefined}
                className="transition-colors group-hover:fill-[#0a382a]"
              />
              <text
                x="12"
                y="24"
                fill={activeScanToken === "event" ? "#c8ed97" : "#a7f3d0"}
                fontSize="10"
                fontWeight="bold"
              >
                3. RÉSULTAT DU MOT DE PASSE
              </text>
              <text
                x="12"
                y="44"
                fill="#ecfdf5"
                fontSize="11.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Failed password
              </text>
            </g>

            {/* 4: Compte */}
            <g
              id="token-account"
              transform="translate(575, 175)"
              role="button"
              tabIndex={0}
              aria-label="Compte demandé : c.moreau"
              className="cursor-pointer transition-all duration-300 group"
              onClick={() => setSelectedToken("account")}
              onKeyDown={activateOnKey("account")}
            >
              <rect
                width="165"
                height="62"
                rx="8"
                fill={
                  selectedToken === "account" || activeScanToken === "account"
                    ? "#064e3b"
                    : "#0d281e"
                }
                stroke="#10b981"
                strokeWidth={
                  selectedToken === "account" || activeScanToken === "account" ? "2.5" : "1"
                }
                filter={activeScanToken === "account" ? "url(#emeraldGlow)" : undefined}
                className="transition-colors group-hover:fill-[#0a382a]"
              />
              <text
                x="12"
                y="24"
                fill={activeScanToken === "account" ? "#c8ed97" : "#a7f3d0"}
                fontSize="10"
                fontWeight="bold"
              >
                4. COMPTE DEMANDÉ
              </text>
              <text
                x="12"
                y="44"
                fill="#ecfdf5"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                c.moreau
              </text>
            </g>

            {/* 5: Adresse IP */}
            <g
              id="token-ip"
              transform="translate(750, 175)"
              role="button"
              tabIndex={0}
              aria-label="Machine source : 10.24.8.19"
              className="cursor-pointer transition-all duration-300 group"
              onClick={() => setSelectedToken("ip")}
              onKeyDown={activateOnKey("ip")}
            >
              <rect
                width="170"
                height="62"
                rx="8"
                fill={selectedToken === "ip" || activeScanToken === "ip" ? "#064e3b" : "#0d281e"}
                stroke="#10b981"
                strokeWidth={selectedToken === "ip" || activeScanToken === "ip" ? "2.5" : "1"}
                filter={activeScanToken === "ip" ? "url(#emeraldGlow)" : undefined}
                className="transition-colors group-hover:fill-[#0a382a]"
              />
              <text
                x="12"
                y="24"
                fill={activeScanToken === "ip" ? "#c8ed97" : "#a7f3d0"}
                fontSize="10"
                fontWeight="bold"
              >
                5. MACHINE SOURCE
              </text>
              <text
                x="12"
                y="44"
                fill="#ecfdf5"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                10.24.8.19 (Interne)
              </text>
            </g>
          </g>

          {/* 4. ZONE INFÉRIEURE : ENCADRÉ PÉDAGOGIQUE + 2 FICTIONS */}
          <g id="bottom-zone">
            {/* Encadré d'explication à gauche */}
            <g transform="translate(40, 275)">
              <rect
                width="360"
                height="70"
                rx="10"
                fill="#0d1813"
                stroke="#1f3b2b"
                strokeWidth="1.5"
              />
              <text x="16" y="24" fill="#a7f3d0" fontSize="11" fontWeight="bold">
                💡 La règle d&apos;or de l&apos;analyste
              </text>
              <text x="16" y="42" fill="#cbd5e1" fontSize="9.5">
                On ne s&apos;appuie que sur les faits prouvés.
              </text>
              <text x="16" y="58" fill="#86efac" fontSize="9.5" fontStyle="italic">
                On refuse d&apos;inventer des histoires avant de vérifier.
              </text>
            </g>

            {/* Titre des fictions à droite */}
            <text
              x="420"
              y="262"
              fill="#ef4444"
              fontSize="12.5"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              ✗ 2 CONCLUSIONS HÂTIVES NON PROUVÉES DANS L&apos;ALERTE
            </text>

            {/* Fiction 1: Attaquant externe */}
            <g
              id="token-fiction-external"
              role="button"
              tabIndex={0}
              aria-label="Attaquant externe"
              transform="translate(420, 275)"
              className={cn(
                "cursor-pointer transition-all duration-500 group",
                isFalsifiedActive && "opacity-75 hover:opacity-100",
              )}
              onClick={() => setSelectedToken("fiction_external")}
              onKeyDown={activateOnKey("fiction_external")}
            >
              <rect
                width="240"
                height="70"
                rx="10"
                fill="#2a1215"
                stroke="#ef4444"
                strokeWidth={selectedToken === "fiction_external" ? "2.5" : "1.5"}
                strokeDasharray={isFalsifiedActive ? "6 3" : undefined}
                className="transition-colors group-hover:fill-[#38161a]"
              />
              <text x="16" y="22" fill="#fca5a5" fontSize="10" fontWeight="bold">
                Ajout supposé n°1
              </text>
              <text x="16" y="42" fill="#fecaca" fontSize="13" fontWeight="bold">
                « Attaquant externe »
              </text>
              <text x="16" y="58" fill="#fda4af" fontSize="9.5">
                ✗ Faux : 10.24.8.19 est une IP interne !
              </text>
            </g>

            {/* Fiction 2: Force brute */}
            <g
              id="token-fiction-bruteforce"
              role="button"
              tabIndex={0}
              aria-label="Pirater par force brute"
              transform="translate(680, 275)"
              className="cursor-pointer transition-all duration-500 group"
              onClick={() => setSelectedToken("fiction_bruteforce")}
              onKeyDown={activateOnKey("fiction_bruteforce")}
            >
              <rect
                width="240"
                height="70"
                rx="10"
                fill="#2a1215"
                stroke="#ef4444"
                strokeWidth={selectedToken === "fiction_bruteforce" ? "2.5" : "1.5"}
                strokeDasharray={isFalsifiedActive ? "6 3" : undefined}
                className="transition-colors group-hover:fill-[#38161a]"
              />
              <text x="16" y="22" fill="#fca5a5" fontSize="10" fontWeight="bold">
                Ajout supposé n°2
              </text>
              <text x="16" y="42" fill="#fecaca" fontSize="13" fontWeight="bold">
                « Pirater par force brute »
              </text>
              <text x="16" y="58" fill="#fda4af" fontSize="9.5">
                ✗ Supposition : 3 essais en 7s ne prouvent rien
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* TIROIR D'EXPLICATION AU CLIC */}
      {selectedToken && TOKEN_DETAILS[selectedToken] && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-4 text-xs transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2",
            TOKEN_DETAILS[selectedToken].type === "fact"
              ? "border-[#10b981]/40 bg-[#064e3b]/30 text-[#d1fae5]"
              : "border-[#ef4444]/40 bg-[#450a0a]/30 text-[#fee2e2]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {TOKEN_DETAILS[selectedToken].type === "fact" ? (
                  <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#ef4444]" />
                )}
                <span className="font-bold text-sm tracking-wide">
                  {TOKEN_DETAILS[selectedToken].title}
                </span>
                <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {TOKEN_DETAILS[selectedToken].ref}
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed opacity-90">
                {TOKEN_DETAILS[selectedToken].desc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedToken(null)}
              className="text-muted-foreground hover:text-white px-2.5 py-1 text-[11px] rounded bg-white/10"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Guide d'interaction sous le schéma */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#8ea394]">
        <span>💡 Cliquez sur chaque encadré pour lire son explication détaillée.</span>
        <span className="font-mono text-[#a3b8aa]">Distinction fait vs interprétation</span>
      </div>
    </div>
  );
}
