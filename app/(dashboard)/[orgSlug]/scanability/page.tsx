import * as React from "react";
import { Metadata } from "next";
import { listScanabilityQrs } from "@/lib/domains/scanability";
import { ScanabilityCommandCenter } from "@/components/scanability/scanability-command-center";

export const metadata: Metadata = {
  title: "NXTQR Scanability — QR Engineering Validation Lab",
  description:
    "Physical, optical, and mathematical validation workspace for QR codes. Inspect luminance contrast, quiet zone clearances, finder eye integrity, logo occlusion headroom, and print readiness before publishing.",
};

interface ScanabilityPageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams?: Promise<{ qr?: string }>;
}

export default async function ScanabilityPage({
  params,
  searchParams,
}: ScanabilityPageProps) {
  const { orgSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedQrId = resolvedSearchParams?.qr;

  // Authoritative Supabase retrieval
  const { qrs } = await listScanabilityQrs(orgSlug);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <ScanabilityCommandCenter
        initialQrs={qrs}
        orgSlug={orgSlug}
        initialSelectedId={selectedQrId}
      />
    </div>
  );
}
