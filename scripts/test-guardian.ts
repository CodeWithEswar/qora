/**
 * Automated Verification Script for NXTQR Guardian Reliability Infrastructure
 * 
 * Verifies:
 * 1. Outbound SSRF Protection Engine (blocking localhost, 127.0.0.1, 169.254.169.254, RFC-1918)
 * 2. Fallback Circularity & Loop Detection (identical URLs, normalized targets)
 * 3. Health State Transition Policy (threshold evaluation, incident triggers, recovery)
 * 4. Contract Schema Validation (Zod models)
 * 5. Published Compact Signal Compilation for Edge Resolver
 * 6. Repository-wide adherence to domain URL rules (never nxtqr.link)
 */

import {
  validateGuardianTargetUrl,
  isFallbackCircular,
  evaluateGuardianStateTransition,
  compilePublishedHealthSignal,
} from "../lib/domains/guardian";
import {
  CreateGuardianMonitorRequestV1Schema,
  GuardianMonitorSummaryV1Schema,
  GuardianPulseMetricsV1Schema,
  ConfigureFallbackRequestV1Schema,
} from "../packages/contracts/src/api/v1/guardian";
import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`\x1b[32m✔\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖\x1b[0m ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("NXTQR — GUARDIAN RELIABILITY AUTOMATED TEST SUITE");
  console.log("=======================================================\n");

  // 1. SSRF Protection Tests
  console.log("--- 1. Outbound SSRF Protection Tests ---");

  // Should reject localhost
  let threw = false;
  try {
    validateGuardianTargetUrl("http://localhost:3000/api");
  } catch {
    threw = true;
  }
  assert(threw, "Rejects localhost target");

  // Should reject 127.0.0.1 loopback
  threw = false;
  try {
    validateGuardianTargetUrl("http://127.0.0.1:8080/health");
  } catch {
    threw = true;
  }
  assert(threw, "Rejects 127.0.0.1 loopback target");

  // Should reject cloud metadata service (169.254.169.254)
  threw = false;
  try {
    validateGuardianTargetUrl("http://169.254.169.254/latest/meta-data");
  } catch {
    threw = true;
  }
  assert(threw, "Rejects AWS/GCP cloud metadata IP (169.254.169.254)");

  // Should reject private RFC-1918 Class A (10.x.x.x)
  threw = false;
  try {
    validateGuardianTargetUrl("http://10.0.0.5/status");
  } catch {
    threw = true;
  }
  assert(threw, "Rejects Class A private subnet (10.0.0.0/8)");

  // Should reject private Class C (192.168.x.x)
  threw = false;
  try {
    validateGuardianTargetUrl("https://192.168.1.1/admin");
  } catch {
    threw = true;
  }
  assert(threw, "Rejects Class C private subnet (192.168.0.0/16)");

  // Should reject unsupported protocols
  threw = false;
  try {
    validateGuardianTargetUrl("ftp://files.example.com/test");
  } catch {
    threw = true;
  }
  assert(threw, "Rejects non-HTTP(S) protocols like ftp://");

  // Should accept valid public HTTPS URL
  let acceptedUrl = "";
  try {
    acceptedUrl = validateGuardianTargetUrl("https://store.example.com/checkout");
  } catch {}
  assert(
    acceptedUrl === "https://store.example.com/checkout",
    "Accepts valid public HTTPS target destination"
  );

  // 2. Fallback Cycle Detection Tests
  console.log("\n--- 2. Fallback Circularity & Loop Detection Tests ---");

  assert(
    isFallbackCircular("https://example.com/pricing", "https://example.com/pricing"),
    "Detects identical primary and fallback URLs"
  );

  assert(
    isFallbackCircular("https://example.com/pricing/", "https://example.com/pricing"),
    "Detects identical primary and fallback with trailing slash differences"
  );

  assert(
    !isFallbackCircular("https://example.com/pricing", "https://status.example.com"),
    "Allows distinct valid backup destination"
  );

  // 3. Health State Transition Policy Tests
  console.log("\n--- 3. Health State Transition Policy Tests ---");

  // Transition: 1 failure with threshold 3 -> DEGRADED, no incident
  const t1 = evaluateGuardianStateTransition({
    currentHealth: "HEALTHY",
    consecutiveFailures: 1,
    consecutiveSuccesses: 0,
    failureThreshold: 3,
    recoveryThreshold: 2,
    lastObservationResult: "TIMEOUT",
  });
  assert(
    t1.nextHealth === "DEGRADED" && !t1.shouldOpenIncident,
    "1 check failure transitions HEALTHY -> DEGRADED without opening incident"
  );

  // Transition: 3 failures with threshold 3 -> UNAVAILABLE, should open incident
  const t2 = evaluateGuardianStateTransition({
    currentHealth: "DEGRADED",
    consecutiveFailures: 3,
    consecutiveSuccesses: 0,
    failureThreshold: 3,
    recoveryThreshold: 2,
    lastObservationResult: "HTTP_ERROR",
  });
  assert(
    t2.nextHealth === "UNAVAILABLE" && t2.shouldOpenIncident,
    "Consecutive failures reaching threshold transitions to UNAVAILABLE and opens incident"
  );

  // Transition: 1 success while UNAVAILABLE with recoveryThreshold 2 -> Still UNAVAILABLE
  const t3 = evaluateGuardianStateTransition({
    currentHealth: "UNAVAILABLE",
    consecutiveFailures: 0,
    consecutiveSuccesses: 1,
    failureThreshold: 3,
    recoveryThreshold: 2,
    lastObservationResult: "HEALTHY",
  });
  assert(
    t3.nextHealth === "UNAVAILABLE" && !t3.shouldResolveIncident,
    "1 success does not prematurely resolve incident before recovery threshold"
  );

  // Transition: 2 successes reaching recoveryThreshold 2 -> HEALTHY, resolves incident
  const t4 = evaluateGuardianStateTransition({
    currentHealth: "UNAVAILABLE",
    consecutiveFailures: 0,
    consecutiveSuccesses: 2,
    failureThreshold: 3,
    recoveryThreshold: 2,
    lastObservationResult: "HEALTHY",
  });
  assert(
    t4.nextHealth === "HEALTHY" && t4.shouldResolveIncident,
    "Reaching recovery threshold transitions to HEALTHY and resolves incident"
  );

  // 4. Compact Signal Compilation for Edge Resolver
  console.log("\n--- 4. Edge Resolver Compact Signal Compilation Tests ---");

  const healthySignal = compilePublishedHealthSignal(null, 120);
  assert(
    healthySignal.isPrimaryHealthy === true && healthySignal.activeIncidentsCount === 0,
    "Compiles healthy compact signal when no active incidents"
  );

  const incidentSignal = compilePublishedHealthSignal(
    {
      id: "inc_123",
      qrId: "qr_123",
      status: "OPEN",
      failureReason: "HTTP 503",
      fallbackTriggered: true,
      startedAt: Date.now(),
    },
    850
  );
  assert(
    incidentSignal.isPrimaryHealthy === false && incidentSignal.activeIncidentsCount === 1,
    "Compiles unhealthy signal directing QR Brain to fallback when open incident exists"
  );

  // 5. Contract Schema Validation
  console.log("\n--- 5. Zod Contract Schema Validation Tests ---");

  const monitorValidation = CreateGuardianMonitorRequestV1Schema.safeParse({
    destinationUrl: "https://shop.example.com",
    name: "E-Commerce Shop",
    checkIntervalSec: 300,
    failureThreshold: 3,
    recoveryThreshold: 2,
    autoSwitch: true,
  });
  assert(monitorValidation.success, "CreateGuardianMonitorRequestV1Schema validates clean payload");

  const fallbackValidation = ConfigureFallbackRequestV1Schema.safeParse({
    backupUrl: "https://status.example.com",
    autoSwitch: true,
    failureThreshold: 3,
  });
  assert(fallbackValidation.success, "ConfigureFallbackRequestV1Schema validates clean payload");

  const pulseValidation = GuardianPulseMetricsV1Schema.safeParse({
    monitoredCount: 10,
    healthyCount: 8,
    degradedCount: 1,
    unavailableCount: 1,
    pausedCount: 0,
    openIncidentsCount: 1,
    lastSignalPublishedAt: new Date().toISOString(),
  });
  assert(pulseValidation.success, "GuardianPulseMetricsV1Schema validates pulse aggregation");

  // 6. Domain URL Rule Invariant Verification
  console.log("\n--- 6. Domain URL Rule Invariant Verification ---");

  const guardianFiles = [
    "app/api/v1/guardian/route.ts",
    "lib/domains/guardian/index.ts",
    "lib/supabase/repositories/guardian.ts",
    "packages/contracts/src/api/v1/guardian.ts",
    "components/guardian/guardian-page-client.tsx",
    "components/guardian/guardian-header.tsx",
    "components/guardian/guardian-pulse.tsx",
    "components/guardian/guardian-health-rail.tsx",
    "components/guardian/destination-health-matrix.tsx",
    "components/guardian/health-ribbon.tsx",
    "components/guardian/incident-timeline.tsx",
    "components/guardian/recovery-path.tsx",
    "components/guardian/monitors-registry.tsx",
  ];

  let nxtqrLinkFound = false;
  for (const relPath of guardianFiles) {
    const fullPath = path.resolve(__dirname, "..", relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes("nxtqr.link")) {
        console.error(`Found forbidden 'nxtqr.link' in ${relPath}`);
        nxtqrLinkFound = true;
      }
    }
  }
  assert(!nxtqrLinkFound, "Zero occurrences of forbidden 'nxtqr.link' in all Guardian files");

  console.log("\n=======================================================");
  console.log(`TEST SUITE RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
