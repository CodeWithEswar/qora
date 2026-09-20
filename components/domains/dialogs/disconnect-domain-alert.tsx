"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
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
import { CustomDomainSummaryV1, DomainImpactV1 } from "@nxtqr/contracts";

interface DisconnectDomainAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  domain: CustomDomainSummaryV1 | null;
  orgSlug: string;
  onConfirm: (domain: CustomDomainSummaryV1) => Promise<void>;
}

export function DisconnectDomainAlert({
  isOpen,
  onOpenChange,
  domain,
  orgSlug,
  onConfirm,
}: DisconnectDomainAlertProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [impact, setImpact] = React.useState<DomainImpactV1 | null>(null);
  const [isLoadingImpact, setIsLoadingImpact] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen || !domain) {
      setImpact(null);
      return;
    }

    let isMounted = true;
    setIsLoadingImpact(true);

    fetch(`/api/v1/domains/${domain.id}/impact?orgSlug=${encodeURIComponent(orgSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (isMounted && data?.impact) {
          setImpact(data.impact);
        }
      })
      .catch((err) => {
        console.error("Failed to load domain impact:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingImpact(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, domain, orgSlug]);

  if (!domain) return null;

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(domain);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAffected =
    (impact?.connectedQrs || 0) + (impact?.connectedCampaigns || 0) + (impact?.connectedLandingPages || 0);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full sm:max-w-md bg-surface border-border">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
            <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Disconnect Custom Domain?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to disconnect <span className="font-mono text-foreground font-semibold">{domain.hostname}</span> from NXTQR edge routing?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Real Dependent Impact Breakdown */}
        <div className="p-3.5 rounded-lg border border-border/70 bg-surface/40 text-xs space-y-2">
          <span className="font-semibold text-foreground block">
            Impact Analysis &amp; Cascade Protection:
          </span>

          {isLoadingImpact ? (
            <div className="py-2 text-center text-muted-foreground text-xs font-mono">
              Evaluating dependent resources...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="p-2 rounded bg-surface border border-border">
                <span className="text-base font-bold text-foreground block">
                  {impact?.connectedQrs ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">QR Codes</span>
              </div>
              <div className="p-2 rounded bg-surface border border-border">
                <span className="text-base font-bold text-foreground block">
                  {impact?.connectedCampaigns ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">Campaigns</span>
              </div>
              <div className="p-2 rounded bg-surface border border-border">
                <span className="text-base font-bold text-foreground block">
                  {impact?.connectedLandingPages ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">Pages</span>
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            {totalAffected > 0 ? (
              <>
                <strong className="text-foreground font-medium">Safe Unlink:</strong> Connected assets will have their custom domain reference unlinked (<code className="font-mono text-[#FA520F]">SET NULL</code>) and fall back to workspace root URLs. <strong className="text-foreground">No QR codes or campaigns will be deleted</strong>.
              </>
            ) : (
              "No active QR codes or landing pages are currently dependent on this domain."
            )}
          </p>
        </div>

        <AlertDialogFooter className="flex-row items-center justify-end gap-2 pt-2">
          <AlertDialogCancel disabled={isSubmitting} className="text-xs h-9 border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleAction();
            }}
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/90 text-white text-xs h-9 gap-1.5"
          >
            {isSubmitting ? "Disconnecting..." : "Disconnect Domain"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
