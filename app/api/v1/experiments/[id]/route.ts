import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { updateExperimentStatus } from "@/lib/domains/experiments";
import { createAdminClient } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/experiments/:id — Archive experiment
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "experiments:write",
      permission: "routing.update",
    });

    const { id } = await params;

    // Soft-delete / archive in Supabase and D1
    await updateExperimentStatus(id, "ARCHIVED");

    try {
      const supabase = createAdminClient();
      await supabase.from("experiments").delete().eq("id", id);
    } catch {
      // Non-blocking if RLS or cascade
    }

    return apiSuccess({ id, archived: true }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
