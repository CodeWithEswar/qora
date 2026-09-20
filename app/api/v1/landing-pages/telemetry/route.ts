import { NextRequest } from "next/server";
import { LandingPageTelemetryEventSchema } from "@nxtqr/contracts";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * POST /api/v1/landing-pages/telemetry — Public non-blocking beacon for views and CTA interactions
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const event = LandingPageTelemetryEventSchema.parse(rawBody);

    // Non-blocking best-effort execution
    await SupabaseLandingPageRepository.recordEvent(event.pageId, event);

    return Response.json({ success: true }, { status: 200 });
  } catch (err: any) {
    // Non-blocking error response
    return Response.json(
      { success: false, error: err?.message || "Invalid telemetry beacon" },
      { status: 400 }
    );
  }
}
