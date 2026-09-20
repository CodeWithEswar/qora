"use client";

import * as React from "react";
import { FolderResponseV1 } from "@nxtqr/contracts";
import { FolderTile } from "./folder-tile";
import { UnfiledTile } from "./unfiled-tile";
import { cn } from "@/lib/utils";

export interface FolderFieldProps {
  folders: FolderResponseV1[];
  unfiledQrsCount: number;
  orgSlug: string;
  onEdit?: (folder: FolderResponseV1) => void;
  onDelete?: (folder: FolderResponseV1) => void;
  onArchiveToggle?: (folder: FolderResponseV1) => void;
  className?: string;
}

export function FolderField({
  folders,
  unfiledQrsCount,
  orgSlug,
  onEdit,
  onDelete,
  onArchiveToggle,
  className,
}: FolderFieldProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5",
        className
      )}
    >
      {/* 1. First-Class Unfiled Surface Tile */}
      <UnfiledTile
        unfiledQrsCount={unfiledQrsCount}
        orgSlug={orgSlug}
      />

      {/* 2. Registered Folder Containment Tiles */}
      {folders.map((folder) => (
        <FolderTile
          key={folder.id}
          folder={folder}
          orgSlug={orgSlug}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchiveToggle={onArchiveToggle}
        />
      ))}
    </div>
  );
}
