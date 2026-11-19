import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseLessonStudio } from "@/components/course/course-lesson-studio";
import { listCompleteCourseSlugs, loadCompleteCourseBySlug } from "@/lib/course-pages";

export function generateStaticParams(): Array<{ slug: string }> {
  return listCompleteCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = loadCompleteCourseBySlug(slug);
  if (!bundle) {
    return { title: "Cours introuvable · Cyber School" };
  }
  return {
    title: `${bundle.lesson.title} · Cours Cyber School`,
    description: bundle.page.introduction,
  };
}

export default async function CoursePageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = loadCompleteCourseBySlug(slug);
  if (!bundle) {
    notFound();
  }

  return (
    <CourseLessonStudio
      key={bundle.lesson.slug}
      lesson={bundle.lesson}
      page={bundle.page}
      linkedResources={bundle.linkedResources}
      audioManifest={bundle.audioManifest}
    />
  );
}
