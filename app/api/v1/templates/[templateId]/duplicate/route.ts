import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrTemplateStore } from "@/lib/domains/templates/store";
import { EntitlementService } from "@nxtqr/entitlements";
import { SaaSTier } from "@nxtqr/contracts";

const DuplicateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

/**
 * POST /api/v1/templates/[templateId]/duplicate
 * Duplicates a template within the organization.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "template.create",
    });

    const { templateId } = await params;
    const body = await request.json().catch(() => ({}));
    const validated = DuplicateSchema.parse(body);

    // Entitlement quota check
    const currentTemplates = await QrTemplateStore.listTemplates(ctx.organizationId, {
      status: "active",
    });
    const tier = (ctx.plan || "FREE") as SaaSTier;
    EntitlementService.assertEntitlement(tier, {
      featureKey: "templates.max",
      currentCount: currentTemplates.length,
      requestedIncrement: 1,
    });

    const duplicated = await QrTemplateStore.duplicateTemplate(
      ctx.organizationId,
      ctx.actorId,
      templateId,
      validated.name
    );

    return apiSuccess(duplicated, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_duplicate");
  }
}
