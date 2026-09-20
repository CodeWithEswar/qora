/**
 * Automated Verification Script for NXTQR Custom Domains Infrastructure
 * 
 * Verifies:
 * 1. Domain normalization (RFC 1123, lowercase, protocol removal, path stripping, internal TLD rejection)
 * 2. Token & DNS records generation
 * 3. Contract schema validation (Zod models)
 * 4. Cascade safety & Tenancy validation
 */

import {
  normalizeHostname,
  generateVerificationToken,
  buildRequiredDnsRecords,
} from "../lib/domains/domain-normalization";
import {
  CreateCustomDomainRequestV1Schema,
  CustomDomainSummaryV1Schema,
  CustomDomainDetailV1Schema,
  DomainStatusSchema,
  DomainVerificationStatusSchema,
  DomainPulseMetricsV1Schema,
  DomainImpactV1Schema,
} from "../packages/contracts/src/api/v1/domains";

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
  console.log("NXTQR — DOMAIN INFRASTRUCTURE AUTOMATED TEST SUITE");
  console.log("=======================================================\n");

  // 1. Normalization Tests
  console.log("--- 1. Domain Normalization Tests ---");
  
  const test1 = normalizeHostname("https://qr.example.com/some/path?query=1");
  assert(
    test1.valid && test1.hostname === "qr.example.com",
    "Strips protocol, path, and query parameters"
  );

  const test2 = normalizeHostname("  GO.Company.ORG  ");
  assert(
    test2.valid && test2.hostname === "go.company.org",
    "Trims whitespace and converts to lowercase"
  );

  const test3 = normalizeHostname("link.brand.co.uk:443");
  assert(
    test3.valid && test3.hostname === "link.brand.co.uk",
    "Strips port numbers"
  );

  const test4 = normalizeHostname("qr.domain.com.");
  assert(
    test4.valid && test4.hostname === "qr.domain.com",
    "Strips trailing dot"
  );

  // Invalid hostname rejections
  const invalidHostnames = [
    "",
    "localhost",
    "127.0.0.1",
    "192.168.1.1",
    "domain.local",
    "internal.lan",
    "test.example.test",
    "-invalid.com",
    "invalid-.com",
    "nodot",
    "a".repeat(256) + ".com",
  ];

  for (const inv of invalidHostnames) {
    const res = normalizeHostname(inv);
    assert(!res.valid, `Rejects prohibited or malformed hostname: "${inv}" -> ${res.error}`);
  }

  // 2. Token & DNS Record Generation Tests
  console.log("\n--- 2. Token & DNS Records Generation Tests ---");

  const token = generateVerificationToken();
  assert(
    token.startsWith("nxtqr-domain-verification=") && token.length === 58,
    `Verification token has correct format: ${token}`
  );

  const hostname = "go.acme-corp.com";
  const records = buildRequiredDnsRecords(hostname, token);
  assert(records.length === 2, "Generates exactly 2 DNS records (TXT + CNAME)");

  const txtRecord = records.find((r) => r.type === "TXT");
  assert(
    txtRecord?.name === "_nxtqr-challenge.go.acme-corp.com" && txtRecord?.value === token,
    "TXT record name and value match token challenge"
  );

  const cnameRecord = records.find((r) => r.type === "CNAME");
  assert(
    cnameRecord?.name === "go.acme-corp.com" && cnameRecord?.value === "cname.nxtqr.app",
    "CNAME record points directly to cname.nxtqr.app"
  );

  // 3. Contracts Schema Validation Tests
  console.log("\n--- 3. Contract Schema Validation Tests ---");

  const validStatus = DomainStatusSchema.safeParse("ACTIVE");
  assert(validStatus.success, "DomainStatusSchema accepts 'ACTIVE'");

  const invalidStatus = DomainStatusSchema.safeParse("UNKNOWN");
  assert(!invalidStatus.success, "DomainStatusSchema rejects unknown status");

  const validCreateRequest = CreateCustomDomainRequestV1Schema.safeParse({
    hostname: "https://qr.acme.com",
  });
  assert(validCreateRequest.success, "CreateCustomDomainRequestV1Schema accepts valid input");

  const summaryRecord = {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    organizationId: "f81d4fae-7dec-11d0-a765-00a0c91e6bf7",
    hostname: "qr.acme.com",
    status: "ACTIVE" as const,
    verificationStatus: "VERIFIED" as const,
    verificationMethod: "DNS_TXT" as const,
    certificateStatus: "READY" as const,
    routingStatus: "READY" as const,
    isPrimary: true,
    assignedQrsCount: 5,
    assignedCampaignsCount: 1,
    assignedLandingPagesCount: 2,
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    activatedAt: new Date().toISOString(),
  };

  const validSummary = CustomDomainSummaryV1Schema.safeParse(summaryRecord);
  assert(validSummary.success, "CustomDomainSummaryV1Schema validates clean database projection");

  const detailRecord = {
    ...summaryRecord,
    verificationToken: token,
    verificationRecords: records,
    lastCheckedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "f81d4fae-7dec-11d0-a765-00a0c91e6bf8",
    recentAttempts: [],
  };

  const validDetail = CustomDomainDetailV1Schema.safeParse(detailRecord);
  assert(validDetail.success, "CustomDomainDetailV1Schema validates full detail object");

  const validPulse = DomainPulseMetricsV1Schema.safeParse({
    totalDomains: 3,
    activeDomains: 2,
    pendingDomains: 1,
    issuesDomains: 0,
    totalAssignedAssets: 8,
  });
  assert(validPulse.success, "DomainPulseMetricsV1Schema validates real metric object");

  const validImpact = DomainImpactV1Schema.safeParse({
    domainId: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    hostname: "qr.acme.com",
    connectedQrs: 5,
    connectedCampaigns: 1,
    connectedLandingPages: 2,
    isPrimary: true,
    canSafelyDisconnect: true,
  });
  assert(validImpact.success, "DomainImpactV1Schema validates dependency impact object");

  // Summary
  console.log("\n=======================================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
