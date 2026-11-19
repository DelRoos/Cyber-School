"use client";

import * as React from "react";
import {
  BookMarked,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { CourseEditorialBlock } from "@cyber-school/lesson-runtime";
import { cn } from "@cyber-school/ui";

type WorkedExampleBlock = Extract<CourseEditorialBlock, { type: "worked-example" }>;
type MicroCheckBlock = Extract<CourseEditorialBlock, { type: "micro-check" }>;
type ReferenceSheetBlock = Extract<CourseEditorialBlock, { type: "reference-sheet" }>;

export function WorkedExampleCard({
  block,
  renderInline,
}: {
  block: WorkedExampleBlock;
  renderInline: (text: string) => React.ReactNode[];
}) {
  return (
    <section
      aria-label={`Exemple résolu : ${block.title}`}
      data-testid="worked-example-block"
      className="overflow-hidden rounded-2xl border border-[#2d3e31] bg-[#131815]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#253328] bg-[#18211b] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#c8ed97]/15 text-[#c8ed97]">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <h3 className="text-[15.5px] font-bold text-[#f5f7f0]">{block.title}</h3>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#c8ed97]">
          Exemple résolu
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#9fad9f]">
            Point de départ observé
          </p>
          <pre className="overflow-x-auto rounded-xl border border-[#263229] bg-[#0c0f0d] p-3.5 font-mono text-[12.5px] leading-relaxed text-[#e6f0e4]">
            <code>{block.startingPoint}</code>
          </pre>
        </div>

        <ol className="space-y-3.5">
          {block.steps.map((item, idx) => (
            <li key={idx} className="rounded-xl border border-[#263128] bg-[#101512] p-4 space-y-2">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3a4e3d] bg-[#1b271e] font-mono text-xs font-bold text-[#c8ed97]">
                  {idx + 1}
                </span>
                <p className="text-[15px] leading-[1.68] text-[#f0f1e9]">
                  {renderInline(item.step)}
                </p>
              </div>
              <p className="pl-9 text-[13.5px] leading-relaxed text-[#a9c7fa]">
                <strong className="font-semibold text-[#c5dbfd]">Pourquoi :</strong>{" "}
                {renderInline(item.why)}
              </p>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-[#445b3e] bg-[#182317] px-4 py-3 text-[14.5px] leading-relaxed text-[#e7f1df]">
          <strong className="font-semibold text-[#c8ed97]">Conclusion vérifiée :</strong>{" "}
          {renderInline(block.conclusion)}
        </div>
      </div>
    </section>
  );
}

export function MicroCheckCard({
  block,
  renderInline,
}: {
  block: MicroCheckBlock;
  renderInline: (text: string) => React.ReactNode[];
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selectedOption = block.options.find((opt) => opt.id === selectedId);
  const isCorrect = selectedId === block.correctOptionId;

  return (
    <section
      aria-label="Vérification rapide"
      data-testid={`micro-check-${block.id}`}
      className="rounded-2xl border border-[#2c3b46] bg-[#12191e] p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#68b8ea]">
          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Vérification rapide · Réflexe actif
        </span>
        {selectedId ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
              isCorrect ? "bg-[#c8ed97]/15 text-[#c8ed97]" : "bg-rose-500/20 text-rose-200",
            )}
          >
            {isCorrect ? "Bien vu" : "À ajuster"}
          </span>
        ) : null}
      </div>

      <p className="text-[15.5px] font-semibold leading-relaxed text-[#f5f7f0]">
        {renderInline(block.prompt)}
      </p>

      <div role="radiogroup" aria-label={block.prompt} className="space-y-2">
        {block.options.map((opt) => {
          const picked = selectedId === opt.id;
          const optCorrect = opt.id === block.correctOptionId;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={picked}
              data-testid={`micro-check-opt-${opt.id}`}
              onClick={() => setSelectedId(opt.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] leading-relaxed transition-colors",
                !selectedId &&
                  "border-[#2a373f] bg-[#0e1418] text-[#dce3db] hover:border-[#68b8ea]/60 hover:bg-[#141e24]",
                selectedId &&
                  picked &&
                  optCorrect &&
                  "border-[#c8ed97] bg-[#192618] text-[#f5f7f0]",
                selectedId &&
                  picked &&
                  !optCorrect &&
                  "border-rose-400/70 bg-rose-950/30 text-[#f5f7f0]",
                selectedId &&
                  !picked &&
                  "border-[#232e35] bg-[#0e1418]/65 text-[#9fad9f] hover:border-[#3c4d58]",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  picked && optCorrect && "border-[#c8ed97] bg-[#c8ed97]/20",
                  picked && !optCorrect && "border-rose-400 bg-rose-500/20",
                  !picked && "border-[#50606b]",
                )}
              >
                {picked ? (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      optCorrect ? "bg-[#c8ed97]" : "bg-rose-400",
                    )}
                  />
                ) : null}
              </span>
              <span className="flex-1">{renderInline(opt.label)}</span>
            </button>
          );
        })}
      </div>

      {selectedOption ? (
        <div
          role="status"
          data-testid={`micro-check-feedback-${block.id}`}
          className={cn(
            "rounded-xl border p-4 text-[14px] leading-relaxed space-y-2",
            isCorrect
              ? "border-[#4b6941] bg-[#162316] text-[#e7f1df]"
              : "border-rose-500/45 bg-rose-950/25 text-[#f3dfe3]",
          )}
        >
          <p className="flex items-center gap-2 font-semibold text-[#f5f7f0]">
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c8ed97]" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            )}
            <span>{isCorrect ? "Réflexe exact" : "Pas tout à fait — regardez pourquoi"}</span>
          </p>
          <p>{renderInline(selectedOption.feedback)}</p>
          <p className="border-t border-white/10 pt-2 text-[13px] text-[#c4cfc4]">
            <strong className="text-[#f5f7f0]">Principe :</strong> {renderInline(block.explanation)}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function ReferenceSheetCard({
  block,
  renderInline,
}: {
  block: ReferenceSheetBlock;
  renderInline: (text: string) => React.ReactNode[];
}) {
  return (
    <section
      aria-label={block.title}
      data-testid="reference-sheet-block"
      className="overflow-hidden rounded-2xl border border-[#344537] bg-[#131815]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27352a] bg-[#19221c] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <BookMarked className="h-4 w-4 text-[#c8ed97]" aria-hidden="true" />
          <h3 className="text-[17px] font-bold text-[#f5f7f0]">{block.title}</h3>
        </div>
        <span className="rounded-full border border-[#3c503f] bg-[#121914] px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[#c8ed97]">
          Fiche réflexe · Mémo terrain
        </span>
      </div>

      <div className="space-y-5 p-5">
        {block.intro ? (
          <p className="text-[14.5px] leading-relaxed text-[#b9c6ba]">
            {renderInline(block.intro)}
          </p>
        ) : null}

        <div className="space-y-5">
          {block.groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#68b8ea]">
                {group.title}
              </h4>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="rounded-xl border border-[#263128] bg-[#0f1411] p-3.5 space-y-1.5"
                  >
                    <p className="font-semibold text-[14px] text-[#f5f7f0]">{item.term}</p>
                    <p className="text-[13.5px] leading-relaxed text-[#cbd6ca]">
                      {renderInline(item.meaning)}
                    </p>
                    {item.pitfall ? (
                      <p className="flex items-start gap-1.5 pt-1 text-[12px] leading-snug text-[#f5c26b]">
                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{renderInline(item.pitfall)}</span>
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
