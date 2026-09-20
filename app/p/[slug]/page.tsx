import * as React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";
import { PublicLandingPageClient } from "@/components/landing-pages/public/public-landing-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const published = await SupabaseLandingPageRepository.getPublishedBySlug(slug);
    if (!published) {
      return {
        title: "Destination Not Found | NXTQR",
      };
    }

    const { page, version } = published;
    const seo = version.document.seo;

    return {
      title: seo?.title || page.name,
      description: seo?.description || undefined,
      robots: seo?.noindex
        ? { index: false, follow: false }
        : { index: true, follow: true },
      openGraph: {
        title: seo?.title || page.name,
        description: seo?.description || undefined,
        images: seo?.socialImageUrl ? [seo.socialImageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Destination | NXTQR",
    };
  }
}

export default async function PublicLandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const published = await SupabaseLandingPageRepository.getPublishedBySlug(slug);
  if (!published) {
    notFound();
  }

  const { page, version } = published;

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start">
      <PublicLandingPageClient
        page={page}
        versionId={version.id}
        document={version.document}
      />
    </main>
  );
}
