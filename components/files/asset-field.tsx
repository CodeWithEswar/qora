"use client";

import React from "react";
import type { FileSummaryV1 } from "@nxtqr/contracts";
import { FileTile } from "./file-tile";

interface AssetFieldProps {
  files: FileSummaryV1[];
  selectedFileId: string | null;
  onSelect: (file: FileSummaryV1) => void;
  onPreview: (file: FileSummaryV1) => void;
  onRename: (file: FileSummaryV1) => void;
  onViewUsage: (file: FileSummaryV1) => void;
  onReplace: (file: FileSummaryV1) => void;
  onArchive: (file: FileSummaryV1) => void;
  onDelete: (file: FileSummaryV1) => void;
}

export function AssetField({
  files,
  selectedFileId,
  onSelect,
  onPreview,
  onRename,
  onViewUsage,
  onReplace,
  onArchive,
  onDelete,
}: AssetFieldProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {files.map((file) => (
        <FileTile
          key={file.id}
          file={file}
          isSelected={selectedFileId === file.id}
          onSelect={onSelect}
          onPreview={onPreview}
          onRename={onRename}
          onViewUsage={onViewUsage}
          onReplace={onReplace}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
