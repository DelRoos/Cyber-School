"use client";

import * as React from "react";
import { usePrefersReducedMotion } from "@cyber-school/animations";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  tone: "lime" | "ice";
}

export function HeroAtmosphereCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let time = 0;
    let isVisible = true;

    const particles: Particle[] = Array.from({ length: 28 }, (_, index) => ({
      x: ((index * 137) % 100) / 100,
      y: ((index * 73) % 100) / 100,
      vx: ((index % 5) - 2) * 0.00022,
      vy: -0.00018 - (index % 3) * 0.00009,
      radius: 0.9 + (index % 3) * 0.55,
      alpha: 0.14 + (index % 4) * 0.07,
      tone: index % 3 === 0 ? "ice" : "lime",
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
      if (!isVisible || document.hidden) {
        rafId = 0;
        return;
      }

      rafId = window.requestAnimationFrame(drawFrame);
      if (width === 0 || height === 0) return;

      time += 0.0085;
      context.clearRect(0, 0, width, height);

      // Subtle atmospheric harmonic wave folds (lime -> experimental blue)
      const bandCount = 9;
      for (let i = 0; i < bandCount; i += 1) {
        const baseY = height * (0.2 + (i / (bandCount - 1)) * 0.68);
        const envelope = Math.sin((i / (bandCount - 1)) * Math.PI);
        context.strokeStyle = i % 3 === 0 ? "#a9c7fa" : "#c8ed97";
        context.lineWidth = i % 2 === 0 ? 1 : 0.75;
        context.globalAlpha = (0.025 + 0.045 * envelope) * (0.75 + 0.25 * Math.sin(time + i));
        context.beginPath();

        const step = 28;
        for (let x = 0; x <= width + step; x += step) {
          const wave =
            Math.sin(x * 0.0048 + time * 1.4 + i * 0.52) * (14 + envelope * 16) +
            Math.cos(x * 0.0022 - time * 0.9 + i) * 7;
          if (x === 0) {
            context.moveTo(x, baseY + wave);
          } else {
            context.lineTo(x, baseY + wave);
          }
        }
        context.stroke();
      }

      // Soft vertical light beam sweeping quietly across the backdrop
      const beamX = width * (0.62 + 0.16 * Math.sin(time * 0.45));
      const beamGradient = context.createLinearGradient(beamX - 90, 0, beamX + 90, 0);
      beamGradient.addColorStop(0, "transparent");
      beamGradient.addColorStop(0.5, "rgba(200, 237, 151, 0.055)");
      beamGradient.addColorStop(1, "transparent");
      context.globalAlpha = 1;
      context.fillStyle = beamGradient;
      context.fillRect(beamX - 90, 0, 180, height);

      // Drifting low-density signal nodes
      for (const particle of particles) {
        particle.x = (particle.x + particle.vx + 1) % 1;
        particle.y = (particle.y + particle.vy + 1) % 1;

        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.tone === "lime" ? "#c8ed97" : "#a9c7fa";
        context.beginPath();
        context.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const startLoop = () => {
      if (!rafId && isVisible && !document.hidden) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        if (isVisible) {
          startLoop();
        } else if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    startLoop();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="hero-atmosphere-canvas" aria-hidden="true" />;
}
