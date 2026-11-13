"use client";

import { useEffect, type DependencyList, type RefObject } from "react";
import gsap from "gsap";

export function useGsapScope(
  scopeRef: RefObject<HTMLElement | SVGElement | null>,
  setup: (ctx: gsap.Context) => void,
  deps: DependencyList,
): void {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context((self) => {
      setup(self);
    }, scope);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
