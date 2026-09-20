import "server-only";
import { createAdminClient } from "../admin";
import { SupabaseStorageRepository } from "./storage";
import {
  FileSummaryV1,
  FileDetailV1,
  FileUsageV1,
  AssetPulseMetricsV1,
  FileCollectionQueryParams,
  FileCategory,
  FileStatus,
  FileUsageRole,
  FileResourceType,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "@nxtqr/contracts";

function getClient() {
  return createAdminClient();
}

export function detectCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "text/plain" ||
    mimeType === "text/csv" ||
    mimeType === "application/json"
  ) {
    return "DOCUMENT";
  }
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("compressed") ||
    mimeType.includes("archive")
  ) {
    return "ARCHIVE";
  }
  return "OTHER";
}

export function resolveResourceHref(
  orgSlug: string,
  resourceType: FileResourceType,
  resourceId: string
): string {
  switch (resourceType) {
    case "LANDING_PAGE":
      return `/${orgSlug}/landing-pages/${resourceId}/edit`;
    case "QR_CODE":
      return `/${orgSlug}/qr/${resourceId}`;
    case "CAMPAIGN":
      return `/${orgSlug}/campaigns/${resourceId}`;
    case "BRAND_KIT":
      return `/${orgSlug}/brand`;
    case "REPORT":
      return `/${orgSlug}/analytics`;
    default:
      return `/${orgSlug}`;
  }
}

export const SupabaseFilesRepository = {
  /**
   * Lists file assets for an organization with usage counts and filtering.
   * STRICT ZERO FAKE DATA: Returns empty array if 0 rows in database.
   */
  async listFiles(
    orgId: string,
    params?: Partial<FileCollectionQueryParams>
  ): Promise<{ items: FileSummaryV1[]; total: number }> {
    const supabase = getClient();

    const limit = Math.min(params?.limit || 50, 100);
    const page = Math.max(params?.page || 1, 1);
    const offset = (page - 1) * limit;

    let query = (supabase as any)
      .from("file_assets")
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, uploaded_by, profiles:uploaded_by(id, display_name, avatar_url)",
        { count: "exact" }
      )
      .eq("organization_id", orgId)
      .is("deleted_at", null);

    // Search query
    if (params?.search?.trim()) {
      const s = params.search.trim();
      query = query.or(`display_name.ilike.%${s}%,file_name.ilike.%${s}%`);
    }

    // Category filter
    if (params?.category && params.category !== "ALL") {
      query = query.eq("category", params.category);
    }

    // Status filter
    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status);
    } else {
      // By default exclude ARCHIVED unless explicitly requested
      query = query.neq("status", "ARCHIVED");
    }

    // Sorting
    const sortBy = params?.sortBy || "updatedAt";
    const ascending = params?.order === "asc";

    switch (sortBy) {
      case "name":
        query = query.order("display_name", { ascending });
        break;
      case "sizeBytes":
        query = query.order("size_bytes", { ascending });
        break;
      case "createdAt":
        query = query.order("created_at", { ascending });
        break;
      case "updatedAt":
      default:
        query = query.order("updated_at", { ascending });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("Supabase listFiles error:", error);
      throw new Error(`Failed to query file assets: ${error.message}`);
    }

    const fileIds = (data || []).map((row: any) => row.id);
    const usageCounts: Record<string, number> = {};

    if (fileIds.length > 0) {
      try {
        const { data: usageRows } = await (supabase as any)
          .from("file_usages")
          .select("file_id")
          .in("file_id", fileIds);

        if (usageRows) {
          for (const u of usageRows) {
            usageCounts[u.file_id] = (usageCounts[u.file_id] || 0) + 1;
          }
        }
      } catch (e) {
        console.warn("Could not query file_usages counts:", e);
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    let items: FileSummaryV1[] = (data || []).map((row: any) => {
      const usageCount = usageCounts[row.id] || 0;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${row.bucket}/${row.object_path}`;

      return {
        id: row.id,
        organizationId: row.organization_id,
        name: row.display_name || row.file_name,
        originalName: row.file_name,
        category: (row.category || "OTHER") as FileCategory,
        mimeType: row.mime_type,
        extension: row.file_extension,
        sizeBytes: Number(row.size_bytes) || 0,
        dimensions:
          row.width && row.height
            ? { width: row.width, height: row.height }
            : null,
        status: (row.status || "READY") as FileStatus,
        publicUrl,
        bucket: row.bucket,
        storagePath: row.object_path,
        usageCount,
        uploadedBy: row.profiles
          ? {
              id: row.profiles.id,
              displayName: row.profiles.display_name || "Member",
              avatarUrl: row.profiles.avatar_url,
            }
          : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        archivedAt: row.archived_at,
      };
    });

    // In-memory usage filter if needed
    if (params?.usage === "in_use") {
      items = items.filter((item) => item.usageCount > 0);
    } else if (params?.usage === "unused") {
      items = items.filter((item) => item.usageCount === 0);
    }

    return {
      items,
      total: count || items.length,
    };
  },

  /**
   * Retrieves single file detail with full usage breakdown.
   */
  async getFileById(
    orgId: string,
    fileId: string,
    orgSlug?: string
  ): Promise<FileDetailV1 | null> {
    const supabase = getClient();

    const { data: file, error } = await (supabase as any)
      .from("file_assets")
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, profiles:uploaded_by(id, display_name, avatar_url)"
      )
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !file) {
      return null;
    }

    // Query connected usages
    const { data: usagesData } = await (supabase as any)
      .from("file_usages")
      .select("id, file_id, resource_type, resource_id, resource_name, usage_role, created_at")
      .eq("file_id", fileId)
      .eq("organization_id", orgId);

    const slug = orgSlug || "default";
    const usages: FileUsageV1[] = (usagesData || []).map((u: any) => ({
      id: u.id,
      fileId: u.file_id,
      resourceType: u.resource_type as FileResourceType,
      resourceId: u.resource_id,
      resourceName: u.resource_name,
      usageRole: u.usage_role as FileUsageRole,
      createdAt: u.created_at,
      resourceHref: resolveResourceHref(slug, u.resource_type as FileResourceType, u.resource_id),
    }));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${file.bucket}/${file.object_path}`;

    return {
      id: file.id,
      organizationId: file.organization_id,
      name: file.display_name || file.file_name,
      originalName: file.file_name,
      category: (file.category || "OTHER") as FileCategory,
      mimeType: file.mime_type,
      extension: file.file_extension,
      sizeBytes: Number(file.size_bytes) || 0,
      dimensions:
        file.width && file.height
          ? { width: file.width, height: file.height }
          : null,
      status: (file.status || "READY") as FileStatus,
      publicUrl,
      bucket: file.bucket,
      storagePath: file.object_path,
      usageCount: usages.length,
      usages,
      uploadedBy: file.profiles
        ? {
            id: file.profiles.id,
            displayName: file.profiles.display_name || "Member",
            avatarUrl: file.profiles.avatar_url,
          }
        : null,
      createdAt: file.created_at,
      updatedAt: file.updated_at,
      archivedAt: file.archived_at,
    };
  },

  /**
   * Retrieves real operational metrics for the Asset Pulse strip.
   */
  async getStoragePulse(orgId: string): Promise<AssetPulseMetricsV1> {
    const supabase = getClient();

    // Query file counts and total bytes
    const { data: fileStats } = await (supabase as any)
      .from("file_assets")
      .select("category, size_bytes")
      .eq("organization_id", orgId)
      .is("deleted_at", null);

    const rows = fileStats || [];
    let totalFiles = rows.length;
    let totalImages = 0;
    let totalDocuments = 0;
    let usedStorageBytes = 0;

    for (const row of rows) {
      if (row.category === "IMAGE") totalImages++;
      if (row.category === "DOCUMENT") totalDocuments++;
      usedStorageBytes += Number(row.size_bytes) || 0;
    }

    // Query distinct files that have active usages
    const { data: usageRows } = await (supabase as any)
      .from("file_usages")
      .select("file_id")
      .eq("organization_id", orgId);

    const distinctInUse = new Set((usageRows || []).map((u: any) => u.file_id));

    return {
      totalFiles,
      totalImages,
      totalDocuments,
      inUseCount: distinctInUse.size,
      usedStorageBytes,
      storageLimitBytes: 2 * 1024 * 1024 * 1024, // 2 GB standard workspace quota
    };
  },

  /**
   * Authorizes and commits an uploaded file into Supabase Storage & file_assets.
   */
  async uploadFile(params: {
    orgId: string;
    file: File;
    bucket?: "qr-assets" | "brand-assets" | "files";
    uploadedBy?: string | null;
  }): Promise<FileSummaryV1> {
    const { orgId, file, bucket = "qr-assets", uploadedBy } = params;

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-_]/g, "_").slice(0, 100);
    const extension = sanitizedName.includes(".")
      ? sanitizedName.split(".").pop()?.toLowerCase() || null
      : null;

    const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const objectPath = `orgs/${orgId}/files/${uniquePrefix}-${sanitizedName}`;
    const mimeType = file.type || "application/octet-stream";
    const category = detectCategory(mimeType);

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Upload binary bytes to Supabase Storage
    const uploadResult = await SupabaseStorageRepository.uploadFile(
      bucket,
      objectPath,
      buffer,
      mimeType
    );

    // 2. Commit relational metadata row to public.file_assets
    const supabase = getClient();
    const { data: inserted, error: dbError } = await (supabase as any)
      .from("file_assets")
      .insert({
        organization_id: orgId,
        bucket,
        object_path: objectPath,
        file_name: sanitizedName,
        display_name: sanitizedName,
        mime_type: mimeType,
        file_extension: extension,
        size_bytes: file.size,
        category,
        status: "READY",
        uploaded_by: uploadedBy || null,
      })
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, profiles:uploaded_by(id, display_name, avatar_url)"
      )
      .single();

    if (dbError || !inserted) {
      console.error("Failed to insert file_assets row:", dbError);
      throw new Error(`Failed to commit file metadata: ${dbError?.message}`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const publicUrl =
      uploadResult.publicUrl ||
      `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;

    return {
      id: inserted.id,
      organizationId: inserted.organization_id,
      name: inserted.display_name,
      originalName: inserted.file_name,
      category: inserted.category as FileCategory,
      mimeType: inserted.mime_type,
      extension: inserted.file_extension,
      sizeBytes: Number(inserted.size_bytes),
      dimensions: null,
      status: inserted.status as FileStatus,
      publicUrl,
      usageCount: 0,
      uploadedBy: inserted.profiles
        ? {
            id: inserted.profiles.id,
            displayName: inserted.profiles.display_name || "Member",
            avatarUrl: inserted.profiles.avatar_url,
          }
        : null,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
      archivedAt: inserted.archived_at,
    };
  },

  /**
   * Renames a file's display name.
   */
  async renameFile(
    orgId: string,
    fileId: string,
    displayName: string
  ): Promise<FileSummaryV1> {
    const supabase = getClient();

    const { data: updated, error } = await (supabase as any)
      .from("file_assets")
      .update({
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, profiles:uploaded_by(id, display_name, avatar_url)"
      )
      .maybeSingle();

    if (error || !updated) {
      throw new NotFoundError(`File '${fileId}' not found.`);
    }

    const { count: usageCount } = await (supabase as any)
      .from("file_usages")
      .select("id", { count: "exact", head: true })
      .eq("file_id", updated.id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${updated.bucket}/${updated.object_path}`;

    return {
      id: updated.id,
      organizationId: updated.organization_id,
      name: updated.display_name,
      originalName: updated.file_name,
      category: updated.category as FileCategory,
      mimeType: updated.mime_type,
      extension: updated.file_extension,
      sizeBytes: Number(updated.size_bytes),
      dimensions:
        updated.width && updated.height
          ? { width: updated.width, height: updated.height }
          : null,
      status: updated.status as FileStatus,
      publicUrl,
      bucket: updated.bucket,
      storagePath: updated.object_path,
      usageCount: usageCount || 0,
      uploadedBy: updated.profiles
        ? {
            id: updated.profiles.id,
            displayName: updated.profiles.display_name || "Member",
            avatarUrl: updated.profiles.avatar_url,
          }
        : null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      archivedAt: updated.archived_at,
    };
  },

  /**
   * Toggles archive status for a file.
   */
  async archiveFile(orgId: string, fileId: string): Promise<FileSummaryV1> {
    const supabase = getClient();
    const now = new Date().toISOString();

    const { data: updated, error } = await (supabase as any)
      .from("file_assets")
      .update({
        status: "ARCHIVED",
        archived_at: now,
        updated_at: now,
      })
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, profiles:uploaded_by(id, display_name, avatar_url)"
      )
      .maybeSingle();

    if (error || !updated) {
      throw new NotFoundError(`File '${fileId}' not found.`);
    }

    const { count: usageCount } = await (supabase as any)
      .from("file_usages")
      .select("id", { count: "exact", head: true })
      .eq("file_id", updated.id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return {
      id: updated.id,
      organizationId: updated.organization_id,
      name: updated.display_name,
      originalName: updated.file_name,
      category: updated.category as FileCategory,
      mimeType: updated.mime_type,
      extension: updated.file_extension,
      sizeBytes: Number(updated.size_bytes),
      dimensions: null,
      status: "ARCHIVED",
      publicUrl: `${supabaseUrl}/storage/v1/object/public/${updated.bucket}/${updated.object_path}`,
      bucket: updated.bucket,
      storagePath: updated.object_path,
      usageCount: usageCount || 0,
      uploadedBy: updated.profiles
        ? {
            id: updated.profiles.id,
            displayName: updated.profiles.display_name || "Member",
            avatarUrl: updated.profiles.avatar_url,
          }
        : null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      archivedAt: updated.archived_at,
    };
  },

  /**
   * Restores an archived file back to READY status.
   */
  async restoreFile(orgId: string, fileId: string): Promise<FileSummaryV1> {
    const supabase = getClient();
    const now = new Date().toISOString();

    const { data: updated, error } = await (supabase as any)
      .from("file_assets")
      .update({
        status: "READY",
        archived_at: null,
        updated_at: now,
      })
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, profiles:uploaded_by(id, display_name, avatar_url)"
      )
      .maybeSingle();

    if (error || !updated) {
      throw new NotFoundError(`File '${fileId}' not found.`);
    }

    const { count: usageCount } = await (supabase as any)
      .from("file_usages")
      .select("id", { count: "exact", head: true })
      .eq("file_id", updated.id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return {
      id: updated.id,
      organizationId: updated.organization_id,
      name: updated.display_name,
      originalName: updated.file_name,
      category: updated.category as FileCategory,
      mimeType: updated.mime_type,
      extension: updated.file_extension,
      sizeBytes: Number(updated.size_bytes),
      dimensions: null,
      status: "READY",
      publicUrl: `${supabaseUrl}/storage/v1/object/public/${updated.bucket}/${updated.object_path}`,
      bucket: updated.bucket,
      storagePath: updated.object_path,
      usageCount: usageCount || 0,
      uploadedBy: updated.profiles
        ? {
            id: updated.profiles.id,
            displayName: updated.profiles.display_name || "Member",
            avatarUrl: updated.profiles.avatar_url,
          }
        : null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      archivedAt: null,
    };
  },

  /**
   * Deletes a file with dependency awareness.
   * If the file is currently used by any resource, deletion is blocked unless forced.
   * Never deletes parent resources!
   */
  async deleteFile(
    orgId: string,
    fileId: string,
    force = false
  ): Promise<{ success: boolean; deletedFileId: string }> {
    const supabase = getClient();

    // 1. Check for dependent usages
    const { data: usages } = await (supabase as any)
      .from("file_usages")
      .select("resource_type, resource_name")
      .eq("file_id", fileId)
      .eq("organization_id", orgId);

    if (usages && usages.length > 0 && !force) {
      const summary = usages
        .map((u: any) => `${u.resource_type}: ${u.resource_name}`)
        .slice(0, 3)
        .join(", ");
      throw new ConflictError(
        `Cannot delete file. It is currently in use by ${usages.length} resource(s) (${summary}). Archive the asset or remove references first.`
      );
    }

    // 2. Fetch storage bucket and object_path before deleting row
    const { data: file } = await (supabase as any)
      .from("file_assets")
      .select("bucket, object_path")
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!file) {
      throw new NotFoundError(`File '${fileId}' not found.`);
    }

    // 3. Delete binary object from Supabase Storage
    try {
      await SupabaseStorageRepository.deleteFile(
        file.bucket as any,
        file.object_path
      );
    } catch (storageErr) {
      console.warn("Storage delete failed during file removal:", storageErr);
    }

    // 4. Delete row from public.file_assets (cascades file_usages safely)
    const { error: dbDeleteErr } = await (supabase as any)
      .from("file_assets")
      .delete()
      .eq("id", fileId)
      .eq("organization_id", orgId);

    if (dbDeleteErr) {
      throw new Error(`Failed to delete file record: ${dbDeleteErr.message}`);
    }

    return {
      success: true,
      deletedFileId: fileId,
    };
  },

  /**
   * Replaces file binary in-place in storage while keeping the same file ID and references.
   */
  async replaceFile(
    orgId: string,
    fileId: string,
    newFile: File
  ): Promise<FileSummaryV1> {
    const supabase = getClient();

    const { data: existing } = await (supabase as any)
      .from("file_assets")
      .select("bucket, object_path")
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundError(`File '${fileId}' not found.`);
    }

    const buffer = Buffer.from(await newFile.arrayBuffer());
    const mimeType = newFile.type || "application/octet-stream";
    const category = detectCategory(mimeType);

    // Overwrite existing storage path
    await SupabaseStorageRepository.uploadFile(
      existing.bucket as any,
      existing.object_path,
      buffer,
      mimeType
    );

    const now = new Date().toISOString();
    const { data: updated, error } = await (supabase as any)
      .from("file_assets")
      .update({
        size_bytes: newFile.size,
        mime_type: mimeType,
        category,
        updated_at: now,
      })
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .select(
        "id, organization_id, bucket, object_path, file_name, display_name, mime_type, file_extension, size_bytes, category, status, width, height, created_at, updated_at, archived_at, profiles:uploaded_by(id, display_name, avatar_url)"
      )
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update replaced file record: ${error?.message}`);
    }

    const { count: usageCount } = await (supabase as any)
      .from("file_usages")
      .select("id", { count: "exact", head: true })
      .eq("file_id", updated.id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return {
      id: updated.id,
      organizationId: updated.organization_id,
      name: updated.display_name,
      originalName: updated.file_name,
      category: updated.category as FileCategory,
      mimeType: updated.mime_type,
      extension: updated.file_extension,
      sizeBytes: Number(updated.size_bytes),
      dimensions: null,
      status: updated.status as FileStatus,
      publicUrl: `${supabaseUrl}/storage/v1/object/public/${updated.bucket}/${updated.object_path}`,
      bucket: updated.bucket,
      storagePath: updated.object_path,
      usageCount: usageCount || 0,
      uploadedBy: updated.profiles
        ? {
            id: updated.profiles.id,
            displayName: updated.profiles.display_name || "Member",
            avatarUrl: updated.profiles.avatar_url,
          }
        : null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      archivedAt: updated.archived_at,
    };
  },

  /**
   * Registers a file usage connection (e.g. logo used in QR Studio, hero in Landing Page).
   */
  async attachFileUsage(params: {
    orgId: string;
    fileId: string;
    resourceType: FileResourceType;
    resourceId: string;
    resourceName: string;
    usageRole: FileUsageRole;
  }): Promise<FileUsageV1> {
    const supabase = getClient();
    const { orgId, fileId, resourceType, resourceId, resourceName, usageRole } = params;

    const { data: usage, error } = await (supabase as any)
      .from("file_usages")
      .upsert(
        {
          organization_id: orgId,
          file_id: fileId,
          resource_type: resourceType,
          resource_id: resourceId,
          resource_name: resourceName,
          usage_role: usageRole,
        },
        { onConflict: "file_id,resource_type,resource_id,usage_role" }
      )
      .select()
      .single();

    if (error || !usage) {
      throw new Error(`Failed to register file usage: ${error?.message}`);
    }

    return {
      id: usage.id,
      fileId: usage.file_id,
      resourceType: usage.resource_type as FileResourceType,
      resourceId: usage.resource_id,
      resourceName: usage.resource_name,
      usageRole: usage.usage_role as FileUsageRole,
      createdAt: usage.created_at,
    };
  },

  /**
   * Removes a file usage connection.
   */
  async detachFileUsage(params: {
    orgId: string;
    fileId: string;
    resourceType: FileResourceType;
    resourceId: string;
  }): Promise<boolean> {
    const supabase = getClient();
    const { orgId, fileId, resourceType, resourceId } = params;

    const { error } = await (supabase as any)
      .from("file_usages")
      .delete()
      .eq("organization_id", orgId)
      .eq("file_id", fileId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    return !error;
  },
};
