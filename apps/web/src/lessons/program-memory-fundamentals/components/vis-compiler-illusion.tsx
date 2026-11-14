"use client";

import * as React from "react";
import { Terminal } from "lucide-react";
import { ConceptTransformBanner } from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@cyber-school/ui";

/**
 * Interactive Compiler Illusion Explorer: Compare gcc -O0 vs gcc -O2 (+ &x address taken).
 */
export function VisCompilerIllusion() {
  const [optLevel, setOptLevel] = React.useState<"O0" | "O2">("O0");
  const [addressTaken, setAddressTaken] = React.useState(false);

  const stackEliminated = optLevel === "O2" && !addressTaken;

  return (
    <Card data-testid="gdb-compiler-reality-card" className="overflow-hidden border-primary/25">
      <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-base sm:text-lg">
              Explorer : où vit vraiment <code className="font-mono">int x = 42</code> après{" "}
              <code className="font-mono">gcc -{optLevel}</code> ?
            </CardTitle>
          </div>
          <Badge variant={stackEliminated ? "default" : "secondary"}>
            {stackEliminated ? "0 octet sur la pile !" : "16 octets sur la pile"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={optLevel === "O0" ? "default" : "outline"}
            onClick={() => setOptLevel("O0")}
          >
            gcc -O0 (Sans optimisation)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={optLevel === "O2" ? "default" : "outline"}
            onClick={() => setOptLevel("O2")}
          >
            gcc -O2 (Optimisé)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={addressTaken ? "secondary" : "outline"}
            onClick={() => setAddressTaken((v) => !v)}
            aria-pressed={addressTaken}
          >
            {addressTaken ? "Prendre &x : OUI (exposé)" : "Prendre &x : NON"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <ConceptTransformBanner
          stepKey={`${optLevel}-${addressTaken}`}
          cause={`gcc -${optLevel} · ${addressTaken ? "adresse &x utilisée" : "x locale pure"}`}
          mechanism={
            stackEliminated
              ? "Le compilateur supprime la variable en RAM et plie 42 directement dans le registre EAX"
              : optLevel === "O2" && addressTaken
                ? "Comme &x est transmise hors de la fonction, le compilateur doit matérialiser x sur la pile"
                : "En -O0, chaque variable reçoit une case mémoire dédiée [rbp-4] inspectable dans GDB"
          }
          effectDelta={stackEliminated ? "RAM 0 o · EAX = 42" : "[rbp-4] = 0x2A"}
          tone={stackEliminated ? "causal" : "success"}
        />

        <div className="rounded-xl border border-border bg-background/80 p-3">
          <svg
            viewBox="0 0 720 138"
            className="h-auto w-full"
            role="img"
            aria-label={`Compilation gcc -${optLevel}, pile ${stackEliminated ? "supprimée" : "allouée"}`}
          >
            {/* C Source */}
            <rect
              x="12"
              y="18"
              width="210"
              height="102"
              rx="10"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
            />
            <text x="24" y="38" className="fill-primary text-[10px] font-bold uppercase">
              Code C écrit
            </text>
            <text x="24" y="60" className="fill-foreground font-mono text-[11px]">
              int x = 42;
            </text>
            <text x="24" y="79" className="fill-muted-foreground font-mono text-[10px]">
              {addressTaken ? "observe(&x);" : "// pas d'adresse &x"}
            </text>
            <text x="24" y="98" className="fill-foreground font-mono text-[11px]">
              return x;
            </text>

            {/* Arrow -> CPU vs Stack */}
            <line
              x1="222"
              y1="68"
              x2="274"
              y2="68"
              stroke="hsl(var(--primary))"
              strokeWidth="2.4"
            />
            <polygon points="274,63 284,68 274,73" fill="hsl(var(--primary))" />

            {/* CPU EAX */}
            <rect
              x="286"
              y="18"
              width="190"
              height="102"
              rx="10"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="1.6"
            />
            <text x="300" y="38" className="fill-primary text-[10px] font-bold uppercase">
              Assembleur réel
            </text>
            <text x="300" y="62" className="fill-foreground font-mono text-[10.5px] font-bold">
              {stackEliminated ? "mov eax, 42" : "sub rsp, 16"}
            </text>
            <text x="300" y="80" className="fill-muted-foreground font-mono text-[10px]">
              {stackEliminated ? "ret  ; aucune lecture RAM" : "mov DWORD PTR [rbp-4], 42"}
            </text>
            <text x="300" y="98" className="fill-emerald-400 font-mono text-[10px]">
              {stackEliminated ? "EAX = 42 (constante pliée)" : "(gdb) x/4bx $rbp-4 -> 2a 00 00 00"}
            </text>

            {/* RAM Stack Presence */}
            <rect
              x="496"
              y="18"
              width="212"
              height="102"
              rx="10"
              fill={stackEliminated ? "transparent" : "#10b9811a"}
              stroke={stackEliminated ? "#64748b" : "#10b981"}
              strokeDasharray={stackEliminated ? "5 4" : undefined}
              strokeWidth="1.8"
            />
            <text x="510" y="38" className="fill-foreground text-[10px] font-bold uppercase">
              Trame sur la Pile (RAM)
            </text>
            <text
              x="602"
              y="72"
              textAnchor="middle"
              className={
                stackEliminated
                  ? "fill-muted-foreground font-mono text-[12px] font-bold"
                  : "fill-emerald-400 font-mono text-[14px] font-bold"
              }
            >
              {stackEliminated ? "ÉLIMINÉE PAR -O2" : "[rbp-4] = 0x2A 00 00 00"}
            </text>
            <text
              x="602"
              y="96"
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9.5px]"
            >
              {stackEliminated
                ? "Le modèle visuel simplifie l'optimisation"
                : "4 octets little-endian en RAM"}
            </text>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
