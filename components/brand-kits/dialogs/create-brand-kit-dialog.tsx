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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  Layers,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { CreateBrandKitRequestV1 } from "@nxtqr/contracts";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";

interface CreateBrandKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateBrandKitRequestV1) => Promise<void>;
}

export function CreateBrandKitDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateBrandKitDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form Fields
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startingPoint, setStartingPoint] = React.useState<"blank" | "starter">("blank");
  const [primaryColor, setPrimaryColor] = React.useState("#FA520F");
  const [secondaryColor, setSecondaryColor] = React.useState("#1F1F1F");
  const [isDefault, setIsDefault] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setName("");
      setDescription("");
      setStartingPoint("blank");
      setPrimaryColor("#FA520F");
      setSecondaryColor("#1F1F1F");
      setIsDefault(false);
    }
  }, [open]);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error("Please provide a Brand Kit name");
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1) as any);
  };

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1) as any);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        primaryColor,
        secondaryColor,
        isDefault,
        initialTemplate: startingPoint,
      });
      toast.success("Brand Kit created successfully.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create Brand Kit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 space-y-6">
        <DialogHeader className="text-left space-y-2 pr-10 sm:pr-12">
          {/* Step Progress & Indicator Row - Grouped on left to leave right side completely free */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FA520F]/10 border border-[#FA520F]/20 text-[#FA520F]">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                STEP {step} OF 4
              </span>
            </div>
            <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 4`}>
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    step === i
                      ? "w-6 bg-[#FA520F]"
                      : step > i
                      ? "w-2.5 bg-[#FA520F]/70"
                      : "w-2 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold font-display text-foreground leading-snug">
            {step === 1 && "Brand Identity Basics"}
            {step === 2 && "Starting Blueprint"}
            {step === 3 && "Core Signature Palette"}
            {step === 4 && "Review & Establish Identity"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {step === 1 && "Give your new Brand Kit a clear name and operational description."}
            {step === 2 && "Choose whether to initialize with a clean blank slate or default structure."}
            {step === 3 && "Specify the primary signature color that governs scannable QRs and UI."}
            {step === 4 && "Verify the brand parameters before persisting to the authoritative database."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Brand Kit Name <span className="text-[#FA520F]">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NXTQR Production, Summer Campaign 2026"
                className="text-xs h-9 bg-surface border-border"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe which products, teams, or marketing materials this brand kit governs..."
                rows={3}
                className="text-xs bg-surface border-border"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-surface/50">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">Set as Workspace Default</span>
                <p className="text-[11px] text-muted-foreground">Apply to new QR codes automatically</p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
          </div>
        )}

        {/* Step 2: Starting Point */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
            <div
              onClick={() => setStartingPoint("blank")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                startingPoint === "blank"
                  ? "border-[#FA520F] bg-[#FA520F]/5 shadow-xs"
                  : "border-border hover:border-border/80 bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-surface-elevated border border-border">
                  <Layers className="w-4 h-4 text-foreground" />
                </div>
                {startingPoint === "blank" && (
                  <Badge variant="secondary" className="bg-[#FA520F] text-white text-[9px] px-1.5 py-0">
                    Selected
                  </Badge>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Blank Slate</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Start fresh. Zero default assets or arbitrary presets.
                </p>
              </div>
            </div>

            <div
              onClick={() => setStartingPoint("starter")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                startingPoint === "starter"
                  ? "border-[#FA520F] bg-[#FA520F]/5 shadow-xs"
                  : "border-border hover:border-border/80 bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-surface-elevated border border-border">
                  <Sparkles className="w-4 h-4 text-[#FA520F]" />
                </div>
                {startingPoint === "starter" && (
                  <Badge variant="secondary" className="bg-[#FA520F] text-white text-[9px] px-1.5 py-0">
                    Selected
                  </Badge>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Guided Starter</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Pre-configures basic semantic color tokens and standard typography hierarchy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Initial Colors */}
        {step === 3 && (
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Primary Signature Color <span className="text-[#FA520F]">*</span>
              </label>
              <div className="flex items-center gap-2.5">
                <ColorPicker
                  value={primaryColor}
                  onChange={(val) => setPrimaryColor(val.toUpperCase())}
                  showHex={false}
                  className="w-9 h-9 p-0 flex items-center justify-center bg-surface border-border shrink-0 hover:border-border/80"
                  swatchClassName="w-6 h-6 rounded-md"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())}
                  placeholder="#FA520F"
                  className="font-mono text-xs uppercase h-9 bg-surface border-border flex-1"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Powers your primary QR foreground modules, primary CTAs, and active highlights.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Secondary Brand Color</label>
              <div className="flex items-center gap-2.5">
                <ColorPicker
                  value={secondaryColor}
                  onChange={(val) => setSecondaryColor(val.toUpperCase())}
                  showHex={false}
                  className="w-9 h-9 p-0 flex items-center justify-center bg-surface border-border shrink-0 hover:border-border/80"
                  swatchClassName="w-6 h-6 rounded-md"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value.toUpperCase())}
                  placeholder="#1F1F1F"
                  className="font-mono text-xs uppercase h-9 bg-surface border-border flex-1"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Secondary tone for frames, typography, and card surfaces.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-3 py-1">
            <div className="p-3.5 rounded-xl border border-border/80 bg-surface/60 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Identity Name:</span>
                <span className="font-bold text-foreground">{name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Starting Mode:</span>
                <span className="font-medium text-foreground capitalize">{startingPoint}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Primary Color:</span>
                <span className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {primaryColor}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workspace Default:</span>
                <span className="font-medium text-foreground">{isDefault ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-[#FA520F]/20 bg-[#FA520F]/5 text-[11px] text-muted-foreground flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#FA520F] shrink-0" />
              <span>Immutable Revision 1 will be committed automatically upon creation.</span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t border-border/60">
          <div>
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="text-xs h-8 gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="text-xs h-8 gap-1 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                size="sm"
                onClick={handleFinish}
                className="text-xs h-8 gap-1 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>{isSubmitting ? "Creating..." : "Establish Brand Kit"}</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
