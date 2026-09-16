"use client";

import * as React from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { SunsetStripe } from "@/components/shared/sunset-stripe";
import { cn } from "@/lib/utils";

interface AppShellProps {
  orgSlug: string;
  children: React.ReactNode;
}

export function AppShell({ orgSlug, children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar
        orgSlug={orgSlug}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        className="hidden md:flex h-screen"
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out bg-sidebar",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          orgSlug={orgSlug}
          isCollapsed={false}
          onToggleCollapse={() => setIsMobileOpen(false)}
          className="h-full w-[260px]"
        />
      </div>

      {/* Main Workspace Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar
          orgSlug={orgSlug}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>

          {/* Mistral Signature Sunset Stripe Closing Band */}
          <div className="mt-auto w-full">
            <SunsetStripe height="sm" />
          </div>
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        orgSlug={orgSlug}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
