import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";
import { DestinationStudio } from "@/components/landing-pages/editor/destination-studio";
import { THEME_PRESET_DEFINITIONS } from "@nxtqr/contracts";

export const metadata = {
  title: "Destination Studio — Landing Pages | NXTQR",
  description: "Mobile-first destination editor connected to smart QR infrastructure.",
};

export default async function LandingPageEditPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pageId: string }>;
}) {
  const { orgSlug, pageId } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  try {
    const { page, draft } = await SupabaseLandingPageRepository.getById(org.id, pageId);

    const initialDraft = draft || {
      schemaVersion: 1,
      theme: THEME_PRESET_DEFINITIONS["Ember Editorial"],
      blocks: [],
      seo: { noindex: false, title: page.name },
    };

    return (
      <DestinationStudio
        page={page}
        initialDraft={initialDraft}
        orgSlug={orgSlug}
      />
    );
  } catch (err) {
    console.error("[LandingPageEditPage] Page not found:", err);
    notFound();
  }
}
