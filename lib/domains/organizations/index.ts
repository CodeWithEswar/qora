/**
 * NXTQR — 02 Organizations Bounded Context
 * Responsibilities: Organizations (workspaces), memberships, teams, roles, permissions, invitations.
 * Invariants:
 * - Organization is the primary multi-tenant boundary.
 * - Server-side authorization is authoritative.
 * - Invitation acceptance is idempotent and validates expiry/token server-side.
 */

import { ForbiddenError, NotFoundError, ValidationError, InvalidStateTransitionError } from "../shared/errors";
import { PermissionCode, SYSTEM_ROLE_PERMISSIONS, SystemRoleName } from "@nxtqr/contracts";

export type MembershipStatus = "active" | "invited" | "suspended";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface OrganizationEntity {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  billingPlan: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrganizationMemberEntity {
  id: string;
  organizationId: string;
  userId: string;
  role: SystemRoleName;
  status: MembershipStatus;
  joinedAt: number;
}

export interface TeamEntity {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface InvitationEntity {
  id: string;
  organizationId: string;
  email: string;
  role: SystemRoleName;
  tokenHash: string;
  status: InvitationStatus;
  expiresAt: number;
  createdAt: number;
}

export interface AuthorizeParams {
  actorUserId: string;
  organizationId: string;
  requiredPermission: PermissionCode;
  memberRole?: SystemRoleName;
}

/**
 * Validates whether an actor holds the required permission within an organization.
 */
export function authorizeCapability(params: AuthorizeParams): boolean {
  if (!params.actorUserId || !params.organizationId) {
    return false;
  }
  const role = params.memberRole || "Viewer";
  const allowed = SYSTEM_ROLE_PERMISSIONS[role] || [];
  return allowed.includes(params.requiredPermission);
}

/**
 * Asserts authorization or throws ForbiddenError.
 */
export function assertAuthorized(params: AuthorizeParams): void {
  const isAllowed = authorizeCapability(params);
  if (!isAllowed) {
    throw new ForbiddenError(
      `Access denied: Missing required permission '${params.requiredPermission}' for organization '${params.organizationId}'`
    );
  }
}

/**
 * Validates invitation state transition.
 */
export function assertValidInvitationTransition(
  current: InvitationStatus,
  target: InvitationStatus,
  expiresAt: number
): void {
  if (current !== "pending") {
    throw new InvalidStateTransitionError(`Cannot transition invitation from ${current} to ${target}`);
  }
  if (Date.now() > expiresAt && target === "accepted") {
    throw new InvalidStateTransitionError("Invitation has expired and cannot be accepted");
  }
}

export {
  authorizeOperation,
  assertNotLastOwner,
  getOrganizationSecurityPolicy,
  validateDestinationSecurity,
  generateApiKey,
  verifyApiKey,
  generateShareLink,
  redactSensitiveData,
} from "../security";
export type { AuthorizationContext, AuthorizationRequest } from "../security";
