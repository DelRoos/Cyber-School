"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapScope, usePrefersReducedMotion } from "@cyber-school/animations";

gsap.registerPlugin(ScrollTrigger);

export function LandingMotionShell({ children }: { children: React.ReactNode }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Pointer-reactive ambient light & spotlight cards + magnetic CTAs (desktop non-coarse only)
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const hero = root.querySelector<HTMLElement>(".home-hero");
    const surfaces = Array.from(root.querySelectorAll<HTMLElement>(".spotlight-surface"));

    const handleHeroMove = (event: PointerEvent) => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
      hero.style.setProperty("--hero-mx", `${x.toFixed(1)}%`);
      hero.style.setProperty("--hero-my", `${y.toFixed(1)}%`);
    };

    const handleSurfaceMove = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--card-mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--card-my", `${event.clientY - rect.top}px`);
    };

    hero?.addEventListener("pointermove", handleHeroMove, { passive: true });
    surfaces.forEach((surface) => {
      surface.addEventListener("pointermove", handleSurfaceMove, { passive: true });
    });

    const cleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((element) => {
      const strength = Number(element.dataset.magnetic || 0.14);
      const xTo = gsap.quickTo(element, "x", { duration: 0.42, ease: "power3.out" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.42, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * strength;
        const y = (event.clientY - rect.top - rect.height / 2) * strength;
        xTo(Math.max(-8, Math.min(8, x)));
        yTo(Math.max(-8, Math.min(8, y)));
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      element.addEventListener("pointermove", onMove, { passive: true });
      element.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => {
      hero?.removeEventListener("pointermove", handleHeroMove);
      surfaces.forEach((surface) => {
        surface.removeEventListener("pointermove", handleSurfaceMove);
      });
      cleanups.forEach((fn) => fn());
    };
  }, [reducedMotion]);

  useGsapScope(rootRef, () => {
    if (reducedMotion) return;

    // 1. Continuous scroll progress bar pinned under the global header
    gsap.fromTo(
      "[data-scroll-progress]",
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      },
    );

    // 2. Hero orchestrated entrance on first paint
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from("[data-hero-animate]", {
        y: 22,
        opacity: 0,
        duration: 0.62,
        stagger: 0.08,
        clearProps: "transform",
      })
      .from(
        ".hero-workbench",
        {
          y: 30,
          scale: 0.975,
          opacity: 0,
          duration: 0.7,
          clearProps: "transform",
        },
        "-=0.42",
      );

    // 3. Scroll-scrubbed Hero parallax layers
    gsap.to(".hero-backdrop-grid", {
      y: -72,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: {
        trigger: ".home-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".hero-atmosphere-canvas", {
      y: -48,
      opacity: 0.35,
      ease: "none",
      scrollTrigger: {
        trigger: ".home-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".hero-workbench", {
      y: -26,
      ease: "none",
      scrollTrigger: {
        trigger: ".home-hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.55,
      },
    });

    // 4. Reality strip staggered reveal
    gsap.from(".reality-item", {
      y: 26,
      opacity: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".reality-strip",
        start: "top 88%",
        once: true,
      },
    });

    // 5. Method showcase split entrance
    gsap.from(".method-copy", {
      x: -22,
      opacity: 0,
      duration: 0.62,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".method-showcase",
        start: "top 86%",
        once: true,
      },
    });

    gsap.from(".method-pillars li", {
      y: 16,
      opacity: 0,
      duration: 0.48,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".method-pillars",
        start: "top 88%",
        once: true,
      },
    });

    gsap.from(".method-challenge", {
      y: 28,
      scale: 0.98,
      opacity: 0,
      duration: 0.62,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".method-challenge",
        start: "top 86%",
        once: true,
      },
    });

    // 6. Parcours tracks section & cards reveal
    gsap.from("#courses .section-heading", {
      y: 22,
      opacity: 0,
      duration: 0.52,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: "#courses",
        start: "top 86%",
        once: true,
      },
    });

    gsap.from(".parcours-card", {
      y: 28,
      opacity: 0,
      duration: 0.54,
      stagger: 0.08,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".parcours-grid",
        start: "top 88%",
        once: true,
      },
    });

    // 7. Scroll-Progress Vertical Roadmap Timeline (MengTo/Skills scroll-progress-timeline)
    gsap.fromTo(
      "[data-roadmap-spine-fill]",
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".roadmap-spine-list",
          start: "top 64%",
          end: "bottom 64%",
          scrub: 0.2,
          invalidateOnRefresh: true,
        },
      },
    );

    const stages = gsap.utils.toArray<HTMLElement>("[data-roadmap-stage]");
    const currentCounter = rootRef.current?.querySelector<HTMLElement>("[data-roadmap-current]");
    const activeTitle = rootRef.current?.querySelector<HTMLElement>("[data-roadmap-active-title]");
    const navDots = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-roadmap-nav]") ?? [],
    );

    const setActiveStage = (stepCode: string, titleText: string) => {
      if (currentCounter) currentCounter.textContent = stepCode;
      if (activeTitle) activeTitle.textContent = titleText;
      stages.forEach((stage) => {
        stage.classList.toggle("is-active", stage.dataset.roadmapStage === stepCode);
      });
      navDots.forEach((dot) => {
        dot.classList.toggle("is-active", dot.dataset.roadmapNav === stepCode);
      });
    };

    stages.forEach((stage) => {
      const card = stage.querySelector<HTMLElement>(".roadmap-stage-card");
      const stepCode = stage.dataset.roadmapStage ?? "01";
      const titleText = stage.dataset.roadmapTitle ?? "";

      if (card) {
        gsap.from(card, {
          y: 26,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: stage,
            start: "top 88%",
            once: true,
          },
        });
      }

      ScrollTrigger.create({
        trigger: stage,
        start: "top 58%",
        end: "bottom 58%",
        onEnter: () => setActiveStage(stepCode, titleText),
        onEnterBack: () => setActiveStage(stepCode, titleText),
      });
    });

    // 8. FAQ accordion stagger reveal
    gsap.from(".faq-intro, .faq-item", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".faq-section",
        start: "top 86%",
        once: true,
      },
    });

    // 9. Closing CTA entrance
    gsap.from(".closing-cta", {
      y: 26,
      scale: 0.985,
      opacity: 0,
      duration: 0.62,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".closing-cta",
        start: "top 88%",
        once: true,
      },
    });

    // Keep ScrollTrigger geometry synced once fonts finish settling
    void document.fonts?.ready?.then(() => {
      ScrollTrigger.refresh();
    });
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="landing-motion-root">
      <div className="scroll-progress-track" aria-hidden="true">
        <div className="scroll-progress-bar" data-scroll-progress />
      </div>
      {children}
    </div>
  );
}
