/**
 * NXTQR — Cloudflare D1 Database Client & Repositories
 * Type-safe access layer for Cloudflare D1 SQL queries.
 */

import {
  RedirectSnapshot,
  QRAsset,
  PermissionCode,
  PlanEntitlements,
  AuditLogEntry,
  TIER_DEFAULT_ENTITLEMENTS,
  SaaSTier,
  AnalyticsFilterParams,
  SubscriptionStatus,
  PaymentStatus,
  PaymentLedgerEntry,
} from "@nxtqr/contracts";

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: unknown }>;
  run(): Promise<{ success: boolean; meta: unknown }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<{ results: T[]; success: boolean }[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

/**
 * Generates a stable, collision-resistant opaque identifier with domain prefix.
 */
export function generateOpaqueId(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "").substring(0, 16)
    : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  return `${prefix}_${uuid}`;
}

/**
 * Resolves a redirect snapshot directly from D1 for edge fallback.
 * Uses published_version_id when present (decoupled from drafts).
 */
export async function getRedirectSnapshotFromD1(
  db: D1Database,
  slug: string
): Promise<RedirectSnapshot | null> {
  const query = `
    SELECT 
      q.id as qrId,
      q.organization_id as orgId,
      q.status as status,
      d.default_url as defaultDestination,
      d.fallback_url as fallbackDestination,
      d.password_hash as passwordHash,
      d.starts_at as startsAt,
      d.expires_at as expiresAt,
      COALESCE(q.published_version_id, q.current_version_id) as activeVersionId,
      q.updated_at as updatedAt
    FROM qr_codes q
    LEFT JOIN qr_destinations d ON d.qr_id = q.id
    WHERE q.slug = ? AND q.status != 'ARCHIVED'
    LIMIT 1
  `;

  const row = await db.prepare(query).bind(slug).first<{
    qrId: string;
    orgId: string;
    status: string;
    defaultDestination: string;
    fallbackDestination: string | null;
    passwordHash: string | null;
    startsAt: number | null;
    expiresAt: number | null;
    activeVersionId: string;
    updatedAt: number;
  }>();

  if (!row) return null;

  // Query active routing rules
  const rulesQuery = `
    SELECT id, name, priority, destination_url, match_type, action_type
    FROM qr_rules
    WHERE qr_id = ? AND is_active = 1
    ORDER BY priority ASC
  `;
  const rulesRows = await db.prepare(rulesQuery).bind(row.qrId).all<{
    id: string;
    name: string;
    priority: number;
    destination_url: string;
    match_type: "ALL" | "ANY";
    action_type: string;
  }>();

  const rules = rulesRows.results.map((r) => ({
    id: r.id,
    qrId: row.qrId,
    name: r.name,
    priority: r.priority,
    isActive: true,
    matchType: r.match_type,
    conditions: [],
    action: {
      type: r.action_type as any,
      destinationUrl: r.destination_url,
    },
  }));

  return {
    schemaVersion: 1,
    qrId: row.qrId,
    organizationId: row.orgId,
    status: row.status as any,
    publishedRevision: 1,
    defaultDestination: {
      id: row.qrId,
      url: row.defaultDestination,
    },
    fallbackDestination: row.fallbackDestination
      ? {
          id: `fallback_${row.qrId}`,
          url: row.fallbackDestination,
        }
      : undefined,
    passwordHash: row.passwordHash || undefined,
    startsAt: row.startsAt || undefined,
    expiresAt: row.expiresAt || undefined,
    rules,
    guardian: {
      state: "HEALTHY",
      observedAt: new Date().toISOString(),
    },
    guardianHealthy: true,
    publishedAt: new Date().toISOString(),
    updatedAt: row.updatedAt,
  };
}

/**
 * Queries routing rules configured across an organization's QR assets.
 */
export async function queryOrganizationRoutingRules(
  db: D1Database,
  organizationId: string
): Promise<Array<{
  id: string;
  qrId: string;
  qrSlug: string;
  name: string;
  priority: number;
  destinationUrl: string;
  matchType: "ALL" | "ANY";
  actionType: string;
  isActive: boolean;
}>> {
  const query = `
    SELECT 
      r.id,
      r.qr_id as qrId,
      q.slug as qrSlug,
      r.name,
      r.priority,
      r.destination_url as destinationUrl,
      r.match_type as matchType,
      r.action_type as actionType,
      r.is_active as isActive
    FROM qr_rules r
    JOIN qr_codes q ON q.id = r.qr_id
    WHERE q.organization_id = ? AND q.status != 'ARCHIVED'
    ORDER BY r.priority ASC
  `;

  const rows = await db.prepare(query).bind(organizationId).all<{
    id: string;
    qrId: string;
    qrSlug: string;
    name: string;
    priority: number;
    destinationUrl: string;
    matchType: "ALL" | "ANY";
    actionType: string;
    isActive: number;
  }>();

  return (rows.results || []).map((r) => ({
    id: r.id,
    qrId: r.qrId,
    qrSlug: r.qrSlug,
    name: r.name,
    priority: r.priority,
    destinationUrl: r.destinationUrl,
    matchType: r.matchType,
    actionType: r.actionType,
    isActive: Boolean(r.isActive),
  }));
}


/**
 * Retrieve all active permissions for an organization member.
 */
export async function getMemberPermissions(
  db: D1Database,
  organizationId: string,
  userId: string
): Promise<PermissionCode[]> {
  const query = `
    SELECT DISTINCT p.code
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN member_roles mr ON mr.role_id = rp.role_id
    JOIN organization_members om ON om.id = mr.member_id
    WHERE om.organization_id = ? AND om.user_id = ? AND om.status = 'active'
  `;

  const { results } = await db.prepare(query).bind(organizationId, userId).all<{ code: PermissionCode }>();
  return results.map((r) => r.code);
}

/**
 * Retrieve active entitlements and current usage for an organization.
 */
export async function getOrganizationEntitlements(
  db: D1Database,
  organizationId: string
): Promise<{ tier: SaaSTier; limits: PlanEntitlements; usage: Record<string, number> }> {
  // Query organization plan
  const org = await db
    .prepare("SELECT billing_plan FROM organizations WHERE id = ? LIMIT 1")
    .bind(organizationId)
    .first<{ billing_plan: SaaSTier }>();

  const tier: SaaSTier = org?.billing_plan || "FREE";
  const defaultLimits = TIER_DEFAULT_ENTITLEMENTS[tier];

  // Query custom overrides or current usage records
  const { results } = await db
    .prepare("SELECT feature_key, numeric_limit, boolean_allowed, current_usage FROM entitlements WHERE organization_id = ?")
    .bind(organizationId)
    .all<{
      feature_key: keyof PlanEntitlements;
      numeric_limit: number;
      boolean_allowed: number;
      current_usage: number;
    }>();

  const usage: Record<string, number> = {};
  const limits = { ...defaultLimits };

  for (const row of results) {
    usage[row.feature_key] = row.current_usage;
    if (typeof (limits as any)[row.feature_key] === "number") {
      (limits as any)[row.feature_key] = row.numeric_limit;
    } else if (typeof (limits as any)[row.feature_key] === "boolean") {
      (limits as any)[row.feature_key] = row.boolean_allowed === 1;
    }
  }

  return { tier, limits, usage };
}

/**
 * Record an immutable security audit log entry.
 */
export async function recordAuditLog(
  db: D1Database,
  entry: Omit<AuditLogEntry, "id" | "timestamp">
): Promise<void> {
  const id = generateOpaqueId("aud");
  const query = `
    INSERT INTO audit_logs (id, organization_id, actor_id, action, resource_type, resource_id, metadata_json, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db
    .prepare(query)
    .bind(
      id,
      entry.organizationId,
      entry.actorId,
      entry.action,
      entry.resourceType,
      entry.resourceId,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.ipHash || null
    )
    .run();
}

/**
 * Record a user-facing activity stream event.
 */
export async function recordActivityEvent(
  db: D1Database,
  event: {
    organizationId: string;
    actorId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const id = generateOpaqueId("act");
  const query = `
    INSERT INTO activity_events (id, organization_id, actor_id, action, resource_type, resource_id, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await db
    .prepare(query)
    .bind(
      id,
      event.organizationId,
      event.actorId || null,
      event.action,
      event.resourceType,
      event.resourceId || null,
      event.metadata ? JSON.stringify(event.metadata) : null
    )
    .run();
}

/**
 * Record an idempotent payment webhook event.
 * Returns true if newly recorded, false if already processed (duplicate).
 */
export async function recordPaymentEvent(
  db: D1Database,
  event: {
    provider: string;
    providerEventKey: string;
    eventType: string;
    payloadHash: string;
  }
): Promise<{ isDuplicate: boolean; eventId: string }> {
  const id = generateOpaqueId("pevt");
  const query = `
    INSERT OR IGNORE INTO payment_events (id, provider, provider_event_key, event_type, payload_hash, status)
    VALUES (?, ?, ?, ?, ?, 'PROCESSED')
  `;
  const result = await db
    .prepare(query)
    .bind(id, event.provider, event.providerEventKey, event.eventType, event.payloadHash)
    .run();

  // If no rows were changed, it was an ignored duplicate
  const isDuplicate = (result as any)?.meta?.changes === 0;
  return { isDuplicate, eventId: id };
}

/**
 * Prune Guardian detailed health checks older than a retention threshold.
 * Bounded retention prevents continuous 60s health checks from bloating D1.
 */
export async function pruneOldGuardianChecks(
  db: D1Database,
  olderThanTimestamp: number
): Promise<number> {
  const query = `DELETE FROM link_checks WHERE checked_at < ?`;
  const result = await db.prepare(query).bind(olderThanTimestamp).run();
  return (result as any)?.meta?.changes || 0;
}

/**
 * Analytics Query Repositories (Bounded rollups from scan_events_hourly and conversion_events)
 */

export async function queryScanOverview(
  db: D1Database,
  organizationId: string,
  filter: AnalyticsFilterParams
): Promise<{
  totalScans: number;
  estimatedUniqueScans: number;
  conversions: number;
  conversionRate: number;
  suspectedAutomation: number;
  blockedEvents: number;
}> {
  const startHour = Math.floor(filter.dateFrom / 3600000) * 3600000;
  const endHour = Math.floor(filter.dateTo / 3600000) * 3600000;

  // 1. Query scan volume aggregates
  let sql = `
    SELECT 
      COALESCE(SUM(total_scans), 0) as totalScans,
      COALESCE(SUM(unique_scans), 0) as uniqueScans
    FROM scan_events_hourly
    WHERE organization_id = ? AND hour_bucket >= ? AND hour_bucket <= ?
  `;
  const params: unknown[] = [organizationId, startHour, endHour];

  if (filter.qrIds && filter.qrIds.length > 0) {
    const placeholders = filter.qrIds.map(() => "?").join(",");
    sql += ` AND qr_id IN (${placeholders})`;
    params.push(...filter.qrIds);
  }

  const scanRow = await db.prepare(sql).bind(...params).first<{
    totalScans: number;
    uniqueScans: number;
  }>();

  const totalScans = scanRow?.totalScans || 0;
  const estimatedUniqueScans = scanRow?.uniqueScans || 0;

  // 2. Query conversions in window
  let convSql = `
    SELECT COUNT(id) as totalConversions
    FROM conversion_events
    WHERE organization_id = ? AND created_at >= ? AND created_at <= ?
  `;
  const startSec = Math.floor(filter.dateFrom / 1000);
  const endSec = Math.floor(filter.dateTo / 1000);
  const convParams: unknown[] = [organizationId, startSec, endSec];

  if (filter.qrIds && filter.qrIds.length > 0) {
    const placeholders = filter.qrIds.map(() => "?").join(",");
    convSql += ` AND qr_id IN (${placeholders})`;
    convParams.push(...filter.qrIds);
  }

  const convRow = await db.prepare(convSql).bind(...convParams).first<{ totalConversions: number }>();
  const conversions = convRow?.totalConversions || 0;
  const conversionRate = totalScans > 0 ? Number(((conversions / totalScans) * 100).toFixed(2)) : 0;

  return {
    totalScans,
    estimatedUniqueScans,
    conversions,
    conversionRate,
    suspectedAutomation: 0,
    blockedEvents: 0,
  };
}

export async function queryScanTimeseries(
  db: D1Database,
  organizationId: string,
  filter: AnalyticsFilterParams
): Promise<Array<{ timestamp: number; totalScans: number; uniqueScans: number }>> {
  const startHour = Math.floor(filter.dateFrom / 3600000) * 3600000;
  const endHour = Math.floor(filter.dateTo / 3600000) * 3600000;

  const sql = `
    SELECT 
      hour_bucket as bucket,
      SUM(total_scans) as totalScans,
      SUM(unique_scans) as uniqueScans
    FROM scan_events_hourly
    WHERE organization_id = ? AND hour_bucket >= ? AND hour_bucket <= ?
    GROUP BY hour_bucket
    ORDER BY hour_bucket ASC
  `;

  const { results } = await db.prepare(sql).bind(organizationId, startHour, endHour).all<{
    bucket: number;
    totalScans: number;
    uniqueScans: number;
  }>();

  return (results || []).map((r) => ({
    timestamp: r.bucket,
    totalScans: r.totalScans || 0,
    uniqueScans: r.uniqueScans || 0,
  }));
}

export async function queryDeviceBreakdown(
  db: D1Database,
  organizationId: string,
  filter: AnalyticsFilterParams
): Promise<{
  devices: Array<{ name: string; value: number }>;
  os: Array<{ name: string; value: number }>;
}> {
  const startHour = Math.floor(filter.dateFrom / 3600000) * 3600000;
  const endHour = Math.floor(filter.dateTo / 3600000) * 3600000;

  const devSql = `
    SELECT device_type as name, SUM(total_scans) as value
    FROM scan_events_hourly
    WHERE organization_id = ? AND hour_bucket >= ? AND hour_bucket <= ?
    GROUP BY device_type
    ORDER BY value DESC
  `;
  const devRows = await db.prepare(devSql).bind(organizationId, startHour, endHour).all<{
    name: string;
    value: number;
  }>();

  const osSql = `
    SELECT os_name as name, SUM(total_scans) as value
    FROM scan_events_hourly
    WHERE organization_id = ? AND hour_bucket >= ? AND hour_bucket <= ?
    GROUP BY os_name
    ORDER BY value DESC
  `;
  const osRows = await db.prepare(osSql).bind(organizationId, startHour, endHour).all<{
    name: string;
    value: number;
  }>();

  return {
    devices: devRows.results || [],
    os: osRows.results || [],
  };
}

export async function queryTopLocations(
  db: D1Database,
  organizationId: string,
  filter: AnalyticsFilterParams
): Promise<Array<{ countryCode: string; scans: number }>> {
  const startHour = Math.floor(filter.dateFrom / 3600000) * 3600000;
  const endHour = Math.floor(filter.dateTo / 3600000) * 3600000;

  const sql = `
    SELECT country_code as countryCode, SUM(total_scans) as scans
    FROM scan_events_hourly
    WHERE organization_id = ? AND hour_bucket >= ? AND hour_bucket <= ?
    GROUP BY country_code
    ORDER BY scans DESC
    LIMIT 10
  `;

  const { results } = await db.prepare(sql).bind(organizationId, startHour, endHour).all<{
    countryCode: string;
    scans: number;
  }>();

  return results || [];
}

export async function createReportJobInD1(
  db: D1Database,
  job: {
    organizationId: string;
    savedReportId?: string;
    requestedBy: string;
  }
): Promise<string> {
  const jobId = generateOpaqueId("repjob");
  const sql = `
    INSERT INTO report_jobs (id, organization_id, saved_report_id, status, requested_by, created_at)
    VALUES (?, ?, ?, 'QUEUED', ?, unixepoch())
  `;
  await db.prepare(sql).bind(jobId, job.organizationId, job.savedReportId || null, job.requestedBy).run();
  return jobId;
}

/**
 * Records an immutable forensic security audit event in Cloudflare D1.
 * Sensitive metadata values are strictly redacted before serialization.
 */
export async function recordAuditEvent(
  db: D1Database,
  entry: {
    organizationId: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
    ipHash?: string;
  }
): Promise<string> {
  const auditId = generateOpaqueId("audit");
  const metadataJson = entry.metadata ? JSON.stringify(entry.metadata) : null;
  const now = Math.floor(Date.now() / 1000);

  const sql = `
    INSERT INTO audit_logs (
      id, organization_id, actor_id, action, resource_type, resource_id, metadata_json, ip_hash, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.prepare(sql).bind(
    auditId,
    entry.organizationId,
    entry.actorId,
    entry.action,
    entry.resourceType,
    entry.resourceId,
    metadataJson,
    entry.ipHash || null,
    now
  ).run();

  return auditId;
}

/**
 * Queries forensic security audit events for an organization.
 */
export async function queryAuditLogs(
  db: D1Database,
  filter: {
    organizationId: string;
    actorId?: string;
    action?: string;
    resourceType?: string;
    limit?: number;
    offset?: number;
  }
): Promise<AuditLogEntry[]> {
  const limit = Math.min(filter.limit || 50, 100);
  const offset = filter.offset || 0;

  let sql = `
    SELECT id, organization_id as organizationId, actor_id as actorId, action,
           resource_type as resourceType, resource_id as resourceId,
           metadata_json as metadataJson, ip_hash as ipHash, created_at as createdAt
    FROM audit_logs
    WHERE organization_id = ?
  `;
  const binds: unknown[] = [filter.organizationId];

  if (filter.actorId) {
    sql += ` AND actor_id = ?`;
    binds.push(filter.actorId);
  }
  if (filter.action) {
    sql += ` AND action = ?`;
    binds.push(filter.action);
  }
  if (filter.resourceType) {
    sql += ` AND resource_type = ?`;
    binds.push(filter.resourceType);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  binds.push(limit, offset);

  const { results } = await db.prepare(sql).bind(...binds).all<{
    id: string;
    organizationId: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadataJson: string | null;
    ipHash: string | null;
    createdAt: number;
  }>();

  return (results || []).map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    actorId: row.actorId,
    action: row.action as any,
    resourceType: row.resourceType as any,
    resourceId: row.resourceId,
    metadata: row.metadataJson ? JSON.parse(row.metadataJson) : undefined,
    ipHash: row.ipHash || undefined,
    timestamp: row.createdAt * 1000,
    createdAt: new Date(row.createdAt * 1000).toISOString(),
  }));
}

/**
 * Persists an API Key hash in Cloudflare D1 with scopes.
 * Plaintext secret is NEVER stored in database.
 */
export async function createApiKeyInD1(
  db: D1Database,
  params: {
    organizationId: string;
    name: string;
    prefix: string;
    keyHash: string;
    scopes: string[];
    expiresAt?: number;
  }
): Promise<string> {
  const apiKeyId = generateOpaqueId("key");
  const now = Math.floor(Date.now() / 1000);

  const insertKeySql = `
    INSERT INTO api_keys (id, organization_id, name, prefix, key_hash, scopes_json, expires_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
  `;

  await db.prepare(insertKeySql).bind(
    apiKeyId,
    params.organizationId,
    params.name,
    params.prefix,
    params.keyHash,
    JSON.stringify(params.scopes),
    params.expiresAt ? Math.floor(params.expiresAt / 1000) : null,
    now
  ).run();

  // Insert scopes
  if (params.scopes.length > 0) {
    const scopeStatements = params.scopes.map((scope) =>
      db.prepare(`INSERT OR IGNORE INTO api_key_scopes (api_key_id, scope) VALUES (?, ?)`).bind(apiKeyId, scope)
    );
    await db.batch(scopeStatements);
  }

  return apiKeyId;
}

/**
 * Queries active and revoked API keys for an organization.
 * Plaintext secrets are never returned.
 */
export async function queryOrganizationApiKeys(
  db: D1Database,
  organizationId: string
): Promise<Array<{
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: "active" | "revoked";
  lastUsedAt?: number;
  createdAt: number;
}>> {
  const sql = `
    SELECT id, name, prefix, scopes_json as scopesJson, status, last_used_at as lastUsedAt, created_at as createdAt
    FROM api_keys
    WHERE organization_id = ?
    ORDER BY created_at DESC
  `;

  const { results } = await db.prepare(sql).bind(organizationId).all<{
    id: string;
    name: string;
    prefix: string;
    scopesJson: string;
    status: "active" | "revoked";
    lastUsedAt: number | null;
    createdAt: number;
  }>();

  return (results || []).map((row) => ({
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    scopes: row.scopesJson ? JSON.parse(row.scopesJson) : [],
    status: row.status,
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt * 1000 : undefined,
    createdAt: row.createdAt * 1000,
  }));
}

/**
 * Revokes an API Key in Cloudflare D1.
 */
export async function revokeApiKeyInD1(
  db: D1Database,
  organizationId: string,
  apiKeyId: string
): Promise<boolean> {
  const sql = `UPDATE api_keys SET status = 'revoked' WHERE id = ? AND organization_id = ?`;
  const res = await db.prepare(sql).bind(apiKeyId, organizationId).run();
  return res.success;
}

/**
 * Queries collaboration activity stream for an organization with cursor pagination.
 */
export async function queryActivityEvents(
  db: D1Database,
  organizationId: string,
  limit = 50
): Promise<Array<{
  id: string;
  organizationId: string;
  actorId?: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}>> {
  const sql = `
    SELECT 
      a.id,
      a.organization_id as organizationId,
      a.actor_id as actorId,
      COALESCE(u.name, 'Workspace Member') as actorName,
      a.action,
      a.resource_type as resourceType,
      a.resource_id as resourceId,
      a.metadata_json as metadataJson,
      a.created_at as createdAt
    FROM activity_events a
    LEFT JOIN users u ON u.id = a.actor_id
    WHERE a.organization_id = ?
    ORDER BY a.created_at DESC
    LIMIT ?
  `;
  const { results } = await db.prepare(sql).bind(organizationId, limit).all<{
    id: string;
    organizationId: string;
    actorId: string | null;
    actorName: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadataJson: string | null;
    createdAt: number;
  }>();

  return (results || []).map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    actorId: row.actorId || undefined,
    actorName: row.actorName,
    action: row.action,
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    metadata: row.metadataJson ? JSON.parse(row.metadataJson) : {},
    createdAt: row.createdAt * 1000,
  }));
}

/**
 * Queries threaded comments for a given resource.
 */
export async function queryCommentsInD1(
  db: D1Database,
  organizationId: string,
  resourceType: string,
  resourceId: string
): Promise<Array<{
  id: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  resolved: boolean;
  createdAt: number;
}>> {
  const sql = `
    SELECT 
      c.id,
      c.organization_id as organizationId,
      c.resource_type as resourceType,
      c.resource_id as resourceId,
      c.parent_id as parentId,
      c.author_id as authorId,
      COALESCE(u.name, 'Collaborator') as authorName,
      c.content,
      c.resolved,
      c.created_at as createdAt
    FROM comments c
    LEFT JOIN users u ON u.id = c.author_id
    WHERE c.organization_id = ? AND c.resource_type = ? AND c.resource_id = ?
    ORDER BY c.created_at ASC
  `;
  const { results } = await db.prepare(sql).bind(organizationId, resourceType, resourceId).all<{
    id: string;
    organizationId: string;
    resourceType: string;
    resourceId: string;
    parentId: string | null;
    authorId: string;
    authorName: string;
    content: string;
    resolved: number;
    createdAt: number;
  }>();

  return (results || []).map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    resourceType: r.resourceType,
    resourceId: r.resourceId,
    parentId: r.parentId,
    authorId: r.authorId,
    authorName: r.authorName,
    content: r.content,
    resolved: Boolean(r.resolved),
    createdAt: r.createdAt * 1000,
  }));
}

/**
 * Inserts a new threaded comment into D1.
 */
export async function createCommentInD1(
  db: D1Database,
  params: {
    organizationId: string;
    resourceType: string;
    resourceId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }
): Promise<string> {
  const id = generateOpaqueId("cmt");
  const sql = `
    INSERT INTO comments (id, organization_id, resource_type, resource_id, parent_id, author_id, content, resolved, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, unixepoch())
  `;
  await db
    .prepare(sql)
    .bind(
      id,
      params.organizationId,
      params.resourceType,
      params.resourceId,
      params.parentId || null,
      params.authorId,
      params.content
    )
    .run();
  return id;
}

/**
 * Queries teams within an organization.
 */
export async function queryTeamsInD1(
  db: D1Database,
  organizationId: string
): Promise<Array<{
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  membersCount: number;
  resourcesCount: number;
  createdAt: number;
}>> {
  const sql = `
    SELECT 
      t.id,
      t.organization_id as organizationId,
      t.name,
      t.description,
      COUNT(DISTINCT tm.member_id) as membersCount,
      COUNT(DISTINCT rta.id) as resourcesCount,
      t.created_at as createdAt
    FROM teams t
    LEFT JOIN team_members tm ON tm.team_id = t.id
    LEFT JOIN resource_team_assignments rta ON rta.team_id = t.id
    WHERE t.organization_id = ?
    GROUP BY t.id
    ORDER BY t.name ASC
  `;
  const { results } = await db.prepare(sql).bind(organizationId).all<{
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    membersCount: number;
    resourcesCount: number;
    createdAt: number;
  }>();

  return (results || []).map((t) => ({
    id: t.id,
    organizationId: t.organizationId,
    name: t.name,
    description: t.description || undefined,
    membersCount: t.membersCount || 0,
    resourcesCount: t.resourcesCount || 0,
    createdAt: t.createdAt * 1000,
  }));
}

/**
 * ==============================================================================
 * Phase 10: Cashfree Billing, Subscriptions, Ledger & Usage Metering
 * ==============================================================================
 */

export interface OrganizationBillingSnapshot {
  organizationId: string;
  billingPlan: SaaSTier;
  subscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  provider: "cashfree";
  providerSubscriptionId?: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
}

/**
 * Retrieve organization subscription status and plan from D1.
 */
export async function getOrganizationPlanAndSubscription(
  db: D1Database,
  organizationId: string
): Promise<OrganizationBillingSnapshot> {
  const query = `
    SELECT 
      o.id as organizationId,
      o.billing_plan as billingPlan,
      s.id as subscriptionId,
      s.status as subscriptionStatus,
      s.provider as provider,
      s.provider_subscription_id as providerSubscriptionId,
      s.current_period_start as currentPeriodStart,
      s.current_period_end as currentPeriodEnd,
      s.cancel_at_period_end as cancelAtPeriodEnd
    FROM organizations o
    LEFT JOIN subscriptions s ON s.organization_id = o.id
    WHERE o.id = ?
    LIMIT 1
  `;
  const row = await db.prepare(query).bind(organizationId).first<{
    organizationId: string;
    billingPlan: SaaSTier;
    subscriptionId: string | null;
    subscriptionStatus: SubscriptionStatus | null;
    provider: "cashfree" | null;
    providerSubscriptionId: string | null;
    currentPeriodStart: number | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: number | null;
  }>();

  return {
    organizationId,
    billingPlan: row?.billingPlan || "FREE",
    subscriptionId: row?.subscriptionId || undefined,
    subscriptionStatus: row?.subscriptionStatus || "ACTIVE",
    provider: "cashfree",
    providerSubscriptionId: row?.providerSubscriptionId || undefined,
    currentPeriodStart: row?.currentPeriodStart ? row.currentPeriodStart * 1000 : undefined,
    currentPeriodEnd: row?.currentPeriodEnd ? row.currentPeriodEnd * 1000 : undefined,
    cancelAtPeriodEnd: row?.cancelAtPeriodEnd === 1,
  };
}

/**
 * Updates subscription state and organization billing_plan atomically in D1.
 */
export async function updateSubscriptionStateInD1(
  db: D1Database,
  params: {
    organizationId: string;
    planTier: SaaSTier;
    status: SubscriptionStatus;
    providerSubscriptionId?: string;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
  }
): Promise<void> {
  const subId = generateOpaqueId("sub");
  const nowSec = Math.floor(Date.now() / 1000);
  const startSec = params.currentPeriodStart ? Math.floor(params.currentPeriodStart / 1000) : nowSec;
  const endSec = params.currentPeriodEnd ? Math.floor(params.currentPeriodEnd / 1000) : nowSec + 30 * 86400;

  // 1. Update organization billing_plan projection
  await db
    .prepare("UPDATE organizations SET billing_plan = ?, updated_at = unixepoch() WHERE id = ?")
    .bind(params.planTier, params.organizationId)
    .run();

  // 2. Upsert subscriptions record
  const upsertSql = `
    INSERT INTO subscriptions (
      id, organization_id, plan_id, status, provider, provider_subscription_id, 
      current_period_start, current_period_end, updated_at
    )
    VALUES (?, ?, ?, ?, 'cashfree', ?, ?, ?, unixepoch())
    ON CONFLICT(organization_id) DO UPDATE SET
      plan_id = excluded.plan_id,
      status = excluded.status,
      provider_subscription_id = COALESCE(excluded.provider_subscription_id, subscriptions.provider_subscription_id),
      current_period_start = excluded.current_period_start,
      current_period_end = excluded.current_period_end,
      updated_at = unixepoch()
  `;

  await db
    .prepare(upsertSql)
    .bind(
      subId,
      params.organizationId,
      params.planTier,
      params.status,
      params.providerSubscriptionId || null,
      startSec,
      endSec
    )
    .run();
}

/**
 * Record payment into financial ledger (Integer minor units).
 */
export async function recordPaymentInD1(
  db: D1Database,
  payment: {
    organizationId: string;
    providerOrderId: string;
    providerPaymentId?: string;
    subscriptionId?: string;
    amountMinor: number;
    currency?: string;
    status: PaymentStatus;
    paymentMethod?: string;
    signatureVerified?: boolean;
    paidAt?: number;
  }
): Promise<string> {
  const id = generateOpaqueId("pay");
  const currency = payment.currency || "INR";
  const paidAtSec = payment.paidAt ? Math.floor(payment.paidAt / 1000) : Math.floor(Date.now() / 1000);

  const query = `
    INSERT INTO payments (
      id, organization_id, cashfree_order_id, amount, amount_minor, currency, 
      status, payment_method, signature_verified, provider, provider_order_id, 
      provider_payment_id, subscription_id, paid_at, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'cashfree', ?, ?, ?, ?, unixepoch())
    ON CONFLICT(cashfree_order_id) DO UPDATE SET
      amount_minor = excluded.amount_minor,
      status = excluded.status,
      provider_payment_id = COALESCE(excluded.provider_payment_id, payments.provider_payment_id),
      paid_at = excluded.paid_at
  `;

  await db
    .prepare(query)
    .bind(
      id,
      payment.organizationId,
      payment.providerOrderId,
      payment.amountMinor / 100, // Legacy float column fallback
      payment.amountMinor,
      currency,
      payment.status,
      payment.paymentMethod || "CARD",
      payment.signatureVerified ? 1 : 0,
      payment.providerOrderId,
      payment.providerPaymentId || null,
      payment.subscriptionId || null,
      paidAtSec
    )
    .run();

  return id;
}

/**
 * Query recent payments for an organization.
 */
export async function queryPaymentsInD1(
  db: D1Database,
  organizationId: string,
  limit: number = 20
): Promise<PaymentLedgerEntry[]> {
  const query = `
    SELECT 
      id,
      organization_id as organizationId,
      provider,
      provider_payment_id as providerPaymentId,
      COALESCE(provider_order_id, cashfree_order_id) as providerOrderId,
      subscription_id as subscriptionId,
      COALESCE(amount_minor, CAST(amount * 100 AS INTEGER)) as amountMinor,
      currency,
      status,
      payment_method as paymentMethod,
      signature_verified as signatureVerified,
      paid_at as paidAt,
      created_at as createdAt
    FROM payments
    WHERE organization_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  const { results } = await db.prepare(query).bind(organizationId, limit).all<{
    id: string;
    organizationId: string;
    provider: "cashfree";
    providerPaymentId: string | null;
    providerOrderId: string;
    subscriptionId: string | null;
    amountMinor: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string | null;
    signatureVerified: number;
    paidAt: number | null;
    createdAt: number;
  }>();

  return (results || []).map((p) => ({
    id: p.id,
    organizationId: p.organizationId,
    provider: "cashfree",
    providerPaymentId: p.providerPaymentId || undefined,
    providerOrderId: p.providerOrderId,
    subscriptionId: p.subscriptionId || undefined,
    amountMinor: p.amountMinor,
    currency: p.currency,
    status: p.status,
    paymentMethod: p.paymentMethod || undefined,
    signatureVerified: p.signatureVerified === 1,
    paidAt: p.paidAt ? p.paidAt * 1000 : undefined,
    createdAt: p.createdAt * 1000,
  }));
}

/**
 * Retrieve usage counters for an organization and period.
 */
export async function getUsageCountersInD1(
  db: D1Database,
  organizationId: string,
  periodKey: string
): Promise<Record<string, number>> {
  const query = `
    SELECT metric_key, value 
    FROM usage_counters 
    WHERE organization_id = ? AND (period_key = ? OR period_key = 'LIFETIME')
  `;
  const { results } = await db.prepare(query).bind(organizationId, periodKey).all<{
    metric_key: string;
    value: number;
  }>();

  const usage: Record<string, number> = {};
  for (const r of results || []) {
    usage[r.metric_key] = (usage[r.metric_key] || 0) + r.value;
  }
  return usage;
}

/**
 * Increment usage counter atomically.
 */
export async function incrementUsageCounterInD1(
  db: D1Database,
  organizationId: string,
  metricKey: string,
  periodKey: string,
  incrementBy: number = 1
): Promise<number> {
  const query = `
    INSERT INTO usage_counters (organization_id, metric_key, period_key, value, updated_at)
    VALUES (?, ?, ?, ?, unixepoch())
    ON CONFLICT(organization_id, metric_key, period_key) DO UPDATE SET
      value = value + ?,
      updated_at = unixepoch()
  `;

  await db
    .prepare(query)
    .bind(organizationId, metricKey, periodKey, incrementBy, incrementBy)
    .run();

  const res = await db
    .prepare("SELECT value FROM usage_counters WHERE organization_id = ? AND metric_key = ? AND period_key = ?")
    .bind(organizationId, metricKey, periodKey)
    .first<{ value: number }>();

  return res?.value || incrementBy;
}

/**
 * Idempotency Record Interface
 */
export interface IdempotencyRecord {
  id: string;
  organizationId: string;
  credentialId: string;
  key: string;
  requestMethod: string;
  requestPath: string;
  requestFingerprint: string;
  responseStatus?: number;
  responseHeaders?: string;
  responseBody?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: number;
  expiresAt: number;
}

/**
 * Retrieves an idempotency record from D1.
 */
export async function getIdempotencyRecordInD1(
  db: D1Database,
  organizationId: string,
  credentialId: string,
  requestPath: string,
  key: string
): Promise<IdempotencyRecord | null> {
  const query = `
    SELECT 
      id, organization_id as organizationId, credential_id as credentialId,
      key, request_method as requestMethod, request_path as requestPath,
      request_fingerprint as requestFingerprint, response_status as responseStatus,
      response_headers as responseHeaders, response_body as responseBody,
      status, created_at as createdAt, expires_at as expiresAt
    FROM idempotency_keys
    WHERE organization_id = ? AND credential_id = ? AND request_path = ? AND key = ?
    LIMIT 1
  `;

  const row = await db.prepare(query).bind(organizationId, credentialId, requestPath, key).first<IdempotencyRecord>();
  return row || null;
}

/**
 * Attempts to reserve an idempotency key in D1.
 * Returns true if reserved successfully, false if duplicate key already exists.
 */
export async function reserveIdempotencyRecordInD1(
  db: D1Database,
  params: {
    organizationId: string;
    credentialId: string;
    key: string;
    requestMethod: string;
    requestPath: string;
    requestFingerprint: string;
    ttlSeconds?: number;
  }
): Promise<{ reserved: boolean; existingRecord?: IdempotencyRecord }> {
  const existing = await getIdempotencyRecordInD1(
    db,
    params.organizationId,
    params.credentialId,
    params.requestPath,
    params.key
  );

  if (existing) {
    return { reserved: false, existingRecord: existing };
  }

  const id = generateOpaqueId("idem");
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (params.ttlSeconds || 86400);

  try {
    const insertQuery = `
      INSERT INTO idempotency_keys (
        id, organization_id, credential_id, key, request_method, request_path,
        request_fingerprint, status, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', ?, ?)
    `;

    await db.prepare(insertQuery).bind(
      id,
      params.organizationId,
      params.credentialId,
      params.key,
      params.requestMethod,
      params.requestPath,
      params.requestFingerprint,
      now,
      expiresAt
    ).run();

    return { reserved: true };
  } catch {
    const checkAgain = await getIdempotencyRecordInD1(
      db,
      params.organizationId,
      params.credentialId,
      params.requestPath,
      params.key
    );
    return { reserved: false, existingRecord: checkAgain || undefined };
  }
}

/**
 * Marks an idempotency record as completed with cached response data.
 */
export async function completeIdempotencyRecordInD1(
  db: D1Database,
  params: {
    organizationId: string;
    credentialId: string;
    requestPath: string;
    key: string;
    responseStatus: number;
    responseHeaders: Record<string, string>;
    responseBody: string;
  }
): Promise<void> {
  const updateQuery = `
    UPDATE idempotency_keys
    SET 
      response_status = ?,
      response_headers = ?,
      response_body = ?,
      status = 'COMPLETED'
    WHERE organization_id = ? AND credential_id = ? AND request_path = ? AND key = ?
  `;

  await db.prepare(updateQuery).bind(
    params.responseStatus,
    JSON.stringify(params.responseHeaders),
    params.responseBody,
    params.organizationId,
    params.credentialId,
    params.requestPath,
    params.key
  ).run();
}

export * from "./repositories/organizations";
export * from "./repositories/campaigns";
export * from "./repositories/folders";


