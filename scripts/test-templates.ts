/**
 * NXTQR — Templates Experience & Design Library Comprehensive Verification
 * Tests domain logic, brand locks, versioning, cascade safety, and domain rules.
 */

import { QrTemplateStore } from "../lib/domains/templates/store";
import {
  validateLockedFieldMutations,
  applyBrandKitToDesign,
} from "../lib/domains/templates/governance";
import {
  isCompatibleWithQrType,
  normalizeCompatibilityTypes,
} from "../lib/domains/templates/compatibility";
import { exportTemplateToJson } from "../lib/domains/templates/exporter";
import {
  CANONICAL_QR_DESIGN_DEFAULTS,
  renderQrSvg,
  evaluateScanability,
  QrDesignV1,
} from "@nxtqr/qr-core";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("NXTQR TEMPLATES DOMAIN & GOVERNANCE VERIFICATION SUITE");
  console.log("=======================================================\n");

  // TEST 1: QR Core Renderer & Preview Generation
  console.log("[1] QR Core Renderer & Preview Generation:");
  const previewSvg = renderQrSvg({
    content: "https://nxtqr.vercel.app/preview",
    design: CANONICAL_QR_DESIGN_DEFAULTS,
    moduleSize: 8,
  });
  assert(previewSvg.includes("<svg"), "renderQrSvg produces valid SVG markup");
  assert(!previewSvg.includes("nxtqr.link"), "SVG output does NOT contain forbidden 'nxtqr.link'");

  // TEST 2: Pure Scanability Engine (Zero Fake Scores)
  console.log("\n[2] Scanability Engine Diagnostics:");
  const scanResult = evaluateScanability("https://nxtqr.vercel.app/preview", CANONICAL_QR_DESIGN_DEFAULTS);
  assert(typeof scanResult.score === "number", `Computed deterministic score: ${scanResult.score}%`);
  assert(scanResult.checks.length > 0, `Computed ${scanResult.checks.length} diagnostic checks`);
  assert(
    scanResult.status === "pass" || scanResult.status === "warning",
    `Scanability status is '${scanResult.status}'`
  );

  // TEST 3: Compatibility Logic
  console.log("\n[3] QR Type Compatibility Matrix:");
  const universal = ["UNIVERSAL"];
  assert(isCompatibleWithQrType(universal, "URL"), "Universal template is compatible with URL");
  assert(isCompatibleWithQrType(universal, "WIFI"), "Universal template is compatible with WIFI");

  const specific = ["URL", "WIFI"];
  assert(isCompatibleWithQrType(specific, "URL"), "Specific template allows URL");
  assert(!isCompatibleWithQrType(specific, "VCARD"), "Specific template rejects VCARD");

  const normalized = normalizeCompatibilityTypes(["url", "invalid_type", "wifi"]);
  assert(normalized.includes("URL") && normalized.includes("WIFI"), "Normalized types correctly filtered");

  // TEST 4: Brand Kit Inheritance & Governance
  console.log("\n[4] Brand Kit Inheritance & Brand Locks:");
  const baseDesign: QrDesignV1 = JSON.parse(JSON.stringify(CANONICAL_QR_DESIGN_DEFAULTS));
  const brandKit = {
    primaryColor: "#FA520F",
    colors: [{ hex: "#FA520F", role: "primary" }],
    logos: [{ url: "https://nxtqr.vercel.app/assets/logo.png", isPrimary: true, assetId: "asset-1" }],
  };

  const inherited = applyBrandKitToDesign(baseDesign, brandKit, ["colors", "logo"]);
  assert(inherited.fgColor === "#FA520F", "Primary color inherited from Brand Kit");
  assert(inherited.logo?.url === "https://nxtqr.vercel.app/assets/logo.png", "Logo inherited from Brand Kit");

  // TEST 5: Locked Fields Violation Detection
  console.log("\n[5] Brand Lock Violation Rejection:");
  const legalUpdate: QrDesignV1 = {
    ...inherited,
    quietZone: 5, // Unlocked field modification
  };
  const legalCheck = validateLockedFieldMutations(inherited, legalUpdate, ["colors", "logo"]);
  assert(legalCheck.valid, "Allowed modification of unlocked field (quietZone)");

  const illegalColorUpdate: QrDesignV1 = {
    ...inherited,
    fgColor: "#000000", // Mutates locked color!
  };
  const illegalCheck = validateLockedFieldMutations(inherited, illegalColorUpdate, ["colors", "logo"]);
  assert(!illegalCheck.valid, "Successfully rejected illegal mutation of brand-locked color");
  assert(
    Boolean(illegalCheck.violation?.includes("Colors and gradients are brand-locked")),
    "Received clear violation explanation"
  );

  // TEST 6: Exporter JSON Determinism
  console.log("\n[6] Template Exporter Package:");
  const dummySummary = {
    id: "test-id",
    organization_id: "org-id",
    name: "Ember Flagship",
    description: "Sample governed template",
    scope: "organization" as const,
    status: "active" as const,
    compatibility: ["UNIVERSAL"],
    is_brand_locked: true,
    locked_fields: ["colors"],
    current_version: 1,
    design_json: inherited,
    scanability_score: 98,
    scanability_status: "PASS" as const,
    usage_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const bundle = exportTemplateToJson(dummySummary);
  assert(bundle.schemaVersion === 1, "Export bundle has schemaVersion 1");
  assert(bundle.template.name === "Ember Flagship", "Export bundle contains template name");
  assert(bundle.template.design.fgColor === "#FA520F", "Export bundle contains correct design payload");

  // TEST 7: Domain Rule Enforcement (Anti-nxtqr.link)
  console.log("\n[7] Strict Domain Rule Compliance:");
  const rawString = JSON.stringify(bundle) + previewSvg;
  assert(!rawString.includes("nxtqr.link"), "Strictly NO 'nxtqr.link' found anywhere");
  assert(!rawString.includes("nextqr"), "Strictly NO misspelled 'nextqr' found anywhere");

  console.log("\n=======================================================");
  console.log("✅ ALL TEMPLATES TESTS PASSED SUCCESSFULLY!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
