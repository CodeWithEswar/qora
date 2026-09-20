/**
 * NXTQR — Supabase Guardian Repository
 * Authoritative PostgreSQL repository for destination monitoring,
 * health observations, incident transitions, and automated fallback policies.
 */

import { createAdminClient } from "../admin";
import {
  GuardianMonitorSummaryV1,
  GuardianObservationSummary,
  GuardianIncidentDetailV1,
  GuardianPulseMetricsV1,
  GuardianHealthState,
  GuardianIncidentStatus,
  GuardianFallbackReadiness,
  CreateGuardianMonitorRequestV1,
  UpdateGuardianMonitorRequestV1,
  ConfigureFallbackRequestV1,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@nxtqr/contracts";
import {
  validateGuardianTargetUrl,
  isFallbackCircular,
  evaluateGuardianStateTransition,
  executeOutboundHealthProbe,
} from "@/lib/domains/guardian";
import { INTERNAL_EVENT_TYPES } from "@nxtqr/contracts";

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

export const SupabaseGuardianRepository = {
  /**
   * Lists all destination monitors belonging to an organization with real health & observation history.
   */
  async listMonitorsByOrg(
    orgId: string,
    filters?: { health?: string; search?: string }
  ): Promise<{ items: GuardianMonitorSummaryV1[]; total: number }> {
    const supabase = await getClient();

    let query = (supabase as any)
      .from("guardian_monitors")
      .select(
        `
        id,
        organization_id,
        qr_id,
        destination_url,
        name,
        status,
        current_health,
        last_checked_at,
        last_state_changed_at,
        check_interval_sec,
        timeout_ms,
        failure_threshold,
        recovery_threshold,
        consecutive_failures,
        consecutive_successes,
        created_at,
        updated_at,
        qr_codes ( id, name, slug )
      `,
        { count: "exact" }
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (filters?.health && filters.health !== "all") {
      query = query.eq("current_health", filters.health.toUpperCase());
    }

    const { data: monitorsData, count, error } = await query;
    if (error) {
      console.error("[SupabaseGuardianRepository.listMonitorsByOrg] Error:", error);
      throw new Error(`Failed to list monitors: ${error.message}`);
    }

    if (!monitorsData || monitorsData.length === 0) {
      return { items: [], total: 0 };
    }

    const monitorIds = monitorsData.map((m: any) => m.id);
    const qrIds = monitorsData.map((m: any) => m.qr_id).filter(Boolean);

    // Fetch fallback policies and recent observations in parallel
    const [fallbacksRes, observationsRes, activeIncidentsRes] = await Promise.all([
      (supabase as any)
        .from("fallback_policies")
        .select("id, qr_id, monitor_id, backup_url, auto_switch, failure_threshold, notify_emails")
        .eq("organization_id", orgId),
      (supabase as any)
        .from("guardian_observations")
        .select("id, monitor_id, observed_at, result, http_status, duration_ms, tls_valid, failure_reason, checked_url")
        .in("monitor_id", monitorIds)
        .order("observed_at", { ascending: false })
        .limit(200),
      (supabase as any)
        .from("guardian_incidents")
        .select("id, monitor_id, qr_id, status")
        .eq("organization_id", orgId)
        .neq("status", "RESOLVED"),
    ]);

    const fallbackMap = new Map<string, any>();
    (fallbacksRes.data || []).forEach((fb: any) => {
      if (fb.monitor_id) fallbackMap.set(fb.monitor_id, fb);
      if (fb.qr_id) fallbackMap.set(fb.qr_id, fb);
    });

    const activeIncidentsMap = new Map<string, string>();
    (activeIncidentsRes.data || []).forEach((inc: any) => {
      if (inc.monitor_id) activeIncidentsMap.set(inc.monitor_id, inc.id);
      if (inc.qr_id) activeIncidentsMap.set(inc.qr_id, inc.id);
    });

    const obsByMonitor = new Map<string, GuardianObservationSummary[]>();
    (observationsRes.data || []).forEach((obs: any) => {
      const list = obsByMonitor.get(obs.monitor_id) || [];
      if (list.length < 7) {
        // Keep up to 7 most recent
        list.push({
          id: obs.id,
          monitorId: obs.monitor_id,
          observedAt: obs.observed_at,
          result: obs.result,
          httpStatus: obs.http_status,
          durationMs: obs.duration_ms,
          tlsValid: obs.tls_valid ?? true,
          failureReason: obs.failure_reason,
          checkedUrl: obs.checked_url,
        });
        obsByMonitor.set(obs.monitor_id, list);
      }
    });

    // Format summaries
    let items: GuardianMonitorSummaryV1[] = monitorsData.map((m: any) => {
      const fb = fallbackMap.get(m.id) || (m.qr_id ? fallbackMap.get(m.qr_id) : null);
      let readiness: GuardianFallbackReadiness = "NOT_CONFIGURED";
      if (fb?.backup_url) {
        readiness = isFallbackCircular(m.destination_url, fb.backup_url) ? "INVALID" : "READY";
      }

      return {
        id: m.id,
        organizationId: m.organization_id,
        qrId: m.qr_id,
        qrName: m.qr_codes?.name || null,
        qrSlug: m.qr_codes?.slug || null,
        destinationUrl: m.destination_url || "",
        name: m.name || m.qr_codes?.name || "Monitored Destination",
        status: m.status as any,
        currentHealth: (m.current_health as any) || "UNKNOWN",
        lastCheckedAt: m.last_checked_at,
        lastStateChangedAt: m.last_state_changed_at,
        checkIntervalSec: m.check_interval_sec || 300,
        timeoutMs: m.timeout_ms || 5000,
        failureThreshold: m.failure_threshold || 3,
        recoveryThreshold: m.recovery_threshold || 2,
        consecutiveFailures: m.consecutive_failures || 0,
        consecutiveSuccesses: m.consecutive_successes || 0,
        fallbackConfig: fb
          ? {
              backupUrl: fb.backup_url,
              autoSwitch: fb.auto_switch ?? true,
              failureThreshold: fb.failure_threshold || 3,
              notifyEmails: Array.isArray(fb.notify_emails) ? fb.notify_emails : [],
              readiness,
            }
          : null,
        activeIncidentId: activeIncidentsMap.get(m.id) || (m.qr_id ? activeIncidentsMap.get(m.qr_id) : null) || null,
        recentObservations: obsByMonitor.get(m.id) || [],
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      };
    });

    // Client-side search filtering on real data
    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.destinationUrl.toLowerCase().includes(q) ||
          (item.qrName && item.qrName.toLowerCase().includes(q)) ||
          (item.qrSlug && item.qrSlug.toLowerCase().includes(q))
      );
    }

    return { items, total: count || items.length };
  },

  /**
   * Retrieves a single monitor by ID with organization verification.
   */
  async getMonitorById(orgId: string, monitorId: string): Promise<GuardianMonitorSummaryV1 | null> {
    const { items } = await this.listMonitorsByOrg(orgId);
    return items.find((m) => m.id === monitorId) || null;
  },

  /**
   * Pulse metrics for the organization. Real aggregation with zero fake stats.
   */
  async getPulseMetrics(orgId: string): Promise<GuardianPulseMetricsV1> {
    const supabase = await getClient();

    const [monitorsRes, incidentsRes] = await Promise.all([
      (supabase as any)
        .from("guardian_monitors")
        .select("id, current_health, status, last_checked_at")
        .eq("organization_id", orgId),
      (supabase as any)
        .from("guardian_incidents")
        .select("id")
        .eq("organization_id", orgId)
        .neq("status", "RESOLVED"),
    ]);

    const monitors = monitorsRes.data || [];
    const openIncidents = incidentsRes.data || [];

    let healthyCount = 0;
    let degradedCount = 0;
    let unavailableCount = 0;
    let pausedCount = 0;
    let latestCheck: string | null = null;

    monitors.forEach((m: any) => {
      if (m.status === "PAUSED") {
        pausedCount++;
      } else {
        if (m.current_health === "HEALTHY") healthyCount++;
        else if (m.current_health === "DEGRADED") degradedCount++;
        else if (m.current_health === "UNAVAILABLE" || m.current_health === "DOWN") unavailableCount++;
      }

      if (m.last_checked_at) {
        if (!latestCheck || new Date(m.last_checked_at) > new Date(latestCheck)) {
          latestCheck = m.last_checked_at;
        }
      }
    });

    return {
      monitoredCount: monitors.length,
      healthyCount,
      degradedCount,
      unavailableCount,
      pausedCount,
      openIncidentsCount: openIncidents.length,
      lastSignalPublishedAt: latestCheck,
    };
  },

  /**
   * Creates a new destination monitor for an organization.
   */
  async createMonitor(
    orgId: string,
    actorId: string | null,
    payload: CreateGuardianMonitorRequestV1
  ): Promise<GuardianMonitorSummaryV1> {
    const supabase = await getClient();

    // 1. SSRF validation on destination URL
    const validatedUrl = validateGuardianTargetUrl(payload.destinationUrl);

    // 2. Resolve actor profile
    const profileId = await resolveValidProfileId(supabase, actorId);

    // 3. Fallback circular check if fallback URL provided
    if (payload.fallbackUrl) {
      validateGuardianTargetUrl(payload.fallbackUrl);
      if (isFallbackCircular(validatedUrl, payload.fallbackUrl)) {
        throw new ValidationError("Fallback URL cannot be identical or circular to the primary destination.");
      }
    }

    const { data: monitor, error } = await (supabase as any)
      .from("guardian_monitors")
      .insert({
        organization_id: orgId,
        qr_id: payload.qrId || null,
        destination_url: validatedUrl,
        checked_url: validatedUrl,
        response_time_ms: 0,
        name: payload.name.trim(),
        status: "ACTIVE",
        current_health: "UNKNOWN",
        check_interval_sec: payload.checkIntervalSec || 300,
        timeout_ms: payload.timeoutMs || 5000,
        failure_threshold: payload.failureThreshold || 3,
        recovery_threshold: payload.recoveryThreshold || 2,
        created_by: profileId,
      })
      .select()
      .single();

    if (error || !monitor) {
      console.error("[SupabaseGuardianRepository.createMonitor] Error:", error);
      throw new Error(`Failed to create monitor: ${error?.message}`);
    }

    // Create fallback policy if fallbackUrl provided
    if (payload.fallbackUrl) {
      await (supabase as any)
        .from("fallback_policies")
        .insert({
          organization_id: orgId,
          qr_id: payload.qrId || null,
          monitor_id: monitor.id,
          backup_url: payload.fallbackUrl.trim(),
          auto_switch: payload.autoSwitch ?? true,
          failure_threshold: payload.failureThreshold || 3,
          notify_emails: [],
        });
    }

    const created = await this.getMonitorById(orgId, monitor.id);
    if (!created) throw new Error("Monitor was created but could not be retrieved");
    return created;
  },

  /**
   * Updates an existing monitor's configuration or pause/active state.
   */
  async updateMonitor(
    orgId: string,
    monitorId: string,
    payload: UpdateGuardianMonitorRequestV1
  ): Promise<GuardianMonitorSummaryV1> {
    const supabase = await getClient();

    const existing = await this.getMonitorById(orgId, monitorId);
    if (!existing) throw new NotFoundError("Guardian monitor not found");

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.status !== undefined) {
      updates.status = payload.status;
      if (payload.status === "PAUSED") {
        updates.current_health = "PAUSED";
      } else if (existing.status === "PAUSED") {
        updates.current_health = "UNKNOWN";
      }
    }
    if (payload.checkIntervalSec !== undefined) updates.check_interval_sec = payload.checkIntervalSec;
    if (payload.timeoutMs !== undefined) updates.timeout_ms = payload.timeoutMs;
    if (payload.failureThreshold !== undefined) updates.failure_threshold = payload.failureThreshold;
    if (payload.recoveryThreshold !== undefined) updates.recovery_threshold = payload.recoveryThreshold;

    const { error } = await (supabase as any)
      .from("guardian_monitors")
      .update(updates)
      .eq("id", monitorId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to update monitor: ${error.message}`);
    }

    if (payload.fallbackUrl !== undefined) {
      if (payload.fallbackUrl.trim()) {
        validateGuardianTargetUrl(payload.fallbackUrl);
        if (isFallbackCircular(existing.destinationUrl, payload.fallbackUrl)) {
          throw new ValidationError("Fallback URL cannot be identical or circular to primary destination");
        }

        const { data: existingFb } = await (supabase as any)
          .from("fallback_policies")
          .select("id")
          .eq("monitor_id", monitorId)
          .maybeSingle();

        if (existingFb) {
          await (supabase as any)
            .from("fallback_policies")
            .update({
              backup_url: payload.fallbackUrl.trim(),
              auto_switch: payload.autoSwitch ?? true,
              failure_threshold: payload.failureThreshold || existing.failureThreshold || 3,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingFb.id);
        } else {
          await (supabase as any)
            .from("fallback_policies")
            .insert({
              organization_id: orgId,
              qr_id: existing.qrId || null,
              monitor_id: monitorId,
              backup_url: payload.fallbackUrl.trim(),
              auto_switch: payload.autoSwitch ?? true,
              failure_threshold: payload.failureThreshold || existing.failureThreshold || 3,
              notify_emails: [],
            });
        }
      } else {
        // Clear fallback
        await (supabase as any)
          .from("fallback_policies")
          .delete()
          .eq("monitor_id", monitorId);
      }
    }

    const updated = await this.getMonitorById(orgId, monitorId);
    if (!updated) throw new Error("Monitor could not be retrieved after update");
    return updated;
  },

  /**
   * Cascade-safe deletion of a monitor. NEVER deletes QR codes or campaigns.
   */
  async deleteMonitor(orgId: string, monitorId: string): Promise<void> {
    const supabase = await getClient();

    // 1. Delete observations
    await (supabase as any)
      .from("guardian_observations")
      .delete()
      .eq("monitor_id", monitorId)
      .eq("organization_id", orgId);

    // 2. Unlink or resolve incidents
    await (supabase as any)
      .from("guardian_incidents")
      .delete()
      .eq("monitor_id", monitorId)
      .eq("organization_id", orgId);

    // 3. Delete monitor
    const { error } = await (supabase as any)
      .from("guardian_monitors")
      .delete()
      .eq("id", monitorId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to delete monitor: ${error.message}`);
    }
  },

  /**
   * Records a probe observation, evaluates health policy transitions, and manages incidents.
   */
  async recordObservation(
    orgId: string,
    monitorId: string,
    observation: {
      result: any;
      httpStatus?: number;
      durationMs: number;
      tlsValid: boolean;
      failureReason?: string;
      checkedUrl: string;
    }
  ): Promise<{
    observationId: string;
    nextHealth: GuardianHealthState;
    incidentOpened: boolean;
    incidentResolved: boolean;
  }> {
    const supabase = await getClient();

    const monitor = await this.getMonitorById(orgId, monitorId);
    if (!monitor) throw new NotFoundError("Monitor not found");

    // 1. Insert observation record
    const { data: obsRecord, error: obsErr } = await (supabase as any)
      .from("guardian_observations")
      .insert({
        organization_id: orgId,
        monitor_id: monitorId,
        qr_id: monitor.qrId || null,
        result: observation.result,
        http_status: observation.httpStatus || null,
        duration_ms: observation.durationMs,
        tls_valid: observation.tlsValid,
        failure_reason: observation.failureReason || null,
        checked_url: observation.checkedUrl,
      })
      .select()
      .single();

    if (obsErr) {
      console.error("[recordObservation] Failed to insert observation:", obsErr);
    }

    const isSuccess = observation.result === "HEALTHY";
    const consecutiveFailures = isSuccess ? 0 : monitor.consecutiveFailures + 1;
    const consecutiveSuccesses = isSuccess ? monitor.consecutiveSuccesses + 1 : 0;

    // 2. Evaluate state transitions
    const transition = evaluateGuardianStateTransition({
      currentHealth: monitor.currentHealth,
      consecutiveFailures,
      consecutiveSuccesses,
      failureThreshold: monitor.failureThreshold,
      recoveryThreshold: monitor.recoveryThreshold,
      lastObservationResult: observation.result,
    });

    const updates: Record<string, any> = {
      consecutive_failures: consecutiveFailures,
      consecutive_successes: consecutiveSuccesses,
      current_health: transition.nextHealth,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (transition.nextHealth !== monitor.currentHealth) {
      updates.last_state_changed_at = new Date().toISOString();
    }

    // 3. Update monitor record
    await (supabase as any)
      .from("guardian_monitors")
      .update(updates)
      .eq("id", monitorId)
      .eq("organization_id", orgId);

    let incidentOpened = false;
    let incidentResolved = false;

    // 4. Handle incident creation on qualifying failure
    if (transition.shouldOpenIncident && monitor.qrId) {
      const timeline = [
        {
          timestamp: new Date().toISOString(),
          type: "OBSERVATION_FAILED",
          title: "Observation Failed",
          description: observation.failureReason || `Destination returned error ${observation.result}`,
        },
        {
          timestamp: new Date().toISOString(),
          type: "THRESHOLD_REACHED",
          title: `Failure Threshold Reached (${monitor.failureThreshold}/${monitor.failureThreshold})`,
          description: "Consecutive qualifying checks failed.",
        },
        {
          timestamp: new Date().toISOString(),
          type: "INCIDENT_OPENED",
          title: "Incident Opened",
          description: "Destination classified as UNAVAILABLE; safe fallback activated.",
        },
      ];

      const { data: incident } = await (supabase as any)
        .from("guardian_incidents")
        .insert({
          organization_id: orgId,
          monitor_id: monitorId,
          qr_id: monitor.qrId,
          status: "OPEN",
          started_at: new Date().toISOString(),
          failure_reason: observation.failureReason || "Destination unavailable",
          triggering_observation_id: obsRecord?.id || null,
          fallback_triggered: monitor.fallbackConfig?.readiness === "READY",
          timeline_events_json: timeline,
        })
        .select()
        .single();

      incidentOpened = true;

      // Log domain event
      if (monitor.qrId) {
        await (supabase as any).from("activity_events").insert({
          organization_id: orgId,
          event_type: INTERNAL_EVENT_TYPES.QR_LINK_UNHEALTHY,
          resource_type: "qr",
          resource_id: monitor.qrId,
          metadata_json: {
            monitorId,
            incidentId: incident?.id,
            destinationUrl: monitor.destinationUrl,
            reason: observation.failureReason,
          },
        }).catch(() => {});
      }
    }

    // 5. Handle incident resolution on qualifying recovery
    if (transition.shouldResolveIncident && monitor.activeIncidentId) {
      await (supabase as any)
        .from("guardian_incidents")
        .update({
          status: "RESOLVED",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", monitor.activeIncidentId)
        .eq("organization_id", orgId);

      incidentResolved = true;

      if (monitor.qrId) {
        await (supabase as any).from("activity_events").insert({
          organization_id: orgId,
          event_type: INTERNAL_EVENT_TYPES.QR_LINK_RECOVERED,
          resource_type: "qr",
          resource_id: monitor.qrId,
          metadata_json: {
            monitorId,
            incidentId: monitor.activeIncidentId,
            destinationUrl: monitor.destinationUrl,
          },
        }).catch(() => {});
      }
    }

    return {
      observationId: obsRecord?.id || "",
      nextHealth: transition.nextHealth,
      incidentOpened,
      incidentResolved,
    };
  },

  /**
   * Triggers an immediate server-side probe of a monitored destination.
   */
  async runManualCheck(orgId: string, monitorId: string): Promise<{
    observation: any;
    nextHealth: GuardianHealthState;
  }> {
    const monitor = await this.getMonitorById(orgId, monitorId);
    if (!monitor) throw new NotFoundError("Monitor not found");

    // Execute secure bounded probe
    const probeResult = await executeOutboundHealthProbe(
      monitor.destinationUrl,
      monitor.timeoutMs || 5000
    );

    // Record observation and state transitions
    const { nextHealth } = await this.recordObservation(orgId, monitorId, {
      ...probeResult,
      checkedUrl: monitor.destinationUrl,
    });

    return {
      observation: probeResult,
      nextHealth,
    };
  },

  /**
   * Lists incidents for the organization.
   */
  async listIncidentsByOrg(
    orgId: string,
    status?: string
  ): Promise<GuardianIncidentDetailV1[]> {
    const supabase = await getClient();

    let query = (supabase as any)
      .from("guardian_incidents")
      .select(
        `
        id,
        organization_id,
        monitor_id,
        qr_id,
        status,
        started_at,
        resolved_at,
        failure_reason,
        fallback_triggered,
        timeline_events_json,
        qr_codes ( id, name, slug ),
        guardian_monitors ( id, destination_url, current_health )
      `
      )
      .eq("organization_id", orgId)
      .order("started_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status.toUpperCase());
    }

    const { data, error } = await query;
    if (error) {
      console.error("[listIncidentsByOrg] Error:", error);
      return [];
    }

    return (data || []).map((inc: any) => ({
      id: inc.id,
      organizationId: inc.organization_id,
      monitorId: inc.monitor_id,
      qrId: inc.qr_id,
      qrName: inc.qr_codes?.name || "Target QR",
      destinationUrl: inc.guardian_monitors?.destination_url || "Destination",
      status: inc.status as any,
      startedAt: inc.started_at,
      resolvedAt: inc.resolved_at,
      failureReason: inc.failure_reason,
      fallbackTriggered: inc.fallback_triggered ?? false,
      currentHealth: inc.guardian_monitors?.current_health || "UNAVAILABLE",
      timelineEvents: Array.isArray(inc.timeline_events_json) ? inc.timeline_events_json : [],
    }));
  },

  /**
   * Configures a fallback destination policy with cycle detection.
   */
  async configureFallback(
    orgId: string,
    monitorId: string,
    payload: ConfigureFallbackRequestV1
  ): Promise<void> {
    const supabase = await getClient();

    const monitor = await this.getMonitorById(orgId, monitorId);
    if (!monitor) throw new NotFoundError("Monitor not found");

    const validatedBackupUrl = validateGuardianTargetUrl(payload.backupUrl);
    if (isFallbackCircular(monitor.destinationUrl, validatedBackupUrl)) {
      throw new ValidationError("Fallback URL cannot be identical or circular to primary destination");
    }

    const { data: existingFb } = await (supabase as any)
      .from("fallback_policies")
      .select("id")
      .eq("monitor_id", monitorId)
      .maybeSingle();

    if (existingFb) {
      const { error } = await (supabase as any)
        .from("fallback_policies")
        .update({
          backup_url: validatedBackupUrl,
          auto_switch: payload.autoSwitch ?? true,
          failure_threshold: payload.failureThreshold ?? 3,
          notify_emails: payload.notifyEmails || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingFb.id);

      if (error) {
        throw new Error(`Failed to update fallback policy: ${error.message}`);
      }
    } else {
      const { error } = await (supabase as any)
        .from("fallback_policies")
        .insert({
          organization_id: orgId,
          monitor_id: monitorId,
          qr_id: monitor.qrId || null,
          backup_url: validatedBackupUrl,
          auto_switch: payload.autoSwitch ?? true,
          failure_threshold: payload.failureThreshold ?? 3,
          notify_emails: payload.notifyEmails || [],
        });

      if (error) {
        throw new Error(`Failed to configure fallback: ${error.message}`);
      }
    }
  },
};
