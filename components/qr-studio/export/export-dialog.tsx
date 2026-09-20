import * as React from "react";
import {
  Download,
  FileCode,
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PRINT_PRESET_LIST,
  QrDesignV1,
  evaluateScanability,
  ScanabilityResultV1,
  ScanabilityOutputContext,
} from "@nxtqr/qr-core";
import { SignalStrip } from "../scanability/signal-strip";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrId: string;
  content: string;
  design: QrDesignV1;
  initialFormat?: "svg" | "png" | "pdf";
  onTriggerExport: (format: "svg" | "png" | "pdf", presetId?: string, size?: number) => Promise<void>;
  isExporting: boolean;
}

export function ExportDialog({
  isOpen,
  onClose,
  qrId,
  content,
  design,
  initialFormat = "svg",
  onTriggerExport,
  isExporting,
}: ExportDialogProps) {
  const [format, setFormat] = React.useState<"svg" | "png" | "pdf">(initialFormat);
  const [presetId, setPresetId] = React.useState<string>("sticker");
  const [pngSize, setPngSize] = React.useState<number>(1024);

  React.useEffect(() => {
    if (initialFormat) setFormat(initialFormat);
  }, [initialFormat]);

  // Context-aware scanability evaluation for export (Rules 78-80)
  const exportScanability: ScanabilityResultV1 = React.useMemo(() => {
    const selectedPreset = PRINT_PRESET_LIST.find((p) => p.id === presetId);
    let outputContext: ScanabilityOutputContext;

    if (format === "pdf") {
      outputContext = {
        type: "printExport",
        printPresetId: presetId,
        printWidthMm: selectedPreset ? selectedPreset.pageWidthMm : 50,
      };
    } else if (format === "png") {
      outputContext = {
        type: "digitalExport",
        exportSizePx: pngSize,
      };
    } else {
      outputContext = {
        type: "digitalExport",
        exportSizePx: 1024,
      };
    }

    return evaluateScanability(content, design, outputContext);
  }, [content, design, format, presetId, pngSize]);

  const isBlocked = exportScanability.status === "blocking" || exportScanability.blockersCount > 0;

  const handleExport = async () => {
    if (isBlocked) return;
    await onTriggerExport(format, presetId, pngSize);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md p-4 sm:p-6 border-border bg-surface rounded-2xl shadow-2xl flex flex-col gap-0 max-h-[calc(100vh-3rem)] overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Download className="h-4 w-4" />
            </div>
            <span>Export Production Artwork</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Download production-ready vector SVG, high-resolution PNG, or print-calibrated PDF files.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs min-w-0 overflow-y-auto max-h-[65vh] pr-0.5">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">File Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "svg", label: "Vector SVG", icon: FileCode, desc: "Infinite scale" },
                { id: "png", label: "Raster PNG", icon: ImageIcon, desc: "Web & social" },
                { id: "pdf", label: "Print PDF", icon: FileText, desc: "Press ready" },
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as any)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer space-y-1 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-surface hover:bg-surface-hover text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <p className="font-semibold text-xs leading-tight">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PDF Print Presets */}
          {format === "pdf" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold">Physical Print Preset</Label>
              <div className="space-y-1.5">
                {PRINT_PRESET_LIST.map((preset) => {
                  const isSelected = presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPresetId(preset.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-surface hover:bg-surface-hover text-foreground"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{preset.name}</p>
                        <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {preset.pageWidthMm}×{preset.pageHeightMm}mm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PNG Resolution Options */}
          {format === "png" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold">Pixel Dimensions</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 512, label: "512 × 512", desc: "Digital/Web" },
                  { size: 1024, label: "1024 × 1024", desc: "Standard" },
                  { size: 2048, label: "2048 × 2048", desc: "Ultra HD" },
                ].map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setPngSize(s.size)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer space-y-0.5 ${
                      pngSize === s.size
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-surface hover:bg-surface-hover text-foreground"
                    }`}
                  >
                    <p className="font-semibold text-xs">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Output-Specific Signal Check Strip (Rule 80) */}
          <div className="p-3 rounded-lg border border-border bg-surface-elevated/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Output Signal Check ({format.toUpperCase()})
              </span>
              {exportScanability.score !== undefined && (
                <span className="font-mono text-[11px] font-semibold">
                  {exportScanability.score} / 100
                </span>
              )}
            </div>

            <SignalStrip
              status={exportScanability.status}
              score={exportScanability.score}
              checks={exportScanability.checks}
              activeChannel={null}
              onSelectChannel={() => {}}
              recommendationsCount={exportScanability.recommendationsCount}
              blockersCount={exportScanability.blockersCount}
              compact={true}
            />

            {isBlocked ? (
              <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-[11px] flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Export blocked: Module size or contrast violates press safety limits.</span>
              </div>
            ) : exportScanability.recommendationsCount > 0 ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-0.5">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{exportScanability.summary}</span>
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isExporting} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting || isBlocked}
            className="gap-2 text-xs font-medium bg-primary hover:bg-[#cc3a05] text-white"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>Download {format.toUpperCase()}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
