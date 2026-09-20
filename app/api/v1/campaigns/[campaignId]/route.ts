import { NextRequest } from "next/server";
import {
  UpdateCampaignRequestV1Schema,
  CampaignResponseV1,
  CampaignDetailResponseV1,
  NotFoundError,
  ValidationError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository, recordActivityEvent } from "@nxtqr/db";
import { isValidCampaignStatusTransition, validateCampaignEmoji } from "@/lib/domains/campaigns";
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";

/**
 * GET /api/v1/campaigns/[campaignId] — Campaign Detail, Constellation, and Flow Metrics
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

    // 1. Authoritative Supabase retrieval
    try {
      const sbCampaign = await SupabaseCampaignRepository.getById(ctx.organizationId, campaignId);
      if (sbCampaign) {
        const [qrAssets, destinations] = await Promise.all([
          SupabaseCampaignRepository.listCampaignQrAssets(ctx.organizationId, sbCampaign.id, { limit: 12 }),
          SupabaseCampaignRepository.getCampaignDestinations(ctx.organizationId, sbCampaign.id),
        ]);

        const constellationNodes = qrAssets.slice(0, 8).map((q) => ({
          id: q.id,
          name: q.name,
          slug: q.slug,
          type: q.qrType,
          destinationUrl: q.destinationUrl,
          totalScans: q.totalScans,
        }));

        const response: CampaignDetailResponseV1 = {
          campaign: {
            id: sbCampaign.id,
            name: sbCampaign.name,
            description: sbCampaign.description || undefined,
            emoji: sbCampaign.emoji || null,
            status: sbCampaign.status as any,
            startsAt: sbCampaign.startDate || null,
            endsAt: sbCampaign.endDate || null,
            qrCount: qrAssets.length,
            totalScans: 0,
            createdAt: sbCampaign.createdAt,
            updatedAt: sbCampaign.updatedAt,
            archivedAt: sbCampaign.archivedAt || null,
            creatorName: undefined,
          },
          metrics: {
            totalScans: 0,
            uniqueScans: qrAssets.reduce((acc, q) => acc + (q.uniqueScans || 0), 0),
            qrCount: qrAssets.length,
            destinationCount: destinations.length,
            routesCount: qrAssets.length,
          },
          constellation: {
            totalQrCount: qrAssets.length,
            nodes: constellationNodes,
          },
          recentQrs: qrAssets as any,
        };

        return apiSuccess(response, ctx.requestId);
      }
    } catch (err) {
      console.warn("[GET /api/v1/campaigns/[campaignId]] Supabase lookup notice:", err);
    }

    // 2. D1 fallback
    const d1 = ctx.db;
    if (d1) {
      const campaign = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
      if (!campaign) {
        throw new NotFoundError(`Campaign '${campaignId}' not found.`);
      }

      const [qrAssets, destinations] = await Promise.all([
        CampaignsRepository.listCampaignQrAssets(d1, ctx.organizationId, campaignId, { limit: 12 }),
        CampaignsRepository.getCampaignDestinations(d1, ctx.organizationId, campaignId),
      ]);

      const constellationNodes = qrAssets.slice(0, 8).map((q) => ({
        id: q.id,
        name: q.name,
        slug: q.slug,
        type: q.qrType,
        destinationUrl: q.destinationUrl,
        totalScans: q.totalScans,
      }));

      const response: CampaignDetailResponseV1 = {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description || undefined,
          emoji: campaign.emoji || null,
          status: campaign.status,
          startsAt: campaign.startDate ? new Date(campaign.startDate * 1000).toISOString() : null,
          endsAt: campaign.endDate ? new Date(campaign.endDate * 1000).toISOString() : null,
          qrCount: campaign.qrCount,
          totalScans: campaign.totalScans,
          createdAt: new Date(campaign.createdAt * 1000).toISOString(),
          updatedAt: new Date(campaign.updatedAt * 1000).toISOString(),
          archivedAt: campaign.archivedAt ? new Date(campaign.archivedAt * 1000).toISOString() : null,
          creatorName: campaign.creatorName,
        },
        metrics: {
          totalScans: campaign.totalScans,
          uniqueScans: qrAssets.reduce((acc, q) => acc + (q.uniqueScans || 0), 0),
          qrCount: campaign.qrCount,
          destinationCount: destinations.length,
          routesCount: qrAssets.length,
        },
        constellation: {
          totalQrCount: campaign.qrCount,
          nodes: constellationNodes,
        },
        recentQrs: qrAssets,
      };

      return apiSuccess(response, ctx.requestId);
    }

    throw new NotFoundError(`Campaign '${campaignId}' not found.`);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/campaigns/[campaignId] — Update Campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  let ctx;
  try {
    const { campaignId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:write",
      permission: "campaigns.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = UpdateCampaignRequestV1Schema.parse(rawBody);

    const validatedEmoji = payload.emoji !== undefined ? validateCampaignEmoji(payload.emoji) : undefined;

    // 1. Authoritative Supabase update
    let updatedCampaign: any = null;
    try {
      updatedCampaign = await SupabaseCampaignRepository.updateCampaign(ctx.organizationId, campaignId, {
        name: payload.name,
        description: payload.description,
        emoji: validatedEmoji,
        status: payload.status as any,
        startDate: payload.startsAt,
        endDate: payload.endsAt,
      });
    } catch (sbErr: any) {
      console.warn("[PATCH /api/v1/campaigns/[campaignId]] Supabase update notice:", sbErr.message);
    }

    // 2. D1 update if available
    const d1 = ctx.db;
    if (d1) {
      try {
        const existing = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
        if (existing) {
          if (payload.status && payload.status !== existing.status) {
            if (!isValidCampaignStatusTransition(existing.status, payload.status)) {
              throw new ValidationError(
                `Invalid status transition from '${existing.status}' to '${payload.status}'.`
              );
            }
          }

          const startsAt = payload.startsAt !== undefined
            ? payload.startsAt ? Math.floor(new Date(payload.startsAt).getTime() / 1000) : null
            : undefined;
          const endsAt = payload.endsAt !== undefined
            ? payload.endsAt ? Math.floor(new Date(payload.endsAt).getTime() / 1000) : null
            : undefined;

          await CampaignsRepository.updateCampaign(d1, ctx.organizationId, campaignId, {
            name: payload.name,
            description: payload.description,
            emoji: validatedEmoji,
            status: payload.status,
            startDate: startsAt,
            endDate: endsAt,
          });

          await recordActivityEvent(d1, {
            organizationId: ctx.organizationId,
            actorId: ctx.principal.actorId,
            action: "campaign.updated",
            resourceType: "campaign",
            resourceId: campaignId,
            metadata: {
              name: payload.name,
              emoji: validatedEmoji,
              status: payload.status,
            },
          }).catch((err) => console.warn("[CampaignsAPI] Failed to record activity:", err));
        }
      } catch (d1Err) {
        console.warn("[PATCH /api/v1/campaigns/[campaignId]] D1 sync notice:", d1Err);
      }
    }

    if (!updatedCampaign) {
      throw new NotFoundError(`Campaign '${campaignId}' not found.`);
    }

    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.CAMPAIGN_UPDATED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "campaign", id: campaignId },
      data: {
        campaignId,
        changes: payload,
        updatedBy: ctx.principal.actorId,
      },
    });

    const response: CampaignResponseV1 = {
      id: updatedCampaign.id,
      name: updatedCampaign.name,
      description: updatedCampaign.description || undefined,
      emoji: updatedCampaign.emoji || null,
      status: updatedCampaign.status,
      startsAt: updatedCampaign.startDate || null,
      endsAt: updatedCampaign.endDate || null,
      qrCount: updatedCampaign.qrAssetCount || 0,
      totalScans: 0,
      createdAt: updatedCampaign.createdAt,
      updatedAt: updatedCampaign.updatedAt,
      archivedAt: updatedCampaign.archivedAt || null,
    };

    return apiSuccess(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/campaigns/[campaignId] — Unlinks QRs and deletes campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  let ctx;
  try {
    const { campaignId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:write",
      permission: "campaigns.delete",
    });

    let deleted = false;

    // 1. Authoritative Supabase deletion
    try {
      deleted = await SupabaseCampaignRepository.deleteCampaign(ctx.organizationId, campaignId);
    } catch (sbErr: any) {
      console.warn("[DELETE /api/v1/campaigns/[campaignId]] Supabase delete notice:", sbErr.message);
    }

    // 2. D1 deletion if available
    const d1 = ctx.db;
    if (d1) {
      try {
        const existing = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
        if (existing) {
          await CampaignsRepository.deleteCampaign(d1, ctx.organizationId, campaignId);
          deleted = true;

          await recordActivityEvent(d1, {
            organizationId: ctx.organizationId,
            actorId: ctx.principal.actorId,
            action: "campaign.deleted",
            resourceType: "campaign",
            resourceId: campaignId,
            metadata: { name: existing.name },
          }).catch((err) => console.warn("[CampaignsAPI] Failed to record activity:", err));
        }
      } catch (d1Err) {
        console.warn("[DELETE /api/v1/campaigns/[campaignId]] D1 sync notice:", d1Err);
      }
    }

    if (!deleted) {
      throw new NotFoundError(`Campaign '${campaignId}' not found.`);
    }

    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.CAMPAIGN_DELETED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "campaign", id: campaignId },
      data: {
        campaignId,
        deletedBy: ctx.principal.actorId,
      },
    });

    return apiSuccess({ success: true, message: `Campaign '${campaignId}' deleted. QR assets unlinked.` }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
