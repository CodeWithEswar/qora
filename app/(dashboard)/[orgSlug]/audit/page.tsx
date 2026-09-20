import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AuditEventStream } from "@/components/audit/audit-event-stream";

export default async function AuditLogsPage({
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
          { label: "Security & Governance" },
          { label: "Audit Log" },
        ]}
        title="Security & Governance Audit Trail"
        description="Immutable forensic event history tracking who changed what, when, and from where across organization credentials, policies, destinations, and memberships."
      />

      <AuditEventStream orgSlug={orgSlug} />
    </div>
  );
}
