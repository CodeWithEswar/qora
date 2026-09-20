import "server-only";
import { createAdminClient } from "../admin";

function getClient() {
  return createAdminClient();
}

export const SupabaseStorageRepository = {
  /**
   * Uploads a file asset into Supabase Storage.
   */
  async uploadFile(
    bucket: "avatars" | "brand-assets" | "qr-assets" | "files" | "reports" | "exports",
    path: string,
    fileBody: ArrayBuffer | Uint8Array | Buffer,
    contentType: string
  ): Promise<{ path: string; publicUrl?: string }> {
    const supabase = await getClient();

    const { data, error } = await supabase.storage.from(bucket).upload(path, fileBody, {
      contentType,
      upsert: true,
    });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    let publicUrl: string | undefined;
    if (bucket === "avatars" || bucket === "qr-assets") {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      publicUrl = urlData.publicUrl;
    }

    return {
      path: data.path,
      publicUrl,
    };
  },

  /**
   * Generates a signed download URL for private files/reports.
   */
  async getSignedUrl(
    bucket: "brand-assets" | "files" | "reports" | "exports",
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    const supabase = await getClient();
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    return data.signedUrl;
  },

  /**
   * Deletes a file asset from storage.
   */
  async deleteFile(
    bucket: "avatars" | "brand-assets" | "qr-assets" | "files" | "reports" | "exports",
    path: string
  ): Promise<void> {
    const supabase = await getClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
  },
};
