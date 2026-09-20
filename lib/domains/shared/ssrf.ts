/**
 * NXTQR — Outbound SSRF Protection Engine
 * Validates and sanitizes customer-supplied target URLs before outbound dispatch
 * (used by Guardian health checks and Developer webhook dispatchers).
 */

import { SecurityRiskError } from "./errors";

// Private and restricted IPv4 CIDR blocks
const RESTRICTED_IPV4_BLOCKS = [
  { prefix: "127.", desc: "Loopback" },
  { prefix: "10.", desc: "Class A Private" },
  { prefix: "192.168.", desc: "Class C Private" },
  { prefix: "169.254.", desc: "Link-Local / Cloud Metadata (169.254.169.254)" },
  { prefix: "0.0.0.0", desc: "Unspecified" },
  { prefix: "255.255.255.255", desc: "Broadcast" },
];

function isRestrictedClassB(ip: string): boolean {
  // 172.16.0.0 - 172.31.255.255
  if (!ip.startsWith("172.")) return false;
  const parts = ip.split(".");
  if (parts.length < 2) return false;
  const second = parseInt(parts[1], 10);
  return second >= 16 && second <= 31;
}

function isRestrictedCarrierNat(ip: string): boolean {
  // 100.64.0.0 - 100.127.255.255
  if (!ip.startsWith("100.")) return false;
  const parts = ip.split(".");
  if (parts.length < 2) return false;
  const second = parseInt(parts[1], 10);
  return second >= 64 && second <= 127;
}

function isRestrictedIPv6(host: string): boolean {
  const clean = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (clean === "::1" || clean === "0:0:0:0:0:0:0:1") return true; // Loopback
  if (clean === "::" || clean === "0:0:0:0:0:0:0:0") return true; // Unspecified
  if (clean.startsWith("fe80:") || clean.startsWith("fe8") || clean.startsWith("fe9") || clean.startsWith("fea") || clean.startsWith("feb")) {
    return true; // Link-local
  }
  if (clean.startsWith("fc") || clean.startsWith("fd")) {
    return true; // Unique local
  }
  if (clean.includes("::ffff:")) {
    // IPv4-mapped IPv6
    const ipv4 = clean.split("::ffff:")[1];
    if (ipv4) return isRestrictedIP(ipv4);
  }
  return false;
}

export function isRestrictedIP(ip: string): boolean {
  for (const block of RESTRICTED_IPV4_BLOCKS) {
    if (ip.startsWith(block.prefix)) return true;
  }
  if (isRestrictedClassB(ip)) return true;
  if (isRestrictedCarrierNat(ip)) return true;
  if (isRestrictedIPv6(ip)) return true;
  return false;
}

export interface SSRFValidationOptions {
  allowHttp?: boolean; // Defaults to false in production (HTTPS required)
  timeoutMs?: number;
}

/**
 * Validates a target URL against SSRF vulnerabilities.
 * Throws SecurityRiskError if the destination targets an internal or forbidden resource.
 */
export function validateOutboundUrl(
  rawUrl: string,
  options: SSRFValidationOptions = {}
): URL {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new SecurityRiskError("URL must be a valid non-empty string");
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new SecurityRiskError(`Invalid destination URL format: ${rawUrl}`);
  }

  // 1. Protocol validation (Only HTTP/HTTPS allowed)
  const allowedProtocols = options.allowHttp ? ["https:", "http:"] : ["https:"];
  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new SecurityRiskError(
      `Protocol ${parsed.protocol} is forbidden. Outbound requests require ${allowedProtocols.join(" or ")}`
    );
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // 2. Forbidden hostnames
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal" ||
    hostname === "instance-data"
  ) {
    throw new SecurityRiskError(`Target host '${hostname}' is restricted from outbound requests`);
  }

  // 3. Direct IP inspection
  if (isRestrictedIP(hostname)) {
    throw new SecurityRiskError(`Target IP '${hostname}' belongs to a restricted internal or link-local range`);
  }

  return parsed;
}
