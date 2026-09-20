"use client";

/**
 * NXTQR Client Session Deduplicator & In-Memory Cache
 * Prevents multiple simultaneous components from firing duplicate
 * requests to /api/auth/session on page load.
 */

let sessionPromise: Promise<any> | null = null;
let cachedSession: any = null;
let lastFetchedAt = 0;
const SESSION_TTL_MS = 20_000; // 20 seconds cache

export async function getClientSession(force = false): Promise<any> {
  const now = Date.now();
  if (!force && cachedSession && now - lastFetchedAt < SESSION_TTL_MS) {
    return cachedSession;
  }

  if (!sessionPromise || force) {
    sessionPromise = fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        cachedSession = data;
        lastFetchedAt = Date.now();
        sessionPromise = null;
        return data;
      })
      .catch(() => {
        sessionPromise = null;
        return null;
      });
  }

  return sessionPromise;
}
