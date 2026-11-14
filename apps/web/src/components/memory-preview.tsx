"use client";

import * as React from "react";
import { ArrowDown, Minus, Plus } from "lucide-react";

export function MemoryPreview() {
  const [value, setValue] = React.useState(42);
  const bits = value.toString(2).padStart(8, "0").split("");
  return (
    <div className="memory-preview" aria-label="Mini-expérience : représenter un nombre en mémoire">
      <div className="experiment-top">
        <span>
          <span className="signal-dot" /> Expérience ouverte
        </span>
        <span>Mémoire / 001</span>
      </div>
      <div className="experiment-question">
        Où se cache le nombre <strong>{value}</strong> ?
      </div>
      <div className="experiment-value">
        <button
          onClick={() => setValue((v) => Math.max(0, v - 1))}
          disabled={value === 0}
          aria-label="Diminuer le nombre"
        >
          <Minus size={18} />
        </button>
        <output aria-live="polite">
          {value}
          <span>en décimal</span>
        </output>
        <button
          onClick={() => setValue((v) => Math.min(255, v + 1))}
          disabled={value === 255}
          aria-label="Augmenter le nombre"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="experiment-wire">
        <ArrowDown size={24} aria-hidden="true" />
        <span>La même valeur, vue par la machine</span>
      </div>
      <div className="bit-grid" aria-label={`${value} en binaire : ${bits.join("")}`}>
        {bits.map((bit, i) => (
          <div key={i} className={bit === "1" ? "bit-cell is-one" : "bit-cell"}>
            <span className="bit-weight">{2 ** (7 - i)}</span>
            <span>{bit}</span>
          </div>
        ))}
      </div>
      <div className="memory-address">
        <span>
          Adresse <code>0x1000</code>
        </span>
        <span>1 octet = 8 bits</span>
      </div>
      <p className="experiment-caption">
        <span className="experiment-caption-mark">↳</span> Changez le nombre. Les cases actives
        montrent comment huit bits suffisent à représenter une valeur de 0 à 255.
      </p>
      <div className="experiment-bottom">
        <span>Vous venez de lire votre premier octet.</span>
        <span aria-hidden="true">● ● ●</span>
      </div>
    </div>
  );
}
