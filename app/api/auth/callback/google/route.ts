import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, parseGoogleIdToken } from "@/lib/auth/google";
import { resolveOrCreateGoogleUser } from "@/lib/auth/user";
import { createSession } from "@/lib/auth/session";
import { sanitizeReturnUrl } from "@/lib/auth/redirects";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;

  const error = searchParams.get("error");
  if (error) {
    console.warn("Google OAuth error from provider:", error);
    const errorType = error === "access_denied" ? "cancelled" : "provider_error";
    return NextResponse.redirect(new URL(`/login?error=${errorType}`, origin));
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const storedState = request.cookies.get("nxtqr_oauth_state")?.value;
  const codeVerifier = request.cookies.get("nxtqr_oauth_verifier")?.value;
  const rawReturnTo = request.cookies.get("nxtqr_oauth_return_to")?.value;
  const returnTo = sanitizeReturnUrl(rawReturnTo, "");

  // CSRF validation
  if (!code || !state || !storedState || state !== storedState) {
    console.error("OAuth state mismatch or missing authorization code.");
    return NextResponse.redirect(new URL("/login?error=state_mismatch", origin));
  }

  if (!codeVerifier) {
    console.error("OAuth PKCE verifier cookie missing or expired.");
    return NextResponse.redirect(new URL("/login?error=session_expired", origin));
  }

  try {
    const redirectUri = `${origin}/api/auth/callback/google`;

    // 1. Exchange authorization code for Google tokens
    const tokens = await exchangeGoogleCode({
      code,
      codeVerifier,
      redirectUri,
    });

    // 2. Parse and validate claims from the Google ID token
    const profile = parseGoogleIdToken(tokens.id_token);

    // 3. Resolve existing user or create brand new NXTQR user
    const { user, isNewUser } = await resolveOrCreateGoogleUser(profile);

    // 4. Determine destination route
    let destinationPath = "/onboarding";

    if (user.workspaces && user.workspaces.length > 0) {
      destinationPath = returnTo || `/${user.workspaces[0].slug}`;
    }

    const response = NextResponse.redirect(new URL(destinationPath, origin));

    // 5. Establish encrypted HTTP-only session cookie
    // Note: Since we are in a Route Handler, we can set the cookie directly on the response
    const sessionToken = await createSession(user);
    response.cookies.set("nxtqr_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      path: "/",
    });

    // 6. Clean up temporary OAuth cookies
    response.cookies.delete("nxtqr_oauth_state");
    response.cookies.delete("nxtqr_oauth_verifier");
    response.cookies.delete("nxtqr_oauth_return_to");

    return response;
  } catch (err: any) {
    console.error("Error during Google OAuth callback processing:", err);
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", origin)
    );
  }
}
