import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrTemplateStore } from "@/lib/domains/templates/store";
import { NotFoundError } from "@nxtqr/contracts";

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  brand_kit_id: z.string().uuid().nullable().optional(),
  compatibility: z.array(z.string()).optional(),
  is_brand_locked: z.boolean().optional(),
  locked_fields: z.array(z.string()).optional(),
  design: z.record(z.string(), z.any()).optional(),
  change_summary: z.string().max(250).optional(),
});

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

/**
 * GET /api/v1/templates/[templateId]
 * Fetches template detail and complete immutable version history.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "template.read",
    });

    const { templateId } = await params;
    const template = await QrTemplateStore.getTemplateById(ctx.organizationId, templateId);

    if (!template) {
      throw new NotFoundError(`Template "${templateId}" not found`);
    }

    return apiSuccess(template, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_get");
  }
}

/**
 * PATCH /api/v1/templates/[templateId]
 * Modifies an existing template, enforcing brand locks and creating a new version.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "template.update",
    });

    const { templateId } = await params;
    const body = await request.json().catch(() => ({}));
    const validated = UpdateTemplateSchema.parse(body);

    const updated = await QrTemplateStore.updateTemplate(
      ctx.organizationId,
      ctx.actorId,
      templateId,
      validated as any
    );

    return apiSuccess(updated, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_update");
  }
}

/**
 * DELETE /api/v1/templates/[templateId]
 * Archives or deletes a template.
 * CASCADE SAFE: Deleting a template never deletes QR codes, versions, or campaigns!
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "template.delete",
    });

    const { templateId } = await params;
    const mode = request.nextUrl.searchParams.get("mode");

    if (mode === "archive") {
      await QrTemplateStore.archiveTemplate(ctx.organizationId, templateId);
      return apiSuccess({ archived: true, id: templateId }, ctx.requestId, 200);
    } else {
      await QrTemplateStore.deleteTemplate(ctx.organizationId, templateId);
      return apiSuccess({ deleted: true, id: templateId }, ctx.requestId, 200);
    }
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_delete");
  }
}
