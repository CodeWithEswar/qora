import * as React from "react";
import { Palette, Plus, Globe } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default async function BrandKitsPage({
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
          { label: "Brand Kits" },
        ]}
        title="Brand Kits & Visual Identity"
        description="Store your company logos, brand color palettes, custom typography, and default QR frame styles."
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Brand Kit</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Palette className="h-6 w-6 text-primary" />}
        title="Establish Your Brand Kit"
        description="Save your logo, primary hex colors, and custom frame designs so your team generates consistent on-brand QR codes every time."
        actionLabel="Create Brand Kit"
        onAction={() => {}}
      />
    </div>
  );
}
