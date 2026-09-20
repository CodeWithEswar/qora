/**
 * @nxtqr/permissions
 * RBAC matrix, permission checking, and authorization evaluation.
 */

export * from "./catalog";
export * from "./evaluator";

// Re-export core permission contracts for convenient access
export { SYSTEM_ROLE_PERMISSIONS, ForbiddenError, UnauthorizedError } from "@nxtqr/contracts";
export type { PermissionCode, SystemRoleName } from "@nxtqr/contracts";
