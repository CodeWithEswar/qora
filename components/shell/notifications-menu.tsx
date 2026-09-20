"use client";

import * as React from "react";
import { Bell, Check, ShieldCheck, Zap, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: React.ReactNode;
}

const NOTIFICATIONS: NotificationItem[] = [];

export function NotificationsMenu() {
  const [items, setItems] = React.useState<NotificationItem[]>(NOTIFICATIONS);
  const unreadCount = items.filter((i) => i.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer select-none shrink-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-surface-elevated/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              <span>Mark read</span>
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="py-4 px-2 flex items-center justify-center">
              <EmptyState
                preset="notifications"
                variant="card"
                className="py-4"
              />
            </div>
          ) : (
            items.map((item) => (
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
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
