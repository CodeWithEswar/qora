import * as React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Building, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Welcome to NXTQR — Workspace Setup",
  description: "Set up your smart QR infrastructure workspace.",
  robots: "noindex, nofollow",
};

export default async function OnboardingPage() {
  const user = await requireAuth("/onboarding");
  const primaryWorkspace = user.workspaces?.[0];
  const targetHref = primaryWorkspace ? `/${primaryWorkspace.slug}` : "/";

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-between bg-background text-foreground px-4 py-8 sm:py-12">
      {/* Top Brand Bar */}
      <header className="w-full max-w-2xl flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <NxtqrMark size={28} />
          <span className="font-bold text-lg tracking-tight">NXTQR</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Avatar className="h-6 w-6 border border-border">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-[10px]">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block font-mono text-[11px] truncate max-w-[160px]">
            {user.email}
          </span>
          <a
            href="/api/auth/signout"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            Sign out
          </a>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-lg my-auto py-8">
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/40 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>Identity Verified</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
              Welcome to NXTQR, {user.name.split(" ")[0]}.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your Google identity is verified and connected to the NXTQR edge data plane. You are ready to configure your Smart QR infrastructure.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Account Status</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
              <div>
                <span className="text-muted-foreground block text-[10px]">Primary Email</span>
                <span className="font-medium text-foreground truncate block">{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Edge Routing Plan</span>
                <span className="font-medium text-primary block">Free Developer Tier</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
              Ready in Next Phase (2B)
            </h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Building className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Create custom workspace organization and team slug</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Optionally link phone security verification and custom domain</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              asChild
              className="w-full bg-primary hover:bg-[#CC3A05] text-white text-xs h-10 font-medium gap-2 shadow-sm"
            >
              <Link href={targetHref}>
                <span>Enter {primaryWorkspace?.name || "Workspace"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="text-[11px] text-muted-foreground text-center">
        <span>© 2026 NXTQR — Smart QR Infrastructure</span>
      </footer>
    </div>
  );
}
