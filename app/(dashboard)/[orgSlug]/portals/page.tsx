import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ClientPortalManager } from "@/components/portals/client-portal-manager";

export default async function ClientPortalsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: orgSlug, href: `/${orgSlug}` },
          { label: "Collaborate" },
          { label: "Client Portals" },
        ]}
        title="Client Portals & External Views"
        description="Share branded, allowlisted collections of campaigns, QR previews, and intelligence reports with external stakeholders."
      />

      <ClientPortalManager orgSlug={orgSlug} />
    </div>
  );
}
