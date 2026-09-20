import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ActivityStream } from "@/components/activity/activity-stream";
import { OrganizationNavTabs } from "@/components/organization/organization-nav-tabs";

export default async function ActivityPage({
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
          { label: "Activity" },
        ]}
        title="Workspace Activity Stream"
        description="Append-only human collaboration timeline tracking published QRs, comments, approvals, and team invitations."
      />

      <OrganizationNavTabs orgSlug={orgSlug} activeTab="activity" />

      <ActivityStream orgSlug={orgSlug} />
    </div>
  );
}
