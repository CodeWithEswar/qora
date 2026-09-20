/**
 * NXTQR — Cryptographically Secure Slug Generation & Grammar Validation
 * 
 * Invariants:
 * - Slugs are URL-safe and avoid visually ambiguous characters (no '0', 'O', '1', 'I', 'l').
 * - Entropy: 57-character alphabet ^ 7 length ≈ 1.95e12 combinations (~40.8 bits of entropy).
 * - Cryptographically random selection via crypto.getRandomValues.
 * - Central canonical reserved slugs registry to protect system routes.
 */

// 57-character URL-safe alphabet (omitting 0/O and 1/I/l)
export const SLUG_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const DEFAULT_SLUG_LENGTH = 7;

export const RESERVED_SLUGS = new Set([
  "api",
  "admin",
  "auth",
  "login",
  "signup",
  "register",
  "logout",
  "status",
  "health",
  "_health",
  "dashboard",
  "docs",
  "settings",
  "billing",
  "routes",
  "portal",
  "portals",
  "teams",
  "members",
  "assets",
  "static",
  "favicon.ico",
  "robots.txt",
  "s",
  "q",
  "qr",
  "w",
  "app",
  "dev",
  "developers",
  "terms",
  "privacy",
  "security",
  "help",
]);

export interface SlugGenerationOptions {
  length?: number;
  prefix?: string;
}

/**
 * Generates a collision-resistant slug using cryptographically secure randomness.
 * Guaranteed to be URL-safe, unambiguous, and not in the reserved list.
 */
export function generateSecureSlug(options: SlugGenerationOptions = {}): string {
  const length = options.length ?? DEFAULT_SLUG_LENGTH;
  const alphabetLen = SLUG_ALPHABET.length; // 58
  const maxUnbiased = 256 - (256 % alphabetLen); // 232 (reject bytes >= 232 to prevent modulo bias)

  // Web Crypto API works in both Node.js (v19+) and Cloudflare Workers
  const cryptoObj = typeof crypto !== "undefined" ? crypto : require("crypto").webcrypto;

  let slug = "";
  while (slug.length < length) {
    const randomBytes = new Uint8Array(length * 2);
    cryptoObj.getRandomValues(randomBytes);

    for (let i = 0; i < randomBytes.length && slug.length < length; i++) {
      const byte = randomBytes[i];
      if (byte < maxUnbiased) {
        slug += SLUG_ALPHABET[byte % alphabetLen];
      }
    }
  }

  const finalSlug = options.prefix ? `${options.prefix}-${slug}` : slug;

  // Defensive: if randomly generated matches reserved word, re-generate (astronomically rare)
  if (RESERVED_SLUGS.has(finalSlug.toLowerCase())) {
    return generateSecureSlug(options);
  }

  return finalSlug;
}

export const SLUG_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;

/**
 * Validates slug syntax and reserved route conflicts.
 */
export function validateSlugSyntax(rawSlug: string): { valid: boolean; error?: string } {
  if (!rawSlug || typeof rawSlug !== "string") {
    return { valid: false, error: "Slug cannot be empty" };
  }

  const trimmed = rawSlug.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: "Slug must be at least 3 characters long" };
  }

  if (trimmed.length > 64) {
    return { valid: false, error: "Slug cannot exceed 64 characters" };
  }

  if (
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("%2f") ||
    trimmed.includes("%2F")
  ) {
    return { valid: false, error: "Path traversal or directory separators are forbidden in slugs" };
  }

  if (!SLUG_REGEX.test(trimmed)) {
    return { valid: false, error: "Slug can only contain alphanumeric characters, hyphens, or underscores" };
  }

  if (RESERVED_SLUGS.has(trimmed.toLowerCase())) {
    return { valid: false, error: `The slug '${trimmed}' is reserved by NXTQR system infrastructure` };
  }

  return { valid: true };
}
