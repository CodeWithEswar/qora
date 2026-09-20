"use client";

import * as React from "react";
import { BrandGovernance } from "@nxtqr/contracts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface BrandGovernanceControlsProps {
  governance: BrandGovernance;
  onUpdateGovernance: (updated: BrandGovernance) => void;
}

export function BrandGovernanceControls({
  governance,
  onUpdateGovernance,
}: BrandGovernanceControlsProps) {
  const [allowCustomColors, setAllowCustomColors] = React.useState(governance?.allowCustomColors ?? true);
  const [allowCustomLogos, setAllowCustomLogos] = React.useState(governance?.allowCustomLogos ?? true);
  const [allowQrStyleOverrides, setAllowQrStyleOverrides] = React.useState(governance?.allowQrStyleOverrides ?? true);
  const [requireApprovedTemplate, setRequireApprovedTemplate] = React.useState(governance?.requireApprovedTemplate ?? false);
  const [enforceScanabilityLevel, setEnforceScanabilityLevel] = React.useState(governance?.enforceScanabilityLevel ?? "warning");
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    setAllowCustomColors(governance?.allowCustomColors ?? true);
    setAllowCustomLogos(governance?.allowCustomLogos ?? true);
    setAllowQrStyleOverrides(governance?.allowQrStyleOverrides ?? true);
    setRequireApprovedTemplate(governance?.requireApprovedTemplate ?? false);
    setEnforceScanabilityLevel(governance?.enforceScanabilityLevel ?? "warning");
    setIsDirty(false);
  }, [governance]);

  const handleSave = () => {
    onUpdateGovernance({
      allowCustomColors,
      allowCustomLogos,
      allowQrStyleOverrides,
      requireApprovedTemplate,
      enforceScanabilityLevel,
      lockedFields: [
        ...(!allowCustomColors ? ["colors"] : []),
        ...(!allowCustomLogos ? ["logos"] : []),
        ...(!allowQrStyleOverrides ? ["qrStyle"] : []),
      ],
    });
    setIsDirty(false);
  };

  return (
    <div className="p-6 rounded-xl border border-border/80 bg-surface/50 space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
            GOVERNANCE CONTROLS
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure permission boundaries applied when team members design or publish QR codes.
          </p>
        </div>

        {isDirty && (
          <Button
            onClick={handleSave}
            size="sm"
            className="h-8 text-xs gap-1.5 bg-[#FA520F] hover:bg-[#E0480C] text-white"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Rules</span>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Toggle 1 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-surface">
          <div className="space-y-0.5 pr-4">
            <Label className="text-xs font-semibold text-foreground">
              Allow Custom Colors
            </Label>
            <p className="text-[11px] text-muted-foreground">
              When disabled, creators can only choose colors from this Brand Kit's approved palette.
            </p>
          </div>
          <Switch
            checked={allowCustomColors}
            onCheckedChange={(v) => {
              setAllowCustomColors(v);
              setIsDirty(true);
            }}
          />
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-surface">
          <div className="space-y-0.5 pr-4">
            <Label className="text-xs font-semibold text-foreground">
              Allow Custom Logo Uploads
            </Label>
            <p className="text-[11px] text-muted-foreground">
              When disabled, creators must pick from the approved logo library in this kit.
            </p>
          </div>
          <Switch
            checked={allowCustomLogos}
            onCheckedChange={(v) => {
              setAllowCustomLogos(v);
              setIsDirty(true);
            }}
          />
        </div>

        {/* Toggle 3 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-surface">
          <div className="space-y-0.5 pr-4">
            <Label className="text-xs font-semibold text-foreground">
              Allow QR Style Geometry Overrides
            </Label>
            <p className="text-[11px] text-muted-foreground">
              When disabled, QRs must use one of the approved branded QR style presets.
            </p>
          </div>
          <Switch
            checked={allowQrStyleOverrides}
            onCheckedChange={(v) => {
              setAllowQrStyleOverrides(v);
              setIsDirty(true);
            }}
          />
        </div>

        {/* Toggle 4 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-surface">
          <div className="space-y-0.5 pr-4">
            <Label className="text-xs font-semibold text-foreground">
              Require Template Approval
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Require administrative approval before publishing experiences that deviate from presets.
            </p>
          </div>
          <Switch
            checked={requireApprovedTemplate}
            onCheckedChange={(v) => {
              setRequireApprovedTemplate(v);
              setIsDirty(true);
            }}
          />
        </div>

        {/* Select: Scanability threshold */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-surface">
          <div className="space-y-0.5 pr-4">
            <Label className="text-xs font-semibold text-foreground">
              Scanability Enforcement Level
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Determine whether scanability diagnostics block publishing.
            </p>
          </div>
          <Select
            value={enforceScanabilityLevel}
            onValueChange={(val: any) => {
              setEnforceScanabilityLevel(val);
              setIsDirty(true);
            }}
          >
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="none">None (Permissive)</SelectItem>
              <SelectItem value="warning">Warning (Inspect)</SelectItem>
              <SelectItem value="strict">Strict (Block publish)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
