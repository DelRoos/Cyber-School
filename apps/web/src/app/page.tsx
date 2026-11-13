import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, GitBranch, Layers, ShieldAlert } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cyber-school/ui";
import { loadAcademyData } from "@/lib/curriculum-data";

export default function HomePage() {
  const { curriculum, lessons, featuredLesson } = loadAcademyData();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/60 p-6 sm:p-10">
        <div className="max-w-3xl space-y-5">
          <Badge variant="default">
            Socle v0.1 ·{" "}
            {featuredLesson?.status === "published"
              ? "Leçon revue"
              : "Démonstrateur en cours de validation"}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comprendre les systèmes et réseaux par l&apos;expérience interactive
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chaque cours de Cyber School relie un{" "}
            <strong className="text-foreground">concept atomique</strong> à une simulation animée, à
            l&apos;observation des cas limites et à des exercices de raisonnement vérifiés.
          </p>
          {featuredLesson ? (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/lessons/${featuredLesson.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Lancer le démonstrateur : {featuredLesson.title}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="text-xs font-mono text-muted-foreground">
                Durée estimée : {featuredLesson.estimatedMinutes} min · Médium :{" "}
                {featuredLesson.medium}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="pillars-heading" className="space-y-4">
        <h2 id="pillars-heading" className="text-xl font-semibold tracking-tight">
          Architecture pédagogique &amp; technique
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Concepts atomiques</CardTitle>
              <CardDescription>
                Graphe de prérequis sans cycles validé par Zod dans{" "}
                <code className="font-mono text-xs">@cyber-school/lesson-runtime</code>.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Animations synchronisées</CardTitle>
              <CardDescription>
                Séquences 2D déterministes via GSAP &amp; Motion avec respect natif de{" "}
                <code className="font-mono text-xs">prefers-reduced-motion</code>.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">2D / 3D raisonnée</CardTitle>
              <CardDescription>
                La 2D reste prioritaire pour les protocoles ; la 3D est activée uniquement quand la
                spatialisation éclaire le mécanisme.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Rigueur &amp; cas limites</CardTitle>
              <CardDescription>
                Sources primaires (RFC IETF), scénarios de perte/timeout et exercices de prédiction
                d&apos;état.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {curriculum.domains.map((domain) => {
        const domainConceptIds = new Set(
          domain.modules.flatMap((mod) => mod.chapters.flatMap((chapter) => chapter.conceptIds)),
        );
        const domainConceptCount = curriculum.concepts.filter((c) =>
          domainConceptIds.has(c.id),
        ).length;
        return (
          <section key={domain.id} aria-labelledby={`domain-${domain.id}`} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id={`domain-${domain.id}`} className="text-xl font-semibold tracking-tight">
                  Domaine : {domain.title}
                </h2>
                <p className="text-sm text-muted-foreground">{domain.summary}</p>
              </div>
              <Badge variant="outline">{domainConceptCount} concepts atomiques indexés</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {domain.modules.map((mod) => (
                <Card key={mod.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{mod.title}</CardTitle>
                      <Badge variant="secondary">{mod.chapters.length} chapitre(s)</Badge>
                    </div>
                    <CardDescription>{mod.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mod.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="rounded-lg border border-border bg-secondary/35 p-3.5 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                          <span>{chapter.title}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {chapter.conceptIds.map((conceptId) => {
                            const concept = curriculum.concepts.find((c) => c.id === conceptId);
                            const matchedLesson = lessons.find((l) => l.conceptId === conceptId);
                            return (
                              <li
                                key={conceptId}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <span>
                                  <code className="font-mono text-foreground">
                                    {concept?.title ?? conceptId}
                                  </code>
                                </span>
                                {matchedLesson ? (
                                  <Link
                                    href={`/lessons/${matchedLesson.slug}`}
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                  >
                                    Ouvrir la leçon →
                                  </Link>
                                ) : (
                                  <Badge variant="outline">Planifié</Badge>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
