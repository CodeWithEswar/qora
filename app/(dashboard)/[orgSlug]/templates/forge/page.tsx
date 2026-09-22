import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";
import { QrTemplateStore } from "@/lib/domains/templates/store";
import { QrTemplateDetail } from "@/lib/domains/templates/types";
import { TemplateForge } from "@/components/templates/forge/template-forge";

export const metadata = {
  title: "Template Forge — QR Design Studio | NXTQR",
  description:
    "Design and govern authoritative reusable QR identities for your organization.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ templateId?: string; brandKitId?: string }>;
}

export default async function TemplateForgePage({
  params,
  searchParams,
}: PageProps) {
  const { orgSlug } = await params;
  const { templateId } = await searchParams;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  let brandKits: Array<{
    id: string;
    name: string;
    primary_color?: string;
    logo_url?: string;
  }> = [];

  let existingTemplate: QrTemplateDetail | null = null;

  try {
    const brandKitList = await SupabaseBrandKitRepository.listByOrg(org.id, {
      status: "active",
      limit: 50,
    });

    brandKits = brandKitList.items.map((b) => ({
      id: b.id,
      name: b.name,
      primary_color: b.primaryColor,
      logo_url: b.logoUrl || undefined,
    }));

    if (templateId) {
      existingTemplate = await QrTemplateStore.getTemplateById(org.id, templateId);
    }
  } catch (err) {
    console.error("[TemplateForgePage] Error loading forge data:", err);
  }

  return (
    <TemplateForge
      orgSlug={orgSlug}
      brandKits={brandKits}
      existingTemplate={existingTemplate}
    />
  );
}
