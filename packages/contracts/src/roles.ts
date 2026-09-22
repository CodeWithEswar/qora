import { z } from "zod";
import { PermissionCode } from "./permissions";

export interface RoleOverviewItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  organizationId: string | null;
  memberCount: number;
  permissionCount: number;
  permissionsCount?: number;
  capabilitiesCount?: number;
  permissionDna?: Record<string, number>;
  isDefault?: boolean;
  createdAt?: string;
}

export interface RoleMemberSummary {
  membershipId: string;
  userId: string;
  name: string;
  displayName?: string;
  email: string;
  avatarUrl?: string | null;
  roleId: string;
  roleName: string;
  status: string;
  joinedAt?: string;
  teams?: Array<{ id: string; name: string }>;
}

export interface RoleDetail extends RoleOverviewItem {
  permissions: PermissionCode[];
  members: RoleMemberSummary[];
  capabilityAreas: string[];
}

export interface PermissionMatrixCell {
  roleId: string;
  roleName?: string;
  state: "allowed" | "denied" | "system" | "system_required" | "inherited" | "entitlement_restricted";
  isAllowed: boolean;
}

export interface PermissionMatrixItem {
  code: PermissionCode | string;
  name: string;
  label?: string;
  description: string;
  isHighImpact: boolean;
  states?: Record<string, "allowed" | "denied" | "system">;
  roleStates: Record<string, PermissionMatrixCell>;
}

export interface PermissionMatrixDomainGroup {
  id?: string;
  domainKey: string;
  domainName: string;
  name?: string;
  description: string;
  permissions: PermissionMatrixItem[];
}

export interface RolesControlPlaneMetrics {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  totalMembers: number;
  totalCapabilities: number;
  teamsCount: number;
}

export interface RolesControlPlaneOverview {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  metrics: RolesControlPlaneMetrics;
  roles: RoleOverviewItem[];
  members: RoleMemberSummary[];
  matrix: PermissionMatrixDomainGroup[];
  defaultRoleId: string;
  userPermissions: {
    canManageRoles: boolean;
    canAssignRoles: boolean;
  };
  systemRolesCount?: number;
  customRolesCount?: number;
  totalMembersCount?: number;
  totalCapabilitiesCount?: number;
  totalPermissionsCount?: number;
  teamsCount?: number;
}

export interface RoleComparisonResult {
  roleA?: { id: string; name: string; isSystem: boolean };
  roleB?: { id: string; name: string; isSystem: boolean };
  shared: string[];
  roleAOnly: string[];
  roleBOnly: string[];
  onlyA?: string[];
  onlyB?: string[];
  domains?: Array<{
    domainId: string;
    domainName: string;
    shared: string[];
    onlyA: string[];
    onlyB: string[];
  }>;
}

export interface RoleImpactResult {
  membersAffectedCount: number;
  teamsAffectedCount: number;
  capabilitiesAddedCount: number;
  capabilitiesRemovedCount: number;
  addedPermissions: string[];
  removedPermissions: string[];
  affectedDomains: string[];
}

export type AccessCorridorStage =
  | "identity"
  | "membership"
  | "role"
  | "permission"
  | "entitlement"
  | "policy"
  | "resource"
  | "decision";

export type AccessCorridorStatus = "passed" | "failed" | "blocked" | "requires_approval" | "conditional" | "skipped";

export interface AccessCorridorStep {
  stage: string;
  label: string;
  status: "passed" | "blocked" | "requires_approval" | "skipped" | "neutral" | string;
  detail: string;
}

export type AccessDecision = "allowed" | "denied" | "approval_required";

export interface AccessSimulatorResult {
  decision: AccessDecision;
  memberName: string;
  roleName: string;
  action: string;
  corridor: AccessCorridorStep[];
  reasons: string[];
  explanation: string;
}

// Zod Schemas for Validation
export const CreateCustomRoleDtoSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").max(50),
  code: z.string().max(50).optional(),
  description: z.string().max(200).optional().default(""),
  permissions: z.array(z.string()).default([]),
});
export type CreateCustomRoleDto = z.infer<typeof CreateCustomRoleDtoSchema>;

export const UpdateCustomRoleDtoSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  code: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).optional(),
});
export type UpdateCustomRoleDto = z.infer<typeof UpdateCustomRoleDtoSchema>;

export const DuplicateRoleDtoSchema = z.object({
  name: z.string().min(2).max(50),
  newName: z.string().min(2).max(50).optional(),
});
export type DuplicateRoleDto = z.infer<typeof DuplicateRoleDtoSchema>;

export const DeleteRoleDtoSchema = z.object({
  reassignRoleId: z.string().min(1).optional(),
  reassignToRoleId: z.string().min(1).optional(),
  confirmationRoleName: z.string().optional(),
});
export type DeleteRoleDto = z.infer<typeof DeleteRoleDtoSchema>;

export const ChangeMemberRoleDtoSchema = z.object({
  membershipId: z.string().min(1),
  newRoleId: z.string().min(1),
});
export type ChangeMemberRoleDto = z.infer<typeof ChangeMemberRoleDtoSchema>;

export const BulkChangeRoleDtoSchema = z.object({
  membershipIds: z.array(z.string().min(1)).min(1),
  newRoleId: z.string().min(1),
});
export type BulkChangeRoleDto = z.infer<typeof BulkChangeRoleDtoSchema>;

export const SimulateAccessDtoSchema = z.object({
  membershipId: z.string().min(1).optional(),
  memberUserId: z.string().min(1).optional(),
  resourceType: z.string().min(1),
  resourceId: z.string().optional(),
  action: z.string().min(1),
});
export type SimulateAccessDto = z.infer<typeof SimulateAccessDtoSchema>;

export const CalculateRoleImpactDtoSchema = z.object({
  proposedPermissions: z.array(z.string()),
});
export type CalculateRoleImpactDto = z.infer<typeof CalculateRoleImpactDtoSchema>;
