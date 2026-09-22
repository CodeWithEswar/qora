"use client";

import React, { useState } from "react";
import { QrTemplateSummary } from "@/lib/domains/templates/types";
import { Icon } from "@iconify/react";

interface TemplateConstellationProps {
  templates: QrTemplateSummary[];
  onSelectTemplate?: (template: QrTemplateSummary) => void;
  className?: string;
}

export function TemplateConstellation({
  templates,
  onSelectTemplate,
  className = "",
}: TemplateConstellationProps) {
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);

  // Group real templates by Brand Kit
  const brandKitGroups = React.useMemo(() => {
    const map = new Map<string, { name: string; templates: QrTemplateSummary[]; colors?: string[] }>();

    templates.forEach((t) => {
      const key = t.brand_kit_id || "unassigned";
      const name = t.brand_kit_name || "NXTQR Core Design System";
      if (!map.has(key)) {
        map.set(key, {
          name,
          templates: [],
          colors: t.brand_kit_colors,
        });
      }
      map.get(key)!.templates.push(t);
    });

    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [templates]);

  if (templates.length === 0) {
    return null; // When empty, the true empty state hero handles page presentation
  }

  const activeTemplate = templates.find((t) => t.id === hoveredTemplateId);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-4 sm:p-6 backdrop-blur-sm ${className}`}
    >
      {/* Editorial Watermark / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
              <Icon icon="tabler:topology-star-3" className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Template Constellation
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive structural view of Brand Kits, governed templates, and QR payload compatibility.
          </p>
        </div>

        {activeTemplate && (
          <div className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-mono border border-border/60 animate-in fade-in duration-150">
            <span className="text-primary font-medium">{activeTemplate.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{activeTemplate.brand_kit_name || "Platform"}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-emerald-500 font-semibold">{activeTemplate.scanability_score}% Scan</span>
          </div>
        )}
      </div>

      {/* Constellation Tree Rendering */}
      <div className="space-y-6 pt-2">
        {brandKitGroups.map((group) => {
          const isGroupHovered = group.templates.some((t) => t.id === hoveredTemplateId);

          return (
            <div key={group.id} className="space-y-3">
              {/* Brand Kit Node */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded border transition-all ${
                    isGroupHovered
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-muted/40 text-foreground"
                  }`}
                >
                  <Icon icon="tabler:brand-visual-studio" className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    {group.name}
                  </span>
                  {group.colors && group.colors.length > 0 && (
                    <div className="flex items-center gap-1">
                      {group.colors.slice(0, 3).map((hex, idx) => (
                        <span
                          key={idx}
                          className="h-2 w-2 rounded-full border border-black/20 dark:border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  )}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ({group.templates.length} template{group.templates.length > 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Connected Templates and Types */}
              <div className="ml-3 pl-4 border-l-2 border-border/60 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {group.templates.map((template) => {
                    const isHovered = hoveredTemplateId === template.id;

                    return (
                      <div
                        key={template.id}
                        onMouseEnter={() => setHoveredTemplateId(template.id)}
                        onMouseLeave={() => setHoveredTemplateId(null)}
                        onClick={() => onSelectTemplate?.(template)}
                        className={`group relative flex items-center justify-between rounded-lg border p-2.5 text-xs transition-all cursor-pointer ${
                          isHovered
                            ? "border-primary/80 bg-primary/5 shadow-sm ring-1 ring-primary/40"
                            : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="h-3 w-3 rounded-full shrink-0 border"
                            style={{
                              backgroundColor: template.design_json.fgColor || "#1F1F1F",
                            }}
                          />
                          <div className="truncate">
                            <span className="font-medium text-foreground block truncate">
                              {template.name}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                              <span>v{template.current_version}</span>
                              <span>·</span>
                              <span>{template.compatibility[0] || "UNIVERSAL"}</span>
                              {template.is_brand_locked && (
                                <>
                                  <span>·</span>
                                  <span className="text-amber-500 font-semibold">LOCKED</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              template.scanability_status === "PASS"
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          >
                            {template.scanability_score}%
                          </span>
                          <Icon
                            icon="tabler:chevron-right"
                            className={`h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary ${
                              isHovered ? "text-primary" : ""
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
