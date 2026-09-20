"use client";

import * as React from "react";
import { Users, Building2, ShieldAlert, MailCheck, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OrganizationSummaryRailProps {
  membersCount: number;
  teamsCount: number;
  customRolesCount: number;
  pendingInvitationsCount: number;
  seatLimit: number | null;
  seatsAssigned: number;
  seatsPercentage: number | null;
  onSeatLimitClick?: () => void;
}

export function OrganizationSummaryRail({
  membersCount,
  teamsCount,
  customRolesCount,
  pendingInvitationsCount,
  seatLimit,
  seatsAssigned,
  seatsPercentage,
  onSeatLimitClick,
}: OrganizationSummaryRailProps) {
  const isNearLimit = seatsPercentage !== null && seatsPercentage >= 85 && seatsPercentage < 100;
  const isAtLimit = seatsPercentage !== null && seatsPercentage >= 100;

  return (
    <div className="rounded-xl border border-border/70 bg-surface/80 backdrop-blur-xs p-3 md:p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-0 lg:divide-x lg:divide-border/60">
        {/* Metric 1: Members */}
        <div className="flex items-center gap-3 px-1 lg:px-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              MEMBERS
            </p>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {membersCount}
              {seatLimit !== null ? (
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  / {seatLimit}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Metric 2: Teams */}
        <div className="flex items-center gap-3 px-1 lg:px-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              TEAMS
            </p>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {teamsCount}
            </p>
          </div>
        </div>

        {/* Metric 3: Custom Roles */}
        <div className="flex items-center gap-3 px-1 lg:px-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              CUSTOM ROLES
            </p>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {customRolesCount}
            </p>
          </div>
        </div>

        {/* Metric 4: Pending Invites */}
        <div className="flex items-center gap-3 px-1 lg:px-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <MailCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              PENDING
            </p>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {pendingInvitationsCount}
            </p>
          </div>
        </div>

        {/* Metric 5: Seat Capacity */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col justify-center px-1 lg:px-4 pt-1 lg:pt-0">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              SEAT CAPACITY
            </span>
            <span
              className={cn(
                "font-semibold",
                isAtLimit
                  ? "text-rose-600 dark:text-rose-400"
                  : isNearLimit
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
              )}
            >
              {seatsPercentage !== null ? `${seatsPercentage}%` : "Not limited"}
            </span>
          </div>

          {seatsPercentage !== null ? (
            <div className="space-y-1">
              <Progress
                value={seatsPercentage}
                className="h-1.5 bg-muted/60"
                indicatorClassName={cn(
                  isAtLimit
                    ? "bg-rose-500"
                    : isNearLimit
                    ? "bg-amber-500"
                    : "bg-primary"
                )}
              />
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>
                  {seatsAssigned} of {seatLimit} seats
                </span>
                {isAtLimit && (
                  <button
                    onClick={onSeatLimitClick}
                    className="text-primary hover:underline font-medium"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Enterprise unlimited</span>
          )}
        </div>
      </div>
    </div>
  );
}
