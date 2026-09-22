"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "@nxtqr/contracts";
import {
  CommentContextType,
  ThreadState,
  ParticipantItem,
  ThreadSummary,
  CommentDTO,
  ThreadDetail,
  ThreadPulseMetrics,
  CollaborationAtlasMetrics,
  ThreadFilters,
  CommentReferenceItem,
  CommentAttachmentItem,
  CANONICAL_COMMENT_CONTEXTS,
} from "../types/comments";

export * from "../types/comments";

function getClient() {
  return createAdminClient();
}

function generatePublicId(prefix: "THR" | "CMT"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const SupabaseCommentsRepository = {
  /**
   * High-level thread pulse metrics.
   */
  async getPulseMetrics(orgId: string, currentUserId?: string): Promise<ThreadPulseMetrics> {
    const supabase = getClient();

    const { data: threads } = await supabase
      .from("collaboration_threads")
      .select("id, state, created_at")
      .eq("organization_id", orgId);

    const totalThreads = threads?.length || 0;
    const unresolvedCount = threads?.filter((t) => t.state === "OPEN").length || 0;

    let unreadCount = 0;
    let mentionsCount = 0;

    if (currentUserId && threads && threads.length > 0) {
      const threadIds = threads.map((t) => t.id);

      // Get read states
      const { data: readStates } = await supabase
        .from("thread_read_states")
        .select("thread_id, last_read_at")
        .eq("user_id", currentUserId)
        .in("thread_id", threadIds);

      const readMap = new Map<string, string>();
      readStates?.forEach((r) => readMap.set(r.thread_id, r.last_read_at));

      // Calculate unread
      threads.forEach((t) => {
        const lastRead = readMap.get(t.id);
        if (!lastRead) {
          unreadCount++;
        }
      });

      // Calculate mentions
      const { data: mentions } = await supabase
        .from("comment_mentions")
        .select("comment_id")
        .eq("user_id", currentUserId);

      mentionsCount = mentions?.length || 0;
    }

    return {
      totalThreads,
      unreadCount,
      mentionsCount,
      unresolvedCount,
    };
  },

  /**
   * Collaboration Atlas distribution by domain.
   */
  async getAtlasMetrics(orgId: string): Promise<CollaborationAtlasMetrics> {
    const supabase = getClient();

    const { data: threads } = await supabase
      .from("collaboration_threads")
      .select("context_type, state")
      .eq("organization_id", orgId);

    const countMap: Record<string, { total: number; active: number }> = {};

    CANONICAL_COMMENT_CONTEXTS.forEach((c) => {
      countMap[c.type] = { total: 0, active: 0 };
    });

    threads?.forEach((t) => {
      if (!countMap[t.context_type]) {
        countMap[t.context_type] = { total: 0, active: 0 };
      }
      countMap[t.context_type].total++;
      if (t.state === "OPEN") {
        countMap[t.context_type].active++;
      }
    });

    const domainBreakdown = CANONICAL_COMMENT_CONTEXTS.map((c) => ({
      domain: c.domain,
      contextType: c.type,
      count: countMap[c.type]?.total || 0,
      activeCount: countMap[c.type]?.active || 0,
    })).filter((d) => d.count > 0);

    return {
      totalThreads: threads?.length || 0,
      domainBreakdown,
    };
  },

  /**
   * Lists collaboration threads with optional filters.
   */
  async listThreads(
    orgId: string,
    filters?: ThreadFilters,
    currentUserId?: string
  ): Promise<ThreadSummary[]> {
    const supabase = getClient();

    let query = supabase
      .from("collaboration_threads")
      .select(`
        *,
        creator:profiles!collaboration_threads_created_by_fkey(id, display_name, email, avatar_url),
        resolver:profiles!collaboration_threads_resolved_by_fkey(id, display_name)
      `)
      .eq("organization_id", orgId);

    if (filters?.domain && filters.domain !== "all") {
      query = query.eq("context_type", filters.domain);
    }

    if (filters?.state && filters.state !== "all") {
      query = query.eq("state", filters.state.toUpperCase());
    }

    if (filters?.sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      query = query.order("last_activity_at", { ascending: false });
    }

    const { data: rows, error } = await query;

    if (error || !rows) {
      console.error("[SupabaseCommentsRepository.listThreads] error:", error);
      return [];
    }

    const threadIds = rows.map((r) => r.id);

    // Fetch comment aggregates & latest comment snippets
    const { data: allComments } = await supabase
      .from("comments")
      .select(`
        id,
        public_id,
        thread_id,
        content,
        created_at,
        deleted_at,
        author:profiles!comments_author_id_fkey(id, display_name, email, avatar_url)
      `)
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    // Fetch read states
    let readMap = new Map<string, string>();
    if (currentUserId) {
      const { data: readRows } = await supabase
        .from("thread_read_states")
        .select("thread_id, last_read_at")
        .eq("user_id", currentUserId)
        .in("thread_id", threadIds);
      readRows?.forEach((r) => readMap.set(r.thread_id, r.last_read_at));
    }

    // Fetch mentions for current user
    let mentionedThreadIds = new Set<string>();
    if (currentUserId) {
      const { data: mentionRows } = await supabase
        .from("comment_mentions")
        .select("comment_id, comments!inner(thread_id)")
        .eq("user_id", currentUserId);
      
      mentionRows?.forEach((m: any) => {
        if (m.comments?.thread_id) mentionedThreadIds.add(m.comments.thread_id);
      });
    }

    // Group comments & participants by thread
    const threadCommentsMap = new Map<string, any[]>();
    allComments?.forEach((c) => {
      if (c.thread_id) {
        if (!threadCommentsMap.has(c.thread_id)) {
          threadCommentsMap.set(c.thread_id, []);
        }
        threadCommentsMap.get(c.thread_id)?.push(c);
      }
    });

    const summaries: ThreadSummary[] = rows.map((row: any) => {
      const comments = threadCommentsMap.get(row.id) || [];
      const latest = comments.find((c) => !c.deleted_at);

      // Collect participants
      const participantMap = new Map<string, ParticipantItem>();
      if (row.creator) {
        participantMap.set(row.creator.id, {
          id: row.creator.id,
          name: row.creator.display_name || "Admin",
          email: row.creator.email || "",
          avatarUrl: row.creator.avatar_url,
          initials: getInitials(row.creator.display_name || "Admin"),
        });
      }
      comments.forEach((c) => {
        if (c.author && !participantMap.has(c.author.id)) {
          participantMap.set(c.author.id, {
            id: c.author.id,
            name: c.author.display_name || "Member",
            email: c.author.email || "",
            avatarUrl: c.author.avatar_url,
            initials: getInitials(c.author.display_name || "Member"),
          });
        }
      });

      const participants = Array.from(participantMap.values());
      const lastRead = readMap.get(row.id);
      const isUnread = Boolean(!lastRead || (latest && new Date(latest.created_at) > new Date(lastRead)));
      const isMentioned = mentionedThreadIds.has(row.id);

      let snippet = latest ? latest.content : "Discussion started";
      if (snippet.length > 80) snippet = snippet.substring(0, 77) + "...";

      return {
        id: row.id,
        publicId: row.public_id,
        organizationId: row.organization_id,
        contextType: row.context_type as CommentContextType,
        contextId: row.context_id,
        contextTitle: row.context_title,
        contextRef: row.context_ref,
        contextState: row.context_state,
        contextMetadata: row.context_metadata,
        title: row.title,
        state: row.state as ThreadState,
        createdBy: {
          id: row.creator?.id || row.created_by,
          name: row.creator?.display_name || "Admin",
          email: row.creator?.email || "",
          avatarUrl: row.creator?.avatar_url,
          initials: getInitials(row.creator?.display_name || "Admin"),
        },
        resolvedBy: row.resolver ? { id: row.resolver.id, name: row.resolver.display_name } : null,
        resolvedAt: row.resolved_at,
        resolutionNote: row.resolution_note,
        participants,
        participantPreview: participants.slice(0, 4),
        commentCount: comments.filter((c) => !c.deleted_at).length,
        isUnread,
        isMentioned,
        latestComment: latest
          ? {
              id: latest.id,
              publicId: latest.public_id || latest.id,
              authorName: latest.author?.display_name || "Member",
              snippet,
              createdAt: latest.created_at,
            }
          : null,
        lastActivityAt: row.last_activity_at,
        createdAt: row.created_at,
        availableActions: {
          canComment: row.state === "OPEN",
          canResolve: row.state === "OPEN",
          canReopen: row.state === "RESOLVED",
        },
      };
    });

    // Apply view tab filtering if requested
    if (filters?.view) {
      if (filters.view === "my_threads" && currentUserId) {
        return summaries.filter((s) => s.participants.some((p) => p.id === currentUserId));
      } else if (filters.view === "mentions") {
        return summaries.filter((s) => s.isMentioned);
      } else if (filters.view === "unread") {
        return summaries.filter((s) => s.isUnread);
      } else if (filters.view === "unresolved") {
        return summaries.filter((s) => s.state === "OPEN");
      }
    }

    return summaries;
  },

  /**
   * Retrieves deep thread details including comments, mentions, references, attachments, and marks as read.
   */
  async getThreadDetail(
    orgId: string,
    threadPublicIdOrId: string,
    currentUserId?: string
  ): Promise<ThreadDetail> {
    const supabase = getClient();

    let query = supabase
      .from("collaboration_threads")
      .select(`
        *,
        creator:profiles!collaboration_threads_created_by_fkey(id, display_name, email, avatar_url),
        resolver:profiles!collaboration_threads_resolved_by_fkey(id, display_name)
      `)
      .eq("organization_id", orgId);

    if (threadPublicIdOrId.startsWith("THR-")) {
      query = query.eq("public_id", threadPublicIdOrId);
    } else {
      query = query.eq("id", threadPublicIdOrId);
    }

    const { data: thread, error } = await query.maybeSingle();

    if (error || !thread) {
      throw new NotFoundError("Discussion thread not found.");
    }

    // Mark as read for current user
    if (currentUserId) {
      await supabase
        .from("thread_read_states")
        .upsert(
          {
            thread_id: thread.id,
            user_id: currentUserId,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: "thread_id,user_id" }
        );
    }

    // Fetch comments in chronological order
    const { data: commentRows } = await supabase
      .from("comments")
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, display_name, email, avatar_url)
      `)
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true });

    const commentIds = commentRows?.map((c) => c.id) || [];

    // Fetch mentions for these comments
    const { data: mentionRows } = commentIds.length > 0
      ? await supabase
          .from("comment_mentions")
          .select("comment_id, user_id, user:profiles!comment_mentions_user_id_fkey(id, display_name)")
          .in("comment_id", commentIds)
      : { data: [] };

    // Fetch references for these comments
    const { data: referenceRows } = commentIds.length > 0
      ? await supabase
          .from("comment_references")
          .select("*")
          .in("comment_id", commentIds)
      : { data: [] };

    // Fetch attachments for these comments
    const { data: attachmentRows } = commentIds.length > 0
      ? await supabase
          .from("comment_attachments")
          .select("*")
          .in("comment_id", commentIds)
      : { data: [] };

    // Group relations by comment
    const mentionMap = new Map<string, Array<{ userId: string; displayName: string }>>();
    mentionRows?.forEach((m: any) => {
      if (!mentionMap.has(m.comment_id)) mentionMap.set(m.comment_id, []);
      mentionMap.get(m.comment_id)?.push({
        userId: m.user_id,
        displayName: m.user?.display_name || "Member",
      });
    });

    const refMap = new Map<string, CommentReferenceItem[]>();
    referenceRows?.forEach((r: any) => {
      if (!refMap.has(r.comment_id)) refMap.set(r.comment_id, []);
      refMap.get(r.comment_id)?.push({
        id: r.id,
        type: r.referenced_type as CommentContextType,
        idRef: r.referenced_id,
        publicRef: r.referenced_ref,
        title: r.referenced_title,
        state: r.referenced_state,
      });
    });

    const attMap = new Map<string, CommentAttachmentItem[]>();
    attachmentRows?.forEach((a: any) => {
      if (!attMap.has(a.comment_id)) attMap.set(a.comment_id, []);
      attMap.get(a.comment_id)?.push({
        id: a.id,
        name: a.name,
        fileType: a.file_type,
        mimeType: a.mime_type,
        sizeBytes: Number(a.size_bytes),
        storagePath: a.storage_path,
      });
    });

    // Build comment DTOs
    const comments: CommentDTO[] = (commentRows || []).map((row: any) => {
      const isAuthor = Boolean(currentUserId && row.author_id === currentUserId);
      const isDeleted = Boolean(row.deleted_at);

      return {
        id: row.id,
        publicId: row.public_id || `CMT-${row.id.substring(0, 4).toUpperCase()}`,
        threadId: row.thread_id,
        author: {
          id: row.author?.id || row.author_id,
          name: row.author?.display_name || "Member",
          email: row.author?.email || "",
          avatarUrl: row.author?.avatar_url,
          initials: getInitials(row.author?.display_name || "Member"),
        },
        body: isDeleted ? "This comment was deleted." : row.content,
        bodyFormat: row.body_format || "markdown",
        createdAt: row.created_at,
        editedAt: row.edited_at,
        isDeleted,
        mentions: mentionMap.get(row.id) || [],
        references: refMap.get(row.id) || [],
        attachments: attMap.get(row.id) || [],
        availableActions: {
          canEdit: isAuthor && !isDeleted && thread.state === "OPEN",
          canDelete: isAuthor && !isDeleted && thread.state === "OPEN",
          canReply: !isDeleted && thread.state === "OPEN",
        },
      };
    });

    // Participants
    const participantMap = new Map<string, ParticipantItem>();
    if (thread.creator) {
      participantMap.set(thread.creator.id, {
        id: thread.creator.id,
        name: thread.creator.display_name || "Admin",
        email: thread.creator.email || "",
        avatarUrl: thread.creator.avatar_url,
        initials: getInitials(thread.creator.display_name || "Admin"),
      });
    }
    comments.forEach((c) => {
      if (!participantMap.has(c.author.id)) {
        participantMap.set(c.author.id, c.author);
      }
    });
    const participants = Array.from(participantMap.values());

    let totalReferencesCount = 0;
    refMap.forEach((refs) => (totalReferencesCount += refs.length));

    return {
      id: thread.id,
      publicId: thread.public_id,
      organizationId: thread.organization_id,
      contextType: thread.context_type as CommentContextType,
      contextId: thread.context_id,
      contextTitle: thread.context_title,
      contextRef: thread.context_ref,
      contextState: thread.context_state,
      contextMetadata: (thread.context_metadata as Record<string, any>) || undefined,
      title: thread.title,
      state: thread.state as ThreadState,
      createdBy: {
        id: thread.creator?.id || thread.created_by,
        name: thread.creator?.display_name || "Admin",
        email: thread.creator?.email || "",
        avatarUrl: thread.creator?.avatar_url,
        initials: getInitials(thread.creator?.display_name || "Admin"),
      },
      resolvedBy: thread.resolver ? { id: thread.resolver.id, name: thread.resolver.display_name } : null,
      resolvedAt: thread.resolved_at,
      resolutionNote: thread.resolution_note,
      participants,
      participantPreview: participants.slice(0, 4),
      commentCount: comments.filter((c) => !c.isDeleted).length,
      isUnread: false,
      isMentioned: false,
      latestComment: comments.length > 0
        ? {
            id: comments[comments.length - 1].id,
            publicId: comments[comments.length - 1].publicId,
            authorName: comments[comments.length - 1].author.name,
            snippet: comments[comments.length - 1].body.substring(0, 80),
            createdAt: comments[comments.length - 1].createdAt,
          }
        : null,
      lastActivityAt: thread.last_activity_at,
      createdAt: thread.created_at,
      comments,
      topology: {
        peopleCount: participants.length,
        referencesCount: totalReferencesCount,
        state: thread.state as ThreadState,
      },
      availableActions: {
        canComment: thread.state === "OPEN",
        canResolve: thread.state === "OPEN",
        canReopen: thread.state === "RESOLVED",
      },
    };
  },

  /**
   * Starts a new contextual collaboration thread.
   */
  async createThread(
    orgId: string,
    payload: {
      contextType: CommentContextType;
      contextId: string;
      contextRef: string;
      contextTitle: string;
      title: string;
      initialComment?: string;
      contextState?: string;
      contextMetadata?: Record<string, any>;
    },
    authorId: string
  ): Promise<ThreadDetail> {
    const supabase = getClient();
    const publicId = generatePublicId("THR");

    const { data: thread, error } = await supabase
      .from("collaboration_threads")
      .insert({
        public_id: publicId,
        organization_id: orgId,
        context_type: payload.contextType,
        context_id: payload.contextId,
        context_ref: payload.contextRef,
        context_title: payload.contextTitle,
        context_state: payload.contextState || "ACTIVE",
        context_metadata: payload.contextMetadata || {},
        title: payload.title,
        state: "OPEN",
        created_by: authorId,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !thread) {
      console.error("[SupabaseCommentsRepository.createThread] error:", error);
      throw new ValidationError("Failed to initialize collaboration thread.");
    }

    // Add initial comment if provided
    if (payload.initialComment?.trim()) {
      await this.createComment(
        orgId,
        thread.id,
        { body: payload.initialComment.trim() },
        authorId
      );
    }

    // Log activity event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: authorId,
      action: "thread.created",
      resource_type: "collaboration_thread",
      resource_id: thread.id,
      metadata_json: {
        threadPublicId: publicId,
        contextType: payload.contextType,
        contextRef: payload.contextRef,
        title: payload.title,
      },
    });

    return this.getThreadDetail(orgId, thread.id, authorId);
  },

  /**
   * Appends a comment to an open thread with optional mentions and references.
   */
  async createComment(
    orgId: string,
    threadId: string,
    payload: {
      body: string;
      replyToCommentId?: string;
      mentions?: string[]; // Array of user_ids
      references?: Array<{
        type: CommentContextType;
        idRef: string;
        publicRef: string;
        title: string;
        state?: string;
      }>;
      attachments?: Array<{
        name: string;
        fileType: "IMAGE" | "DOCUMENT" | "LOG";
        mimeType: string;
        sizeBytes: number;
        storagePath: string;
      }>;
    },
    authorId: string
  ): Promise<CommentDTO> {
    const supabase = getClient();

    // Verify thread is open
    const { data: thread, error: threadErr } = await supabase
      .from("collaboration_threads")
      .select("id, state, organization_id")
      .eq("id", threadId)
      .eq("organization_id", orgId)
      .single();

    if (threadErr || !thread) {
      throw new NotFoundError("Thread not found.");
    }

    if (thread.state !== "OPEN") {
      throw new ConflictError("Cannot post a comment to a resolved or locked discussion.");
    }

    const publicId = generatePublicId("CMT");

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        public_id: publicId,
        thread_id: threadId,
        organization_id: orgId,
        author_id: authorId,
        content: payload.body,
        parent_comment_id: payload.replyToCommentId || null,
        body_format: "markdown",
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, display_name, email, avatar_url)
      `)
      .single();

    if (error || !comment) {
      console.error("[SupabaseCommentsRepository.createComment] error:", error);
      throw new ValidationError("Failed to post comment.");
    }

    // Insert mentions
    if (payload.mentions && payload.mentions.length > 0) {
      const mentionInserts = payload.mentions.map((uid) => ({
        comment_id: comment.id,
        user_id: uid,
      }));
      await supabase.from("comment_mentions").insert(mentionInserts);
    }

    // Insert references
    if (payload.references && payload.references.length > 0) {
      const refInserts = payload.references.map((r) => ({
        comment_id: comment.id,
        referenced_type: r.type,
        referenced_id: r.idRef,
        referenced_ref: r.publicRef,
        referenced_title: r.title,
        referenced_state: r.state || null,
      }));
      await supabase.from("comment_references").insert(refInserts);
    }

    // Insert attachments
    if (payload.attachments && payload.attachments.length > 0) {
      const attInserts = payload.attachments.map((a) => ({
        comment_id: comment.id,
        name: a.name,
        file_type: a.fileType,
        mime_type: a.mimeType,
        size_bytes: a.sizeBytes,
        storage_path: a.storagePath,
        uploaded_by: authorId,
      }));
      await supabase.from("comment_attachments").insert(attInserts);
    }

    // Update thread last_activity_at
    const nowIso = new Date().toISOString();
    await supabase
      .from("collaboration_threads")
      .update({ last_activity_at: nowIso, updated_at: nowIso })
      .eq("id", threadId);

    // Update author read state
    await supabase
      .from("thread_read_states")
      .upsert(
        {
          thread_id: threadId,
          user_id: authorId,
          last_read_at: nowIso,
        },
        { onConflict: "thread_id,user_id" }
      );

    // Log activity event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: authorId,
      action: "comment.created",
      resource_type: "comment",
      resource_id: comment.id,
      metadata_json: {
        commentPublicId: publicId,
        threadId,
      },
    });

    return {
      id: comment.id,
      publicId: comment.public_id || publicId,
      threadId: comment.thread_id || threadId,
      author: {
        id: comment.author?.id || authorId,
        name: comment.author?.display_name || "Member",
        email: comment.author?.email || "",
        avatarUrl: comment.author?.avatar_url,
        initials: getInitials(comment.author?.display_name || "Member"),
      },
      body: comment.content,
      bodyFormat: comment.body_format,
      createdAt: comment.created_at,
      isDeleted: false,
      mentions: [],
      references: (payload.references || []).map((r, idx) => ({
        id: String(idx),
        type: r.type,
        idRef: r.idRef,
        publicRef: r.publicRef,
        title: r.title,
        state: r.state,
      })),
      attachments: (payload.attachments || []).map((a, idx) => ({
        id: String(idx),
        name: a.name,
        fileType: a.fileType,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        storagePath: a.storagePath,
      })),
      availableActions: {
        canEdit: true,
        canDelete: true,
        canReply: true,
      },
    };
  },

  /**
   * Resolves a collaboration thread.
   */
  async resolveThread(
    orgId: string,
    threadId: string,
    resolutionNote: string | undefined,
    actorId: string
  ): Promise<ThreadSummary> {
    const supabase = getClient();
    const nowIso = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("collaboration_threads")
      .update({
        state: "RESOLVED",
        resolved_by: actorId,
        resolved_at: nowIso,
        resolution_note: resolutionNote || null,
        updated_at: nowIso,
      })
      .eq("id", threadId)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error || !updated) {
      throw new ValidationError("Failed to resolve discussion.");
    }

    // Log activity
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "thread.resolved",
      resource_type: "collaboration_thread",
      resource_id: threadId,
      metadata_json: {
        threadPublicId: updated.public_id,
        resolutionNote,
      },
    });

    const [summary] = await this.listThreads(orgId, { domain: "all" }, actorId);
    return summary;
  },

  /**
   * Reopens a resolved collaboration thread.
   */
  async reopenThread(
    orgId: string,
    threadId: string,
    actorId: string
  ): Promise<ThreadSummary> {
    const supabase = getClient();
    const nowIso = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("collaboration_threads")
      .update({
        state: "OPEN",
        resolved_by: null,
        resolved_at: null,
        resolution_note: null,
        last_activity_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", threadId)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error || !updated) {
      throw new ValidationError("Failed to reopen discussion.");
    }

    // Log activity
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "thread.reopened",
      resource_type: "collaboration_thread",
      resource_id: threadId,
      metadata_json: {
        threadPublicId: updated.public_id,
      },
    });

    const [summary] = await this.listThreads(orgId, { domain: "all" }, actorId);
    return summary;
  },

  /**
   * Edits comment content if author matches.
   */
  async editComment(
    orgId: string,
    commentId: string,
    newBody: string,
    actorId: string
  ): Promise<CommentDTO> {
    const supabase = getClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("comments")
      .select("*, thread:collaboration_threads!comments_thread_id_fkey(state)")
      .eq("id", commentId)
      .eq("organization_id", orgId)
      .single();

    if (fetchErr || !existing) throw new NotFoundError("Comment not found.");
    if (existing.author_id !== actorId) throw new ForbiddenError("Only author can edit their comment.");
    if (existing.thread?.state !== "OPEN") throw new ConflictError("Cannot edit comment in a resolved discussion.");

    const nowIso = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("comments")
      .update({
        content: newBody,
        edited_at: nowIso,
      })
      .eq("id", commentId)
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, display_name, email, avatar_url)
      `)
      .single();

    if (error || !updated) throw new ValidationError("Failed to update comment.");

    return {
      id: updated.id,
      publicId: updated.public_id || commentId,
      threadId: updated.thread_id || "",
      author: {
        id: updated.author?.id || actorId,
        name: updated.author?.display_name || "Member",
        email: updated.author?.email || "",
        avatarUrl: updated.author?.avatar_url,
        initials: getInitials(updated.author?.display_name || "Member"),
      },
      body: updated.content,
      bodyFormat: updated.body_format,
      createdAt: updated.created_at,
      editedAt: updated.edited_at,
      isDeleted: false,
      mentions: [],
      references: [],
      attachments: [],
      availableActions: {
        canEdit: true,
        canDelete: true,
        canReply: true,
      },
    };
  },

  /**
   * Soft-deletes a comment (tombstone preservation).
   */
  async deleteComment(
    orgId: string,
    commentId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("comments")
      .select("*, thread:collaboration_threads!comments_thread_id_fkey(state)")
      .eq("id", commentId)
      .eq("organization_id", orgId)
      .single();

    if (fetchErr || !existing) throw new NotFoundError("Comment not found.");
    if (existing.author_id !== actorId) throw new ForbiddenError("Only author can delete their comment.");
    if (existing.thread?.state !== "OPEN") throw new ConflictError("Cannot delete comment in a resolved discussion.");

    const nowIso = new Date().toISOString();
    await supabase
      .from("comments")
      .update({
        content: "This comment was deleted.",
        deleted_at: nowIso,
      })
      .eq("id", commentId);

    return { success: true };
  },
};
