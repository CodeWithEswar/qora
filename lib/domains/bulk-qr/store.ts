/**
 * NXTQR — Bulk QR Operations Database Store
 * Authoritative Supabase persistence layer for batches, batch rows, and execution state.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  BulkBatchSummary,
  BulkBatchDetail,
  ValidatedBulkRow,
  BatchManifest,
  BulkBatchStatus,
  BulkSourceType,
  BulkCreationMode,
  BulkExecutionStatus,
} from "./types";
import { QrDesignV1, CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

function getClient(): any {
  return createAdminClient() as any;
}

export class BulkQrStore {
  /**
   * Creates a new bulk creation batch along with all validated rows.
   */
  static async createBatch(params: {
    organizationId: string;
    actorId?: string;
    name: string;
    sourceType: BulkSourceType;
    creationMode: BulkCreationMode;
    manifest: BatchManifest;
    design: QrDesignV1;
    rows: ValidatedBulkRow[];
    campaignId?: string;
    folderId?: string;
  }): Promise<BulkBatchDetail> {
    const supabase = getClient();
    const batchId = crypto.randomUUID();
    const now = new Date().toISOString();

    const {
      organizationId,
      actorId,
      name,
      sourceType,
      creationMode,
      manifest,
      design,
      rows,
      campaignId,
      folderId,
    } = params;

    // 1. Insert Batch Header
    const readyRows = manifest?.readyRows ?? rows.length;
    const warningRows = manifest?.warningRows ?? 0;
    const blockedRows = manifest?.blockedRows ?? 0;

    const { error: batchErr } = await supabase.from("bulk_qr_batches" as any).insert({
      id: batchId,
      organization_id: organizationId,
      created_by: actorId || null,
      name,
      source_type: sourceType,
      status: "READY",
      creation_mode: creationMode,
      total_rows: rows.length,
      ready_rows: readyRows,
      warning_rows: warningRows,
      blocked_rows: blockedRows,
      processed_rows: 0,
      created_rows: 0,
      failed_rows: 0,
      campaign_id: campaignId || null,
      folder_id: folderId || null,
      design_json: design || CANONICAL_QR_DESIGN_DEFAULTS,
      manifest_json: manifest,
      created_at: now,
      updated_at: now,
    });

    if (batchErr) {
      throw new Error(`Failed to persist bulk batch: ${batchErr.message}`);
    }

    // 2. Insert Batch Rows (Chunked to respect Postgres query parameters limit)
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const rowsToInsert = chunk.map((r: any, idx: number) => ({
        id: crypto.randomUUID(),
        batch_id: batchId,
        organization_id: organizationId,
        source_row_number: r.sourceRowNumber ?? r.rowNumber ?? (i + idx + 1),
        normalized_payload: {
          name: r.name ?? r.row?.name,
          type: r.type ?? r.row?.qr_type ?? "url",
          destinationUrl: r.destinationUrl ?? r.destination_url ?? r.row?.destination_url,
          fallbackUrl: r.fallbackUrl ?? r.row?.content?.fallbackUrl,
          campaignId: r.campaignId ?? r.campaign_id ?? r.row?.campaign_id ?? campaignId,
          campaignName: r.campaignName ?? r.row?.campaignName,
          folderId: r.folderId ?? r.folder_id ?? r.row?.folder_id ?? folderId,
          folderName: r.folderName ?? r.row?.folderName,
          customSlug: r.customSlug ?? r.custom_slug ?? r.row?.custom_slug,
          notes: r.notes ?? r.row?.notes,
          rawPayload: r.rawPayload ?? r.row?.content ?? r.row,
        },
        validation_status: r.validationStatus ?? r.validation_status ?? "READY",
        validation_errors: r.errors ?? r.validation_errors ?? [],
        execution_status: "PENDING",
        created_at: now,
        updated_at: now,
      }));

      const { error: rowErr } = await supabase.from("bulk_qr_batch_rows" as any).insert(rowsToInsert);
      if (rowErr) {
        throw new Error(`Failed to persist batch rows chunk ${i}: ${rowErr.message}`);
      }
    }

    return {
      id: batchId,
      organizationId,
      organization_id: organizationId,
      createdBy: actorId,
      created_by: actorId,
      name,
      sourceType,
      source_type: sourceType,
      status: "READY",
      creationMode,
      creation_mode: creationMode,
      totalRows: rows.length,
      total_rows: rows.length,
      readyRows,
      ready_rows: readyRows,
      warningRows,
      warning_rows: warningRows,
      blockedRows,
      blocked_rows: blockedRows,
      processedRows: 0,
      processed_rows: 0,
      createdRows: 0,
      created_rows: 0,
      failedRows: 0,
      failed_rows: 0,
      campaignId,
      campaign_id: campaignId,
      folderId,
      folder_id: folderId,
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
      manifest,
      manifest_json: manifest,
      design,
      design_json: design,
      rows,
    } as any;
  }

  /**
   * Retrieves a single batch summary with all associated manifest and row details.
   */
  static async getBatch(batchId: string, orgId: string): Promise<BulkBatchDetail | null> {
    const supabase = getClient();

    const { data: batch, error: batchErr } = await supabase
      .from("bulk_qr_batches" as any)
      .select("*")
      .eq("id", batchId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (batchErr || !batch) {
      return null;
    }

    // Fetch batch rows
    const { data: rowsData } = await supabase
      .from("bulk_qr_batch_rows" as any)
      .select("*")
      .eq("batch_id", batchId)
      .order("source_row_number", { ascending: true });

    const rows: ValidatedBulkRow[] = (rowsData || []).map((r: any) => {
      const payload = r.normalized_payload || {};
      return {
        id: r.id,
        sourceRowNumber: r.source_row_number,
        source_row_number: r.source_row_number,
        name: payload.name || `Row #${r.source_row_number}`,
        type: payload.type || "url",
        destinationUrl: payload.destinationUrl || "",
        destination_url: payload.destinationUrl || "",
        fallbackUrl: payload.fallbackUrl,
        campaignId: payload.campaignId,
        campaign_id: payload.campaignId,
        campaignName: payload.campaignName,
        folderId: payload.folderId,
        folder_id: payload.folderId,
        folderName: payload.folderName,
        customSlug: payload.customSlug,
        custom_slug: payload.customSlug,
        notes: payload.notes,
        rawPayload: payload.rawPayload,
        validationStatus: r.validation_status,
        validation_status: r.validation_status,
        errors: r.validation_errors || [],
        validation_errors: r.validation_errors || [],
        executionStatus: r.execution_status,
        execution_status: r.execution_status,
        qrId: r.qr_id,
        qr_id: r.qr_id,
        errorCode: r.error_code,
        error_code: r.error_code,
        errorMessage: r.error_message,
        error_message: r.error_message,
        createdAt: r.created_at,
        created_at: r.created_at,
        updatedAt: r.updated_at,
        updated_at: r.updated_at,
      };
    });

    return {
      id: batch.id,
      organizationId: batch.organization_id,
      organization_id: batch.organization_id,
      createdBy: batch.created_by,
      created_by: batch.created_by,
      name: batch.name,
      sourceType: batch.source_type,
      source_type: batch.source_type,
      status: batch.status,
      creationMode: batch.creation_mode,
      creation_mode: batch.creation_mode,
      totalRows: batch.total_rows,
      total_rows: batch.total_rows,
      readyRows: batch.ready_rows,
      ready_rows: batch.ready_rows,
      warningRows: batch.warning_rows,
      warning_rows: batch.warning_rows,
      blockedRows: batch.blocked_rows,
      blocked_rows: batch.blocked_rows,
      processedRows: batch.processed_rows,
      processed_rows: batch.processed_rows,
      createdRows: batch.created_rows,
      created_rows: batch.created_rows,
      failedRows: batch.failed_rows,
      failed_rows: batch.failed_rows,
      campaignId: batch.campaign_id,
      campaign_id: batch.campaign_id,
      folderId: batch.folder_id,
      folder_id: batch.folder_id,
      createdAt: batch.created_at,
      created_at: batch.created_at,
      startedAt: batch.started_at,
      started_at: batch.started_at,
      completedAt: batch.completed_at,
      completed_at: batch.completed_at,
      updatedAt: batch.updated_at,
      updated_at: batch.updated_at,
      manifest: batch.manifest_json || {},
      manifest_json: batch.manifest_json || {},
      design: batch.design_json || CANONICAL_QR_DESIGN_DEFAULTS,
      design_json: batch.design_json || CANONICAL_QR_DESIGN_DEFAULTS,
      rows,
    } as any;
  }

  /**
   * Lists all batches for an organization (ordered latest first).
   */
  static async listBatches(orgId: string, limit = 50, offset = 0): Promise<BulkBatchSummary[]> {
    const supabase = getClient();

    const { data, error } = await supabase
      .from("bulk_qr_batches" as any)
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return [];

    return data.map((b: any) => ({
      id: b.id,
      organizationId: b.organization_id,
      organization_id: b.organization_id,
      createdBy: b.created_by,
      created_by: b.created_by,
      name: b.name,
      sourceType: b.source_type,
      source_type: b.source_type,
      status: b.status,
      creationMode: b.creation_mode,
      creation_mode: b.creation_mode,
      totalRows: b.total_rows,
      total_rows: b.total_rows,
      readyRows: b.ready_rows,
      ready_rows: b.ready_rows,
      warningRows: b.warning_rows,
      warning_rows: b.warning_rows,
      blockedRows: b.blocked_rows,
      blocked_rows: b.blocked_rows,
      processedRows: b.processed_rows,
      processed_rows: b.processed_rows,
      createdRows: b.created_rows,
      created_rows: b.created_rows,
      failedRows: b.failed_rows,
      failed_rows: b.failed_rows,
      campaignId: b.campaign_id,
      campaign_id: b.campaign_id,
      folderId: b.folder_id,
      folder_id: b.folder_id,
      createdAt: b.created_at,
      created_at: b.created_at,
      startedAt: b.started_at,
      started_at: b.started_at,
      completedAt: b.completed_at,
      completed_at: b.completed_at,
      updatedAt: b.updated_at,
      updated_at: b.updated_at,
    }));
  }

  /**
   * Updates batch execution progress metrics.
   */
  static async updateBatchProgress(
    batchId: string,
    updates: {
      status?: BulkBatchStatus;
      processedRows?: number;
      createdRows?: number;
      failedRows?: number;
      startedAt?: string;
      completedAt?: string;
    }
  ): Promise<void> {
    const supabase = getClient();
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) payload.status = updates.status;
    if (updates.processedRows !== undefined) payload.processed_rows = updates.processedRows;
    if (updates.createdRows !== undefined) payload.created_rows = updates.createdRows;
    if (updates.failedRows !== undefined) payload.failed_rows = updates.failedRows;
    if (updates.startedAt) payload.started_at = updates.startedAt;
    if (updates.completedAt) payload.completed_at = updates.completedAt;

    await supabase.from("bulk_qr_batches" as any).update(payload).eq("id", batchId);
  }

  /**
   * Updates single row execution state (idempotent result tracking).
   */
  static async updateRowExecution(
    rowId: string,
    result: {
      status: BulkExecutionStatus;
      qrId?: string;
      errorCode?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    const supabase = getClient();
    await supabase
      .from("bulk_qr_batch_rows" as any)
      .update({
        execution_status: result.status,
        qr_id: result.qrId || null,
        error_code: result.errorCode || null,
        error_message: result.errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rowId);
  }

  /**
   * Deletes batch history record and its associated row tracking records.
   * Foreign keys explicitly ensure created QR assets are NEVER deleted.
   */
  static async deleteBatch(batchId: string, orgId: string): Promise<boolean> {
    const supabase = getClient();
    const { error } = await supabase
      .from("bulk_qr_batches" as any)
      .delete()
      .eq("id", batchId)
      .eq("organization_id", orgId);

    return !error;
  }
}
