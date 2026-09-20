/**
 * NXTQR — Real DNS Verification Engine
 * Performs non-blocking, bounded-timeout DNS queries using Node.js dns/promises.
 * Validates ownership TXT tokens and edge routing CNAME records.
 */

import dns from "node:dns/promises";
import { DomainDnsRecord } from "@nxtqr/contracts";

export interface VerificationCheckResult {
  verified: boolean;
  dnsStatus: "VERIFIED" | "PENDING" | "FAILED";
  records: DomainDnsRecord[];
  observedTxt: string[];
  observedCname: string[];
  message: string;
}

const QUERY_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Executes authoritative DNS verification for a registered domain.
 */
export async function verifyDomainDns(
  hostname: string,
  expectedToken: string,
  records: DomainDnsRecord[],
  edgeTarget = "cname.nxtqr.app"
): Promise<VerificationCheckResult> {
  const challengeHost = `_nxtqr-challenge.${hostname}`;
  const observedTxt: string[] = [];
  const observedCname: string[] = [];

  // 1. Resolve TXT records with bounded timeout
  try {
    const txtChunks = await withTimeout(
      dns.resolveTxt(challengeHost).catch(() => []),
      QUERY_TIMEOUT_MS,
      []
    );
    for (const chunkGroup of txtChunks) {
      const fullTxt = chunkGroup.join("");
      observedTxt.push(fullTxt);
    }
  } catch {}

  // Also fallback to checking apex/subdomain root TXT if user placed it there
  if (!observedTxt.some((t) => t.includes(expectedToken))) {
    try {
      const rootTxt = await withTimeout(
        dns.resolveTxt(hostname).catch(() => []),
        QUERY_TIMEOUT_MS,
        []
      );
      for (const chunkGroup of rootTxt) {
        const fullTxt = chunkGroup.join("");
        if (!observedTxt.includes(fullTxt)) {
          observedTxt.push(fullTxt);
        }
      }
    } catch {}
  }

  // 2. Resolve CNAME record with bounded timeout
  try {
    const cnames = await withTimeout(
      dns.resolveCname(hostname).catch(() => []),
      QUERY_TIMEOUT_MS,
      []
    );
    for (const c of cnames) {
      observedCname.push(c.toLowerCase().replace(/\.$/, ""));
    }
  } catch {}

  // 3. Evaluate verification results
  const txtVerified = observedTxt.some((t) => t.trim() === expectedToken.trim());
  const cnameVerified = observedCname.some(
    (c) => c === edgeTarget.toLowerCase() || c.endsWith(".nxtqr.app")
  );

  // Update records array with current live statuses
  const updatedRecords: DomainDnsRecord[] = records.map((record) => {
    if (record.type === "TXT") {
      return {
        ...record,
        status: txtVerified ? "VERIFIED" : observedTxt.length > 0 ? "INVALID" : "PENDING",
      };
    }
    if (record.type === "CNAME") {
      return {
        ...record,
        status: cnameVerified ? "VERIFIED" : observedCname.length > 0 ? "INVALID" : "PENDING",
      };
    }
    return record;
  });

  // Either TXT token match proves ownership; CNAME activates edge routing
  const ownershipVerified = txtVerified;

  let message = "";
  if (ownershipVerified && cnameVerified) {
    message = "Domain ownership verified and CNAME edge routing is fully active.";
  } else if (ownershipVerified && !cnameVerified) {
    message = "Domain ownership verified via TXT. CNAME edge routing is pending DNS propagation.";
  } else if (!ownershipVerified && observedTxt.length > 0) {
    message = `TXT record detected at ${challengeHost}, but value did not match expected verification token.`;
  } else {
    message = `DNS record not found yet. Please ensure the TXT record is published at ${challengeHost}. DNS propagation may take a few minutes.`;
  }

  return {
    verified: ownershipVerified,
    dnsStatus: ownershipVerified ? "VERIFIED" : "PENDING",
    records: updatedRecords,
    observedTxt,
    observedCname,
    message,
  };
}
