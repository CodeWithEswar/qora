"use client";

import * as React from "react";
import {
  CheckCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  ArrowRight,
  GitCommit,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ApprovalRequest, ApprovalStatus } from "@nxtqr/contracts";

interface ApprovalQueueProps {
  orgSlug: string;
  initialRequests?: ApprovalRequest[];
}

export function ApprovalQueue({ orgSlug, initialRequests = [] }: ApprovalQueueProps) {
  const [requests, setRequests] = React.useState<ApprovalRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = React.useState<"needs_review" | "requested_by_me" | "completed">("needs_review");

  const filteredRequests = React.useMemo(() => {
    if (activeTab === "needs_review") {
      return requests.filter((r) => r.status === "PENDING");
    }
    if (activeTab === "requested_by_me") {
      return requests.filter((r) => r.status === "PENDING");
    }
    return requests.filter((r) => r.status === "APPROVED" || r.status === "REJECTED" || r.status === "CANCELLED");
  }, [requests, activeTab]);

  const handleDecision = (requestId: string, decision: "APPROVED" | "REJECTED") => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          status: decision,
          decidedAt: Date.now(),
          decidedByName: "You",
          steps: req.steps.map((s, idx) => (idx === 0 ? { ...s, status: decision } : s)),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("needs_review")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "needs_review"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Needs My Review
        </button>
        <button
          onClick={() => setActiveTab("requested_by_me")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "requested_by_me"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Requested By Me
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "completed"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Requests List / Empty State */}
      {filteredRequests.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8">
            <EmptyState
              preset="approvals"
              className="border-none bg-transparent"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="border-border/60 overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      <QrCode className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      QR Revision {req.targetVersionNumber}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono uppercase ${
                        req.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : req.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Requested by {req.requestedByName}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono text-[11px]">{req.targetVersionId}</span>
                    </span>
                  </div>

                  {/* Step Indicators */}
                  {req.steps && req.steps.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-muted-foreground font-medium">Steps:</span>
                      <div className="flex items-center gap-1.5">
                        {req.steps.map((step, idx) => (
                          <div
                            key={step.id}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                              step.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : step.status === "REJECTED"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            <span>Step {idx + 1}: {step.approverType}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {req.status === "PENDING" && (
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision(req.id, "REJECTED")}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDecision(req.id, "APPROVED")}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Approve Revision
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
