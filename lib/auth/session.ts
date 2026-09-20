import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "nxtqr_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface WorkspaceMembership {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: "google";
  onboardingCompleted: boolean;
  workspaces: WorkspaceMembership[];
}

export interface SessionPayload {
  user: SessionUser;
  expiresAt: number;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be configured in production environment.");
    }
    return new TextEncoder().encode("nxtqr_dev_secret_fallback_key_2026_secure_key_at_least_32_bytes");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Encrypts a session payload into a signed JWT string.
 */
export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(getSecretKey());
}

/**
 * Decrypts and verifies a signed JWT session string.
 */
export async function decryptSession(
  token: string | undefined = ""
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Creates and sets the encrypted HTTP-only session cookie.
 */
export async function createSession(user: SessionUser): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const sessionToken = await encryptSession({ user, expiresAt });
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(expiresAt),
      sameSite: "lax",
      path: "/",
    });
  } catch {
    // In GET Route Handlers, cookieStore is read-only.
    // Callers will set the cookie on NextResponse directly.
  }

  return sessionToken;
}

/**
 * Retrieves the currently active user session from server cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return decryptSession(token);
}

/**
 * Clears the session cookie on signout.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });
}
