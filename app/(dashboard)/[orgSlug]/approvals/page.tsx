import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ApprovalQueue } from "@/components/approvals/approval-queue";

export default async function ApprovalsPage({
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
          { label: "Approvals" },
        ]}
        title="Governed Approvals Queue"
        description="Review, verify, and approve immutable QR revisions and destination changes prior to live edge publication."
      />

      <ApprovalQueue orgSlug={orgSlug} />
    </div>
  );
}
