"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ScanabilityCheckResult,
  ScanabilityFinding,
} from "@nxtqr/qr-core";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Shield,
  Layers,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  check: ScanabilityCheckResult | null;
  finding?: ScanabilityFinding | null;
  orgSlug: string;
  qrId?: string;
}

export function CheckInspectorSheet({
  open,
  onOpenChange,
  check,
  finding,
  orgSlug,
  qrId,
}: CheckInspectorSheetProps) {
  if (!check) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-mono font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>PASSED SPECIFICATION</span>
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-mono font-bold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>SUBOPTIMAL WARNING</span>
          </span>
        );
      case "blocking":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-mono font-bold">
            <XCircle className="h-3.5 w-3.5" />
            <span>CRITICAL BLOCKER</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Channel-specific engineering descriptions
  const getPhysicsExplanation = (channel: string) => {
    switch (channel) {
      case "contrast":
        return {
          isoStandard: "ISO/IEC 18004 § 5.2.2 — Reflectance / Luminance Contrast",
          whyItMatters:
            "Mobile camera image signal processors (ISPs) convert optical sensor frames to binarized black-and-white pixel grids before decoding. Low contrast or inverted color hues trigger edge thresholding errors, causing scans to fail under sunlight glare or low ambient lighting.",
          recommendation:
            "Ensure foreground modules have at least a 4.5:1 (ideally 7:1) luminance contrast ratio against the background canvas.",
        };
      case "quiet_zone":
        return {
          isoStandard: "ISO/IEC 18004 § 5.2.3 — Quiet Zone Margins",
          whyItMatters:
            "A minimum of 4 module widths of clean, uninterrupted background color is required around all 4 sides of the QR matrix. Without a sufficient quiet zone, nearby graphic elements or container borders bleed into the matrix timing lines, causing orientation detection failure.",
          recommendation:
            "Maintain at least 4 modules of quiet zone margin. For small physical prints (< 30 mm), 5 or 6 modules is recommended.",
        };
      case "finder_integrity":
        return {
          isoStandard: "ISO/IEC 18004 § 5.2.1 — Position Detection Patterns (Finder Eyes)",
          whyItMatters:
            "The 3 corner patterns (7×7 modules each) have a strict 1:1:3:1:1 concentric ratio. Scanners scan rows horizontally and vertically to find this ratio to orient and deskew the matrix. Any obstruction or low-contrast eye colors prevent camera algorithms from finding the QR code.",
          recommendation:
            "Keep the 3 finder patterns completely free of logo obstructions and ensure eye colors have high contrast against the background.",
        };
      case "logo_area":
        return {
          isoStandard: "Reed-Solomon Error Correction Headroom Analysis",
          whyItMatters:
            "Placing a center logo permanently damages the modules underneath it, consuming part of the mathematical Reed-Solomon recovery capacity. If the logo consumes more than 65% of the available budget, zero tolerance remains for real-world print wear, fingerprints, or lens distortion.",
          recommendation:
            "Limit center logo dimensions to less than 25% of the total matrix area, and use Error Correction Level H (30% recovery) when embedding logos.",
        };
      case "recovery":
        return {
          isoStandard: "ISO/IEC 18004 § 5.5 — Error Correction Levels",
          whyItMatters:
            "QR codes use Reed-Solomon polynomial coding over Galois Field GF(2^8). Level L provides 7% restoration, Level M provides 15%, Level Q provides 25%, and Level H provides 30%. For commercial marketing QRs, Level Q or H is essential.",
          recommendation:
            "For public signage and packaging with logos, configure Error Correction to Level Q or Level H.",
        };
      case "module_size":
        return {
          isoStandard: "ISO/IEC 18004 Annex E — Resolution and Print Sizing",
          whyItMatters:
            "Standard smartphone camera lenses have a minimum focal distance of approximately 8–10 cm and resolving limits governed by sensor pixel pitch. Individual modules must be at least 0.5 mm (preferably ≥ 1.0 mm) wide to be reliably resolved.",
          recommendation:
            "Ensure the printed QR code has a physical width that guarantees individual modules are at least 0.7 to 1.0 mm wide.",
        };
      default:
        return {
          isoStandard: "ISO/IEC 18004 QR Code Specification",
          whyItMatters:
            "Adhering to standard geometric and optical limits ensures universal compatibility across iOS Camera, Android Google Lens, and industrial barcode scanners.",
          recommendation:
            "Review design parameters in NXTQR Studio to ensure compliance.",
        };
    }
  };

  const physics = getPhysicsExplanation(check.channel);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 bg-card border-l border-border flex flex-col justify-between font-sans overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-2 border-b border-border pb-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                CHECK {check.channelNumber} &bull; {check.channel.toUpperCase()}
              </span>
              {getStatusBadge(check.status)}
            </div>
            <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
              {check.channelName} Validation
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {physics.isoStandard}
            </SheetDescription>
          </SheetHeader>

          {/* Observed Evidence */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>OBSERVED MEASUREMENTS</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 font-mono text-xs">
              {Object.entries(check.measurements).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground truncate pr-2">{k}:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Finding Detail if issue exists */}
          {finding && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs font-mono">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{finding.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {finding.description}
              </p>
            </div>
          )}

          {/* Why It Matters (Physical Camera Physics) */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>OPTICAL SENSOR &amp; MATHEMATICAL PHYSICS</span>
            </h4>
            <div className="p-4 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground leading-relaxed">
              {physics.whyItMatters}
            </div>
          </div>

          {/* Recommended Engineering Action */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>RECOMMENDED REMEDIATION</span>
            </h4>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground leading-relaxed">
              {finding?.remediation || physics.recommendation}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs border-border"
          >
            Close
          </Button>

          {qrId && (
            <Link href={`/${orgSlug}/qr/${qrId}`} target="_blank">
              <Button className="h-9 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm">
                <span>Fix in QR Studio</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
