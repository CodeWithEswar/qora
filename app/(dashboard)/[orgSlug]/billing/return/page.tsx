"use client";

import * as React from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Clock, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BillingReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "";

  const orderId = searchParams.get("order_id") || searchParams.get("orderId") || "";

  const [status, setStatus] = React.useState<
    "VERIFYING" | "VERIFIED_ACTIVE" | "WEBHOOK_PENDING" | "FAILED"
  >("VERIFYING");
  const [message, setMessage] = React.useState<string>(
    "Your billing status is being verified with Cashfree Payments."
  );
  const [planTier, setPlanTier] = React.useState<string>("PRO");
  const [checking, setChecking] = React.useState(false);

  const checkStatus = React.useCallback(async () => {
    if (!orderId) {
      setStatus("FAILED");
      setMessage("Missing order correlation identifier in return callback.");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgSlug,
          orderId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setStatus(data.status);
        setMessage(data.message || "");
        if (data.planTier) setPlanTier(data.planTier);
      } else {
        setStatus("WEBHOOK_PENDING");
        setMessage(
          data.error ||
            "Payment received. We are awaiting the authoritative webhook confirmation from Cashfree."
        );
      }
    } catch {
      setStatus("WEBHOOK_PENDING");
      setMessage("We are verifying your transaction with Cashfree. Please wait a moment.");
    } finally {
      setChecking(false);
    }
  }, [orderId, orgSlug]);

  React.useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/80 shadow-md">
        {/* 1. VERIFYING STATE */}
        {status === "VERIFYING" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <CardTitle className="text-lg">Verifying Payment</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-xs text-muted-foreground py-4">
              <p>Connecting securely to Cashfree Payment Gateway...</p>
              {orderId && (
                <p className="font-mono text-[11px] text-foreground/80 mt-2">
                  Order: {orderId}
                </p>
              )}
            </CardContent>
          </>
        )}

        {/* 2. VERIFIED ACTIVE STATE */}
        {status === "VERIFIED_ACTIVE" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Badge variant="success">Payment Verified</Badge>
                <Badge variant="indigo">{planTier} Tier</Badge>
              </div>
              <CardTitle className="text-lg">Subscription Activated</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-xs text-muted-foreground py-4">
              <p>
                Your workspace entitlements and quotas have been upgraded on
                NXTQR. You now have full access to {planTier} capabilities.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-primary hover:bg-[#cc3a05] text-white"
                onClick={() => router.push(`/${orgSlug}`)}
              >
                Go to Workspace Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/${orgSlug}/billing`)}
              >
                View Billing Details
              </Button>
            </CardFooter>
          </>
        )}

        {/* 3. WEBHOOK PENDING STATE */}
        {status === "WEBHOOK_PENDING" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-center mb-1">
                <Badge variant="warning">Confirmation Pending</Badge>
              </div>
              <CardTitle className="text-lg">Payment Received</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-xs text-muted-foreground py-4 space-y-2">
              <p>
                Cashfree is finalizing transaction authorization. As soon as the
                verified webhook arrives, your workspace will automatically activate.
              </p>
              {orderId && (
                <p className="font-mono text-[11px] text-foreground/80">
                  Tracking Order: {orderId}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={checkStatus}
                disabled={checking}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1.5 ${checking ? "animate-spin" : ""}`}
                />
                {checking ? "Checking..." : "Refresh Verification Status"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/${orgSlug}/billing`)}
              >
                Return to Billing
              </Button>
            </CardFooter>
          </>
        )}

        {/* 4. FAILED OR CANCELLED STATE */}
        {status === "FAILED" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-center mb-1">
                <Badge variant="danger">Payment Unsuccessful</Badge>
              </div>
              <CardTitle className="text-lg">Checkout Incomplete</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-xs text-muted-foreground py-4">
              <p>
                No charges were finalized. Your existing workspace plan and assets
                remain unchanged.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => router.push(`/${orgSlug}/billing`)}
              >
                Back to Billing Overview
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
