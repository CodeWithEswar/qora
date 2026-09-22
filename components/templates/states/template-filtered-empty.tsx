"use client";

import React from "react";
import { EmptyState } from "@/components/empty-state";

interface TemplateFilteredEmptyProps {
  onClearFilters: () => void;
  queryType?: "filters" | "search";
}

export function TemplateFilteredEmpty({
  onClearFilters,
  queryType = "filters",
}: TemplateFilteredEmptyProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-6 sm:p-10 text-center max-w-md mx-auto my-8">
      <EmptyState
        variant="filtered"
        letter="T"
        title={queryType === "search" ? "No templates found" : "No templates match these filters"}
        description={
          queryType === "search"
            ? "Try another template name, QR payload type, or Brand Kit keyword."
            : "Try adjusting your type, governance, or Brand Kit filter criteria."
        }
        action={{
          label: queryType === "search" ? "Clear Search" : "Reset Filters",
          onClick: onClearFilters,
        }}
        className="py-0"
      />
    </div>
  );
}
