/**
 * NXTQR — Runtime Permission Evaluator & Policy Enforcement
 */

import {
  PermissionCode,
  SystemRoleName,
  SYSTEM_ROLE_PERMISSIONS,
  ForbiddenError,
  UnauthorizedError,
} from "@nxtqr/contracts";
import { PERMISSION_GROUPS, PermissionCategoryGroup } from "./catalog";

export interface PermissionContext {
  userId?: string;
  orgId?: string;
  roleId?: string;
  roleName?: string;
  role?: string;
  userRole?: string;
  isSystemRole?: boolean;
  permissions?: PermissionCode[];
  organizationId?: string;
}

export type AuthorizationContext = PermissionContext;

/**
 * Checks whether a role or authorization context possesses a specific permission.
 */
export function hasPermission(
  roleOrCtx: string | SystemRoleName | PermissionContext,
  permission: PermissionCode,
  additionalPermissions: PermissionCode[] = []
): boolean {
  let roleStr: string;
  let customPerms = additionalPermissions;

  if (typeof roleOrCtx === "object" && roleOrCtx !== null) {
    roleStr = roleOrCtx.roleName || roleOrCtx.role || roleOrCtx.userRole || "Viewer";
    customPerms = roleOrCtx.permissions || additionalPermissions;
  } else {
    roleStr = String(roleOrCtx || "Viewer");
  }

  if (roleStr === "Owner" || roleStr === "OWNER" || roleStr.toLowerCase() === "owner") {
    return true;
  }

  const normalizedRole = (roleStr.charAt(0).toUpperCase() +
    roleStr.slice(1).toLowerCase()) as SystemRoleName;

  const rolePermissions = SYSTEM_ROLE_PERMISSIONS[normalizedRole] || [];
  if (rolePermissions.includes(permission)) return true;

  return customPerms.includes(permission);
}

/**
 * Validates permission and throws a typed ForbiddenError if unauthorized.
 * Returns the validated PermissionContext.
 */
export function requirePermission<T extends PermissionContext>(
  ctx: T,
  permission: PermissionCode
): T {
  if (!ctx) {
    throw new UnauthorizedError("Authentication required: No valid session or principal found.");
  }

  const role = (ctx.roleName || ctx.role || ctx.userRole || "Viewer") as SystemRoleName;

  if (!hasPermission(ctx, permission)) {
    throw new ForbiddenError(
      `Access denied: Current principal with role '${role}' lacks required permission '${permission}'`
    );
  }

  return ctx;
}

/**
 * Evaluates whether an action is allowed given user role and permission codes.
 */
export function canPerformAction(
  userRole: string | SystemRoleName,
  userPermissions: PermissionCode[] = [],
  requiredPermission: PermissionCode
): boolean {
  return hasPermission(userRole, requiredPermission, userPermissions);
}

/**
 * Returns the effective set of permissions for a role, categorized by domain.
 */
export function getEffectivePermissions(
  roleOrCtx: string | SystemRoleName | PermissionContext,
  customPermissions: PermissionCode[] = []
): {
  groups: Array<PermissionCategoryGroup & { enabledCount: number; totalCount: number }>;
  allEnabledCodes: PermissionCode[];
  has: (code: PermissionCode) => boolean;
} {
  let roleStr: string;
  let activeCustom = customPermissions;

  if (typeof roleOrCtx === "object" && roleOrCtx !== null) {
    roleStr = roleOrCtx.roleName || roleOrCtx.role || roleOrCtx.userRole || "Viewer";
    activeCustom = roleOrCtx.permissions || customPermissions;
  } else {
    roleStr = String(roleOrCtx || "Viewer");
  }

  const normalizedRole = (roleStr.charAt(0).toUpperCase() +
    roleStr.slice(1).toLowerCase()) as SystemRoleName;

  const basePermissions = SYSTEM_ROLE_PERMISSIONS[normalizedRole] || [];
  const activeCodes = new Set<PermissionCode>([
    ...(roleStr === "Owner" || roleStr === "OWNER" || roleStr.toLowerCase() === "owner"
      ? SYSTEM_ROLE_PERMISSIONS.Owner
      : basePermissions),
    ...activeCustom,
  ]);

  const groups = PERMISSION_GROUPS.map((group) => {
    let enabledCount = 0;
    group.permissions.forEach((p) => {
      if (activeCodes.has(p.code)) enabledCount++;
    });
    return {
      ...group,
      enabledCount,
      totalCount: group.permissions.length,
    };
  });

  const codesArray = Array.from(activeCodes);

  return {
    groups,
    allEnabledCodes: codesArray,
    has: (code: PermissionCode) => activeCodes.has(code),
  };
}
