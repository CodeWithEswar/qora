import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(url, key);

async function main() {
  console.log("Beginning repair of QR destination records...");

  // 1. Repair new-qr-asset-tarw specifically
  const { data: qrs } = await supabase
    .from("qr_codes")
    .select("*, qr_drafts(*), qr_versions(*)")
    .eq("slug", "new-qr-asset-tarw");

  if (qrs && qrs.length > 0) {
    const qr = qrs[0];
    const realDestination = "https://chatgpt.com/";
    console.log(`Repairing QR ${qr.name} (${qr.slug})... Setting destination to ${realDestination}`);

    // Update draft
    await supabase
      .from("qr_drafts")
      .update({
        content_json: {
          url: realDestination,
          type: "url",
          isDynamic: true,
        },
        destination_json: {
          defaultUrl: realDestination,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("qr_id", qr.id);

    // Update all versions that had self-referential or nextqr URLs
    const { data: versions } = await supabase
      .from("qr_versions")
      .select("id, version_number, content_json, destination_json")
      .eq("qr_id", qr.id);

    for (const v of versions || []) {
      const currentUrl = (v.content_json as any)?.url || "";
      if (
        !currentUrl ||
        currentUrl.includes("nxtqr.vercel.app") ||
        currentUrl.includes("nextqr.vercel.app")
      ) {
        console.log(`  Updating version ${v.version_number} content_json & destination_json to ${realDestination}`);
        await supabase
          .from("qr_versions")
          .update({
            content_json: {
              type: "url",
              url: realDestination,
              isDynamic: true,
            },
            destination_json: {
              defaultUrl: realDestination,
            },
          })
          .eq("id", v.id);
      }
    }

    // Update qr_resolution_snapshots
    await supabase
      .from("qr_resolution_snapshots")
      .upsert({
        qr_id: qr.id,
        slug: qr.slug,
        revision: qr.published_revision || 11,
        snapshot_json: {
          qrId: qr.id,
          orgId: qr.organization_id,
          slug: qr.slug,
          revision: qr.published_revision || 11,
          status: "ACTIVE",
          destination: { defaultUrl: realDestination },
          publishedAt: new Date().toISOString(),
        },
        published_at: new Date().toISOString(),
      }, { onConflict: "slug" });

    // Ensure qr_destinations is populated
    try {
      await (supabase.from("qr_destinations" as any) as any).upsert({
        id: qr.id,
        qr_id: qr.id,
        default_url: realDestination,
        updated_at: new Date().toISOString(),
      }, { onConflict: "qr_id" });
    } catch (e) {
      console.warn("qr_destinations notice:", e);
    }
  }

  console.log("Repair complete!");
}

main().catch(console.error);
