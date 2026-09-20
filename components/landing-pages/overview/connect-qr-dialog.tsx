"use client";

import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

interface ConnectQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  pageName: string;
  orgSlug: string;
  onSuccess: () => void;
}

interface AvailableQr {
  id: string;
  name: string;
  slug: string;
  qrType: string;
}

export function ConnectQrDialog({
  open,
  onOpenChange,
  pageId,
  pageName,
  orgSlug,
  onSuccess,
}: ConnectQrDialogProps) {
  const [availableQrs, setAvailableQrs] = useState<AvailableQr[]>([]);
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [setAsDestination, setSetAsDestination] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/v1/qrs?limit=50")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const items = data.data || [];
          setAvailableQrs(
            items.map((q: any) => ({
              id: q.id,
              name: q.name || "QR Code",
              slug: q.slug || "",
              qrType: q.qrType || "url",
            }))
          );
        })
        .catch((err) => {
          console.error("Failed to fetch available QR codes:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const filtered = availableQrs.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    q.slug.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleConnect = async () => {
    if (!selectedQrId) return;

    setSubmitting(true);
    try {
      toast.loading("Connecting QR code to landing page...", { id: "connect-qr" });

      const res = await fetch(`/api/v1/landing-pages/${pageId}/qrs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: selectedQrId,
          setAsDestination,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to connect QR code");
      }

      toast.success("QR code connected", {
        id: "connect-qr",
        description: setAsDestination
          ? "QR destination route updated to this landing page."
          : "QR code linked.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Connection failed", {
        id: "connect-qr",
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NxtqrIcon icon="solar:qr-code-bold" size={18} className="text-[#FA520F]" />
            <span>Connect QR Code</span>
          </DialogTitle>
          <DialogDescription>
            Select a QR asset to receive traffic at &quot;{pageName}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search Input */}
          <div className="relative">
            <NxtqrIcon
              icon="solar:magnifer-linear"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search QR codes by name or slug..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* QR List */}
          <div className="max-h-56 overflow-y-auto border rounded-xl divide-y p-1 space-y-0.5">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <NxtqrIcon icon="solar:refresh-linear" size={16} className="animate-spin mx-auto mb-1" />
                <span>Loading QR assets...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No QR codes found in this organization.
              </div>
            ) : (
              filtered.map((qr) => {
                const isSelected = selectedQrId === qr.id;
                return (
                  <button
                    key={qr.id}
                    type="button"
                    onClick={() => setSelectedQrId(qr.id)}
                    className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? "bg-[#FA520F]/10 border border-[#FA520F]/40 font-semibold"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <NxtqrIcon icon="solar:qr-code-linear" size={16} className="text-primary shrink-0" />
                      <div className="truncate">
                        <span className="text-foreground block truncate">{qr.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate">
                          /{qr.slug}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <NxtqrIcon icon="solar:check-circle-bold" size={16} className="text-[#FA520F] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Destination URL Override Option */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-semibold block">Update QR Destination</span>
              <span className="text-[11px] text-muted-foreground block">
                Automatically point this QR code&apos;s scan target to this landing page.
              </span>
            </div>
            <Switch
              checked={setAsDestination}
              onCheckedChange={setSetAsDestination}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>

          <Button
            onClick={handleConnect}
            disabled={!selectedQrId || submitting}
            className="bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-semibold gap-1.5"
          >
            {submitting ? "Connecting..." : "Connect QR Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
