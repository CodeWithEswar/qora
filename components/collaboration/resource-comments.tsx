"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  CornerDownRight,
  CheckCircle2,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Comment, PolymorphicResourceType } from "@nxtqr/contracts";

interface ResourceCommentsProps {
  orgSlug: string;
  resourceType: PolymorphicResourceType;
  resourceId: string;
  initialComments?: Comment[];
}

export function ResourceComments({
  orgSlug,
  resourceType,
  resourceId,
  initialComments = [],
}: ResourceCommentsProps) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const cmt: Comment = {
      id: `cmt_${Date.now()}`,
      organizationId: orgSlug,
      resourceType,
      resourceId,
      authorId: "usr_current",
      authorName: "You",
      content: newCommentText.trim(),
      resolved: false,
      replies: [],
      createdAt: Date.now(),
    };

    setComments((prev) => [cmt, ...prev]);
    setNewCommentText("");
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: `cmt_reply_${Date.now()}`,
      organizationId: orgSlug,
      resourceType,
      resourceId,
      parentId,
      authorId: "usr_current",
      authorName: "You",
      content: replyText.trim(),
      resolved: false,
      createdAt: Date.now(),
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== parentId) return c;
        return {
          ...c,
          replies: [...(c.replies || []), reply],
        };
      })
    );

    setReplyText("");
    setReplyingToId(null);
  };

  const handleToggleResolved = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Discussion ({comments.length})</span>
          </CardTitle>
          <span className="text-[11px] text-muted-foreground font-mono">
            {resourceType}:{resourceId}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* New Comment Input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a comment or mention @team..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
            className="h-8 px-3 text-xs gap-1.5 shrink-0"
          >
            <Send className="h-3 w-3" />
            <span>Post</span>
          </Button>
        </div>

        {/* Comments List / Empty State */}
        {comments.length === 0 ? (
          <div className="py-6">
            <EmptyState
              preset="comments"
              className="border-none bg-transparent"
            />
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-border/30">
            {comments.map((comment) => (
              <div key={comment.id} className="pt-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                        {comment.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground">
                      {comment.authorName}
                    </span>
                    <span suppressHydrationWarning className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleResolved(comment.id)}
                    className={`flex items-center gap-1 text-[11px] transition-colors ${
                      comment.resolved
                        ? "text-emerald-400 hover:text-emerald-300"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{comment.resolved ? "Resolved" : "Resolve"}</span>
                  </button>
                </div>

                <p className={`text-xs leading-relaxed ${comment.resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {comment.content}
                </p>

                {/* Reply button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <CornerDownRight className="h-2.5 w-2.5" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Threaded Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-5 space-y-2 border-l border-border/40 mt-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-foreground">
                            {reply.authorName}
                          </span>
                          <span suppressHydrationWarning className="text-[9px] text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Box */}
                {replyingToId === comment.id && (
                  <div className="pl-5 mt-2 flex items-center gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddReply(comment.id);
                        }
                      }}
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="h-7 px-2.5 text-xs"
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
