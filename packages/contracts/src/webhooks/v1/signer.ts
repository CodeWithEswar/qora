/**
 * NXTQR — Customer Outbound Webhook Signing & Verification
 * Standard HMAC-SHA256 scheme with timestamp replay protection.
 * Pure Web Crypto API (supported natively in Cloudflare Workers and Node 18+).
 * Header format: X-NXTQR-Signature: t=1789632000,v1=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
 */

export interface WebhookSignatureResult {
  header: string;
  signature: string;
  timestamp: number;
}

/**
 * Computes standard HMAC-SHA256 signature for outbound customer webhook payloads.
 */
export async function computeCustomerWebhookSignature(
  rawPayload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): Promise<WebhookSignatureResult> {
  const signedPayload = `${timestamp}.${rawPayload}`;
  const enc = new TextEncoder();

  const cryptoObj = typeof crypto !== "undefined" ? crypto : (globalThis as any).crypto;
  if (!cryptoObj?.subtle) {
    throw new Error("Web Crypto API (crypto.subtle) is required for webhook HMAC signing.");
  }

  const key = await cryptoObj.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await cryptoObj.subtle.sign("HMAC", key, enc.encode(signedPayload));
  const hexSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const header = `t=${timestamp},v1=${hexSignature}`;
  return {
    header,
    signature: hexSignature,
    timestamp,
  };
}

/**
 * Verifies an incoming customer webhook signature header.
 */
export async function verifyCustomerWebhookSignature(
  rawPayload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): Promise<{ valid: boolean; reason?: string }> {
  if (!signatureHeader) {
    return { valid: false, reason: "Missing signature header" };
  }

  // Parse header: t=123,v1=abc
  const parts = signatureHeader.split(",");
  let timestampStr: string | undefined;
  let signatureHex: string | undefined;

  for (const part of parts) {
    const [k, v] = part.trim().split("=");
    if (k === "t") timestampStr = v;
    if (k === "v1") signatureHex = v;
  }

  if (!timestampStr || !signatureHex) {
    return { valid: false, reason: "Malformed signature header format" };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: "Invalid timestamp in signature header" };
  }

  // Replay tolerance check
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { valid: false, reason: "Webhook timestamp expired or skewed" };
  }

  // Compute expected signature
  const expected = await computeCustomerWebhookSignature(rawPayload, secret, timestamp);
  if (expected.signature !== signatureHex) {
    return { valid: false, reason: "Signature mismatch" };
  }

  return { valid: true };
}
