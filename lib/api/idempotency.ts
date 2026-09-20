/**
 * NXTQR — Durable API Mutation Idempotency Handler
 * Scoped by organization + credential + endpoint + key.
 * SHA-256 canonical fingerprinting blocks silent misdirection or replay corruption.
 */

import { NextResponse } from "next/server";
import { ConflictError } from "@nxtqr/contracts";
import {
  getIdempotencyRecordInD1,
  reserveIdempotencyRecordInD1,
  completeIdempotencyRecordInD1,
} from "@nxtqr/db";
import { ApiPrincipal } from "./auth";

/**
 * Computes canonical SHA-256 fingerprint of JSON body
 */
export async function computeFingerprint(body: unknown): Promise<string> {
  const json = typeof body === "string" ? body : JSON.stringify(body || {});
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest("SHA-256", enc.encode(json));
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require("crypto");
  return nodeCrypto.createHash("sha256").update(json).digest("hex");
}

export interface IdempotencyReservation {
  isIdempotent: boolean;
  cachedResponse?: NextResponse;
  key?: string;
  fingerprint?: string;
}

/**
 * Checks and reserves an idempotency key.
 */
export async function checkIdempotency(
  db: any,
  principal: ApiPrincipal,
  requestPath: string,
  requestMethod: string,
  idempotencyKey: string | null,
  body: unknown
): Promise<IdempotencyReservation> {
  if (!idempotencyKey || !db) {
    return { isIdempotent: false };
  }

  const fingerprint = await computeFingerprint(body);
  const credentialId = principal.actorId;

  const reservation = await reserveIdempotencyRecordInD1(db, {
    organizationId: principal.organizationId,
    credentialId,
    key: idempotencyKey,
    requestMethod,
    requestPath,
    requestFingerprint: fingerprint,
  });

  if (reservation.reserved) {
    return { isIdempotent: true, key: idempotencyKey, fingerprint };
  }

  const existing = reservation.existingRecord;
  if (!existing) {
    return { isIdempotent: true, key: idempotencyKey, fingerprint };
  }

  // 1. Check payload fingerprint match
  if (existing.requestFingerprint !== fingerprint) {
    throw new ConflictError(
      `Idempotency-Key '${idempotencyKey}' was already used with a different request payload.`
    );
  }

  // 2. If already completed, return cached response
  if (existing.status === "COMPLETED" && existing.responseBody) {
    const parsedBody = JSON.parse(existing.responseBody);
    const cachedRes = NextResponse.json(parsedBody, {
      status: existing.responseStatus || 200,
      headers: {
        "X-Idempotency-Status": "CACHED",
        "Cache-Control": "no-store, private",
      },
    });
    return { isIdempotent: true, cachedResponse: cachedRes, key: idempotencyKey };
  }

  // 3. In progress concurrent duplicate
  throw new ConflictError(`A request with Idempotency-Key '${idempotencyKey}' is currently in progress.`);
}

/**
 * Stores the completed response payload in D1 for future duplicate requests.
 */
export async function recordIdempotentResponse(
  db: any,
  principal: ApiPrincipal,
  requestPath: string,
  key: string | undefined,
  statusCode: number,
  responseBody: unknown
): Promise<void> {
  if (!key || !db) return;

  try {
    await completeIdempotencyRecordInD1(db, {
      organizationId: principal.organizationId,
      credentialId: principal.actorId,
      requestPath,
      key,
      responseStatus: statusCode,
      responseHeaders: { "content-type": "application/json" },
      responseBody: JSON.stringify(responseBody),
    });
  } catch (err) {
    console.warn("Failed to record idempotency completion:", err);
  }
}
