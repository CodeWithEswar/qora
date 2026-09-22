import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseTeamsRepository, TeamSummary, TeamSignalMetrics } from "@/lib/supabase/repositories/teams";
import { SupabaseMembersRepository, AdminMemberSummary } from "@/lib/supabase/repositories/members";
import { TeamsView } from "@/components/collaborate/teams/teams-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Teams — Operational Collaboration & Access Constellations | NXTQR",
  description: "Organize operational access, membership boundaries, and collaboration constellations across NXTQR.",
};

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await getSession();

  let org = null;
  try {
    org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  } catch (err) {
    console.error("[TeamsPage] Failed to fetch organization from Supabase:", err);
  }

  // If organization not found in Supabase
  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Workspace Not Found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            The workspace &quot;{orgSlug}&quot; could not be resolved from Supabase directory records.
          </p>
        </div>
        <Link href={`/${orgSlug}`}>
          <Button variant="outline" size="sm" className="text-xs">
            Return to Overview
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch live Supabase teams, signal metrics, and eligible org members
  let teams: TeamSummary[] = [];
  let signalMetrics: TeamSignalMetrics = {
    totalTeams: 0,
    activeTeams: 0,
    archivedTeams: 0,
    totalMemberships: 0,
    totalMembersInTeams: 0,
    unassignedMembers: 0,
    totalConnectedWork: 0,
  };
  let orgMembers: AdminMemberSummary[] = [];
  let overlaps: any[] = [];
  let loadError: string | null = null;

  try {
    const [fetchedTeams, fetchedSignals, fetchedMembers, fetchedOverlaps] = await Promise.all([
      SupabaseTeamsRepository.listTeams(org.id, undefined, session?.user?.id),
      SupabaseTeamsRepository.getSignalMetrics(org.id),
      SupabaseMembersRepository.listMembers(org.id, undefined, session?.user?.id),
      SupabaseTeamsRepository.getTeamOverlaps(org.id).catch(() => []),
    ]);

    teams = fetchedTeams;
    signalMetrics = fetchedSignals;
    orgMembers = fetchedMembers;
    overlaps = fetchedOverlaps;
  } catch (err: any) {
    console.error("[TeamsPage] Error fetching Supabase teams data:", err);
    loadError = err?.message || "Failed to load team operations data.";
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            TEAMS / UNAVAILABLE
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Team operational data couldn&apos;t be loaded
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {loadError}
          </p>
        </div>
        <Link href={`/${orgSlug}/teams`}>
          <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-white">
            Try again
          </Button>
        </Link>
      </div>
    );
  }

  // Derive caller authorization from active session role
  const userMembership = session?.user?.workspaces?.find((w) => w.slug === orgSlug || w.id === org.id);
  const userRole = userMembership?.role || "OWNER";
  const canManage = userRole !== "VIEWER";

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <TeamsView
        organization={{
          id: org.id,
          name: org.name,
          slug: org.slug,
        }}
        initialTeams={teams}
        initialSignalMetrics={signalMetrics}
        initialOverlaps={overlaps}
        orgMembers={orgMembers}
        canManageTeams={canManage}
      />
    </div>
  );
}
