import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParcoursStudioPage } from "@/components/parcours/parcours-studio-page";
import { listAllParcoursSlugs, loadBespokeParcoursPage } from "@/lib/parcours/parcours-pages";

export function generateStaticParams(): Array<{ slug: string }> {
  return listAllParcoursSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { page } = loadBespokeParcoursPage(slug);
  if (!page) return { title: "Parcours introuvable" };
  return {
    title: `${page.title} · Parcours`,
    description: page.tagline,
  };
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { page, navTabs } = loadBespokeParcoursPage(slug);
  if (!page) notFound();

  return <ParcoursStudioPage key={page.slug} page={page} navTabs={navTabs} />;
}
