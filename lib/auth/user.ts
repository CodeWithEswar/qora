import "server-only";
import { GoogleProfile } from "./google";
import { SessionUser, WorkspaceMembership } from "./session";
import { createAdminClient } from "@/lib/supabase/admin";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  googleSub: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: number;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
  workspaces: WorkspaceMembership[];
}

const SYSTEM_OWNER_ROLE_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Resolves an existing user by Google profile or creates a new user profile.
 * Persists and synchronizes directly into Supabase PostgreSQL.
 */
export async function resolveOrCreateGoogleUser(
  profile: GoogleProfile
): Promise<{ user: SessionUser; isNewUser: boolean }> {
  const email = profile.email.toLowerCase().trim();
  const supabase = createAdminClient();

  // 1. Check for existing profile by email in Supabase
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, created_at, updated_at")
    .eq("email", email)
    .maybeSingle();

  let isNewUser = false;
  let userId: string;

  if (existingProfile) {
    userId = existingProfile.id;

    // Refresh avatar or display name if changed
    if (profile.avatarUrl && profile.avatarUrl !== existingProfile.avatar_url) {
      await supabase
        .from("profiles")
        .update({
          avatar_url: profile.avatarUrl,
          display_name: profile.name || existingProfile.display_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  } else {
    isNewUser = true;

    // Ensure user exists in Supabase Auth (auth.users)
    const { data: listResp } = await supabase.auth.admin.listUsers();
    const existingAuthUser = listResp?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (existingAuthUser) {
      userId = existingAuthUser.id;
    } else {
      const { data: createdAuthUser, error: authCreateErr } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: profile.name || email.split("@")[0],
            avatar_url: profile.avatarUrl || null,
          },
        });

      if (authCreateErr || !createdAuthUser?.user) {
        console.error(
          "[resolveOrCreateGoogleUser] Failed to create auth.users record:",
          authCreateErr?.message
        );
        throw new Error(`Failed to create auth user: ${authCreateErr?.message}`);
      }

      userId = createdAuthUser.user.id;
    }

    // Ensure profile row exists in public.profiles table
    const { error: profileErr } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        display_name: profile.name || email.split("@")[0],
        avatar_url: profile.avatarUrl || null,
        timezone: "UTC",
        locale: "en",
      },
      { onConflict: "id" }
    );

    if (profileErr) {
      console.error(
        "[resolveOrCreateGoogleUser] Failed to upsert profile:",
        profileErr.message
      );
    }
  }

  // 2. Load workspace memberships from Supabase
  let workspaces: WorkspaceMembership[] = [];

  const { data: memRows, error: memErr } = await supabase
    .from("organization_memberships")
    .select(`
      id,
      organization_id,
      status,
      organization:organizations(id, name, slug, billing_plan)
    `)
    .eq("user_id", userId)
    .eq("status", "active");

  if (!memErr && memRows && memRows.length > 0) {
    workspaces = memRows
      .map((m: any) => {
        const org = m.organization;
        if (!org) return null;
        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan: (org.billing_plan || "FREE").toUpperCase() as any,
          role: "OWNER" as const,
        };
      })
      .filter(Boolean) as WorkspaceMembership[];
  }

  // 3. Provision default workspace if brand new or has no active workspaces
  if (workspaces.length === 0) {
    const rawSlug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
    const defaultOrgSlug = rawSlug.length > 2 ? rawSlug : `workspace-${userId.substring(0, 6)}`;
    const orgName = `${(profile.name || email).split(" ")[0]}'s Workspace`;
    const orgId = crypto.randomUUID();

    // Check if organization already exists with this slug
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id, name, slug, billing_plan")
      .eq("slug", defaultOrgSlug)
      .maybeSingle();

    let org = existingOrg;
    if (!org) {
      const { data: newOrg, error: orgErr } = await supabase
        .from("organizations")
        .insert({
          id: orgId,
          name: orgName,
          slug: defaultOrgSlug,
          billing_plan: "FREE",
          created_by: userId,
        })
        .select("id, name, slug, billing_plan")
        .single();

      if (orgErr) {
        console.error(
          "[resolveOrCreateGoogleUser] Failed to create organization:",
          orgErr.message
        );
      } else {
        org = newOrg;
      }
    }

    if (org) {
      const { data: mem, error: memInsertErr } = await supabase
        .from("organization_memberships")
        .upsert(
          {
            organization_id: org.id,
            user_id: userId,
            status: "active",
          },
          { onConflict: "organization_id,user_id" }
        )
        .select("id")
        .single();

      if (!memInsertErr && mem?.id) {
        await supabase.from("member_roles").upsert(
          {
            membership_id: mem.id,
            role_id: SYSTEM_OWNER_ROLE_ID,
          },
          { onConflict: "membership_id,role_id" }
        );
      }

      workspaces = [
        {
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan: (org.billing_plan || "FREE").toUpperCase() as any,
          role: "OWNER",
        },
      ];
    }
  }

  const sessionUser: SessionUser = {
    id: userId,
    email,
    name: profile.name || email.split("@")[0],
    avatarUrl: profile.avatarUrl,
    provider: "google",
    onboardingCompleted: workspaces.length > 0,
    workspaces,
  };

  return { user: sessionUser, isNewUser };
}

/**
 * Finds a user by internal UUID or legacy ID from Supabase.
 */
export async function getUserById(id: string): Promise<StoredUser | null> {
  const supabase = createAdminClient();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase.from("profiles").select("*");
  const { data: profile, error } = isUuid
    ? await query.eq("id", id).maybeSingle()
    : await query.eq("legacy_id", id).maybeSingle();

  if (error || !profile) return null;

  // Load user's organization memberships
  const { data: memRows } = await supabase
    .from("organization_memberships")
    .select(`
      id,
      organization_id,
      status,
      organization:organizations(id, name, slug, billing_plan)
    `)
    .eq("user_id", profile.id)
    .eq("status", "active");

  const workspaces: WorkspaceMembership[] = (memRows || [])
    .map((m: any) => {
      const org = m.organization;
      if (!org) return null;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: (org.billing_plan || "FREE").toUpperCase() as any,
        role: "OWNER" as const,
      };
    })
    .filter(Boolean) as WorkspaceMembership[];

  return {
    id: profile.id,
    email: profile.email,
    name: profile.display_name || profile.email.split("@")[0],
    avatarUrl: profile.avatar_url || undefined,
    googleSub: "",
    onboardingCompleted: workspaces.length > 0,
    createdAt: new Date(profile.created_at).getTime(),
    updatedAt: new Date(profile.updated_at).getTime(),
    lastLoginAt: new Date(profile.updated_at).getTime(),
    workspaces,
  };
}

/**
 * Completes onboarding state for a user directly in Supabase.
 */
export async function completeUserOnboarding(
  userId: string,
  initialWorkspace?: WorkspaceMembership
): Promise<StoredUser | null> {
  const supabase = createAdminClient();

  if (initialWorkspace) {
    const isOrgUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        initialWorkspace.id
      );
    const orgId = isOrgUuid ? initialWorkspace.id : crypto.randomUUID();

    const { data: org } = await supabase
      .from("organizations")
      .upsert(
        {
          id: orgId,
          name: initialWorkspace.name,
          slug: initialWorkspace.slug,
          billing_plan: "FREE",
          created_by: userId,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (org) {
      const { data: mem } = await supabase
        .from("organization_memberships")
        .upsert(
          {
            organization_id: org.id,
            user_id: userId,
            status: "active",
          },
          { onConflict: "organization_id,user_id" }
        )
        .select("id")
        .single();

      if (mem?.id) {
        await supabase.from("member_roles").upsert(
          {
            membership_id: mem.id,
            role_id: SYSTEM_OWNER_ROLE_ID,
          },
          { onConflict: "membership_id,role_id" }
        );
      }
    }
  }

  return await getUserById(userId);
}
