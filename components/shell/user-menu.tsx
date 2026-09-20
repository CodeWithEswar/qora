"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Settings,
  CreditCard,
  Keyboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getClientSession } from "@/lib/auth/client-session";

interface UserMenuProps {
  orgSlug: string;
  isCollapsed?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

interface ActiveUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export function UserMenu({
  orgSlug,
  isCollapsed = false,
  side,
  align,
}: UserMenuProps) {
  const [currentUser, setCurrentUser] = React.useState<ActiveUser | null>(null);

  React.useEffect(() => {
    getClientSession()
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser({
            name: data.user.name || "User",
            email: data.user.email || "",
            avatarUrl: data.user.avatarUrl,
            role: "Owner",
          });
        }
      })
      .catch(() => {});
  }, []);

  const displayName = currentUser?.name || "Account";
  const displayEmail = currentUser?.email || "";
  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleSignOut = () => {
    window.location.href = "/api/auth/signout";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center rounded-lg transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer select-none",
            isCollapsed
              ? "justify-center h-8 w-8 p-0 border border-border bg-surface shrink-0"
              : "gap-2.5 w-full p-1.5"
          )}
          title={displayName}
        >
          <Avatar className={cn("border-0 shrink-0", isCollapsed ? "h-6 w-6" : "h-7 w-7 border border-border")}>
            {currentUser?.avatarUrl && (
              <AvatarImage src={currentUser.avatarUrl} alt={displayName} />
            )}
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex flex-col text-left min-w-0 leading-tight">
              <span className="truncate text-xs font-medium text-foreground">
                {displayName}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {displayEmail}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align ?? (isCollapsed ? "end" : "end")}
        side={side ?? (isCollapsed ? "right" : "top")}
        sideOffset={isCollapsed ? 8 : 6}
        className="w-56 p-1.5 shadow-xl border-border"
      >
        <DropdownMenuLabel className="font-normal py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold leading-none text-foreground">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-[11px] leading-none text-muted-foreground truncate">
                {displayEmail}
              </p>
            )}
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit">
              <Sparkles className="h-2.5 w-2.5" />
              {currentUser?.role || "Owner"}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/settings`} className="cursor-pointer">
              <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span>Workspace Preferences</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/billing`} className="cursor-pointer">
              <CreditCard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span>Subscription & Billing</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true })
            );
          }}
          className="cursor-pointer"
        >
          <Keyboard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          <span>Keyboard Shortcuts</span>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">
            ⌘K
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-rose-600 dark:text-rose-400 cursor-pointer focus:bg-rose-500/10 focus:text-rose-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
