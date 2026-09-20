import { NextRequest } from "next/server";
import { BrandKitQrProjection } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";

interface Params {
  params: Promise<{ kitId: string }>;
}

/**
 * GET /api/v1/brand-kits/[kitId]/projection
 * Returns a typed BrandKitQrProjection contract strictly providing the properties QR Studio requires:
 * palette, approved logos, QR style presets, and brand governance rules.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "brand:read",
      permission: "brand.read",
    });

    const { kitId } = await params;

    const detail = await SupabaseBrandKitRepository.getById(
      ctx.organizationId,
      kitId
    );

    const projection: BrandKitQrProjection = {
      brandKitId: detail.id,
      name: detail.name,
      versionNumber: detail.publishedRevision || 1,
      palette: detail.colors || [],
      approvedLogos: detail.logos || [],
      qrPresets: detail.qrPresets || [],
      governance: detail.governance || ({} as any),
    };

    return apiSuccess(projection, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
