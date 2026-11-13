import type { Metadata } from "next";
import Link from "next/link";
import { Network, ShieldCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber School · Académie Interactive AI-First",
  description:
    "Plateforme d'apprentissage interactive construite autour de concepts atomiques, de simulations animées et d'exercices de raisonnement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Aller au contenu principal
        </a>

        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 py-0.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
                <Network className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Cyber School</span>
            </Link>

            <nav aria-label="Navigation principale" className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Parcours
              </Link>
              <Link
                href="/lessons/tcp-three-way-handshake"
                className="rounded-md bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Démonstrateur TCP
              </Link>
            </nav>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>

        <footer className="mt-16 border-t border-border/80 bg-card/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>
                Cyber School · Socle pédagogique validé par schémas Zod &amp; continuité
                inter-agents
              </span>
            </p>
            <p>Corpus conçu &amp; vérifié progressivement · Aucune génération à la volée</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
