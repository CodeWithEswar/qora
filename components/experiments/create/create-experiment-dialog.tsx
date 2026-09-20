"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Split,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle,
  Percent,
} from "lucide-react";
import { EligibleDynamicQrOption, CreateExperimentStepInput } from "../types";

interface CreateExperimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleQrs: EligibleDynamicQrOption[];
  onCreated: (newExp: any) => void;
  orgSlug: string;
}

export function CreateExperimentDialog({
  isOpen,
  onClose,
  eligibleQrs,
  onCreated,
  orgSlug,
}: CreateExperimentDialogProps) {
  const [step, setStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedQrId, setSelectedQrId] = React.useState(eligibleQrs[0]?.id || "");
  const [variantAUrl, setVariantAUrl] = React.useState(eligibleQrs[0]?.defaultUrl || "");
  const [variantBUrl, setVariantBUrl] = React.useState("https://");
  const [splitRatio, setSplitRatio] = React.useState<number>(50); // 50 means 50/50, 70 means 70/30, etc.

  // Update default destination when QR changes
  React.useEffect(() => {
    if (selectedQrId) {
      const qr = eligibleQrs.find((q) => q.id === selectedQrId);
      if (qr?.defaultUrl) {
        setVariantAUrl(qr.defaultUrl);
      }
    }
  }, [selectedQrId, eligibleQrs]);

  const handleReset = () => {
    setStep(1);
    setName("");
    setDescription("");
    setSelectedQrId(eligibleQrs[0]?.id || "");
    setVariantAUrl(eligibleQrs[0]?.defaultUrl || "");
    setVariantBUrl("https://");
    setSplitRatio(50);
    setErrorMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Step 1 validation
  const canProceedStep1 = name.trim().length >= 3 && Boolean(selectedQrId);

  // Step 2 validation
  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };
  const canProceedStep2 = isValidUrl(variantAUrl) && isValidUrl(variantBUrl);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const weightA = splitRatio;
    const weightB = 100 - splitRatio;

    const payload: CreateExperimentStepInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      qrId: selectedQrId,
      goalMetric: "scans",
      variants: [
        {
          name: "Variant A (Control)",
          destinationUrl: variantAUrl.trim(),
          trafficWeight: weightA,
        },
        {
          name: "Variant B (Challenger)",
          destinationUrl: variantBUrl.trim(),
          trafficWeight: weightB,
        },
      ],
    };

    try {
      const res = await fetch("/api/v1/experiments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-slug": orgSlug,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || "Failed to launch experiment.");
      }

      const json = await res.json();
      onCreated(json.data);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create experiment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedQr = eligibleQrs.find((q) => q.id === selectedQrId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl bg-[#111114] border border-white/10 text-white rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-white/8 bg-[#141418]">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-wider uppercase font-bold">
            <Split className="h-3.5 w-3.5" />
            <span>STEP {step} OF 3 · A/B TRAFFIC EXPERIMENT</span>
          </div>
          <DialogTitle className="text-lg font-semibold text-white tracking-tight">
            {step === 1 && "Configure Experiment Identity"}
            {step === 2 && "Define Routing Variants"}
            {step === 3 && "Traffic Weight & Launch Review"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            {step === 1 && "Assign a target Dynamic QR code and clear experiment hypothesis."}
            {step === 2 && "Enter the destination URLs for Variant A (Control) and Variant B (Challenger)."}
            {step === 3 && "Set edge traffic allocation percentages and verify the routing pipeline."}
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Identity & Target QR */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-300">
                  Target Dynamic QR Asset *
                </Label>
                {eligibleQrs.length > 0 ? (
                  <Select value={selectedQrId} onValueChange={setSelectedQrId}>
                    <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs text-zinc-200">
                      <SelectValue placeholder="Select Dynamic QR" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141418] border-white/10 text-xs text-zinc-200">
                      {eligibleQrs.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          <div className="flex items-center gap-2">
                            <QrCode className="h-3.5 w-3.5 text-primary" />
                            <span>{q.name}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">({q.slug})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    No Dynamic QR codes available. Please create or publish a Dynamic QR first.
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-300">Experiment Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Checkout Flow Comparison"
                  className="h-9 bg-black/40 border-white/10 text-xs text-zinc-200 focus-visible:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-300">
                  Hypothesis / Objective (Optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Testing if directing mobile traffic to the dedicated app store page increases conversion rate by 15%."
                  rows={3}
                  className="bg-black/40 border-white/10 text-xs text-zinc-200 focus-visible:ring-primary/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Variants & Destinations */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Variant A (Control) */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-[10px]">
                      A
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">Variant A (Control)</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">CURRENT DESTINATION</span>
                </div>
                <Input
                  type="url"
                  value={variantAUrl}
                  onChange={(e) => setVariantAUrl(e.target.value)}
                  placeholder="https://example.com/original-landing"
                  className="h-9 bg-black/40 border-white/10 text-xs font-mono text-zinc-200 focus-visible:ring-primary/50"
                />
              </div>

              {/* Variant B (Challenger) */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-[10px]">
                      B
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      Variant B (Challenger)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-primary">NEW DESTINATION</span>
                </div>
                <Input
                  type="url"
                  value={variantBUrl}
                  onChange={(e) => setVariantBUrl(e.target.value)}
                  placeholder="https://example.com/new-checkout"
                  className="h-9 bg-black/40 border-white/10 text-xs font-mono text-zinc-200 focus-visible:ring-primary/50"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Traffic Weight Allocation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0d0d10] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">Traffic Allocation Split</span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {splitRatio}% A / {100 - splitRatio}% B
                  </span>
                </div>

                {/* Visual Allocation Split Bar */}
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${splitRatio}%` }}
                  />
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${100 - splitRatio}%` }}
                  />
                </div>

                {/* Preset Split Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { label: "50 / 50 (Even)", ratio: 50 },
                    { label: "70 / 30", ratio: 70 },
                    { label: "80 / 20", ratio: 80 },
                    { label: "90 / 10", ratio: 90 },
                  ].map((preset) => (
                    <button
                      key={preset.ratio}
                      type="button"
                      onClick={() => setSplitRatio(preset.ratio)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                        splitRatio === preset.ratio
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Pipeline Preview */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                  PIPELINE ARCHITECTURE
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <QrCode className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-semibold">{selectedQr?.name || "Target QR"}</span>
                  <span className="font-mono text-zinc-500">➔</span>
                  <span>Edge Deterministic Split</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-blue-500/5 border border-blue-500/20 text-blue-300 truncate">
                    A: {splitRatio}% ➔ {variantAUrl}
                  </div>
                  <div className="p-2 rounded bg-purple-500/5 border border-purple-500/20 text-purple-300 truncate">
                    B: {100 - splitRatio}% ➔ {variantBUrl}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="p-4 sm:p-5 border-t border-white/8 bg-[#141418] flex items-center justify-between sm:justify-between">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                className="h-8 text-xs text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-8 text-xs bg-transparent border-white/10 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>

            {step < 3 ? (
              <Button
                size="sm"
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                onClick={() => setStep(step + 1)}
                className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-medium gap-1"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="h-8 text-xs bg-primary hover:bg-primary/90 text-white font-medium gap-1.5 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  "Deploying Pipeline..."
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Launch A/B Routing
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
