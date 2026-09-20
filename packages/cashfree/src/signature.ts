import * as crypto from "crypto";

/**
 * Validates webhook timestamp freshness against current server clock.
 * Blocks replay attacks by asserting the payload is within the allowed freshness window.
 */
export function validateWebhookTimestamp(
  timestampHeader: string | null,
  maxAgeSeconds = 300,
  nowMs = Date.now()
): boolean {
  if (!timestampHeader) return false;
  const tsNum = Number(timestampHeader);
  if (isNaN(tsNum) || tsNum <= 0) return false;

  // Header timestamp may be in seconds or milliseconds
  const eventTimeMs = tsNum > 1e11 ? tsNum : tsNum * 1000;
  const ageMs = nowMs - eventTimeMs;

  // Within 300 seconds in the past, and at most 60 seconds clock skew in the future
  return ageMs >= -60_000 && ageMs <= maxAgeSeconds * 1000;
}

/**
 * Computes and verifies Cashfree HMAC-SHA256 signature against exact raw request body.
 * Formula: HMAC_SHA256(timestamp + rawBody, secretKey) in base64.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secretKey: string
): boolean {
  if (!rawBody || !signature || !secretKey) return false;

  try {
    const dataToSign = timestamp ? `${timestamp}${rawBody}` : rawBody;
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("base64");

    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const compBuf = Buffer.from(computedSignature);

    if (sigBuf.length !== compBuf.length) {
      // Also allow hex match if legacy format
      const computedHex = crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("hex");
      return signature.toLowerCase() === computedHex.toLowerCase();
    }

    return crypto.timingSafeEqual(sigBuf, compBuf);
  } catch {
    return false;
  }
}
