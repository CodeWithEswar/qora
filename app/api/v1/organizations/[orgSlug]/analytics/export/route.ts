import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseAnalyticsRepository } from "@/lib/supabase/repositories/analytics";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/analytics/export
 * Downloads CSV or lists saved report jobs.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "analytics:read",
      permission: "analytics.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org || (ctx.organizationId && org.id !== ctx.organizationId)) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "list_reports") {
      const reports = await SupabaseAnalyticsRepository.listReportJobs(org.id);
      return apiSuccess(reports, ctx.requestId);
    }

    // Default: Direct CSV download
    const dateFrom = url.searchParams.get("from") || undefined;
    const dateTo = url.searchParams.get("to") || undefined;
    const qrId = url.searchParams.get("qrId") || undefined;
    const country = url.searchParams.get("country") || undefined;
    const device = url.searchParams.get("device") || undefined;

    const csvContent = await SupabaseAnalyticsRepository.generateCsvExport(org.id, {
      dateFrom,
      dateTo,
      qrId,
      country,
      device,
    });

    const filename = `nxtqr-analytics-${org.slug}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_export");
  }
}

/**
 * POST /api/v1/organizations/:orgSlug/analytics/export
 * Triggers/creates an asynchronous report export job.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "reports:write",
      permission: "analytics.export",
      entitlement: "analytics.export",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org || (ctx.organizationId && org.id !== ctx.organizationId)) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json().catch(() => ({}));
    const name = body.name || `Analytics Export (${new Date().toLocaleDateString()})`;
    const format = (body.format || "csv") as "csv" | "json" | "pdf";
    const rangeFrom = body.rangeFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const rangeTo = body.rangeTo || new Date().toISOString();

    const job = await SupabaseAnalyticsRepository.createReportJob(org.id, {
      name,
      format,
      rangeFrom,
      rangeTo,
      filtersJson: body.filters || {},
      userId: ctx.principal.actorId,
    });

    return apiSuccess(job, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_export_post");
  }
}

/**
 * DELETE /api/v1/organizations/:orgSlug/analytics/export
 * Deletes a report job.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "reports:write",
      permission: "analytics.export",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org || (ctx.organizationId && org.id !== ctx.organizationId)) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    await SupabaseAnalyticsRepository.deleteReportJob(org.id, jobId);
    return apiSuccess({ deleted: true }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_export_del");
  }
}
