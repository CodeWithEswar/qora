import { NextRequest } from "next/server";
import {
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository } from "@nxtqr/db";

/**
 * GET /api/v1/campaigns/[campaignId]/activity — Real Campaign Activity Stream
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  let ctx;
  try {
    const { campaignId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:read",
      permission: "campaigns.read",
    });

    const d1 = ctx.db;
    if (!d1) {
      throw new Error("Cloudflare D1 authoritative database binding is required.");
    }

    const campaign = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
    if (!campaign) {
      throw new NotFoundError(`Campaign '${campaignId}' not found.`);
    }

    const sql = `
      SELECT 
        a.id, a.action, a.resource_type as resourceType, a.resource_id as resourceId,
        a.metadata_json as metadataJson, a.created_at as createdAt,
        u.name as actorName, u.email as actorEmail, u.avatar_url as actorAvatarUrl
      FROM activity_events a
      LEFT JOIN users u ON u.id = a.actor_id
      WHERE a.organization_id = ? 
        AND ((a.resource_type = 'campaign' AND a.resource_id = ?) OR a.metadata_json LIKE ?)
      ORDER BY a.created_at DESC
      LIMIT 50
    `;

    interface ActivityRow {
      id: string;
      action: string;
      resourceType: string;
      resourceId?: string;
      metadataJson?: string;
      createdAt: number;
      actorName?: string;
      actorEmail?: string;
      actorAvatarUrl?: string;
    }

    const res = await d1
      .prepare(sql)
      .bind(ctx.organizationId, campaignId, `%"campaignId":"${campaignId}"%`)
      .all();

    const results = (res?.results as unknown as ActivityRow[]) || [];
    const items = results.map((r: ActivityRow) => {
      let metadata: Record<string, unknown> = {};
      if (r.metadataJson) {
        try {
          metadata = JSON.parse(r.metadataJson);
        } catch {}
      }
      return {
        id: r.id,
        action: r.action,
        resourceType: r.resourceType,
        resourceId: r.resourceId,
        metadata,
        createdAt: new Date(Number(r.createdAt) * 1000).toISOString(),
        actorName: r.actorName || "Workspace Member",
        actorEmail: r.actorEmail || undefined,
        actorAvatarUrl: r.actorAvatarUrl || undefined,
      };
    });

    return apiSuccess({ items }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
