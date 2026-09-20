/**
 * NXTQR — Domain & URL Rule Regression Test Suite
 * Validates repository-wide absence of forbidden legacy short domains (nxtqr.link, qora.link, nxtqr.to),
 * verifies canonical resolver URL construction with /s/{slug},
 * and asserts platform domain protection.
 */

import fs from "node:fs";
import path from "node:path";
import { buildQrResolverUrl, buildShortResolverUrl, RESOLVER_CONFIG } from "../packages/config/src/site";
import { normalizeHostname } from "../lib/domains/domain-normalization";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✔ ${testName}`);
    passed++;
  } else {
    console.error(`✖ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failed++;
  }
}

console.log("=======================================================");
console.log("NXTQR — DOMAIN & URL REGRESSION TEST SUITE");
console.log("=======================================================\n");

// --- 1. RESOLVER CONFIG & BUILDER TESTS ---
console.log("--- 1. Canonical Resolver URL Builder Tests ---");

assert(
  RESOLVER_CONFIG.defaultHost === "nxtqr.vercel.app",
  "RESOLVER_CONFIG.defaultHost is 'nxtqr.vercel.app'",
  `Got ${RESOLVER_CONFIG.defaultHost}`
);

assert(
  RESOLVER_CONFIG.shortUrlBase === "https://nxtqr.vercel.app",
  "RESOLVER_CONFIG.shortUrlBase is 'https://nxtqr.vercel.app'",
  `Got ${RESOLVER_CONFIG.shortUrlBase}`
);

assert(
  RESOLVER_CONFIG.resolverPath === "/s",
  "RESOLVER_CONFIG.resolverPath is '/s'",
  `Got ${RESOLVER_CONFIG.resolverPath}`
);

// Basic default resolver URL
const defaultUrl = buildQrResolverUrl("summer-sale-2026");
assert(
  defaultUrl === "https://nxtqr.vercel.app/s/summer-sale-2026",
  "buildQrResolverUrl('summer-sale-2026') -> https://nxtqr.vercel.app/s/summer-sale-2026",
  `Got ${defaultUrl}`
);

// Slug with leading slash
const slashUrl = buildQrResolverUrl("/winter-promo");
assert(
  slashUrl === "https://nxtqr.vercel.app/s/winter-promo",
  "buildQrResolverUrl('/winter-promo') sanitizes leading slash",
  `Got ${slashUrl}`
);

// Slug with duplicate s/ prefix
const duplicateSUrl = buildQrResolverUrl("s/promo-deal");
assert(
  duplicateSUrl === "https://nxtqr.vercel.app/s/promo-deal",
  "buildQrResolverUrl('s/promo-deal') avoids duplicate /s/s/",
  `Got ${duplicateSUrl}`
);

// Custom host argument
const customHostUrl = buildQrResolverUrl("vip-access", "qr.luxurybrand.com");
assert(
  customHostUrl === "https://qr.luxurybrand.com/s/vip-access",
  "buildQrResolverUrl('vip-access', 'qr.luxurybrand.com') -> https://qr.luxurybrand.com/s/vip-access",
  `Got ${customHostUrl}`
);

// Custom host with protocol prefix stripped safely
const protoCustomHostUrl = buildQrResolverUrl("vip-access", "https://qr.luxurybrand.com");
assert(
  protoCustomHostUrl === "https://qr.luxurybrand.com/s/vip-access",
  "buildQrResolverUrl strips protocol if passed in customHost",
  `Got ${protoCustomHostUrl}`
);

// Options object syntax
const optionsObjUrl = buildQrResolverUrl({
  slug: "launch-event",
  customHost: "qr.techcorp.io",
});
assert(
  optionsObjUrl === "https://qr.techcorp.io/s/launch-event",
  "buildQrResolverUrl({ slug, customHost }) -> https://qr.techcorp.io/s/launch-event",
  `Got ${optionsObjUrl}`
);

// BaseUrl options syntax
const baseUrlOptUrl = buildQrResolverUrl({
  slug: "partner-portal",
  baseUrl: "https://qr.enterprise.org",
});
assert(
  baseUrlOptUrl === "https://qr.enterprise.org/s/partner-portal",
  "buildQrResolverUrl({ slug, baseUrl }) -> https://qr.enterprise.org/s/partner-portal",
  `Got ${baseUrlOptUrl}`
);

// Backwards compatibility alias
const aliasUrl = buildShortResolverUrl("legacy-call");
assert(
  aliasUrl === "https://nxtqr.vercel.app/s/legacy-call",
  "buildShortResolverUrl alias returns canonical https://nxtqr.vercel.app/s/legacy-call",
  `Got ${aliasUrl}`
);

// --- 2. PLATFORM DOMAIN RESERVATION TESTS ---
console.log("\n--- 2. Platform Domain Protection Tests ---");

const nxtqrRootCheck = normalizeHostname("nxtqr.vercel.app");
assert(
  Boolean(!nxtqrRootCheck.valid && nxtqrRootCheck.error?.includes("reserved")),
  "normalizeHostname('nxtqr.vercel.app') is rejected as reserved platform domain",
  nxtqrRootCheck.error
);

const nextqrRootCheck = normalizeHostname("nextqr.vercel.app");
assert(
  Boolean(!nextqrRootCheck.valid && nextqrRootCheck.error?.includes("reserved")),
  "normalizeHostname('nextqr.vercel.app') is rejected as reserved platform domain",
  nextqrRootCheck.error
);

const customerDomainCheck = normalizeHostname("qr.mycompany.com");
assert(
  customerDomainCheck.valid && customerDomainCheck.hostname === "qr.mycompany.com",
  "normalizeHostname('qr.mycompany.com') is accepted for customer workspace"
);

// --- 3. REPOSITORY SCAN FOR FORBIDDEN SHORT DOMAINS ---
console.log("\n--- 3. Repository-Wide Code Scan for Forbidden Domains ---");

const FORBIDDEN_STRINGS = [
  "nxtqr.link",
  "qora.link",
  "nxtqr.to",
];

const SCAN_DIRS = [
  "app",
  "components",
  "lib",
  "packages",
  "cloudflare",
  "data",
];

const ALLOWED_FILES = new Set([
  "AGENTS.md",
  "test-domain-url-rules.ts",
]);

let forbiddenFound = 0;

function scanDir(dir: string) {
  const fullPath = path.resolve(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) return;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next" || entry.name === "dist-test") {
      continue;
    }

    const entryPath = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      scanSubDir(entryPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".json") || entry.name.endsWith(".jsonc"))) {
      checkFile(entryPath, entry.name);
    }
  }
}

function scanSubDir(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist-test") continue;
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanSubDir(entryPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".json") || entry.name.endsWith(".jsonc"))) {
      checkFile(entryPath, entry.name);
    }
  }
}

function checkFile(filePath: string, fileName: string) {
  if (ALLOWED_FILES.has(fileName)) return;

  const content = fs.readFileSync(filePath, "utf-8");
  for (const forbidden of FORBIDDEN_STRINGS) {
    if (content.toLowerCase().includes(forbidden.toLowerCase())) {
      console.error(`✖ Found forbidden string '${forbidden}' in: ${filePath}`);
      forbiddenFound++;
    }
  }
}

for (const dir of SCAN_DIRS) {
  scanDir(dir);
}

assert(
  forbiddenFound === 0,
  `Repository scan: 0 occurrences of forbidden domains (nxtqr.link, qora.link, nxtqr.to) across active source directories`,
  `Found ${forbiddenFound} violations`
);

console.log("\n=======================================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
