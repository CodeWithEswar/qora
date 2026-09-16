"use client";

import * as React from "react";
import { Bell, Check, ExternalLink, ShieldCheck, Zap, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: React.ReactNode;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Guardian Health Check Passed",
    description: "All 42 active destinations verified with 100% uptime and 142ms latency.",
    time: "25m ago",
    unread: true,
    icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />,
  },
  {
    id: "notif-2",
    title: "Scan Milestone Reached",
    description: "Summer Launch Packaging just passed 48,000 total scans.",
    time: "2h ago",
    unread: true,
    icon: <Zap className="h-3.5 w-3.5 text-amber-500" />,
  },
  {
    id: "notif-3",
    title: "New Collaborator Joined",
    description: "Sarah Vance accepted your invitation to join Acme Corp.",
    time: "5h ago",
    unread: false,
    icon: <UserPlus className="h-3.5 w-3.5 text-indigo-500" />,
  },
];

export function NotificationsMenu() {
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const unreadCount = items.filter((i) => i.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="iconSm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 transition-colors hover:bg-surface-hover flex items-start gap-2.5 ${
                item.unread ? "bg-primary/[0.03]" : ""
              }`}
            >
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-border bg-surface text-center">
          <button
            onClick={() => alert("Notification center opened.")}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            View all alerts
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
