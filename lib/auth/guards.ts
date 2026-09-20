import "server-only";
import { redirect } from "next/navigation";
import { getSession, SessionUser } from "./session";

/**
 * Server-side guard requiring an active authenticated session.
 * If unauthenticated, safely redirects to /login with the return path.
 */
export async function requireAuth(returnTo?: string): Promise<SessionUser> {
  const session = await getSession();

  if (!session?.user) {
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${query}`);
  }

  return session.user;
}

/**
 * Server-side guard requiring completed onboarding.
 * If user hasn't completed onboarding, redirects to /onboarding.
 */
export async function requireOnboarded(returnTo?: string): Promise<SessionUser> {
  const user = await requireAuth(returnTo);

  if (!user.onboardingCompleted && user.workspaces.length === 0) {
    redirect("/onboarding");
  }

  return user;
}
