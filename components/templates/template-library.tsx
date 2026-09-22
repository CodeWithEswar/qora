"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  QrTemplateSummary,
  QrTemplateDetail,
} from "@/lib/domains/templates/types";
import { TemplateConstellation } from "./template-constellation";
import { TemplateSpecimen } from "./template-specimen";
import { TemplateInspector } from "./template-inspector";
import { UseTemplateDialog } from "./dialogs/use-template-dialog";
import { DuplicateTemplateDialog } from "./dialogs/duplicate-template-dialog";
import { DeleteTemplateDialog } from "./dialogs/delete-template-dialog";
import { TemplateEmptyState } from "./states/template-empty-state";
import { TemplateFilteredEmpty } from "./states/template-filtered-empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface TemplateLibraryProps {
  initialTemplates: QrTemplateSummary[];
  brandKits?: Array<{ id: string; name: string; slug: string }>;
  orgSlug: string;
}

type TabKey = "all" | "mine" | "locked" | "recent";

export function TemplateLibrary({
  initialTemplates,
  brandKits = [],
  orgSlug,
}: TemplateLibraryProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<QrTemplateSummary[]>(initialTemplates);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"visual" | "compact">("visual");

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBrandKit, setFilterBrandKit] = useState<string>("all");
  const [filterGovernance, setFilterGovernance] = useState<string>("all");
  const [filterScanability, setFilterScanability] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("updated_desc");

  // Modals & Sheets
  const [selectedTemplate, setSelectedTemplate] = useState<QrTemplateSummary | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [templateToUse, setTemplateToUse] = useState<QrTemplateSummary | null>(null);
  const [templateToDuplicate, setTemplateToDuplicate] = useState<QrTemplateSummary | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<QrTemplateSummary | null>(null);

  const [recentCutoffTimestamp] = useState(() =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  );

  // Filtered and sorted data (STRICT REAL-DATA: Zero fake fallback rows)
  const filteredTemplates = useMemo(() => {
    let list = [...templates];

    // 1. Tab segment
    if (activeTab === "locked") {
      list = list.filter((t) => t.is_brand_locked);
    } else if (activeTab === "recent") {
      list = list.filter((t) => t.updated_at >= recentCutoffTimestamp);
    }

    // 2. Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.brand_kit_name && t.brand_kit_name.toLowerCase().includes(q)) ||
          t.compatibility.some((c) => c.toLowerCase().includes(q))
      );
    }

    // 3. QR Payload Type
    if (filterType !== "all") {
      list = list.filter(
        (t) =>
          t.compatibility.includes("UNIVERSAL") ||
          t.compatibility.map((c) => c.toUpperCase()).includes(filterType.toUpperCase())
      );
    }

    // 4. Brand Kit
    if (filterBrandKit !== "all") {
      list = list.filter((t) => t.brand_kit_id === filterBrandKit);
    }

    // 5. Governance
    if (filterGovernance === "locked") {
      list = list.filter((t) => t.is_brand_locked);
    } else if (filterGovernance === "editable") {
      list = list.filter((t) => !t.is_brand_locked);
    }

    // 6. Scanability
    if (filterScanability === "pass") {
      list = list.filter((t) => t.scanability_status === "PASS");
    } else if (filterScanability === "warning") {
      list = list.filter((t) => t.scanability_status === "WARNING");
    }

    // 7. Sort
    list.sort((a, b) => {
      switch (sortOrder) {
        case "created_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "usage_desc":
          return b.usage_count - a.usage_count;
        case "updated_desc":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return list;
  }, [
    templates,
    activeTab,
    search,
    filterType,
    filterBrandKit,
    filterGovernance,
    filterScanability,
    sortOrder,
    recentCutoffTimestamp,
  ]);

  const activeFilterCount =
    (filterType !== "all" ? 1 : 0) +
    (filterBrandKit !== "all" ? 1 : 0) +
    (filterGovernance !== "all" ? 1 : 0) +
    (filterScanability !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterBrandKit("all");
    setFilterGovernance("all");
    setFilterScanability("all");
    setActiveTab("all");
  };

  // Actions
  const handleInspect = (t: QrTemplateSummary) => {
    setSelectedTemplate(t);
    setIsInspectorOpen(true);
  };

  const handleEdit = (t: QrTemplateSummary) => {
    router.push(`/${orgSlug}/templates/forge?templateId=${t.id}`);
  };

  const handleExport = async (t: QrTemplateSummary) => {
    try {
      const res = await fetch(`/api/v1/templates/${t.id}/export`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Export failed");

      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-template.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template design JSON exported");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleDuplicated = (newTmpl: QrTemplateSummary) => {
    setTemplates((prev) => [newTmpl, ...prev]);
  };

  const handleDeleted = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setIsInspectorOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleVersionRestored = (updated: QrTemplateDetail) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTemplate(updated);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              DESIGN SYSTEM
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Templates
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Build reusable QR identities that keep every scan recognizable, scannable, and on-brand.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href={`/${orgSlug}/brand`}>
              <Icon icon="tabler:palette" className="h-3.5 w-3.5" />
              Brand Kits
            </Link>
          </Button>

          <Button asChild size="sm" className="gap-1.5 text-xs font-medium shadow-sm">
            <Link href={`/${orgSlug}/templates/forge`}>
              <Icon icon="tabler:plus" className="h-3.5 w-3.5" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Signature Feature — Template Constellation */}
      {templates.length > 0 && (
        <TemplateConstellation
          templates={templates}
          onSelectTemplate={handleInspect}
        />
      )}

      {/* 3. Empty State or Gallery */}
      {templates.length === 0 ? (
        <TemplateEmptyState orgSlug={orgSlug} />
      ) : (
        <div className="space-y-4">
          {/* Segmented Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                ALL ({templates.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("locked")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === "locked"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon icon="tabler:lock" className="h-3 w-3" />
                BRAND-LOCKED ({templates.filter((t) => t.is_brand_locked).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("recent")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "recent"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                RECENT
              </button>
            </div>
          </div>

          {/* Command Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Icon
                icon="tabler:search"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates, QR types, brand kits..."
                className="pl-9 text-xs h-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon icon="tabler:x" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter, Sort, View Controls */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                    <Icon icon="tabler:filter" className="h-3.5 w-3.5" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-1 px-1.5 py-0 h-4 text-[10px]">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-4 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-serif font-medium">Filter Templates</span>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterType("all");
                          setFilterBrandKit("all");
                          setFilterGovernance("all");
                          setFilterScanability("all");
                        }}
                        className="text-[11px] font-mono text-primary hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* QR Payload Type */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      QR Type
                    </span>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="universal">Universal</SelectItem>
                        <SelectItem value="url">Website / URL</SelectItem>
                        <SelectItem value="wifi">Wi-Fi</SelectItem>
                        <SelectItem value="vcard">vCard</SelectItem>
                        <SelectItem value="app">App Store</SelectItem>
                        <SelectItem value="file">File / PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Kit */}
                  {brandKits.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">
                        Brand Kit
                      </span>
                      <Select value={filterBrandKit} onValueChange={setFilterBrandKit}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All Brand Kits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Brand Kits</SelectItem>
                          {brandKits.map((bk) => (
                            <SelectItem key={bk.id} value={bk.id}>
                              {bk.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Governance */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Governance
                    </span>
                    <Select value={filterGovernance} onValueChange={setFilterGovernance}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Templates</SelectItem>
                        <SelectItem value="locked">Brand Locked Only</SelectItem>
                        <SelectItem value="editable">Editable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scanability */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Scanability Signal
                    </span>
                    <Select value={filterScanability} onValueChange={setFilterScanability}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scan Scores</SelectItem>
                        <SelectItem value="pass">Pass Only</SelectItem>
                        <SelectItem value="warning">Warnings Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort Selector */}
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="h-9 w-40 text-xs font-mono">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="updated_desc">Recently Updated</SelectItem>
                  <SelectItem value="created_desc">Recently Created</SelectItem>
                  <SelectItem value="name_asc">Name A–Z</SelectItem>
                  <SelectItem value="name_desc">Name Z–A</SelectItem>
                  <SelectItem value="usage_desc">Most Used</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border border-border/80 rounded-md p-0.5 bg-muted/20">
                <Button
                  size="icon"
                  variant={viewMode === "visual" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("visual")}
                  className="h-7 w-7"
                  title="Visual Specimens"
                >
                  <Icon icon="tabler:layout-grid" className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "compact" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("compact")}
                  className="h-7 w-7"
                  title="Compact List"
                >
                  <Icon icon="tabler:layout-list" className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(activeFilterCount > 0 || search) && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="font-mono text-[11px] text-muted-foreground mr-1">Active:</span>

              {search && (
                <Badge variant="secondary" className="gap-1 font-mono text-[11px] pr-1">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch("")} className="hover:text-foreground">
                    <Icon icon="tabler:x" className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filterType !== "all" && (
                <Badge variant="secondary" className="gap-1 font-mono text-[11px] pr-1">
                  Type: {filterType}
                  <button onClick={() => setFilterType("all")} className="hover:text-foreground">
                    <Icon icon="tabler:x" className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filterBrandKit !== "all" && (
                <Badge variant="secondary" className="gap-1 font-mono text-[11px] pr-1">
                  Brand: {brandKits.find((b) => b.id === filterBrandKit)?.name || "Kit"}
                  <button onClick={() => setFilterBrandKit("all")} className="hover:text-foreground">
                    <Icon icon="tabler:x" className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filterGovernance !== "all" && (
                <Badge variant="secondary" className="gap-1 font-mono text-[11px] pr-1">
                  {filterGovernance === "locked" ? "Brand Locked" : "Editable"}
                  <button onClick={() => setFilterGovernance("all")} className="hover:text-foreground">
                    <Icon icon="tabler:x" className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filterScanability !== "all" && (
                <Badge variant="secondary" className="gap-1 font-mono text-[11px] pr-1">
                  Scan: {filterScanability}
                  <button onClick={() => setFilterScanability("all")} className="hover:text-foreground">
                    <Icon icon="tabler:x" className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="font-mono text-[11px] text-primary hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* 4. Template Specimens Grid / Compact List */}
          {filteredTemplates.length === 0 ? (
            <TemplateFilteredEmpty
              onClearFilters={clearAllFilters}
              queryType={search ? "search" : "filters"}
            />
          ) : viewMode === "visual" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
              {filteredTemplates.map((template) => (
                <TemplateSpecimen
                  key={template.id}
                  template={template}
                  onUse={() => setTemplateToUse(template)}
                  onInspect={handleInspect}
                  onEdit={handleEdit}
                  onDuplicate={(t) => setTemplateToDuplicate(t)}
                  onExport={handleExport}
                  onDelete={(t) => setTemplateToDelete(t)}
                />
              ))}
            </div>
          ) : (
            /* Compact Mode */
            <div className="rounded-xl border border-border/80 overflow-hidden bg-card/40 divide-y divide-border/60 text-xs">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleInspect(template)}
                  className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 border border-black/20"
                      style={{ backgroundColor: template.design_json.fgColor || "#1F1F1F" }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {template.name}
                        </span>
                        {template.is_brand_locked && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-500 border-amber-500/30">
                            LOCKED
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {template.brand_kit_name || "Platform"} · v{template.current_version} · {template.compatibility[0] || "UNIVERSAL"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="font-mono text-xs font-semibold text-emerald-500">
                      {template.scanability_score}%
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setTemplateToUse(template)}
                      className="h-7 text-xs px-2.5"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Drawers & Dialogs */}
      <TemplateInspector
        template={selectedTemplate}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onUse={(t) => {
          setIsInspectorOpen(false);
          setTemplateToUse(t);
        }}
        onEdit={handleEdit}
        onDuplicate={(t) => setTemplateToDuplicate(t)}
        onExport={handleExport}
        onDelete={(t) => setTemplateToDelete(t)}
        onVersionRestored={handleVersionRestored}
      />

      <UseTemplateDialog
        template={templateToUse}
        orgSlug={orgSlug}
        isOpen={Boolean(templateToUse)}
        onClose={() => setTemplateToUse(null)}
      />

      <DuplicateTemplateDialog
        template={templateToDuplicate}
        isOpen={Boolean(templateToDuplicate)}
        onClose={() => setTemplateToDuplicate(null)}
        onDuplicated={handleDuplicated}
      />

      <DeleteTemplateDialog
        template={templateToDelete}
        isOpen={Boolean(templateToDelete)}
        onClose={() => setTemplateToDelete(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
