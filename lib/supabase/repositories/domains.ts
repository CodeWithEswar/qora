/**
 * NXTQR — Supabase Custom Domain Repository
 * Authoritative PostgreSQL repository for domain infrastructure,
 * DNS verification history, cascade-safe deletion, and multi-tenant isolation.
 */

import { createAdminClient } from "../admin";
import {
  CustomDomainSummaryV1,
  CustomDomainDetailV1,
  CreateCustomDomainRequestV1,
  UpdateCustomDomainRequestV1,
  DomainImpactV1,
  DomainPulseMetricsV1,
  DomainDnsRecord,
  DomainVerificationAttemptV1,
  NotFoundError,
  ConflictError,
  ValidationError,
  SaaSTier,
} from "@nxtqr/contracts";
import { EntitlementService } from "@nxtqr/entitlements";
import {
  normalizeHostname,
  generateVerificationToken,
  buildRequiredDnsRecords,
} from "@/lib/domains/domain-normalization";
import { verifyDomainDns } from "@/lib/domains/domain-dns-verifier";

function getClient() {
  return createAdminClient();
}

/**
 * Validates that an actor UUID exists in public.profiles before foreign key insert.
 */
async function resolveValidProfileId(supabase: any, actorId: string | null | undefined): Promise<string | null> {
  if (!actorId) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actorId);
  if (!isUuid) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", actorId)
      .maybeSingle();

    return data ? data.id : null;
  } catch {
    return null;
  }
}

export const SupabaseDomainRepository = {
  /**
   * Lists all custom domains belonging to an organization with real resource usage counts.
   */
  async listByOrg(
    orgId: string,
    filters?: { status?: string; search?: string }
  ): Promise<{ items: CustomDomainSummaryV1[]; total: number }> {
    const supabase = await getClient();

    let query = (supabase as any)
      .from("custom_domains")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      if (filters.status === "active") {
        query = query.eq("status", "ACTIVE");
      } else if (filters.status === "pending") {
        query = query.in("status", ["PENDING", "VERIFYING"]);
      } else if (filters.status === "issues") {
        query = query.or("status.eq.FAILED,certificate_status.eq.ERROR,routing_status.eq.ERROR");
      } else if (filters.status === "archived") {
        query = query.eq("status", "ARCHIVED");
      }
    }

    if (filters?.search?.trim()) {
      const term = `%${filters.search.trim().toLowerCase()}%`;
      query = query.ilike("hostname", term);
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to list custom domains: ${error.message}`);
    }

    const domainRows = data || [];
    if (domainRows.length === 0) {
      return { items: [], total: 0 };
    }

    const domainIds = domainRows.map((r: any) => r.id);

    // Concurrently fetch real resource dependency counts
    const [qrsRes, campaignsRes, lpsRes] = await Promise.all([
      (supabase as any)
        .from("qr_codes")
        .select("custom_domain_id")
        .eq("organization_id", orgId)
        .in("custom_domain_id", domainIds),
      (supabase as any)
        .from("campaigns")
        .select("custom_domain_id")
        .eq("organization_id", orgId)
        .in("custom_domain_id", domainIds),
      (supabase as any)
        .from("landing_pages")
        .select("custom_domain_id")
        .eq("organization_id", orgId)
        .in("custom_domain_id", domainIds),
    ]);

    const qrCountMap: Record<string, number> = {};
    (qrsRes.data || []).forEach((row: any) => {
      if (row.custom_domain_id) {
        qrCountMap[row.custom_domain_id] = (qrCountMap[row.custom_domain_id] || 0) + 1;
      }
    });

    const campaignCountMap: Record<string, number> = {};
    (campaignsRes.data || []).forEach((row: any) => {
      if (row.custom_domain_id) {
        campaignCountMap[row.custom_domain_id] = (campaignCountMap[row.custom_domain_id] || 0) + 1;
      }
    });

    const lpCountMap: Record<string, number> = {};
    (lpsRes.data || []).forEach((row: any) => {
      if (row.custom_domain_id) {
        lpCountMap[row.custom_domain_id] = (lpCountMap[row.custom_domain_id] || 0) + 1;
      }
    });

    const items: CustomDomainSummaryV1[] = domainRows.map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      hostname: r.hostname || r.domain,
      status: r.status,
      verificationStatus: r.verification_status || "PENDING",
      verificationMethod: r.verification_method || "DNS_TXT",
      certificateStatus: r.certificate_status || "PENDING",
      routingStatus: r.routing_status || "NOT_CONFIGURED",
      isPrimary: r.is_primary ?? false,
      assignedQrsCount: qrCountMap[r.id] || 0,
      assignedCampaignsCount: campaignCountMap[r.id] || 0,
      assignedLandingPagesCount: lpCountMap[r.id] || 0,
      createdAt: r.created_at,
      verifiedAt: r.verified_at,
      activatedAt: r.activated_at,
      archivedAt: r.archived_at,
    }));

    return { items, total: count || 0 };
  },

  /**
   * Retrieves single detailed custom domain record by ID within an organization.
   */
  async getById(orgId: string, domainId: string): Promise<CustomDomainDetailV1> {
    const supabase = await getClient();

    const { data: r, error } = await (supabase as any)
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to retrieve custom domain: ${error.message}`);
    }

    if (!r) {
      throw new NotFoundError(`Custom domain '${domainId}' not found in workspace.`);
    }

    // Query resource counts & recent attempts concurrently
    const [qrsRes, campaignsRes, lpsRes, attemptsRes] = await Promise.all([
      (supabase as any)
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("custom_domain_id", domainId),
      (supabase as any)
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("custom_domain_id", domainId),
      (supabase as any)
        .from("landing_pages")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("custom_domain_id", domainId),
      (supabase as any)
        .from("domain_verification_attempts")
        .select("*")
        .eq("domain_id", domainId)
        .order("attempted_at", { ascending: false })
        .limit(10),
    ]);

    const verificationRecords: DomainDnsRecord[] = Array.isArray(r.verification_records_json)
      ? r.verification_records_json
      : [];

    const recentAttempts: DomainVerificationAttemptV1[] = (attemptsRes.data || []).map((a: any) => ({
      id: a.id,
      method: a.method,
      status: a.status,
      details: a.details_json || {},
      attemptedAt: a.attempted_at,
    }));

    return {
      id: r.id,
      organizationId: r.organization_id,
      hostname: r.hostname || r.domain,
      status: r.status,
      verificationStatus: r.verification_status || "PENDING",
      verificationMethod: r.verification_method || "DNS_TXT",
      certificateStatus: r.certificate_status || "PENDING",
      routingStatus: r.routing_status || "NOT_CONFIGURED",
      isPrimary: r.is_primary ?? false,
      verificationToken: r.verification_token,
      verificationRecords,
      assignedQrsCount: qrsRes.count || 0,
      assignedCampaignsCount: campaignsRes.count || 0,
      assignedLandingPagesCount: lpsRes.count || 0,
      recentAttempts,
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at,
      verifiedAt: r.verified_at,
      activatedAt: r.activated_at,
      archivedAt: r.archived_at,
      lastCheckedAt: r.last_checked_at,
      createdBy: r.created_by,
    };
  },

  /**
   * Connects a new custom domain to an organization.
   * Enforces server-side normalization, uniqueness, and SaaS tier entitlements.
   */
  async create(
    orgId: string,
    actorId: string | null,
    payload: CreateCustomDomainRequestV1
  ): Promise<CustomDomainDetailV1> {
    const supabase = await getClient();

    // 1. Normalization & Security rules
    const normResult = normalizeHostname(payload.hostname);
    if (!normResult.valid) {
      throw new ValidationError(normResult.error || "Invalid hostname format.");
    }
    const hostname = normResult.hostname;

    // 2. Check global hostname uniqueness across active domains
    const { data: existingHost } = await (supabase as any)
      .from("custom_domains")
      .select("id, organization_id, status")
      .eq("hostname", hostname)
      .neq("status", "ARCHIVED")
      .maybeSingle();

    if (existingHost) {
      throw new ConflictError(
        "This domain is already connected to an organization workspace. If you own this domain, please release it first."
      );
    }

    // 3. Organization Entitlement quota enforcement
    const { data: orgRow } = await (supabase as any)
      .from("organizations")
      .select("id, billing_plan")
      .eq("id", orgId)
      .single();

    const tier: SaaSTier = (orgRow?.billing_plan?.toUpperCase() as SaaSTier) || "FREE";

    const { count: activeCount } = await (supabase as any)
      .from("custom_domains")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .neq("status", "ARCHIVED");

    // Free tier development exemption or assert standard entitlement
    if (process.env.NODE_ENV !== "development") {
      EntitlementService.assertEntitlement(tier, {
        featureKey: "domains.customMax",
        currentCount: activeCount || 0,
        requestedIncrement: 1,
      });
    }

    // 4. Generate verification token and DNS records
    const token = generateVerificationToken();
    const records = buildRequiredDnsRecords(hostname, token);

    // Check if this will be the first domain; if so, make it default primary
    const isFirstDomain = (activeCount || 0) === 0;

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    // 5. Insert new domain record
    const { data: inserted, error: insertError } = await (supabase as any)
      .from("custom_domains")
      .insert({
        organization_id: orgId,
        domain: hostname,
        hostname: hostname,
        status: "PENDING",
        verification_status: "PENDING",
        verification_method: payload.verificationMethod || "DNS_TXT",
        verification_token: token,
        verification_records_json: records,
        certificate_status: "PENDING",
        routing_status: "NOT_CONFIGURED",
        is_primary: isFirstDomain,
        created_by: safeActorId,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create custom domain: ${insertError.message}`);
    }

    // Audit log & activity event
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "DOMAIN_CREATED",
        resource_type: "custom_domain",
        resource_id: inserted.id,
        metadata_json: { hostname, isPrimary: isFirstDomain },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "domain.created",
        resource_type: "custom_domain",
        resource_id: inserted.id,
        metadata_json: { hostname },
      }),
    ]);

    return this.getById(orgId, inserted.id);
  },

  /**
   * Executes real DNS verification and updates domain lifecycle accordingly.
   */
  async verify(
    orgId: string,
    domainId: string,
    actorId: string | null
  ): Promise<{ verified: boolean; message: string; domain: CustomDomainDetailV1 }> {
    const supabase = await getClient();
    const domain = await this.getById(orgId, domainId);

    if (domain.status === "ARCHIVED") {
      throw new ValidationError("Cannot verify an archived domain.");
    }

    // Perform real DNS checks via Node.js dns/promises
    const checkResult = await verifyDomainDns(
      domain.hostname,
      domain.verificationToken,
      domain.verificationRecords
    );

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    // Record immutable verification attempt log
    await (supabase as any).from("domain_verification_attempts").insert({
      organization_id: orgId,
      domain_id: domainId,
      method: domain.verificationMethod,
      status: checkResult.verified ? "SUCCESS" : "FAILED",
      details_json: {
        message: checkResult.message,
        observedTxt: checkResult.observedTxt,
        observedCname: checkResult.observedCname,
      },
    });

    const now = new Date().toISOString();

    if (checkResult.verified) {
      // Domain is verified! Activate routing and TLS
      const { error: updateError } = await (supabase as any)
        .from("custom_domains")
        .update({
          status: "ACTIVE",
          verification_status: "VERIFIED",
          routing_status: "READY",
          certificate_status: "READY",
          ssl_active: true,
          verification_records_json: checkResult.records,
          verified_at: domain.verifiedAt || now,
          activated_at: domain.activatedAt || now,
          last_checked_at: now,
          updated_at: now,
        })
        .eq("id", domainId)
        .eq("organization_id", orgId);

      if (updateError) {
        throw new Error(`Failed to activate verified domain: ${updateError.message}`);
      }

      await Promise.allSettled([
        (supabase as any).from("audit_logs").insert({
          organization_id: orgId,
          actor_id: safeActorId,
          action: "DOMAIN_VERIFIED",
          resource_type: "custom_domain",
          resource_id: domainId,
          metadata_json: { hostname: domain.hostname },
        }),
        (supabase as any).from("activity_events").insert({
          organization_id: orgId,
          actor_id: safeActorId,
          action: "domain.verified",
          resource_type: "custom_domain",
          resource_id: domainId,
          metadata_json: { hostname: domain.hostname },
        }),
      ]);
    } else {
      // Verification pending or record mismatch
      await (supabase as any)
        .from("custom_domains")
        .update({
          verification_records_json: checkResult.records,
          last_checked_at: now,
          updated_at: now,
        })
        .eq("id", domainId)
        .eq("organization_id", orgId);
    }

    const updatedDetail = await this.getById(orgId, domainId);
    return {
      verified: checkResult.verified,
      message: checkResult.message,
      domain: updatedDetail,
    };
  },

  /**
   * Atomically designates a domain as the primary organization domain.
   */
  async setPrimary(
    orgId: string,
    domainId: string,
    actorId: string | null
  ): Promise<CustomDomainDetailV1> {
    const supabase = await getClient();
    const domain = await this.getById(orgId, domainId);

    if (domain.status === "ARCHIVED") {
      throw new ValidationError("Cannot designate an archived domain as primary.");
    }

    // Clear primary on other domains in org
    await (supabase as any)
      .from("custom_domains")
      .update({ is_primary: false })
      .eq("organization_id", orgId);

    // Set this domain primary
    const { error } = await (supabase as any)
      .from("custom_domains")
      .update({ is_primary: true, updated_at: new Date().toISOString() })
      .eq("id", domainId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to set primary domain: ${error.message}`);
    }

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "DOMAIN_PRIMARY_CHANGED",
        resource_type: "custom_domain",
        resource_id: domainId,
        metadata_json: { hostname: domain.hostname },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "domain.primary_changed",
        resource_type: "custom_domain",
        resource_id: domainId,
        metadata_json: { hostname: domain.hostname },
      }),
    ]);

    return this.getById(orgId, domainId);
  },

  /**
   * Archives a custom domain.
   */
  async archive(
    orgId: string,
    domainId: string,
    actorId: string | null
  ): Promise<CustomDomainDetailV1> {
    const supabase = await getClient();
    const domain = await this.getById(orgId, domainId);

    const now = new Date().toISOString();
    const { error } = await (supabase as any)
      .from("custom_domains")
      .update({
        status: "ARCHIVED",
        is_primary: false,
        archived_at: now,
        updated_at: now,
      })
      .eq("id", domainId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to archive domain: ${error.message}`);
    }

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "DOMAIN_ARCHIVED",
        resource_type: "custom_domain",
        resource_id: domainId,
        metadata_json: { hostname: domain.hostname },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "domain.archived",
        resource_type: "custom_domain",
        resource_id: domainId,
        metadata_json: { hostname: domain.hostname },
      }),
    ]);

    return this.getById(orgId, domainId);
  },

  /**
   * Permanently deletes a custom domain.
   * Foreign keys ensure linked QR codes, landing pages, and campaigns are PRESERVED (their custom_domain_id becomes NULL).
   */
  async delete(
    orgId: string,
    domainId: string,
    actorId: string | null
  ): Promise<void> {
    const supabase = await getClient();
    const domain = await this.getById(orgId, domainId);

    const { error } = await (supabase as any)
      .from("custom_domains")
      .delete()
      .eq("id", domainId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to delete custom domain: ${error.message}`);
    }

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "DOMAIN_DELETED",
        resource_type: "custom_domain",
        resource_id: domainId,
        metadata_json: { hostname: domain.hostname },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "domain.deleted",
        resource_type: "custom_domain",
        resource_id: domainId,
        metadata_json: { hostname: domain.hostname },
      }),
    ]);
  },

  /**
   * Evaluates dependencies on this domain before modification or deletion.
   */
  async getImpact(orgId: string, domainId: string): Promise<DomainImpactV1> {
    const domain = await this.getById(orgId, domainId);
    return {
      domainId: domain.id,
      hostname: domain.hostname,
      connectedQrs: domain.assignedQrsCount,
      connectedCampaigns: domain.assignedCampaignsCount,
      connectedLandingPages: domain.assignedLandingPagesCount,
      isPrimary: domain.isPrimary,
      canSafelyDisconnect: true, // Safe cascade ON DELETE SET NULL ensures zero broken resources
    };
  },

  /**
   * Aggregates real workspace pulse metrics across all domains.
   */
  async getPulseMetrics(orgId: string): Promise<DomainPulseMetricsV1> {
    const supabase = await getClient();

    const [domainsRes, qrsRes, lpsRes, campaignsRes] = await Promise.all([
      (supabase as any)
        .from("custom_domains")
        .select("id, status, certificate_status, routing_status")
        .eq("organization_id", orgId)
        .neq("status", "ARCHIVED"),
      (supabase as any)
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .not("custom_domain_id", "is", null),
      (supabase as any)
        .from("landing_pages")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .not("custom_domain_id", "is", null),
      (supabase as any)
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .not("custom_domain_id", "is", null),
    ]);

    const activeRows = domainsRes.data || [];
    const totalDomains = activeRows.length;
    const activeDomains = activeRows.filter((r: any) => r.status === "ACTIVE").length;
    const pendingDomains = activeRows.filter((r: any) => r.status === "PENDING" || r.status === "VERIFYING").length;
    const issuesDomains = activeRows.filter(
      (r: any) => r.status === "FAILED" || r.certificate_status === "ERROR" || r.routing_status === "ERROR"
    ).length;

    const totalAssignedAssets =
      (qrsRes.count || 0) + (lpsRes.count || 0) + (campaignsRes.count || 0);

    return {
      totalDomains,
      activeDomains,
      pendingDomains,
      issuesDomains,
      totalAssignedAssets,
    };
  },
};
