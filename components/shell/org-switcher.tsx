"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Plus, Building2 } from "lucide-react";
import { PlanBadge } from "@/components/shared/plan-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WORKSPACES } from "@/lib/mock-data/organizations";
import { cn } from "@/lib/utils";

interface OrgSwitcherProps {
  currentOrgSlug: string;
  isCollapsed?: boolean;
}

export function OrgSwitcher({ currentOrgSlug, isCollapsed = false }: OrgSwitcherProps) {
  const router = useRouter();
  const currentOrg =
    WORKSPACES.find((w) => w.slug === currentOrgSlug) || WORKSPACES[0];

  const handleSelect = (slug: string) => {
    router.push(`/${slug}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-lg border border-border/70 bg-surface px-2.5 py-2 text-left transition-all hover:bg-surface-hover hover:border-border-strong focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer select-none",
            isCollapsed && "justify-center px-2 py-2"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs border border-primary/20">
            {currentOrg.name.charAt(0)}
          </div>

          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col min-w-0 leading-tight">
                <span className="truncate text-xs font-semibold text-foreground">
                  {currentOrg.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {currentOrg.membersCount} members
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <PlanBadge plan={currentOrg.plan} showIcon={false} />
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
              </div>
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56 p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-[10px]">Workspaces</DropdownMenuLabel>
        {WORKSPACES.map((org) => {
          const isSelected = org.slug === currentOrg.slug;
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSelect(org.slug)}
              className="flex items-center justify-between py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-foreground border border-border">
                  {org.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-medium text-foreground">
                    {org.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {org.qrCount} QR codes
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <PlanBadge plan={org.plan} showIcon={false} />
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 text-primary cursor-pointer font-medium text-xs py-1.5"
          onClick={() => alert("Create Workspace modal will open here.")}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-primary/40 bg-primary/5">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span>Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
