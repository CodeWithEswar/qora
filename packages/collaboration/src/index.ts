/**
 * @nxtqr/collaboration
 * Comments, mentions, immutable revision approval workflows,
 * version history, optimistic concurrency, and brand governance.
 */

import {
  ApprovalStatus,
  ApprovalStep,
  VersionDiffSummary,
  LockedTemplateRules,
  ClientPortalResourceGrant,
  ActivityActionCode,
} from "@nxtqr/contracts";

// 1. Comments
export function validateCommentContent(content: string): string {
  const clean = (content || "").trim();
  if (clean.length < 1 || clean.length > 5000) {
    throw new Error("Comment must be between 1 and 5,000 characters.");
  }
  return clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "");
}

export function parseMentions(content: string): string[] {
  const mentions: string[] = [];
  const simpleMatches = content.match(/@([a-zA-Z0-9_\-\.]+)/g);
  if (simpleMatches) {
    simpleMatches.forEach((m) => {
      const handle = m.substring(1).toLowerCase();
      if (!mentions.includes(handle)) {
        mentions.push(handle);
      }
    });
  }
  return mentions;
}

export function assertValidParentComment(
  parentComment: { id: string; organizationId: string; resourceId: string; parentId?: string | null } | null,
  currentOrgId: string,
  currentResourceId: string
): void {
  if (!parentComment) return;

  if (parentComment.organizationId !== currentOrgId) {
    throw new Error("Parent comment belongs to a different organization.");
  }
  if (parentComment.resourceId !== currentResourceId) {
    throw new Error("Parent comment belongs to a different resource.");
  }
  if (parentComment.parentId) {
    throw new Error("Nested replies are bounded to one level. Reply directly to the root comment.");
  }
}

// 2. Approvals
const VALID_APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
};

export function assertValidApprovalTransition(current: ApprovalStatus, target: ApprovalStatus): void {
  if (current === target) return;
  const allowed = VALID_APPROVAL_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new Error(`Cannot transition approval request from ${current} to ${target}.`);
  }
}

export function validateStepProgression(steps: ApprovalStep[], stepOrderToAct: number): void {
  const sorted = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  for (const step of sorted) {
    if (step.stepOrder < stepOrderToAct && step.status !== "APPROVED" && step.status !== "SKIPPED") {
      throw new Error(
        `Step ${stepOrderToAct} cannot be decided until Step ${step.stepOrder} is approved.`
      );
    }
  }
}

export function validateSelfApproval(
  requesterId: string,
  approverUserId: string,
  allowSelfApproval: boolean
): void {
  if (!allowSelfApproval && requesterId === approverUserId) {
    throw new Error("Self-approval is prohibited by organization security policy.");
  }
}

export function validateApprovalRevisionBinding(
  targetVersionId: string,
  currentVersionId: string
): boolean {
  return targetVersionId === currentVersionId;
}

export function validatePublicationEligibility(
  qr: { id: string; status: string; current_version_id?: string | null; published_version_id?: string | null },
  requiresApproval: boolean,
  latestApproval?: { status: ApprovalStatus; targetVersionId: string } | null
): { eligible: boolean; reason?: string } {
  if (!qr.current_version_id) {
    return { eligible: false, reason: "QR has no saved version to publish." };
  }

  if (!requiresApproval) {
    return { eligible: true };
  }

  if (!latestApproval) {
    return {
      eligible: false,
      reason: "This organization requires approval before publishing to live edge. Please request review.",
    };
  }

  if (latestApproval.status !== "APPROVED") {
    return {
      eligible: false,
      reason: `Approval request is currently ${latestApproval.status}. Live edge publication requires APPROVED status.`,
    };
  }

  if (latestApproval.targetVersionId !== qr.current_version_id) {
    return {
      eligible: false,
      reason: "Draft content has changed since approval was granted. New revision requires re-approval.",
    };
  }

  return { eligible: true };
}

// 3. Version History & Optimistic Concurrency
export function assertOptimisticConcurrency(
  currentVersion: number,
  expectedVersion?: number
): void {
  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new Error(
      `Concurrency conflict: Resource was modified by another collaborator (current version: ${currentVersion}, expected: ${expectedVersion}). Please refresh.`
    );
  }
}

export function computeVersionDiff(
  oldSnapshot: Record<string, unknown>,
  newSnapshot: Record<string, unknown>
): VersionDiffSummary {
  const changes: string[] = [];

  const oldDest = (oldSnapshot.default_url || oldSnapshot.defaultUrl) as string | undefined;
  const newDest = (newSnapshot.default_url || newSnapshot.defaultUrl) as string | undefined;
  const destinationChanged = Boolean(oldDest && newDest && oldDest !== newDest);

  if (destinationChanged) {
    changes.push(`Destination URL changed from '${oldDest}' to '${newDest}'`);
  }

  let stylingChanged = false;
  const styleKeys = ["pixel_style", "eye_style", "fg_color", "bg_color", "frame_style", "frame_text"];
  for (const k of styleKeys) {
    if (oldSnapshot[k] !== newSnapshot[k] && (oldSnapshot[k] !== undefined || newSnapshot[k] !== undefined)) {
      stylingChanged = true;
      changes.push(`Updated ${k.replace("_", " ")}`);
    }
  }

  return {
    fromVersion: Number(oldSnapshot.version_number || oldSnapshot.version || 1),
    toVersion: Number(newSnapshot.version_number || newSnapshot.version || 2),
    destinationChanged,
    oldDestination: oldDest,
    newDestination: newDest,
    stylingChanged,
    changes,
  };
}

// 4. Brand Governance (Locked Templates)
export function validateDesignAgainstLockedRules(
  design: {
    logo_url?: string | null;
    fg_color?: string;
    eye_style?: string;
    pixel_style?: string;
    frame_style?: string;
    frame_text?: string;
  },
  rules: LockedTemplateRules
): { valid: boolean; violations: string[] } {
  if (!rules.enforceRules) {
    return { valid: true, violations: [] };
  }

  const violations: string[] = [];

  if (rules.lockedLogoUrl && design.logo_url && design.logo_url !== rules.lockedLogoUrl) {
    violations.push("Corporate logo is locked by organization brand governance.");
  }
  if (rules.lockedPrimaryColor && design.fg_color && design.fg_color.toLowerCase() !== rules.lockedPrimaryColor.toLowerCase()) {
    violations.push(`Primary color is locked to '${rules.lockedPrimaryColor}'.`);
  }
  if (rules.lockedEyeStyle && design.eye_style && design.eye_style !== rules.lockedEyeStyle) {
    violations.push(`Finder eye style is locked to '${rules.lockedEyeStyle}'.`);
  }
  if (rules.lockedFrameStyle && design.frame_style && design.frame_style !== rules.lockedFrameStyle) {
    violations.push(`Frame style is locked to '${rules.lockedFrameStyle}'.`);
  }
  if (rules.lockedFrameText && design.frame_text && design.frame_text !== rules.lockedFrameText) {
    violations.push(`Frame call-to-action text is locked to '${rules.lockedFrameText}'.`);
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// 5. Client Portal
export function validatePortalAccess(
  portal: { id: string; status: string },
  resourceId: string,
  grants: ClientPortalResourceGrant[]
): { allowed: boolean; accessLevel?: "VIEW" | "DOWNLOAD"; reason?: string } {
  if (portal.status !== "ACTIVE") {
    return { allowed: false, reason: "Client portal is currently suspended or inactive." };
  }

  const grant = grants.find((g) => g.portalId === portal.id && g.resourceId === resourceId);
  if (!grant) {
    return { allowed: false, reason: "Resource is not granted to this client portal." };
  }

  return { allowed: true, accessLevel: grant.accessLevel };
}

// 6. Activity Headline
export function formatActivityHeadline(
  action: ActivityActionCode,
  actorName: string,
  resourceTitle?: string
): string {
  const target = resourceTitle ? `"${resourceTitle}"` : "a resource";

  switch (action) {
    case "QR_CREATED": return `${actorName} created dynamic QR ${target}.`;
    case "QR_UPDATED": return `${actorName} updated ${target}.`;
    case "QR_PUBLISHED": return `${actorName} published ${target} to live edge.`;
    case "COMMENT_ADDED": return `${actorName} commented on ${target}.`;
    case "COMMENT_RESOLVED": return `${actorName} resolved comments on ${target}.`;
    case "MEMBER_JOINED": return `${actorName} joined the workspace.`;
    case "MEMBER_INVITED": return `${actorName} invited a new collaborator.`;
    case "TEAM_CREATED": return `${actorName} created team ${target}.`;
    case "APPROVAL_REQUESTED": return `${actorName} submitted ${target} for review.`;
    case "APPROVAL_APPROVED": return `${actorName} approved ${target} for publication.`;
    case "APPROVAL_REJECTED": return `${actorName} requested changes on ${target}.`;
    case "REPORT_CREATED": return `${actorName} generated intelligence report ${target}.`;
    case "CAMPAIGN_UPDATED": return `${actorName} updated campaign ${target}.`;
    case "SHARE_LINK_CREATED": return `${actorName} created a secure share link for ${target}.`;
    default: return `${actorName} performed an update on ${target}.`;
  }
}
