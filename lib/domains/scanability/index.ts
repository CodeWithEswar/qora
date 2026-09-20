import { createAdminClient } from "@/lib/supabase/admin";
import { CANONICAL_QR_DESIGN_DEFAULTS, QrDesignV1 } from "@nxtqr/qr-core";
import { buildQrResolverUrl } from "@nxtqr/config";
import { ScanabilityQrRecord } from "@/components/scanability/types";

/**
 * Authoritative Supabase retrieval of organization QR assets for engineering scanability validation.
 */
export async function listScanabilityQrs(orgSlug: string): Promise<{
  qrs: ScanabilityQrRecord[];
}> {
  try {
    const supabase = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgSlug);

    const orgQuery = supabase.from("organizations").select("id, slug").limit(1);
    const { data: org } = isUuid
      ? await orgQuery.eq("id", orgSlug).maybeSingle()
      : await orgQuery.or(`slug.eq.${orgSlug},legacy_id.eq.${orgSlug}`).maybeSingle();

    if (!org?.id) {
      return { qrs: [] };
    }

    const { data: rows, error } = await supabase
      .from("qr_codes")
      .select(`
        id, slug, name, qr_type, status, is_dynamic, published_revision,
        created_at, updated_at,
        qr_drafts(content_json, design_json, destination_json)
      `)
      .eq("organization_id", org.id)
      .neq("status", "ARCHIVED")
      .order("updated_at", { ascending: false });

    if (error || !rows) {
      return { qrs: [] };
    }

    const qrs: ScanabilityQrRecord[] = rows.map((r: any) => {
      const draft = Array.isArray(r.qr_drafts) ? r.qr_drafts[0] : r.qr_drafts;

      let design: QrDesignV1 = CANONICAL_QR_DESIGN_DEFAULTS;
      if (draft?.design_json) {
        try {
          const parsed =
            typeof draft.design_json === "string"
              ? JSON.parse(draft.design_json)
              : draft.design_json;
          design = { ...CANONICAL_QR_DESIGN_DEFAULTS, ...parsed };
        } catch {}
      }

      let content = "";
      let defaultUrl = "";

      if (draft?.destination_json?.defaultUrl) {
        defaultUrl = draft.destination_json.defaultUrl;
        content = defaultUrl;
      } else if (draft?.content_json?.url) {
        defaultUrl = draft.content_json.url;
        content = defaultUrl;
      } else if (draft?.content_json) {
        try {
          content =
            typeof draft.content_json === "string"
              ? draft.content_json
              : JSON.stringify(draft.content_json);
        } catch {}
      }

      if (!content) {
        content = buildQrResolverUrl(r.slug);
      }
      if (!defaultUrl) {
        defaultUrl = content;
      }

      return {
        id: r.id,
        name: r.name || "Untitled QR",
        slug: r.slug,
        qrType: r.qr_type || "url",
        status: r.status || "ACTIVE",
        isDynamic: Boolean(r.is_dynamic),
        publishedRevision: Number(r.published_revision || 1),
        content,
        defaultUrl,
        design,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return { qrs };
  } catch (err) {
    console.error("[listScanabilityQrs] Supabase retrieval error:", err);
    return { qrs: [] };
  }
}
