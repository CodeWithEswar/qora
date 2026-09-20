import { NextRequest, NextResponse } from "next/server";
import { SupabaseStorageRepository } from "@/lib/supabase/repositories/storage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/v1/files/upload",
    allowedMethods: ["POST"],
    maxFileSize: "20MB",
    bucket: "qr-assets",
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Invalid multipart form-data payload." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form-data." },
        { status: 400 }
      );
    }

    // 20MB maximum file size limit
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).` },
        { status: 400 }
      );
    }

    // Determine authenticated user session if available
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // Session retrieval optional for standard file upload
    }

    // Clean and sanitize file name
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-_]/g, "_").slice(0, 100);
    const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const objectPath = `${userId || "public"}/${uniquePrefix}-${sanitizedName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    // Upload to public 'qr-assets' bucket in Supabase storage
    const uploadResult = await SupabaseStorageRepository.uploadFile(
      "qr-assets",
      objectPath,
      buffer,
      mimeType
    );

    const publicUrl =
      uploadResult.publicUrl ||
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr-assets/${objectPath}`;

    // Optionally record in public.file_assets table
    if (userId) {
      try {
        const adminClient = await createAdminClient();
        const { data: member } = await adminClient
          .from("organization_memberships")
          .select("organization_id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (member?.organization_id) {
          await adminClient.from("file_assets").insert({
            organization_id: member.organization_id,
            bucket: "qr-assets",
            object_path: objectPath,
            file_name: sanitizedName,
            mime_type: mimeType,
            size_bytes: file.size,
            uploaded_by: userId,
          });
        }
      } catch (dbErr) {
        // Non-blocking metadata recording error
        console.warn("Could not insert file_assets metadata record:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      path: uploadResult.path,
      fileName: sanitizedName,
      sizeBytes: file.size,
      mimeType,
    });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { error: err?.message || "File upload failed." },
      { status: 500 }
    );
  }
}
