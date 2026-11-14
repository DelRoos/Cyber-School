import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ExternalLink, FlaskConical } from "lucide-react";
import { loadAcademyData } from "@/lib/curriculum-data";
import { LessonRenderer } from "@/lib/lesson-registry";

export function generateStaticParams(): Array<{ slug: string }> {
  return loadAcademyData().lessons.map((lesson) => ({ slug: lesson.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = loadAcademyData().lessons.find((entry) => entry.slug === slug);
  return { title: lesson?.title ?? "Leçon introuvable" };
}
export default async function LessonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { curriculum, resources, lessons } = loadAcademyData();
  const lesson = lessons.find((entry) => entry.slug === slug);
  if (!lesson) notFound();
  const memory = slug === "program-memory-fundamentals";
  const tcp = slug === "tcp-three-way-handshake";
  const concept = curriculum.concepts.find((c) => c.id === lesson.conceptId);
  const linkedResources = resources.resources.filter((r) => lesson.resourceIds.includes(r.id));
  const title = memory
    ? "Dans la mémoire d’un programme"
    : tcp
      ? "Trois messages pour se connecter"
      : lesson.title;
  return (
    <div className="lesson-page">
      <nav aria-label="Fil d’Ariane" className="lesson-breadcrumb">
        <Link href="/#courses">
          <ArrowLeft size={13} aria-hidden="true" /> Tous les cours
        </Link>
        <span aria-hidden="true">/</span>
        <span>{memory ? "Systèmes" : tcp ? "Réseaux" : "Exploration"}</span>
      </nav>
      <header className="lesson-cover">
        <div>
          <div className="lesson-labels">
            <span>{memory ? "Depuis les bases" : "Les fondamentaux"}</span>
            <span>
              <Clock3 size={12} aria-hidden="true" /> {lesson.estimatedMinutes} min à votre rythme
            </span>
            <span className="review-label">
              {lesson.status === "published" ? "Cours publié" : "Version en revue"}
            </span>
          </div>
          <h1>{title}</h1>
          <p>
            {memory
              ? "Où va une variable ? Que reste-t-il après un appel de fonction ? Suivez les données dans la machine, de la première instruction à la gestion de leur durée de vie."
              : tcp
                ? "Avant de transmettre des données, deux machines doivent se mettre d’accord. Découvrez pourquoi TCP échange trois messages, et ce qui arrive si l’un se perd."
                : concept?.definition}
          </p>
        </div>
        <div className="lesson-cover-fact">
          <strong>{lesson.exercises.length.toString().padStart(2, "0")}</strong>exercices pour faire
          le lien
        </div>
      </header>
      <details className="lesson-prerequisites">
        <summary>Avant de commencer : ce qu’il faut savoir</summary>
        <p>
          {memory
            ? "Aucune connaissance de l’assembleur n’est nécessaire. Une variable est un nom associé à une valeur ; une fonction est un ensemble d’instructions que l’on peut appeler. Les adresses et les notations seront introduites au fil des chapitres."
            : tcp
              ? "Un client demande un service ; un serveur y répond. Un paquet transporte un petit morceau d’information sur le réseau. Un port identifie un point de communication sur une machine. Nous allons observer les messages avant toute transmission de données applicatives."
              : concept?.prerequisites
                  .map((id) => curriculum.concepts.find((c) => c.id === id)?.title ?? id)
                  .join(", ") || "Commencez par l’exemple guidé, puis explorez à votre rythme."}
        </p>
      </details>
      {tcp && (
        <div className="tcp-intro">
          <div className="learning-note">
            <h2 className="mb-2 text-sm font-semibold text-primary">D’abord, l’idée</h2>
            <p>
              TCP prépare un échange ordonné entre deux machines. Le client dit « je souhaite
              commencer », le serveur répond « moi aussi, et je t’ai entendu », puis le client
              confirme. Cette dernière réponse permet au serveur de savoir que son propre message a
              été reçu.
            </p>
          </div>
          <div className="learning-note">
            <h2 className="mb-2 text-sm font-semibold text-[#bfd5ed]">
              Un exemple avec des numéros
            </h2>
            <p>
              Le client commence à 100. SYN occupe une position : le serveur attend donc 101. Le
              serveur commence à 300 ; le client confirme 301. Un accusé de réception (ACK) indique
              le prochain numéro attendu. Il ne compte pas le nombre de messages.
            </p>
          </div>
        </div>
      )}
      {tcp && (
        <p className="mb-4 max-w-[80ch] text-xs leading-relaxed text-muted-foreground">
          <FlaskConical size={15} className="mr-2 inline text-primary" aria-hidden="true" />
          Avancez avec « Suivant », puis activez la perte du SYN-ACK. Avant de continuer, prédisez
          quelle machine sait déjà que l’autre a répondu.
        </p>
      )}
      <LessonRenderer lesson={lesson} />
      <details className="lesson-resources" id="lesson-resources">
        <summary>Pour aller plus loin : sources et laboratoires</summary>
        <div className="grid gap-8 md:grid-cols-2">
          <section aria-labelledby="labs-heading">
            <h2 id="labs-heading" className="mb-4 text-lg font-semibold">
              Essayez en conditions réelles
            </h2>
            <div className="space-y-5">
              {lesson.externalLabs.map((lab) => (
                <article key={lab.id} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-semibold text-sm">{lab.title}</h3>
                  <p className="my-2 text-xs leading-relaxed text-muted-foreground">
                    {lab.description}
                  </p>
                  <p className="text-xs text-primary">
                    {lab.provider} · {lab.estimatedMinutes} min environ
                  </p>
                  {lab.localSteps?.length ? (
                    <ol className="my-4 list-decimal space-y-2 pl-4 text-xs text-muted-foreground">
                      {lab.localSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  ) : null}
                  <a
                    href={lab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs text-primary"
                  >
                    Ouvrir la documentation {lab.provider}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </section>
          <section aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="mb-4 text-lg font-semibold">
              Les références du cours
            </h2>
            <div className="divide-y divide-border">
              {linkedResources.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-4 py-4 first:pt-0"
                >
                  <div>
                    <h3 className="text-sm font-semibold">{res.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {res.summary}
                    </p>
                    {res.sectionRef && (
                      <p className="mt-2 text-[11px] text-primary">{res.sectionRef}</p>
                    )}
                  </div>
                  <ExternalLink
                    size={14}
                    className="mt-1 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </section>
        </div>
      </details>
    </div>
  );
}
