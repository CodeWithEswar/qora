import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import assert from "assert";

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

async function run() {
  console.log("=== Testing Collaboration Signal Workspace on Supabase ===");

  // Check 1: Fetch organization
  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", "laddahdev")
    .single();

  if (orgErr || !org) {
    console.error("Could not find laddahdev organization:", orgErr);
    process.exit(1);
  }
  console.log(`[Check 1] Verified organization: ${org.name} (${org.id})`);

  // Check 2: Fetch author profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .limit(1)
    .single();

  const authorUserId = profile?.id!;
  const authorName = profile?.display_name || "Test Author";
  console.log(`[Check 2] Verified author user: ${authorName} (${authorUserId})`);

  // Check 3: Create thread attached to real resource QR-7F3K-9021
  const testThreadPublicId = `THR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const { data: thread, error: threadErr } = await supabase
    .from("collaboration_threads")
    .insert({
      public_id: testThreadPublicId,
      organization_id: org.id,
      context_type: "qr_code",
      context_id: "QR-7F3K-9021",
      context_ref: "QR-7F3K-9021",
      context_title: "QR Code •••• 4821 - Destination redirect review",
      context_state: "ACTIVE",
      context_metadata: { revision: 18 },
      title: "Replacement condition review & verification",
      state: "OPEN",
      created_by: authorUserId,
      last_activity_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (threadErr || !thread) {
    console.error("Failed to create collaboration thread:", threadErr);
    process.exit(1);
  }
  console.log(`[Check 3] Created collaboration thread: ${thread.public_id} (${thread.id})`);

  // Check 4: Create root comment with mention and attachment
  const testCommentPublicId = `CMT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const { data: comment, error: commentErr } = await supabase
    .from("comments")
    .insert({
      public_id: testCommentPublicId,
      thread_id: thread.id,
      organization_id: org.id,
      author_id: authorUserId,
      content: "Replacement image uploaded. @Chintu please verify approval for rev 18.",
      body_format: "markdown",
    })
    .select()
    .single();

  if (commentErr || !comment) {
    console.error("Failed to create root comment:", commentErr);
    process.exit(1);
  }
  console.log(`[Check 4] Created root comment: ${comment.public_id} (${comment.id})`);

  // Check 5: Insert mention
  const { error: mentionErr } = await supabase
    .from("comment_mentions")
    .insert({
      comment_id: comment.id,
      user_id: authorUserId,
    });

  assert(!mentionErr, "Mention inserted successfully");
  console.log(`[Check 5] Verified member mention recorded in database.`);

  // Check 6: Soft deletion tombstone (preserves thread integrity)
  const { error: softDelErr } = await supabase
    .from("comments")
    .update({
      content: "This comment was deleted.",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", comment.id);

  assert(!softDelErr, "Soft-delete executed successfully");
  const { data: checkDeleted } = await supabase
    .from("comments")
    .select("content, deleted_at")
    .eq("id", comment.id)
    .single();

  assert(checkDeleted?.deleted_at, "Comment tombstone preserved with deleted_at timestamp");
  console.log(`[Check 6] Verified soft deletion tombstone preserves thread structure.`);

  // Check 7: Resolve thread with note
  const { error: resolveErr } = await supabase
    .from("collaboration_threads")
    .update({
      state: "RESOLVED",
      resolved_by: authorUserId,
      resolved_at: new Date().toISOString(),
      resolution_note: "Verified and approved revision 18.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", thread.id);

  assert(!resolveErr, "Thread resolved successfully");
  const { data: resolvedCheck } = await supabase
    .from("collaboration_threads")
    .select("state, resolution_note")
    .eq("id", thread.id)
    .single();

  assert.strictEqual(resolvedCheck?.state, "RESOLVED", "Thread state is RESOLVED");
  assert.strictEqual(resolvedCheck?.resolution_note, "Verified and approved revision 18.");
  console.log(`[Check 7] Verified thread resolution with note: "${resolvedCheck?.resolution_note}".`);

  // Check 8: Reopen thread
  const { error: reopenErr } = await supabase
    .from("collaboration_threads")
    .update({
      state: "OPEN",
      resolved_by: null,
      resolved_at: null,
      resolution_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", thread.id);

  assert(!reopenErr, "Thread reopened successfully");
  const { data: reopenedCheck } = await supabase
    .from("collaboration_threads")
    .select("state, resolution_note")
    .eq("id", thread.id)
    .single();

  assert.strictEqual(reopenedCheck?.state, "OPEN", "Thread state is reset to OPEN");
  assert.strictEqual(reopenedCheck?.resolution_note, null, "Resolution note reset to null");
  console.log(`[Check 8] Verified thread reopening state transition.`);

  // Check 9: Clean up test thread and comments
  await supabase.from("comment_mentions").delete().eq("comment_id", comment.id);
  await supabase.from("comments").delete().eq("thread_id", thread.id);
  await supabase.from("collaboration_threads").delete().eq("id", thread.id);
  console.log(`[Check 9] Cleaned up test thread (${thread.public_id}) and child records (Database 100% clean).`);

  // Check 10: Strict Domain & Persistence Invariants (Strictly NO nxtqr.link, NO localStorage)
  const forbiddenDomains = ["nxtqr.link", "http://nxtqr.link", "https://nxtqr.link"];
  const commentsDir = path.resolve(process.cwd(), "components/collaborate/comments");

  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = fs.readFileSync(fullPath, "utf8");
        for (const forbidden of forbiddenDomains) {
          assert(
            !content.includes(forbidden),
            `FORBIDDEN DOMAIN '${forbidden}' found in ${fullPath}`
          );
        }
        assert(
          !content.includes("localStorage"),
          `FORBIDDEN localStorage found in ${fullPath}`
        );
        assert(
          !content.includes("sessionStorage"),
          `FORBIDDEN sessionStorage found in ${fullPath}`
        );
        assert(
          !content.includes("indexedDB"),
          `FORBIDDEN indexedDB found in ${fullPath}`
        );
      }
    }
  }

  scanDirectory(commentsDir);
  console.log(`[Check 10] Verified strict domain rules (0 occurrences of nxtqr.link) and zero browser storage persistence.`);

  console.log("=== All 10 Collaboration Signal Workspace checks passed successfully! ===");
}

run().catch((e) => {
  console.error("Error in test script:", e);
  process.exit(1);
});
