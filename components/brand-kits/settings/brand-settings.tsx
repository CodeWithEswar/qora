"use client";

import * as React from "react";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import {
  Settings,
  Star,
  Archive,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";

interface BrandSettingsProps {
  kit: BrandKitDetailV1;
  onUpdateIdentity: (updates: {
    name?: string;
    description?: string;
    isDefault?: boolean;
  }) => Promise<void>;
  onArchive: () => void;
  onDelete: () => void;
}

export function BrandSettings({
  kit,
  onUpdateIdentity,
  onArchive,
  onDelete,
}: BrandSettingsProps) {
  const [name, setName] = React.useState(kit.name);
  const [description, setDescription] = React.useState(kit.description || "");
  const [isDefault, setIsDefault] = React.useState(kit.isDefault);
  const [isSaving, setIsSaving] = React.useState(false);

  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Sync state if kit changes
  React.useEffect(() => {
    setName(kit.name);
    setDescription(kit.description || "");
    setIsDefault(kit.isDefault);
  }, [kit.id, kit.name, kit.description, kit.isDefault]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand Kit name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateIdentity({
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault,
      });
      toast.success("Brand settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-border/60 pb-4">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FA520F] mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Configuration & Lifecycle</span>
        </div>
        <h3 className="text-lg font-bold text-foreground font-display">
          BRAND KIT SETTINGS
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage general identity properties, default workspace assignment, and lifecycle states.
        </p>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSaveGeneral} className="space-y-4 rounded-xl border border-border/80 bg-surface/50 p-5">
        <h4 className="text-sm font-bold text-foreground font-display">General Identity</h4>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Brand Kit Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-xs bg-surface border-border"
            placeholder="e.g. NXTQR Primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Identity Slug (Identifier)</label>
          <Input
            value={kit.slug}
            disabled
            className="h-9 text-xs bg-surface-elevated/40 border-border/60 font-mono text-muted-foreground cursor-not-allowed"
          />
          <span className="text-[10px] text-muted-foreground">Unique routing identifier within your workspace.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="text-xs bg-surface border-border"
            placeholder="Describe the purpose and scope of this brand identity..."
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-surface">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#FA520F]" />
              <span>Workspace Default Identity</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automatically apply this Brand Kit to all newly generated QR codes and campaign pages.
            </p>
          </div>
          <Switch
            checked={isDefault}
            onCheckedChange={setIsDefault}
            disabled={kit.isDefault} // If already default, cannot untoggle directly without designating another default
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="h-8 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <ShieldAlert className="w-4 h-4" />
          <h4 className="text-sm font-bold font-display">Danger Zone</h4>
        </div>

        <div className="divide-y divide-red-500/15">
          {/* Archive Action */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">Archive Brand Kit</div>
              <p className="text-[11px] text-muted-foreground">
                Move this Brand Kit to archived status. It will no longer appear in QR Studio selection.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
              className="text-xs h-8 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer shrink-0"
            >
              <Archive className="w-3 h-3 mr-1" />
              <span>Archive Kit</span>
            </Button>
          </div>

          {/* Delete Action */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                Permanently Delete Brand Kit
              </div>
              <p className="text-[11px] text-muted-foreground">
                Permanently removes this Brand Kit and its design tokens. <br />
                <span className="font-semibold text-foreground">Cascade Guarantee:</span> All linked QR codes and landing pages are safely preserved.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white cursor-pointer shrink-0"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              <span>Delete Brand Kit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Archive AlertDialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Archive &apos;{kit.name}&apos;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Archiving hides this Brand Kit from active selection in QR Studio. Existing published QR codes will continue functioning normally.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowArchiveDialog(false);
                onArchive();
              }}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Permanently Delete &apos;{kit.name}&apos;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <p>
                This operation is irreversible. The brand kit, color tokens, and guidelines will be erased.
              </p>
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero QR Data Loss: All linked QR codes remain intact with their published styling preserved.</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete();
              }}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
