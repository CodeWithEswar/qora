import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ApiKeysManager } from "@/components/developers/api-keys-manager";

export default async function APIKeysPage({
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
          { label: "NXTQR Developers" },
          { label: "API Keys" },
        ]}
        title="NXTQR API Keys & Credentials"
        description="Programmatically manage dynamic QR destinations, retrieve analytics, and trigger automated routing via scoped edge API tokens."
      />

      <ApiKeysManager orgSlug={orgSlug} />
    </div>
  );
}
