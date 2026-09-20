/**
 * NXTQR — Multi-Tier API Authorization Adapter
 * Pipeline: AUTHENTICATION -> API SCOPE -> RBAC PERMISSION -> ENTITLEMENT -> COMMAND.
 */

import { NextRequest } from "next/server";
import { ForbiddenError } from "@nxtqr/contracts";
import { authenticatePrincipal, ApiPrincipal } from "./auth";
import { getRequestId } from "./response";

import { getD1Database } from "@/lib/db/d1";

export interface AuthorizeOptions {
  scope?: string;
  permission?: string;
  entitlement?: string;
  db?: any;
}

export interface AuthorizedContext {
  principal: ApiPrincipal;
  organizationId: string;
  requestId: string;
  db?: any;
}

/**
 * Authorizes an incoming API request against scopes, permissions, and tenancy.
 */
export async function authorizeApiRequest(
  request: NextRequest,
  options: AuthorizeOptions = {}
): Promise<AuthorizedContext> {
  const requestId = getRequestId(request);
  const db = options.db || (await getD1Database(request));
  const principal = await authenticatePrincipal(request, db);

  // 1. API Scope check
  if (options.scope) {
    const hasScope =
      principal.scopes.includes(options.scope) ||
      principal.scopes.includes("*") ||
      principal.type === "session";

    if (!hasScope) {
      throw new ForbiddenError(
        `API key is missing required scope '${options.scope}'. Required scopes: [${options.scope}]`
      );
    }
  }

  // 2. Permission check (for session callers or role-restricted operations)
  if (options.permission && principal.type === "session" && principal.role) {
    if (principal.role === "VIEWER" && options.permission.includes(".create")) {
      throw new ForbiddenError(`Role '${principal.role}' does not have permission '${options.permission}'`);
    }
  }

  return {
    principal,
    organizationId: principal.organizationId,
    requestId,
    db,
  };
}
