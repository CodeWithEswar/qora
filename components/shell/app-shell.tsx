"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { PageTransition } from "@/components/motion/page-transition";
import { cn } from "@/lib/utils";

interface AppShellProps {
  orgSlug: string;
  children: React.ReactNode;
}

export function AppShell({ orgSlug, children }: AppShellProps) {
  const pathname = usePathname();
  const isLandingStudio = Boolean(
    pathname?.includes("/landing-pages/") && pathname?.endsWith("/edit")
  );
  const isTemplateForge = Boolean(
    pathname?.includes("/templates/forge")
  );
  const isFullBleedStudio = isLandingStudio || isTemplateForge;
  const isStudio =
    pathname?.includes("/qr/studio") ||
    pathname?.includes("/brain") ||
    isFullBleedStudio;
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

  React.useEffect(() => {
    const handleOpenMobileSidebar = () => setIsMobileOpen(true);
    window.addEventListener("nxtqr:open-mobile-sidebar", handleOpenMobileSidebar);
    return () => window.removeEventListener("nxtqr:open-mobile-sidebar", handleOpenMobileSidebar);
  }, []);

  return (
    <div className="flex h-screen h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar
        orgSlug={orgSlug}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        className="hidden md:flex h-screen h-[100dvh]"
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
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 h-full">
        {!isFullBleedStudio && (
          <Topbar
            orgSlug={orgSlug}
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        )}

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 min-h-0",
            isFullBleedStudio ? "overflow-hidden h-full max-h-full" : "overflow-y-auto overflow-x-hidden"
          )}
        >
          <main
            className={cn(
              "flex-1 w-full min-h-0",
              isFullBleedStudio
                ? "p-0 max-w-none h-full max-h-full flex flex-col overflow-hidden"
                : isStudio
                ? "p-0 max-w-none"
                : "p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
            )}
          >
            <PageTransition className={isFullBleedStudio ? "h-full max-h-full flex flex-col flex-1 min-h-0 overflow-hidden" : undefined}>
              {children}
            </PageTransition>
          </main>


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
