import * as React from "react";
import { notFound } from "next/navigation";
import { getD1Database } from "@/lib/db/d1";
import { getQrBrainState } from "@/lib/domains/routing";
import { BrainPageClient } from "@/components/qr-brain/brain-page-client";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface QrBrainPageProps {
  params: Promise<{ orgSlug: string; qrId: string }>;
}

export default async function QrBrainPage({ params }: QrBrainPageProps) {
  const { orgSlug, qrId } = await params;
  const db = await getD1Database();

  // 1. Resolve Organization ID via Supabase first, then D1
  let orgId: string | null = null;
  try {
    const sbOrg = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (sbOrg?.id) {
      orgId = sbOrg.id;
    }
  } catch (err) {
    console.warn("[QrBrainPage] Supabase org lookup notice:", err);
  }

  if (!orgId && db) {
    const org = await db
      .prepare("SELECT id, slug FROM organizations WHERE slug = ? OR id = ? LIMIT 1")
      .bind(orgSlug, orgSlug)
      .first<any>();
    if (org?.id) {
      orgId = org.id;
    }
  }

  if (!orgId) {
    notFound();
  }

  // 2. Authoritative State Retrieval (Supabase Postgres with D1 fallback)
  const brainState = await getQrBrainState(qrId, orgId, db);
  if (!brainState) {
    notFound();
  }

  return <BrainPageClient orgSlug={orgSlug} initialState={brainState} />;
}
