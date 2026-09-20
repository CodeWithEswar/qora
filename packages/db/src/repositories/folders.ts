/**
 * NXTQR — Cloudflare D1 Folders Repository
 * Authoritative tenant-safe relational persistence for folders, QR containment, and workspace navigation.
 * Invariants:
 * - Organization isolation is mandatory on every query (organization_id = ?).
 * - Deleting a folder unlinks all its QR codes to NULL (Unfiled) and NEVER deletes the QR code assets.
 * - Zero fake/demo data fallback.
 */

import type { D1Database } from "../index";
import { generateOpaqueId } from "../index";
import { FolderStatus, FolderAccentKey } from "@nxtqr/contracts";

export interface D1FolderRecord {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  accentKey: FolderAccentKey;
  status: FolderStatus;
  createdBy?: string | null;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number | null;
  qrCount: number;
}

export interface ListFoldersOptions {
  search?: string;
  status?: FolderStatus | "all";
  sortBy?: "updatedAt" | "createdAt" | "name" | "qrCount";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CreateFolderInput {
  name: string;
  description?: string | null;
  emoji?: string | null;
  accentKey?: FolderAccentKey;
  createdBy?: string | null;
}

export interface UpdateFolderInput {
  name?: string;
  description?: string | null;
  emoji?: string | null;
  accentKey?: FolderAccentKey;
  status?: FolderStatus;
}

export class FoldersRepository {
  /**
   * Lists folders in an organization with attached real QR counts.
   */
  static async listFolders(
    db: D1Database,
    organizationId: string,
    options: ListFoldersOptions = {}
  ): Promise<{ items: D1FolderRecord[]; totalCount: number }> {
    const {
      search,
      status = "active",
      sortBy = "updatedAt",
      order = "desc",
      limit = 50,
      offset = 0,
    } = options;

    const conditions: string[] = ["f.organization_id = ?"];
    const params: unknown[] = [organizationId];

    if (status && status !== "all") {
      conditions.push("f.status = ?");
      params.push(status);
    }

    if (search && search.trim()) {
      conditions.push("f.name LIKE ?");
      params.push(`%${search.trim()}%`);
    }

    const whereClause = conditions.join(" AND ");

    const sortColumnMap: Record<string, string> = {
      updatedAt: "f.updated_at",
      createdAt: "f.created_at",
      name: "f.name",
      qrCount: "qrCount",
    };
    const sortCol = sortColumnMap[sortBy] || "f.updated_at";
    const sortDir = order === "asc" ? "ASC" : "DESC";

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM folders f 
      WHERE ${whereClause}
    `;
    const countRow = await db.prepare(countQuery).bind(...params).first<{ count: number }>();
    const totalCount = countRow ? Number(countRow.count) : 0;

    const dataQuery = `
      SELECT 
        f.id,
        f.organization_id as organizationId,
        f.name,
        f.description,
        f.emoji,
        COALESCE(f.accent_key, 'Graphite') as accentKey,
        f.status,
        f.created_by as createdBy,
        f.created_at as createdAt,
        f.updated_at as updatedAt,
        f.archived_at as archivedAt,
        (SELECT COUNT(*) FROM qr_codes q WHERE q.folder_id = f.id AND q.organization_id = f.organization_id) as qrCount
      FROM folders f
      WHERE ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limit, offset];
    const { results } = await db.prepare(dataQuery).bind(...dataParams).all<D1FolderRecord>();

    return {
      items: (results || []).map((r) => ({
        ...r,
        accentKey: (r.accentKey || "Graphite") as FolderAccentKey,
        status: (r.status || "active") as FolderStatus,
        qrCount: Number(r.qrCount || 0),
      })),
      totalCount,
    };
  }

  /**
   * Retrieves single folder by ID.
   */
  static async getFolder(
    db: D1Database,
    organizationId: string,
    folderId: string
  ): Promise<D1FolderRecord | null> {
    const query = `
      SELECT 
        f.id,
        f.organization_id as organizationId,
        f.name,
        f.description,
        f.emoji,
        COALESCE(f.accent_key, 'Graphite') as accentKey,
        f.status,
        f.created_by as createdBy,
        f.created_at as createdAt,
        f.updated_at as updatedAt,
        f.archived_at as archivedAt,
        (SELECT COUNT(*) FROM qr_codes q WHERE q.folder_id = f.id AND q.organization_id = f.organization_id) as qrCount
      FROM folders f
      WHERE f.organization_id = ? AND f.id = ?
    `;
    const row = await db.prepare(query).bind(organizationId, folderId).first<D1FolderRecord>();
    if (!row) return null;

    return {
      ...row,
      accentKey: (row.accentKey || "Graphite") as FolderAccentKey,
      status: (row.status || "active") as FolderStatus,
      qrCount: Number(row.qrCount || 0),
    };
  }

  /**
   * Creates new folder in D1.
   */
  static async createFolder(
    db: D1Database,
    organizationId: string,
    input: CreateFolderInput
  ): Promise<D1FolderRecord> {
    const id = generateOpaqueId("fld");
    const now = Math.floor(Date.now() / 1000);

    const query = `
      INSERT INTO folders (
        id, organization_id, name, description, emoji, accent_key, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `;

    await db.prepare(query).bind(
      id,
      organizationId,
      input.name.trim(),
      input.description?.trim() || null,
      input.emoji?.trim() || null,
      input.accentKey || "Graphite",
      input.createdBy || null,
      now,
      now
    ).run();

    return {
      id,
      organizationId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      emoji: input.emoji?.trim() || null,
      accentKey: input.accentKey || "Graphite",
      status: "active",
      createdBy: input.createdBy || null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
      qrCount: 0,
    };
  }

  /**
   * Updates an existing folder.
   */
  static async updateFolder(
    db: D1Database,
    organizationId: string,
    folderId: string,
    input: UpdateFolderInput
  ): Promise<D1FolderRecord | null> {
    const existing = await this.getFolder(db, organizationId, folderId);
    if (!existing) return null;

    const updates: string[] = ["updated_at = ?"];
    const now = Math.floor(Date.now() / 1000);
    const params: unknown[] = [now];

    if (input.name !== undefined) {
      updates.push("name = ?");
      params.push(input.name.trim());
    }
    if (input.description !== undefined) {
      updates.push("description = ?");
      params.push(input.description?.trim() || null);
    }
    if (input.emoji !== undefined) {
      updates.push("emoji = ?");
      params.push(input.emoji?.trim() || null);
    }
    if (input.accentKey !== undefined) {
      updates.push("accent_key = ?");
      params.push(input.accentKey);
    }
    if (input.status !== undefined) {
      updates.push("status = ?");
      params.push(input.status);
      if (input.status === "archived") {
        updates.push("archived_at = ?");
        params.push(now);
      } else {
        updates.push("archived_at = NULL");
      }
    }

    params.push(organizationId, folderId);
    const query = `
      UPDATE folders 
      SET ${updates.join(", ")}
      WHERE organization_id = ? AND id = ?
    `;

    await db.prepare(query).bind(...params).run();
    return this.getFolder(db, organizationId, folderId);
  }

  /**
   * Deletes folder safely: unlinks QRs to NULL first.
   */
  static async deleteFolder(
    db: D1Database,
    organizationId: string,
    folderId: string
  ): Promise<boolean> {
    const existing = await this.getFolder(db, organizationId, folderId);
    if (!existing) return false;

    // 1. Unlink QRs to Unfiled
    await db.prepare(`
      UPDATE qr_codes 
      SET folder_id = NULL 
      WHERE organization_id = ? AND folder_id = ?
    `).bind(organizationId, folderId).run();

    // 2. Delete folder
    await db.prepare(`
      DELETE FROM folders 
      WHERE organization_id = ? AND id = ?
    `).bind(organizationId, folderId).run();

    return true;
  }

  /**
   * Moves QR codes to folder (or unfiled).
   */
  static async moveQrsToFolder(
    db: D1Database,
    organizationId: string,
    qrIds: string[],
    targetFolderId: string | null
  ): Promise<number> {
    if (qrIds.length === 0) return 0;

    if (targetFolderId !== null) {
      const folder = await this.getFolder(db, organizationId, targetFolderId);
      if (!folder) throw new Error("Target folder not found in this organization.");
    }

    const placeholders = qrIds.map(() => "?").join(", ");
    const query = `
      UPDATE qr_codes 
      SET folder_id = ? 
      WHERE organization_id = ? AND id IN (${placeholders})
    `;
    const params = [targetFolderId, organizationId, ...qrIds];
    await db.prepare(query).bind(...params).run();
    return qrIds.length;
  }
}
