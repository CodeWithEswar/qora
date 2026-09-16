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
import { CURRENT_USER } from "@/lib/mock-data/organizations";

interface UserMenuProps {
  orgSlug: string;
  isCollapsed?: boolean;
}

export function UserMenu({ orgSlug, isCollapsed = false }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 w-full rounded-lg p-1.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer select-none"
          title={CURRENT_USER.name}
        >
          <Avatar className="h-7 w-7 border border-border">
            <AvatarImage src={CURRENT_USER.avatar} alt={CURRENT_USER.name} />
            <AvatarFallback className="text-[11px]">AR</AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex flex-col text-left min-w-0 leading-tight">
              <span className="truncate text-xs font-medium text-foreground">
                {CURRENT_USER.name}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {CURRENT_USER.email}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
        <DropdownMenuLabel className="font-normal py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold leading-none text-foreground">
              {CURRENT_USER.name}
            </p>
            <p className="text-[11px] leading-none text-muted-foreground">
              {CURRENT_USER.email}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit">
              <Sparkles className="h-2.5 w-2.5" />
              {CURRENT_USER.role}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/settings/profile`} className="cursor-pointer">
              <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/billing`} className="cursor-pointer">
              <CreditCard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span>Subscription & Billing</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/settings`} className="cursor-pointer">
              <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span>Workspace Preferences</span>
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
          onClick={() => alert("Sign out action triggered.")}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
