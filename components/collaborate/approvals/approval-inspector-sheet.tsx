"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DecisionRail } from "./decision-rail";
import { ReviewReadiness } from "./review-readiness";
import { ChangePreview } from "./change-preview";
import { EffectBoundary } from "./effect-boundary";
import { EvidenceRail } from "./evidence-rail";
import { ReviewerAssignment } from "./reviewer-assignment";
import { DecisionTrace } from "./decision-trace";
import { ApproveReviewDialog } from "./approve-review-dialog";
import { RejectReviewDialog } from "./reject-review-dialog";
import { CancelRequestDialog } from "./cancel-request-dialog";
import { RetryExecutionDialog } from "./retry-execution-dialog";
import type {
  ApprovalSummary,
  ApprovalDetail,
} from "@/lib/supabase/types/approvals";
import { formatDate, cn } from "@/lib/utils";
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RotateCw,
  Copy,
  ExternalLink,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ApprovalInspectorSheetProps {
  approvalSummary: ApprovalSummary | null;
  organizationSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onDecide: (decision: "APPROVED" | "REJECTED", note?: string, reasonCode?: string) => Promise<void>;
  onCancel: () => Promise<void>;
  onRetry: () => Promise<void>;
}

export function ApprovalInspectorSheet({
  approvalSummary,
  organizationSlug,
  isOpen,
  onClose,
  onDecide,
  onCancel,
  onRetry,
}: ApprovalInspectorSheetProps) {
  const [detail, setDetail] = React.useState<ApprovalDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  // Dialog states
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [isRetryOpen, setIsRetryOpen] = React.useState(false);

  // Fetch full detail when sheet opens
  React.useEffect(() => {
    if (!approvalSummary || !isOpen) {
      setDetail(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);

    async function fetchDetail() {
      try {
        const res = await fetch(
          `/api/v1/organizations/${organizationSlug}/approvals/${approvalSummary?.id}`
        );
        if (!res.ok) throw new Error("Failed to load approval detail.");
        const json = await res.json();
        if (isMounted) {
          setDetail(json.data);
        }
      } catch (err) {
        console.error("Error fetching approval detail:", err);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [approvalSummary?.id, isOpen, organizationSlug]);

  if (!approvalSummary) return null;

  const current = detail || approvalSummary;
  const isPending = current.status === "PENDING";
  const isApproved = current.status === "APPROVED";
  const isRejected = current.status === "REJECTED";
  const isFailed = current.executionStatus === "FAILED";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleCopyPublicId = () => {
    navigator.clipboard.writeText(current.publicId);
    toast.success(`Reference ${current.publicId} copied to clipboard.`);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-background border-l border-border/80 focus:outline-none"
        >
          {/* 1. Header */}
          <div className="p-4 sm:p-6 border-b border-border/70 space-y-3 bg-card/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                  APPROVAL
                </span>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {current.publicId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5",
                    isPending && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    isApproved && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                    isRejected && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                    current.status === "CANCELLED" && "bg-muted text-muted-foreground border-border"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                      isPending && "bg-amber-500 animate-pulse",
                      isApproved && "bg-emerald-500",
                      isRejected && "bg-rose-500",
                      current.status === "CANCELLED" && "bg-muted-foreground"
                    )}
                  />
                  {current.status === "PENDING" ? "NEEDS REVIEW" : current.status}
                </Badge>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 font-mono text-xs">
                    <DropdownMenuItem onClick={handleCopyPublicId} className="cursor-pointer gap-2">
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy reference</span>
                    </DropdownMenuItem>
                    {current.availableActions.canCancel && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setIsCancelOpen(true)}
                          className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Cancel request</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-sans font-bold text-foreground">
                {current.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground pt-1">
                <span>Requested {formatDate(current.createdAt)}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-4 h-4 text-[8px]">
                    {current.requestedBy.avatarUrl && (
                      <AvatarImage src={current.requestedBy.avatarUrl} alt={current.requestedBy.name} />
                    )}
                    <AvatarFallback>{getInitials(current.requestedBy.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-foreground font-medium">{current.requestedBy.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Signature Decision Rail */}
            <DecisionRail
              status={current.status}
              executionStatus={current.executionStatus}
            />

            {/* Review Readiness Checklist (if pending) */}
            {isPending && (
              <ReviewReadiness
                hasContext={Boolean(current.reason || current.description)}
                hasEvidence={Boolean(current.evidenceCount > 0)}
                isObjectCurrent={true}
                isAuthorized={Boolean(current.availableActions.canApprove || current.availableActions.canReject)}
                isSelfRequester={current.availableActions.isSelfRequester}
              />
            )}

            {/* Request Context & Rationale */}
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase">
                REQUEST / CONTEXT
              </div>
              <div className="p-3.5 rounded-lg border border-border/70 bg-card/40 space-y-2.5">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">
                    Affected Object
                  </span>
                  <div className="text-xs font-semibold text-foreground">
                    {current.affectedEntityRef}
                  </div>
                </div>

                {current.reason && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">
                      Requester Rationale
                    </span>
                    <p className="text-xs text-foreground/90 italic leading-relaxed">
                      &quot;{current.reason}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Change Preview Diff */}
            {detail?.changeDiff && (
              <ChangePreview diff={detail.changeDiff} />
            )}

            {/* Effect Boundary */}
            <EffectBoundary
              decisionLabel={isApproved ? "Approved by reviewer" : "Pending administrative decision"}
              effectDescription={
                detail?.impactSummary?.consequenceDescription ||
                "If approved, NXTQR executes the registered operation after server validation."
              }
            />

            {/* Evidence Rail */}
            <EvidenceRail items={detail?.evidenceItems || []} />

            {/* Reviewer Assignment Tree */}
            <ReviewerAssignment
              teamName={current.assignedTeam?.name}
              policy={current.reviewPolicy}
              reviewers={detail?.assignedReviewers || []}
            />

            {/* Decision Trace Timeline */}
            <DecisionTrace events={detail?.trace || []} />
          </div>

          {/* 3. Sticky Bottom Decision Action Station */}
          <div className="p-4 sm:p-5 border-t border-border/80 bg-background/95 backdrop-blur-sm sticky bottom-0 z-20">
            {isPending ? (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-muted-foreground">
                  {current.availableActions.isSelfRequester ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      Self-approval prohibited
                    </span>
                  ) : (
                    <span>Review decision required</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRejectOpen(true)}
                    disabled={!current.availableActions.canReject}
                    className="text-xs font-mono border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Reject</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsApproveOpen(true)}
                    disabled={!current.availableActions.canApprove}
                    className="text-xs font-mono bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    <span>Approve</span>
                  </Button>
                </div>
              </div>
            ) : isApproved ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved by {current.decidedBy?.name || "Reviewer"}</span>
                </div>

                {isFailed && current.availableActions.canRetry && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsRetryOpen(true)}
                    className="text-xs font-mono bg-primary text-primary-foreground gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Retry Execution</span>
                  </Button>
                )}
              </div>
            ) : isRejected ? (
              <div className="flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Rejected: {current.decisionNote || "Decision declined by reviewer"}</span>
              </div>
            ) : (
              <div className="text-xs font-mono text-muted-foreground">
                Request {current.status.toLowerCase()}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Approve Dialog */}
      <ApproveReviewDialog
        approval={detail}
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={async (note) => {
          await onDecide("APPROVED", note);
          setIsApproveOpen(false);
          onClose();
        }}
      />

      {/* Reject Dialog */}
      <RejectReviewDialog
        approval={detail}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={async (reasonCode, note) => {
          await onDecide("REJECTED", note, reasonCode);
          setIsRejectOpen(false);
          onClose();
        }}
      />

      {/* Cancel Dialog */}
      <CancelRequestDialog
        approval={detail}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={async () => {
          await onCancel();
          setIsCancelOpen(false);
          onClose();
        }}
      />

      {/* Retry Dialog */}
      <RetryExecutionDialog
        approval={detail}
        isOpen={isRetryOpen}
        onClose={() => setIsRetryOpen(false)}
        onConfirm={async () => {
          await onRetry();
          setIsRetryOpen(false);
        }}
      />
    </>
  );
}
