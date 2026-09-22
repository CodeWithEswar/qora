"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BulkRowPayload,
  BulkRowValidationResult,
  BulkValidationGateMetrics,
  RowValidationStatus,
  validateBulkRowPayload,
  computeValidationGateMetrics,
} from "@/lib/domains/bulk-qr";
import { ValidationGate } from "../validation/validation-gate";
import { BulkSelectionBar } from "../validation/bulk-selection-bar";
import { RowInspectorSheet } from "../validation/row-inspector-sheet";
import { BulkEditDialog } from "../validation/bulk-edit-dialog";
import { EmptyState } from "@/components/empty-state";

interface ValidationStepProps {
  rows: BulkRowPayload[];
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
  onBack: () => void;
  onProceed: (validatedRows: BulkRowValidationResult[]) => void;
}

export function ValidationStep({
  rows: initialRows,
  campaigns = [],
  folders = [],
  onBack,
  onProceed,
}: ValidationStepProps) {
  // Local rows state so edits, duplicates, or removals immediately revalidate
  const [rows, setRows] = useState<BulkRowPayload[]>(initialRows);

  // Compute validation results for all rows
  const validationResults: BulkRowValidationResult[] = useMemo(() => {
    return rows.map((r, idx) => validateBulkRowPayload(r, idx + 1));
  }, [rows]);

  // Compute metrics for the gate
  const metrics: BulkValidationGateMetrics = useMemo(() => {
    return computeValidationGateMetrics(validationResults);
  }, [validationResults]);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<RowValidationStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRowNumbers, setSelectedRowNumbers] = useState<number[]>([]);

  // Dialog / Sheet states
  const [inspectedRow, setInspectedRow] = useState<BulkRowValidationResult | null>(null);
  const [bulkDialogMode, setBulkDialogMode] = useState<"campaign" | "folder" | "delete" | null>(null);
  const [showBlockedProceedDialog, setShowBlockedProceedDialog] = useState(false);

  // Filtered rows
  const filteredResults = useMemo(() => {
    return validationResults.filter((res) => {
      // Status filter
      if (statusFilter !== "ALL" && res.validationStatus !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = res.row.name?.toLowerCase().includes(q);
        const matchesDest = res.row.destination_url?.toLowerCase().includes(q);
        const matchesRow = String(res.rowNumber).includes(q);
        if (!matchesName && !matchesDest && !matchesRow) return false;
      }
      return true;
    });
  }, [validationResults, statusFilter, searchQuery]);

  // Pagination (50 rows per page for smooth responsiveness)
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const paginatedResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, page]);

  // Selection handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowNumbers(filteredResults.map((r) => r.rowNumber));
    } else {
      setSelectedRowNumbers([]);
    }
  };

  const handleToggleRow = (rowNumber: number, checked: boolean) => {
    setSelectedRowNumbers((prev) =>
      checked ? [...prev, rowNumber] : prev.filter((n) => n !== rowNumber)
    );
  };

  // Row operations
  const handleSaveInspectedRow = (
    rowNumber: number,
    updatedPayload: BulkRowPayload
  ) => {
    setRows((prev) => {
      const next = [...prev];
      const targetIdx = rowNumber - 1;
      if (targetIdx >= 0 && targetIdx < next.length) {
        next[targetIdx] = updatedPayload;
      }
      return next;
    });
    setInspectedRow(null);
  };

  const handleDuplicateRow = (rowNumber: number) => {
    setRows((prev) => {
      const targetIdx = rowNumber - 1;
      const target = prev[targetIdx];
      const copy = { ...target, name: `${target.name || "QR"} (Copy)` };
      const next = [...prev];
      next.splice(targetIdx + 1, 0, copy);
      return next;
    });
  };

  const handleRemoveSingleRow = (rowNumber: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== rowNumber - 1));
    setSelectedRowNumbers((prev) => prev.filter((n) => n !== rowNumber));
  };

  // Bulk actions
  const handleApplyBulkCampaign = (campaignId: string | undefined) => {
    setRows((prev) =>
      prev.map((r, idx) => {
        if (selectedRowNumbers.includes(idx + 1)) {
          return { ...r, campaign_id: campaignId };
        }
        return r;
      })
    );
    setSelectedRowNumbers([]);
  };

  const handleApplyBulkFolder = (folderId: string | undefined) => {
    setRows((prev) =>
      prev.map((r, idx) => {
        if (selectedRowNumbers.includes(idx + 1)) {
          return { ...r, folder_id: folderId };
        }
        return r;
      })
    );
    setSelectedRowNumbers([]);
  };

  const handleConfirmBulkDelete = () => {
    setRows((prev) =>
      prev.filter((_, idx) => !selectedRowNumbers.includes(idx + 1))
    );
    setSelectedRowNumbers([]);
  };

  // Proceed handler
  const handleProceedClick = () => {
    if (metrics.blockedRows > 0) {
      setShowBlockedProceedDialog(true);
    } else {
      onProceed(validationResults);
    }
  };

  const handleProceedValidOnly = () => {
    setShowBlockedProceedDialog(false);
    const validOnly = validationResults.filter(
      (r) => r.validationStatus !== "BLOCKED"
    );
    onProceed(validOnly);
  };

  return (
    <div className="space-y-6">
      {/* Signature Validation Gate */}
      <ValidationGate
        metrics={metrics}
        activeFilter={statusFilter}
        onSelectFilter={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
      />

      {/* Grid Controls Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Icon
            icon="lucide:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
          />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search rows by name or destination..."
            className="pl-9 h-9 text-xs bg-neutral-950/80 border-white/10 text-neutral-200"
          />
        </div>

        {/* Active Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilter !== "ALL" && (
            <Badge
              variant="outline"
              className="text-xs font-mono border-orange-500/30 bg-orange-500/10 text-orange-400 flex items-center gap-1.5 py-1"
            >
              <span>Status: {statusFilter}</span>
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className="hover:text-white"
              >
                <Icon icon="lucide:x" className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {searchQuery && (
            <Badge
              variant="outline"
              className="text-xs font-mono border-white/10 bg-neutral-800 text-neutral-300 flex items-center gap-1.5 py-1"
            >
              <span>Query: {searchQuery}</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-white"
              >
                <Icon icon="lucide:x" className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(statusFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-neutral-400 hover:text-white underline font-mono"
            >
              Clear filters
            </button>
          )}

          <div className="text-xs font-mono text-neutral-500 ml-auto">
            Showing {filteredResults.length} of {validationResults.length} rows
          </div>
        </div>
      </div>

      {/* Desktop Data Grid (Hidden on Mobile) */}
      <div className="hidden md:block rounded-xl border border-border/80 bg-surface/70 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-muted/60 text-muted-foreground uppercase font-mono text-[10px] border-b border-border/80">
            <tr>
              <th className="px-3 py-3 w-10 text-center">
                <Checkbox
                  checked={
                    selectedRowNumbers.length > 0 &&
                    filteredResults.every((r) =>
                      selectedRowNumbers.includes(r.rowNumber)
                    )
                  }
                  onCheckedChange={handleToggleSelectAll}
                />
              </th>
              <th className="px-3 py-3 w-12 text-center">#</th>
              <th className="px-3 py-3 min-w-[160px]">QR Name</th>
              <th className="px-3 py-3 w-28">Type</th>
              <th className="px-3 py-3 min-w-[240px]">Destination / Payload</th>
              <th className="px-3 py-3 min-w-[120px]">Campaign</th>
              <th className="px-3 py-3 min-w-[120px]">Folder</th>
              <th className="px-3 py-3 w-28 text-center">Validation</th>
              <th className="px-3 py-3 w-16 text-center">•••</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedResults.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <EmptyState
                    variant="table"
                    title="No rows match filter criteria"
                    description="Try clearing your filters or adjusting your search term to see more rows."
                    letter="S"
                  />
                </td>
              </tr>
            ) : (
              paginatedResults.map((item) => {
                const isSelected = selectedRowNumbers.includes(item.rowNumber);
                const isBlocked = item.validationStatus === "BLOCKED";
                const isWarning = item.validationStatus === "WARNING";
                const isReady = item.validationStatus === "READY";

                return (
                  <tr
                    key={item.rowNumber}
                    className={`hover:bg-neutral-900/50 transition-colors ${
                      isSelected ? "bg-orange-500/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleToggleRow(item.rowNumber, !!checked)
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-neutral-500 text-[11px]">
                      {String(item.rowNumber).padStart(2, "0")}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-neutral-200">
                      {item.row.name || (
                        <span className="text-neutral-600 italic">Untitled</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] border-white/10 text-neutral-300 capitalize"
                      >
                        {item.row.qr_type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-neutral-400 truncate max-w-xs">
                      {item.row.destination_url || (
                        <span className="text-neutral-600 italic">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-400">
                      {item.row.campaign_id ? (
                        campaigns.find((c) => c.id === item.row.campaign_id)?.name ||
                        item.row.campaign_id
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-400">
                      {item.row.folder_id ? (
                        folders.find((f) => f.id === item.row.folder_id)?.name ||
                        item.row.folder_id
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 ${
                          isReady
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : isWarning
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-red-500/30 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {item.validationStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5"
                          >
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-neutral-900 border-white/10 text-neutral-200 text-xs"
                        >
                          <DropdownMenuItem onClick={() => setInspectedRow(item)}>
                            <Icon icon="lucide:pencil" className="w-3.5 h-3.5 mr-2 text-orange-400" />
                            Inspect & Correct
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateRow(item.rowNumber)}>
                            <Icon icon="lucide:copy" className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                            Duplicate Row
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveSingleRow(item.rowNumber)}
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                          >
                            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5 mr-2" />
                            Remove from Batch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (Hidden on Desktop) */}
      <div className="block md:hidden space-y-3">
        {paginatedResults.length === 0 ? (
          <div className="rounded-xl border border-border/80 bg-surface/70 p-6">
            <EmptyState
              variant="card"
              title="No rows match filter criteria"
              description="Try clearing your filters or adjusting your search term."
              letter="S"
            />
          </div>
        ) : (
          paginatedResults.map((item) => {
            const isSelected = selectedRowNumbers.includes(item.rowNumber);
            const isBlocked = item.validationStatus === "BLOCKED";
            const isWarning = item.validationStatus === "WARNING";
            const isReady = item.validationStatus === "READY";

            return (
              <div
                key={item.rowNumber}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/80 bg-surface/70"
                }`}
              >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleToggleRow(item.rowNumber, !!checked)
                    }
                  />
                  <span className="font-mono text-xs text-neutral-500">
                    #{String(item.rowNumber).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-sm text-neutral-100">
                    {item.row.name || "Untitled"}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-2 py-0.5 ${
                    isReady
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : isWarning
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {item.validationStatus}
                </Badge>
              </div>

              <div className="text-xs font-mono text-neutral-400 truncate mb-3">
                {item.row.destination_url || "—"}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-white/10 font-mono">
                    {item.row.qr_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setInspectedRow(item)}
                    className="h-7 text-xs border-white/10 hover:bg-neutral-800 text-neutral-300"
                  >
                    Inspect
                  </Button>
                </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-neutral-900/50 text-xs font-mono text-neutral-400">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 text-xs border-white/10"
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 text-xs border-white/10"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Floating Bulk Selection Bar */}
      <BulkSelectionBar
        selectedCount={selectedRowNumbers.length}
        totalCount={validationResults.length}
        onClearSelection={() => setSelectedRowNumbers([])}
        onOpenBulkCampaign={() => setBulkDialogMode("campaign")}
        onOpenBulkFolder={() => setBulkDialogMode("folder")}
        onRevalidate={() => {
          // Re-running validation occurs reactively
          setSelectedRowNumbers([]);
        }}
        onOpenBulkDelete={() => setBulkDialogMode("delete")}
      />

      {/* Single Row Inspector Sheet */}
      <RowInspectorSheet
        isOpen={!!inspectedRow}
        rowResult={inspectedRow}
        campaigns={campaigns}
        folders={folders}
        onClose={() => setInspectedRow(null)}
        onSaveRow={handleSaveInspectedRow}
      />

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        mode={bulkDialogMode}
        selectedCount={selectedRowNumbers.length}
        campaigns={campaigns}
        folders={folders}
        onClose={() => setBulkDialogMode(null)}
        onApplyCampaign={handleApplyBulkCampaign}
        onApplyFolder={handleApplyBulkFolder}
        onConfirmDelete={handleConfirmBulkDelete}
      />

      {/* Blocked Rows Confirmation Dialog */}
      <AlertDialog
        open={showBlockedProceedDialog}
        onOpenChange={setShowBlockedProceedDialog}
      >
        <AlertDialogContent className="bg-neutral-950 border-white/10 text-neutral-100 max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-2">
              <Icon icon="lucide:alert-circle" className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-neutral-100 font-serif">
              {metrics.blockedRows} Blocked {metrics.blockedRows === 1 ? "Row" : "Rows"} Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-400 space-y-2">
              <p>
                {metrics.blockedRows} records contain critical validation errors
                (missing name, malformed URL, or SSRF security restriction).
              </p>
              <p>
                You can return to fix these rows, or proceed with the{" "}
                <strong className="text-emerald-400">
                  {metrics.readyRows + metrics.warningRows} eligible rows
                </strong>{" "}
                only.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              onClick={() => setShowBlockedProceedDialog(false)}
              className="border-white/10 hover:bg-neutral-800 text-neutral-300"
            >
              Return and Fix
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProceedValidOnly}
              className="bg-orange-600 hover:bg-orange-500 text-white font-medium"
            >
              Create Eligible Rows Only ({metrics.readyRows + metrics.warningRows})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-white/10 hover:bg-neutral-800 text-neutral-300"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleProceedClick}
          disabled={validationResults.length === 0}
          className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 font-medium"
        >
          Proceed to Design Policy
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
