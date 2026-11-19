import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ArrowUpRight, Command } from "lucide-react";
import { SiteHeaderNav } from "@/components/site-header-nav";
import "./globals.css";

const manrope = localFont({
  src: "./fonts/Manrope.ttf",
  variable: "--font-studio",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cyber School — Comprendre la machine de l'intérieur",
    template: "%s · Cyber School",
  },
  description:
    "Apprenez les systèmes, la mémoire, les réseaux et la cybersécurité en manipulant des simulateurs interactifs pas à pas directement dans le navigateur.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={manrope.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand" aria-label="Cyber School, accueil">
              <span className="brand-mark">
                <Command size={19} aria-hidden="true" />
              </span>
              <span>
                cyber<span className="brand-light">school</span>
                <span className="brand-dot">.</span>
              </span>
            </Link>
            <SiteHeaderNav />
            <Link href="/parcours" className="header-start">
              <span>Commencer</span>
              <span className="cta-badge" aria-hidden="true">
                <ArrowUpRight size={13} />
              </span>
            </Link>
          </div>
        </header>
        <main id="main-content" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="footer-brand-col">
            <Link href="/" className="brand footer-brand">
              <span>
                cyber<span className="brand-light">school</span>
                <span className="brand-dot">.</span>
              </span>
            </Link>
            <p>
              Plateforme d&apos;apprentissage en cybersécurité conçue pour maîtriser
              l&apos;architecture mémoire, les réseaux et la sécurité de zéro jusqu&apos;à
              l&apos;expertise.
            </p>
          </div>
          <div className="footer-links-col">
            <h2>Parcours</h2>
            <Link href="/parcours/v4-tronc-commun">Tronc commun &amp; fondations</Link>
            <Link href="/parcours/v4-branche-a">Sécurité applicative &amp; IA</Link>
            <Link href="/parcours/v4-branche-b">Infrastructure &amp; offensive</Link>
          </div>
          <div className="footer-links-col">
            <h2>Découvrir</h2>
            <Link href="/#method">La méthode pédagogique</Link>
            <Link href="/#courses">La carte des parcours</Link>
            <Link href="/#roadmap">Progression du cursus</Link>
            <Link href="/#faq">Questions fréquentes</Link>
          </div>
          <div className="footer-links-col">
            <h2>Cursus</h2>
            <Link href="/parcours">Explorer tous les parcours</Link>
            <Link href="/parcours/v4-tronc-commun">Commencer par les bases</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
