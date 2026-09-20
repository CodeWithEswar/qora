import { NextRequest, NextResponse } from "next/server";
import { generateRandomString, getGoogleAuthUrl } from "@/lib/auth/google";
import { sanitizeReturnUrl } from "@/lib/auth/redirects";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const returnTo = sanitizeReturnUrl(searchParams.get("returnTo"), "");

    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/callback/google`;

    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(48);

    const googleAuthUrl = await getGoogleAuthUrl({
      redirectUri,
      state,
      codeVerifier,
    });

    const response = NextResponse.redirect(googleAuthUrl);

    // Store state, verifier, and returnTo in short-lived HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    };

    response.cookies.set("nxtqr_oauth_state", state, cookieOptions);
    response.cookies.set("nxtqr_oauth_verifier", codeVerifier, cookieOptions);
    if (returnTo) {
      response.cookies.set("nxtqr_oauth_return_to", returnTo, cookieOptions);
    }

    return response;
  } catch (err: any) {
    console.error("Error initiating Google OAuth:", err);
    return NextResponse.redirect(
      new URL("/login?error=configuration_error", request.nextUrl.origin)
    );
  }
}
