import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FlaskConical } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cyber-school/ui";
import { loadAcademyData } from "@/lib/curriculum-data";
import { LessonRenderer } from "@/lib/lesson-registry";

export function generateStaticParams(): Array<{ slug: string }> {
  const { lessons } = loadAcademyData();
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lessons } = loadAcademyData();
  const lesson = lessons.find((entry) => entry.slug === slug);
  if (!lesson) {
    return { title: "Leçon introuvable · Cyber School" };
  }
  return {
    title: `${lesson.title} · Cyber School`,
    description: lesson.mediumJustification,
  };
}

export default async function LessonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { curriculum, resources, lessons } = loadAcademyData();
  const lesson = lessons.find((entry) => entry.slug === slug);
  if (!lesson) {
    notFound();
  }

  const concept = curriculum.concepts.find((c) => c.id === lesson.conceptId);
  const linkedResources = resources.resources.filter((r) => lesson.resourceIds.includes(r.id));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 py-0.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux parcours
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Concept atomique : {lesson.conceptId}</Badge>
          <Badge variant="secondary">Niveau : {concept?.depthLevel ?? "foundational"}</Badge>
          <Badge variant="outline">{lesson.estimatedMinutes} min</Badge>
          {lesson.review?.status === "approved" && lesson.review.reviewedAt ? (
            <Badge variant="success">Revu ({lesson.review.reviewedAt})</Badge>
          ) : (
            <Badge variant="warning">En attente de revue</Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>
        {concept ? (
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            {concept.definition}
          </p>
        ) : null}

        {concept && concept.prerequisites.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Prérequis (concepts planifiés) :</span>
            {concept.prerequisites.map((prereqId) => {
              const prereq = curriculum.concepts.find((c) => c.id === prereqId);
              return (
                <Badge key={prereqId} variant="outline">
                  {prereq?.title ?? prereqId}
                </Badge>
              );
            })}
          </div>
        ) : null}
      </div>

      <LessonRenderer lesson={lesson} />

      {/* External Labs & Authoritative Sources */}
      <section aria-labelledby="resources-heading" className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle id="resources-heading" className="text-base">
                Laboratoires pratiques externes
              </CardTitle>
            </div>
            <CardDescription>
              Consignes locales auto-portantes et référence officielle externe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lesson.externalLabs.map((lab) => (
              <div
                key={lab.id}
                className="rounded-lg border border-border bg-secondary/35 p-3.5 text-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{lab.title}</div>
                    <p className="text-xs text-muted-foreground">{lab.description}</p>
                    <span className="inline-block font-mono text-[11px] text-primary">
                      {lab.provider} · ~{lab.estimatedMinutes} min
                    </span>
                  </div>
                  <a
                    href={lab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ouvrir la documentation ${lab.provider}`}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                {lab.localSteps && lab.localSteps.length > 0 ? (
                  <ol className="space-y-1 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                    {lab.localSteps.map((stepText, idx) => (
                      <li key={idx}>{stepText}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sources primaires &amp; références</CardTitle>
            <CardDescription>
              Métadonnées vérifiées (traitées comme données externes non exécutables).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkedResources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/35 p-3.5 text-sm transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{res.title}</span>
                    <Badge variant="outline">{res.trustLevel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{res.summary}</p>
                  {res.sectionRef ? (
                    <span className="inline-block font-mono text-[11px] text-primary">
                      {res.sectionRef} {res.verifiedAt ? `· vérifié le ${res.verifiedAt}` : ""}
                    </span>
                  ) : null}
                </div>
                <ExternalLink
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </a>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
