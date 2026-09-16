import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default async function QRStudioPage({
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
          { label: "QR Codes", href: `/${orgSlug}/qr` },
          { label: "QR Studio" },
        ]}
        title="QR Studio"
        description="Professional design studio for crafting high-contrast, branded, dynamic QR codes with live scanability checks."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
            Phase 2 Flagship Tool
          </span>
        }
        actions={
          <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
            <Link href={`/${orgSlug}`}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Overview</span>
            </Link>
          </Button>
        }
      />

      <EmptyState
        title="QR Studio Canvas Ready"
        description="The 3-column studio layout (Destination Controls, Live Render Canvas, and Style Attributes) is scheduled next in Phase 2."
        actionLabel="Return to Overview"
        actionHref={`/${orgSlug}`}
      />
    </div>
  );
}
