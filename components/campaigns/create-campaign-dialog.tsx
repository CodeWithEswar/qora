"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CampaignEmojiPicker } from "./campaign-emoji-picker";
import { CampaignResponseV1, CampaignStatus } from "@nxtqr/contracts";

export interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onCreated?: (campaign: CampaignResponseV1) => void;
}

interface AvailableQr {
  id: string;
  name: string;
  slug: string;
  qrType: string;
  destinationUrl: string;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  orgSlug,
  onCreated,
}: CreateCampaignDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [emoji, setEmoji] = React.useState<string | null>("🚀");
  const [status, setStatus] = React.useState<CampaignStatus>("draft");
  const [selectedQrIds, setSelectedQrIds] = React.useState<Set<string>>(new Set());
  const [showQrPicker, setShowQrPicker] = React.useState(false);
  const [availableQrs, setAvailableQrs] = React.useState<AvailableQr[]>([]);
  const [qrSearch, setQrSearch] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch organization QRs if QR picker opened
  React.useEffect(() => {
    if (showQrPicker && availableQrs.length === 0) {
      fetch("/api/v1/qrs?limit=50", {
        headers: { "x-organization-slug": orgSlug },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            setAvailableQrs(
              json.data.map((q: { id: string; name?: string; slug?: string; qrType?: string; destinationUrl?: string }) => ({
                id: q.id,
                name: q.name || "Untitled QR",
                slug: q.slug || "",
                qrType: q.qrType || "url",
                destinationUrl: q.destinationUrl || "",
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [showQrPicker, availableQrs.length, orgSlug]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEmoji("🚀");
    setStatus("draft");
    setSelectedQrIds(new Set());
    setShowQrPicker(false);
    setErrorMessage(null);
  };

  const handleToggleQr = (qrId: string) => {
    const next = new Set(selectedQrIds);
    if (next.has(qrId)) {
      next.delete(qrId);
    } else {
      next.add(qrId);
    }
    setSelectedQrIds(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Campaign name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: emoji || null,
        status,
        qrIds: Array.from(selectedQrIds),
      };

      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-slug": orgSlug,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create campaign.");
      }

      const created: CampaignResponseV1 = json.data;
      toast.success("Campaign created", {
        description: `${created.name} is ready for orchestration.`,
      });

      resetForm();
      onOpenChange(false);

      if (onCreated) {
        onCreated(created);
      } else {
        router.push(`/${orgSlug}/campaigns/${created.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not create campaign.";
      setErrorMessage(msg);
      toast.error("Couldn't create campaign", {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQrs = availableQrs.filter(
    (q) =>
      q.name.toLowerCase().includes(qrSearch.toLowerCase()) ||
      q.destinationUrl.toLowerCase().includes(qrSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border/60 text-left bg-surface">
            <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
              Campaign Operations
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Create Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Give this initiative a recognizable identity, organize QR assets, and track destination performance.
            </DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {errorMessage}
              </div>
            )}

            {/* Identity: Emoji + Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Identity <span className="text-primary">*</span>
              </label>
              <div className="flex items-center gap-3">
                <CampaignEmojiPicker value={emoji} onChange={setEmoji} />
                <div className="flex-1">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Launch 2026, Retail Packaging, Airport WiFi"
                    className="h-12 text-sm bg-surface font-medium"
                    autoFocus
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Operational purpose, target audience, or campaign placement channels..."
                className="text-xs bg-surface min-h-[72px] resize-none"
                maxLength={500}
              />
            </div>

            {/* Lifecycle State */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Initial Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    status === "draft"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="text-xs font-bold text-foreground">Draft</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Configure before activating routing.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    status === "active"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="text-xs font-bold text-foreground">Active</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Immediately live and tracking scans.
                  </div>
                </button>
              </div>
            </div>

            {/* QR Code Assignment Accordion */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-surface">
              <button
                type="button"
                onClick={() => setShowQrPicker(!showQrPicker)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon icon="hugeicons:qr-code" className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Add QR Codes Now
                  </span>
                  {selectedQrIds.size > 0 && (
                    <span className="px-1.5 py-0.2 bg-primary text-white text-[10px] font-mono font-bold rounded-full">
                      {selectedQrIds.size}
                    </span>
                  )}
                </div>
                <Icon
                  icon={showQrPicker ? "hugeicons:arrow-up-01" : "hugeicons:arrow-down-01"}
                  className="w-4 h-4 text-muted-foreground"
                />
              </button>

              {showQrPicker && (
                <div className="p-4 pt-1 border-t border-border/60 space-y-3">
                  <div className="relative">
                    <Icon
                      icon="hugeicons:search-01"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
                    />
                    <Input
                      value={qrSearch}
                      onChange={(e) => setQrSearch(e.target.value)}
                      placeholder="Search workspace QR codes..."
                      className="pl-8 h-8 text-xs bg-surface-elevated"
                    />
                  </div>

                  <ScrollArea className="h-40 pr-2">
                    {filteredQrs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No QR codes found.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredQrs.map((qr) => (
                          <label
                            key={qr.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-border/40 hover:bg-muted/40 cursor-pointer text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <Checkbox
                                checked={selectedQrIds.has(qr.id)}
                                onCheckedChange={() => handleToggleQr(qr.id)}
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate">
                                  {qr.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono truncate">
                                  {qr.destinationUrl || qr.slug}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground shrink-0">
                              {qr.qrType}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <DialogFooter className="p-4 border-t border-border/60 bg-surface flex flex-row items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-9 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="bg-primary hover:bg-[#CC3A05] text-white text-xs h-9 px-5 gap-2 font-semibold shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="hugeicons:loading-03" className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Icon icon="hugeicons:plus-sign" className="w-3.5 h-3.5" />
                  <span>Create Campaign</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
