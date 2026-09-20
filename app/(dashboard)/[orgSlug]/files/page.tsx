import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseFilesRepository } from "@/lib/supabase/repositories/files";
import { FilesPageClient } from "@/components/files/files-page-client";
import type { FileSummaryV1, AssetPulseMetricsV1 } from "@nxtqr/contracts";

export const metadata = {
  title: "Files — Asset Vault | NXTQR",
  description: "Asset infrastructure behind your QR codes, landing pages, and campaigns.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FilesPage({ params, searchParams }: PageProps) {
  const { orgSlug } = await params;
  const sParams = await searchParams;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  const category = (typeof sParams.category === "string" ? sParams.category : "ALL") as any;
  const usage = (typeof sParams.usage === "string" && (sParams.usage === "in_use" || sParams.usage === "unused") ? sParams.usage : "all") as "all" | "in_use" | "unused";
  const search = typeof sParams.search === "string" ? sParams.search : undefined;
  const sortBy = typeof sParams.sortBy === "string" ? (sParams.sortBy as any) : "updatedAt";
  const order = (typeof sParams.order === "string" ? sParams.order : "desc") as "asc" | "desc";

  let initialFiles: FileSummaryV1[] = [];
  let initialTotal = 0;
  let pulse: AssetPulseMetricsV1 = {
    totalFiles: 0,
    totalImages: 0,
    totalDocuments: 0,
    inUseCount: 0,
    usedStorageBytes: 0,
    storageLimitBytes: 2 * 1024 * 1024 * 1024,
  };

  try {
    const [{ items, total }, pulseMetrics] = await Promise.all([
      SupabaseFilesRepository.listFiles(org.id, {
        category,
        usage,
        search,
        sortBy,
        order,
        limit: 50,
      }),
      SupabaseFilesRepository.getStoragePulse(org.id),
    ]);

    initialFiles = items;
    initialTotal = total;
    pulse = pulseMetrics;
  } catch (err) {
    console.error("[FilesPage] Failed to fetch assets from Supabase:", err);
  }

  return (
    <FilesPageClient
      orgSlug={orgSlug}
      initialFiles={initialFiles}
      initialTotal={initialTotal}
      initialPulse={pulse}
    />
  );
}
