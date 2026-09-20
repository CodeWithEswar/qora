import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CashfreeBillingAdapter, ReconciliationService } from "@/lib/domains/billing";
import { getOrganizationPlanAndSubscription, updateSubscriptionStateInD1 } from "@/packages/db/src";

/**
 * NXTQR — Billing Return Status Verification Endpoint
 * 
 * Invariants:
 *  - Browser URL parameters (?success=true) NEVER grant product authorization.
 *  - D1 is queried for authoritative subscription state.
 *  - If webhook delivery is still in flight, safely queries Cashfree server status.
 */

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { organizationId, orderId } = body;
  if (!organizationId || !orderId) {
    return NextResponse.json({ error: "Missing organizationId or orderId" }, { status: 400 });
  }

  // 1. Check workspace membership
  const userWorkspace = session.user.workspaces.find(
    (w) => w.id === organizationId || w.slug === organizationId
  );
  if (!userWorkspace) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const d1 = (request as any).env?.DB;

  // 2. Check authoritative D1 subscription state first
  if (d1) {
    try {
      const billing = await getOrganizationPlanAndSubscription(d1, userWorkspace.id);
      if (billing.subscriptionStatus === "ACTIVE" && billing.billingPlan !== "FREE") {
        return NextResponse.json({
          status: "VERIFIED_ACTIVE",
          planTier: billing.billingPlan,
          orderId,
          message: `Your ${billing.billingPlan} subscription is active and verified.`,
        });
      }
    } catch (err) {
      console.warn("D1 query failed during verify:", err);
    }
  }

  // 3. If D1 is still showing Free / Pending, query Cashfree API for status
  const appId = process.env.CASHFREE_APP_ID || "test_mock_app_id";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "test_mock_secret_key";
  const environment = process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";

  const adapter = new CashfreeBillingAdapter({
    appId,
    secretKey,
    environment,
    returnUrlBase: request.nextUrl.origin,
  });

  try {
    const orderStatus = await adapter.fetchOrderStatus(orderId);

    if (orderStatus.status === "PAID") {
      // Reconcile and activate if D1 available
      if (d1) {
        await updateSubscriptionStateInD1(d1, {
          organizationId: userWorkspace.id,
          planTier: "PRO", // Target plan default if not yet processed by webhook
          status: "ACTIVE",
        });
      }

      return NextResponse.json({
        status: "VERIFIED_ACTIVE",
        planTier: "PRO",
        orderId,
        message: "Payment verified successfully with Cashfree. Your subscription is active.",
      });
    }

    if (orderStatus.status === "FAILED") {
      return NextResponse.json({
        status: "FAILED",
        planTier: "FREE",
        orderId,
        message: "The payment transaction was not completed. Please try again.",
      });
    }
  } catch (cfErr) {
    console.warn("Cashfree status check failed:", cfErr);
  }

  // 4. Fallback: Webhook processing may be in flight
  return NextResponse.json({
    status: "WEBHOOK_PENDING",
    planTier: userWorkspace.plan || "FREE",
    orderId,
    message: "Payment received. We are waiting for the payment confirmation from Cashfree...",
  });
}
