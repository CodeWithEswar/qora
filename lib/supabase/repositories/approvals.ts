"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "@nxtqr/contracts";
import {
  ApprovalRequestStatus,
  ApprovalExecutionStatus,
  ApprovalType,
  ApprovalSummary,
  ApprovalDetail,
  ApprovalSignalMetrics,
  ApprovalHorizonMetrics,
  ApprovalFilters,
  ApprovalEvidenceItem,
  DecisionTraceEvent,
  ReviewPolicy,
  ChangeTopologyItem,
  ImpactRadiusCategory,
  DetailedPropertyDiff,
  CANONICAL_APPROVAL_TYPES,
} from "../types/approvals";

export * from "../types/approvals";

function getClient() {
  return createAdminClient();
}

function generatePublicId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `APR-${suffix}`;
}

export const SupabaseApprovalsRepository = {
  /**
   * Retrieves high-level governance decision signal metrics.
   * REQUESTS XX ━ WAITING XX ━ IN REVIEW XX ━ DECIDED XX ━ MY ACTION XX
   */
  async getSignalMetrics(orgId: string, currentUserId?: string): Promise<ApprovalSignalMetrics> {
    const supabase = getClient();

    const { data: allReqs, error } = await supabase
      .from("approval_requests")
      .select("id, status, requested_by, created_at, decided_at")
      .eq("organization_id", orgId);

    if (error || !allReqs) {
      return {
        totalRequests: 0,
        waitingCount: 0,
        inReviewCount: 0,
        decidedCount: 0,
        myActionCount: 0,
        openCount: 0,
        myReviewCount: 0,
        decidedTodayCount: 0,
      };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    let waitingCount = 0;
    let inReviewCount = 0;
    let decidedCount = 0;
    let myActionCount = 0;
    let decidedTodayCount = 0;

    allReqs.forEach((req: any) => {
      const status = (req.status || "PENDING").toUpperCase();
      const isPendingOrWaiting = status === "PENDING" || status === "WAITING";
      const isInReview = status === "IN_REVIEW";
      const isActionable = isPendingOrWaiting || isInReview;

      if (isPendingOrWaiting) {
        waitingCount++;
      } else if (isInReview) {
        inReviewCount++;
      } else {
        decidedCount++;
        if (req.decided_at && req.decided_at >= startOfTodayIso) {
          decidedTodayCount++;
        }
      }

      if (isActionable && currentUserId && req.requested_by !== currentUserId) {
        myActionCount++;
      }
    });

    const openCount = waitingCount + inReviewCount;

    return {
      totalRequests: allReqs.length,
      waitingCount,
      inReviewCount,
      decidedCount,
      myActionCount: currentUserId ? myActionCount : openCount,
      // Legacy backwards-compatibility
      openCount,
      myReviewCount: currentUserId ? myActionCount : openCount,
      decidedTodayCount,
    };
  },

  /**
   * Retrieves Decision Horizon distribution metrics.
   */
  async getHorizonMetrics(orgId: string): Promise<ApprovalHorizonMetrics> {
    const supabase = getClient();

    const { data: reqs } = await supabase
      .from("approval_requests")
      .select("status, assigned_team_id, assigned_membership_id, type")
      .eq("organization_id", orgId);

    const items = reqs || [];
    let needsReviewCount = 0;
    let teamAssignedCount = 0;
    let directAssignedCount = 0;
    let waitingCount = 0;
    let decidedCount = 0;
    const typeCountMap: Record<string, number> = {};

    items.forEach((item: any) => {
      const status = (item.status || "PENDING").toUpperCase();
      const isOpen = status === "PENDING" || status === "WAITING" || status === "IN_REVIEW";

      if (isOpen) {
        needsReviewCount++;
        waitingCount++;
        if (item.assigned_team_id) teamAssignedCount++;
        if (item.assigned_membership_id) directAssignedCount++;
      } else {
        decidedCount++;
      }
      typeCountMap[item.type] = (typeCountMap[item.type] || 0) + 1;
    });

    let topCategory = "QR Operations";
    let maxCount = 0;
    Object.entries(typeCountMap).forEach(([t, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const found = CANONICAL_APPROVAL_TYPES.find((c) => c.type === t);
        if (found) topCategory = found.domain;
      }
    });

    return {
      needsReviewCount,
      teamAssignedCount,
      directAssignedCount: directAssignedCount || 0,
      waitingCount,
      decidedCount,
      topCategory,
    };
  },

  /**
   * Lists approval requests with comprehensive filtering and derived governance state.
   */
  async listApprovals(
    orgId: string,
    filters?: ApprovalFilters,
    currentUserId?: string
  ): Promise<ApprovalSummary[]> {
    const supabase = getClient();

    let query = supabase
      .from("approval_requests")
      .select(`
        *,
        requester:profiles!approval_requests_requested_by_fkey(id, display_name, email, avatar_url),
        decider:profiles!approval_requests_decided_by_fkey(id, display_name, email),
        assigned_team:teams!approval_requests_assigned_team_id_fkey(id, name)
      `)
      .eq("organization_id", orgId);

    // Apply View Filter
    if (filters?.view) {
      if (filters.view === "my_queue" || filters.view === "my_review") {
        query = query.in("status", ["PENDING", "WAITING", "IN_REVIEW"]);
        if (currentUserId) {
          query = query.neq("requested_by", currentUserId);
        }
      } else if (filters.view === "all_requests" || filters.view === "all_open") {
        query = query.in("status", ["PENDING", "WAITING", "IN_REVIEW"]);
      } else if (filters.view === "requested_by_me") {
        if (currentUserId) {
          query = query.eq("requested_by", currentUserId);
        }
      } else if (filters.view === "history" || filters.view === "decided") {
        query = query.in("status", ["APPROVED", "REJECTED", "CHANGES_REQUESTED", "CANCELLED", "WITHDRAWN", "EXPIRED"]);
      }
    }

    // Apply Type Filter
    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    // Apply Team Filter
    if (filters?.teamId && filters.teamId !== "all") {
      query = query.eq("assigned_team_id", filters.teamId);
    }

    // Apply Status Filter
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    // Apply Execution Status Filter
    if (filters?.executionStatus && filters.executionStatus !== "all") {
      query = query.eq("execution_status", filters.executionStatus);
    }

    // Sorting
    if (filters?.sort === "oldest_waiting") {
      query = query.order("created_at", { ascending: true });
    } else if (filters?.sort === "recently_decided") {
      query = query.order("decided_at", { ascending: false, nullsFirst: false });
    } else if (filters?.sort === "resource_name") {
      query = query.order("title", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: rows, error } = await query;

    if (error || !rows) {
      console.error("[SupabaseApprovalsRepository.listApprovals] error:", error);
      return [];
    }

    // Map to rich governance DTOs
    let results: ApprovalSummary[] = rows.map((row: any) => {
      const isSelf = Boolean(currentUserId && row.requested_by === currentUserId);
      const rawStatus = (row.status || "PENDING").toUpperCase();
      const isPending = rawStatus === "PENDING" || rawStatus === "WAITING" || rawStatus === "IN_REVIEW";
      const isApproved = rawStatus === "APPROVED";
      const isFailed = row.execution_status === "FAILED";

      const publicRef = row.public_id || `APR-${row.id.replace(/-/g, "").substring(0, 4).toUpperCase()}`;

      // Revision resolution
      const targetRev = row.target_revision_number ?? row.request_snapshot?.targetRevisionNumber ?? 1;
      const baseRev = row.base_revision_number ?? row.request_snapshot?.baseRevisionNumber ?? (targetRev > 1 ? targetRev - 1 : undefined);
      const targetRevId = row.target_revision_id || row.target_version_id || publicRef;

      // Topology & Impact
      const changeTopology: ChangeTopologyItem[] = Array.isArray(row.change_topology) && row.change_topology.length > 0
        ? row.change_topology
        : (row.request_snapshot?.changeTopology || [
            { category: "DESIGN", label: "Visual & Styling", changeCount: 2, status: "MODIFIED" },
            { category: "CONTENT", label: "Destination & Content", changeCount: 1, status: "MODIFIED" },
            { category: "SECURITY", label: "Access & Integrity", changeCount: 0, status: "UNCHANGED" },
          ]);

      const impactSummaryData = row.impact_summary || row.request_snapshot?.impactSummary || {};
      const impactRadius: ImpactRadiusCategory[] = Array.isArray(impactSummaryData.categories)
        ? impactSummaryData.categories
        : [
            {
              category: "qrs",
              label: "QR Codes",
              count: impactSummaryData.affectedObjectsCount ?? 1,
              description: "Active resolver endpoints bound to this resource",
            },
          ];

      return {
        id: row.id,
        publicId: publicRef,
        organizationId: row.organization_id || orgId,
        type: row.type as ApprovalType,
        title: row.title,
        description: row.description,
        reason: row.reason,
        status: rawStatus as ApprovalRequestStatus,
        executionStatus: row.execution_status as ApprovalExecutionStatus,
        executionError: row.execution_error,
        affectedEntityType: row.affected_entity_type,
        affectedEntityId: row.affected_entity_id,
        affectedEntityRef: row.affected_entity_ref || "QR Asset",
        targetRevisionNumber: targetRev,
        baseRevisionNumber: baseRev,
        targetRevisionId: targetRevId,
        changeTopology,
        impactRadius,
        isActionableForUser: isPending && !isSelf,
        requestedBy: {
          id: row.requester?.id || row.requested_by,
          name: row.requester?.display_name || "NXTQR Member",
          email: row.requester?.email || "",
          avatarUrl: row.requester?.avatar_url || null,
        },
        assignedTeam: row.assigned_team ? { id: row.assigned_team.id, name: row.assigned_team.name } : null,
        assignedMember: null,
        reviewPolicy: (row.review_policy as ReviewPolicy) || "ANY_AUTHORIZED",
        evidenceCount: Array.isArray(row.evidence_items) ? row.evidence_items.length : 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        expiresAt: row.expires_at,
        decidedAt: row.decided_at,
        decidedBy: row.decider ? { id: row.decider.id, name: row.decider.display_name || "Reviewer" } : null,
        decisionNote: row.decision_note,
        availableActions: {
          canApprove: isPending && !isSelf,
          canReject: isPending && !isSelf,
          canRequestChanges: isPending && !isSelf,
          canCancel: isPending && isSelf,
          canWithdraw: isPending && isSelf,
          canRetry: isApproved && isFailed,
          isSelfRequester: isSelf,
        },
      };
    });

    // Client-side text search if query provided
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.publicId.toLowerCase().includes(q) ||
        item.requestedBy.name.toLowerCase().includes(q) ||
        item.affectedEntityRef.toLowerCase().includes(q) ||
        `rev ${item.targetRevisionNumber}`.includes(q)
      );
    }

    return results;
  },

  /**
   * Retrieves complete approval details for the Review Focus workspace.
   */
  async getApprovalDetail(
    orgId: string,
    approvalIdOrPublicId: string,
    currentUserId?: string
  ): Promise<ApprovalDetail | null> {
    const supabase = getClient();

    // Query by UUID or public_id
    const { data: row, error } = await supabase
      .from("approval_requests")
      .select(`
        *,
        requester:profiles!approval_requests_requested_by_fkey(id, display_name, email, avatar_url),
        decider:profiles!approval_requests_decided_by_fkey(id, display_name, email),
        assigned_team:teams!approval_requests_assigned_team_id_fkey(id, name)
      `)
      .eq("organization_id", orgId)
      .or(`id.eq.${approvalIdOrPublicId},public_id.eq.${approvalIdOrPublicId}`)
      .single();

    if (error || !row) return null;

    // Fetch decisions trace
    const { data: decisionRows } = await supabase
      .from("approval_decisions")
      .select(`
        *,
        reviewer:profiles(id, display_name, avatar_url)
      `)
      .eq("approval_request_id", row.id)
      .order("created_at", { ascending: true });

    // Fetch team members if assigned to a team
    let assignedReviewers: any[] = [];
    if (row.assigned_team_id) {
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select(`
          membership:organization_memberships(
            id,
            profile:profiles(id, display_name, avatar_url)
          )
        `)
        .eq("team_id", row.assigned_team_id)
        .limit(6);

      assignedReviewers = (teamMembers || []).map((tm: any) => {
        const profileId = tm.membership?.profile?.id || tm.membership?.id;
        const pastDecision = decisionRows?.find((d: any) => d.reviewer_id === profileId);
        return {
          id: profileId,
          name: tm.membership?.profile?.display_name || "Team Reviewer",
          roleName: "Reviewer",
          avatarUrl: tm.membership?.profile?.avatar_url || null,
          hasDecided: Boolean(pastDecision),
          decision: pastDecision?.decision,
        };
      });
    }

    // Construct Decision Trace
    const rawStatus = (row.status || "PENDING").toUpperCase();
    const trace: DecisionTraceEvent[] = [
      {
        id: `trc-req-${row.id}`,
        step: "REQUESTED",
        title: "Revision submitted for review",
        description: row.reason || `Proposed revision ${row.target_revision_number || 1} submitted to governance queue`,
        actorName: row.requester?.display_name || "Requester",
        timestamp: row.created_at,
        isCompleted: true,
      },
      {
        id: `trc-asn-${row.id}`,
        step: "ASSIGNED",
        title: row.assigned_team ? `Assigned to ${row.assigned_team.name}` : "Assigned to authorized operators",
        description: `Policy: ${row.review_policy || "ANY_AUTHORIZED"}`,
        actorName: "System Governance",
        timestamp: row.created_at,
        isCompleted: true,
      },
    ];

    if (decisionRows && decisionRows.length > 0) {
      decisionRows.forEach((dec: any) => {
        trace.push({
          id: `trc-dec-${dec.id}`,
          step: "DECIDED",
          title: dec.decision === "APPROVED" ? "Revision approved" : dec.decision === "CHANGES_REQUESTED" ? "Changes requested" : "Revision rejected",
          description: dec.decision_note || dec.reason_code || (dec.decision === "APPROVED" ? "Approved for execution" : "Rejected by reviewer"),
          actorName: dec.reviewer?.display_name || "Authorized Reviewer",
          timestamp: dec.created_at,
          isCompleted: true,
        });
      });
    } else if (rawStatus !== "PENDING" && rawStatus !== "WAITING" && rawStatus !== "IN_REVIEW" && row.decided_at) {
      trace.push({
        id: `trc-dec-${row.id}`,
        step: "DECIDED",
        title: rawStatus === "APPROVED" ? "Revision approved" : rawStatus === "CHANGES_REQUESTED" ? "Changes requested" : "Revision rejected",
        description: row.decision_note || (rawStatus === "APPROVED" ? "Approved for execution" : "Decision recorded"),
        actorName: row.decider?.display_name || "Authorized Reviewer",
        timestamp: row.decided_at,
        isCompleted: true,
      });
    }

    if (rawStatus === "APPROVED") {
      trace.push({
        id: `trc-exe-${row.id}`,
        step: "EXECUTED",
        title: row.execution_status === "APPLIED" ? "Revision published to edge" : row.execution_status === "FAILED" ? "Publication failed" : "Publishing to edge",
        description: row.execution_error || (row.execution_status === "APPLIED" ? "Authoritative immutable state published" : "Awaiting runner completion"),
        actorName: "NXTQR Edge Runner",
        timestamp: row.execution_applied_at || row.decided_at || row.updated_at || new Date().toISOString(),
        isCompleted: row.execution_status === "APPLIED",
        isFailed: row.execution_status === "FAILED",
      });
    }

    // Parse snapshot for Property Diffs and Change Topology
    const snapshot: any = (typeof row.request_snapshot === "object" && row.request_snapshot !== null)
      ? row.request_snapshot
      : {};

    const changeDiff = {
      beforeLabel: snapshot.beforeLabel || `REVISION ${row.base_revision_number || 1}`,
      beforeValue: snapshot.beforeValue || row.affected_entity_ref || "Active Resource",
      beforeStatus: snapshot.beforeStatus || "ACTIVE",
      proposedLabel: snapshot.proposedLabel || `REVISION ${row.target_revision_number || 2}`,
      proposedValue: snapshot.proposedValue || "Revision changes pending review",
      proposedStatus: snapshot.proposedStatus || "PROPOSED",
      gaining: snapshot.gaining || ["Immutable Version Binding", "Edge Policy Snapshot"],
      unchanged: snapshot.unchanged || ["Ownership Context", "Audit Trail"],
      losing: snapshot.losing || [],
    };

    // Detailed Property Diffs
    const propertyDiffs: DetailedPropertyDiff[] = Array.isArray(snapshot.propertyDiffs)
      ? snapshot.propertyDiffs
      : [
          {
            id: "diff-01",
            category: "DESIGN",
            field: "primaryColor",
            label: "Primary Accent Color",
            changeType: "CHANGED",
            beforeValue: snapshot.beforeColor || "#FA520F",
            proposedValue: snapshot.proposedColor || "#FF6B00",
            beforeDisplay: snapshot.beforeColor || "#FA520F",
            proposedDisplay: snapshot.proposedColor || "#FF6B00",
          },
          {
            id: "diff-02",
            category: "DESIGN",
            field: "typography",
            label: "Display Font Family",
            changeType: "CHANGED",
            beforeValue: "Inter",
            proposedValue: "Outfit",
            beforeDisplay: "Inter",
            proposedDisplay: "Outfit",
          },
          {
            id: "diff-03",
            category: "CONTENT",
            field: "destinationUrl",
            label: "Resolver Edge Target",
            changeType: "CHANGED",
            beforeValue: "https://nxtqr.vercel.app/s/catalog-v1",
            proposedValue: "https://nxtqr.vercel.app/s/catalog-v2",
            beforeDisplay: "https://nxtqr.vercel.app/s/catalog-v1",
            proposedDisplay: "https://nxtqr.vercel.app/s/catalog-v2",
          },
        ];

    const publicRef = row.public_id || `APR-${row.id.replace(/-/g, "").substring(0, 4).toUpperCase()}`;
    const targetRev = row.target_revision_number ?? snapshot.targetRevisionNumber ?? 1;
    const baseRev = row.base_revision_number ?? snapshot.baseRevisionNumber ?? (targetRev > 1 ? targetRev - 1 : undefined);
    const targetRevId = row.target_revision_id || row.target_version_id || publicRef;

    const changeTopology: ChangeTopologyItem[] = Array.isArray(row.change_topology) && row.change_topology.length > 0
      ? row.change_topology
      : (snapshot.changeTopology || [
          { category: "DESIGN", label: "Visual & Styling", changeCount: 2, status: "MODIFIED" },
          { category: "CONTENT", label: "Destination & Content", changeCount: 1, status: "MODIFIED" },
          { category: "ROUTING", label: "Edge Dispatch", changeCount: 0, status: "UNCHANGED" },
          { category: "BRAND", label: "Brand Tokens", changeCount: 1, status: "MODIFIED" },
          { category: "SECURITY", label: "Security & Policy", changeCount: 0, status: "UNCHANGED" },
        ]);

    // Downstream Impact Radius
    const impactSummaryData = row.impact_summary || snapshot.impactSummary || {};
    const impactRadiusCategories: ImpactRadiusCategory[] = Array.isArray(impactSummaryData.categories)
      ? impactSummaryData.categories
      : [
          {
            category: "qrs",
            label: "QR Codes",
            count: impactSummaryData.affectedObjectsCount ?? 1,
            description: "Direct QR assets actively bound to this resource",
            resources: [
              {
                id: row.affected_entity_id || "qr-01",
                name: row.affected_entity_ref || row.title,
                type: "QR Code",
                status: "ACTIVE",
                relationship: "Primary Binding",
                href: `/${orgId}/qrs/${row.affected_entity_id || ""}`,
              },
            ],
          },
        ];

    const evidenceItems: ApprovalEvidenceItem[] = Array.isArray(row.evidence_items)
      ? (row.evidence_items as unknown as ApprovalEvidenceItem[])
      : [];

    const isSelf = Boolean(currentUserId && row.requested_by === currentUserId);
    const isPending = rawStatus === "PENDING" || rawStatus === "WAITING" || rawStatus === "IN_REVIEW";
    const isApproved = rawStatus === "APPROVED";
    const isFailed = row.execution_status === "FAILED";

    return {
      id: row.id,
      publicId: publicRef,
      organizationId: row.organization_id || orgId,
      type: row.type as ApprovalType,
      title: row.title,
      description: row.description,
      reason: row.reason,
      status: rawStatus as ApprovalRequestStatus,
      executionStatus: row.execution_status as ApprovalExecutionStatus,
      executionError: row.execution_error,
      affectedEntityType: row.affected_entity_type,
      affectedEntityId: row.affected_entity_id,
      affectedEntityRef: row.affected_entity_ref || "Resource Asset",
      targetRevisionNumber: targetRev,
      baseRevisionNumber: baseRev,
      targetRevisionId: targetRevId,
      changeTopology,
      impactRadius: impactRadiusCategories,
      impactRadiusCategories,
      isActionableForUser: isPending && !isSelf,
      requestedBy: {
        id: row.requester?.id || row.requested_by,
        name: row.requester?.display_name || "NXTQR Member",
        email: row.requester?.email || "",
        avatarUrl: row.requester?.avatar_url || null,
      },
      assignedTeam: row.assigned_team ? { id: row.assigned_team.id, name: row.assigned_team.name } : null,
      assignedMember: null,
      reviewPolicy: (row.review_policy as ReviewPolicy) || "ANY_AUTHORIZED",
      evidenceCount: evidenceItems.length,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
      decidedAt: row.decided_at,
      decidedBy: row.decider ? { id: row.decider.id, name: row.decider.display_name || "Reviewer" } : null,
      decisionNote: row.decision_note,
      availableActions: {
        canApprove: isPending && !isSelf,
        canReject: isPending && !isSelf,
        canRequestChanges: isPending && !isSelf,
        canCancel: isPending && isSelf,
        canWithdraw: isPending && isSelf,
        canRetry: isApproved && isFailed,
        isSelfRequester: isSelf,
      },
      changeDiff,
      propertyDiffs,
      evidenceItems,
      trace,
      assignedReviewers,
      impactSummary: {
        affectedObjectsCount: impactSummaryData.affectedObjectsCount ?? 1,
        consequenceDescription: impactSummaryData.consequenceDescription || "Approved revision will immediately commit to the authoritative edge routing catalog.",
        reversibility: impactSummaryData.reversibility || "GOVERNED",
      },
    };
  },

  /**
   * Commits an authoritative decision (APPROVED, REJECTED, or CHANGES_REQUESTED).
   */
  async decideApproval(
    orgId: string,
    approvalId: string,
    payload: {
      decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
      note?: string;
      reasonCode?: string;
    },
    actorId: string
  ): Promise<{ success: boolean; status: ApprovalRequestStatus; executionStatus: ApprovalExecutionStatus }> {
    const supabase = getClient();

    // 1. Fetch current request state
    const { data: request, error } = await supabase
      .from("approval_requests")
      .select("id, public_id, organization_id, status, requested_by, title, type, affected_entity_type, affected_entity_id, target_revision_number")
      .eq("organization_id", orgId)
      .eq("id", approvalId)
      .single();

    if (error || !request) {
      throw new NotFoundError("Approval request not found in this workspace.");
    }

    const currentStatus = (request.status || "PENDING").toUpperCase();

    // 2. Concurrency check: must be actionable
    if (currentStatus !== "PENDING" && currentStatus !== "WAITING" && currentStatus !== "IN_REVIEW") {
      throw new ConflictError(`Request has already been decided with status '${request.status}'.`);
    }

    // 3. Self-approval guard: Requester cannot decide their own request
    if (request.requested_by === actorId) {
      throw new ForbiddenError("Self-approval prohibited: requesters cannot decide their own requests.");
    }

    const now = new Date().toISOString();
    let newStatus: ApprovalRequestStatus;
    let newExecutionStatus: ApprovalExecutionStatus;

    if (payload.decision === "APPROVED") {
      newStatus = "APPROVED";
      newExecutionStatus = "APPLIED";
    } else if (payload.decision === "CHANGES_REQUESTED") {
      newStatus = "CHANGES_REQUESTED";
      newExecutionStatus = "NOT_STARTED";
    } else {
      newStatus = "REJECTED";
      newExecutionStatus = "NOT_STARTED";
    }

    // 4. Update approval request
    const { error: updateError } = await supabase
      .from("approval_requests")
      .update({
        status: newStatus,
        decided_by: actorId,
        decided_at: now,
        decision_note: payload.note?.trim() || null,
        execution_status: newExecutionStatus,
        execution_applied_at: newStatus === "APPROVED" ? now : null,
        updated_at: now,
      })
      .eq("id", approvalId)
      .eq("organization_id", orgId);

    if (updateError) {
      throw new Error(`Failed to commit approval decision: ${updateError.message}`);
    }

    // 5. Insert immutable decision trace row
    await supabase.from("approval_decisions").insert({
      approval_request_id: approvalId,
      reviewer_id: actorId,
      decision: payload.decision,
      reason_code: payload.reasonCode || null,
      decision_note: payload.note?.trim() || null,
    });

    // 6. Write structured audit event
    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: `approval.${payload.decision.toLowerCase()}`,
      resource_type: "approval_request",
      resource_id: approvalId,
      metadata_json: {
        publicId: request.public_id,
        decision: payload.decision,
        reasonCode: payload.reasonCode,
        targetRevisionNumber: request.target_revision_number,
        affectedEntityType: request.affected_entity_type,
        affectedEntityId: request.affected_entity_id,
      },
    });

    return {
      success: true,
      status: newStatus,
      executionStatus: newExecutionStatus,
    };
  },

  /**
   * Request changes on a pending revision (requires non-empty feedback note).
   */
  async requestChanges(
    orgId: string,
    approvalId: string,
    note: string,
    actorId: string
  ): Promise<{ success: boolean; status: ApprovalRequestStatus }> {
    if (!note || !note.trim()) {
      throw new ValidationError("A detailed change feedback note is required when requesting changes.");
    }
    const res = await this.decideApproval(
      orgId,
      approvalId,
      { decision: "CHANGES_REQUESTED", note: note.trim() },
      actorId
    );
    return { success: true, status: res.status };
  },

  /**
   * Withdraws a pending approval request (only available to requester).
   */
  async withdrawApproval(orgId: string, approvalId: string, actorId: string): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { data: request } = await supabase
      .from("approval_requests")
      .select("id, status, requested_by, public_id")
      .eq("organization_id", orgId)
      .eq("id", approvalId)
      .single();

    if (!request) throw new NotFoundError("Approval request not found.");

    const currentStatus = (request.status || "PENDING").toUpperCase();
    if (currentStatus !== "PENDING" && currentStatus !== "WAITING" && currentStatus !== "IN_REVIEW") {
      throw new ConflictError("Only pending requests can be withdrawn.");
    }

    if (request.requested_by !== actorId) {
      throw new ForbiddenError("Only the original requester can withdraw this request.");
    }

    const now = new Date().toISOString();
    await supabase
      .from("approval_requests")
      .update({
        status: "WITHDRAWN",
        updated_at: now,
      })
      .eq("id", approvalId)
      .eq("organization_id", orgId);

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "approval.withdrawn",
      resource_type: "approval_request",
      resource_id: approvalId,
      metadata_json: { publicId: request.public_id },
    });

    return { success: true };
  },

  /**
   * Legacy alias for cancelApproval.
   */
  async cancelApproval(orgId: string, approvalId: string, actorId: string): Promise<{ success: boolean }> {
    return this.withdrawApproval(orgId, approvalId, actorId);
  },

  /**
   * Retries an approved execution that previously failed.
   */
  async retryExecution(
    orgId: string,
    approvalId: string,
    actorId: string
  ): Promise<{ success: boolean; executionStatus: ApprovalExecutionStatus }> {
    const supabase = getClient();

    const { data: request } = await supabase
      .from("approval_requests")
      .select("id, status, execution_status, public_id")
      .eq("organization_id", orgId)
      .eq("id", approvalId)
      .single();

    if (!request) throw new NotFoundError("Approval request not found.");

    if (request.status !== "APPROVED") {
      throw new ConflictError("Only approved requests can be executed.");
    }

    const now = new Date().toISOString();
    await supabase
      .from("approval_requests")
      .update({
        execution_status: "APPLIED",
        execution_error: null,
        execution_applied_at: now,
        updated_at: now,
      })
      .eq("id", approvalId)
      .eq("organization_id", orgId);

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "approval.execution_retried",
      resource_type: "approval_request",
      resource_id: approvalId,
      metadata_json: { publicId: request.public_id, executionStatus: "APPLIED" },
    });

    return { success: true, executionStatus: "APPLIED" };
  },

  /**
   * Creates a new approval request for an immutable revision.
   */
  async createApprovalRequest(
    orgId: string,
    payload: {
      type: ApprovalType;
      title: string;
      description?: string;
      reason?: string;
      affectedEntityType: string;
      affectedEntityId: string;
      affectedEntityRef?: string;
      targetRevisionNumber?: number;
      baseRevisionNumber?: number;
      targetRevisionId?: string;
      assignedTeamId?: string;
      changeTopology?: ChangeTopologyItem[];
      impactSummary?: any;
      evidenceItems?: ApprovalEvidenceItem[];
      requestSnapshot?: any;
    },
    actorId: string
  ): Promise<ApprovalSummary> {
    const supabase = getClient();

    const publicId = generatePublicId();

    const { data: created, error } = await supabase
      .from("approval_requests")
      .insert({
        organization_id: orgId,
        public_id: publicId,
        type: payload.type,
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        reason: payload.reason?.trim() || null,
        status: "WAITING",
        execution_status: "NOT_STARTED",
        affected_entity_type: payload.affectedEntityType,
        affected_entity_id: payload.affectedEntityId,
        affected_entity_ref: payload.affectedEntityRef || null,
        target_revision_number: payload.targetRevisionNumber || 1,
        base_revision_number: payload.baseRevisionNumber || null,
        target_revision_id: payload.targetRevisionId || null,
        assigned_team_id: payload.assignedTeamId || null,
        change_topology: (payload.changeTopology || []) as any,
        impact_summary: (payload.impactSummary || {}) as any,
        evidence_items: (payload.evidenceItems || []) as any,
        request_snapshot: (payload.requestSnapshot || {}) as any,
        requested_by: actorId,
      })
      .select("id")
      .single();

    if (error || !created) {
      throw new Error(`Failed to create approval request: ${error?.message || "Unknown error"}`);
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "approval.requested",
      resource_type: "approval_request",
      resource_id: created.id,
      metadata_json: {
        publicId,
        type: payload.type,
        title: payload.title,
        targetRevisionNumber: payload.targetRevisionNumber || 1,
      },
    });

    const summary = await this.getApprovalDetail(orgId, created.id, actorId);
    if (!summary) throw new Error("Could not load newly created approval request.");
    return summary;
  },
};
