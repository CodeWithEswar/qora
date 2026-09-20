import { NextRequest } from "next/server";
import { apiSuccess, handleApiError, getRequestId } from "@/lib/api";
import { UnauthorizedError, ConflictError } from "@nxtqr/contracts";
import { acceptInvitationInD1, validateInvitationTokenInD1 } from "@nxtqr/db";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const requestId = getRequestId(request);
  try {
    const { token } = await params;
    const session = await getSession();

    if (!session?.user) {
      throw new UnauthorizedError("You must be signed in to accept an invitation.");
    }

    const d1 = (request as any).env?.DB;
    if (!d1) {
      const { acceptInvitationInStore } = await import("@/lib/domains/organization-store");
      const res = acceptInvitationInStore(token, session.user);
      if (!res) {
        throw new ConflictError("This invitation is invalid or has already been used.");
      }
      return apiSuccess(
        {
          success: true,
          redirectUrl: `/${res.organizationSlug}`,
          organizationSlug: res.organizationSlug,
        },
        requestId
      );
    }

    // Validate token first
    const validation = await validateInvitationTokenInD1(d1, token);
    if (!validation.isValid) {
      if (validation.isExpired) {
        throw new ConflictError("This invitation has expired.");
      }
      throw new ConflictError("This invitation is no longer valid or has already been used.");
    }

    // Accept invitation transactionally
    const res = await acceptInvitationInD1(d1, token, session.user.id);

    return apiSuccess(
      {
        success: true,
        redirectUrl: `/${res.organizationSlug}`,
        organizationSlug: res.organizationSlug,
      },
      requestId
    );
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
