import "server-only";
import { Json } from "../database.types";
import { createAdminClient } from "../admin";
import { getSession } from "@/lib/auth/session";

function getClient() {
  return createAdminClient();
}

export interface QrRecord {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  qrType: string;
  isDynamic: boolean;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SCHEDULED" | "EXPIRED" | "ARCHIVED";
  publishedRevision: number;
  createdAt: string;
  updatedAt: string;
  draft?: {
    content: Json;
    design: Json;
    destination?: Json | null;
    routing?: Json | null;
    updatedAt: string;
  } | null;
}

export const SupabaseQrRepository = {
  /**
   * Retrieves a QR code with its working draft.
   */
  async getBySlugOrId(orgId: string, slugOrId: string): Promise<QrRecord | null> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    let query = supabase.from("qr_codes").select("*, qr_drafts(*)");
    if (orgId) {
      query = query.eq("organization_id", orgId);
    }

    const { data, error } = isUuid
      ? await query.eq("id", slugOrId).maybeSingle()
      : await query.or(`slug.eq.${slugOrId},legacy_id.eq.${slugOrId}`).maybeSingle();

    if (error || !data) return null;

    const draft = (data as any).qr_drafts;

    return {
      id: data.id,
      organizationId: data.organization_id,
      slug: data.slug,
      name: data.name,
      qrType: data.qr_type,
      isDynamic: data.is_dynamic,
      status: data.status as "DRAFT" | "ACTIVE" | "PAUSED" | "SCHEDULED" | "EXPIRED" | "ARCHIVED",
      publishedRevision: data.published_revision,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      draft: draft
        ? {
            content: draft.content_json,
            design: draft.design_json,
            destination: draft.destination_json,
            routing: draft.routing_json,
            updatedAt: draft.updated_at,
          }
        : null,
    };
  },

  /**
   * Lists all QR codes belonging to an organization.
   * STRICT REAL EMPTY STATE: If database returns 0 rows, returns empty array. Zero fake data!
   */
  async listByOrg(orgId: string): Promise<QrRecord[]> {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*, qr_drafts(*)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => {
      const draft = d.qr_drafts;
      return {
        id: d.id,
        organizationId: d.organization_id,
        slug: d.slug,
        name: d.name,
        qrType: d.qr_type,
        isDynamic: d.is_dynamic,
        status: d.status,
        publishedRevision: d.published_revision,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        draft: draft
          ? {
              content: draft.content_json,
              design: draft.design_json,
              destination: draft.destination_json,
              routing: draft.routing_json,
              updatedAt: draft.updated_at,
            }
          : null,
      };
    });
  },

  /**
   * Saves a working draft direct to Supabase Postgres (Debounced Autosave).
   */
  async saveDraft(
    qrId: string,
    orgId: string,
    payload: {
      content: Json;
      design: Json;
      destination?: Json | null;
      routing?: Json | null;
      expectedRevision?: number;
    }
  ): Promise<{ success: boolean; updatedAt: string }> {
    const supabase = await getClient();
    const session = await getSession();
    let userId = session?.user?.id || null;
    if (userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const { data: p } = await supabase.from("profiles").select("id").eq("legacy_id", userId).maybeSingle();
      userId = p?.id || null;
    }

    // Verify current published revision if concurrency check requested
    if (typeof payload.expectedRevision === "number") {
      const { data: qr } = await supabase
        .from("qr_codes")
        .select("published_revision")
        .eq("id", qrId)
        .eq("organization_id", orgId)
        .single();

      if (qr && qr.published_revision !== payload.expectedRevision) {
        throw new Error(
          `Concurrency conflict: QR code revision has changed (expected ${payload.expectedRevision}, currently ${qr.published_revision}).`
        );
      }
    }

    const { data, error } = await supabase
      .from("qr_drafts")
      .upsert(
        {
          qr_id: qrId,
          organization_id: orgId,
          content_json: payload.content,
          design_json: payload.design,
          destination_json: payload.destination || null,
          routing_json: payload.routing || null,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "qr_id" }
      )
      .select("updated_at")
      .single();

    if (error) {
      throw new Error(`Failed to save draft to Supabase: ${error.message}`);
    }

    return {
      success: true,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Publishes an immutable revision to Supabase Postgres and compiles the resolution snapshot.
   */
  async publishRevision(
    qrId: string,
    orgId: string,
    changeSummary: string = "Published revision"
  ): Promise<{ success: boolean; revision: number }> {
    const supabase = await getClient();
    const session = await getSession();
    const userId = session?.user?.id || null;

    // 1. Fetch current QR code and draft
    const { data: qr, error: qrErr } = await supabase
      .from("qr_codes")
      .select("*, qr_drafts(*)")
      .eq("id", qrId)
      .eq("organization_id", orgId)
      .single();

    if (qrErr || !qr) {
      throw new Error("Cannot publish: QR code not found.");
    }

    const draft = (qr as any).qr_drafts;
    if (!draft) {
      throw new Error("Cannot publish: No draft found for this QR code.");
    }

    const newRevision = Number(qr.published_revision || 0) + 1;

    // 2. Insert immutable version record
    const { error: verErr } = await supabase.from("qr_versions").insert({
      qr_id: qrId,
      version_number: newRevision,
      content_json: draft.content_json,
      design_json: draft.design_json,
      destination_json: draft.destination_json,
      routing_json: draft.routing_json,
      change_summary: changeSummary,
      created_by: userId,
    });

    if (verErr) {
      throw new Error(`Failed to commit immutable version: ${verErr.message}`);
    }

    // 3. Increment published_revision on qr_codes
    await supabase
      .from("qr_codes")
      .update({
        published_revision: newRevision,
        status: "ACTIVE",
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrId);

    // 4. Compile resolution snapshot for ultra-fast edge redirect path
    const snapshotPayload = {
      qrId: qr.id,
      orgId: qr.organization_id,
      slug: qr.slug,
      revision: newRevision,
      status: "ACTIVE",
      destination: draft.destination_json,
      routing: draft.routing_json,
      publishedAt: new Date().toISOString(),
    };

    await supabase.from("qr_resolution_snapshots").upsert(
      {
        qr_id: qrId,
        slug: qr.slug,
        revision: newRevision,
        snapshot_json: snapshotPayload,
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    return {
      success: true,
      revision: newRevision,
    };
  },

  /**
   * Fast edge resolver lookup by slug (Thin Edge Delivery Layer compatible).
   */
  async getResolverSnapshot(slug: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("qr_resolution_snapshots")
      .select("snapshot_json")
      .eq("slug", slug.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) return null;
    return data.snapshot_json;
  },
};
