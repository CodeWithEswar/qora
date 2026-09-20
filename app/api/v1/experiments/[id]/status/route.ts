import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { updateExperimentStatus } from "@/lib/domains/experiments";
import { ExperimentStatus } from "@/components/experiments/types";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/experiments/:id/status — Update experiment lifecycle
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "experiments:write",
      permission: "routing.update",
    });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = (body.status?.toUpperCase() as ExperimentStatus) || "ACTIVE";

    await updateExperimentStatus(id, status);

    return apiSuccess({ id, status }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
