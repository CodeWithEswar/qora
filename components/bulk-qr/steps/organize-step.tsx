"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BulkRowValidationResult } from "@/lib/domains/bulk-qr";
import { toast } from "sonner";

interface OrganizeStepProps {
  validatedRows: BulkRowValidationResult[];
  initialCampaigns: Array<{ id: string; name: string }>;
  initialFolders: Array<{ id: string; name: string }>;
  defaultCampaignId?: string;
  defaultFolderId?: string;
  onBack: () => void;
  onProceed: (
    campaignId: string | undefined,
    folderId: string | undefined,
    applyToUnassignedOnly: boolean
  ) => void;
}

export function OrganizeStep({
  validatedRows,
  initialCampaigns,
  initialFolders,
  defaultCampaignId,
  defaultFolderId,
  onBack,
  onProceed,
}: OrganizeStepProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [folders, setFolders] = useState(initialFolders);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    defaultCampaignId || "keep"
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || "keep"
  );
  const [applyToUnassignedOnly, setApplyToUnassignedOnly] = useState(true);

  // Quick Create Dialogs
  const [showCreateCampaignDialog, setShowCreateCampaignDialog] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Stats on existing row assignments
  const assignedCampaignCount = validatedRows.filter((r) => !!r.row.campaign_id).length;
  const assignedFolderCount = validatedRows.filter((r) => !!r.row.folder_id).length;

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return;
    setIsCreatingCampaign(true);
    try {
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaignName.trim(),
          emoji: "🎯",
          description: "Created via Bulk QR Studio",
        }),
      });
      const data = await res.json();
      if (res.ok && data?.id) {
        const created = { id: data.id, name: data.name || newCampaignName.trim() };
        setCampaigns((prev) => [created, ...prev]);
        setSelectedCampaignId(created.id);
        setShowCreateCampaignDialog(false);
        setNewCampaignName("");
        toast.success(`Campaign "${created.name}" created.`);
      } else {
        toast.error(data?.error?.message || "Failed to create campaign.");
      }
    } catch {
      toast.error("Network error while creating campaign.");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const res = await fetch("/api/v1/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          description: "Created via Bulk QR Studio",
          accentKey: "Orange",
        }),
      });
      const data = await res.json();
      if (res.ok && data?.id) {
        const created = { id: data.id, name: data.name || newFolderName.trim() };
        setFolders((prev) => [created, ...prev]);
        setSelectedFolderId(created.id);
        setShowCreateFolderDialog(false);
        setNewFolderName("");
        toast.success(`Folder "${created.name}" created.`);
      } else {
        toast.error(data?.error?.message || "Failed to create folder.");
      }
    } catch {
      toast.error("Network error while creating folder.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleProceed = () => {
    const finalCampaignId =
      selectedCampaignId === "keep" || selectedCampaignId === "none"
        ? undefined
        : selectedCampaignId;
    const finalFolderId =
      selectedFolderId === "keep" || selectedFolderId === "none"
        ? undefined
        : selectedFolderId;

    onProceed(finalCampaignId, finalFolderId, applyToUnassignedOnly);
  };

  return (
    <div className="space-y-8">
      {/* Header ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <Icon icon="lucide:folder-tree" className="w-5 h-5 text-orange-500" />
            Workspace Organization
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Assign batch-wide campaigns and folders for unified reporting and asset discoverability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign assignment card */}
        <div className="p-6 rounded-xl border border-border/80 bg-surface/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Icon icon="lucide:flag" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Campaign Grouping
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Aggregates scan signals and UTM attributions
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateCampaignDialog(true)}
              className="border-border/80 hover:bg-muted text-xs text-foreground"
            >
              <Icon icon="lucide:plus" className="w-3.5 h-3.5 mr-1 text-primary" />
              New
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Batch Campaign Policy
            </label>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger className="bg-surface border-border/80 text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border text-foreground">
                <SelectItem value="keep">
                  <span className="font-medium text-foreground">
                    Preserve Row-Level Campaigns ({assignedCampaignCount} assigned)
                  </span>
                </SelectItem>
                <SelectItem value="none">
                  <span className="text-muted-foreground italic">No Campaign (Unassigned)</span>
                </SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Folder assignment card */}
        <div className="p-6 rounded-xl border border-border/80 bg-surface/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Icon icon="lucide:folder" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Folder Assignment
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Structures QR assets in workspace directory
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateFolderDialog(true)}
              className="border-white/10 hover:bg-neutral-800 text-xs text-neutral-300"
            >
              <Icon icon="lucide:plus" className="w-3.5 h-3.5 mr-1 text-orange-500" />
              New
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Batch Folder Policy
            </label>
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger className="bg-neutral-900 border-white/10 text-xs text-neutral-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-neutral-200">
                <SelectItem value="keep">
                  <span className="font-medium text-neutral-200">
                    Preserve Row-Level Folders ({assignedFolderCount} assigned)
                  </span>
                </SelectItem>
                <SelectItem value="none">
                  <span className="text-neutral-500 italic">No Folder (Root Directory)</span>
                </SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Override / Policy options */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/60 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-neutral-200 block">
            Only populate rows without explicit CSV assignments
          </span>
          <span className="text-[11px] text-neutral-500">
            Prevents overriding specific campaign/folder tags provided in your source document.
          </span>
        </div>
        <input
          type="checkbox"
          checked={applyToUnassignedOnly}
          onChange={(e) => setApplyToUnassignedOnly(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-orange-500 focus:ring-orange-500 cursor-pointer"
        />
      </div>

      {/* Quick Create Campaign Dialog */}
      <Dialog
        open={showCreateCampaignDialog}
        onOpenChange={setShowCreateCampaignDialog}
      >
        <DialogContent className="bg-neutral-950 border-white/10 text-neutral-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">
              Create New Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">
              Add a real campaign to your organization workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Input
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              placeholder="e.g. Autumn Product Drop"
              className="bg-neutral-900 border-white/10 text-xs h-9"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateCampaignDialog(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isCreatingCampaign || !newCampaignName.trim()}
              onClick={handleCreateCampaign}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isCreatingCampaign ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent className="bg-neutral-950 border-white/10 text-neutral-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">
              Create New Folder
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">
              Add a folder directory to organize QR assets.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Retail Signage Q3"
              className="bg-neutral-900 border-white/10 text-xs h-9"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateFolderDialog(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isCreatingFolder || !newFolderName.trim()}
              onClick={handleCreateFolder}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isCreatingFolder ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-white/10 hover:bg-neutral-800 text-neutral-300"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back to Design
        </Button>
        <Button
          type="button"
          onClick={handleProceed}
          className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 font-medium"
        >
          Proceed to Review Manifest
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
