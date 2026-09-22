import * as React from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseTeamsRepository } from "@/lib/supabase/repositories/teams";
import { TeamOperationsWorkspace } from "@/components/collaborate/team-detail/team-operations-workspace";

interface TeamDetailPageProps {
  params: Promise<{ orgSlug: string; teamId: string }>;
}

export async function generateMetadata({ params }: TeamDetailPageProps) {
  const { orgSlug, teamId } = await params;
  try {
    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) return { title: "Team Operations | NXTQR" };

    const team = await SupabaseTeamsRepository.getTeamDetail(org.id, teamId);
    if (!team) return { title: "Team Operations | NXTQR" };

    return {
      title: `${team.name} — Team Operations Workspace | NXTQR`,
      description: team.description || `Operational workspace and collaboration topology for ${team.name}.`,
    };
  } catch {
    return {
      title: "Team Operations Workspace | NXTQR",
      description: "Manage team identity, members, connected resources, access, and governance.",
    };
  }
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { orgSlug, teamId } = await params;
  const session = await getSession();

  let org = null;
  try {
    org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  } catch (err) {
    console.error("[TeamDetailPage] Error fetching organization:", err);
  }

  if (!org) {
    notFound();
  }

  let team = null;
  try {
    team = await SupabaseTeamsRepository.getTeamDetail(
      org.id,
      teamId,
      session?.user?.id
    );
  } catch (err: any) {
    console.error(`[TeamDetailPage] Failed to fetch team '${teamId}':`, err);
    notFound();
  }

  if (!team) {
    notFound();
  }

  // Authorize user role
  const userMembership = session?.user?.workspaces?.find(
    (w) => w.slug === orgSlug || w.id === org.id
  );
  const userRole = userMembership?.role || "OWNER";
  const canManage = userRole !== "VIEWER";

  return (
    <TeamOperationsWorkspace
      initialTeam={team}
      orgSlug={orgSlug}
      canManage={canManage}
    />
  );
}
