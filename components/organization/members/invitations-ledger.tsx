"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Copy, RefreshCw, Trash2, Mail, MoreVertical, Plus } from "lucide-react";

export interface InvitationItem {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  teams?: Array<{ id: string; name: string }>;
}

interface InvitationsLedgerProps {
  invitations: InvitationItem[];
  organizationSlug: string;
  canManageMembers?: boolean;
  onInviteClick?: () => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Invitations Ledger — Dedicated governance ledger for workspace access invitations.
 * Provides copy link, atomic resend with fresh tokens, and secure revocation.
 */
export function InvitationsLedger({
  invitations,
  organizationSlug,
  canManageMembers = true,
  onInviteClick,
  onRefresh,
  className,
}: InvitationsLedgerProps) {
  const [revokingInvitation, setRevokingInvitation] = React.useState<InvitationItem | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Copy link
  const handleCopyLink = async (inv: InvitationItem) => {
    try {
      const url = `${window.location.origin}/invite?email=${encodeURIComponent(inv.email)}`;
      await navigator.clipboard.writeText(url);
      toast.success("Invitation link copied", {
        description: `Direct sign-up link for ${inv.email} copied to clipboard.`,
      });
    } catch {
      toast.error("Failed to copy invitation link");
    }
  };

  // Resend invitation
  const handleResend = async (inv: InvitationItem) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/organizations/${organizationSlug}/invitations/${inv.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to resend invitation.");
      }

      toast.success("Invitation resent", {
        description: `Fresh invitation credentials dispatched to ${inv.email}.`,
      });
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.message || "Could not resend invitation.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Revoke confirmation
  const handleRevokeConfirm = async () => {
    if (!revokingInvitation) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/organizations/${organizationSlug}/invitations/${revokingInvitation.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to revoke invitation.");
      }

      toast.success("Invitation revoked", {
        description: `Access invitation for ${revokingInvitation.email} is no longer usable.`,
      });
      setRevokingInvitation(null);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.message || "Could not revoke invitation.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-surface/50 p-12 text-center space-y-4 font-mono select-none">
        <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <Mail className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-sm font-bold font-sans text-foreground uppercase tracking-tight">
            NO PENDING INVITATIONS
          </h3>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
            New workspace invitations will appear here until they are accepted, expired, or revoked.
          </p>
        </div>
        {canManageMembers && onInviteClick && (
          <Button
            size="sm"
            onClick={onInviteClick}
            className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white gap-1.5 cursor-pointer font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite members</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="rounded-xl border border-border/80 bg-surface/60 overflow-hidden shadow-xs">
        <Table className="font-mono text-xs">
          <TableHeader className="bg-surface/90 border-b border-border/70 text-[10px] tracking-wider text-muted-foreground uppercase">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3 px-4 font-bold">INVITEE</TableHead>
              <TableHead className="py-3 px-4 font-bold">ASSIGNED ROLE</TableHead>
              <TableHead className="py-3 px-4 font-bold hidden sm:table-cell">TEAMS</TableHead>
              <TableHead className="py-3 px-4 font-bold hidden md:table-cell">SENT</TableHead>
              <TableHead className="py-3 px-4 font-bold hidden lg:table-cell">EXPIRES</TableHead>
              <TableHead className="py-3 px-4 font-bold">STATUS</TableHead>
              <TableHead className="py-3 px-4 text-right font-bold">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {invitations.map((inv) => {
              const isPending = inv.status === "pending";
              const isExpired =
                inv.status === "expired" ||
                (isPending && new Date(inv.expiresAt).getTime() < Date.now());

              return (
                <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                  {/* Invitee Email */}
                  <TableCell className="py-3 px-4 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0 text-xs">
                        <Mail className="w-3 h-3" />
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-[260px]">{inv.email}</span>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                      {inv.roleName}
                    </Badge>
                  </TableCell>

                  {/* Teams */}
                  <TableCell className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                    {inv.teams && inv.teams.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {inv.teams.map((t) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] border border-border/70"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic">Unassigned</span>
                    )}
                  </TableCell>

                  {/* Sent */}
                  <TableCell className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                    {formatDate(inv.createdAt)}
                  </TableCell>

                  {/* Expires */}
                  <TableCell className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                    {formatDate(inv.expiresAt)}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 px-4">
                    {isExpired ? (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                        EXPIRED
                      </Badge>
                    ) : inv.status === "pending" ? (
                      <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10">
                        PENDING
                      </Badge>
                    ) : inv.status === "accepted" ? (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                        ACCEPTED
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
                        REVOKED
                      </Badge>
                    )}
                  </TableCell>

                  {/* Row Actions */}
                  <TableCell className="py-3 px-4 text-right">
                    {canManageMembers && inv.status === "pending" && !isExpired ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs font-mono w-44">
                          <DropdownMenuItem onClick={() => handleCopyLink(inv)} className="gap-2 cursor-pointer">
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Copy invite link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResend(inv)} disabled={isProcessing} className="gap-2 cursor-pointer">
                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Resend invitation</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setRevokingInvitation(inv)}
                            className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke invitation</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : canManageMembers && isExpired ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(inv)}
                        disabled={isProcessing}
                        className="h-7 px-2 text-[11px] gap-1 cursor-pointer font-mono"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend</span>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Revoke Invitation Confirmation AlertDialog */}
      <AlertDialog
        open={Boolean(revokingInvitation)}
        onOpenChange={(open) => !open && setRevokingInvitation(null)}
      >
        <AlertDialogContent className="font-mono text-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-sans font-bold text-foreground">
              Revoke Workspace Invitation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              The invitation sent to{" "}
              <span className="font-semibold text-foreground">{revokingInvitation?.email}</span> will
              immediately be invalidated. The invitee will not be able to join using their current link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={isProcessing}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isProcessing ? "Revoking..." : "Revoke invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
