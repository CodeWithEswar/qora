import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrTemplateStore } from "@/lib/domains/templates/store";

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

/**
 * GET /api/v1/templates/[templateId]/usage
 * Returns real QR assets and campaigns using this template.
 * STRICT REAL-DATA: Zero fake counts.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "template.read",
    });

    const { templateId } = await params;
    const usage = await QrTemplateStore.getTemplateUsage(ctx.organizationId, templateId);

    return apiSuccess(usage, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_usage");
  }
}
