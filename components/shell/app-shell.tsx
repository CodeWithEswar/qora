"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { NytraPixelSpectrum } from "@/components/shared/nytra-pixel-spectrum";
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
  const isStudio =
    pathname?.includes("/qr/studio") ||
    pathname?.includes("/brain") ||
    isLandingStudio;
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
        {!isLandingStudio && (
          <Topbar
            orgSlug={orgSlug}
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        )}

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            isLandingStudio ? "overflow-hidden h-full" : "overflow-y-auto overflow-x-hidden"
          )}
        >
          <main
            className={cn(
              "flex-1 w-full",
              isLandingStudio
                ? "p-0 max-w-none h-full flex flex-col overflow-hidden"
                : isStudio
                ? "p-0 max-w-none"
                : "p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
            )}
          >
            <PageTransition className={isLandingStudio ? "h-full flex flex-col flex-1 overflow-hidden" : undefined}>
              {children}
            </PageTransition>
          </main>

          {/* NYTRA Pixel Spectrum Closing Band */}
          {!isStudio && (
            <div className="mt-auto w-full">
              <NytraPixelSpectrum height="sm" />
            </div>
          )}
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
