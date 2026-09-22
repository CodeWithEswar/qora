"use client";

import * as React from "react";
import { TeamCapsule } from "./team-capsule";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANONICAL_OPERATIONAL_DOMAINS } from "@/lib/supabase/types/teams";
import type { TeamSummary, TeamResourceType } from "@/lib/supabase/types/teams";
import { Search, X, UserPlus, Users, Sparkles } from "lucide-react";

interface TeamRegistryProps {
  teams: TeamSummary[];
  selectedTeamIds: string[];
  onSelectTeamToggle: (team: TeamSummary) => void;
  onOpenTeam: (team: TeamSummary) => void;
  onManageMembers: (team: TeamSummary) => void;
  onConnectWork: (team: TeamSummary) => void;
  onEditTeam: (team: TeamSummary) => void;
  onArchiveTeam?: (team: TeamSummary) => void;
  onRestoreTeam?: (team: TeamSummary) => void;
  onDeleteTeam: (team: TeamSummary) => void;
  onCreateTeamClick: () => void;
  canManageTeams?: boolean;
}

export function TeamRegistry({
  teams,
  selectedTeamIds,
  onSelectTeamToggle,
  onOpenTeam,
  onManageMembers,
  onConnectWork,
  onEditTeam,
  onArchiveTeam,
  onRestoreTeam,
  onDeleteTeam,
  onCreateTeamClick,
  canManageTeams = true,
}: TeamRegistryProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDomain, setSelectedDomain] = React.useState<string>("all");
  const [selectedResource, setSelectedResource] = React.useState<string>("all");
  const [selectedSize, setSelectedSize] = React.useState<string>("all");
  const [selectedState, setSelectedState] = React.useState<string>("active");
  const [sortBy, setSortBy] = React.useState<string>("recent_active");

  const filteredTeams = React.useMemo(() => {
    let result = teams.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesId = t.publicId.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesId) return false;
      }

      if (selectedDomain !== "all") {
        const domKey = selectedDomain.toLowerCase();
        const hasDomain = t.accessDomains.some(
          (ad) => ad.domain.toLowerCase() === domKey && ad.level !== "NONE"
        );
        if (!hasDomain) return false;
      }

      if (selectedResource !== "all") {
        const rKey = selectedResource as TeamResourceType;
        const work = t.connectedWork;
        if (!work) return false;
        if (rKey === "qr_code" && work.qrCount === 0) return false;
        if (rKey === "campaign" && work.campaignCount === 0) return false;
        if (rKey === "brand_kit" && work.brandKitCount === 0) return false;
        if (rKey === "domain" && work.domainCount === 0) return false;
        if (rKey === "template" && work.templateCount === 0) return false;
      }

      if (selectedSize !== "all") {
        if (selectedSize === "1-5" && (t.memberCount < 1 || t.memberCount > 5)) return false;
        if (selectedSize === "6-10" && (t.memberCount < 6 || t.memberCount > 10)) return false;
        if (selectedSize === "10+" && t.memberCount <= 10) return false;
      }

      if (selectedState !== "all") {
        if (t.state !== selectedState) return false;
      }

      return true;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "members_count") {
      result.sort((a, b) => b.memberCount - a.memberCount);
    } else if (sortBy === "connected_work") {
      result.sort((a, b) => (b.connectedWork?.totalCount || 0) - (a.connectedWork?.totalCount || 0));
    } else if (sortBy === "recent_active") {
      result.sort((a, b) => {
        const tA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const tB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return tB - tA;
      });
    }

    return result;
  }, [teams, searchQuery, selectedDomain, selectedResource, selectedSize, selectedState, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedDomain !== "all" ||
    selectedResource !== "all" ||
    selectedSize !== "all" ||
    selectedState !== "active";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDomain("all");
    setSelectedResource("all");
    setSelectedSize("all");
    setSelectedState("active");
    setSortBy("recent_active");
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Command Filter Rail */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-surface/60">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search teams by name, purpose, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-surface w-full font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Domain Filter */}
          <div className="w-full sm:w-36">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="h-8 text-xs w-full bg-surface font-mono">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {CANONICAL_OPERATIONAL_DOMAINS.map((d) => (
                  <SelectItem key={d.domain} value={d.domain}>
                    {d.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Connected Work Filter */}
          <div className="w-full sm:w-32">
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="h-8 text-xs w-full bg-surface font-mono">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Work</SelectItem>
                <SelectItem value="qr_code">QR Codes</SelectItem>
                <SelectItem value="campaign">Campaigns</SelectItem>
                <SelectItem value="brand_kit">Brand Kits</SelectItem>
                <SelectItem value="domain">Domains</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* State Filter */}
          <div className="w-full sm:w-28">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="h-8 text-xs w-full bg-surface font-mono">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Select */}
          <div className="w-full sm:w-36">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-xs w-full bg-surface font-mono">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent_active">Recently active</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="members_count">Members count</SelectItem>
                <SelectItem value="connected_work">Connected work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 shrink-0 self-center sm:self-auto cursor-pointer font-mono"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="text-[10px] tracking-wider uppercase font-semibold">FILTERS:</span>
          {selectedDomain !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
              DOMAIN / {selectedDomain.toUpperCase()}
              <button onClick={() => setSelectedDomain("all")} className="hover:text-foreground cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedResource !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
              WORK / {selectedResource.toUpperCase().replace("_", " ")}
              <button onClick={() => setSelectedResource("all")} className="hover:text-foreground cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedState !== "active" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
              STATE / {selectedState.toUpperCase()}
              <button onClick={() => setSelectedState("active")} className="hover:text-foreground cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
              QUERY / &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")} className="hover:text-foreground cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button onClick={clearFilters} className="text-[11px] text-primary hover:underline ml-1 cursor-pointer">
            Clear all
          </button>
        </div>
      )}

      {/* TEAM CAPSULES CONTAINER */}
      {teams.length === 0 ? (
        /* True Empty State with Official NXTQR Monogram */
        <div className="rounded-xl border border-border/80 bg-surface/50 p-6 sm:p-10 font-mono">
          <EmptyState
            preset="teams"
            variant="table"
            title="Build your collaboration structure"
            description="Create teams to connect workspace members around shared responsibilities, access boundaries, and connected work."
            action={
              canManageTeams
                ? {
                    label: "Create first team",
                    onClick: onCreateTeamClick,
                  }
                : undefined
            }
          />
        </div>
      ) : filteredTeams.length === 0 ? (
        /* Filtered Empty State */
        <div className="rounded-xl border border-border/70 bg-surface/40 p-6 sm:p-8 font-mono">
          <EmptyState
            preset="teams"
            variant="filtered"
            title="No teams match this view"
            description="No collaboration teams match the specified filter combination."
            action={{
              label: "Clear all filters",
              onClick: clearFilters,
            }}
          />
        </div>
      ) : (
        /* Directory of Team Capsules */
        <div className="grid grid-cols-1 gap-3.5">
          {filteredTeams.map((team) => (
            <TeamCapsule
              key={team.id}
              team={team}
              isSelected={selectedTeamIds.includes(team.id)}
              onSelectToggle={onSelectTeamToggle}
              onOpenTeam={onOpenTeam}
              onManageMembers={onManageMembers}
              onConnectWork={onConnectWork}
              onEditTeam={onEditTeam}
              onArchiveTeam={onArchiveTeam}
              onRestoreTeam={onRestoreTeam}
              onDeleteTeam={onDeleteTeam}
              canManage={canManageTeams}
            />
          ))}
        </div>
      )}
    </div>
  );
}
