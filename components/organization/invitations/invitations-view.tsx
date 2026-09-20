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
import { RoleBadge } from "../shared/role-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RevokeInvitationDialog } from "./revoke-invitation-dialog";
import { OrganizationInvitationRecord } from "@nxtqr/db";
import { Mail, Copy, Check, Ban, Clock, UserPlus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface InvitationsViewProps {
  invitations: OrganizationInvitationRecord[];
  onRevokeInvitation: (invitationId: string) => Promise<void>;
  onInviteClick: () => void;
  canManageMembers?: boolean;
}

export function InvitationsView({
  invitations,
  onRevokeInvitation,
  onInviteClick,
  canManageMembers = true,
}: InvitationsViewProps) {
  const [revokingInv, setRevokingInv] = React.useState<OrganizationInvitationRecord | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const pendingCount = invitations.filter(
    (i) => i.status === "pending" && i.expiresAt > Date.now()
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Workspace Invitations
          </h2>
          <p className="text-xs text-muted-foreground">
            Track pending, accepted, and revoked collaborator invites.
          </p>
        </div>

        {canManageMembers && (
          <Button
            size="sm"
            onClick={onInviteClick}
            className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite people</span>
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/70 bg-surface/80 overflow-hidden shadow-xs">
        {invitations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              preset="invitations"
              variant="table"
              onAction={onInviteClick}
              className="border-none bg-transparent"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EMAIL RECIPIENT</TableHead>
                  <TableHead>ASSIGNED ROLE</TableHead>
                  <TableHead>ISSUED DATE</TableHead>
                  <TableHead>EXPIRATION</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => {
                  const isExpired = inv.expiresAt < Date.now();
                  const isPending = inv.status === "pending" && !isExpired;

                  return (
                    <TableRow key={inv.id} className="h-14">
                      {/* Email */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold text-foreground text-xs">
                            {inv.email}
                          </span>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <RoleBadge role={inv.roleName} />
                      </TableCell>

                      {/* Issued */}
                      <TableCell className="text-muted-foreground text-[11px]">
                        {formatDate(inv.createdAt)}
                      </TableCell>

                      {/* Expires */}
                      <TableCell className="text-muted-foreground text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(inv.expiresAt)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase font-mono tracking-wider",
                            isPending
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : inv.status === "accepted"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isPending
                                ? "bg-amber-500"
                                : inv.status === "accepted"
                                ? "bg-emerald-500"
                                : "bg-muted-foreground"
                            )}
                          />
                          {isExpired && inv.status === "pending" ? "Expired" : inv.status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        {isPending && canManageMembers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRevokingInv(inv)}
                            className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1 px-2"
                          >
                            <Ban className="h-3 w-3" />
                            <span>Revoke</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <RevokeInvitationDialog
        isOpen={Boolean(revokingInv)}
        onClose={() => setRevokingInv(null)}
        invitation={revokingInv}
        onConfirm={onRevokeInvitation}
      />
    </div>
  );
}
