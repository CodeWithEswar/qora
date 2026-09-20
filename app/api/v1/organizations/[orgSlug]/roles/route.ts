import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { listOrganizationRoles, createCustomRoleInD1 } from "@nxtqr/db";
import {
  getOrCreateOrgData,
  createRoleInStore,
} from "@/lib/domains/organization-store";
import { PermissionCode } from "@nxtqr/contracts";
import { z } from "zod";

const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional().default([]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.ROLES_READ,
    });

    const d1 = ctx.db;
    if (!d1) {
      const stored = getOrCreateOrgData(orgSlug);
      return apiSuccess({ roles: stored.roles }, ctx.requestId);
    }

    const roles = await listOrganizationRoles(d1, ctx.organizationId);
    return apiSuccess({ roles }, ctx.requestId);
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
      permission: PERMISSIONS.ROLES_CREATE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.ROLES_CREATE
    );

    const body = await request.json();
    const data = CreateRoleSchema.parse(body);

    const d1 = ctx.db;
    let role: any;
    if (d1) {
      role = await createCustomRoleInD1(
        d1,
        ctx.organizationId,
        data.name,
        data.description,
        data.permissions as PermissionCode[]
      );
    } else {
      role = createRoleInStore(
        orgSlug,
        data.name,
        data.description,
        data.permissions as PermissionCode[]
      );
    }

    return apiCreated({ success: true, role }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
