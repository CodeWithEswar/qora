"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CommentsPageHeader } from "./shell/comments-page-header";
import { CollaborationSignalRail, type CollaborationSignalMetrics } from "./shell/collaboration-signal-rail";
import { CommentsViewTabs, type CollaborationViewTab, type WorkspaceDisplayMode } from "./shell/comments-view-tabs";
import { DiscussionStream } from "./stream/discussion-stream";
import { ThreadWorkspace } from "./workspace/thread-workspace";
import { ResourceContextRail } from "./context/resource-context-rail";
import { ConversationConstellation } from "./constellation/conversation-constellation";
import { CommentsFilterSheet } from "./dialogs/comments-filter-sheet";
import { StartDiscussionDialog } from "./dialogs/start-discussion-dialog";
import { ResolveThreadDialog } from "./dialogs/resolve-thread-dialog";
import { ReopenThreadDialog } from "./dialogs/reopen-thread-dialog";
import { EditCommentDialog } from "./dialogs/edit-comment-dialog";
import { DeleteCommentAlert } from "./dialogs/delete-comment-alert";
import { ThreadDetailsSheet } from "./details/thread-details-sheet";
import type {
  ThreadSummary,
  ThreadDetail,
  CommentDTO,
  ThreadPulseMetrics,
  CollaborationAtlasMetrics,
  ThreadContextType,
} from "@/lib/supabase/types/comments";
import type { MentionMemberItem } from "./composer/mention-popover";
import { toast } from "sonner";

interface CommentsViewProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  initialThreads: ThreadSummary[];
  initialPulse: ThreadPulseMetrics;
  initialAtlas: CollaborationAtlasMetrics;
  initialSelectedThread: ThreadDetail | null;
  members: MentionMemberItem[];
  canCreateThread?: boolean;
}

export function CommentsView({
  organization,
  initialThreads,
  initialPulse,
  initialAtlas,
  initialSelectedThread,
  members,
  canCreateThread = true,
}: CommentsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary State
  const [threads, setThreads] = React.useState<ThreadSummary[]>(initialThreads);
  const [selectedThread, setSelectedThread] = React.useState<ThreadDetail | null>(
    initialSelectedThread
  );
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  // Navigation & View Modes
  const [activeView, setActiveView] = React.useState<CollaborationViewTab>("for_you");
  const [displayMode, setDisplayMode] = React.useState<WorkspaceDisplayMode>("stream");
  const [mobilePane, setMobilePane] = React.useState<"list" | "detail">(
    initialSelectedThread ? "detail" : "list"
  );

  // Filtering State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [contextFilter, setContextFilter] = React.useState("all");
  const [stateFilter, setStateFilter] = React.useState("all");
  const [sort, setSort] = React.useState("latest_activity");
  const [selectedParticipantId, setSelectedParticipantId] = React.useState<string | null>(null);

  // Dialog & Sheet States
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = React.useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = React.useState(false);
  const [isReopenDialogOpen, setIsReopenDialogOpen] = React.useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = React.useState(false);
  const [editingComment, setEditingComment] = React.useState<CommentDTO | null>(null);
  const [deletingComment, setDeletingComment] = React.useState<CommentDTO | null>(null);

  const orgSlug = organization.slug;

  // Sync server revalidation
  React.useEffect(() => {
    setThreads(initialThreads);
    if (!selectedThread && initialSelectedThread) {
      setSelectedThread(initialSelectedThread);
    }
  }, [initialThreads, initialSelectedThread]);

  // Handle URL deep link query parameter
  React.useEffect(() => {
    const threadParam = searchParams.get("thread");
    if (threadParam && selectedThread?.publicId !== threadParam) {
      const match = threads.find(
        (t) => t.publicId === threadParam || t.id === threadParam
      );
      if (match) {
        handleSelectThread(match);
      }
    }
  }, [searchParams]);

  // Real-time calculated signal metrics
  const signalMetrics: CollaborationSignalMetrics = React.useMemo(() => {
    const totalThreads = threads.length;
    const openCount = threads.filter((t) => t.state === "OPEN").length;
    const mentionsCount = threads.filter((t) => t.isMentioned || t.mentionedCurrentMember).length;
    const myThreadsCount = threads.filter((t) => t.isCurrentUserParticipant).length;
    const resolvedCount = threads.filter((t) => t.state === "RESOLVED").length;
    return {
      totalThreads,
      openCount,
      mentionsCount,
      myThreadsCount,
      resolvedCount,
    };
  }, [threads]);

  // Deterministic Attention Filter: For You
  const isAttentionRequired = React.useCallback((t: ThreadSummary) => {
    return Boolean(
      t.isMentioned ||
      t.mentionedCurrentMember ||
      (t.contextType === "approval" && t.state === "OPEN") ||
      t.isCurrentUserParticipant
    );
  }, []);

  // Filtered & Sorted Threads
  const filteredThreads = React.useMemo(() => {
    let list = [...threads];

    // 1. View Tab Filter
    if (activeView === "for_you") {
      list = list.filter((t) => isAttentionRequired(t));
    } else if (activeView === "mentions") {
      list = list.filter((t) => t.isMentioned || t.mentionedCurrentMember);
    } else if (activeView === "my_threads") {
      list = list.filter((t) => t.isCurrentUserParticipant);
    } else if (activeView === "resolved") {
      list = list.filter((t) => t.state === "RESOLVED");
    }

    // 2. Resource/Context Filter
    if (contextFilter !== "all") {
      list = list.filter((t) => t.contextType === contextFilter);
    }

    // 3. State Filter
    if (stateFilter !== "all") {
      list = list.filter((t) => t.state === stateFilter);
    }

    // 4. Participant Weave Filter
    if (selectedParticipantId) {
      list = list.filter((t) =>
        t.participants.some((p) => p.id === selectedParticipantId) ||
        t.createdBy.id === selectedParticipantId
      );
    }

    // 5. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.publicId.toLowerCase().includes(q) ||
          t.contextRef.toLowerCase().includes(q) ||
          t.contextTitle.toLowerCase().includes(q) ||
          (t.latestComment?.snippet || "").toLowerCase().includes(q) ||
          t.participants.some((p) => p.name.toLowerCase().includes(q))
      );
    }

    // 6. Sort
    list.sort((a, b) => {
      if (sort === "oldest_activity") {
        return new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime();
      }
      if (sort === "most_comments") {
        return b.commentCount - a.commentCount;
      }
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

    return list;
  }, [threads, activeView, contextFilter, stateFilter, selectedParticipantId, searchQuery, sort, isAttentionRequired]);

  // Select Thread handler
  const handleSelectThread = async (summary: ThreadSummary) => {
    if (selectedThread?.id === summary.id) {
      setMobilePane("detail");
      return;
    }

    setIsLoadingDetail(true);
    setMobilePane("detail");

    // Update URL query param cleanly without reloading page
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("thread", summary.publicId);
    window.history.replaceState({}, "", currentUrl.toString());

    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/comments/threads/${summary.id}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          setThreads((prev) =>
            prev.filter((t) => t.id !== summary.id && t.publicId !== summary.publicId)
          );
          setSelectedThread(null);
          toast.error("This discussion has been removed or no longer exists.");
          return;
        }
        throw new Error("Failed to load thread discussion.");
      }
      const resJson = await res.json();
      const thread = resJson.data?.thread || resJson.thread || resJson.data;
      if (thread && thread.id) {
        setSelectedThread(thread);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not load thread discussion.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // API Mutation: Create Thread
  const handleCreateThread = async (payload: {
    contextType: ThreadContextType;
    contextId: string;
    contextRef: string;
    contextTitle?: string;
    title: string;
    initialComment?: string;
    contextState?: string;
    contextMetadata?: Record<string, any>;
  }): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/comments/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to initialize discussion thread.");
      }

      const resJson = await res.json();
      const newThread: ThreadDetail =
        resJson.data?.thread || resJson.thread || resJson.data;

      if (newThread) {
        setThreads((prev) => [newThread, ...prev]);
        setSelectedThread(newThread);
        setMobilePane("detail");
        toast.success(`Discussion ${newThread.publicId} created.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Failed to start discussion.");
      return false;
    }
  };

  // API Mutation: Post Comment / Reply
  const handleSubmitComment = async (payload: {
    body: string;
    parentCommentId?: string;
    mentions?: string[];
    references?: Array<{
      referencedType: string;
      referencedId: string;
      referencedRef: string;
      referencedTitle?: string;
      referencedState?: string;
    }>;
    attachments?: Array<{
      name: string;
      fileType: string;
      mimeType: string;
      sizeBytes: number;
      storagePath: string;
    }>;
  }): Promise<boolean> => {
    if (!selectedThread) return false;

    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/comments/threads/${selectedThread.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to post comment.");
      }

      const resJson = await res.json();
      const newComment: CommentDTO =
        resJson.data?.comment || resJson.comment || resJson.data;

      if (newComment) {
        // Append to active thread
        setSelectedThread((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: [...prev.comments, newComment],
            commentCount: prev.commentCount + 1,
            lastActivityAt: new Date().toISOString(),
          };
        });

        // Update in thread list
        setThreads((prev) =>
          prev.map((t) =>
            t.id === selectedThread.id
              ? {
                  ...t,
                  commentCount: t.commentCount + 1,
                  lastActivityAt: new Date().toISOString(),
                  latestComment: {
                    id: newComment.id,
                    publicId: newComment.publicId,
                    authorName: newComment.author.name,
                    snippet: newComment.body.substring(0, 80),
                    createdAt: newComment.createdAt,
                  },
                }
              : t
          )
        );

        toast.success(payload.parentCommentId ? "Reply posted." : "Comment posted.");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment.");
      return false;
    }
  };

  // API Mutation: Resolve Thread
  const handleResolveThread = async (
    threadPublicId: string,
    resolutionNote?: string
  ): Promise<boolean> => {
    if (!selectedThread) return false;

    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/comments/threads/${selectedThread.id}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "resolve",
            resolutionNote: resolutionNote?.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to resolve discussion.");
      }

      toast.success("Discussion resolved.");

      const nowIso = new Date().toISOString();
      setSelectedThread((prev) =>
        prev
          ? {
              ...prev,
              state: "RESOLVED",
              resolutionNote: resolutionNote?.trim() || null,
              resolvedAt: nowIso,
              availableActions: {
                ...prev.availableActions,
                canResolve: false,
                canReopen: true,
                canComment: false,
              },
            }
          : prev
      );

      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id
            ? {
                ...t,
                state: "RESOLVED",
                resolutionNote: resolutionNote?.trim() || null,
                resolvedAt: nowIso,
              }
            : t
        )
      );

      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve discussion.");
      return false;
    }
  };

  // API Mutation: Reopen Thread
  const handleReopenThread = async (threadPublicId: string): Promise<boolean> => {
    if (!selectedThread) return false;

    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/comments/threads/${selectedThread.id}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reopen" }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reopen discussion.");
      }

      toast.success("Discussion reopened.");

      const nowIso = new Date().toISOString();
      setSelectedThread((prev) =>
        prev
          ? {
              ...prev,
              state: "OPEN",
              resolutionNote: null,
              resolvedAt: null,
              resolvedBy: null,
              lastActivityAt: nowIso,
              availableActions: {
                ...prev.availableActions,
                canResolve: true,
                canReopen: false,
                canComment: true,
              },
            }
          : prev
      );

      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id
            ? {
                ...t,
                state: "OPEN",
                resolutionNote: null,
                resolvedAt: null,
                resolvedBy: null,
                lastActivityAt: nowIso,
              }
            : t
        )
      );

      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen discussion.");
      return false;
    }
  };

  // API Mutation: Edit Comment
  const handleSaveEditComment = async (
    commentPublicId: string,
    newBody: string
  ): Promise<boolean> => {
    if (!selectedThread) return false;

    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/comments/threads/${selectedThread.id}/comments/${commentPublicId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: newBody }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to edit comment.");
      }

      toast.success("Comment updated.");

      setSelectedThread((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.publicId === commentPublicId || c.id === commentPublicId
              ? { ...c, body: newBody, editedAt: new Date().toISOString() }
              : c
          ),
        };
      });

      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to edit comment.");
      return false;
    }
  };

  // API Mutation: Delete Comment (Soft delete tombstone)
  const handleConfirmDeleteComment = async (
    commentPublicId: string
  ): Promise<boolean> => {
    if (!selectedThread) return false;

    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/comments/threads/${selectedThread.id}/comments/${commentPublicId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete comment.");
      }

      toast.success("Comment deleted.");

      setSelectedThread((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.publicId === commentPublicId || c.id === commentPublicId
              ? { ...c, deletedAt: new Date().toISOString(), isDeleted: true }
              : c
          ),
        };
      });

      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete comment.");
      return false;
    }
  };

  const activeFilterCount =
    (contextFilter !== "all" ? 1 : 0) +
    (stateFilter !== "all" ? 1 : 0) +
    (selectedParticipantId ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* 01 Page Header */}
      <CommentsPageHeader
        onStartDiscussion={() => setIsStartDialogOpen(true)}
        canCreate={canCreateThread}
      />

      {/* 02 Connected Collaboration Signal Rail */}
      <CollaborationSignalRail
        metrics={signalMetrics}
        activeFilter={activeView === "for_you" ? undefined : activeView}
        onFilterSelect={(view) => {
          if (view === "open") setStateFilter("OPEN");
          else if (view === "resolved") {
            setActiveView("resolved");
            setStateFilter("all");
          } else if (view === "mentions") {
            setActiveView("mentions");
          } else if (view === "my_threads") {
            setActiveView("my_threads");
          } else {
            setActiveView("all");
            setStateFilter("all");
          }
        }}
      />

      {/* 03 View Navigation Tabs & Mode Switcher */}
      <CommentsViewTabs
        activeView={activeView}
        onViewChange={setActiveView}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        counts={{
          forYou: threads.filter(isAttentionRequired).length,
          all: threads.length,
          mentions: signalMetrics.mentionsCount,
          myThreads: signalMetrics.myThreadsCount,
          resolved: signalMetrics.resolvedCount,
        }}
      />

      {/* 04 Main Content Surface */}
      {displayMode === "constellation" ? (
        /* Conversation Constellation View */
        <ConversationConstellation
          threads={filteredThreads}
          selectedThreadId={selectedThread?.id}
          onSelectThread={(t) => {
            handleSelectThread(t);
            setDisplayMode("stream");
          }}
        />
      ) : (
        /* 3-Column Workspace at 1440px+ (Discussion Stream | Thread Workspace | Resource Context Rail) */
        <div className="grid grid-cols-1 md:grid-cols-12 2xl:grid-cols-12 gap-5 items-start">
          {/* Left Rail: Discussion Stream */}
          <div
            className={`md:col-span-5 2xl:col-span-4 h-[720px] ${
              mobilePane === "detail" ? "hidden md:block" : "block"
            }`}
          >
            <DiscussionStream
              threads={filteredThreads}
              selectedThreadId={selectedThread?.id}
              onSelectThread={handleSelectThread}
              onStartDiscussion={() => setIsStartDialogOpen(true)}
              onOpenFilters={() => setIsFilterSheetOpen(true)}
              activeFilterCount={activeFilterCount}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeView={activeView}
            />
          </div>

          {/* Center Column: Thread Workspace */}
          <div
            className={`md:col-span-7 2xl:col-span-5 h-[720px] ${
              mobilePane === "list" ? "hidden md:block" : "block"
            }`}
          >
            <ThreadWorkspace
              thread={selectedThread}
              isLoading={isLoadingDetail}
              onBackToStream={() => setMobilePane("list")}
              onOpenDetails={() => setIsDetailsSheetOpen(true)}
              onOpenResolve={() => setIsResolveDialogOpen(true)}
              onOpenReopen={() => setIsReopenDialogOpen(true)}
              onEditComment={(c) => setEditingComment(c)}
              onDeleteComment={(c) => setDeletingComment(c)}
              onSubmitComment={handleSubmitComment}
              members={members}
            />
          </div>

          {/* Right Rail: Resource Context Rail (Visible on 2xl / 1440px+) */}
          <div className="hidden 2xl:block 2xl:col-span-3 h-[720px]">
            <ResourceContextRail
              thread={selectedThread}
              orgSlug={orgSlug}
              selectedParticipantId={selectedParticipantId}
              onParticipantFilter={setSelectedParticipantId}
            />
          </div>
        </div>
      )}

      {/* Filter Sheet */}
      <CommentsFilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        stateFilter={stateFilter}
        onStateFilterChange={setStateFilter}
        domainFilter={contextFilter}
        onDomainFilterChange={setContextFilter}
        sort={sort}
        onSortChange={setSort}
        onClearAll={() => {
          setContextFilter("all");
          setStateFilter("all");
          setSelectedParticipantId(null);
          setSearchQuery("");
        }}
        matchingCount={filteredThreads.length}
      />

      {/* Action Dialogs */}
      <StartDiscussionDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
        onCreateThread={handleCreateThread}
      />

      <ResolveThreadDialog
        thread={selectedThread}
        open={isResolveDialogOpen}
        onOpenChange={setIsResolveDialogOpen}
        onResolve={handleResolveThread}
      />

      <ReopenThreadDialog
        thread={selectedThread}
        open={isReopenDialogOpen}
        onOpenChange={setIsReopenDialogOpen}
        onReopen={handleReopenThread}
      />

      <EditCommentDialog
        comment={editingComment}
        open={Boolean(editingComment)}
        onOpenChange={(open) => !open && setEditingComment(null)}
        onSave={handleSaveEditComment}
      />

      <DeleteCommentAlert
        comment={deletingComment}
        open={Boolean(deletingComment)}
        onOpenChange={(open) => !open && setDeletingComment(null)}
        onConfirmDelete={handleConfirmDeleteComment}
      />

      {/* Context Sheet (for viewports < 1440px) */}
      <ThreadDetailsSheet
        thread={selectedThread}
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />
    </div>
  );
}
