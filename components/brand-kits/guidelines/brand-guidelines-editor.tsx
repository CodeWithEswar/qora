"use client";

import * as React from "react";
import { BrandGuidelines } from "@nxtqr/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle2, XCircle, Save } from "lucide-react";

interface BrandGuidelinesEditorProps {
  guidelines: BrandGuidelines;
  onUpdateGuidelines: (updated: BrandGuidelines) => void;
}

export function BrandGuidelinesEditor({
  guidelines,
  onUpdateGuidelines,
}: BrandGuidelinesEditorProps) {
  const [brandVoice, setBrandVoice] = React.useState(guidelines?.brandVoice || "");
  const [logoUsage, setLogoUsage] = React.useState(guidelines?.logoUsage || "");
  const [colorUsage, setColorUsage] = React.useState(guidelines?.colorUsage || "");
  const [qrUsage, setQrUsage] = React.useState(guidelines?.qrUsage || "");
  const [doRules, setDoRules] = React.useState<string[]>(guidelines?.doRules || []);
  const [dontRules, setDontRules] = React.useState<string[]>(guidelines?.dontRules || []);
  const [newDo, setNewDo] = React.useState("");
  const [newDont, setNewDont] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    setBrandVoice(guidelines?.brandVoice || "");
    setLogoUsage(guidelines?.logoUsage || "");
    setColorUsage(guidelines?.colorUsage || "");
    setQrUsage(guidelines?.qrUsage || "");
    setDoRules(guidelines?.doRules || []);
    setDontRules(guidelines?.dontRules || []);
    setIsDirty(false);
  }, [guidelines]);

  const handleAddDo = () => {
    if (!newDo.trim()) return;
    setDoRules([...doRules, newDo.trim()]);
    setNewDo("");
    setIsDirty(true);
  };

  const handleRemoveDo = (index: number) => {
    setDoRules(doRules.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleAddDont = () => {
    if (!newDont.trim()) return;
    setDontRules([...dontRules, newDont.trim()]);
    setNewDont("");
    setIsDirty(true);
  };

  const handleRemoveDont = (index: number) => {
    setDontRules(dontRules.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSave = () => {
    onUpdateGuidelines({
      brandVoice: brandVoice.trim(),
      logoUsage: logoUsage.trim(),
      colorUsage: colorUsage.trim(),
      qrUsage: qrUsage.trim(),
      doRules,
      dontRules,
    });
    setIsDirty(false);
  };

  return (
    <div className="p-6 rounded-xl border border-border/80 bg-surface/50 space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
            BRAND GUIDELINES & USAGE SPECIFICATIONS
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Document official voice, physical print tolerances, and team compliance standards.
          </p>
        </div>

        {isDirty && (
          <Button
            onClick={handleSave}
            size="sm"
            className="h-8 text-xs gap-1.5 bg-[#FA520F] hover:bg-[#E0480C] text-white"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Guidelines</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Brand Voice & Tone</Label>
          <Textarea
            value={brandVoice}
            onChange={(e) => {
              setBrandVoice(e.target.value);
              setIsDirty(true);
            }}
            placeholder="e.g. Authoritative, modern, precision-engineered digital identity."
            className="text-xs min-h-[80px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">QR Code Physical Print Guidance</Label>
          <Textarea
            value={qrUsage}
            onChange={(e) => {
              setQrUsage(e.target.value);
              setIsDirty(true);
            }}
            placeholder="e.g. Minimum 28mm x 28mm on glossy stock. Always maintain 4-module quiet zone."
            className="text-xs min-h-[80px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Logo Mark Placement Rules</Label>
          <Textarea
            value={logoUsage}
            onChange={(e) => {
              setLogoUsage(e.target.value);
              setIsDirty(true);
            }}
            placeholder="e.g. Center logo mark must not cover more than 24% of the scannable matrix."
            className="text-xs min-h-[80px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Color Application Standards</Label>
          <Textarea
            value={colorUsage}
            onChange={(e) => {
              setColorUsage(e.target.value);
              setIsDirty(true);
            }}
            placeholder="e.g. Ensure minimum 4.5:1 contrast against white surfaces. Never invert scannable modules on physical print without testing."
            className="text-xs min-h-[80px]"
          />
        </div>
      </div>

      {/* Do & Don't Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
        {/* DO LIST */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED PRACTICES (DO)</span>
          </div>

          <div className="space-y-1.5">
            {doRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 text-xs"
              >
                <span>{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDo(idx)}
                  className="text-muted-foreground hover:text-rose-500 cursor-pointer p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-1.5 pt-1">
              <Input
                value={newDo}
                onChange={(e) => setNewDo(e.target.value)}
                placeholder="Add rule..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDo())}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDo}
                className="h-8 text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* DONT LIST */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>PROHIBITED PRACTICES (DON'T)</span>
          </div>

          <div className="space-y-1.5">
            {dontRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 text-xs"
              >
                <span>{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDont(idx)}
                  className="text-muted-foreground hover:text-rose-500 cursor-pointer p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-1.5 pt-1">
              <Input
                value={newDont}
                onChange={(e) => setNewDont(e.target.value)}
                placeholder="Add prohibition..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDont())}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDont}
                className="h-8 text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
