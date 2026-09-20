/**
 * NXTQR — Custom Domain Normalization & Security Rules
 * Pure utility functions for server-authoritative hostname normalization,
 * RFC 1123 syntax validation, SSRF protection, and token generation.
 */

import crypto from "node:crypto";
import { DomainDnsRecord } from "@nxtqr/contracts";

export interface NormalizedDomainResult {
  valid: boolean;
  hostname: string;
  error?: string;
}

const FORBIDDEN_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "nextqr.vercel.app",
  "nxtqr.vercel.app",
  "nxtqr.app",
  "nxtqr.com",
  "nxtqr.dev",
  "api.nxtqr.app",
  "edge.nxtqr.app",
  "cname.nxtqr.app",
]);

const FORBIDDEN_SUFFIXES = [
  ".internal",
  ".local",
  ".lan",
  ".home",
  ".arpa",
  ".invalid",
  ".test",
  ".example",
  ".workers.dev",
  ".pages.dev",
  ".vercel.app",
  ".supabase.co",
];

// RFC 1123 label pattern: alphanumeric with optional internal hyphens, 1-63 chars
const LABEL_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Normalizes and validates incoming hostname input.
 * Strips protocols, paths, query params, ports, and trailing slashes.
 */
export function normalizeHostname(rawInput: string): NormalizedDomainResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, hostname: "", error: "Domain hostname is required." };
  }

  let cleaned = rawInput.trim().toLowerCase();

  // Strip protocol if supplied by user (e.g., https://qr.example.com/ -> qr.example.com)
  cleaned = cleaned.replace(/^https?:\/\//i, "");

  // Strip path, query strings, and fragments
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];

  // Strip port if present
  cleaned = cleaned.replace(/:\d+$/, "");

  // Strip trailing dot
  cleaned = cleaned.replace(/\.$/, "");

  if (cleaned.length < 3 || cleaned.length > 253) {
    return {
      valid: false,
      hostname: cleaned,
      error: "Hostname must be between 3 and 253 characters.",
    };
  }

  // Must contain at least one dot (e.g. subdomain.domain.tld or domain.tld)
  if (!cleaned.includes(".")) {
    return {
      valid: false,
      hostname: cleaned,
      error: "Hostname must contain a valid top-level domain (e.g. qr.example.com).",
    };
  }

  // Check forbidden hostnames
  if (FORBIDDEN_HOSTNAMES.has(cleaned)) {
    return {
      valid: false,
      hostname: cleaned,
      error: "This hostname is reserved by the NXTQR platform.",
    };
  }

  // Check forbidden internal or private network suffixes (SSRF defense)
  for (const suffix of FORBIDDEN_SUFFIXES) {
    if (cleaned.endsWith(suffix)) {
      return {
        valid: false,
        hostname: cleaned,
        error: `Hostnames ending with '${suffix}' cannot be connected.`,
      };
    }
  }

  // IPv4 check
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleaned)) {
    return {
      valid: false,
      hostname: cleaned,
      error: "Direct IP addresses cannot be used as branded domains. Please use a valid hostname.",
    };
  }

  // Validate each label (subdomains and domains)
  const labels = cleaned.split(".");
  for (const label of labels) {
    if (!label || label.length > 63) {
      return {
        valid: false,
        hostname: cleaned,
        error: "Each domain label must be between 1 and 63 characters.",
      };
    }
    if (!LABEL_REGEX.test(label)) {
      return {
        valid: false,
        hostname: cleaned,
        error: `Domain label '${label}' contains invalid characters. Only alphanumeric characters and hyphens are allowed.`,
      };
    }
  }

  // TLD cannot be purely numeric
  const tld = labels[labels.length - 1];
  if (/^\d+$/.test(tld)) {
    return {
      valid: false,
      hostname: cleaned,
      error: "Top-level domain cannot be purely numeric.",
    };
  }

  return { valid: true, hostname: cleaned };
}

/**
 * Generates an unpredictable cryptographic verification token for DNS challenge.
 */
export function generateVerificationToken(): string {
  const random = crypto.randomBytes(16).toString("hex");
  return `nxtqr-domain-verification=${random}`;
}

/**
 * Builds the canonical DNS challenge records required for this hostname.
 */
export function buildRequiredDnsRecords(
  hostname: string,
  token: string,
  edgeTarget = "cname.nxtqr.app"
): DomainDnsRecord[] {
  return [
    {
      type: "TXT",
      name: `_nxtqr-challenge.${hostname}`,
      value: token,
      status: "PENDING",
      ttl: 300,
      description: "TXT challenge to verify domain ownership and tenant authorization.",
    },
    {
      type: "CNAME",
      name: hostname,
      value: edgeTarget,
      status: "PENDING",
      ttl: 300,
      description: "CNAME alias routing dynamic QR traffic to the NXTQR edge resolver.",
    },
  ];
}
