import * as React from "react";
import Link from "next/link";
import { Plus, Download, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TopQRTable } from "@/components/dashboard/top-qr-table";

export default async function QRCodesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Acme Corp", href: `/${orgSlug}` },
          { label: "QR Codes" },
        ]}
        title="QR Codes"
        description="Manage and monitor all published static and dynamic QR codes across campaigns."
        actions={
          <>
            <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
              <Link href={`/${orgSlug}/qr/bulk`}>Bulk Create</Link>
            </Button>
            <Button size="sm" asChild className="gap-2 text-xs">
              <Link href={`/${orgSlug}/qr/studio`}>
                <Plus className="h-3.5 w-3.5" />
                <span>Create QR</span>
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <TopQRTable orgSlug={orgSlug} />
      </div>
    </div>
  );
}
