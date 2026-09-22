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

const CreateTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100),
  description: z.string().max(500).optional(),
  brand_kit_id: z.string().uuid().nullable().optional(),
  compatibility: z.array(z.string()).optional(),
  is_brand_locked: z.boolean().optional(),
  locked_fields: z.array(z.string()).optional(),
  design: z.record(z.string(), z.any()),
  change_summary: z.string().max(250).optional(),
});

/**
 * GET /api/v1/templates
 * Lists templates for the current organization with real-time filtering.
 */
export async function GET(request: NextRequest) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "template.read",
    });

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      brandKitId: searchParams.get("brandKitId") || undefined,
      governance: (searchParams.get("governance") as any) || undefined,
      scanability: (searchParams.get("scanability") as any) || undefined,
      status: (searchParams.get("status") as any) || "active",
      sort: (searchParams.get("sort") as any) || "updated_desc",
    };

    const templates = await QrTemplateStore.listTemplates(ctx.organizationId, filters);

    return apiSuccess(
      {
        items: templates,
        total: templates.length,
      },
      ctx.requestId,
      200
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_list");
  }
}

/**
 * POST /api/v1/templates
 * Creates a new template in the organization design library with version 1 snapshot.
 */
export async function POST(request: NextRequest) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "template.create",
    });

    const body = await request.json().catch(() => ({}));
    const validated = CreateTemplateSchema.parse(body);

    // 1. Entitlements check
    const currentTemplates = await QrTemplateStore.listTemplates(ctx.organizationId, {
      status: "active",
    });
    const tier = (ctx.plan || "FREE") as SaaSTier;

    EntitlementService.assertEntitlement(tier, {
      featureKey: "templates.max",
      currentCount: currentTemplates.length,
      requestedIncrement: 1,
    });

    if (validated.is_brand_locked) {
      EntitlementService.assertEntitlement(tier, {
        featureKey: "templates.brandLock",
      });
    }

    // 2. Persist template
    const template = await QrTemplateStore.createTemplate(
      ctx.organizationId,
      ctx.actorId,
      validated as any
    );

    return apiSuccess(template, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_templates_create");
  }
}
