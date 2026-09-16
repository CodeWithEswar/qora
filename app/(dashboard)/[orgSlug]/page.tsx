import * as React from "react";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return <OverviewDashboard orgSlug={orgSlug} />;
}
