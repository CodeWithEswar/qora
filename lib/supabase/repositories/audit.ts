"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import {
  NotFoundError,
  ForbiddenError,
  AuditLedgerOverview,
  AuditEvidenceRecord,
  AuditFilterParams,
  ExportAuditLogsDto,
  AuditCategory,
  AuditEventResult,
  AuditActorType,
  AuditChangeItem,
  AuditDensityPoint,
  AuditSignalMetrics,
} from "@nxtqr/contracts";

function getClient() {
  return createAdminClient();
}

/**
 * Secret Redaction: Recursively redacts sensitive credentials from audit metadata.
 */
const SENSITIVE_TERMS = [
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "private_key",
  "privatekey",
  "signature",
  "cashfree",
  "credential",
];

export function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveData);

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    const isSensitive = SENSITIVE_TERMS.some((term) => lower.includes(term));
    if (isSensitive) {
      clean[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      clean[key] = redactSensitiveData(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Maps actions to appropriate human-readable titles, categories, and summaries.
 */
export function normalizeAuditAction(action: string): {
  label: string;
  category: AuditCategory;
} {
  const act = action.toUpperCase();

  if (act.includes("ROLE") || act.includes("MEMBER") || act.includes("INVITATION") || act.includes("TEAM") || act.includes("WORKSPACE")) {
    let label = action.replace(/_/g, " ").replace(/\./g, " ");
    if (act.includes("ROLE_CREATED") || act === "ROLE.CREATED") label = "Role Created";
    else if (act.includes("ROLE_UPDATED") || act === "ROLE.UPDATED") label = "Role Permissions Updated";
    else if (act.includes("ROLE_DELETED") || act === "ROLE.DELETED") label = "Role Deleted";
    else if (act.includes("ROLE_ASSIGNED") || act.includes("MEMBER_ROLE_CHANGED")) label = "Member Role Changed";
    else if (act.includes("MEMBER_INVITED")) label = "Member Invited";
    else if (act.includes("MEMBER_REMOVED")) label = "Member Removed";
    else if (act.includes("WORKSPACE_OWNERSHIP_TRANSFERRED")) label = "Ownership Transferred";
    else if (act.includes("WORKSPACE_GENERAL_UPDATED")) label = "Workspace Settings Updated";
    return { label, category: "access" };
  }

  if (act.includes("QR") || act.includes("ROUTE") || act.includes("ROUTING") || act.includes("CAMPAIGN")) {
    let label = action.replace(/_/g, " ");
    if (act.includes("QR_PUBLISHED")) label = "QR Revision Published";
    else if (act.includes("QR_CREATED")) label = "QR Asset Created";
    else if (act.includes("QR_DESTINATION_CHANGED")) label = "Destination Redirect Updated";
    else if (act.includes("ROUTING_PUBLISHED")) label = "Routing Rules Published";
    return { label, category: "content" };
  }

  if (act.includes("DOMAIN") || act.includes("GUARDIAN")) {
    let label = action.replace(/_/g, " ");
    if (act.includes("CUSTOM_DOMAIN_ADDED")) label = "Custom Domain Added";
    else if (act.includes("CUSTOM_DOMAIN_VERIFIED")) label = "Domain DNS Verified";
    else if (act.includes("CUSTOM_DOMAIN_REMOVED")) label = "Domain Removed";
    else if (act.includes("CUSTOM_DOMAIN_PRIMARY_CHANGED")) label = "Primary Domain Updated";
    return { label, category: "infrastructure" };
  }

  if (act.includes("BILLING") || act.includes("SUBSCRIPTION") || act.includes("PAYMENT")) {
    return { label: action.replace(/_/g, " "), category: "billing" };
  }

  if (act.includes("API_KEY") || act.includes("WEBHOOK")) {
    let label = action.replace(/_/g, " ");
    if (act.includes("API_KEY_CREATED")) label = "API Key Generated";
    else if (act.includes("API_KEY_REVOKED")) label = "API Key Revoked";
    else if (act.includes("WEBHOOK_CREATED")) label = "Webhook Configured";
    return { label, category: "developer" };
  }

  return { label: action.replace(/_/g, " "), category: "system" };
}

function parseDateRange(range: string = "30d", customStart?: string, customEnd?: string) {
  const now = new Date();
  let start = new Date();

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "24h") {
    start.setHours(now.getHours() - 24);
  } else if (range === "7d") {
    start.setDate(now.getDate() - 7);
  } else if (range === "90d") {
    start.setDate(now.getDate() - 90);
  } else if (range === "custom" && customStart) {
    start = new Date(customStart);
  } else {
    // default 30d
    start.setDate(now.getDate() - 30);
  }

  const end = range === "custom" && customEnd ? new Date(customEnd) : now;
  return { start: start.toISOString(), end: end.toISOString() };
}

export const SupabaseAuditRepository = {
  /**
   * Retrieves cursor-paginated audit records, signal rail metrics, and temporal density.
   */
  async getAuditLedgerOverview(
    slugOrId: string,
    filters: Partial<AuditFilterParams> = {},
    currentUserId?: string
  ): Promise<AuditLedgerOverview> {
    const supabase = getClient();

    // 1. Resolve organization
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    let orgQuery = supabase.from("organizations").select("id, name, slug");
    const { data: org, error: orgErr } = isUuid
      ? await orgQuery.eq("id", slugOrId).single()
      : await orgQuery.eq("slug", slugOrId).single();

    if (orgErr || !org) {
      throw new NotFoundError(`Organization '${slugOrId}' not found.`);
    }

    const { start: startDate, end: endDate } = parseDateRange(
      filters.range,
      filters.startDate,
      filters.endDate
    );

    // 2. Base query
    let query = supabase
      .from("audit_logs")
      .select(`
        id,
        organization_id,
        actor_id,
        action,
        resource_type,
        resource_id,
        actor_type,
        actor_snapshot,
        target_type,
        target_id,
        target_snapshot,
        category,
        result,
        source,
        request_id,
        correlation_id,
        changes,
        authorization_context,
        metadata_json,
        ip_hash,
        created_at,
        profiles(display_name, email, avatar_url)
      `)
      .eq("organization_id", org.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

    // Lens / Category filter
    if (filters.lens && filters.lens !== "all") {
      query = query.eq("category", filters.lens);
    }

    // Actor filter
    if (filters.actorId) {
      query = query.eq("actor_id", filters.actorId);
    }
    if (filters.actorType) {
      query = query.eq("actor_type", filters.actorType);
    }

    // My actions quick filter
    if (filters.myActions && currentUserId) {
      query = query.eq("actor_id", currentUserId);
    }

    // Action filter
    if (filters.action) {
      query = query.eq("action", filters.action);
    }

    // Resource filters
    if (filters.resourceType) {
      query = query.or(`target_type.eq.${filters.resourceType},resource_type.eq.${filters.resourceType}`);
    }
    if (filters.resourceId) {
      query = query.or(`target_id.eq.${filters.resourceId},resource_id.eq.${filters.resourceId}`);
    }

    // Result filter
    if (filters.result && filters.result !== "all") {
      query = query.eq("result", filters.result);
    }

    // Correlation filter
    if (filters.correlationId) {
      query = query.eq("correlation_id", filters.correlationId);
    }

    // Event deep link
    if (filters.eventId) {
      query = query.eq("id", filters.eventId);
    }

    // Search query
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      query = query.or(`action.ilike.%${q}%,target_id.ilike.%${q}%,request_id.ilike.%${q}%,correlation_id.ilike.%${q}%`);
    }

    // Cursor pagination
    if (filters.cursor) {
      query = query.lt("created_at", filters.cursor);
    }

    const limit = filters.limit || 25;
    query = query.limit(limit + 1);

    const { data: rawRows, error: queryErr } = await query;
    if (queryErr) {
      console.error("[SupabaseAuditRepository] Query error:", queryErr);
    }

    const rows = rawRows || [];
    const hasMore = rows.length > limit;
    const pagedRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && pagedRows.length > 0 ? pagedRows[pagedRows.length - 1].created_at : null;

    // 3. Transform into AuditEvidenceRecord
    const events: AuditEvidenceRecord[] = pagedRows.map((row: any) => {
      const { label, category: autoCategory } = normalizeAuditAction(row.action);
      const category: AuditCategory = (row.category as any) || autoCategory;
      const prof = row.profiles || {};

      const actorName =
        row.actor_snapshot?.name ||
        prof.display_name ||
        prof.email?.split("@")[0] ||
        (row.actor_type === "system" ? "Platform System" : row.actor_type === "api_key" ? "API Key Token" : "Unknown Actor");

      const actor: any = {
        id: row.actor_id || "system",
        type: (row.actor_type as AuditActorType) || (row.actor_id ? "user" : "system"),
        name: actorName,
        email: row.actor_snapshot?.email || prof.email,
        role: row.actor_snapshot?.role,
        avatarUrl: row.actor_snapshot?.avatarUrl || prof.avatar_url,
      };

      const target: any = {
        type: row.target_type || row.resource_type || "resource",
        id: row.target_id || row.resource_id || "unknown",
        name: row.target_snapshot?.name || row.metadata_json?.name || row.target_id || row.resource_id || "Resource",
        identifier: row.target_snapshot?.identifier || row.metadata_json?.slug || row.target_id,
      };

      // Extract changes & diff
      const rawChanges = row.changes || row.metadata_json?.changes || {};
      const changes: AuditChangeItem[] = [];
      if (rawChanges.before || rawChanges.after) {
        const bKeys = Object.keys(rawChanges.before || {});
        const aKeys = Object.keys(rawChanges.after || {});
        const allKeys = Array.from(new Set([...bKeys, ...aKeys]));
        for (const k of allKeys) {
          changes.push({
            field: k,
            label: k.replace(/([A-Z])/g, " $1").toLowerCase(),
            before: redactSensitiveData(rawChanges.before?.[k]),
            after: redactSensitiveData(rawChanges.after?.[k]),
          });
        }
      } else if (typeof rawChanges === "object") {
        for (const [k, v] of Object.entries(rawChanges)) {
          if (v && typeof v === "object" && ("before" in (v as any) || "after" in (v as any))) {
            changes.push({
              field: k,
              label: k,
              before: redactSensitiveData((v as any).before),
              after: redactSensitiveData((v as any).after),
            });
          }
        }
      }

      // Human-readable summary
      const summary = `${actor.name} executed ${label.toLowerCase()} on ${target.type} (${target.name}).`;

      return {
        id: row.id,
        organizationId: row.organization_id,
        occurredAt: row.created_at,
        timestamp: new Date(row.created_at).getTime(),
        action: row.action,
        actionLabel: label,
        category,
        actor,
        target,
        result: (row.result as AuditEventResult) || "success",
        source: row.source || "web_ui",
        summary,
        changes,
        authorization: row.authorization_context || undefined,
        request: {
          requestId: row.request_id || undefined,
          correlationId: row.correlation_id || undefined,
          ipHash: row.ip_hash || undefined,
        },
        rawMetadata: redactSensitiveData(row.metadata_json || {}),
        hasDiff: changes.length > 0,
      };
    });

    // 4. Aggregations & Metrics calculation (scoped to organization and date range)
    const { data: allRangeRows } = await supabase
      .from("audit_logs")
      .select("actor_id, target_id, resource_id, category, result, created_at, action, resource_type, target_type")
      .eq("organization_id", org.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const rangeRows = allRangeRows || [];
    const distinctActors = new Set<string>();
    const distinctResources = new Set<string>();
    let failedOps = 0;

    const lensCounts: Record<string, number> = {
      all: rangeRows.length,
      access: 0,
      content: 0,
      infrastructure: 0,
      billing: 0,
      developer: 0,
    };

    const actionCounts: Record<string, { code: string; label: string; category: string }> = {};
    const resourceTypeCounts: Record<string, number> = {};

    // Density buckets: 12 intervals across the date range
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const bucketDuration = Math.max(1, (endMs - startMs) / 12);
    const densityBuckets: AuditDensityPoint[] = Array.from({ length: 12 }, (_, i) => {
      const bTime = startMs + i * bucketDuration;
      return {
        timeBucket: new Date(bTime).toISOString(),
        timestamp: bTime,
        count: 0,
        categories: {},
      };
    });

    for (const r of rangeRows) {
      if (r.actor_id) distinctActors.add(r.actor_id);
      const resId = r.target_id || r.resource_id;
      if (resId) distinctResources.add(resId);

      if (r.result === "failed" || r.result === "denied") {
        failedOps++;
      }

      const { label, category } = normalizeAuditAction(r.action);
      const effCategory = (r.category as string) || category;

      if (effCategory in lensCounts) {
        lensCounts[effCategory]++;
      }

      if (!actionCounts[r.action]) {
        actionCounts[r.action] = { code: r.action, label, category: effCategory };
      }

      const rType = r.target_type || r.resource_type || "resource";
      resourceTypeCounts[rType] = (resourceTypeCounts[rType] || 0) + 1;

      // Map to temporal density bucket
      const rowMs = new Date(r.created_at).getTime();
      const bIdx = Math.min(11, Math.max(0, Math.floor((rowMs - startMs) / bucketDuration)));
      densityBuckets[bIdx].count++;
      densityBuckets[bIdx].categories[effCategory] = (densityBuckets[bIdx].categories[effCategory] || 0) + 1;
    }

    const metrics: AuditSignalMetrics = {
      totalEvents: rangeRows.length,
      totalActors: distinctActors.size || 1,
      totalResources: distinctResources.size || 1,
      failedOperations: failedOps,
      timeRange: filters.range || "30d",
    };

    // 5. Distinct actors list for filters
    const { data: orgMemberships } = await supabase
      .from("organization_memberships")
      .select(`
        user_id,
        profiles(id, display_name, email)
      `)
      .eq("organization_id", org.id);

    const actorsList = (orgMemberships || []).map((om: any) => {
      const p = om.profiles || {};
      return {
        id: om.user_id,
        name: p.display_name || p.email?.split("@")[0] || "Member",
        email: p.email,
        type: "user",
      };
    });

    const resourceTypes = Object.entries(resourceTypeCounts).map(([type, count]) => ({
      type,
      label: type.replace(/_/g, " ").toUpperCase(),
      count,
    }));

    return {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
      metrics,
      density: densityBuckets,
      lensCounts,
      events,
      nextCursor,
      hasMore,
      actors: actorsList,
      actions: Object.values(actionCounts),
      resourceTypes,
    };
  },

  /**
   * Retrieves comprehensive forensic detail for a single audit event.
   */
  async getAuditEventDetail(orgId: string, eventId: string): Promise<AuditEvidenceRecord> {
    const supabase = getClient();

    const { data: row, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        organization_id,
        actor_id,
        action,
        resource_type,
        resource_id,
        actor_type,
        actor_snapshot,
        target_type,
        target_id,
        target_snapshot,
        category,
        result,
        source,
        request_id,
        correlation_id,
        changes,
        authorization_context,
        metadata_json,
        ip_hash,
        created_at,
        profiles(display_name, email, avatar_url)
      `)
      .eq("organization_id", orgId)
      .eq("id", eventId)
      .single();

    if (error || !row) {
      throw new NotFoundError(`Audit event '${eventId}' not found.`);
    }

    const r = row as any;
    const { label, category: autoCategory } = normalizeAuditAction(r.action);
    const category: AuditCategory = r.category || autoCategory;
    const prof = r.profiles || {};

    const actorName =
      r.actor_snapshot?.name ||
      prof.display_name ||
      prof.email?.split("@")[0] ||
      (r.actor_type === "system" ? "Platform System" : r.actor_type === "api_key" ? "API Key Token" : "Unknown Actor");

    const actor: any = {
      id: r.actor_id || "system",
      type: (r.actor_type as AuditActorType) || (r.actor_id ? "user" : "system"),
      name: actorName,
      email: r.actor_snapshot?.email || prof.email,
      role: r.actor_snapshot?.role,
      avatarUrl: r.actor_snapshot?.avatarUrl || prof.avatar_url,
    };

    const target: any = {
      type: r.target_type || r.resource_type || "resource",
      id: r.target_id || r.resource_id || "unknown",
      name: r.target_snapshot?.name || r.metadata_json?.name || r.target_id || r.resource_id || "Resource",
      identifier: r.target_snapshot?.identifier || r.metadata_json?.slug || r.target_id,
    };

    // Extract changes & diff
    const rawChanges = r.changes || r.metadata_json?.changes || {};
    const changes: AuditChangeItem[] = [];
    if (rawChanges.before || rawChanges.after) {
      const bKeys = Object.keys(rawChanges.before || {});
      const aKeys = Object.keys(rawChanges.after || {});
      const allKeys = Array.from(new Set([...bKeys, ...aKeys]));
      for (const k of allKeys) {
        changes.push({
          field: k,
          label: k.replace(/([A-Z])/g, " $1").toLowerCase(),
          before: redactSensitiveData(rawChanges.before?.[k]),
          after: redactSensitiveData(rawChanges.after?.[k]),
        });
      }
    }

    // Correlated events count
    let correlationCount = 0;
    if (r.correlation_id) {
      const { count } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("correlation_id", r.correlation_id);
      correlationCount = (count || 1) - 1; // other events in trace
    }

    const summary = `${actor.name} executed ${label.toLowerCase()} on ${target.type} (${target.name}).`;

    return {
      id: r.id,
      organizationId: r.organization_id,
      occurredAt: r.created_at,
      timestamp: new Date(r.created_at).getTime(),
      action: r.action,
      actionLabel: label,
      category,
      actor,
      target,
      result: (r.result as AuditEventResult) || "success",
      source: r.source || "web_ui",
      summary,
      changes,
      authorization: r.authorization_context || undefined,
      request: {
        requestId: r.request_id || undefined,
        correlationId: r.correlation_id || undefined,
        ipHash: r.ip_hash || undefined,
      },
      rawMetadata: redactSensitiveData(r.metadata_json || {}),
      correlationCount,
      hasDiff: changes.length > 0,
    };
  },

  /**
   * Retrieves investigation context: preceding and succeeding events around a specific event.
   */
  async getInvestigationContext(orgId: string, eventId: string): Promise<{
    event: AuditEvidenceRecord;
    previousEvents: AuditEvidenceRecord[];
    nextEvents: AuditEvidenceRecord[];
    sameActorEvents: AuditEvidenceRecord[];
    sameTargetEvents: AuditEvidenceRecord[];
  }> {
    const supabase = getClient();
    const current = await this.getAuditEventDetail(orgId, eventId);

    // Preceding events (occurred before)
    const { data: prevRows } = await supabase
      .from("audit_logs")
      .select("id")
      .eq("organization_id", orgId)
      .lt("created_at", current.occurredAt)
      .order("created_at", { ascending: false })
      .limit(3);

    // Succeeding events (occurred after)
    const { data: nextRows } = await supabase
      .from("audit_logs")
      .select("id")
      .eq("organization_id", orgId)
      .gt("created_at", current.occurredAt)
      .order("created_at", { ascending: true })
      .limit(3);

    const [prevEvents, nextEvents, sameActorEvents, sameTargetEvents] = await Promise.all([
      Promise.all((prevRows || []).map((r) => this.getAuditEventDetail(orgId, r.id))),
      Promise.all((nextRows || []).map((r) => this.getAuditEventDetail(orgId, r.id))),
      current.actor.id && current.actor.id !== "system"
        ? this.getActorHistory(orgId, current.actor.id, 5, eventId)
        : Promise.resolve([]),
      this.getTargetHistory(orgId, current.target.type, current.target.id, 5, eventId),
    ]);

    return {
      event: current,
      previousEvents: prevEvents,
      nextEvents: nextEvents.reverse(),
      sameActorEvents,
      sameTargetEvents,
    };
  },

  /**
   * Retrieves audit trail specifically for an actor.
   */
  async getActorHistory(
    orgId: string,
    actorId: string,
    limit = 10,
    excludeEventId?: string
  ): Promise<AuditEvidenceRecord[]> {
    const supabase = getClient();
    let q = supabase
      .from("audit_logs")
      .select("id")
      .eq("organization_id", orgId)
      .eq("actor_id", actorId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (excludeEventId) {
      q = q.neq("id", excludeEventId);
    }

    const { data: rows } = await q;
    if (!rows) return [];
    return Promise.all(rows.map((r) => this.getAuditEventDetail(orgId, r.id)));
  },

  /**
   * Retrieves audit trail specifically for a target resource.
   */
  async getTargetHistory(
    orgId: string,
    targetType: string,
    targetId: string,
    limit = 10,
    excludeEventId?: string
  ): Promise<AuditEvidenceRecord[]> {
    const supabase = getClient();
    let q = supabase
      .from("audit_logs")
      .select("id")
      .eq("organization_id", orgId)
      .or(`target_id.eq.${targetId},resource_id.eq.${targetId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (excludeEventId) {
      q = q.neq("id", excludeEventId);
    }

    const { data: rows } = await q;
    if (!rows) return [];
    return Promise.all(rows.map((r) => this.getAuditEventDetail(orgId, r.id)));
  },

  /**
   * Retrieves all correlated events sharing the same correlationId or requestId.
   */
  async getCorrelatedTrace(orgId: string, correlationId: string): Promise<AuditEvidenceRecord[]> {
    const supabase = getClient();
    const { data: rows } = await supabase
      .from("audit_logs")
      .select("id")
      .eq("organization_id", orgId)
      .or(`correlation_id.eq.${correlationId},request_id.eq.${correlationId}`)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!rows) return [];
    return Promise.all(rows.map((r) => this.getAuditEventDetail(orgId, r.id)));
  },

  /**
   * Exports redacted audit evidence in CSV or JSON format.
   */
  async exportAuditEvidence(
    orgId: string,
    filters: ExportAuditLogsDto
  ): Promise<{ filename: string; mimeType: string; content: string }> {
    const overview = await this.getAuditLedgerOverview(
      orgId,
      {
        range: filters.range as any,
        startDate: filters.startDate,
        endDate: filters.endDate,
        lens: filters.lens as any,
        action: filters.action,
        actorId: filters.actorId,
        resourceType: filters.resourceType,
        result: filters.result as any,
        limit: 1000,
      }
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `nxtqr-audit-evidence-${overview.organization.slug}-${timestamp}.${filters.format}`;

    if (filters.format === "json") {
      const sanitized = overview.events.map((e) => ({
        id: e.id,
        occurredAt: e.occurredAt,
        action: e.action,
        category: e.category,
        actor: e.actor,
        target: e.target,
        result: e.result,
        changes: e.changes,
        authorization: e.authorization,
        request: e.request,
      }));

      return {
        filename,
        mimeType: "application/json",
        content: JSON.stringify(sanitized, null, 2),
      };
    }

    // CSV format
    const headers = [
      "Timestamp",
      "Event ID",
      "Actor Type",
      "Actor Name",
      "Action",
      "Category",
      "Target Type",
      "Target Name",
      "Result",
      "Request ID",
      "Correlation ID",
      "Changes",
    ];

    const escapeCsv = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;

    const rows = overview.events.map((e) => {
      const changesSummary = e.changes.map((c) => `${c.field}: ${JSON.stringify(c.before)} -> ${JSON.stringify(c.after)}`).join("; ");
      return [
        escapeCsv(e.occurredAt),
        escapeCsv(e.id),
        escapeCsv(e.actor.type),
        escapeCsv(e.actor.name),
        escapeCsv(e.action),
        escapeCsv(e.category),
        escapeCsv(e.target.type),
        escapeCsv(e.target.name),
        escapeCsv(e.result),
        escapeCsv(e.request?.requestId || ""),
        escapeCsv(e.request?.correlationId || ""),
        escapeCsv(changesSummary),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return {
      filename,
      mimeType: "text/csv",
      content: csvContent,
    };
  },

  /**
   * Trusted server-side audit recording helper.
   */
  async recordEvent(params: {
    organizationId: string;
    actorId?: string | null;
    actorType?: AuditActorType;
    actorSnapshot?: { name: string; email?: string; role?: string };
    action: string;
    targetType: string;
    targetId: string;
    targetSnapshot?: { name: string; identifier?: string };
    category?: AuditCategory;
    result?: AuditEventResult;
    source?: string;
    requestId?: string;
    correlationId?: string;
    changes?: { before?: Record<string, any>; after?: Record<string, any> };
    authorization?: { permission?: string; decision: "allowed" | "denied"; role?: string; reason?: string };
    metadata?: Record<string, any>;
    ipHash?: string;
  }): Promise<void> {
    const supabase = getClient();
    const { label, category: autoCategory } = normalizeAuditAction(params.action);
    const { data, error } = await (supabase as any)
      .from("audit_logs")
      .insert({
        organization_id: params.organizationId,
        actor_id: params.actorId || null,
        actor_type: params.actorType || (params.actorId ? "user" : "system"),
        actor_snapshot: params.actorSnapshot || {},
        action: params.action,
        resource_type: params.targetType,
        target_type: params.targetType,
        target_id: params.targetId,
        target_snapshot: params.targetSnapshot || {},
        category: params.category || autoCategory,
        result: params.result || "success",
        source: params.source || "web_ui",
        request_id: params.requestId || null,
        correlation_id: params.correlationId || null,
        changes: redactSensitiveData(params.changes || {}),
        authorization_context: params.authorization || {},
        metadata_json: redactSensitiveData(params.metadata || {}),
        ip_hash: params.ipHash || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[SupabaseAuditRepository.recordEvent] Insert error:", error);
      throw new Error(`Failed to insert audit event: ${error.message}`);
    }

    return data?.id;
  },
};
