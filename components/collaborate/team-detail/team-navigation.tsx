"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Link2, ShieldCheck, FileCheck2, Activity, ChevronLeft, ChevronRight } from "lucide-react";

export type TeamViewTab = "overview" | "people" | "work" | "access" | "approvals" | "activity";

interface TeamNavigationProps {
  activeTab: TeamViewTab;
  onChangeTab: (tab: TeamViewTab) => void;
  memberCount: number;
  connectedWorkCount: number;
  pendingApprovalsCount?: number;
  activityCount?: number;
  className?: string;
}

interface NavItem {
  id: TeamViewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export function TeamNavigation({
  activeTab,
  onChangeTab,
  memberCount,
  connectedWorkCount,
  pendingApprovalsCount = 0,
  activityCount = 0,
  className,
}: TeamNavigationProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeTabRef = React.useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "people", label: "People", icon: Users, count: memberCount },
    { id: "work", label: "Connected Work", icon: Link2, count: connectedWorkCount },
    { id: "access", label: "Access", icon: ShieldCheck },
    { id: "approvals", label: "Approvals", icon: FileCheck2, count: pendingApprovalsCount },
    { id: "activity", label: "Activity", icon: Activity, count: activityCount },
  ];

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Scroll active tab into view on change
  React.useEffect(() => {
    if (activeTabRef.current && scrollRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -180 : 180;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "relative w-full border-b border-border/70 select-none font-mono",
        className
      )}
    >
      {/* Optional Left Scroll Indicator Button on small viewports */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-md bg-surface/90 border border-border/80 text-muted-foreground hover:text-foreground shadow-xs sm:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Optional Right Scroll Indicator Button on small viewports */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-md bg-surface/90 border border-border/80 text-muted-foreground hover:text-foreground shadow-xs sm:hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Tabs Scroll Container */}
      <nav
        ref={scrollRef}
        onScroll={checkScroll}
        aria-label="Team Operations Views"
        className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1 px-0.5"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              ref={isActive ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChangeTab(item.id)}
              className={cn(
                "group relative flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary font-bold border border-primary/30 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/80 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="font-sans font-medium text-xs tracking-tight">
                {item.label}
              </span>

              {typeof item.count === "number" && item.count > 0 && (
                <span
                  className={cn(
                    "ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none font-bold",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
