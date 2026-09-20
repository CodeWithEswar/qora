import "server-only";

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

/**
 * Generates a cryptographically random URL-safe string.
 */
export function generateRandomString(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => dec.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes base64url encoded SHA-256 digest for PKCE.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds the Google OAuth 2.0 authorization URL.
 */
export async function getGoogleAuthUrl(params: {
  redirectUri: string;
  state: string;
  codeVerifier: string;
}): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is missing.");
  }

  const codeChallenge = await generateCodeChallenge(params.codeVerifier);

  const searchParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: params.state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
}

/**
 * Exchanges the Google authorization code for tokens.
 */
export async function exchangeGoogleCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: params.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: "authorization_code",
      code_verifier: params.codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Google token exchange failed:", errorData);
    throw new Error(`Google token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Decodes and validates the Google ID Token claims.
 */
export function parseGoogleIdToken(idToken: string): GoogleProfile {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid ID token format.");
    }
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    if (!payload.sub || !payload.email) {
      throw new Error("Missing required claims (sub, email) in Google ID token.");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: Boolean(payload.email_verified),
      name: payload.name || payload.email.split("@")[0],
      avatarUrl: payload.picture || undefined,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse Google ID token: ${err?.message || "Unknown error"}`);
  }
}
