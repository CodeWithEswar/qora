import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseCommentsRepository } from "@/lib/supabase/repositories/comments";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const view = (url.searchParams.get("view") as any) || undefined;
    const domain = url.searchParams.get("domain") || undefined;
    const state = (url.searchParams.get("state") as any) || undefined;
    const search = url.searchParams.get("search") || undefined;
    const sort = (url.searchParams.get("sort") as any) || undefined;

    const [threads, pulse, atlas] = await Promise.all([
      SupabaseCommentsRepository.listThreads(
        org.id,
        { view, domain, state, search, sort },
        ctx.principal.actorId
      ),
      SupabaseCommentsRepository.getPulseMetrics(org.id, ctx.principal.actorId),
      SupabaseCommentsRepository.getAtlasMetrics(org.id),
    ]);

    return apiSuccess({ threads, pulse, atlas }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_CREATE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    if (!body.contextType || !body.contextId || !body.contextRef || !body.title) {
      throw new ValidationError("Missing required thread parameters: contextType, contextId, contextRef, title.");
    }

    const thread = await SupabaseCommentsRepository.createThread(
      org.id,
      {
        contextType: body.contextType,
        contextId: body.contextId,
        contextRef: body.contextRef,
        contextTitle: body.contextTitle || body.contextRef,
        title: body.title,
        initialComment: body.initialComment,
        contextState: body.contextState,
        contextMetadata: body.contextMetadata,
      },
      ctx.principal.actorId
    );

    return apiSuccess({ thread }, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
