"use client";

import * as React from "react";
import { BrandColorToken, BrandColorRole } from "@nxtqr/contracts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

interface AddColorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToken: (token: BrandColorToken) => void;
}

export function AddColorDialog({
  isOpen,
  onClose,
  onAddToken,
}: AddColorDialogProps) {
  const [name, setName] = React.useState("");
  const [hex, setHex] = React.useState("#FA520F");
  const [role, setRole] = React.useState<BrandColorRole>("accent");
  const [description, setDescription] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const token: BrandColorToken = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      hex: hex.toUpperCase(),
      role,
      description: description.trim() || undefined,
    };

    onAddToken(token);
    setName("");
    setHex("#FA520F");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pr-10 sm:pr-12 text-left">
            <DialogTitle className="text-base font-bold font-display">
              ADD COLOR TOKEN
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define a new semantic color token to anchor QR and destination surfaces.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-token-name" className="text-xs font-semibold">
                Token Name *
              </Label>
              <Input
                id="add-token-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Signal Coral"
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-token-hex" className="text-xs font-semibold">
                HEX Color Value
              </Label>
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={hex}
                  onChange={(val) => setHex(val.toUpperCase())}
                  showHex={false}
                  className="w-8 h-8 p-0 flex items-center justify-center bg-surface border-border shrink-0 hover:border-border/80"
                  swatchClassName="w-5 h-5 rounded-md"
                />
                <Input
                  id="add-token-hex"
                  value={hex}
                  onChange={(e) => setHex(e.target.value.toUpperCase())}
                  placeholder="#FA520F"
                  className="h-8 text-xs font-mono uppercase"
                  maxLength={7}
                  pattern="^#[0-9a-fA-F]{6}$"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-token-role" className="text-xs font-semibold">
                Semantic Role
              </Label>
              <Select
                value={role}
                onValueChange={(val: any) => setRole(val)}
              >
                <SelectTrigger id="add-token-role" className="h-8 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="primary">Primary (Brand Anchor)</SelectItem>
                  <SelectItem value="secondary">Secondary (Accent Tone)</SelectItem>
                  <SelectItem value="accent">Signal Accent (Highlight)</SelectItem>
                  <SelectItem value="background">Background (Page Canvas)</SelectItem>
                  <SelectItem value="surface">Surface (Card Canvas)</SelectItem>
                  <SelectItem value="qr_foreground">QR Foreground (Modules)</SelectItem>
                  <SelectItem value="qr_background">QR Background (Quiet Zone)</SelectItem>
                  <SelectItem value="frame">Frame (Outer CTA Rim)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-token-desc" className="text-xs font-semibold">
                Description (Optional)
              </Label>
              <Input
                id="add-token-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Intended design system context"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Token</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
