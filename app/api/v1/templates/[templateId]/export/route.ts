import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrTemplateStore } from "@/lib/domains/templates/store";
import { exportTemplateToJson } from "@/lib/domains/templates/exporter";
import { NotFoundError } from "@nxtqr/contracts";

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

/**
 * GET /api/v1/templates/[templateId]/export
 * Exports deterministic JSON configuration for the template.
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

    const bundle = exportTemplateToJson(template);

    return apiSuccess(bundle, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_export");
  }
}
