"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SectionId = "method" | "courses" | "roadmap";

const SECTION_LINKS: ReadonlyArray<{
  id: SectionId;
  href: `/#${SectionId}`;
  label: string;
  className?: string;
}> = [
  { id: "method", href: "/#method", label: "Méthode", className: "nav-method" },
  { id: "courses", href: "/#courses", label: "Parcours" },
  { id: "roadmap", href: "/#roadmap", label: "Progression", className: "nav-roadmap" },
];

const HEADER_OFFSET = 94;

function computeActiveSection(): SectionId | null {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const threshold = Math.min(viewportHeight * 0.42, 340);

  let active: SectionId | null = null;
  let firstTop = Infinity;

  for (const item of SECTION_LINKS) {
    const element = document.getElementById(item.id);
    if (!element) continue;
    const top = element.getBoundingClientRect().top;
    if (top < firstTop) firstTop = top;
    if (top <= threshold) {
      active = item.id;
    }
  }

  // Keep hero state clean when above the first tracked section unless user clicked near bottom
  if (scrollY < 80 && firstTop > threshold) {
    return null;
  }

  // Ensure bottom of page maps cleanly to the last visible section if it entered view
  const nearBottom = scrollY + viewportHeight >= document.documentElement.scrollHeight - 24;
  if (nearBottom) {
    const roadmap = document.getElementById("roadmap");
    if (roadmap && roadmap.getBoundingClientRect().top < viewportHeight) {
      return "roadmap";
    }
  }

  return active;
}

export function SiteHeaderNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isParcours = pathname?.startsWith("/parcours") ?? false;
  const [activeSection, setActiveSection] = React.useState<SectionId | null>(null);

  React.useEffect(() => {
    if (!isHome) return;

    let rafId = 0;
    const syncFromScroll = () => {
      rafId = 0;
      const next = computeActiveSection();
      setActiveSection((prev) => (prev === next ? prev : next));
    };

    const scheduleSync = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(syncFromScroll);
    };

    // Sync via rAF callback on mount (including direct /#section loads) and scroll/resize/hashchange
    scheduleSync();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("hashchange", scheduleSync);

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("hashchange", scheduleSync);
    };
  }, [isHome]);

  const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    if (!isHome) return;
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - HEADER_OFFSET);
    window.history.replaceState(null, "", `/#${id}`);
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    setActiveSection(id);
  };

  return (
    <nav aria-label="Navigation principale" className="main-nav">
      {SECTION_LINKS.map((item) => {
        const isActive =
          (isHome && activeSection === item.id) || (isParcours && item.id === "courses");
        return (
          <Link
            key={item.id}
            href={isParcours && item.id === "courses" ? "/parcours" : item.href}
            className={[item.className, isActive ? "is-active" : ""].filter(Boolean).join(" ")}
            aria-current={isActive ? (isParcours ? "page" : "location") : undefined}
            data-nav-section={item.id}
            onClick={(event) => handleSectionClick(event, item.id)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
