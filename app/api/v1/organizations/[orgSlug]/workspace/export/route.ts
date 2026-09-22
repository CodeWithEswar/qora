import { NextRequest, NextResponse } from "next/server";
import { NotFoundError } from "@nxtqr/contracts";
import { authorizeApiRequest, handleApiError } from "@/lib/api";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/workspace/export
 * Downloads a sanitized JSON export of the organization's configuration and resources.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const exportData = await SupabaseWorkspaceRepository.exportWorkspaceData(org.id);

    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `workspace-export-${org.slug}-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
