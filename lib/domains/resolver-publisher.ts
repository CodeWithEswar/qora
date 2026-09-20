/**
 * NXTQR — Resolver Publication Service (Phase 13 / Dynamic QR)
 * 
 * Invariants:
 * - D1 is the authoritative relational source of truth.
 * - KV is the disposable, published edge resolver snapshot optimization.
 * - All expensive validation (syntax, schemes, scanability, lifecycle, rules) happens at publication.
 * - Scan time resolution in apps/redirect-worker remains fast (<10ms), cheap, and deterministic.
 */

import {
  QrResolverSnapshotV1,
  buildResolverKvKey,
  buildLegacyQrResolverKey,
  ConflictError,
  NotFoundError,
  ValidationError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import { isValidDestinationUrl } from "@nxtqr/routing-engine";
import { encodeQrContent, evaluateScanability } from "@nxtqr/qr-core";
import { QrStore } from "./qr-store";
import { RESOLVER_CONFIG, buildShortResolverUrl } from "@nxtqr/config";

export interface PublishResolverOptions {
  qrId: string;
  organizationId: string;
  actorId: string;
  actorType?: "user" | "api_key";
  expectedVersion?: number;
  changeSummary?: string;
  host?: string;
  db: any;
  kv?: any;
}

export interface PublishResolverResult {
  success: boolean;
  publishedRevision: number;
  slug: string;
  destinationUrl: string;
  resolverUrl: string;
  kvKey: string;
  edgeUpdated: boolean;
  edgeUpdatePending: boolean;
  error?: string;
}

export class ResolverPublisher {
  /**
   * Publishes authoritative QR state from D1 draft to Cloudflare KV snapshot.
   */
  static async publishResolverSnapshot(options: PublishResolverOptions): Promise<PublishResolverResult> {
    const {
      qrId,
      organizationId,
      actorId,
      actorType = "user",
      expectedVersion,
      changeSummary = "Published to Edge",
      host = RESOLVER_CONFIG.defaultHost,
      db,
      kv,
    } = options;

    if (!db) {
      throw new Error("Authoritative Cloudflare D1 database binding required for publication.");
    }

    // 1. Load authoritative QR
    const qr = await QrStore.getQr(qrId, organizationId, db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found in organization.`);
    }

    const currentVer = qr.publishedRevision || 1;
    if (expectedVersion !== undefined && expectedVersion !== currentVer) {
      throw new ConflictError(
        `Revision conflict: Expected version ${expectedVersion} does not match current version ${currentVer}. Please reload.`
      );
    }

    // 2. Load working draft
    const draft = await QrStore.getDraft(qrId, organizationId, db);
    let targetDestination = qr.destinationUrl || "";

    if (draft.destination?.defaultUrl) {
      targetDestination = draft.destination.defaultUrl;
    } else if (draft.content?.type === "url" && (draft.content as any).url) {
      targetDestination = (draft.content as any).url;
    }

    // 3. Destination URL Safety Validation
    if (!targetDestination) {
      throw new ValidationError("No destination URL configured for this Dynamic QR.");
    }

    if (!isValidDestinationUrl(targetDestination)) {
      throw new ValidationError(
        `Invalid destination URL '${targetDestination}'. Destinations must use http:// or https:// and cannot use script/data schemes.`
      );
    }

    // Prevent recursive loop (destination pointing to its own short URL)
    const resolverUrl = buildShortResolverUrl(qr.slug, host);
    if (targetDestination.toLowerCase().trim() === resolverUrl.toLowerCase().trim()) {
      throw new ValidationError("Circular redirect detected: Destination URL cannot point to the QR resolver URL itself.");
    }

    // 4. Server-Side Scanability Gate Check
    const encodedPayload = qr.isDynamic
      ? resolverUrl
      : encodeQrContent(draft.content);

    const scanability = evaluateScanability(encodedPayload, draft.design);
    if (scanability.status === "blocking" || scanability.blockersCount > 0) {
      const blocker = scanability.findings.find((f) => f.blocking || f.severity === "blocking");
      throw new ValidationError(
        `Publication blocked by Scanability Engine: ${blocker?.title || "Critical scanability risk"} (${blocker?.code || "BLOCKED"}). ${blocker?.remediation || ""}`
      );
    }

    // 5. Commit Immutable Checkpoint to D1 qr_versions
    const versionItem = await QrStore.createVersion(
      qrId,
      organizationId,
      {
        changeSummary,
        createdBy: actorId,
        content: {
          ...draft.content,
          type: "url",
          url: targetDestination,
          isDynamic: true,
        },
        design: draft.design,
      },
      db
    );

    const publishedRevision = versionItem.versionNumber;
    const now = Math.floor(Date.now() / 1000);

    // 6. Update authoritative Supabase state & D1 state
    const nowIso = new Date(now * 1000).toISOString();
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let sbQuery = supabase.from("qr_codes").select("id").eq("organization_id", organizationId);
      if (isUuid) {
        sbQuery = sbQuery.eq("id", qrId);
      } else {
        sbQuery = sbQuery.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      const { data: qrRow } = await sbQuery.maybeSingle();
      const targetId = qrRow?.id || (isUuid ? qrId : null);

      if (targetId) {
        const isDyn = (draft.content as any)?.isDynamic !== undefined ? Boolean((draft.content as any).isDynamic) : (qr.isDynamic !== undefined ? Boolean(qr.isDynamic) : true);
        await supabase
          .from("qr_codes")
          .update({
            status: "ACTIVE",
            is_dynamic: isDyn,
            published_revision: publishedRevision,
            updated_at: nowIso,
          })
          .eq("id", targetId);

        await supabase.from("qr_resolution_snapshots").upsert({
          qr_id: targetId,
          slug: qr.slug,
          revision: publishedRevision,
          snapshot_json: {
            qrId: targetId,
            orgId: organizationId,
            slug: qr.slug,
            revision: publishedRevision,
            status: "ACTIVE",
            destination: { defaultUrl: targetDestination, fallbackUrl: qr.fallbackUrl || null },
            publishedAt: nowIso,
          },
        });
      }
    } catch (sbErr) {
      console.warn("[ResolverPublisher] Supabase publication notice:", sbErr);
    }

    // Resolve effective D1 id to ensure D1 updates match the row
    let effectiveD1QrId = qrId;
    try {
      const d1Row = (await db
        .prepare("SELECT id FROM qr_codes WHERE id = ? OR slug = ? LIMIT 1")
        .bind(qrId, qr.slug)
        .first()) as any;
      if (d1Row?.id) effectiveD1QrId = d1Row.id;
    } catch {}

    const isDynD1 = (draft.content as any)?.isDynamic !== undefined ? ((draft.content as any).isDynamic ? 1 : 0) : (qr.isDynamic ? 1 : 1);

    await db.batch([
      db
        .prepare(
          `UPDATE qr_codes
           SET published_version_id = ?, published_at = ?, status = 'ACTIVE', is_dynamic = ?, updated_at = ?
           WHERE (id = ? OR id = ?) AND organization_id = ?`
        )
        .bind(versionItem.id, now, now, isDynD1, effectiveD1QrId, qrId, organizationId),
      db
        .prepare(
          `INSERT INTO qr_destinations (id, qr_id, default_url, fallback_url, created_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET default_url = excluded.default_url, fallback_url = excluded.fallback_url`
        )
        .bind(`dest_${effectiveD1QrId.slice(-8)}`, effectiveD1QrId, targetDestination, qr.fallbackUrl || null, now),
      // Sync working draft destination to match newly published
      db
        .prepare(
          `UPDATE qr_drafts
           SET destination_json = ?, updated_at = ?
           WHERE (qr_id = ? OR qr_id = ?) AND organization_id = ?`
        )
        .bind(JSON.stringify({ defaultUrl: targetDestination, fallbackUrl: qr.fallbackUrl }), now, effectiveD1QrId, qrId, organizationId),
    ]);

    // 7. Load Active Routing Rules from D1
    let activeRules: any[] = [];
    try {
      const rulesResult = await db
        .prepare("SELECT * FROM qr_rules WHERE (qr_id = ? OR qr_id = ?) AND is_active = 1 ORDER BY priority ASC")
        .bind(effectiveD1QrId, qrId)
        .all();
      if (rulesResult?.results) {
        activeRules = rulesResult.results.map((r: any) => ({
          id: r.id,
          qrId: r.qr_id,
          name: r.name,
          priority: r.priority,
          isActive: true,
          matchType: r.match_type || "ALL",
          conditions: r.conditions_json ? JSON.parse(r.conditions_json) : [],
          action: {
            type: r.action_type || "REDIRECT",
            destinationUrl: r.destination_url,
          },
        }));
      }
    } catch {
      activeRules = [];
    }

    // 8. Compile Compact QrResolverSnapshotV1
    const snapshot: QrResolverSnapshotV1 = {
      schemaVersion: 1,
      qrId,
      organizationId,
      resolver: {
        host,
        slug: qr.slug,
      },
      status: "ACTIVE",
      lifecycle: {
        status: "ACTIVE",
      },
      publishedRevision,
      defaultDestination: {
        id: `dest_${qrId.slice(-8)}`,
        url: targetDestination,
      },
      fallbackDestination: qr.fallbackUrl ? { id: `fb_${qrId.slice(-8)}`, url: qr.fallbackUrl } : undefined,
      routing: {
        rules: activeRules,
        timezone: "UTC",
      },
      publishedAt: new Date(now * 1000).toISOString(),
      updatedAt: now,
    };

    // 9. Synchronize Cloudflare KV
    const primaryKvKey = buildResolverKvKey({ host, slug: qr.slug });
    const legacyKvKey = buildLegacyQrResolverKey(qr.slug, host);
    let edgeUpdated = false;
    let edgeUpdatePending = false;

    if (kv) {
      try {
        const payloadStr = JSON.stringify(snapshot);
        await Promise.all([
          kv.put(primaryKvKey, payloadStr),
          kv.put(legacyKvKey, payloadStr),
        ]);
        edgeUpdated = true;
      } catch (kvErr) {
        console.error("[ResolverPublisher] Cloudflare KV publication failed:", kvErr);
        edgeUpdatePending = true;
      }
    } else {
      // In dev environment or before KV binding is wired, D1 fallback handles resolution
      edgeUpdatePending = true;
    }

    // 10. Emit Internal Domain Event: qr.published
    try {
      createInternalEvent({
        eventType: INTERNAL_EVENT_TYPES.QR_PUBLISHED,
        organizationId,
        actor: { type: actorType, id: actorId },
        resource: { type: "qr", id: qrId },
        data: {
          qrId,
          slug: qr.slug,
          revision: publishedRevision,
          destinationUrl: targetDestination,
          publishedAt: new Date(now * 1000).toISOString(),
          edgeUpdated,
        },
      });
    } catch {}

    return {
      success: true,
      publishedRevision,
      slug: qr.slug,
      destinationUrl: targetDestination,
      resolverUrl,
      kvKey: primaryKvKey,
      edgeUpdated,
      edgeUpdatePending,
    };
  }

  /**
   * Asynchronous cache repair from D1 fallback on KV miss.
   */
  static async repairResolverSnapshot(db: any, kv: any, slug: string, host = "global"): Promise<boolean> {
    if (!db || !kv) return false;

    try {
      const qrRow = await db
        .prepare(
          `SELECT q.id, q.organization_id, q.status, q.published_version_id,
                  qv.version_number as publishedRevision, d.default_url, d.fallback_url
           FROM qr_codes q
           LEFT JOIN qr_versions qv ON qv.id = q.published_version_id
           LEFT JOIN qr_destinations d ON d.qr_id = q.id
           WHERE q.slug = ? AND q.status != 'ARCHIVED'
           ORDER BY d.created_at DESC LIMIT 1`
        )
        .bind(slug)
        .first();

      if (!qrRow || !qrRow.default_url) return false;

      const snapshot: QrResolverSnapshotV1 = {
        schemaVersion: 1,
        qrId: qrRow.id,
        organizationId: qrRow.organization_id,
        resolver: { host, slug },
        status: qrRow.status || "ACTIVE",
        lifecycle: { status: qrRow.status || "ACTIVE" },
        publishedRevision: Number(qrRow.publishedRevision || 1),
        defaultDestination: {
          id: `dest_${qrRow.id.slice(-8)}`,
          url: qrRow.default_url,
        },
        fallbackDestination: qrRow.fallback_url ? { id: `fb_${qrRow.id.slice(-8)}`, url: qrRow.fallback_url } : undefined,
        publishedAt: new Date().toISOString(),
      };

      const primaryKey = buildResolverKvKey({ host, slug });
      await kv.put(primaryKey, JSON.stringify(snapshot), { expirationTtl: 86400 });
      return true;
    } catch (err) {
      console.error("[ResolverPublisher] repairResolverSnapshot error:", err);
      return false;
    }
  }

  /**
   * Invalidate resolver snapshot in KV upon pause/archive.
   */
  static async invalidateResolverSnapshot(kv: any, slug: string, host = "global"): Promise<void> {
    if (!kv) return;
    try {
      const primaryKey = buildResolverKvKey({ host, slug });
      const legacyKey = buildLegacyQrResolverKey(slug, host);
      await Promise.all([
        kv.delete(primaryKey),
        kv.delete(legacyKey),
      ]);
    } catch (err) {
      console.error("[ResolverPublisher] invalidateResolverSnapshot error:", err);
    }
  }
}
