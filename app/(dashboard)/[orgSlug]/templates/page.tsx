import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";
import { QrTemplateStore } from "@/lib/domains/templates/store";
import { QrTemplateSummary } from "@/lib/domains/templates/types";
import { TemplateLibrary } from "@/components/templates/template-library";

export const metadata = {
  title: "Templates — QR Design Library | NXTQR",
  description:
    "Build reusable QR identities that keep every scan recognizable, scannable, and on-brand.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function TemplatesPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  let templates: QrTemplateSummary[] = [];
  let brandKits: Array<{ id: string; name: string; slug: string }> = [];

  try {
    const [templateList, brandKitList] = await Promise.all([
      QrTemplateStore.listTemplates(org.id),
      SupabaseBrandKitRepository.listByOrg(org.id, { status: "active", limit: 50 }),
    ]);

    templates = templateList;
    brandKits = brandKitList.items.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
    }));
  } catch (err) {
    console.error("[TemplatesPage] Error loading templates:", err);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      <TemplateLibrary
        initialTemplates={templates}
        brandKits={brandKits}
        orgSlug={orgSlug}
      />
    </div>
  );
}
