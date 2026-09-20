import { NextRequest, NextResponse } from "next/server";
import { createSession, SessionUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Dev login only allowed in development" }, { status: 403 });
    }

    const orgSlug = request.nextUrl.searchParams.get("orgSlug") || "workspace";
    const returnTo = request.nextUrl.searchParams.get("returnTo") || `/${orgSlug}/qr`;

    const allWorkspaces = [
      {
        id: "e92b00e2-7443-4537-afc5-d708bb138d09",
        name: "Workspace",
        slug: "workspace",
        role: "OWNER" as const,
        plan: "FREE" as const,
      },
      {
        id: "6622374b-0237-412f-8d40-8204ecdf6b58",
        name: "Laddah Studio",
        slug: "laddah-studio",
        role: "OWNER" as const,
        plan: "FREE" as const,
      },
      {
        id: "c0d80992-d4df-443c-8b53-e3847e426569",
        name: "Chintu's Workspace",
        slug: "laddahdev",
        role: "OWNER" as const,
        plan: "FREE" as const,
      },
    ];

    // Put selected org first so it acts as active workspace
    const sortedWorkspaces = [...allWorkspaces].sort((a, b) => (a.slug === orgSlug ? -1 : b.slug === orgSlug ? 1 : 0));

    const devUser: SessionUser = {
      id: "1787feda-2a5c-447b-b5e4-7620d718e884",
      email: "eswarchinthakayala2022@gmail.com",
      name: "Eswar Chinthakayala",
      avatarUrl: "",
      provider: "google",
      onboardingCompleted: true,
      workspaces: sortedWorkspaces,
    };

    // Ensure dev profile exists in Supabase PostgreSQL
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      await (supabase as any).from("profiles").upsert(
        {
          id: devUser.id,
          email: devUser.email,
          full_name: devUser.name,
        },
        { onConflict: "id" }
      );
    } catch {}

    const sessionToken = await createSession(devUser);
    const response = NextResponse.redirect(new URL(returnTo, request.nextUrl.origin));
    response.cookies.set("nxtqr_session", sessionToken, {
      httpOnly: true,
      secure: false,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[dev-login error]:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
