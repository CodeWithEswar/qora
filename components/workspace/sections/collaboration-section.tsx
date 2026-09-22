"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Save, Shield, CheckCircle2, UserPlus, Share2, FileCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkspaceControlPlaneOverview,
  WorkspaceCollaborationPolicy,
  UpdateWorkspaceCollaborationRequest,
} from "@nxtqr/contracts";

interface CollaborationSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onSave: (payload: UpdateWorkspaceCollaborationRequest) => Promise<void>;
  isSaving: boolean;
}

export function CollaborationSection({
  overview,
  onSave,
  isSaving,
}: CollaborationSectionProps) {
  const { identity, collaborationPolicy, availableRoles, userPermissions } = overview;

  const [defaultRoleId, setDefaultRoleId] = React.useState(collaborationPolicy.defaultRoleId);
  const [invitationPolicy, setInvitationPolicy] = React.useState(collaborationPolicy.invitationPolicy);
  const [approvalRequiredForPublish, setApprovalRequiredForPublish] = React.useState(
    collaborationPolicy.approvalRequiredForPublish
  );
  const [externalSharingEnabled, setExternalSharingEnabled] = React.useState(
    collaborationPolicy.externalSharingEnabled
  );

  React.useEffect(() => {
    setDefaultRoleId(collaborationPolicy.defaultRoleId);
    setInvitationPolicy(collaborationPolicy.invitationPolicy);
    setApprovalRequiredForPublish(collaborationPolicy.approvalRequiredForPublish);
    setExternalSharingEnabled(collaborationPolicy.externalSharingEnabled);
  }, [collaborationPolicy]);

  const hasChanges =
    defaultRoleId !== collaborationPolicy.defaultRoleId ||
    invitationPolicy !== collaborationPolicy.invitationPolicy ||
    approvalRequiredForPublish !== collaborationPolicy.approvalRequiredForPublish ||
    externalSharingEnabled !== collaborationPolicy.externalSharingEnabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSaving || !userPermissions.canUpdate) return;

    await onSave({
      collaborationPolicy: {
        defaultRoleId,
        invitationPolicy,
        approvalRequiredForPublish,
        externalSharingEnabled,
      },
    });
  };

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold font-display">Collaboration & Governance Policies</CardTitle>
          </div>
          <Link
            href={`/${identity.slug}/settings/permissions`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            <span>Roles Registry</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">
          Manage member invitation rights, default joining roles, publishing approval workflows, and external share policies.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Default Role Assignment */}
            <div className="p-4 rounded-xl border border-border/60 bg-surface/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="collab-role" className="text-xs font-semibold text-foreground">
                    Default Member Role
                  </Label>
                  <p className="text-[11px] text-muted-foreground max-w-md">
                    Assigned automatically to newly accepted team invitations. Does not alter existing member assignments.
                  </p>
                </div>

                <Select
                  value={defaultRoleId}
                  onValueChange={setDefaultRoleId}
                  disabled={!userPermissions.canUpdate || isSaving}
                >
                  <SelectTrigger id="collab-role" className="w-[180px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-xs">
                        {role.name} ({role.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invitation Policy */}
            <div className="p-4 rounded-xl border border-border/60 bg-surface/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="collab-invite" className="text-xs font-semibold text-foreground">
                    Member Invitation Authority
                  </Label>
                  <p className="text-[11px] text-muted-foreground max-w-md">
                    Restricts who has permission to invite external collaborators into this organization workspace.
                  </p>
                </div>

                <Select
                  value={invitationPolicy}
                  onValueChange={(val: any) => setInvitationPolicy(val)}
                  disabled={!userPermissions.canUpdate || isSaving}
                >
                  <SelectTrigger id="collab-invite" className="w-[200px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owners_only" className="text-xs">
                      Owners Only
                    </SelectItem>
                    <SelectItem value="admins_and_owners" className="text-xs">
                      Admins and Owners (Default)
                    </SelectItem>
                    <SelectItem value="all_members" className="text-xs">
                      All Active Members
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Publishing Approval Requirement */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="collab-approval" className="text-xs font-semibold text-foreground block">
                  Mandatory Publishing Approval
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, QR drafts and routing changes require approval from an Admin or Owner before deploying live to the edge.
                </p>
              </div>

              <Switch
                id="collab-approval"
                checked={approvalRequiredForPublish}
                onCheckedChange={setApprovalRequiredForPublish}
                disabled={!userPermissions.canUpdate || isSaving}
              />
            </div>

            {/* External Sharing Policy */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="collab-sharing" className="text-xs font-semibold text-foreground block">
                  External Share Links
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Allow team members to create password-protected or public read-only preview links for external clients and stakeholders.
                </p>
              </div>

              <Switch
                id="collab-sharing"
                checked={externalSharingEnabled}
                onCheckedChange={setExternalSharingEnabled}
                disabled={!userPermissions.canUpdate || isSaving}
              />
            </div>
          </div>

          {/* Signature Feature: Collaboration Boundary Map */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-xs font-semibold text-foreground font-display">
              COLLABORATION BOUNDARY MAP
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground font-display">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>MEMBERS</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Active team seats governed by canonical RBAC role grants.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground font-display">
                  <FileCheck className="h-3.5 w-3.5 text-primary" />
                  <span>APPROVALS</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {approvalRequiredForPublish
                    ? "Active: All drafts require review before live publishing."
                    : "Direct publishing permitted by authorized roles."}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground font-display">
                  <Share2 className="h-3.5 w-3.5 text-primary" />
                  <span>EXTERNAL SHARES</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {externalSharingEnabled
                    ? "Allowed: Share tokens can be generated for external review."
                    : "Locked: External link generation is prohibited by policy."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {userPermissions.canUpdate && (
            <div className="pt-4 flex items-center justify-between border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-mono">
                {hasChanges ? "● Unsaved collaboration policy changes" : "Policy enforced"}
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={!hasChanges || isSaving}
                className="gap-1.5 text-xs h-8"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save Collaboration Policies"}</span>
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
