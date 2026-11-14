import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ArrowUpRight, Command } from "lucide-react";
import "./globals.css";

const manrope = localFont({
  src: "./fonts/Manrope.ttf",
  variable: "--font-studio",
  display: "swap",
});
export const metadata: Metadata = {
  title: { default: "Cyber School — Comprendre, puis construire", template: "%s · Cyber School" },
  description:
    "Explorez les systèmes et les réseaux, une expérience à la fois. Des cours guidés, des simulations et des explications pour comprendre en profondeur.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={manrope.variable} data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand" aria-label="Cyber School, accueil">
              <span className="brand-mark">
                <Command size={21} aria-hidden="true" />
              </span>
              <span>
                cyber<span className="font-normal text-muted-foreground">school</span>
                <span className="brand-dot">.</span>
              </span>
            </Link>
            <nav aria-label="Navigation principale" className="main-nav">
              <Link href="/#courses">Les cours</Link>
              <Link href="/curriculum" data-testid="nav-curriculum-v4">
                Le parcours
              </Link>
              <Link href="/#method" className="nav-method">
                Notre approche
              </Link>
            </nav>
            <Link href="/lessons/program-memory-fundamentals" className="header-start">
              Commencer <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </header>
        <main id="main-content" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <Link href="/" className="brand text-base">
            cyberschool<span className="brand-dot">.</span>
          </Link>
          <p>Comprendre ce qui se passe sous la surface.</p>
          <Link href="/#courses">
            Retour aux cours <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </footer>
      </body>
    </html>
  );
}
