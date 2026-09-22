/**
 * NXTQR — Audit Intelligence Ledger Test Suite
 * Validates domain compliance, secret redaction, event taxonomy,
 * contracts schemas, Supabase DB columns & indexes, temporal density calculations,
 * and sanitized evidence export.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Load environment variables from .env.local if present
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

// Polyfill/stub "server-only" for tsx CLI execution
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as any;
} catch (e) {
  // If resolution fails, proceed normally
}

import {
  AuditFilterParamsSchema,
  ExportAuditLogsDtoSchema,
} from "../packages/contracts/src";
import { createAdminClient } from "../lib/supabase/admin";

async function runAuditIntelligenceTests() {
  const {
    redactSensitiveData,
    normalizeAuditAction,
    SupabaseAuditRepository,
  } = await import("../lib/supabase/repositories/audit");
  console.log("=======================================================");
  console.log("NXTQR — AUDIT INTELLIGENCE LEDGER TEST SUITE");
  console.log("=======================================================\n");

  // --- Test 1: Strict Domain Compliance ---
  console.log("--- 1. Strict Domain Compliance ---");
  const forbiddenDomainRegex = /nxtqr\.link/i;
  const auditDirs = [
    path.resolve(__dirname, "../components/audit"),
    path.resolve(__dirname, "../app/api/v1/organizations/[orgSlug]/audit"),
  ];
  const auditFiles = [
    path.resolve(__dirname, "../lib/supabase/repositories/audit.ts"),
    path.resolve(__dirname, "../packages/contracts/src/audit.ts"),
    path.resolve(__dirname, "../app/(dashboard)/[orgSlug]/audit/page.tsx"),
  ];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
        const content = fs.readFileSync(fullPath, "utf8");
        assert(
          !forbiddenDomainRegex.test(content),
          `CRITICAL: Forbidden domain 'nxtqr.link' detected in file: ${fullPath}`
        );
      }
    }
  }

  for (const dir of auditDirs) {
    scanDirectory(dir);
  }
  for (const file of auditFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      assert(
        !forbiddenDomainRegex.test(content),
        `CRITICAL: Forbidden domain 'nxtqr.link' detected in file: ${file}`
      );
    }
  }
  console.log("✓ Zero references to 'nxtqr.link' in any audit components, APIs, or contracts.");

  // --- Test 2: Recursive Secret Redaction ---
  console.log("\n--- 2. Recursive Secret Redaction ---");
  const unredactedPayload = {
    user: "admin@nxtqr.com",
    role: "ADMIN",
    password: "super-secret-password-123",
    authContext: {
      token: "jwt-header.payload.signature",
      access_token: "bearer-token-val",
      refreshToken: "refresh-token-val",
      apiKey: "sk_live_99887766554433221100",
      cookieHeader: "session_id=abc123secret",
      cashfree_secret: "cf_sec_abcdef123456",
      webhook_secret: "whsec_778899aabbcc",
      nested: {
        deep_secret_value: "hidden_treasure",
        safeValue: "public-metadata",
      },
    },
    items: [
      { id: "1", client_secret: "secret-1", label: "Item 1" },
      { id: "2", normalField: "ok" },
    ],
  };

  const sanitized = redactSensitiveData(unredactedPayload);

  assert.strictEqual(sanitized.user, "admin@nxtqr.com");
  assert.strictEqual(sanitized.role, "ADMIN");
  assert.strictEqual(sanitized.password, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.token, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.access_token, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.refreshToken, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.apiKey, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.cookieHeader, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.cashfree_secret, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.webhook_secret, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.nested.deep_secret_value, "[REDACTED]");
  assert.strictEqual(sanitized.authContext.nested.safeValue, "public-metadata");
  assert.strictEqual(sanitized.items[0].client_secret, "[REDACTED]");
  assert.strictEqual(sanitized.items[0].label, "Item 1");
  assert.strictEqual(sanitized.items[1].normalField, "ok");
  console.log("✓ Deep secret redaction successfully stripped all credentials, keys, tokens, and secrets.");

  // --- Test 3: Action Normalization & Taxonomy ---
  console.log("\n--- 3. Action Normalization & Taxonomy ---");
  const testActions = [
    { action: "member.role_changed", expectedCat: "access" },
    { action: "role.created", expectedCat: "access" },
    { action: "qr.published", expectedCat: "content" },
    { action: "routing.published", expectedCat: "content" },
    { action: "domain.verified", expectedCat: "infrastructure" },
    { action: "api_key.created", expectedCat: "developer" },
    { action: "billing.subscription_changed", expectedCat: "billing" },
    { action: "unknown.event", expectedCat: "system" },
  ];

  for (const { action, expectedCat } of testActions) {
    const { label, category } = normalizeAuditAction(action);
    assert.strictEqual(category, expectedCat, `Action ${action} should map to category ${expectedCat}`);
    assert.ok(label.length > 0, `Action ${action} must have a non-empty human label`);
  }
  console.log("✓ Canonical action taxonomy maps accurately to 6 categories (access, content, infra, developer, billing, system).");

  // --- Test 4: Zod Contract Schemas ---
  console.log("\n--- 4. Zod Contract Schemas ---");
  const parsedFilters = AuditFilterParamsSchema.parse({
    range: "7d",
    lens: "access",
    result: "success",
    limit: 25,
    myActions: true,
  });
  assert.strictEqual(parsedFilters.range, "7d");
  assert.strictEqual(parsedFilters.lens, "access");
  assert.strictEqual(parsedFilters.result, "success");
  assert.strictEqual(parsedFilters.limit, 25);
  assert.strictEqual(parsedFilters.myActions, true);

  const parsedExport = ExportAuditLogsDtoSchema.parse({
    format: "csv",
    range: "30d",
  });
  assert.strictEqual(parsedExport.format, "csv");
  console.log("✓ Audit filter and export DTO schemas successfully validated.");

  // --- Test 5: Live Supabase PostgreSQL Verification ---
  console.log("\n--- 5. Live Supabase PostgreSQL Database Invariants ---");
  const supabase = createAdminClient();

  // Check columns of public.audit_logs
  const { data: cols, error: colErr } = await supabase
    .from("audit_logs")
    .select("id, actor_type, actor_snapshot, target_type, target_id, target_snapshot, category, result, source, request_id, correlation_id, changes, authorization_context")
    .limit(1);

  assert(!colErr, `Failed to query audit_logs columns: ${colErr?.message}`);
  console.log("✓ Supabase audit_logs schema verified with all forensic evidence columns.");

  // Retrieve an existing organization to test against
  const { data: orgs, error: orgErr } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .limit(1);

  assert(!orgErr && orgs && orgs.length > 0, "At least one organization required in DB for live test.");
  const testOrg = orgs[0];
  console.log(`✓ Testing live audit ledger against organization: ${testOrg.name} (${testOrg.slug})`);

  // Query an existing profile if available, or use null for system actor
  const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
  const testActorId = profiles && profiles.length > 0 ? profiles[0].id : null;

  // Record a high-fidelity audit event
  await SupabaseAuditRepository.recordEvent({
    organizationId: testOrg.id,
    action: "member.role_changed",
    category: "access",
    actorType: testActorId ? "user" : "system",
    actorId: testActorId,
    actorSnapshot: {
      name: "Security Auditor",
      email: "auditor@nxtqr.vercel.app",
    },
    targetType: "member",
    targetId: "00000000-0000-0000-0000-000000000002",
    targetSnapshot: {
      name: "Chintu Kumar",
      identifier: "chintu@example.com",
    },
    result: "success",
    source: "web",
    requestId: "req_audit_test_001",
    correlationId: "corr_audit_batch_001",
    changes: {
      before: { role: "Member" },
      after: { role: "Admin" },
    },
    authorization: {
      permission: "member.update_role",
      decision: "allowed",
    },
    metadata: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "127.0.0.1",
      apiKeyUsed: "sk_test_12345secret", // Must be redacted
    },
  });
  console.log("✓ Successfully recorded forensic audit event.");

  // Query ledger overview
  const overview = await SupabaseAuditRepository.getAuditLedgerOverview(testOrg.slug, {
    range: "30d",
  });

  assert.ok(overview.metrics.totalEvents >= 1, "Total events in signal rail must be >= 1");
  assert.ok(overview.density.length === 12, "Density strip must produce exactly 12 temporal buckets");
  assert.ok(overview.events.length > 0, "Audit ledger must return at least one event");
  console.log(`✓ Audit Signal Rail Metrics: ${overview.metrics.totalEvents} events, ${overview.metrics.totalActors} actors, ${overview.metrics.failedOperations} failed operations.`);

  // Find the recorded event
  const foundEvent = overview.events.find((e) => e.action === "member.role_changed" && e.request?.requestId === "req_audit_test_001");
  assert(foundEvent, "Recorded event must be present in retrieved overview");
  assert.strictEqual(
    (foundEvent.rawMetadata as any)?.apiKeyUsed,
    "[REDACTED]",
    "Secret in metadata must be automatically redacted upon retrieval"
  );
  console.log("✓ Event metadata redaction verified in overview response.");

  // Query single event detail
  const eventDetail = await SupabaseAuditRepository.getAuditEventDetail(testOrg.id, foundEvent.id);
  assert(eventDetail, "Event detail must be queryable");
  assert.strictEqual(eventDetail.changes?.length, 1);
  assert.strictEqual(eventDetail.changes[0].field, "role");
  assert.strictEqual(eventDetail.changes[0].before, "Member");
  assert.strictEqual(eventDetail.changes[0].after, "Admin");
  console.log("✓ Event detail and changeset diff verified.");

  // Query investigation context
  const investigation = await SupabaseAuditRepository.getInvestigationContext(testOrg.id, foundEvent.id);
  assert(investigation, "Investigation context must be returned");
  assert.strictEqual(investigation.event.id, foundEvent.id);
  console.log(`✓ Investigation context: ${investigation.sameActorEvents.length} same-actor events, ${investigation.sameTargetEvents.length} same-target events.`);

  // Query correlated trace
  const trace = await SupabaseAuditRepository.getCorrelatedTrace(testOrg.id, "corr_audit_batch_001");
  assert(trace.length >= 1, "Correlated trace must find the recorded event");
  console.log(`✓ Correlated trace verified for correlation_id: corr_audit_batch_001.`);

  // Test Export Functionality
  const csvExport = await SupabaseAuditRepository.exportAuditEvidence(testOrg.id, {
    format: "csv",
    range: "30d",
  });
  assert(csvExport.mimeType === "text/csv");
  assert(csvExport.content.includes("Timestamp,Event ID,Actor Type,Actor Name,Action,Category,Target Type,Target Name,Result"));
  assert(csvExport.content.includes("member.role_changed"));
  console.log("✓ CSV export generation verified.");

  const jsonExport = await SupabaseAuditRepository.exportAuditEvidence(testOrg.id, {
    format: "json",
    range: "30d",
  });
  assert(jsonExport.mimeType === "application/json");
  const parsedJsonExport = JSON.parse(jsonExport.content);
  assert(Array.isArray(parsedJsonExport));
  assert(parsedJsonExport.length >= 1);
  console.log("✓ JSON export generation verified.");

  console.log("\n=======================================================");
  console.log("ALL NXTQR AUDIT INTELLIGENCE LEDGER TESTS PASSED!");
  console.log("=======================================================");
}

runAuditIntelligenceTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
