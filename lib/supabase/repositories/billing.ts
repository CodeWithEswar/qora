import "server-only";
import { createAdminClient } from "../admin";
import crypto from "crypto";

function getClient() {
  return createAdminClient();
}

export const SupabaseBillingRepository = {
  /**
   * Verifies Cashfree webhook HMAC-SHA256 signature against raw byte payload.
   */
  verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
    const secret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;
    if (!secret) return false;

    const signatureData = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signatureData)
      .digest("base64");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  },

  /**
   * Authoritatively records a verified payment in minor units (paisa).
   */
  async recordVerifiedPayment(payload: {
    organizationId: string;
    cashfreeOrderId: string;
    amountMinor: number;
    currency?: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "USER_DROPPED";
    paymentMethod?: string;
    signatureVerified: boolean;
    rawPayload?: any;
  }): Promise<{ id: string }> {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("payments")
      .upsert(
        {
          organization_id: payload.organizationId,
          cashfree_order_id: payload.cashfreeOrderId,
          amount_minor: payload.amountMinor,
          currency: payload.currency || "INR",
          status: payload.status,
          payment_method: payload.paymentMethod || null,
          signature_verified: payload.signatureVerified,
          raw_payload_json: payload.rawPayload || null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "cashfree_order_id" }
      )
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Failed to record payment ledger entry: ${error?.message}`);
    }

    return { id: data.id };
  },

  /**
   * Retrieves active subscription for an organization.
   */
  async getSubscription(orgId: string) {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, plans(*)")
      .eq("organization_id", orgId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

  /**
   * Retrieves entitlements for an organization.
   */
  async getEntitlements(orgId: string) {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("entitlements")
      .select("*")
      .eq("organization_id", orgId);

    if (error || !data) return [];
    return data;
  },
};
