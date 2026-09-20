/**
 * Sanitizes and validates return URLs to prevent open-redirect vulnerabilities.
 * Only relative internal paths beginning with a single '/' are permitted.
 */
export function sanitizeReturnUrl(url: string | null | undefined, fallback = "/workspace"): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();

  // Prevent protocol-relative URLs (//evil.com), javascript:, data:, and backslash bypasses (/\evil.com)
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes(":") ||
    trimmed.startsWith("/api/auth") ||
    trimmed === "/login" ||
    trimmed === "/signup"
  ) {
    return fallback;
  }

  return trimmed;
}
