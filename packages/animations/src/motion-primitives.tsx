"use client";

import * as React from "react";
import { MotionConfig, motion } from "motion/react";
import { usePrefersReducedMotion } from "./reduced-motion.js";

export interface MotionStepPanelProps {
  stepKey: string | number;
  children: React.ReactNode;
  className?: string;
}

export function MotionStepPanel({ stepKey, children, className }: MotionStepPanelProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        key={stepKey}
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
