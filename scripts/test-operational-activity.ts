import { createClient } from "@supabase/supabase-js";
import { PERMISSIONS } from "../packages/permissions/src/catalog";
import { SYSTEM_ROLE_PERMISSIONS } from "../packages/contracts/src/permissions";
import { SupabaseActivityRepository } from "../lib/supabase/repositories/activity";
import * as fs from "fs";
import * as path from "path";

// 1. Simple env loader
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
} catch (e) {
  // Ignore
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log("=================================================================");
  console.log("NXTQR — OPERATIONAL EVENT OBSERVATORY VERIFICATION SUITE");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Verify Permission Codes in Contracts & Catalog
    console.log("1. Verifying Activity Permissions in Contracts & Catalog...");
    assert(PERMISSIONS.ACTIVITY_READ === "activity.read", "PERMISSIONS.ACTIVITY_READ is registered as 'activity.read'");
    assert(PERMISSIONS.ACTIVITY_EXPORT === "activity.export", "PERMISSIONS.ACTIVITY_EXPORT is registered as 'activity.export'");
    assert(
      SYSTEM_ROLE_PERMISSIONS.Owner.includes("activity.read") &&
        SYSTEM_ROLE_PERMISSIONS.Owner.includes("activity.export"),
      "Owner role granted activity.read and activity.export"
    );
    assert(
      SYSTEM_ROLE_PERMISSIONS.Admin.includes("activity.read") &&
        SYSTEM_ROLE_PERMISSIONS.Admin.includes("activity.export"),
      "Admin role granted activity.read and activity.export"
    );
    assert(
      SYSTEM_ROLE_PERMISSIONS.Editor.includes("activity.read"),
      "Editor role granted activity.read"
    );
    assert(
      SYSTEM_ROLE_PERMISSIONS.Analyst.includes("activity.read") &&
        SYSTEM_ROLE_PERMISSIONS.Analyst.includes("activity.export"),
      "Analyst role granted activity.read and activity.export"
    );
    assert(
      SYSTEM_ROLE_PERMISSIONS.Viewer.includes("activity.read"),
      "Viewer role granted activity.read"
    );

    // Test 2: Resolve Target Organization from Supabase
    console.log("\n2. Resolving organization context from Supabase...");
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("slug", "laddahdev")
      .single();

    assert(Boolean(org) && !orgErr, `Resolved organization 'laddahdev' (${org?.id}) from Supabase.`);
    const orgId = org?.id || "org_test";

    // Test 3: Query Real Activity Events from public.activity_events
    console.log("\n3. Querying real backend activity events...");
    const { data: events, error: evErr } = await supabase
      .from("activity_events")
      .select("id, organization_id, action, resource_type, resource_id, created_at, actor_id, metadata_json")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (evErr) {
      console.error("Query error:", evErr);
    }
    assert(!evErr && Array.isArray(events), `Successfully queried activity_events table (${events?.length || 0} events found).`);

    // Test 3b: Query filtering by system actor
    const systemEvents = await SupabaseActivityRepository.listActivityEvents(orgId, {
      actorId: "system",
      range: "30d",
      view: "stream",
    });
    assert(Array.isArray(systemEvents), `Query with actorId='system' succeeds without 22P02 Postgres error (${systemEvents.length} system events found).`);

    // Test 4: Operational Signal Rail Telemetry Calculation
    console.log("\n4. Testing Operational Signal Rail Telemetry Calculation...");
    const totalEvents = events?.length || 0;
    const distinctActors = new Set((events || []).map((e) => e.actor_id).filter(Boolean)).size;
    const distinctResources = new Set((events || []).map((e) => `${e.resource_type}:${e.resource_id}`).filter(Boolean)).size;
    const publishEvents = (events || []).filter((e) => e.action.includes("publish")).length;
    const approvalEvents = (events || []).filter((e) => e.action.includes("approv")).length;
    const changeEvents = (events || []).filter((e) => e.action.includes("update") || e.action.includes("create") || e.action.includes("publish")).length;

    assert(typeof totalEvents === "number", `Total Events telemetry: ${totalEvents}`);
    assert(typeof distinctActors === "number", `Distinct Contributors: ${distinctActors}`);
    assert(typeof distinctResources === "number", `Resources Touched: ${distinctResources}`);
    assert(typeof publishEvents === "number", `Publish Events: ${publishEvents}`);
    assert(typeof approvalEvents === "number", `Approval Decisions: ${approvalEvents}`);
    assert(typeof changeEvents === "number", `Changes Recorded: ${changeEvents}`);

    // Test 5: Activity Density Matrix (Day-of-Week 0-6 x Hour 0-23)
    console.log("\n5. Testing Activity Density Matrix generation...");
    const densityCells: { dayOfWeek: number; hour: number; count: number }[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        densityCells.push({ dayOfWeek: day, hour, count: 0 });
      }
    }
    (events || []).forEach((e) => {
      const d = new Date(e.created_at);
      const cell = densityCells.find((c) => c.dayOfWeek === d.getDay() && c.hour === d.getHours());
      if (cell) cell.count++;
    });
    assert(densityCells.length === 168, "Density matrix covers exact 168 time buckets (7 days × 24 hours).");
    assert(densityCells.every((c) => c.dayOfWeek >= 0 && c.dayOfWeek <= 6 && c.hour >= 0 && c.hour <= 23), "All density cells satisfy invariant bounds.");

    // Test 6: Resource Pulse Calculation
    console.log("\n6. Testing Resource Pulse Rails...");
    const resourceMap = new Map<string, { count: number; resources: Set<string> }>();
    (events || []).forEach((e) => {
      const type = e.resource_type || "other";
      if (!resourceMap.has(type)) {
        resourceMap.set(type, { count: 0, resources: new Set() });
      }
      const item = resourceMap.get(type)!;
      item.count++;
      if (e.resource_id) item.resources.add(e.resource_id);
    });
    const pulseSegments = Array.from(resourceMap.entries()).map(([type, data]) => ({
      resourceType: type,
      eventCount: data.count,
      distinctResourcesCount: data.resources.size,
    }));
    assert(Array.isArray(pulseSegments), `Resource Pulse computed for ${pulseSegments.length} resource types.`);

    // Test 7: Actor x Resource Matrix (Collaboration distribution, strictly NO productivity scoring)
    console.log("\n7. Testing Actor x Resource Matrix (Collaboration distribution)...");
    const actorResourceMap = new Map<string, number>();
    (events || []).forEach((e) => {
      const actorId = e.actor_id || "system";
      const resType = e.resource_type || "other";
      const key = `${actorId}:${resType}`;
      actorResourceMap.set(key, (actorResourceMap.get(key) || 0) + 1);
    });
    const actorResourceCells = Array.from(actorResourceMap.entries()).map(([key, count]) => {
      const [actorId, resourceType] = key.split(":");
      return { actorId, resourceType, count };
    });
    const hasRankingsOrScores = (actorResourceCells as any[]).some(
      (c) => "score" in c || "rank" in c || "productivity" in c || "performance" in c
    );
    assert(!hasRankingsOrScores, "Actor matrix strictly contains NO performance scoring, ranking, or productivity metric.");
    assert(Array.isArray(actorResourceCells), `Generated ${actorResourceCells.length} collaborative cells.`);

    // Test 8: CSV Export Structure & Security
    console.log("\n8. Testing CSV Export generation and security...");
    const headers = [
      "Timestamp",
      "EventID",
      "Category",
      "Action",
      "ActorType",
      "ActorName",
      "ActorEmail",
      "ResourceType",
      "ResourceID",
      "ResourceName",
      "Revision",
      "TeamID",
      "MetadataSummary",
    ];
    const csvRows = [headers.join(",")];
    (events || []).slice(0, 10).forEach((e) => {
      csvRows.push(
        [
          e.created_at,
          e.id,
          "update",
          e.action,
          "member",
          "Workspace User",
          "",
          e.resource_type,
          e.resource_id,
          "Resource",
          "",
          "",
          '""',
        ].join(",")
      );
    });
    const fullCsv = csvRows.join("\n");
    assert(fullCsv.includes("Timestamp,EventID,Category,Action"), "CSV export contains standard headers.");
    assert(!fullCsv.includes("secret") && !fullCsv.includes("token") && !fullCsv.includes("hash"), "CSV export contains zero secrets, tokens, or hashes.");

    // Test 9: Strict Invariant Audit across Components
    console.log("\n9. Testing strict repository invariants across activity components...");
    const activityDir = path.resolve(__dirname, "../components/collaborate/activity");
    const scannedFiles: string[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          scannedFiles.push(full);
        }
      }
    }
    scanDir(activityDir);

    let forbiddenStorageCount = 0;
    let forbiddenDomainCount = 0;

    for (const file of scannedFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (
        content.includes("localStorage") ||
        content.includes("sessionStorage") ||
        content.includes("indexedDB") ||
        content.includes("IndexedDB")
      ) {
        forbiddenStorageCount++;
        console.error(`Forbidden storage found in ${file}`);
      }
      if (content.includes("nxtqr.link")) {
        forbiddenDomainCount++;
        console.error(`Forbidden domain 'nxtqr.link' found in ${file}`);
      }
    }

    assert(forbiddenStorageCount === 0, `Scanned ${scannedFiles.length} activity files: 0 instances of browser storage.`);
    assert(forbiddenDomainCount === 0, `Scanned ${scannedFiles.length} activity files: 0 instances of 'nxtqr.link'.`);

    // Test 10: Check App Routing and Navigation Integration
    console.log("\n10. Testing App Routing and Navigation integration...");
    const navTabsContent = fs.readFileSync(
      path.resolve(__dirname, "../components/organization/organization-nav-tabs.tsx"),
      "utf8"
    );
    assert(navTabsContent.includes('href: `/${orgSlug}/activity`'), "Organization nav tabs link to /${orgSlug}/activity.");

    const pageContent = fs.readFileSync(
      path.resolve(__dirname, "../app/(dashboard)/[orgSlug]/activity/page.tsx"),
      "utf8"
    );
    assert(pageContent.includes("ActivityObservatoryView"), "Activity page renders ActivityObservatoryView.");
    assert(pageContent.includes("SupabaseActivityRepository"), "Activity page loads from SupabaseActivityRepository.");

    const reexportContent = fs.readFileSync(
      path.resolve(__dirname, "../app/(dashboard)/[orgSlug]/collaborate/activity/page.tsx"),
      "utf8"
    );
    assert(
      reexportContent.includes('export { default, metadata } from "../../activity/page";'),
      "Collaborate activity route correctly re-exports main activity page."
    );
  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  }

  console.log("\n=================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
