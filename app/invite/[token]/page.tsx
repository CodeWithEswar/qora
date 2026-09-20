import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NytraLogo } from "@/components/shared/nytra-logo";
import { NytraMark } from "@/components/shared/nytra-mark";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { validateInvitationTokenInD1 } from "@nxtqr/db";
import { Shield, Users, ArrowRight, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { RoleBadge } from "@/components/organization/shared/role-badge";

export default async function InviteAcceptancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getSession();

  let inviteInfo: {
    organizationName: string;
    organizationSlug: string;
    email: string;
    roleName: string;
    isExpired: boolean;
    isValid: boolean;
  } | null = null;

  try {
    // In local dev/fallback if D1 is not globally attached
    const d1 = (globalThis as any).DB;
    if (d1) {
      inviteInfo = await validateInvitationTokenInD1(d1, token);
    } else {
      const { findInvitationByToken } = await import("@/lib/domains/organization-store");
      inviteInfo = findInvitationByToken(token);
    }
  } catch {
    inviteInfo = null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow and subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(250,82,15,0.12),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <NytraLogo className="h-8 w-auto text-foreground" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            WORKSPACE INVITATION
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          {!inviteInfo || !inviteInfo.isValid ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Invalid or Expired Invitation
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This invitation link has expired, was revoked by an administrator, or has already been used. Please request a new invitation.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href="/login">Return to login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-semibold text-foreground font-serif tracking-tight">
                  You&apos;ve been invited
                </h2>
                <p className="text-xs text-muted-foreground">
                  Join <span className="font-semibold text-foreground">{inviteInfo.organizationName}</span> on NXTQR.
                </p>
              </div>

              {/* Invitation Summary Panel */}
              <div className="rounded-xl border border-border/70 bg-surface-hover/50 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Workspace</span>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{inviteInfo.organizationName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Role</span>
                  <RoleBadge role={inviteInfo.roleName} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Invited Email</span>
                  <span className="font-mono text-[11px] text-foreground">
                    {inviteInfo.email}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {session?.user ? (
                  <form
                    action={async () => {
                      "use server";
                      // Redirect to API accept or perform accept
                      redirect(`/${inviteInfo?.organizationSlug}`);
                    }}
                  >
                    <Button
                      type="submit"
                      className="w-full text-xs h-10 bg-primary hover:bg-primary/90 text-white gap-2 font-medium"
                    >
                      <span>Join workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    asChild
                    className="w-full text-xs h-10 bg-primary hover:bg-primary/90 text-white gap-2 font-medium"
                  >
                    <Link href={`/login?callbackUrl=/invite/${token}`}>
                      <span>Continue with Google to join</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                <p className="text-[11px] text-center text-muted-foreground">
                  By joining, you agree to access boundaries established by {inviteInfo.organizationName}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
