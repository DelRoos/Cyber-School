"use client";

import React, { useState, useEffect } from "react";
import { Filter, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@cyber-school/ui";

interface RefutationFunnelDiagramProps {
  activeCueId?: string;
  activeCueIndex?: number;
  isPlaying?: boolean;
}

type FunnelStage = 1 | 2 | 3;

export function RefutationFunnelDiagram({
  activeCueId,
  activeCueIndex = 0,
  isPlaying = false,
}: RefutationFunnelDiagramProps) {
  const [stage, setStage] = useState<FunnelStage>(1);
  const [ntpDrift, setNtpDrift] = useState<number>(0);
  const [selectedHypothesis, setSelectedHypothesis] = useState<string>("H2");
  const [claimAsFact, setClaimAsFact] = useState<boolean>(false);
  const [simulatedCause, setSimulatedCause] = useState<"h2" | "h3">("h2");

  // Synchronisation avec les segments de l'audio
  useEffect(() => {
    if (!isPlaying) return;

    if (
      activeCueId?.startsWith("ch3-s3") ||
      activeCueId?.startsWith("ch3-s4") ||
      activeCueId?.startsWith("ch3-cue-7") ||
      activeCueId?.startsWith("ch3-cue-6")
    ) {
      // Déroulement progressif de l'entonnoir pendant l'explication des 3 sources
      const timer0 = setTimeout(() => setStage(1), 0);
      const timer1 = setTimeout(() => setStage(2), 5000);
      const timer2 = setTimeout(() => setStage(3), 14000);
      return () => {
        clearTimeout(timer0);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    if (activeCueId?.startsWith("ch3-s6") || activeCueId?.startsWith("ch3-cue-8")) {
      // Segment sur la dérive d'horloge NTP
      const timer = setTimeout(() => {
        setStage(3);
        setNtpDrift(45);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (activeCueId?.startsWith("ch3-s5") || activeCueId?.startsWith("ch3-cue-9")) {
      const timer = setTimeout(() => {
        setStage(3);
        setNtpDrift(0);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (activeCueId?.startsWith("ch3-s1") || activeCueIndex === 0) {
      const timer = setTimeout(() => {
        setStage(1);
        setNtpDrift(0);
        setClaimAsFact(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeCueId, activeCueIndex, isPlaying]);

  const _HYPOTHESES = [
    {
      id: "H1",
      key: "h1-claire-typo",
      title: "Piste H1 · Faute de frappe manuelle de Claire",
      desc: "Claire Moreau fait une faute dans son mot de passe ou a la touche majuscule active.",
      statusStage1: "compatible",
      statusStage2: "falsified",
      statusStage3: "falsified",
      falsificationReason:
        "Éliminée par l'inventaire : 10.24.8.19 est un serveur en baie sans clavier ni écran !",
    },
    {
      id: "H2",
      key: "h2-scheduled-script-old-password",
      title: "Piste H2 · Script automatique avec mot de passe expiré",
      desc: "Une sauvegarde automatique tente de se connecter avec un ancien mot de passe non renouvelé.",
      statusStage1: "compatible",
      statusStage2: "compatible",
      statusStage3: "corroborated",
      corroborationProof:
        "Prouvée par les journaux locaux : le script backup-sync.sh s'est lancé à 08:14:00 pile !",
    },
    {
      id: "H3",
      key: "h3-unauthorized-lateral",
      title: "Piste H3 · Connexion non autorisée (Attaque)",
      desc: "Une personne a pris le contrôle de 10.24.8.19 pour tenter d'accéder au serveur.",
      statusStage1: "compatible",
      statusStage2: "compatible",
      statusStage3: "falsified",
      falsificationReason:
        "Éliminée par les journaux locaux : aucune session interactive ni commande suspecte à cette heure.",
    },
  ];

  const formatDriftedUtc = (baseSeconds: number, driftSeconds: number) => {
    const total = baseSeconds + driftSeconds;
    const h = Math.floor(total / 3600) % 24;
    const m = Math.floor((total % 3600) / 60);
    const s = ((total % 60) + 60) % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // 08:14:00 = 29640s, 08:14:02 = 29642s, 08:13:55 = 29635s
  const source3TimeA = formatDriftedUtc(29640, ntpDrift);
  const source3TimeB = formatDriftedUtc(29642, ntpDrift);
  const source3ShellTime = formatDriftedUtc(29635, ntpDrift);
  const isCase3B = simulatedCause === "h3";
  const isCorroboratedClean = stage === 3 && ntpDrift === 0 && !claimAsFact;

  const handleNextStep = () => {
    setStage((prev) => (prev < 3 ? ((prev + 1) as FunnelStage) : 1));
  };

  const getVerdictTitle = () => {
    if (claimAsFact && stage < 3) return "Conclusion prématurée non soutenue";
    if (claimAsFact && stage === 3) {
      return "Affirmation sans réserve ni mention des limites (sur-interprétation)";
    }
    if (stage === 3 && ntpDrift !== 0) {
      return "Chronologie invalide : dérive NTP non corrigée";
    }
    if (stage === 3) {
      return isCase3B
        ? "Cas 3B : Piste H3 corroborée par 3 sources (escalade requise)"
        : "Cas 3A : Piste H2 corroborée par 3 sources (limites documentées)";
    }
    if (stage === 2) return "Piste H1 réfutée par la CMDB (H2 et H3 restent ouvertes)";
    return "En attente de recoupement multi-sources (3 pistes compatibles)";
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#233528] bg-[#09110d] p-4 sm:p-6 shadow-2xl transition-all duration-500"
      data-testid="refutation-funnel-diagram"
    >
      {/* Conteneur schéma entonnoir (le simulateur déterministe réel est dans ObservationWorkbench) */}
      <div data-testid="refutation-funnel-inner" className="space-y-4">
        {/* En-tête avec compteurs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2b20] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#10b981] motion-safe:animate-pulse" />
            <h4 className="text-sm font-semibold tracking-wide text-[#e3ece5]">
              Schéma 3 · L&apos;entonnoir de recoupement : éliminer les fausses pistes
            </h4>
          </div>

          {/* Badges de métriques simples */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              data-testid="funnel-metric-fields"
              className="rounded-full bg-[#14231b] border border-[#223d2c] px-2.5 py-0.5 font-mono text-[#a7f3d0]"
            >
              5 champs
            </span>
            <span
              data-testid="funnel-metric-sources"
              className="rounded-full bg-[#14231b] border border-[#223d2c] px-2.5 py-0.5 font-mono text-[#38bdf8]"
            >
              {stage === 1 ? "1 / 3" : stage === 2 ? "2 / 3" : "3 / 3"}
            </span>
            <span
              data-testid="funnel-metric-compatible"
              className="rounded-full bg-[#14231b] border border-[#223d2c] px-2.5 py-0.5 font-mono text-[#fde047]"
            >
              {stage === 1 ? "3 pistes" : stage === 2 ? "2 pistes" : "1 piste"}
            </span>
            <span
              data-testid="funnel-metric-unsupported"
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-xs",
                claimAsFact
                  ? "bg-red-950/60 border border-red-500/50 text-red-200"
                  : "bg-[#14231b] border border-[#223d2c] text-[#a7f3d0]",
              )}
            >
              {claimAsFact ? "1" : "0"}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[11px]",
                isPlaying
                  ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                  : "bg-muted/30 text-muted-foreground",
              )}
            >
              {isPlaying ? "Asservi à la voix off" : "Mode interactif"}
            </span>
          </div>
        </div>

        {/* Boutons d'étape de l'entonnoir */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f1a14] p-3 rounded-xl border border-[#1f3325]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#8ea394]">
              Progression du recoupement :
            </span>
            <button
              type="button"
              onClick={() => setStage(1)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                stage === 1
                  ? "bg-[#38bdf8] text-black font-bold shadow-md shadow-[#38bdf8]/20"
                  : "bg-[#16231a] text-[#cbd5e1] border border-[#233829] hover:bg-[#1c2e22]",
              )}
            >
              1. Journal seul (3 pistes)
            </button>
            <button
              type="button"
              data-testid="funnel-mode-btn-with-inventory"
              onClick={() => setStage(2)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                stage === 2
                  ? "bg-[#f59e0b] text-black font-bold shadow-md shadow-[#f59e0b]/20"
                  : "bg-[#16231a] text-[#cbd5e1] border border-[#233829] hover:bg-[#1c2e22]",
              )}
            >
              2. + Inventaire (2 pistes)
            </button>
            <button
              type="button"
              data-testid="funnel-mode-btn-with-inventory-and-backup-log"
              onClick={() => setStage(3)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                stage === 3
                  ? "bg-[#10b981] text-black font-bold shadow-md shadow-[#10b981]/20"
                  : "bg-[#16231a] text-[#cbd5e1] border border-[#233829] hover:bg-[#1c2e22]",
              )}
            >
              3. + Journaux locaux (1 preuve)
            </button>
            <button
              type="button"
              data-testid="funnel-next-step"
              onClick={handleNextStep}
              className="rounded-lg bg-[#243b2c] border border-[#3b5e47] px-3 py-1.5 text-xs font-semibold text-[#c8ed97] hover:bg-[#2e4c38] transition-all"
            >
              Étape suivante →
            </button>
          </div>

          {/* Curseur de dérive horaire NTP */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-4 w-4 text-[#fbbf24]" aria-hidden="true" />
            <label htmlFor="funnel-ntp-drift-slider" className="text-[#a3b8aa]">
              Décalage d&apos;heure (NTP) :
            </label>
            <input
              id="funnel-ntp-drift-slider"
              type="range"
              min="-60"
              max="60"
              step="5"
              value={ntpDrift}
              aria-label="Décalage d'horloge NTP en secondes"
              onChange={(e) => setNtpDrift(Number(e.target.value))}
              className="w-20 accent-[#10b981] cursor-pointer"
            />
            <span
              className={cn(
                "font-mono font-bold text-xs px-1.5 py-0.5 rounded",
                ntpDrift === 0
                  ? "text-[#10b981] bg-[#10b981]/10"
                  : "text-[#fda4af] bg-[#be123c]/20",
              )}
            >
              {ntpDrift > 0 ? `+${ntpDrift}s` : `${ntpDrift}s`}
            </span>
          </div>
        </div>

        {/* Contrôles de simulation */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1611] p-2.5 rounded-lg border border-[#1b2b20] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Scénario testé :</span>
            <button
              type="button"
              data-testid="funnel-cause-btn-h2"
              onClick={() => {
                setSimulatedCause("h2");
                setSelectedHypothesis("H2");
              }}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                simulatedCause === "h2"
                  ? "bg-[#10b981]/20 text-[#a7f3d0] border-[#10b981]"
                  : "bg-black/30 text-muted-foreground border-transparent hover:text-white",
              )}
            >
              Script sauvegarde (H2)
            </button>
            <button
              type="button"
              data-testid="funnel-cause-btn-h3"
              onClick={() => {
                setSimulatedCause("h3");
                setSelectedHypothesis("H3");
              }}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                simulatedCause === "h3"
                  ? "bg-[#10b981]/20 text-[#a7f3d0] border-[#10b981]"
                  : "bg-black/30 text-muted-foreground border-transparent hover:text-white",
              )}
            >
              Session suspecte (H3)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-white">
              <input
                type="checkbox"
                data-testid="funnel-claim-as-fact-checkbox"
                checked={claimAsFact}
                onChange={(e) => setClaimAsFact(e.target.checked)}
                className="accent-red-500 rounded"
              />
              <span className="text-[11px]">Affirmer comme fait certain sans preuve</span>
            </label>
          </div>
        </div>

        {/* Bandeau de verdict simple */}
        <div
          className={cn(
            "rounded-xl border p-3 flex items-center justify-between gap-3 text-xs",
            claimAsFact
              ? "border-red-500/50 bg-red-950/30 text-red-200"
              : stage === 3 && ntpDrift !== 0
                ? "border-amber-500/50 bg-amber-950/30 text-amber-100"
                : isCorroboratedClean
                  ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
                  : "border-[#223d2c] bg-[#0e1a14] text-[#cbd5e1]",
          )}
        >
          <div className="flex items-center gap-2">
            {claimAsFact ? (
              <XCircle className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
            ) : stage === 3 && ntpDrift !== 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
            ) : isCorroboratedClean ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Filter className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
            )}
            <div>
              <span data-testid="funnel-verdict-title" className="font-bold text-sm">
                {getVerdictTitle()}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {claimAsFact
                  ? "Même avec 3 sources, affirmer un fait absolu sans citer vos sources ni leurs limites (NTP, intégrité) viole la méthode d'analyse."
                  : stage === 1
                    ? "Avec 1 seule source (le journal), 3 explications restent possibles. Impossible de savoir laquelle est la bonne."
                    : stage === 2
                      ? "L'inventaire montre que 10.24.8.19 est un serveur sans écran : H1 est éliminée, mais H2 (script) et H3 (shell) restent ouvertes."
                      : ntpDrift !== 0
                        ? `Horloge décalée de ${ntpDrift > 0 ? `+${ntpDrift}` : ntpDrift}s sur 10.24.8.19 : impossible d'aligner la chronologie avant de recaler NTP.`
                        : isCase3B
                          ? "Cas 3B : aucune tâche cron à 08:14, mais un shell interactif ouvert à 08:13:55 sur 10.24.8.19 corrobore H3."
                          : "Cas 3A : les journaux locaux montrent le script backup-sync.sh lancé à 08:14:00 et 0 session interactive, corroborant H2."}
              </p>
            </div>
          </div>
        </div>

        {/* Alerte si dérive NTP */}
        {ntpDrift !== 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-[#f59e0b]/40 bg-[#78350f]/20 p-2.5 text-xs text-[#fde68a] animate-in fade-in-50">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#f59e0b]" />
            <span>
              <strong>Attention, décalage d&apos;heure détecté ({ntpDrift}s) :</strong> Les deux
              serveurs ne sont pas à la même heure. L&apos;ordre chronologique des événements est
              trompeur et risque de fausser votre diagnostic !
            </span>
          </div>
        )}

        {/* SVG Vectoriel de l'Entonnoir avec Parois Extérieures Parfaites */}
        <div className="relative w-full aspect-[1000/520] max-h-[520px]">
          <svg
            viewBox="0 0 1000 520"
            className="h-full w-full select-none"
            aria-label="Schéma de l'entonnoir de recoupement"
          >
            <defs>
              <linearGradient id="funnelWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
              </linearGradient>

              <filter id="corroboratedGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* PAROI DE L'ENTONNOIR : ENVELOPPE EXTÉRIEURE PARFAITE SANS COUPER LES BOÎTES */}
            <path
              d="M 130 20 L 190 170 L 250 280 L 310 400 L 310 465"
              stroke="url(#funnelWallGrad)"
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="8 4"
            />
            <path
              d="M 870 20 L 810 170 L 750 280 L 690 400 L 690 465"
              stroke="url(#funnelWallGrad)"
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="8 4"
            />

            {/* ÉTAGE 1 : SOURCE 1 · JOURNAL SSHD (x=180..820, width=640) */}
            <g id="tier-1-group">
              <rect
                x="180"
                y="20"
                width="640"
                height="75"
                rx="10"
                fill="#0d1813"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text x="200" y="42" fill="#38bdf8" fontSize="12" fontWeight="bold">
                SOURCE 1 · JOURNAL CIBLE : /var/log/auth.log sur srv-paie-01
              </text>
              <text x="200" y="60" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
                Oct 24 08:14:02 srv-paie-01 sshd[18420]: Failed password for c.moreau from
                10.24.8.19
              </text>
              <text x="200" y="78" fill="#bae6fd" fontSize="10">
                → Fait certain : 3 échecs en 7s. Mais 3 explications différentes sont possibles !
              </text>

              {/* Piste H1 (Gauche) */}
              <g
                transform="translate(190, 105)"
                role="button"
                tabIndex={0}
                aria-label="Sélectionner la piste H1 : faute de frappe de Claire"
                className="cursor-pointer"
                onClick={() => setSelectedHypothesis("H1")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedHypothesis("H1");
                  }
                }}
              >
                <rect
                  width="190"
                  height="48"
                  rx="6"
                  fill={
                    stage >= 2 ? "#261214" : selectedHypothesis === "H1" ? "#1e3a2e" : "#12231c"
                  }
                  stroke={stage >= 2 ? "#ef4444" : "#38bdf8"}
                  strokeWidth="2"
                  strokeDasharray={stage >= 2 ? "4 2" : undefined}
                  opacity={stage >= 2 ? 0.72 : 1}
                />
                <text
                  x="10"
                  y="20"
                  fill={stage >= 2 ? "#fda4af" : "#7dd3fc"}
                  fontSize="10"
                  fontWeight="bold"
                >
                  PISTE H1 · FAUTE DE CLAIRE
                </text>
                <text x="10" y="34" fill={stage >= 2 ? "#fda4af" : "#e0f2fe"} fontSize="9">
                  {stage >= 2 ? "✗ ÉLIMINÉE (Pas de clavier)" : "Possible à ce stade"}
                </text>
              </g>

              {/* Piste H2 (Centre) */}
              <g
                transform="translate(405, 105)"
                role="button"
                tabIndex={0}
                aria-label="Sélectionner la piste H2 : script de sauvegarde"
                data-testid="funnel-select-hyp-h2"
                className="cursor-pointer"
                onClick={() => setSelectedHypothesis("H2")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedHypothesis("H2");
                  }
                }}
              >
                <rect
                  width="190"
                  height="48"
                  rx="6"
                  fill={
                    stage === 3 && !isCase3B
                      ? "#064e3b"
                      : stage === 3 && isCase3B
                        ? "#261214"
                        : selectedHypothesis === "H2"
                          ? "#1e3a2e"
                          : "#12231c"
                  }
                  stroke={
                    stage === 3 && !isCase3B
                      ? "#10b981"
                      : stage === 3 && isCase3B
                        ? "#ef4444"
                        : "#38bdf8"
                  }
                  strokeWidth="2"
                  strokeDasharray={stage === 3 && isCase3B ? "4 2" : undefined}
                  opacity={stage === 3 && isCase3B ? 0.72 : 1}
                  filter={
                    stage === 3 && !isCase3B && ntpDrift === 0
                      ? "url(#corroboratedGlow)"
                      : undefined
                  }
                />
                <text
                  x="10"
                  y="20"
                  fill={
                    stage === 3 && !isCase3B
                      ? "#a7f3d0"
                      : stage === 3 && isCase3B
                        ? "#fda4af"
                        : "#7dd3fc"
                  }
                  fontSize="10"
                  fontWeight="bold"
                >
                  PISTE H2 · SCRIPT SAUVEGARDE
                </text>
                <text
                  x="10"
                  y="34"
                  fill={
                    stage === 3 && !isCase3B
                      ? "#ecfdf5"
                      : stage === 3 && isCase3B
                        ? "#fda4af"
                        : "#e0f2fe"
                  }
                  fontSize="9"
                  fontWeight={stage === 3 && !isCase3B ? "bold" : "normal"}
                >
                  {stage === 3
                    ? isCase3B
                      ? "✗ ÉCARTÉE (Aucun cron à 08:14)"
                      : ntpDrift === 0
                        ? "✓ CORROBORÉE (Cas 3A)"
                        : "⚠ À confirmer (dérive NTP)"
                    : "Possible à ce stade"}
                </text>
              </g>

              {/* Piste H3 (Droite) */}
              <g
                transform="translate(620, 105)"
                role="button"
                tabIndex={0}
                aria-label="Sélectionner la piste H3 : attaque ou intrus"
                data-testid="funnel-select-hyp-h3"
                className="cursor-pointer"
                onClick={() => setSelectedHypothesis("H3")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedHypothesis("H3");
                  }
                }}
              >
                <rect
                  width="190"
                  height="48"
                  rx="6"
                  fill={
                    stage === 3 && isCase3B
                      ? "#064e3b"
                      : stage === 3 && !isCase3B
                        ? "#261214"
                        : selectedHypothesis === "H3"
                          ? "#1e3a2e"
                          : "#12231c"
                  }
                  stroke={
                    stage === 3 && isCase3B
                      ? "#10b981"
                      : stage === 3 && !isCase3B
                        ? "#ef4444"
                        : "#38bdf8"
                  }
                  strokeWidth="2"
                  strokeDasharray={stage === 3 && !isCase3B ? "4 2" : undefined}
                  opacity={stage === 3 && !isCase3B ? 0.72 : 1}
                  filter={
                    stage === 3 && isCase3B && ntpDrift === 0 ? "url(#corroboratedGlow)" : undefined
                  }
                />
                <text
                  x="10"
                  y="20"
                  fill={
                    stage === 3 && isCase3B
                      ? "#a7f3d0"
                      : stage === 3 && !isCase3B
                        ? "#fda4af"
                        : "#7dd3fc"
                  }
                  fontSize="10"
                  fontWeight="bold"
                >
                  PISTE H3 · SESSION SHELL / INTRUS
                </text>
                <text
                  x="10"
                  y="34"
                  fill={
                    stage === 3 && isCase3B
                      ? "#ecfdf5"
                      : stage === 3 && !isCase3B
                        ? "#fda4af"
                        : "#e0f2fe"
                  }
                  fontSize="9"
                  fontWeight={stage === 3 && isCase3B ? "bold" : "normal"}
                >
                  {stage === 3
                    ? isCase3B
                      ? ntpDrift === 0
                        ? "✓ CORROBORÉE (Cas 3B)"
                        : "⚠ À confirmer (dérive NTP)"
                      : "✗ ÉCARTÉE (0 session shell)"
                    : "Possible à ce stade"}
                </text>
              </g>
            </g>

            {/* ÉTAGE 2 : SOURCE 2 · INVENTAIRE RÉSEAU (x=240..760, width=520) */}
            <g id="tier-2-group" opacity={stage >= 2 ? 1 : 0.58}>
              <rect
                x="240"
                y="170"
                width="520"
                height="90"
                rx="10"
                fill="#141c17"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text x="260" y="193" fill="#f59e0b" fontSize="12" fontWeight="bold">
                SOURCE 2 · INVENTAIRE DES MACHINES : Qui possède l&apos;IP 10.24.8.19 ?
              </text>
              <text x="260" y="211" fill="#fef3c7" fontSize="10" fontFamily="monospace">
                Machine : srv-backup-interne · Salle Serveurs (Baie B04)
              </text>
              <text x="260" y="227" fill="#d1d5db" fontSize="9.5">
                Type : Serveur automatique sans écran ni clavier physique.
              </text>
              <text x="260" y="243" fill="#cbd5e1" fontSize="9.5">
                Le poste de Claire Moreau est une autre machine (10.24.2.45 au bureau 204).
              </text>
              {stage >= 2 && (
                <text x="260" y="256" fill="#fda4af" fontSize="10" fontWeight="bold">
                  ⚡ Résultat : Claire n&apos;est pas devant cette machine → La piste H1 est
                  éliminée !
                </text>
              )}
            </g>

            {/* ÉTAGE 3 : SOURCE 3 · JOURNAUX DU SERVEUR ÉMETTEUR (x=300..700, width=400) */}
            <g id="tier-3-group" opacity={stage >= 3 ? 1 : 0.58}>
              <rect
                x="300"
                y="280"
                width="400"
                height="95"
                rx="10"
                fill={isCase3B ? "#241316" : "#081f15"}
                stroke={ntpDrift !== 0 ? "#f59e0b" : isCase3B ? "#fb7185" : "#10b981"}
                strokeWidth="2.5"
              />
              <text
                x="320"
                y="303"
                fill={ntpDrift !== 0 ? "#fcd34d" : isCase3B ? "#fda4af" : "#10b981"}
                fontSize="11.5"
                fontWeight="bold"
              >
                {isCase3B
                  ? "SOURCE 3 (CAS 3B) · SESSIONS LOCALES SUR 10.24.8.19"
                  : "SOURCE 3 (CAS 3A) · JOURNAUX CRON SUR 10.24.8.19"}
              </text>
              <text x="320" y="322" fill="#ecfdf5" fontSize="9.5" fontFamily="monospace">
                {isCase3B
                  ? `${source3ShellTime} audit-sessions: Shell interactif ouvert sur 10.24.8.19`
                  : `${source3TimeA} CRON: Lancement de /usr/local/bin/backup-sync.sh`}
              </text>
              <text x="320" y="338" fill="#fda4af" fontSize="9.5" fontFamily="monospace">
                {isCase3B
                  ? `${source3TimeB} ssh client: 3 commandes manuelles vers c.moreau`
                  : `${source3TimeB} sync-paie-backup: Échec mot de passe pour c.moreau`}
              </text>
              <text
                x="320"
                y="356"
                fill={ntpDrift !== 0 ? "#fde68a" : isCase3B ? "#fda4af" : "#6ee7b7"}
                fontSize="10"
                fontWeight="bold"
              >
                {ntpDrift !== 0
                  ? `⚠ Dérive NTP (${ntpDrift > 0 ? `+${ntpDrift}` : ntpDrift}s) : recalez l'horloge avant de corréler !`
                  : isCase3B
                    ? "⚠ Aucune tâche cron : H3 corroborée → escalade sécurité."
                    : "✓ Script exécuté à 08:14:00 et 0 session shell : H2 corroborée."}
              </text>
            </g>

            {/* SORTIE DE L'ENTONNOIR (x=340..660, width=320) */}
            <g id="funnel-spout-group" opacity={stage >= 3 ? 1 : 0.58}>
              <rect
                x="340"
                y="400"
                width="320"
                height="55"
                rx="8"
                fill={
                  stage === 3 && ntpDrift !== 0
                    ? "#422006"
                    : stage === 3 && isCase3B
                      ? "#4c0519"
                      : "#064e3b"
                }
                stroke={
                  stage === 3 && ntpDrift !== 0
                    ? "#f59e0b"
                    : stage === 3 && isCase3B
                      ? "#fb7185"
                      : "#10b981"
                }
                strokeWidth="3"
                filter={isCorroboratedClean ? "url(#corroboratedGlow)" : undefined}
              />
              <text
                x="500"
                y="424"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                RÉSULTAT DU RECOUPEMENT
              </text>
              <text
                x="500"
                y="442"
                fill={stage === 3 && ntpDrift !== 0 ? "#fde68a" : "#e2f7eb"}
                fontSize="10.5"
                fontWeight="bold"
                textAnchor="middle"
              >
                {stage < 3
                  ? "Recoupement en cours..."
                  : ntpDrift !== 0
                    ? "⚠ CHRONOLOGIE BLOQUÉE (DÉRIVE NTP)"
                    : isCase3B
                      ? "✓ H3 CORROBORÉE (AVEC LIMITES DU MODÈLE)"
                      : "✓ H2 CORROBORÉE (AVEC LIMITES DU MODÈLE)"}
              </text>
            </g>
          </svg>
        </div>

        {/* Explication sous le schéma */}
        <div className="mt-2 text-center text-xs text-[#8ea394]">
          💡 En croisant 3 sources indépendantes, les fausses pistes s&apos;éliminent
          d&apos;elles-mêmes comme dans un entonnoir.
        </div>
      </div>
    </div>
  );
}
