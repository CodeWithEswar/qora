"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Plus, Search, Filter, Sparkles, QrCode, Palette, Folder } from "lucide-react";
import type { TeamDetail, TeamResourceAssignment } from "@/lib/supabase/types/teams";
import { ResourceRelationshipRow } from "./resource-relationship-row";
import { ConnectWorkSheet } from "./connect-work-sheet";
import { DisconnectWorkAlert } from "./disconnect-work-alert";

interface TeamWorkViewProps {
  team: TeamDetail;
  orgSlug: string;
  canManage?: boolean;
  onRefresh: () => void;
}

export function TeamWorkView({
  team,
  orgSlug,
  canManage = true,
  onRefresh,
}: TeamWorkViewProps) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [relationFilter, setRelationFilter] = React.useState<string>("all");
  const [isConnectOpen, setIsConnectOpen] = React.useState(false);
  const [disconnectCandidate, setDisconnectCandidate] = React.useState<TeamResourceAssignment | null>(null);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const assignments = team.connectedWork?.assignments || [];

  const filteredAssignments = React.useMemo(() => {
    return assignments.filter((item) => {
      if (typeFilter !== "all" && item.resourceType !== typeFilter) return false;
      if (relationFilter !== "all" && item.relationshipType !== relationFilter) return false;
      if (
        search &&
        !item.title.toLowerCase().includes(search.toLowerCase()) &&
        !item.ref.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [assignments, typeFilter, relationFilter, search]);

  const handleDisconnectConfirm = async (item: TeamResourceAssignment) => {
    setIsDisconnecting(true);
    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/teams/${team.id}/resources?assignmentId=${item.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || "Failed to disconnect resource.");
      }
      setDisconnectCandidate(null);
      onRefresh();
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            <span>TEAM</span>
            <span>/</span>
            <span>{team.name}</span>
            <span>/</span>
            <span className="text-primary font-bold">CONNECTED WORK</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Connected Work
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Understand and govern which NXTQR resources are associated with {team.name}.
            Relationships define responsibility scopes and operational focus without transferring ownership.
          </p>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={() => setIsConnectOpen(true)}
            className="cursor-pointer text-xs font-semibold gap-1.5 h-9 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Connect work</span>
          </Button>
        )}
      </div>

      {/* Filter & Command Rail */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-md bg-surface border border-border/70 select-none">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search connected work..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8 bg-background border-border/60 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono flex-wrap sm:flex-nowrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs font-mono w-32 bg-background border-border/60">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="qr_code">QR Codes</SelectItem>
                <SelectItem value="campaign">Campaigns</SelectItem>
                <SelectItem value="brand_kit">Brand Kits</SelectItem>
                <SelectItem value="folder">Folders</SelectItem>
              </SelectContent>
            </Select>

            <Select value={relationFilter} onValueChange={setRelationFilter}>
              <SelectTrigger className="h-8 text-xs font-mono w-36 bg-background border-border/60">
                <SelectValue placeholder="All relations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relations</SelectItem>
                <SelectItem value="responsible">Responsible</SelectItem>
                <SelectItem value="collaborator">Collaborator</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground shrink-0">
          Showing <span className="font-semibold text-foreground">{filteredAssignments.length}</span> of{" "}
          <span className="font-semibold text-foreground">{assignments.length}</span> resources
        </div>
      </div>

      {/* Resources Table or Truthful Empty State */}
      {assignments.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-lg bg-surface/50 border border-dashed border-border/80 space-y-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <Link2 className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-foreground">
              NO CONNECTED WORK YET
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {team.name} is ready to be connected to campaigns, QR codes, brand kits, and folders.
              Connected work clarifies team responsibility across the workspace.
            </p>
          </div>
          {canManage && (
            <Button
              size="sm"
              onClick={() => setIsConnectOpen(true)}
              className="cursor-pointer text-xs font-semibold gap-1.5 h-8 mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Connect work</span>
            </Button>
          )}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground font-mono bg-surface/30 rounded-md border border-border/50">
          No connected work matches filter criteria.
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setRelationFilter("all");
            }}
            className="block mx-auto mt-2 text-xs font-mono"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border/70 overflow-hidden bg-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 font-mono text-[10px] text-muted-foreground uppercase tracking-wider h-9">
                <th className="px-4 font-semibold">RESOURCE</th>
                <th className="px-4 font-semibold">TYPE</th>
                <th className="px-4 font-semibold">RELATIONSHIP</th>
                <th className="px-4 font-semibold">CONNECTED</th>
                <th className="px-4 text-right font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <ResourceRelationshipRow
                  key={assignment.id}
                  assignment={assignment}
                  canManage={canManage}
                  onDisconnectClick={(item) => setDisconnectCandidate(item)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Connect Work Sheet Modal */}
      <ConnectWorkSheet
        isOpen={isConnectOpen}
        teamId={team.id}
        teamName={team.name}
        orgSlug={orgSlug}
        existingAssignments={assignments}
        onClose={() => setIsConnectOpen(false)}
        onConnected={onRefresh}
      />

      {/* Disconnect Work Confirmation Alert */}
      <DisconnectWorkAlert
        isOpen={!!disconnectCandidate}
        assignment={disconnectCandidate}
        teamName={team.name}
        isSubmitting={isDisconnecting}
        onClose={() => setDisconnectCandidate(null)}
        onConfirm={handleDisconnectConfirm}
      />
    </div>
  );
}
