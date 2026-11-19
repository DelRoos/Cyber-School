"use client";

import * as React from "react";
import gsap from "gsap";
import { CheckCircle2, Eye, HelpCircle, RotateCcw, Sliders, Target, XCircle } from "lucide-react";
import {
  MotionStepPanel,
  getStepDuration,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";

type ChoiceId = "zeroed" | "residual" | "blocked";

const CHOICES: Array<{
  id: ChoiceId;
  label: string;
  correct: boolean;
  explanation: string;
}> = [
  {
    id: "zeroed",
    label: "Elle est immédiatement remise à 0x00 par le CPU.",
    correct: false,
    explanation:
      "Remettre chaque octet à zéro à chaque retour de fonction ralentirait les appels : le CPU ne fait que remonter le curseur RSP en 1 cycle.",
  },
  {
    id: "residual",
    label: "La valeur 42 reste intacte en RAM jusqu'à réutilisation.",
    correct: true,
    explanation:
      "Exact. Libérer une frame de pile remonte uniquement le pointeur RSP : les octets résiduels restent lisibles jusqu'au prochain appel qui les écrase.",
  },
  {
    id: "blocked",
    label: "La MMU détruit l'adresse virtuelle à chaque return.",
    correct: false,
    explanation:
      "La pile reste une page mappée en lecture/écriture tant que le thread vit ; c'est pourquoi un pointeur pendant lit encore l'ancienne valeur.",
  },
];

export function LandingMethodSandbox() {
  const challengeRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = React.useState<ChoiceId | null>(null);
  const activeChoice = CHOICES.find((c) => c.id === selected) ?? null;

  useGsapScope(challengeRef, () => {
    if (reducedMotion || !selected) return;
    gsap.fromTo(
      "[data-stack-caller]",
      { y: 12 },
      {
        y: 0,
        duration: getStepDuration(0.3, reducedMotion),
        ease: "power2.out",
        clearProps: "transform",
      },
    );
    gsap.fromTo(
      "[data-stack-ghost]",
      { scale: 0.98 },
      {
        scale: 1,
        duration: getStepDuration(0.28, reducedMotion),
        ease: "power2.out",
        clearProps: "transform",
      },
    );
  }, [selected, reducedMotion]);

  return (
    <section id="method" className="method-showcase" aria-labelledby="method-heading">
      <div className="method-copy">
        <p className="section-eyebrow">Ce qui nous différencie</p>
        <h2 id="method-heading">
          Notre méthodologie active
          <br />
          et nos moyens visuels.
        </h2>
        <p className="method-lead">
          On n&apos;apprend pas la cybersécurité en empilant des fiches passives. Ici, notre méthode
          et nos outils visuels vous font voir et manipuler chaque mécanisme avant d&apos;ancrer
          l&apos;invariant.
        </p>

        <ul className="method-pillars">
          <li>
            <span className="pillar-icon" aria-hidden="true">
              <Eye size={17} />
            </span>
            <div>
              <h3>01 · Observer le mécanisme</h3>
              <p>
                Registres, pile d&apos;appels, pagination et paquets TCP sont rendus lisibles et
                concrets dès la première minute.
              </p>
            </div>
          </li>
          <li>
            <span className="pillar-icon" aria-hidden="true">
              <Sliders size={17} />
            </span>
            <div>
              <h3>02 · Manipuler avec nos moyens</h3>
              <p>
                Chaque leçon intègre des modèles interactifs pour faire varier un octet, un droit NX
                ou une perte réseau et observer la cause exacte.
              </p>
            </div>
          </li>
          <li>
            <span className="pillar-icon" aria-hidden="true">
              <Target size={17} />
            </span>
            <div>
              <h3>03 · Ancrer par la prédiction</h3>
              <p>
                Vous formulez votre intuition avant la réponse, puis un défi corrigé valide ce que
                vous avez réellement compris.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div
        ref={challengeRef}
        className="method-challenge spotlight-surface"
        aria-label="Défi interactif de démonstration"
      >
        <div className="workbench-beam" aria-hidden="true" />
        <div className="challenge-top">
          <span>
            <HelpCircle size={14} aria-hidden="true" /> Exemple de défi en cours
          </span>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="challenge-reset"
              aria-label="Réinitialiser le mini-défi"
            >
              <RotateCcw size={13} aria-hidden="true" /> Réessayer
            </button>
          )}
        </div>

        <p className="challenge-prompt">
          Une fonction termine avec <code>return</code>. Sa variable locale <code>secret = 42</code>{" "}
          était à l&apos;adresse <code>0x7FF4</code>. Que contient encore <code>0x7FF4</code> juste
          après le retour ?
        </p>

        <div className="challenge-diagram" aria-hidden="true">
          <div className="stack-header-row">
            <span>Adresse</span>
            <span>Contenu</span>
            <span>Registre</span>
          </div>
          <div className={selected ? "stack-slot is-active" : "stack-slot"} data-stack-caller>
            <code>0x7FF8</code>
            <span>frame appelant</span>
            <code className="rsp-badge">{selected ? "◀ RSP (après return)" : "en attente"}</code>
          </div>
          <div
            className={selected ? "stack-slot is-ghost" : "stack-slot is-active"}
            data-stack-ghost
          >
            <code>0x7FF4</code>
            <span>secret = 42</span>
            <code className="rsp-badge">{selected ? "42 (résiduel)" : "◀ RSP (avant return)"}</code>
          </div>
          <div className="stack-slot">
            <code>0x7FF0</code>
            <span>zone libre</span>
            <code>—</code>
          </div>
        </div>

        <div className="challenge-options" role="radiogroup" aria-label="Choix de réponse">
          {CHOICES.map((choice) => {
            const isPicked = selected === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={isPicked}
                onClick={() => setSelected(choice.id)}
                className={
                  isPicked
                    ? choice.correct
                      ? "challenge-option is-correct"
                      : "challenge-option is-wrong"
                    : "challenge-option"
                }
              >
                <span>{choice.label}</span>
              </button>
            );
          })}
        </div>

        {activeChoice && (
          <MotionStepPanel stepKey={activeChoice.id}>
            <div
              className={
                activeChoice.correct ? "challenge-feedback is-ok" : "challenge-feedback is-err"
              }
              role="status"
            >
              {activeChoice.correct ? (
                <CheckCircle2 size={17} aria-hidden="true" />
              ) : (
                <XCircle size={17} aria-hidden="true" />
              )}
              <p>{activeChoice.explanation}</p>
            </div>
          </MotionStepPanel>
        )}
      </div>
    </section>
  );
}
