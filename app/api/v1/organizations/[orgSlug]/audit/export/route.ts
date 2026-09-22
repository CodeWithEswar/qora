import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest, handleApiError } from "@/lib/api";
import { SupabaseAuditRepository } from "@/lib/supabase/repositories/audit";
import { ExportAuditLogsDtoSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/audit/export
 * Exports redacted audit evidence in CSV or JSON format.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "audit.read",
    });

    const body = await request.json().catch(() => ({}));
    const validated = ExportAuditLogsDtoSchema.parse(body);

    const result = await SupabaseAuditRepository.exportAuditEvidence(
      ctx.organizationId,
      validated
    );

    return new NextResponse(result.content, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "X-Request-Id": ctx.requestId,
      },
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
