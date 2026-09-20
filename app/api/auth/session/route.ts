import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  let workspaces = session.user.workspaces || [];

  // Query Supabase authoritatively for active organization memberships
  try {
    const supabase = createAdminClient();
    let currentUserId = session.user.id;

    if (session.user.email) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", session.user.email.toLowerCase().trim())
        .maybeSingle();
      if (prof?.id) {
        currentUserId = prof.id;
      }
    }

    if (currentUserId) {
      const { data: memRows } = await supabase
        .from("organization_memberships")
        .select(`
          id,
          organization_id,
          status,
          organization:organizations(id, name, slug, billing_plan)
        `)
        .eq("user_id", currentUserId)
        .eq("status", "active");

      if (memRows && memRows.length > 0) {
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
          .filter(Boolean) as any[];
      }
    }
  } catch (err) {
    console.error("[SessionAPI] Error fetching authoritative workspaces from Supabase:", err);
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
        onboardingCompleted: session.user.onboardingCompleted,
        workspaces,
      },
    },
    { status: 200 }
  );
}
