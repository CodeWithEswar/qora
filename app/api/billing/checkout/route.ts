import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CashfreeBillingAdapter } from "@/lib/domains/billing";
import { getPlanByCode, PlanCode } from "@nxtqr/contracts";

/**
 * NXTQR — Server-Side Cashfree Checkout Creation API
 * 
 * Invariants:
 *  - Authenticated and requires `billing.manage` authority (OWNER or ADMIN).
 *  - Prices, currency, and entitlements are calculated strictly SERVER-SIDE.
 *  - Client can never send amount or currency.
 *  - Cashfree API secrets never leave the server.
 */

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const { organizationId, planCode, customerPhone } = body;

  if (!organizationId || !planCode) {
    return NextResponse.json(
      { error: "Missing required fields: organizationId and planCode." },
      { status: 400 }
    );
  }

  // 1. Verify organization membership & billing.manage permission
  const userWorkspace = session.user.workspaces.find(
    (w) => w.id === organizationId || w.slug === organizationId
  );

  if (!userWorkspace) {
    return NextResponse.json(
      { error: "Forbidden: You are not a member of this workspace." },
      { status: 403 }
    );
  }

  const hasBillingManage =
    userWorkspace.role === "OWNER" || userWorkspace.role === "ADMIN";

  if (!hasBillingManage) {
    return NextResponse.json(
      { error: "Forbidden: 'billing.manage' permission required to manage subscriptions." },
      { status: 403 }
    );
  }

  // 2. Validate selected plan from authoritative server catalog
  const plan = getPlanByCode(planCode as PlanCode);
  if (!plan || !plan.active) {
    return NextResponse.json(
      { error: `Invalid or unavailable plan code: '${planCode}'` },
      { status: 400 }
    );
  }

  if (plan.priceMinor <= 0) {
    return NextResponse.json(
      { error: "Free plan does not require checkout." },
      { status: 400 }
    );
  }

  // 3. Configure Cashfree Provider Adapter
  const appId = process.env.CASHFREE_APP_ID || "test_mock_app_id";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "test_mock_secret_key";
  const environment =
    process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";

  const origin =
    request.nextUrl.origin ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const adapter = new CashfreeBillingAdapter({
    appId,
    secretKey,
    environment,
    returnUrlBase: origin,
  });

  try {
    const checkoutSession = await adapter.createCheckoutSession({
      organizationId: userWorkspace.id,
      planCode: plan.code,
      customerEmail: session.user.email,
      customerName: session.user.name,
      customerPhone: customerPhone || undefined,
    });

    return NextResponse.json(checkoutSession, { status: 200 });
  } catch (err: any) {
    console.error("Failed to create Cashfree checkout session:", err);
    return NextResponse.json(
      { error: "Unable to initiate Cashfree checkout session. Please try again." },
      { status: 500 }
    );
  }
}
