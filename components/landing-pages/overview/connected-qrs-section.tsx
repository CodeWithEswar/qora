"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { LandingPageConnectedQrV1 } from "@nxtqr/contracts";
import { ConnectQrDialog } from "./connect-qr-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

interface ConnectedQrsSectionProps {
  pageId: string;
  pageName: string;
  orgSlug: string;
  initialQrs: LandingPageConnectedQrV1[];
  onRefresh: () => void;
}

export function ConnectedQrsSection({
  pageId,
  pageName,
  orgSlug,
  initialQrs,
  onRefresh,
}: ConnectedQrsSectionProps) {
  const [qrs, setQrs] = useState<LandingPageConnectedQrV1[]>(initialQrs);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const handleDisconnect = async (qrId: string, qrName: string) => {
    setDisconnectingId(qrId);
    try {
      toast.loading("Disconnecting QR code...", { id: "dc-qr" });
      const res = await fetch(`/api/v1/landing-pages/${pageId}/qrs?qrId=${qrId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to disconnect QR");
      }

      toast.success("QR code disconnected", {
        id: "dc-qr",
        description: `Unlinked "${qrName}". The QR asset remains safe in your library.`,
      });

      setQrs((prev) => prev.filter((q) => q.id !== qrId));
      onRefresh();
    } catch (err: any) {
      toast.error("Disconnect failed", { id: "dc-qr", description: err.message });
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Connected QR Codes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            QR codes that deliver physical or digital traffic directly to this landing page.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setConnectDialogOpen(true)}
          className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <NxtqrIcon icon="solar:link-circle-bold" size={14} />
          <span>Connect QR</span>
        </Button>
      </div>

      {/* QR List */}
      {qrs.length === 0 ? (
        <div className="py-10 border border-dashed rounded-xl p-6 text-center text-muted-foreground">
          <NxtqrIcon icon="solar:qr-code-linear" size={28} className="mx-auto mb-2 opacity-50" />
          <h3 className="text-xs font-semibold text-foreground">No QR codes attached yet</h3>
          <p className="text-[11px] mt-1 max-w-sm mx-auto">
            Connect an existing QR code so visitors are routed straight to this destination upon scanning.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnectDialogOpen(true)}
            className="mt-3 text-xs gap-1.5"
          >
            <NxtqrIcon icon="solar:add-circle-linear" size={14} />
            <span>Connect QR Code</span>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/40 border rounded-xl overflow-hidden">
          {qrs.map((qr) => (
            <div
              key={qr.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  <NxtqrIcon icon="solar:qr-code-bold" size={18} />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/${orgSlug}/qr/${qr.id}`}
                    className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {qr.name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    /{qr.slug} • {qr.qrType.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[10px] font-mono uppercase">
                  {qr.status}
                </Badge>

                <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                  <Link href={`/${orgSlug}/qr/${qr.id}`}>
                    <NxtqrIcon icon="solar:eye-linear" size={13} className="mr-1" />
                    <span>View QR</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disconnectingId === qr.id}
                  onClick={() => handleDisconnect(qr.id, qr.name)}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive"
                >
                  <NxtqrIcon icon="solar:link-broken-linear" size={13} className="mr-1" />
                  <span>Disconnect</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect QR Modal */}
      <ConnectQrDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        pageId={pageId}
        pageName={pageName}
        orgSlug={orgSlug}
        onSuccess={() => {
          // Re-fetch connected QRs
          fetch(`/api/v1/landing-pages/${pageId}/qrs`)
            .then((r) => r.json())
            .then((d) => {
              if (d.data) setQrs(d.data);
            });
          onRefresh();
        }}
      />
    </div>
  );
}
