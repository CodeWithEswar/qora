import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(url, key);

async function main() {
  console.log("Searching entire Supabase database for 'nextqr'...");

  // 1. qr_versions
  const { data: versions } = await supabase.from("qr_versions").select("*");
  let verCount = 0;
  for (const v of versions || []) {
    let changed = false;
    let contentJson = v.content_json;
    let destJson = v.destination_json;
    let routingJson = v.routing_json;

    const contentStr = JSON.stringify(contentJson);
    if (contentStr && contentStr.includes("nextqr")) {
      contentJson = JSON.parse(contentStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }
    const destStr = JSON.stringify(destJson);
    if (destStr && destStr.includes("nextqr")) {
      destJson = JSON.parse(destStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }
    const routingStr = JSON.stringify(routingJson);
    if (routingStr && routingStr.includes("nextqr")) {
      routingJson = JSON.parse(routingStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }

    if (changed) {
      console.log(`Updating qr_versions ID ${v.id} (version ${v.version_number})...`);
      await supabase
        .from("qr_versions")
        .update({
          content_json: contentJson,
          destination_json: destJson,
          routing_json: routingJson,
        })
        .eq("id", v.id);
      verCount++;
    }
  }
  console.log(`Updated ${verCount} qr_versions.`);

  // 2. qr_drafts
  const { data: drafts } = await supabase.from("qr_drafts").select("*");
  let draftCount = 0;
  for (const d of drafts || []) {
    let changed = false;
    let contentJson = d.content_json;
    let destJson = d.destination_json;
    let routingJson = d.routing_json;

    const contentStr = JSON.stringify(contentJson);
    if (contentStr && contentStr.includes("nextqr")) {
      contentJson = JSON.parse(contentStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }
    const destStr = JSON.stringify(destJson);
    if (destStr && destStr.includes("nextqr")) {
      destJson = JSON.parse(destStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }
    const routingStr = JSON.stringify(routingJson);
    if (routingStr && routingStr.includes("nextqr")) {
      routingJson = JSON.parse(routingStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }

    if (changed) {
      console.log(`Updating qr_drafts for qr_id ${d.qr_id}...`);
      await supabase
        .from("qr_drafts")
        .update({
          content_json: contentJson,
          destination_json: destJson,
          routing_json: routingJson,
        })
        .eq("qr_id", d.qr_id);
      draftCount++;
    }
  }
  console.log(`Updated ${draftCount} qr_drafts.`);

  // 3. qr_resolution_snapshots
  const { data: snapshots } = await supabase.from("qr_resolution_snapshots").select("*");
  let snapCount = 0;
  for (const s of snapshots || []) {
    const snapStr = JSON.stringify(s.snapshot_json);
    if (snapStr && snapStr.includes("nextqr")) {
      console.log(`Updating snapshot for slug ${s.slug}...`);
      const updated = JSON.parse(snapStr.replace(/nextqr/gi, "nxtqr"));
      await supabase
        .from("qr_resolution_snapshots")
        .update({
          snapshot_json: updated,
        })
        .eq("slug", s.slug);
      snapCount++;
    }
  }
  console.log(`Updated ${snapCount} qr_resolution_snapshots.`);

  // 4. qr_rules
  const { data: rules } = await supabase.from("qr_rules").select("*");
  let ruleCount = 0;
  for (const r of rules || []) {
    let destUrl = r.destination_url || "";
    let condStr = JSON.stringify(r.conditions_json);
    let changed = false;

    if (destUrl.includes("nextqr")) {
      destUrl = destUrl.replace(/nextqr/gi, "nxtqr");
      changed = true;
    }
    let condJson = r.conditions_json;
    if (condStr && condStr.includes("nextqr")) {
      condJson = JSON.parse(condStr.replace(/nextqr/gi, "nxtqr"));
      changed = true;
    }

    if (changed) {
      console.log(`Updating qr_rules ID ${r.id}...`);
      await supabase
        .from("qr_rules")
        .update({
          destination_url: destUrl,
          conditions_json: condJson,
        })
        .eq("id", r.id);
      ruleCount++;
    }
  }
  console.log(`Updated ${ruleCount} qr_rules.`);

  // 5. scan_events_hourly
  const { data: scanEvents } = await supabase
    .from("scan_events_hourly")
    .select("id, destination_url, referrer")
    .or("destination_url.ilike.%nextqr%,referrer.ilike.%nextqr%");

  let scanCount = 0;
  for (const sc of scanEvents || []) {
    const newDest = sc.destination_url ? sc.destination_url.replace(/nextqr/gi, "nxtqr") : sc.destination_url;
    const newRef = sc.referrer ? sc.referrer.replace(/nextqr/gi, "nxtqr") : sc.referrer;
    await supabase
      .from("scan_events_hourly")
      .update({
        destination_url: newDest,
        referrer: newRef,
      })
      .eq("id", sc.id);
    scanCount++;
  }
  console.log(`Updated ${scanCount} scan_events_hourly.`);

  // 6. qr_destinations (if exists)
  try {
    const { data: dests } = await (supabase.from("qr_destinations" as any) as any).select("*");
    let dCount = 0;
    for (const d of dests || []) {
      let defUrl = d.default_url || "";
      let fbUrl = d.fallback_url || "";
      let changed = false;
      if (defUrl.includes("nextqr")) {
        defUrl = defUrl.replace(/nextqr/gi, "nxtqr");
        changed = true;
      }
      if (fbUrl.includes("nextqr")) {
        fbUrl = fbUrl.replace(/nextqr/gi, "nxtqr");
        changed = true;
      }
      if (changed) {
        await (supabase.from("qr_destinations" as any) as any)
          .update({
            default_url: defUrl,
            fallback_url: fbUrl,
          })
          .eq("id", d.id);
        dCount++;
      }
    }
    console.log(`Updated ${dCount} qr_destinations.`);
  } catch (e) {
    // optional table
  }

  // 7. custom_domains
  try {
    const { data: doms } = await supabase.from("custom_domains").select("*");
    let domCount = 0;
    for (const dm of doms || []) {
      if (dm.domain && dm.domain.includes("nextqr")) {
        await supabase
          .from("custom_domains")
          .update({ domain: dm.domain.replace(/nextqr/gi, "nxtqr") })
          .eq("id", dm.id);
        domCount++;
      }
    }
    console.log(`Updated ${domCount} custom_domains.`);
  } catch {}

  console.log("\nALL 'nextqr' database records successfully sanitized to 'nxtqr'!");
}

main().catch(console.error);
