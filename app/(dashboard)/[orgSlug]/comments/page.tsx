import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseCommentsRepository } from "@/lib/supabase/repositories/comments";
import { CommentsView } from "@/components/collaborate/comments/comments-view";
import type {
  ThreadSummary,
  ThreadPulseMetrics,
  CollaborationAtlasMetrics,
  ThreadDetail,
} from "@/lib/supabase/types/comments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Comments — Contextual Collaboration Workspace | NXTQR",
  description:
    "Keep operational conversations connected to the work they belong to across NXTQR.",
};

export default async function CommentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ thread?: string; domain?: string }>;
}) {
  const { orgSlug } = await params;
  const { thread: threadParam, domain: domainParam } = await searchParams;
  const session = await getSession();

  let org = null;
  try {
    org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  } catch (err) {
    console.error("[CommentsPage] Failed to fetch organization from Supabase:", err);
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Workspace Not Found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            The workspace &quot;{orgSlug}&quot; could not be resolved from Supabase directory records.
          </p>
        </div>
        <Link href={`/${orgSlug}`}>
          <Button variant="outline" size="sm" className="text-xs">
            Return to Overview
          </Button>
        </Link>
      </div>
    );
  }

  let threads: ThreadSummary[] = [];
  let pulse: ThreadPulseMetrics = {
    threadsCount: 0,
    unreadCount: 0,
    mentionsCount: 0,
    unresolvedCount: 0,
  };
  let atlas: CollaborationAtlasMetrics = {
    totalThreads: 0,
    domainBreakdown: [],
  };
  let initialSelectedThread: ThreadDetail | null = null;
  let mentionableMembers: { id: string; name: string; email: string; role?: string }[] = [];
  let loadError: string | null = null;

  try {
    const [fetchedThreads, fetchedPulse, fetchedAtlas, fetchedMembers] = await Promise.all([
      SupabaseCommentsRepository.listThreads(org.id, undefined, session?.user?.id),
      SupabaseCommentsRepository.getPulseMetrics(org.id, session?.user?.id),
      SupabaseCommentsRepository.getAtlasMetrics(org.id),
      SupabaseMembersRepository.listMembers(org.id).catch(() => []),
    ]);

    threads = fetchedThreads;
    pulse = fetchedPulse;
    atlas = fetchedAtlas;

    mentionableMembers = (fetchedMembers || []).map((m: any) => ({
      id: m.id,
      name: m.name || m.email,
      email: m.email,
      role: m.roleName || m.role,
    }));

    // Auto-select thread if specified in searchParams or default to first thread if available
    const targetThreadId = threadParam || threads[0]?.publicId || threads[0]?.id;
    if (targetThreadId) {
      try {
        initialSelectedThread = await SupabaseCommentsRepository.getThreadDetail(
          org.id,
          targetThreadId,
          session?.user?.id
        );
      } catch (e) {
        console.warn("[CommentsPage] Could not load initial thread detail:", e);
      }
    }
  } catch (err: any) {
    console.error("[CommentsPage] Error fetching Supabase comments data:", err);
    loadError = err?.message || "Failed to load operational discussions.";
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            COMMENTS / UNAVAILABLE
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Discussions Couldn&apos;t Be Loaded
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {loadError}
          </p>
        </div>
        <Link href={`/${orgSlug}/comments`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 font-mono">
            <RotateCcw className="h-3 w-3" />
            <span>Try Again</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <CommentsView
      organization={{
        id: org.id,
        name: org.name,
        slug: org.slug,
      }}
      initialThreads={threads}
      initialPulse={pulse}
      initialAtlas={atlas}
      initialSelectedThread={initialSelectedThread}
      members={mentionableMembers}
      canCreateThread={true}
    />
  );
}
