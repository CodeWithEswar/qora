import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { MembersDirectoryView } from "@/components/organization/members/members-directory-view";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Members — Workspace Access & Collaboration Command Center | NXTQR",
  description: "Understand who belongs to this workspace, how access is granted, and where collaboration connects.",
};

export default async function MembersPage({
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
    console.error("[MembersPage] Failed to fetch organization from Supabase:", err);
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

  // Fetch live Supabase members, roles, teams, and invitations
  let members: any[] = [];
  let roles: any[] = [];
  let teams: any[] = [];
  let invitations: any[] = [];
  let loadError: string | null = null;

  try {
    const [fetchedMembers, fetchedRoles, fetchedTeams, fetchedInvitations] = await Promise.all([
      SupabaseMembersRepository.listMembers(org.id, undefined, session?.user?.id),
      SupabaseMembersRepository.listRoles(org.id),
      SupabaseMembersRepository.listTeams(org.id),
      SupabaseMembersRepository.listInvitations(org.id),
    ]);

    members = fetchedMembers;
    roles = fetchedRoles;
    teams = fetchedTeams;
    invitations = fetchedInvitations;
  } catch (err: any) {
    console.error("[MembersPage] Error fetching Supabase directory data:", err);
    loadError = err?.message || "Failed to load directory data.";
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            MEMBERS / UNAVAILABLE
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Member access information couldn&apos;t be loaded
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {loadError}
          </p>
        </div>
        <Link href={`/${orgSlug}/members`}>
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

  const pendingCount = invitations.filter(
    (i: any) => i.status === "pending" && new Date(i.expiresAt).getTime() > Date.now()
  ).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <MembersDirectoryView
        organization={{
          id: org.id,
          name: org.name,
          slug: org.slug,
        }}
        initialMembers={members}
        initialRoles={roles.map((r: any) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description,
          isSystem: Boolean(r.is_system),
        }))}
        initialTeams={teams.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }))}
        initialInvitations={invitations}
        pendingInvitationsCount={pendingCount}
        canManageMembers={canManage}
      />
    </div>
  );
}
