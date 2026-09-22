"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import {
  BulkPipelineStep,
  BulkRowPayload,
  BulkRowValidationResult,
  ColumnMapping,
  BulkCreationMode,
  BulkBatchEntity,
  RawParsedSource,
  autoDetectColumnMapping,
  normalizeParsedRows,
  computeValidationGateMetrics,
  generateBulkManifestSummary,
} from "@/lib/domains/bulk-qr";
import {
  QrDesignV1,
  CANONICAL_QR_DESIGN_DEFAULTS,
} from "@nxtqr/qr-core";
import { BulkPipeline } from "./bulk-pipeline";
import { SourceStep } from "./steps/source-step";
import { ManualGridStep } from "./steps/manual-grid-step";
import { MappingStep } from "./steps/mapping-step";
import { ValidationStep } from "./steps/validation-step";
import { DesignStep } from "./steps/design-step";
import { OrganizeStep } from "./steps/organize-step";
import { ReviewStep } from "./steps/review-step";
import { RunwayStep } from "./steps/runway-step";
import { ResultStep } from "./steps/result-step";
import { BatchHistorySheet } from "./history/batch-history-sheet";
import { toast } from "sonner";

interface BulkQrStudioProps {
  orgSlug: string;
  orgId: string;
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
  brandKits?: Array<{ id: string; name: string; design?: Partial<QrDesignV1> }>;
  canPublish?: boolean;
}

export function BulkQrStudio({
  orgSlug,
  orgId,
  campaigns = [],
  folders = [],
  brandKits = [],
  canPublish = true,
}: BulkQrStudioProps) {
  // Current active step
  const [currentStep, setCurrentStep] = useState<BulkPipelineStep>("SOURCE");
  const [sourceMode, setSourceMode] = useState<"UPLOAD" | "MANUAL">("UPLOAD");
  const [sourceName, setSourceName] = useState<string>("Manual Batch");

  // Ingested / Normalized rows
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawCsvRows, setRawCsvRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [normalizedRows, setNormalizedRows] = useState<BulkRowPayload[]>([]);

  // Validation results
  const [validatedRows, setValidatedRows] = useState<BulkRowValidationResult[]>([]);

  // Design policy
  const [selectedDesign, setSelectedDesign] = useState<QrDesignV1>(CANONICAL_QR_DESIGN_DEFAULTS);
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | undefined>(undefined);

  // Organization policy
  const [batchCampaignId, setBatchCampaignId] = useState<string | undefined>(undefined);
  const [batchFolderId, setBatchFolderId] = useState<string | undefined>(undefined);

  // Execution Batch
  const [activeBatch, setActiveBatch] = useState<BulkBatchEntity | null>(null);

  // History sheet
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. Ingestion: CSV Parsed
  const handleParsedSource = (source: RawParsedSource) => {
    setSourceName(source.fileName || "Uploaded CSV");
    setSourceMode("UPLOAD");
    setCsvHeaders(source.headers);
    setRawCsvRows(source.rows);

    const initialMapping = autoDetectColumnMapping(source.headers);
    setColumnMapping(initialMapping);

    const normalized = normalizeParsedRows(source.rows, initialMapping, {
      campaigns,
      folders,
    });
    setNormalizedRows(normalized);

    setCurrentStep("MAP");
  };

  // 2. Ingestion: Manual Grid proceed
  const handleManualGridProceed = (rows: BulkRowPayload[]) => {
    setSourceName(`Manual Grid (${rows.length} rows)`);
    setSourceMode("MANUAL");
    setNormalizedRows(rows);
    setCurrentStep("VALIDATE");
  };

  // 3. Mapping proceed
  const handleMappingProceed = (
    mapping: ColumnMapping,
    normalized: BulkRowPayload[]
  ) => {
    setColumnMapping(mapping);
    setNormalizedRows(normalized);
    setCurrentStep("VALIDATE");
  };

  // 4. Validation proceed
  const handleValidationProceed = (results: BulkRowValidationResult[]) => {
    setValidatedRows(results);
    setCurrentStep("DESIGN");
  };

  // 5. Design proceed
  const handleDesignProceed = (design: QrDesignV1, brandKitId?: string) => {
    setSelectedDesign(design);
    setSelectedBrandKitId(brandKitId);
    setCurrentStep("ORGANIZE");
  };

  // 6. Organize proceed
  const handleOrganizeProceed = (
    campaignId: string | undefined,
    folderId: string | undefined,
    applyToUnassignedOnly: boolean
  ) => {
    setBatchCampaignId(campaignId);
    setBatchFolderId(folderId);

    // Apply batch assignments to validated rows
    setValidatedRows((prev) =>
      prev.map((item) => {
        const row = { ...item.row };
        if (campaignId) {
          if (!applyToUnassignedOnly || !row.campaign_id) {
            row.campaign_id = campaignId;
          }
        }
        if (folderId) {
          if (!applyToUnassignedOnly || !row.folder_id) {
            row.folder_id = folderId;
          }
        }
        return { ...item, row };
      })
    );

    setCurrentStep("REVIEW");
  };

  // 7. Review: Launch Batch Job into Runway
  const handleStartBatch = async (creationMode: BulkCreationMode) => {
    try {
      const eligibleItems = validatedRows.filter((r) => r.validationStatus !== "BLOCKED");

      if (eligibleItems.length === 0) {
        toast.error("No eligible rows to create.");
        return;
      }

      const payloadRows = eligibleItems.map((r, idx) => ({
        sourceRowNumber: r.rowNumber || idx + 1,
        name: r.row.name,
        type: r.row.qr_type || "url",
        destinationUrl: r.row.destination_url,
        campaignId: r.row.campaign_id || batchCampaignId || undefined,
        folderId: r.row.folder_id || batchFolderId || undefined,
        customSlug: r.row.custom_slug || undefined,
        validationStatus: r.validationStatus,
        errors: r.errors || [],
        rawPayload: r.row,
      }));

      const safeBatchName = (sourceName && sourceName.trim()) 
        ? `${sourceName.trim()} — ${new Date().toLocaleDateString()}` 
        : `Batch — ${new Date().toLocaleDateString()}`;

      const res = await fetch("/api/v1/bulk/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: safeBatchName.slice(0, 120),
          sourceType: sourceMode === "UPLOAD" ? "csv" : "manual_grid",
          creationMode,
          campaignId: batchCampaignId || undefined,
          folderId: batchFolderId || undefined,
          design: selectedDesign,
          manifest,
          rows: payloadRows,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.message || "Failed to initialize batch.");
        return;
      }

      const raw = await res.json();
      const batchData = raw?.data?.batch || raw?.data || raw?.batch;
      if (batchData) {
        setActiveBatch(batchData);
        setCurrentStep("CREATE");
        toast.success(`Queued batch of ${batchData.total_rows ?? batchData.totalRows} rows.`);
      }
    } catch (err) {
      console.error("Failed to start batch:", err);
      toast.error("Network error queuing batch.");
    }
  };

  // 8. Runway Complete
  const handleRunwayComplete = (completedBatch: BulkBatchEntity) => {
    setActiveBatch(completedBatch);
    setCurrentStep("RESULT");
  };

  // Reset Studio for a new batch
  const handleStartNew = () => {
    setCurrentStep("SOURCE");
    setSourceMode("UPLOAD");
    setSourceName("Manual Batch");
    setCsvHeaders([]);
    setRawCsvRows([]);
    setColumnMapping({});
    setNormalizedRows([]);
    setValidatedRows([]);
    setSelectedDesign(CANONICAL_QR_DESIGN_DEFAULTS);
    setSelectedBrandKitId(undefined);
    setBatchCampaignId(undefined);
    setBatchFolderId(undefined);
    setActiveBatch(null);
  };

  // Compute manifest summary for review
  const manifest = React.useMemo(() => {
    return generateBulkManifestSummary(validatedRows);
  }, [validatedRows]);

  const activeCampaignName = campaigns.find((c) => c.id === batchCampaignId)?.name;
  const activeFolderName = folders.find((f) => f.id === batchFolderId)?.name;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="space-y-2">
          <Breadcrumb>
            <BreadcrumbList className="text-xs font-mono text-muted-foreground">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${orgSlug}/qr`} className="hover:text-foreground transition-colors">
                    QR Codes
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-foreground font-medium">Bulk Create</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Batch QR Operations</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Bulk QR Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Transform structured data into validated QR assets through one controlled creation pipeline.
          </p>
        </div>

        {/* Global studio actions */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            className="border-border/80 hover:border-primary/40 bg-surface/80 hover:bg-muted text-foreground text-xs font-mono transition-all shadow-xs gap-1.5 cursor-pointer"
          >
            <Icon icon="lucide:history" className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Batch History</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open("/api/v1/bulk/template", "_blank")}
            className="border-border/80 hover:border-primary/40 bg-surface/80 hover:bg-muted text-foreground text-xs font-mono transition-all shadow-xs gap-1.5 cursor-pointer"
          >
            <Icon icon="lucide:file-down" className="w-3.5 h-3.5 text-primary" />
            <span>CSV Template</span>
          </Button>
        </div>
      </div>

      {/* Signature QR Batch Fabric Step Ribbon */}
      <BulkPipeline currentStep={currentStep} onStepClick={(step) => {
        // Only allow jumping back to previously completed steps
        const stepOrder: BulkPipelineStep[] = [
          "SOURCE",
          "MAP",
          "VALIDATE",
          "DESIGN",
          "ORGANIZE",
          "REVIEW",
          "CREATE",
          "RESULT",
        ];
        const currentIdx = stepOrder.indexOf(currentStep);
        const targetIdx = stepOrder.indexOf(step);
        if (targetIdx < currentIdx && currentStep !== "CREATE") {
          setCurrentStep(step);
        }
      }} />

      {/* Main Step Canvas */}
      <div>
        {/* Step 1: SOURCE */}
        {currentStep === "SOURCE" && (
          <div className="space-y-6">
            {sourceMode === "UPLOAD" ? (
              <SourceStep
                onParsedSource={handleParsedSource}
                onSwitchToManual={() => setSourceMode("MANUAL")}
              />
            ) : (
              <ManualGridStep
                campaigns={campaigns}
                folders={folders}
                onBack={() => setSourceMode("UPLOAD")}
                onProceed={handleManualGridProceed}
              />
            )}
          </div>
        )}

        {/* Step 2: MAP */}
        {currentStep === "MAP" && (
          <MappingStep
            headers={csvHeaders}
            rawRows={rawCsvRows}
            initialMapping={columnMapping}
            campaigns={campaigns}
            folders={folders}
            onBack={() => setCurrentStep("SOURCE")}
            onProceed={handleMappingProceed}
          />
        )}

        {/* Step 3: VALIDATE */}
        {currentStep === "VALIDATE" && (
          <ValidationStep
            rows={normalizedRows}
            campaigns={campaigns}
            folders={folders}
            onBack={() => setCurrentStep(sourceMode === "UPLOAD" ? "MAP" : "SOURCE")}
            onProceed={handleValidationProceed}
          />
        )}

        {/* Step 4: DESIGN */}
        {currentStep === "DESIGN" && (
          <DesignStep
            validatedRows={validatedRows}
            brandKits={brandKits}
            initialDesign={selectedDesign}
            onBack={() => setCurrentStep("VALIDATE")}
            onProceed={handleDesignProceed}
          />
        )}

        {/* Step 5: ORGANIZE */}
        {currentStep === "ORGANIZE" && (
          <OrganizeStep
            validatedRows={validatedRows}
            initialCampaigns={campaigns}
            initialFolders={folders}
            defaultCampaignId={batchCampaignId}
            defaultFolderId={batchFolderId}
            onBack={() => setCurrentStep("DESIGN")}
            onProceed={handleOrganizeProceed}
          />
        )}

        {/* Step 6: REVIEW */}
        {currentStep === "REVIEW" && (
          <ReviewStep
            manifest={manifest}
            sourceName={sourceName}
            sourceType={sourceMode === "UPLOAD" ? "CSV" : "MANUAL"}
            campaignName={activeCampaignName}
            folderName={activeFolderName}
            designName={selectedBrandKitId ? "Brand Kit Applied" : "Canonical Preset"}
            canPublish={canPublish}
            onBack={() => setCurrentStep("ORGANIZE")}
            onStartBatch={handleStartBatch}
          />
        )}

        {/* Step 7: CREATE (Runway) */}
        {currentStep === "CREATE" && activeBatch && (
          <RunwayStep
            batch={activeBatch}
            onComplete={handleRunwayComplete}
            onCancel={() => setCurrentStep("REVIEW")}
          />
        )}

        {/* Step 8: RESULT */}
        {currentStep === "RESULT" && activeBatch && (
          <ResultStep
            batch={activeBatch}
            orgSlug={orgSlug}
            onRetry={() => setCurrentStep("CREATE")}
            onStartNew={handleStartNew}
          />
        )}
      </div>

      {/* Historical Operations Audit Sheet */}
      <BatchHistorySheet
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
