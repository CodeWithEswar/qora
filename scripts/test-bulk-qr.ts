import {
  parseBulkCsv,
  generateCanonicalBulkTemplate,
  autoDetectColumnMapping,
  normalizeParsedRows,
  validateBulkRowPayload,
  computeValidationGateMetrics,
  generateBulkManifestSummary,
  generateBulkResultsCsv,
} from "../lib/domains/bulk-qr";
import { CANONICAL_QR_DESIGN_DEFAULTS, evaluateScanability } from "@nxtqr/qr-core";
import { siteConfig } from "@nxtqr/config";

async function runTests() {
  console.log("=== NXTQR BULK QR SYSTEM INTEGRATION TEST ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Template Generation & Parsing
  console.log("\n--- Test 1: Canonical Template Generation & Parsing ---");
  const templateCsv = generateCanonicalBulkTemplate();
  assert(templateCsv.includes("name,type,destination,campaign,folder,notes"), "Template contains required headers");
  assert(templateCsv.includes("Summer Campaign 2026"), "Template contains sample data row");

  const parsedTemplate = await parseBulkCsv(templateCsv);
  assert(parsedTemplate.headers.includes("name") && parsedTemplate.headers.includes("destination"), "Template parsed headers correctly");
  assert(parsedTemplate.rows.length >= 2, "Template parsed at least 2 sample rows");

  // 2. RFC 4180 Handling (Quoted commas, quotes)
  console.log("\n--- Test 2: RFC 4180 CSV Compliant Parsing ---");
  const complexCsv = `qr_name,destination_url,qr_type\n"Special, Name with Comma","https://example.com/test?a=1&b=2",url\n"Escaped ""Quotes"" Title","https://example.com/quote",url`;
  const parsedComplex = await parseBulkCsv(complexCsv);
  assert(parsedComplex.rows[0]["qr_name"] === "Special, Name with Comma", "Parsed quoted comma correctly");
  assert(parsedComplex.rows[1]["qr_name"] === 'Escaped "Quotes" Title', "Parsed escaped quotes correctly");

  // 3. Formula Injection Sanitization
  console.log("\n--- Test 3: Spreadsheet Formula Injection Sanitization ---");
  const formulaCsv = `qr_name,destination_url,qr_type\n"=SUM(A1:A10)","https://example.com",url\n"+cmd|'/c calc'!A1","https://example.com",url\n"@evil_formula","https://example.com",url`;
  const parsedFormula = await parseBulkCsv(formulaCsv);
  assert(parsedFormula.rows[0]["qr_name"].startsWith("'="), "Sanitized leading '=' formula symbol");
  assert(parsedFormula.rows[1]["qr_name"].startsWith("'+"), "Sanitized leading '+' formula symbol");
  assert(parsedFormula.rows[2]["qr_name"].startsWith("'@"), "Sanitized leading '@' formula symbol");

  // 4. Auto-detect Column Mapping
  console.log("\n--- Test 4: Header Auto-Detection ---");
  const testHeaders = ["QR Title", "Website URL", "Category", "Folder Name"];
  const mapping = autoDetectColumnMapping(testHeaders);
  assert(mapping.name === "QR Title", "Auto-detected name from 'QR Title'");
  assert(mapping.destination_url === "Website URL", "Auto-detected destination from 'Website URL'");
  assert(mapping.qr_type === "Category", "Auto-detected qr_type from 'Category'");
  assert(mapping.folder === "Folder Name", "Auto-detected folder from 'Folder Name'");

  // 5. Normalization Pipeline
  console.log("\n--- Test 5: Normalization Pipeline ---");
  const rawRows = [
    { "QR Title": "   Trimmed Name   ", "Website URL": "product.example.com", "Category": "website" },
    { "QR Title": "SMS Alert", "Website URL": "+1234567890", "Category": "phone" },
  ];
  const normalized = normalizeParsedRows(rawRows, mapping);
  assert(normalized[0].name === "Trimmed Name", "Whitespace trimmed");
  assert(normalized[0].destination_url === "https://product.example.com", "Prepended https:// to bare domain");
  assert(normalized[0].qr_type === "url", "Normalized 'website' alias to 'url'");
  assert(normalized[1].qr_type === "phone", "Preserved phone type");

  // 6. Preflight Validation & SSRF Check
  console.log("\n--- Test 6: Preflight Validation & Security Checks ---");
  // A: Valid Row
  const validRes = validateBulkRowPayload(
    { name: "Valid Asset", qr_type: "url", destination_url: "https://nxtqr.vercel.app" },
    1
  );
  assert(validRes.validationStatus === "READY", "Valid URL marked as READY");

  // B: Missing Name (Blocked)
  const noNameRes = validateBulkRowPayload(
    { name: "", qr_type: "url", destination_url: "https://example.com" },
    2
  );
  assert(noNameRes.validationStatus === "BLOCKED", "Missing name marked as BLOCKED");

  // C: Malformed URL (Blocked)
  const badUrlRes = validateBulkRowPayload(
    { name: "Broken URL", qr_type: "url", destination_url: "htt p : // bad url" },
    3
  );
  assert(badUrlRes.validationStatus === "BLOCKED", "Malformed URL marked as BLOCKED");

  // D: SSRF Loopback (Blocked)
  const ssrfRes = validateBulkRowPayload(
    { name: "Localhost Attack", qr_type: "url", destination_url: "http://localhost:3000/admin" },
    4
  );
  assert(ssrfRes.validationStatus === "BLOCKED", "SSRF localhost destination blocked");

  const ssrfIpRes = validateBulkRowPayload(
    { name: "Private IP Attack", qr_type: "url", destination_url: "http://127.0.0.1:8080" },
    5
  );
  assert(ssrfIpRes.validationStatus === "BLOCKED", "SSRF private IP destination blocked");

  // E: Warning (High Density Content)
  const longUrl = "https://example.com/very/long/path/with/massive/query/params?tracking_token=" + "a".repeat(1200);
  const warnRes = validateBulkRowPayload(
    { name: "High Density Asset", qr_type: "url", destination_url: longUrl },
    6
  );
  assert(warnRes.validationStatus === "WARNING", "Extremely dense QR payload marked as WARNING");

  // 7. Validation Gate Metrics
  console.log("\n--- Test 7: Validation Gate Metrics ---");
  const allResults = [validRes, noNameRes, badUrlRes, ssrfRes, ssrfIpRes, warnRes];
  const metrics = computeValidationGateMetrics(allResults);
  assert(metrics.totalRows === 6, `Metrics totalRows matches (6): ${metrics.totalRows}`);
  assert(metrics.readyRows === 1, `Metrics readyRows matches (1): ${metrics.readyRows}`);
  assert(metrics.warningRows === 1, `Metrics warningRows matches (1): ${metrics.warningRows}`);
  assert(metrics.blockedRows === 4, `Metrics blockedRows matches (4): ${metrics.blockedRows}`);

  // 8. Batch Manifest Generation
  console.log("\n--- Test 8: Manifest Summary Generation ---");
  const manifest = generateBulkManifestSummary(allResults);
  assert(manifest.totalRows === 6, "Manifest contains 6 rows");
  assert(manifest.qrTypesBreakdown["url"] === 6, "Manifest tracks type breakdown");

  // 9. Scanability Engine Integration
  console.log("\n--- Test 9: Scanability Engine Integration ---");
  const scanResult = evaluateScanability("https://nxtqr.vercel.app/test", CANONICAL_QR_DESIGN_DEFAULTS);
  assert((scanResult.score ?? 0) >= 80, `Canonical design scores >= 80 (Actual: ${scanResult.score})`);
  assert(scanResult.status === "pass" || scanResult.status === "notice", `Status is valid: ${scanResult.status}`);

  // 10. Domain Policy Rule Verification
  console.log("\n--- Test 10: Strict NXTQR Domain Policy Audit ---");
  const exportRows = [
    {
      id: "row-1",
      organization_id: "org-1",
      batch_id: "batch-1",
      source_row_number: 1,
      normalized_payload: { name: "Test QR", qr_type: "url" as const, destination_url: "https://example.com" },
      validation_status: "READY" as const,
      execution_status: "CREATED" as const,
      qr_id: "qr-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  const exportCsv = generateBulkResultsCsv(exportRows);
  assert(!exportCsv.includes("nxtqr.link"), "Export results CSV contains NO 'nxtqr.link'");
  assert(!exportCsv.includes("nextqr"), "Export results CSV contains NO 'nextqr'");
  assert(exportCsv.includes("https://nxtqr.vercel.app/s/qr-123"), "Export results CSV uses canonical resolver route");

  console.log("\n==========================================");
  console.log(`TOTAL: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
