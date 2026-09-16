import * as React from "react";
import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default async function CampaignsPage({
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
          { label: "Campaigns" },
        ]}
        title="Campaigns"
        description="Organize QR codes, landing pages, and traffic attribution into unified marketing initiatives."
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Campaign</span>
          </Button>
        }
      />

      <EmptyState
        icon={<FolderTree className="h-6 w-6 text-primary" />}
        title="Organize Your First Campaign"
        description="Group multiple QR codes across digital and physical media into a cohesive campaign for aggregate performance tracking."
        actionLabel="Create Campaign"
        onAction={() => {}}
      />
    </div>
  );
}
