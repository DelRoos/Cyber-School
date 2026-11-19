"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Columns3, Layers } from "lucide-react";
import { cn } from "@cyber-school/ui";

interface MedicolegalTriptychDiagramProps {
  activeCueId?: string;
  activeCueIndex?: number;
  isPlaying?: boolean;
}

export function MedicolegalTriptychDiagram({
  activeCueId,
  activeCueIndex = 0,
  isPlaying = false,
}: MedicolegalTriptychDiagramProps) {
  const [activeTab, setActiveTab] = useState<"triptych" | "matrix">("triptych");
  const [decontaminatedWords, setDecontaminatedWords] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  // Synchronisation avec l'audio
  const isLaserActive = Boolean(
    activeCueId?.startsWith("ch4-s1") ||
    activeCueId?.startsWith("ch4-s2") ||
    activeCueId?.startsWith("ch4-cue-6") ||
    activeCueId?.startsWith("ch4-cue-7") ||
    activeCueIndex === 0 ||
    activeCueIndex === 1,
  );
  const isCanonActive = Boolean(
    activeCueId?.startsWith("ch4-s2") || activeCueId?.startsWith("ch4-cue-8"),
  );
  const isMatrixCue = Boolean(
    activeCueId?.startsWith("ch4-s3") ||
    activeCueId?.startsWith("ch4-cue-9") ||
    activeCueId?.startsWith("ch4-cue-10") ||
    activeCueIndex === 2,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMatrixCue) {
        setActiveTab("matrix");
      } else if (
        activeCueId?.startsWith("ch4-cue-2") ||
        activeCueId?.startsWith("ch4-cue-3") ||
        isLaserActive ||
        isCanonActive ||
        activeCueIndex <= 7
      ) {
        setActiveTab("triptych");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [activeCueId, activeCueIndex, isMatrixCue, isLaserActive, isCanonActive]);

  // Élimination automatique des mots pièges pendant l'audio
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isPlaying || !isLaserActive || prefersReduced) return;
    const words = ["« Attaquant »", "« Externe »", "« Force brute »", "« Piratage »"];
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        const w = words[i];
        if (w) {
          setDecontaminatedWords((prev) => (prev.includes(w) ? prev : [...prev, w]));
        }
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1600);
    return () => clearInterval(interval);
  }, [isPlaying, isLaserActive]);

  const TOXIC_WORDS = [
    { word: "« Attaquant »", reason: "On ne connaît pas l'intention de la personne." },
    {
      word: "« Externe »",
      reason: "Faux : 10.24.8.19 est une IP interne à l'entreprise.",
    },
    {
      word: "« Force brute »",
      reason: "3 essais en 7s peuvent être une simple erreur ou un script.",
    },
    {
      word: "« Piratage »",
      reason: "C'est une accusation juridique non prouvée par les journaux.",
    },
  ];

  const handleDecontaminate = (w: string) => {
    if (!decontaminatedWords.includes(w)) {
      setDecontaminatedWords((prev) => [...prev, w]);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#233528] bg-[#0a120e] p-4 sm:p-6 shadow-2xl transition-all duration-500"
      data-testid="medicolegal-triptych-diagram"
    >
      {/* En-tête avec onglets */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2b20] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#10b981] motion-safe:animate-pulse" />
          <h4 className="text-sm font-semibold tracking-wide text-[#e3ece5]">
            Schéma 4 · Le rapport d&apos;incident en 3 volets
          </h4>
        </div>

        {/* Boutons d'onglets simples */}
        <div className="flex items-center gap-1 bg-[#101b15] p-1 rounded-xl border border-[#1f3325]">
          <button
            type="button"
            onClick={() => setActiveTab("triptych")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-all",
              activeTab === "triptych"
                ? "bg-[#10b981] text-black font-semibold shadow"
                : "text-muted-foreground hover:text-white",
            )}
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span>Rapport en 3 volets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-all",
              activeTab === "matrix"
                ? "bg-[#10b981] text-black font-semibold shadow"
                : "text-muted-foreground hover:text-white",
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Exemples d&apos;autres capteurs</span>
          </button>
        </div>
      </div>

      {activeTab === "triptych" ? (
        <div className="space-y-4">
          {/* Mots pièges à éliminer */}
          <div className="rounded-xl border border-[#ef4444]/30 bg-[#2b1013]/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#fca5a5]">
                <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
                MOTS PIÈGES À BANNIR DU RAPPORT
              </span>
              <span className="text-[11px] text-muted-foreground">
                Cliquez pour éliminer les mots trompeurs :
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOXIC_WORDS.map((item) => {
                const isBlocked =
                  decontaminatedWords.includes(item.word) || (isPlaying && isLaserActive);
                return (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => handleDecontaminate(item.word)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-mono transition-all",
                      isBlocked
                        ? "bg-[#ef4444]/10 text-[#f87171] line-through border border-[#ef4444]/40 opacity-70"
                        : "bg-[#38161a] text-[#fecaca] border border-[#ef4444] hover:bg-[#4c1d24] motion-safe:animate-pulse",
                    )}
                  >
                    <span>{item.word}</span>
                    {isBlocked ? "✗ Éliminé" : "⚠️ À bannir"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Les 3 Volets du Rapport */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Volet I */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedColumn(1)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedColumn(1);
                }
              }}
              className={cn(
                "cursor-pointer rounded-xl border p-4 space-y-2.5 transition-all duration-300",
                selectedColumn === 1 || isCanonActive
                  ? "border-[#10b981] bg-[#0b2216]/50 shadow-lg shadow-[#10b981]/10 ring-1 ring-[#10b981]/30"
                  : "border-[#1e3223] bg-[#0c1611] hover:border-[#2a4531]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#a7f3d0] uppercase tracking-wider">
                  VOLET 1 · LES FAITS
                </span>
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              </div>
              <h5 className="font-bold text-sm text-[#f5f7f0]">Faits Observés &amp; Prouvés</h5>
              <div className="rounded bg-[#08120d] p-2.5 font-mono text-[11px] text-[#cbd5e1] space-y-1 border border-[#1b2b20]">
                <p>
                  • <strong>Fichier :</strong> /var/log/auth.log sur srv-paie-01
                </p>
                <p>
                  • <strong>Heure :</strong> 08:14:02 à 08:14:09 UTC (7s)
                </p>
                <p>
                  • <strong>Événement :</strong> 3 refus de mot de passe (sshd)
                </p>
                <p>
                  • <strong>Compte :</strong> c.moreau
                </p>
                <p>
                  • <strong>Adresse source :</strong> 10.24.8.19 (Réseau interne)
                </p>
              </div>
              <p className="text-[11px] text-[#86efac]">
                ✓ Aucun jugement moral · Aucun scénario inventé.
              </p>
            </div>

            {/* Volet II */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedColumn(2)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedColumn(2);
                }
              }}
              className={cn(
                "cursor-pointer rounded-xl border p-4 space-y-2.5 transition-all duration-300",
                selectedColumn === 2
                  ? "border-[#38bdf8] bg-[#082333]/50 shadow-lg shadow-[#38bdf8]/10 ring-1 ring-[#38bdf8]/30"
                  : "border-[#1e3223] bg-[#0c1611] hover:border-[#2a4531]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#7dd3fc] uppercase tracking-wider">
                  VOLET 2 · LES HYPOTHÈSES
                </span>
                <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
              </div>
              <h5 className="font-bold text-sm text-[#f5f7f0]">Pistes &amp; Recoupement</h5>
              <div className="space-y-1.5 text-xs text-[#cbd5e1]">
                <div className="rounded bg-[#08120d] p-2 border border-[#1b2b20]">
                  <strong className="text-[#f87171]">Piste H1 (Claire) :</strong> Éliminée par
                  l&apos;inventaire (la machine est un serveur sans écran).
                </div>
                <div className="rounded bg-[#08120d] p-2 border border-[#1b2b20]">
                  <strong className="text-[#10b981]">Piste H2 (Script) :</strong> Confirmée par les
                  journaux (backup-sync.sh lancé à 08:14:00).
                </div>
                <div className="rounded bg-[#08120d] p-2 border border-[#1b2b20]">
                  <strong className="text-[#f87171]">Piste H3 (Intrus) :</strong> Éliminée par
                  l&apos;absence de session interactive.
                </div>
              </div>
              <p className="text-[11px] text-[#7dd3fc]">
                ⚖️ Les pistes sont éliminées ou confirmées avec des preuves.
              </p>
            </div>

            {/* Volet III */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedColumn(3)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedColumn(3);
                }
              }}
              className={cn(
                "cursor-pointer rounded-xl border p-4 space-y-2.5 transition-all duration-300",
                selectedColumn === 3
                  ? "border-[#f59e0b] bg-[#291b0a]/50 shadow-lg shadow-[#f59e0b]/10 ring-1 ring-[#f59e0b]/30"
                  : "border-[#1e3223] bg-[#0c1611] hover:border-[#2a4531]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#fde68a] uppercase tracking-wider">
                  VOLET 3 · ACTIONS
                </span>
                <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              </div>
              <h5 className="font-bold text-sm text-[#f5f7f0]">Actions Recommandées</h5>
              <div className="space-y-1.5 text-xs text-[#cbd5e1]">
                <div className="rounded bg-[#08120d] p-2 border border-[#1b2b20]">
                  <strong>1. Mise à jour :</strong> Renouveler le mot de passe dans le script de
                  sauvegarde.
                </div>
                <div className="rounded bg-[#08120d] p-2 border border-[#1b2b20]">
                  <strong>2. Heure (NTP) :</strong> Vérifier la synchronisation d&apos;heure entre
                  les deux serveurs.
                </div>
                <div className="rounded bg-[#08120d] p-2 border border-[#1b2b20]">
                  <strong className="text-[#10b981]">3. Continuité :</strong> Inutile de couper le
                  serveur de paie !
                </div>
              </div>
              <p className="text-[11px] text-[#fde68a]">
                🛡️ Mesures ciblées sans arrêt inutile des services.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Tableau comparatif d'autres capteurs */
        <div className="space-y-3 animate-in fade-in-50">
          <p className="text-xs text-[#a3b8aa]">
            Ce réflexe s&apos;applique à tous les outils de sécurité de l&apos;entreprise :
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#1f3325]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#14231b] text-[#c8ed97] border-b border-[#1f3325]">
                  <th className="p-2.5 font-semibold">Outil / Capteur</th>
                  <th className="p-2.5 font-semibold">Ce qui est réellement mesuré</th>
                  <th className="p-2.5 font-semibold">L&apos;erreur d&apos;interprétation</th>
                  <th className="p-2.5 font-semibold">La vérification à faire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18291e] text-[#cbd5e1]">
                <tr>
                  <td className="p-2.5 font-bold text-white">Connexion SSH</td>
                  <td className="p-2.5 font-mono">3 échecs en 7 secondes</td>
                  <td className="p-2.5 text-[#f87171]">« Attaque par force brute »</td>
                  <td className="p-2.5 text-[#86efac]">Vérifier l&apos;adresse dans la CMDB</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Pare-feu (Firewall)</td>
                  <td className="p-2.5 font-mono">Paquets bloqués sur port 445</td>
                  <td className="p-2.5 text-[#f87171]">« Virus qui se propage »</td>
                  <td className="p-2.5 text-[#86efac]">Vérifier le trafic normal Windows</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Antivirus / EDR</td>
                  <td className="p-2.5 font-mono">Programme non signé bloqué</td>
                  <td className="p-2.5 text-[#fda4af]">« Logiciel espion pirate »</td>
                  <td className="p-2.5 text-[#c8ed97]">
                    Vérifier le registre des maintenances et le contenu du script
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Sauvegarde</td>
                  <td className="p-2.5 font-mono">Rejet pour quota dépassé</td>
                  <td className="p-2.5 text-[#fda4af]">« Sabotage volontaire »</td>
                  <td className="p-2.5 text-[#c8ed97]">
                    Vérifier l&apos;espace disque réel et l&apos;historique des archives
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pied du schéma */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#8ea394]">
        <span>
          💡 Un rapport professionnel sépare toujours faits prouvés et hypothèses vérifiées.
        </span>
        <span className="font-mono text-[#a3b8aa]">Rapport d&apos;incident irréprochable</span>
      </div>
    </div>
  );
}
