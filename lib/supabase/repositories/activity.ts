"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import { NotFoundError } from "@nxtqr/contracts";
import type {
  ActivityProjection,
  ActivityCategory,
  ActivitySignalMetrics,
  TemporalSpinePoint,
  ActivityDensityCell,
  ResourcePulseSegment,
  ActorResourceCell,
  ChangeFlowLink,
  EventCompositionItem,
  ActivityTimeSeriesPoint,
  ActivityFilterState,
  EventInspectorDetail,
} from "../types/activity";

export * from "../types/activity";

function getClient() {
  return createAdminClient();
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function parseRangeStartDate(range: string = "30d", customStart?: string): string {
  if (customStart) return new Date(customStart).toISOString();
  const now = new Date();
  if (range === "24h") {
    now.setHours(now.getHours() - 24);
  } else if (range === "7d") {
    now.setDate(now.getDate() - 7);
  } else if (range === "90d") {
    now.setDate(now.getDate() - 90);
  } else {
    // default 30d
    now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

export function categorizeAction(action: string): {
  category: ActivityCategory;
  verb: string;
  markerType: "publish" | "approval" | "standard" | "archive";
} {
  const act = action.toLowerCase();
  if (act.includes("publish")) {
    return { category: "publish", verb: "published", markerType: "publish" };
  }
  if (act.includes("approval")) {
    return { category: "approval", verb: "governed", markerType: "approval" };
  }
  if (act.includes("archive") || act.includes("deleted") || act.includes("delete")) {
    return { category: "archive", verb: "archived", markerType: "archive" };
  }
  if (act.includes("comment") || act.includes("thread")) {
    return { category: "comment", verb: "discussed", markerType: "standard" };
  }
  if (act.includes("route") || act.includes("routing")) {
    return { category: "routing", verb: "configured route for", markerType: "standard" };
  }
  if (act.includes("team")) {
    return { category: "team", verb: "updated team structure for", markerType: "standard" };
  }
  if (act.includes("member") || act.includes("invite") || act.includes("role")) {
    return { category: "membership", verb: "updated access for", markerType: "standard" };
  }
  if (act.includes("brand")) {
    return { category: "brand", verb: "updated brand kit", markerType: "standard" };
  }
  if (act.includes("domain")) {
    return { category: "domain", verb: "managed domain for", markerType: "standard" };
  }
  if (act.includes("guardian") || act.includes("probe") || act.includes("incident")) {
    return { category: "guardian", verb: "investigated incident on", markerType: "standard" };
  }
  if (act.includes("create")) {
    return { category: "create", verb: "created", markerType: "standard" };
  }
  return { category: "update", verb: "updated", markerType: "standard" };
}

export function formatEventReadableText(event: {
  action: string;
  resource_type: string;
  metadata_json?: any;
  actor_name?: string;
}): string {
  const meta = event.metadata_json || {};
  const resType = event.resource_type ? event.resource_type.replace(/_/g, " ") : "resource";
  const name = meta.title || meta.contextTitle || meta.name || meta.qrPublicId || meta.approvalPublicId || meta.threadPublicId || resType;
  const rev = meta.revision ? ` (rev ${meta.revision})` : "";
  const { verb } = categorizeAction(event.action);
  return `${verb} ${resType} "${name}"${rev}`;
}

export const SupabaseActivityRepository = {
  /**
   * Lists chronological activity events with actor join and human-readable projections.
   */
  async listActivityEvents(
    orgId: string,
    filters?: ActivityFilterState,
    limit = 100
  ): Promise<ActivityProjection[]> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(filters?.range, filters?.startDate);

    let query = supabase
      .from("activity_events")
      .select(`
        *,
        actor:profiles!activity_events_actor_id_fkey(id, display_name, email, avatar_url)
      `)
      .eq("organization_id", orgId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters?.actorId) {
      if (filters.actorId === "system") {
        query = query.or("actor_id.is.null,actor_id.eq.00000000-0000-0000-0000-000000000000");
      } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.actorId);
        if (isUuid) {
          query = query.eq("actor_id", filters.actorId);
        }
      }
    }
    if (filters?.resourceType && filters.resourceType !== "all") {
      query = query.eq("resource_type", filters.resourceType);
    }

    const { data: rows, error } = await query;
    if (error || !rows) {
      console.error("[SupabaseActivityRepository.listActivityEvents] query error:", error);
      return [];
    }

    const projections: ActivityProjection[] = rows.map((row: any) => {
      const meta = row.metadata_json || {};
      const { category, verb } = categorizeAction(row.action);
      const actorName = row.actor?.display_name || meta.actorName || (row.actor_id ? "Member" : "System");
      const isSystem = !row.actor_id || row.actor_id === "00000000-0000-0000-0000-000000000000";

      const resourceName =
        meta.title ||
        meta.contextTitle ||
        meta.name ||
        meta.resourceTitle ||
        meta.qrPublicId ||
        meta.approvalPublicId ||
        meta.threadPublicId ||
        `${row.resource_type.toUpperCase()} Asset`;

      const resourceRef =
        meta.ref ||
        meta.qrPublicId ||
        meta.approvalPublicId ||
        meta.threadPublicId ||
        meta.contextRef ||
        String(row.resource_id).substring(0, 8).toUpperCase();

      const context =
        meta.changeCategory ||
        meta.contextType ||
        (meta.revision ? `Rev ${meta.revision}` : "") ||
        "Operational Milestone";

      const changeSummary = meta.before || meta.after || meta.changes
        ? Object.keys(meta.after || meta.changes || {}).map((k) => ({
            field: k,
            before: meta.before ? meta.before[k] : undefined,
            after: (meta.after || meta.changes)[k],
          }))
        : undefined;

      return {
        id: row.id,
        organizationId: row.organization_id,
        actor: {
          id: row.actor_id || "system",
          name: actorName,
          email: row.actor?.email,
          avatarUrl: row.actor?.avatar_url,
          initials: getInitials(actorName),
          isSystem,
        },
        action: row.action,
        category,
        verb,
        resource: {
          type: row.resource_type,
          id: row.resource_id,
          name: resourceName,
          ref: resourceRef,
        },
        context,
        revision: meta.revision,
        teamId: meta.teamId,
        occurredAt: row.created_at,
        changeSummary,
        metadataJson: meta,
      };
    });

    // In-memory filter for category or search if applied
    let filtered = projections;
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category);
    }
    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.action.toLowerCase().includes(q) ||
          p.verb.toLowerCase().includes(q) ||
          p.actor.name.toLowerCase().includes(q) ||
          p.resource.name.toLowerCase().includes(q) ||
          p.resource.ref.toLowerCase().includes(q) ||
          p.context.toLowerCase().includes(q)
      );
    }

    return filtered;
  },

  /**
   * Derives real metrics for the Operational Signal Rail.
   */
  async getOperationalSignalMetrics(
    orgId: string,
    range: string = "30d"
  ): Promise<ActivitySignalMetrics> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(range);

    const { data: events, error } = await supabase
      .from("activity_events")
      .select("actor_id, action, resource_id")
      .eq("organization_id", orgId)
      .gte("created_at", startDate);

    if (error || !events) {
      return {
        totalEvents: 0,
        contributorsCount: 0,
        resourcesCount: 0,
        changesCount: 0,
        publishesCount: 0,
        approvalsCount: 0,
      };
    }

    const uniqueActors = new Set<string>();
    const uniqueResources = new Set<string>();
    let publishesCount = 0;
    let approvalsCount = 0;
    let changesCount = 0;

    events.forEach((e) => {
      if (e.actor_id) uniqueActors.add(e.actor_id);
      if (e.resource_id) uniqueResources.add(e.resource_id);

      const act = e.action.toLowerCase();
      if (act.includes("publish")) publishesCount++;
      if (act.includes("approval")) approvalsCount++;
      if (act.includes("update") || act.includes("create") || act.includes("publish")) changesCount++;
    });

    return {
      totalEvents: events.length,
      contributorsCount: uniqueActors.size,
      resourcesCount: uniqueResources.size,
      changesCount,
      publishesCount,
      approvalsCount,
    };
  },

  /**
   * Aggregates activity volume over time for the Activity Volume chart.
   */
  async getTimeSeries(
    orgId: string,
    range: string = "30d"
  ): Promise<ActivityTimeSeriesPoint[]> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(range);

    const { data: rows, error } = await supabase
      .from("activity_events")
      .select("action, created_at")
      .eq("organization_id", orgId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: true });

    if (error || !rows) return [];

    const map = new Map<string, ActivityTimeSeriesPoint>();

    rows.forEach((r) => {
      const dateKey = r.created_at.substring(0, 10); // YYYY-MM-DD
      const existing = map.get(dateKey) || {
        date: dateKey,
        total: 0,
        publishes: 0,
        approvals: 0,
        comments: 0,
        updates: 0,
      };

      existing.total++;
      const act = r.action.toLowerCase();
      if (act.includes("publish")) existing.publishes++;
      else if (act.includes("approval")) existing.approvals++;
      else if (act.includes("comment") || act.includes("thread")) existing.comments++;
      else existing.updates++;

      map.set(dateKey, existing);
    });

    return Array.from(map.values());
  },

  /**
   * Aggregates Day of Week × Hour buckets for the Activity Density Matrix.
   */
  async getDensityMatrix(
    orgId: string,
    range: string = "30d"
  ): Promise<ActivityDensityCell[]> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(range);

    const { data: rows, error } = await supabase
      .from("activity_events")
      .select("created_at")
      .eq("organization_id", orgId)
      .gte("created_at", startDate);

    const matrixMap = new Map<string, number>();
    const buckets = [0, 4, 8, 12, 16, 20];

    // Initialize all grid cells to 0
    for (let day = 0; day < 7; day++) {
      for (const bucket of buckets) {
        matrixMap.set(`${day}:${bucket}`, 0);
      }
    }

    rows?.forEach((r) => {
      const date = new Date(r.created_at);
      const day = date.getDay(); // 0 = Sun
      const hour = date.getHours();
      // Bucket into 4-hour intervals
      const bucket = buckets.reduce((prev, curr) => (hour >= curr ? curr : prev), 0);
      const key = `${day}:${bucket}`;
      matrixMap.set(key, (matrixMap.get(key) || 0) + 1);
    });

    const cells: ActivityDensityCell[] = [];
    matrixMap.forEach((count, key) => {
      const [dayStr, bucketStr] = key.split(":");
      cells.push({
        dayOfWeek: parseInt(dayStr, 10),
        hourBucket: parseInt(bucketStr, 10),
        count,
      });
    });

    return cells;
  },

  /**
   * Aggregates real event volume by resource type for the Resource Pulse.
   */
  async getResourcePulse(
    orgId: string,
    range: string = "30d"
  ): Promise<ResourcePulseSegment[]> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(range);

    const { data: rows, error } = await supabase
      .from("activity_events")
      .select("resource_type, resource_id, created_at")
      .eq("organization_id", orgId)
      .gte("created_at", startDate);

    if (error || !rows || rows.length === 0) return [];

    const resourceMap = new Map<
      string,
      { count: number; resources: Set<string>; latestAt: string }
    >();

    rows.forEach((r) => {
      const existing = resourceMap.get(r.resource_type) || {
        count: 0,
        resources: new Set<string>(),
        latestAt: r.created_at,
      };
      existing.count++;
      if (r.resource_id) existing.resources.add(r.resource_id);
      if (new Date(r.created_at) > new Date(existing.latestAt)) {
        existing.latestAt = r.created_at;
      }
      resourceMap.set(r.resource_type, existing);
    });

    const total = rows.length;
    const segments: ResourcePulseSegment[] = [];

    resourceMap.forEach((val, type) => {
      segments.push({
        resourceType: type,
        label: type.replace(/_/g, " ").toUpperCase(),
        eventCount: val.count,
        distinctResourceCount: val.resources.size,
        percentage: total > 0 ? Math.round((val.count / total) * 100) : 0,
        latestEventAt: val.latestAt,
      });
    });

    return segments.sort((a, b) => b.eventCount - a.eventCount);
  },

  /**
   * Matrix of real actors vs resource categories touched.
   */
  async getActorResourceMatrix(
    orgId: string,
    range: string = "30d"
  ): Promise<ActorResourceCell[]> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(range);

    const { data: rows, error } = await supabase
      .from("activity_events")
      .select(`
        actor_id,
        resource_type,
        actor:profiles!activity_events_actor_id_fkey(id, display_name)
      `)
      .eq("organization_id", orgId)
      .gte("created_at", startDate);

    if (error || !rows) return [];

    const cellMap = new Map<
      string,
      { actorId: string; actorName: string; resourceType: string; count: number }
    >();

    rows.forEach((r: any) => {
      const actorId = r.actor_id || "system";
      const actorName = r.actor?.display_name || (r.actor_id ? "Member" : "System");
      const key = `${actorId}:${r.resource_type}`;
      const existing = cellMap.get(key) || {
        actorId,
        actorName,
        resourceType: r.resource_type,
        count: 0,
      };
      existing.count++;
      cellMap.set(key, existing);
    });

    return Array.from(cellMap.values()).map((c) => ({
      ...c,
      actorInitials: getInitials(c.actorName),
    }));
  },

  /**
   * Aggregates event composition across categories.
   */
  async getEventComposition(
    orgId: string,
    range: string = "30d"
  ): Promise<EventCompositionItem[]> {
    const supabase = getClient();
    const startDate = parseRangeStartDate(range);

    const { data: rows, error } = await supabase
      .from("activity_events")
      .select("action")
      .eq("organization_id", orgId)
      .gte("created_at", startDate);

    if (error || !rows || rows.length === 0) return [];

    const countMap = new Map<ActivityCategory, number>();
    rows.forEach((r) => {
      const { category } = categorizeAction(r.action);
      countMap.set(category, (countMap.get(category) || 0) + 1);
    });

    const categoryColors: Record<ActivityCategory, string> = {
      publish: "#FA520F",
      approval: "#FFB83E",
      create: "#3B82F6",
      update: "#10B981",
      comment: "#8B5CF6",
      routing: "#06B6D4",
      team: "#EC4899",
      membership: "#6366F1",
      brand: "#F59E0B",
      domain: "#14B8A6",
      guardian: "#EF4444",
      archive: "#6B7280",
      restore: "#22C55E",
      delete: "#DC2626",
    };

    const total = rows.length;
    const items: EventCompositionItem[] = [];

    countMap.forEach((count, cat) => {
      items.push({
        category: cat,
        label: cat.toUpperCase(),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: categoryColors[cat] || "#888888",
      });
    });

    return items.sort((a, b) => b.count - a.count);
  },

  /**
   * Derives verified transitions between product milestones (Change Flow).
   */
  async getChangeFlow(
    orgId: string,
    range: string = "30d"
  ): Promise<ChangeFlowLink[]> {
    const events = await this.listActivityEvents(orgId, { view: "stream", range: range as any }, 200);

    const links: ChangeFlowLink[] = [];
    const linkMap = new Map<string, number>();

    // Scan for proven transitions on the same resource
    const resourceEventMap = new Map<string, ActivityProjection[]>();
    events.forEach((e) => {
      const key = `${e.resource.type}:${e.resource.id}`;
      if (!resourceEventMap.has(key)) resourceEventMap.set(key, []);
      resourceEventMap.get(key)!.push(e);
    });

    resourceEventMap.forEach((list) => {
      // Sort ascending to trace progression
      list.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
      for (let i = 0; i < list.length - 1; i++) {
        const from = list[i].category.toUpperCase();
        const to = list[i + 1].category.toUpperCase();
        if (from !== to) {
          const linkKey = `${from} ➔ ${to}`;
          linkMap.set(linkKey, (linkMap.get(linkKey) || 0) + 1);
        }
      }
    });

    linkMap.forEach((count, key) => {
      const [source, target] = key.split(" ➔ ");
      links.push({
        source,
        target,
        count,
        description: `${count} transitions from ${source} to ${target}`,
      });
    });

    return links.sort((a, b) => b.count - a.count).slice(0, 10);
  },

  /**
   * Retrieves single event inspector detail with related event chain.
   */
  async getEventDetail(
    orgId: string,
    eventId: string
  ): Promise<EventInspectorDetail> {
    const supabase = getClient();

    const { data: row, error } = await supabase
      .from("activity_events")
      .select(`
        *,
        actor:profiles!activity_events_actor_id_fkey(id, display_name, email, avatar_url)
      `)
      .eq("id", eventId)
      .eq("organization_id", orgId)
      .single();

    if (error || !row) {
      throw new NotFoundError("Activity event not found.");
    }

    const meta = (row.metadata_json as Record<string, any>) || {};
    const { category, verb } = categorizeAction(row.action);
    const actorName = row.actor?.display_name || meta.actorName || (row.actor_id ? "Member" : "System");
    const isSystem = !row.actor_id || row.actor_id === "00000000-0000-0000-0000-000000000000";

    // Fetch related events for the same resource
    const { data: chainRows } = await supabase
      .from("activity_events")
      .select(`
        id, action, created_at,
        actor:profiles!activity_events_actor_id_fkey(display_name)
      `)
      .eq("organization_id", orgId)
      .eq("resource_id", row.resource_id)
      .order("created_at", { ascending: true })
      .limit(10);

    const eventChain = (chainRows || []).map((cr: any) => ({
      id: cr.id,
      action: cr.action,
      occurredAt: cr.created_at,
      actorName: cr.actor?.display_name || "Member",
      label: cr.action.replace(/_/g, " ").toUpperCase(),
    }));

    return {
      id: row.id,
      organizationId: row.organization_id,
      actor: {
        id: row.actor_id || "system",
        name: actorName,
        email: row.actor?.email,
        avatarUrl: row.actor?.avatar_url,
        initials: getInitials(actorName),
        isSystem,
      },
      action: row.action,
      category,
      verb,
      resource: {
        type: row.resource_type,
        id: row.resource_id,
        name: meta.title || meta.name || `${row.resource_type.toUpperCase()} Asset`,
        ref: meta.ref || meta.qrPublicId || meta.approvalPublicId || String(row.resource_id).substring(0, 8),
      },
      context: meta.contextType || meta.changeCategory || "Operational Event",
      revision: meta.revision,
      teamId: meta.teamId,
      occurredAt: row.created_at,
      metadataJson: meta,
      eventChain,
    };
  },

  /**
   * Generates sanitized CSV string of filtered events.
   */
  async exportActivityCsv(
    orgId: string,
    filters?: ActivityFilterState
  ): Promise<string> {
    const events = await this.listActivityEvents(orgId, filters, 1000);
    const headers = ["Event ID", "Timestamp (UTC)", "Actor", "Action", "Category", "Resource Type", "Resource Name", "Revision"];
    const rows = events.map((e) => [
      e.id,
      e.occurredAt,
      `"${e.actor.name.replace(/"/g, '""')}"`,
      `"${e.action.replace(/"/g, '""')}"`,
      e.category,
      e.resource.type,
      `"${e.resource.name.replace(/"/g, '""')}"`,
      e.revision ? String(e.revision) : "",
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  },
};
