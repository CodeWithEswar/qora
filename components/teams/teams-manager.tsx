"use client";

import * as React from "react";
import {
  Building2,
  Users,
  Plus,
  Layers,
  Search,
  MoreVertical,
  Shield,
  FolderTree,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Team } from "@nxtqr/contracts";

interface TeamsManagerProps {
  orgSlug: string;
  initialTeams?: Team[];
}

export function TeamsManager({ orgSlug, initialTeams = [] }: TeamsManagerProps) {
  const [teams, setTeams] = React.useState<Team[]>(initialTeams);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamDesc, setNewTeamDesc] = React.useState("");

  const filteredTeams = React.useMemo(() => {
    if (!searchQuery.trim()) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      organizationId: orgSlug,
      name: newTeamName.trim(),
      description: newTeamDesc.trim() || undefined,
      membersCount: 1,
      resourcesCount: 0,
      createdAt: Date.now(),
    };

    setTeams((prev) => [newTeam, ...prev]);
    setNewTeamName("");
    setNewTeamDesc("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2 text-xs shrink-0">
          <Plus className="h-3.5 w-3.5" />
          <span>Create Team</span>
        </Button>
      </div>

      {/* Teams Grid / Empty State */}
      {teams.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8">
            <EmptyState
              preset="teams"
              onAction={() => setIsCreateOpen(true)}
              className="border-none bg-transparent"
            />
          </CardContent>
        </Card>
      ) : filteredTeams.length === 0 ? (
        <Card className="border-border/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">No teams match your search.</p>
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2 text-xs">
            Clear search
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{team.name}</span>
                    </CardTitle>
                    {team.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {team.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{team.membersCount} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>{team.resourcesCount || 0} resources</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Workspace Team</DialogTitle>
            <DialogDescription className="text-xs">
              Group members together to manage shared ownership and fine-grained resource assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Team Name</label>
              <Input
                placeholder="e.g. Growth Marketing, Regional Ops, Creative"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description (Optional)</label>
              <Input
                placeholder="e.g. Responsible for seasonal campaign QRs and landing pages"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTeam} disabled={!newTeamName.trim()} className="text-xs">
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
