/**
 * NXTQR — Bulk QR Processor & Execution Engine
 * Safe bounded-chunk executor with failure isolation, idempotency, and retry capabilities.
 */

import { QrStore } from "@/lib/domains/qr-store";
import { ResolverPublisher } from "@/lib/domains/resolver-publisher";
import { createAdminClient } from "@/lib/supabase/admin";
import { BulkQrStore } from "./store";
import { BulkExecutionStatus } from "./types";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

export interface ChunkProcessResult {
  batchId: string;
  batchStatus: string;
  batch?: any;
  processedCount: number;
  createdCount: number;
  failedCount: number;
  remainingCount: number;
  isComplete: boolean;
}

export class BulkQrProcessor {
  /**
   * Executes a single bounded chunk of pending rows for a batch.
   * Keeps execution times fast (< 10 seconds) and failure isolated per row.
   */
  static async processBatchChunk(
    batchId: string,
    orgId: string,
    actorId?: string,
    chunkSize = 25
  ): Promise<ChunkProcessResult> {
    const supabase: any = createAdminClient();

    // 1. Fetch batch state
    const { data: batch, error: batchErr } = await supabase
      .from("bulk_qr_batches" as any)
      .select("*")
      .eq("id", batchId)
      .eq("organization_id", orgId)
      .single();

    if (batchErr || !batch) {
      throw new Error(`Batch not found or inaccessible: ${batchId}`);
    }

    if (batch.status === "COMPLETED" || batch.status === "CANCELLED") {
      return {
        batchId,
        batchStatus: batch.status,
        batch,
        processedCount: batch.processed_rows,
        createdCount: batch.created_rows,
        failedCount: batch.failed_rows,
        remainingCount: 0,
        isComplete: true,
      };
    }

    // Set started_at if not yet set
    const nowIso = new Date().toISOString();
    if (!batch.started_at) {
      await BulkQrStore.updateBatchProgress(batchId, {
        status: "PROCESSING",
        startedAt: nowIso,
      });
    }

    // 2. Fetch candidate PENDING rows
    const { data: candidateRows, error: rowsErr } = await supabase
      .from("bulk_qr_batch_rows" as any)
      .select("id")
      .eq("batch_id", batchId)
      .eq("execution_status", "PENDING")
      .order("source_row_number", { ascending: true })
      .limit(chunkSize);

    if (rowsErr) {
      throw new Error(`Failed to query pending batch rows: ${rowsErr.message}`);
    }

    if (!candidateRows || candidateRows.length === 0) {
      // Check if any rows are still currently being processed by another worker
      const { count: inFlightCount } = await supabase
        .from("bulk_qr_batch_rows" as any)
        .select("id", { count: "exact", head: true })
        .eq("batch_id", batchId)
        .eq("execution_status", "PROCESSING");

      if ((inFlightCount || 0) > 0) {
        // Another chunk/worker is actively processing. Yield without completing prematurely.
        return {
          batchId,
          batchStatus: "PROCESSING",
          batch,
          processedCount: batch.processed_rows,
          createdCount: batch.created_rows,
          failedCount: batch.failed_rows,
          remainingCount: inFlightCount || 0,
          isComplete: false,
        };
      }

      // Truly no more pending or in-flight rows — finalize batch
      const isPartiallyFailed = (batch.failed_rows || 0) > 0;
      const finalStatus = isPartiallyFailed ? "PARTIALLY_COMPLETED" : "COMPLETED";

      await BulkQrStore.updateBatchProgress(batchId, {
        status: finalStatus,
        completedAt: nowIso,
      });

      return {
        batchId,
        batchStatus: finalStatus,
        batch: {
          ...batch,
          status: finalStatus,
          completed_at: nowIso,
          completedAt: nowIso,
        },
        processedCount: batch.processed_rows,
        createdCount: batch.created_rows,
        failedCount: batch.failed_rows,
        remainingCount: 0,
        isComplete: true,
      };
    }

    // Atomically claim candidate rows: transition execution_status PENDING -> PROCESSING
    const candidateIds = candidateRows.map((r: any) => r.id);
    const { data: claimedRows, error: claimErr } = await supabase
      .from("bulk_qr_batch_rows" as any)
      .update({
        execution_status: "PROCESSING",
        updated_at: nowIso,
      })
      .in("id", candidateIds)
      .eq("execution_status", "PENDING")
      .select("*")
      .order("source_row_number", { ascending: true });

    if (claimErr) {
      throw new Error(`Failed to claim batch rows: ${claimErr.message}`);
    }

    // If another concurrent request claimed these rows first, gracefully yield
    if (!claimedRows || claimedRows.length === 0) {
      return {
        batchId,
        batchStatus: "PROCESSING",
        batch,
        processedCount: batch.processed_rows,
        createdCount: batch.created_rows,
        failedCount: batch.failed_rows,
        remainingCount: candidateIds.length,
        isComplete: false,
      };
    }

    const pendingRows = claimedRows;

    // 3. Process each row in chunk with bounded failure isolation
    let newlyCreated = 0;
    let newlyFailed = 0;
    const batchDesign = batch.design_json || CANONICAL_QR_DESIGN_DEFAULTS;
    const isPublishMode = batch.creation_mode === "PUBLISH";

    for (const row of pendingRows) {
      const payload = row.normalized_payload || {};
      const rowId = row.id;

      try {
        // Skip if blocked by validation
        if (row.validation_status === "BLOCKED") {
          await BulkQrStore.updateRowExecution(rowId, {
            status: "SKIPPED",
            errorCode: "VALIDATION_BLOCKED",
            errorMessage: "Row skipped because it has blocking validation errors.",
          });
          newlyFailed++;
          continue;
        }

        // Idempotency: check if QR asset already created for this row
        if (row.qr_id) {
          await BulkQrStore.updateRowExecution(rowId, {
            status: "CREATED",
            qrId: row.qr_id,
          });
          newlyCreated++;
          continue;
        }

        // Create QR Asset using authoritative QrStore
        const record = await QrStore.createQr(
          {
            organizationId: orgId,
            ownerId: actorId,
            name: payload.name || `Bulk QR #${row.source_row_number}`,
            type: payload.type || "url",
            mode: "dynamic",
            destinationUrl: payload.destinationUrl,
            fallbackUrl: payload.fallbackUrl,
            campaignId: payload.campaignId || batch.campaign_id,
            folderId: payload.folderId || batch.folder_id,
            design: batchDesign,
          },
          undefined
        );

        // If Publish mode requested, publish to edge resolver
        if (isPublishMode && record.id) {
          try {
            await ResolverPublisher.publishResolverSnapshot({
              qrId: record.id,
              organizationId: orgId,
              actorId: actorId || "usr_bulk_processor",
              expectedVersion: 1,
              changeSummary: `Bulk created & published in batch '${batch.name}'`,
              db: null,
            });
          } catch (pubErr) {
            console.warn(`[BulkQrProcessor] Edge publish notice for QR ${record.id}:`, pubErr);
          }
        }

        // Record successful execution
        await BulkQrStore.updateRowExecution(rowId, {
          status: "CREATED",
          qrId: record.id,
        });

        newlyCreated++;
      } catch (err: any) {
        console.error(`[BulkQrProcessor] Error processing row ${row.source_row_number}:`, err);
        await BulkQrStore.updateRowExecution(rowId, {
          status: "FAILED",
          errorCode: "CREATION_FAILED",
          errorMessage: err.message || "Failed to create QR code asset.",
        });
        newlyFailed++;
      }
    }

    // 4. Update batch metrics
    const updatedProcessed = (batch.processed_rows || 0) + pendingRows.length;
    const updatedCreated = (batch.created_rows || 0) + newlyCreated;
    const updatedFailed = (batch.failed_rows || 0) + newlyFailed;

    // Check remaining
    const { count: remainingCount } = await supabase
      .from("bulk_qr_batch_rows" as any)
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("execution_status", "PENDING");

    const isComplete = (remainingCount || 0) === 0;
    const nextStatus = isComplete
      ? updatedFailed > 0
        ? "PARTIALLY_COMPLETED"
        : "COMPLETED"
      : "PROCESSING";

    await BulkQrStore.updateBatchProgress(batchId, {
      status: nextStatus,
      processedRows: updatedProcessed,
      createdRows: updatedCreated,
      failedRows: updatedFailed,
      completedAt: isComplete ? nowIso : undefined,
    });

    const updatedBatch = {
      ...batch,
      status: nextStatus,
      processedRows: updatedProcessed,
      processed_rows: updatedProcessed,
      createdRows: updatedCreated,
      created_rows: updatedCreated,
      failedRows: updatedFailed,
      failed_rows: updatedFailed,
      completedAt: isComplete ? nowIso : undefined,
      completed_at: isComplete ? nowIso : undefined,
    };

    return {
      batchId,
      batchStatus: nextStatus,
      batch: updatedBatch,
      processedCount: updatedProcessed,
      createdCount: updatedCreated,
      failedCount: updatedFailed,
      remainingCount: remainingCount || 0,
      isComplete,
    };
  }

  /**
   * Resets all FAILED rows to PENDING so they can be retried without re-creating successful QRs.
   */
  static async retryFailedRows(batchId: string, orgId: string): Promise<number> {
    const supabase: any = createAdminClient();

    // Verify batch
    const { data: batch } = await supabase
      .from("bulk_qr_batches" as any)
      .select("id, failed_rows")
      .eq("id", batchId)
      .eq("organization_id", orgId)
      .single();

    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    // Reset failed rows to PENDING
    const { data: updatedRows, error } = await supabase
      .from("bulk_qr_batch_rows" as any)
      .update({
        execution_status: "PENDING",
        error_code: null,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("batch_id", batchId)
      .eq("execution_status", "FAILED")
      .select("id");

    if (error) {
      throw new Error(`Failed to reset failed rows: ${error.message}`);
    }

    const retriedCount = updatedRows?.length || 0;

    // Update batch status back to QUEUED
    await BulkQrStore.updateBatchProgress(batchId, {
      status: "QUEUED",
      failedRows: Math.max(0, (batch.failed_rows || 0) - retriedCount),
    });

    return retriedCount;
  }

  /**
   * Cancels a running or queued batch safely. Leaves created QRs intact.
   */
  static async cancelBatch(batchId: string, orgId: string): Promise<void> {
    const supabase: any = createAdminClient();

    // Update remaining PENDING rows to SKIPPED
    await supabase
      .from("bulk_qr_batch_rows" as any)
      .update({
        execution_status: "SKIPPED",
        error_code: "BATCH_CANCELLED",
        error_message: "Execution cancelled by user.",
        updated_at: new Date().toISOString(),
      })
      .eq("batch_id", batchId)
      .eq("execution_status", "PENDING");

    await BulkQrStore.updateBatchProgress(batchId, {
      status: "CANCELLED",
      completedAt: new Date().toISOString(),
    });
  }
}
