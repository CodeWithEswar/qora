"use client";

import * as React from "react";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
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
import { Switch } from "@/components/ui/switch";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/ui/color-picker";

interface EditBrandKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kit: BrandKitDetailV1 | null;
  onSave: (kitId: string, updates: {
    name?: string;
    description?: string;
    primaryColor?: string;
    isDefault?: boolean;
  }) => Promise<void>;
}

export function EditBrandKitDialog({
  open,
  onOpenChange,
  kit,
  onSave,
}: EditBrandKitDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#FA520F");
  const [isDefault, setIsDefault] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (kit && open) {
      setName(kit.name);
      setDescription(kit.description || "");
      setPrimaryColor(kit.primaryColor || "#FA520F");
      setIsDefault(kit.isDefault);
    }
  }, [kit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kit) return;
    if (!name.trim()) {
      toast.error("Brand Kit name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(kit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        primaryColor,
        isDefault,
      });
      toast.success("Brand identity updated.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update identity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 space-y-4">
        <DialogHeader className="text-left space-y-1 pr-10 sm:pr-12">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FA520F] uppercase tracking-wider">
            <Edit2 className="w-3.5 h-3.5" />
            <span>IDENTITY CONFIGURATION</span>
          </div>
          <DialogTitle className="text-lg font-bold font-display text-foreground">
            Edit Brand Identity
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the authoritative brand identity details and default workspace routing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs bg-surface border-border"
              placeholder="Brand Kit Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Primary Brand Color</label>
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
                className="font-mono text-xs uppercase h-9 bg-surface border-border flex-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs bg-surface border-border"
              placeholder="Identity summary..."
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-surface/50">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Set as Workspace Default</span>
              <p className="text-[11px] text-muted-foreground">Apply to new QR codes automatically</p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Identity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
