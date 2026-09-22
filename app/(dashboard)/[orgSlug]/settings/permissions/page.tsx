import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { RolesControlPlaneClient } from "@/components/roles/roles-control-plane-client";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function PermissionsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let overview;
  try {
    overview = await SupabaseRolesRepository.getRolesOverview(
      orgSlug,
      session.user.id
    );
  } catch (err: any) {
    console.error("[PermissionsPage] Failed to load roles overview:", err);
    notFound();
  }

  // Check user permission
  const userMembership = session.user.workspaces?.find(
    (w) => w.slug === orgSlug || w.id === overview.organization.id
  );
  const userRole = userMembership?.role || "OWNER";
  const canManageRoles = userRole !== "VIEWER";

  return (
    <RolesControlPlaneClient
      initialOverview={overview}
      canManageRoles={canManageRoles}
    />
  );
}
