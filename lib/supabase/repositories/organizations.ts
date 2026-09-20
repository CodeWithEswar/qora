import "server-only";
import { createAdminClient } from "../admin";
import { getSession } from "@/lib/auth/session";

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  billingPlan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  createdAt: string;
}

export interface MemberRecord {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  status: "active" | "invited" | "suspended";
  joinedAt: string;
}

function getClient() {
  return createAdminClient();
}

export const SupabaseOrgRepository = {
  /**
   * Retrieves an organization by slug or UUID.
   */
  async getBySlugOrId(slugOrId: string): Promise<OrganizationRecord | null> {
    const supabase = getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    const query = supabase.from("organizations").select("*");
    const { data, error } = isUuid
      ? await query.eq("id", slugOrId).maybeSingle()
      : await query.or(`slug.eq.${slugOrId},legacy_id.eq.${slugOrId}`).maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logo_url,
      billingPlan: data.billing_plan as "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE",
      createdAt: data.created_at,
    };
  },

  /**
   * Lists all organizations the current authenticated user belongs to.
   */
  async listUserOrganizations(): Promise<OrganizationRecord[]> {
    const supabase = getClient();
    const session = await getSession();
    if (!session?.user?.id) return [];

    const { data, error } = await supabase
      .from("organization_memberships")
      .select("organization:organizations(*)")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (error || !data) return [];

    return data
      .map((row: any) => row.organization)
      .filter(Boolean)
      .map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logo_url,
        billingPlan: org.billing_plan,
        createdAt: org.created_at,
      }));
  },

  /**
   * Creates a new organization and provisions the owner membership.
   */
  async createOrganization(name: string, slug: string): Promise<OrganizationRecord | null> {
    const supabase = getClient();
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized: Must be logged in to create an organization.");
    const userId = session.user.id;

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        billing_plan: "FREE",
        created_by: userId,
      })
      .select()
      .single();

    if (orgError || !org) {
      throw new Error(`Failed to create organization: ${orgError?.message}`);
    }

    // Add owner membership
    const { data: mem } = await supabase.from("organization_memberships").insert({
      organization_id: org.id,
      user_id: userId,
      status: "active",
    }).select("id").single();

    if (mem?.id) {
      await supabase.from("member_roles").upsert({
        membership_id: mem.id,
        role_id: "00000000-0000-0000-0000-000000000001", // OWNER role
      });
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logo_url,
      billingPlan: org.billing_plan as "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE",
      createdAt: org.created_at,
    };
  },
};
