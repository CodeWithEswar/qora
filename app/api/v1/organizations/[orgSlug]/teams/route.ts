import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { listOrganizationTeams, createTeamInD1 } from "@nxtqr/db";
import {
  getOrCreateOrgData,
  createTeamInStore,
} from "@/lib/domains/organization-store";
import { z } from "zod";

const CreateTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_READ,
    });

    const d1 = ctx.db;
    if (!d1) {
      const stored = getOrCreateOrgData(orgSlug);
      return apiSuccess({ teams: stored.teams }, ctx.requestId);
    }

    const teams = await listOrganizationTeams(d1, ctx.organizationId);
    return apiSuccess({ teams }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_CREATE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.TEAMS_CREATE
    );

    const body = await request.json();
    const data = CreateTeamSchema.parse(body);

    const d1 = ctx.db;
    let team: any;
    if (d1) {
      team = await createTeamInD1(d1, ctx.organizationId, data.name, data.description);
    } else {
      team = createTeamInStore(orgSlug, data.name, data.description);
    }

    return apiCreated({ success: true, team }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
