"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamMark } from "./team-mark";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import type { TeamDetail, TeamSummary } from "@/lib/supabase/types/teams";
import { formatDate, cn } from "@/lib/utils";
import {
  Users,
  Link2,
  Shield,
  Activity,
  UserPlus,
  Trash2,
  ExternalLink,
  QrCode,
  Sparkles,
  Palette,
  Globe,
  MoreVertical,
  Edit3,
  Layers,
  Folder,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamInspectorSheetProps {
  teamSummary: TeamSummary | null;
  organizationSlug: string;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onManageMembersClick: (team: TeamDetail) => void;
  onConnectWorkClick: (team: TeamSummary) => void;
  onEditTeamClick: (team: TeamSummary) => void;
  onDeleteTeamClick: (team: TeamSummary) => void;
  onDisconnectResource?: (teamId: string, assignmentId: string) => Promise<void>;
  onRemoveMemberFromTeam?: (teamId: string, membershipId: string) => Promise<void>;
  canManageTeams?: boolean;
}

export function TeamInspectorSheet({
  teamSummary,
  organizationSlug,
  isOpen,
  onClose,
  initialTab = "overview",
  onManageMembersClick,
  onConnectWorkClick,
  onEditTeamClick,
  onDeleteTeamClick,
  onDisconnectResource,
  onRemoveMemberFromTeam,
  canManageTeams = true,
}: TeamInspectorSheetProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [detail, setDetail] = React.useState<TeamDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Fetch full team detail when sheet opens
  React.useEffect(() => {
    if (!teamSummary || !isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/v1/organizations/${organizationSlug}/teams/${teamSummary.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (isMounted && body?.data) {
          setDetail(body.data);
        }
      })
      .catch(() => {
        // Fallback to basic summary if detail query fails
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teamSummary, isOpen, organizationSlug]);

  if (!teamSummary) return null;

  const currentTeam: TeamDetail = detail || {
    ...teamSummary,
    members: teamSummary.memberPreview,
    recentActivity: [],
    connectedWork: {
      ...teamSummary.connectedWork,
      assignments: [],
    },
    dependencies: {
      memberCount: teamSummary.memberCount,
      pendingApprovalsCount: 0,
      activeWorkflowsCount: 0,
    },
  };

  const work = currentTeam.connectedWork || {
    qrCount: 0,
    campaignCount: 0,
    brandKitCount: 0,
    templateCount: 0,
    domainCount: 0,
    folderCount: 0,
    totalCount: 0,
    assignments: [],
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "qr_code":
        return <QrCode className="h-3.5 w-3.5 text-primary" />;
      case "campaign":
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case "brand_kit":
        return <Palette className="h-3.5 w-3.5 text-teal-500" />;
      case "domain":
        return <Globe className="h-3.5 w-3.5 text-blue-500" />;
      case "template":
        return <Layers className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <Folder className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] p-0 flex flex-col bg-background text-foreground border-l border-border/80 shadow-2xl font-mono"
      >
        {/* Top Header Rail */}
        <div className="px-6 py-4 border-b border-border/70 bg-surface/50 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <span>COLLABORATE</span>
            <span>/</span>
            <span className="text-foreground font-semibold">TEAM OPERATIONS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border">
              {currentTeam.publicId}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                currentTeam.state === "archived"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              )}
            >
              {currentTeam.state === "archived" ? "ARCHIVED" : "ACTIVE"}
            </span>
          </div>
        </div>

        {/* Identity & Actions Bar */}
        <div className="px-6 py-5 border-b border-border/60 bg-surface/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <TeamMark name={currentTeam.name} id={currentTeam.id} size={42} />
              <div className="space-y-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground font-sans tracking-tight truncate">
                  {currentTeam.name}
                </h2>
                <p className="text-xs text-muted-foreground font-sans line-clamp-2">
                  {currentTeam.description || "Organizes shared responsibility and connected work across NXTQR."}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs font-mono">
                {canManageTeams && (
                  <>
                    <DropdownMenuItem onClick={() => onEditTeamClick(currentTeam)}>
                      <Edit3 className="h-3.5 w-3.5 mr-2" />
                      Edit team
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onConnectWorkClick(currentTeam)}>
                      <Link2 className="h-3.5 w-3.5 mr-2" />
                      Connect work
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteTeamClick(currentTeam)}
                      className="text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete team
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <div>
              <span className="text-foreground font-semibold">{currentTeam.memberCount}</span> members
            </div>
            <div>·</div>
            <div>
              <span className="text-foreground font-semibold">{work.totalCount}</span> connected resources
            </div>
            <div>·</div>
            <div>
              Created {new Date(currentTeam.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b border-border/70 bg-surface/20">
            <TabsList className="bg-transparent h-10 p-0 space-x-4 border-b-0 text-xs">
              <TabsTrigger
                value="overview"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-1 font-mono cursor-pointer"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-1 font-mono cursor-pointer"
              >
                Members ({currentTeam.memberCount})
              </TabsTrigger>
              <TabsTrigger
                value="work"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-1 font-mono cursor-pointer"
              >
                Connected Work ({work.totalCount})
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-1 font-mono cursor-pointer"
              >
                Access
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-1 font-mono cursor-pointer"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* 1. OVERVIEW TAB: Collaboration Fingerprint */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* COLLABORATION FINGERPRINT (Signature Visual) */}
              <div className="p-4 rounded-xl border border-border/80 bg-surface/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    COLLABORATION FINGERPRINT
                  </span>
                  <span className="text-[10px] text-muted-foreground">TOPOLOGICAL SUMMARY</span>
                </div>

                <div className="flex flex-col items-center py-2">
                  {/* Central Node */}
                  <div className="px-3 py-1.5 rounded-lg border border-border bg-surface flex items-center gap-2 shadow-2xs">
                    <TeamMark name={currentTeam.name} id={currentTeam.id} size={18} />
                    <span className="font-bold text-xs text-foreground uppercase">{currentTeam.name}</span>
                  </div>

                  {/* Connectors */}
                  <div className="w-px h-3 bg-border/80" />
                  <div className="w-48 h-px bg-border/80" />
                  <div className="flex justify-between w-48">
                    <div className="w-px h-3 bg-border/80" />
                    <div className="w-px h-3 bg-border/80" />
                  </div>

                  {/* Dual Nodes: Members & Work */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-center pt-1">
                    <div className="p-2.5 rounded-lg border border-border/70 bg-surface/50 space-y-0.5">
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                        MEMBERS
                      </div>
                      <div className="text-base font-bold text-foreground">
                        {currentTeam.memberCount}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/70 bg-surface/50 space-y-0.5">
                      <div className="text-[10px] text-primary font-semibold">
                        CONNECTED WORK
                      </div>
                      <div className="text-base font-bold text-foreground">
                        {work.totalCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                {canManageTeams && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageMembersClick(currentTeam)}
                      className="h-9 text-xs font-mono justify-start gap-2 bg-surface cursor-pointer"
                    >
                      <Users className="h-3.5 w-3.5 text-teal-500" />
                      <span>Manage members</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConnectWorkClick(currentTeam)}
                      className="h-9 text-xs font-mono justify-start gap-2 bg-surface cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5 text-primary" />
                      <span>Connect work</span>
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* 2. MEMBERS TAB */}
            <TabsContent value="members" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  TEAM ROSTER ({currentTeam.members.length})
                </span>
                {canManageTeams && (
                  <Button
                    size="sm"
                    onClick={() => onManageMembersClick(currentTeam)}
                    className="h-7 text-xs bg-primary hover:bg-primary/90 text-white font-mono gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Add / edit members</span>
                  </Button>
                )}
              </div>

              {currentTeam.members.length === 0 ? (
                <div className="p-8 text-center space-y-2 border border-border/60 rounded-xl bg-surface/30">
                  <div className="text-xs font-semibold text-foreground">No members assigned</div>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    Assign organization members to connect them to this team lane.
                  </p>
                </div>
              ) : (
                <div className="border border-border/70 rounded-xl overflow-hidden divide-y divide-border/50 bg-surface/40">
                  {currentTeam.members.map((m) => {
                    const initials = m.displayName
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "MB";

                    return (
                      <div
                        key={m.membershipId}
                        className="p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-7 w-7 border border-border">
                            {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                            <AvatarFallback className="bg-muted text-[10px] font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground font-sans truncate">
                              {m.displayName} {m.isCurrentUser && <span className="text-[10px] text-primary">(You)</span>}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">{m.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {m.roleName}
                          </Badge>
                          {canManageTeams && onRemoveMemberFromTeam && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveMemberFromTeam(currentTeam.id, m.membershipId)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 cursor-pointer"
                              title={`Remove ${m.displayName} from team`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* 3. CONNECTED WORK TAB */}
            <TabsContent value="work" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  CONNECTED RESOURCES ({work.assignments?.length || 0})
                </span>
                {canManageTeams && (
                  <Button
                    size="sm"
                    onClick={() => onConnectWorkClick(currentTeam)}
                    className="h-7 text-xs bg-primary hover:bg-primary/90 text-white font-mono gap-1.5 cursor-pointer"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    <span>Connect work</span>
                  </Button>
                )}
              </div>

              {(!work.assignments || work.assignments.length === 0) ? (
                <div className="p-8 text-center space-y-2 border border-border/60 rounded-xl bg-surface/30">
                  <div className="text-xs font-semibold text-foreground">No connected work</div>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    This team is not currently connected to NXTQR resources.
                  </p>
                  {canManageTeams && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConnectWorkClick(currentTeam)}
                      className="text-xs font-mono h-8 mt-2 cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5 mr-1.5" />
                      <span>Connect first resource</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border border-border/70 rounded-xl overflow-hidden divide-y divide-border/50 bg-surface/40">
                  {work.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-surface border border-border/70 shrink-0">
                          {getResourceIcon(assignment.resourceType)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground font-sans truncate">
                            {assignment.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {assignment.ref} · {assignment.relationshipType}
                          </div>
                        </div>
                      </div>

                      {canManageTeams && onDisconnectResource && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDisconnectResource(currentTeam.id, assignment.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 cursor-pointer shrink-0"
                          title="Disconnect resource from team"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 4. ACCESS TAB */}
            <TabsContent value="access" className="mt-0 space-y-4">
              <div className="p-3.5 rounded-xl border border-border/70 bg-surface/50 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  ACCESS BOUNDARY EXPLAINER
                </span>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  Teams group members for operational workflows. Permissions are determined by individual organization roles, while teams define collaborative scope over assigned resources.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  OPERATIONAL REACH DOMAINS
                </span>

                <div className="border border-border/70 rounded-xl overflow-hidden divide-y divide-border/50 bg-surface/40">
                  {currentTeam.accessDomains.map((ad, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-foreground">{ad.domain}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono uppercase font-semibold",
                          ad.level === "FULL"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : ad.level === "MANAGE"
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                            : ad.level === "VIEW"
                            ? "bg-muted text-foreground border-border"
                            : "bg-muted/40 text-muted-foreground border-border/40"
                        )}
                      >
                        {ad.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* 5. ACTIVITY TAB */}
            <TabsContent value="activity" className="mt-0 space-y-4">
              <div className="text-xs font-semibold text-foreground">
                TEAM AUDIT TRAIL ({currentTeam.recentActivity.length})
              </div>

              {currentTeam.recentActivity.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-border/60 rounded-xl bg-surface/30">
                  No recent operational activity recorded for this team.
                </div>
              ) : (
                <div className="border border-border/70 rounded-xl overflow-hidden divide-y divide-border/50 bg-surface/40">
                  {currentTeam.recentActivity.map((evt) => (
                    <div key={evt.id} className="p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground font-mono uppercase text-[11px]">
                          {evt.action.replace(".", " / ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(evt.createdAt)}
                        </span>
                      </div>
                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {JSON.stringify(evt.metadata)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
