import * as React from "react";
import { getSession } from "@/lib/auth/session";
import {
  getOrganizationControlCenter,
  listOrganizationMembers,
  listOrganizationTeams,
  listOrganizationRoles,
  listOrganizationInvitations,
  OrganizationControlCenterOverview,
  OrganizationMemberRecord,
  OrganizationTeamRecord,
  OrganizationRoleRecord,
  OrganizationInvitationRecord,
} from "@nxtqr/db";
import {
  getOrCreateOrgData,
  buildControlCenterOverview,
} from "@/lib/domains/organization-store";
import { OrganizationControlCenter } from "@/components/organization/organization-control-center";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await getSession();

  let overview: OrganizationControlCenterOverview;
  let members: OrganizationMemberRecord[] = [];
  let teams: OrganizationTeamRecord[] = [];
  let roles: OrganizationRoleRecord[] = [];
  let invitations: OrganizationInvitationRecord[] = [];

  const d1 = (globalThis as any).DB;

  if (d1) {
    try {
      overview = await getOrganizationControlCenter(d1, orgSlug);
      const orgId = overview.organization.id;
      members = await listOrganizationMembers(d1, orgId);
      teams = await listOrganizationTeams(d1, orgId);
      roles = await listOrganizationRoles(d1, orgId);
      invitations = await listOrganizationInvitations(d1, orgId);
    } catch {
      const stored = getOrCreateOrgData(orgSlug, session?.user);
      overview = buildControlCenterOverview(stored);
      members = stored.members;
      teams = stored.teams;
      roles = stored.roles;
      invitations = stored.invitations;
    }
  } else {
    const stored = getOrCreateOrgData(orgSlug, session?.user);
    overview = buildControlCenterOverview(stored);
    members = stored.members;
    teams = stored.teams;
    roles = stored.roles;
    invitations = stored.invitations;
  }

  // Derive caller authorization from active session role
  const userMembership = session?.user?.workspaces?.find((w) => w.slug === orgSlug);
  const userRole = userMembership?.role || "OWNER";
  const isViewer = userRole === "VIEWER";

  return (
    <OrganizationControlCenter
      initialOverview={overview}
      initialMembers={members}
      initialTeams={teams}
      initialRoles={roles}
      initialInvitations={invitations}
      activeView="members"
      canManageMembers={!isViewer}
      canManageTeams={!isViewer}
      canManageRoles={!isViewer}
    />
  );
}
