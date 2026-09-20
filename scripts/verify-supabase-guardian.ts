import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Auth Key:", supabaseKey ? "Configured" : "Missing");

  console.log("\n1. Testing guardian_monitors query with last_checked_at...");
  const { data: monitors, error: monError } = await (supabase as any)
    .from("guardian_monitors")
    .select(`
      id,
      organization_id,
      qr_id,
      destination_url,
      name,
      status,
      current_health,
      last_checked_at,
      last_state_changed_at,
      check_interval_sec,
      timeout_ms,
      failure_threshold,
      recovery_threshold,
      consecutive_failures,
      consecutive_successes,
      created_at,
      updated_at,
      qr_codes ( id, name, slug )
    `)
    .limit(5);

  if (monError) {
    console.error("❌ guardian_monitors error:", monError);
    process.exit(1);
  } else {
    console.log("✔ guardian_monitors query succeeded. Rows returned:", monitors?.length);
  }

  console.log("\n2. Testing guardian_incidents query with relationship to guardian_monitors...");
  const { data: incidents, error: incError } = await (supabase as any)
    .from("guardian_incidents")
    .select(`
      id,
      organization_id,
      monitor_id,
      qr_id,
      status,
      started_at,
      resolved_at,
      failure_reason,
      fallback_triggered,
      timeline_events_json,
      qr_codes ( id, name, slug ),
      guardian_monitors ( id, destination_url, current_health )
    `)
    .limit(5);

  if (incError) {
    console.error("❌ guardian_incidents relationship error:", incError);
    process.exit(1);
  } else {
    console.log("✔ guardian_incidents query succeeded with join. Rows returned:", incidents?.length);
  }

  console.log("\n3. Testing guardian_observations query...");
  const { data: observations, error: obsError } = await (supabase as any)
    .from("guardian_observations")
    .select(`
      id,
      organization_id,
      monitor_id,
      qr_id,
      observed_at,
      result,
      http_status,
      duration_ms,
      tls_valid,
      failure_reason,
      checked_url
    `)
    .limit(5);

  if (obsError) {
    console.error("❌ guardian_observations error:", obsError);
    process.exit(1);
  } else {
    console.log("✔ guardian_observations query succeeded. Rows returned:", observations?.length);
  }

  console.log("\n4. Testing fallback_policies query...");
  const { data: fallbacks, error: fbError } = await (supabase as any)
    .from("fallback_policies")
    .select(`
      id,
      qr_id,
      monitor_id,
      backup_url,
      auto_switch,
      failure_threshold,
      notify_emails
    `)
    .limit(5);

  if (fbError) {
    console.error("❌ fallback_policies error:", fbError);
    process.exit(1);
  } else {
    console.log("✔ fallback_policies query succeeded. Rows returned:", fallbacks?.length);
  }

  console.log("\n5. Testing createMonitor with qr_id = null (standalone destination monitor)...");
  const { data: orgs } = await (supabase as any)
    .from("organizations")
    .select("id")
    .limit(1);

  if (orgs && orgs.length > 0) {
    const testOrgId = orgs[0].id;
    const { data: newMon, error: createError } = await (supabase as any)
      .from("guardian_monitors")
      .insert({
        organization_id: testOrgId,
        qr_id: null,
        destination_url: "https://www.google.com",
        checked_url: "https://www.google.com",
        response_time_ms: 0,
        name: "Google Standalone Test",
        status: "ACTIVE",
        current_health: "UNKNOWN",
        check_interval_sec: 300,
        timeout_ms: 5000,
        failure_threshold: 3,
        recovery_threshold: 2,
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ createMonitor with null qr_id error:", createError);
      process.exit(1);
    } else {
      console.log("✔ createMonitor with qr_id = null succeeded! Created ID:", newMon.id);

      // Clean up test row
      await (supabase as any)
        .from("guardian_monitors")
        .delete()
        .eq("id", newMon.id);
      console.log("✔ Cleaned up test monitor row.");
    }
  }

  console.log("\n🎉 ALL GUARDIAN DATABASE QUERIES, INSERTS & RELATIONSHIPS VERIFIED SUCCESSFULLY!");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
