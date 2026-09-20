"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LandingPageResponseV1, LandingPagePulseMetrics } from "@nxtqr/contracts";
import { LandingPageTile } from "./landing-page-tile";
import { LandingPagesList } from "./landing-pages-list";
import { LandingPagesEmpty } from "../states/landing-pages-empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DestinationFieldProps {
  initialPages: LandingPageResponseV1[];
  pulse: LandingPagePulseMetrics;
  orgSlug: string;
}

export function DestinationField({
  initialPages,
  pulse,
  orgSlug,
}: DestinationFieldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [pages, setPages] = useState<LandingPageResponseV1[]>(initialPages);
  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updatedAt");

  // Deletion modal state
  const [deletingPage, setDeletingPage] = useState<LandingPageResponseV1 | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  // Filter & sort pages locally
  const filteredPages = pages.filter((page) => {
    if (statusFilter !== "all" && page.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = page.name.toLowerCase().includes(q);
      const matchSlug = page.slug.toLowerCase().includes(q);
      const matchDesc = page.description?.toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchDesc) return false;
    }
    return true;
  });

  filteredPages.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "qrCount") return b.qrCount - a.qrCount;
    if (sortBy === "viewCount") return b.viewCount - a.viewCount;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDuplicate = async (targetPage: LandingPageResponseV1) => {
    try {
      toast.loading("Duplicating landing page...", { id: "dup-page" });
      const res = await fetch(`/api/v1/landing-pages/${targetPage.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Copy of ${targetPage.name}` }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to duplicate page");
      }

      const { data: newPage } = await res.json();
      toast.success("Landing page duplicated", {
        id: "dup-page",
        description: `Created "${newPage.name}"`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error("Duplication failed", {
        id: "dup-page",
        description: err.message,
      });
    }
  };

  const confirmDelete = async () => {
    if (!deletingPage) return;
    setIsDeleting(true);

    try {
      const url = `/api/v1/landing-pages/${deletingPage.id}${forceDelete ? "?force=true" : ""}`;
      const res = await fetch(url, { method: "DELETE" });

      if (res.status === 409) {
        const payload = await res.json();
        toast.error("Dependency Blocked", {
          description: payload.error?.message || "Active QR codes depend on this page.",
        });
        setForceDelete(true);
        setIsDeleting(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to delete landing page");
      }

      toast.success("Landing page deleted", {
        description: "Connected QR assets remain intact.",
      });

      setPages((prev) => prev.filter((p) => p.id !== deletingPage.id));
      setDeletingPage(null);
      setForceDelete(false);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error("Deletion failed", { description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (pages.length === 0) {
    return <LandingPagesEmpty orgSlug={orgSlug} />;
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter, Sort, View Mode Toolbar */}
      <div className="flex flex-col gap-2.5">
        {/* Search Bar + Desktop Filters + View Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
            <NxtqrIcon
              icon="solar:magnifer-linear"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Desktop Filters (hidden on mobile, visible on sm+) */}
          <div className="hidden sm:flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[120px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-[145px] text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Recently Updated</SelectItem>
                <SelectItem value="newest">Newest Created</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="qrCount">Most Connected QRs</SelectItem>
                <SelectItem value="viewCount">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-0.5 bg-muted/40 shrink-0">
            <Button
              variant={viewMode === "visual" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("visual")}
              className="h-7 px-2 sm:px-2.5 text-xs gap-1 sm:gap-1.5 font-medium"
              title="Visual Cards"
            >
              <NxtqrIcon icon="solar:widget-linear" size={14} />
              <span className="hidden md:inline">Visual</span>
            </Button>

            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-7 px-2 sm:px-2.5 text-xs gap-1 sm:gap-1.5 font-medium"
              title="Table List"
            >
              <NxtqrIcon icon="solar:list-linear" size={14} />
              <span className="hidden md:inline">List</span>
            </Button>
          </div>
        </div>

        {/* Mobile Dropdowns Row (visible on mobile only) */}
        <div className="flex sm:hidden items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 flex-1 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 flex-1 text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Recently Updated</SelectItem>
              <SelectItem value="newest">Newest Created</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="qrCount">Most Connected QRs</SelectItem>
              <SelectItem value="viewCount">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtered Empty State */}
      {filteredPages.length === 0 ? (
        <div className="py-16 text-center border border-dashed rounded-2xl p-8">
          <NxtqrIcon icon="solar:filter-linear" size={28} className="mx-auto text-muted-foreground mb-2 opacity-60" />
          <h3 className="font-bold text-foreground">No landing pages match your search</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search keywords or clearing active filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "visual" ? (
        /* Destination Field: Adaptive 3-4 Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPages.map((page) => (
            <LandingPageTile
              key={page.id}
              page={page}
              orgSlug={orgSlug}
              onDuplicate={handleDuplicate}
              onDelete={(p) => {
                setDeletingPage(p);
                setForceDelete(false);
              }}
            />
          ))}
        </div>
      ) : (
        /* List Mode */
        <LandingPagesList
          pages={filteredPages}
          orgSlug={orgSlug}
          onDuplicate={handleDuplicate}
          onDelete={(p) => {
            setDeletingPage(p);
            setForceDelete(false);
          }}
        />
      )}

      {/* Dependency-Guarded Deletion Dialog */}
      <AlertDialog
        open={Boolean(deletingPage)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPage(null);
            setForceDelete(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <NxtqrIcon icon="solar:danger-triangle-bold" className="text-destructive" size={20} />
              <span>Delete &quot;{deletingPage?.name}&quot;?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              {deletingPage && deletingPage.qrCount > 0 ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-destructive text-xs leading-relaxed">
                  <strong>Dependency Warning:</strong> This landing page is currently connected to{" "}
                  <strong>{deletingPage.qrCount} QR code{deletingPage.qrCount === 1 ? "" : "s"}</strong>.
                  Deleting it will remove the destination page. Associated QR codes will remain safe and intact, but visitors will receive a 404 until you configure a new destination.
                </div>
              ) : (
                <span>
                  This action will permanently delete this landing page, its drafts, and publication versions. QR assets will never be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            {deletingPage && deletingPage.qrCount > 0 && !forceDelete ? (
              <Button
                variant="outline"
                onClick={() => router.push(`/${orgSlug}/landing-pages/${deletingPage.id}`)}
              >
                View Dependencies
              </Button>
            ) : null}
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : forceDelete || (deletingPage?.qrCount ?? 0) > 0 ? "Force Delete Page" : "Delete Page"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
