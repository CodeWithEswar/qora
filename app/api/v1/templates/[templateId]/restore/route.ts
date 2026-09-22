import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrTemplateStore } from "@/lib/domains/templates/store";

const RestoreSchema = z.object({
  version: z.number().int().min(1),
});

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

/**
 * POST /api/v1/templates/[templateId]/restore
 * Restores a historical design version into a new published template revision.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "template.update",
    });

    const { templateId } = await params;
    const body = await request.json().catch(() => ({}));
    const validated = RestoreSchema.parse(body);

    const restored = await QrTemplateStore.restoreTemplateVersion(
      ctx.organizationId,
      ctx.actorId,
      templateId,
      validated.version
    );

    return apiSuccess(restored, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_restore");
  }
}
