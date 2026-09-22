import * as React from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { WorkspaceControlPlaneClient } from "@/components/workspace/workspace-control-plane-client";

interface WorkspacePageProps {
  params: Promise<{ orgSlug: string }>;
}

export const metadata = {
  title: "Workspace Control Plane | NXTQR",
  description: "Configure identity, defaults and operating rules for your NXTQR organization.",
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  let overview;
  try {
    overview = await SupabaseWorkspaceRepository.getWorkspaceOverview(
      orgSlug,
      session?.user?.id
    );
  } catch (err) {
    notFound();
  }

  return <WorkspaceControlPlaneClient initialOverview={overview} />;
}
