"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { PlanDefinition } from "@nxtqr/contracts";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  selectedPlan: PlanDefinition | null;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  organizationId,
  selectedPlan,
}: CheckoutDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  if (!selectedPlan) return null;

  const displayPrice = `₹${(selectedPlan.priceMinor / 100).toLocaleString("en-IN")}`;
  const periodLabel = selectedPlan.billingPeriod === "yearly" ? "/ year" : "/ month";

  const handleStartCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          planCode: selectedPlan.code,
          customerPhone: phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout initiation failed");
      }

      if (data.checkoutUrl) {
        // Redirection to Cashfree hosted checkout page
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Missing checkout redirection URL from provider.");
      }
    } catch (err: any) {
      console.error("Checkout initiation error:", err);
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              NXTQR Workspace Upgrade
            </span>
          </div>
          <DialogTitle className="text-xl">
            Upgrade to {selectedPlan.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {selectedPlan.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">{displayPrice}</span>
              <span className="text-muted-foreground ml-1">{periodLabel}</span>
            </div>
            <span className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 font-medium text-[11px]">
              Cashfree Secured
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Billing Mobile Number (Optional for SMS Receipts)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <h4 className="font-semibold text-foreground">Included with this plan:</h4>
            <ul className="space-y-1.5 text-muted-foreground">
              {selectedPlan.featuresSummary.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-destructive text-[11px]">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleStartCheckout}
            disabled={loading}
            className="bg-primary hover:bg-[#cc3a05] text-white"
          >
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            {loading ? "Preparing Checkout..." : "Proceed to Cashfree Checkout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
