"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, Search, SlidersHorizontal } from "lucide-react";
import type { LessonManifest } from "@cyber-school/lesson-runtime";

const topicFor = (slug: string) =>
  slug.includes("memory") ? "Systèmes" : slug.includes("tcp") ? "Réseaux" : "Fondamentaux";
const titleFor = (lesson: LessonManifest) =>
  lesson.slug === "program-memory-fundamentals"
    ? "Dans la mémoire d’un programme"
    : lesson.slug === "tcp-three-way-handshake"
      ? "Trois messages pour se connecter"
      : lesson.slug === "scientific-reasoning-and-proof"
        ? "Observer, tester, comprendre"
        : lesson.title;

export function CourseCatalog({ lessons }: { lessons: LessonManifest[] }) {
  const [query, setQuery] = React.useState("");
  const [topic, setTopic] = React.useState("Tous");
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = lessons.filter(
    (l) =>
      (topic === "Tous" || topicFor(l.slug) === topic) &&
      normalize(
        `${l.title} ${titleFor(l)} ${topicFor(l.slug)} ${l.slug.includes("tcp") ? "TCP connexion" : l.slug.includes("memory") ? "CPU pile tas" : ""}`,
      ).includes(normalize(query)),
  );
  return (
    <div>
      <div className="catalog-toolbar">
        <div className="catalog-filters" role="group" aria-label="Filtrer les cours par thème">
          {["Tous", ...new Set(lessons.map((l) => topicFor(l.slug)))].map((t) => (
            <button key={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>
              {t}
              {t === "Tous" && <span>{lessons.length}</span>}
            </button>
          ))}
        </div>
        <label className="catalog-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Rechercher un cours</span>
          <input
            type="search"
            placeholder="Un sujet vous intrigue ?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="sr-only" role="status">
        {filtered.length} cours trouvé{filtered.length > 1 ? "s" : ""}
      </p>
      <div className="course-grid">
        {filtered.map((lesson) => {
          const memory = lesson.slug.includes("memory");
          const network = lesson.slug.includes("tcp");
          return (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.slug}`}
              className={`course-tile ${memory ? "course-memory" : "course-network"}`}
              data-testid={`home-lesson-link-${lesson.slug}`}
            >
              <div className="course-art" aria-hidden="true">
                <span className="course-topic">{topicFor(lesson.slug)}</span>
                <span className="course-art-open">
                  <ArrowUpRight size={19} />
                </span>
                {memory ? (
                  <div className="memory-art">
                    <div className="memory-art-label">int answer = 42;</div>
                    <div className="memory-art-bytes">
                      {["00", "00", "00", "2A", "00", "00", "00", "00"].map((v, i) => (
                        <span key={i} className={v === "2A" ? "active" : ""}>
                          {v}
                        </span>
                      ))}
                    </div>
                    <span className="memory-art-address">0x1000 → 0x1007</span>
                  </div>
                ) : network ? (
                  <div className="network-art">
                    <span>Client</span>
                    <div>
                      <i>
                        SYN <b>⟶</b>
                      </i>
                      <i>
                        <b>⟵</b> SYN + ACK
                      </i>
                      <i>
                        ACK <b>⟶</b>
                      </i>
                    </div>
                    <span>Serveur</span>
                  </div>
                ) : (
                  <div className="reasoning-art">
                    <span>Observation</span>
                    <i>↓</i>
                    <span>Hypothèse</span>
                    <i>↓</i>
                    <span>Mise à l’épreuve</span>
                  </div>
                )}
              </div>
              <div className="course-body">
                <div className="course-meta">
                  <span>
                    <Clock3 size={13} />{" "}
                    {lesson.estimatedMinutes >= 60
                      ? `${Math.floor(lesson.estimatedMinutes / 60)} h ${lesson.estimatedMinutes % 60 || ""}`.trim()
                      : `${lesson.estimatedMinutes} min`}
                  </span>
                  <span>{lesson.exercises.length} exercices</span>
                  <span>
                    {memory
                      ? "Guidé depuis les bases"
                      : network
                        ? "Bases des réseaux"
                        : "Apprendre à raisonner"}
                  </span>
                </div>
                <h3>{titleFor(lesson)}</h3>
                <p>
                  {memory
                    ? "Suivez un nombre du processeur à la mémoire. Puis explorez la pile, les pointeurs et le tas, un chapitre à la fois."
                    : network
                      ? "Que se passe-t-il avant le premier octet échangé ? Prenez le contrôle d’une connexion TCP, avec ou sans perte de paquet."
                      : lesson.slug === "scientific-reasoning-and-proof"
                        ? "Distinguez une observation d’une hypothèse. Testez une explication et cherchez ce qui pourrait la contredire."
                        : lesson.steps[0]?.summary}
                </p>
                <div className="course-bottom">
                  <span>{lesson.status === "published" ? "Cours publié" : "Version en revue"}</span>
                  <span>
                    Explorer le cours <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="catalog-empty">
          <SlidersHorizontal size={25} aria-hidden="true" />
          <h3>Aucun cours pour cette recherche</h3>
          <p>Essayez « mémoire », « TCP » ou changez de thème.</p>
          <button
            className="text-link"
            onClick={() => {
              setQuery("");
              setTopic("Tous");
            }}
          >
            Afficher tous les cours
          </button>
        </div>
      )}
    </div>
  );
}
