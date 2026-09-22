"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { TeamResourceAssignment } from "@/lib/supabase/types/teams";
import { formatDate } from "@/lib/utils";
import { QrCode, Sparkles, Palette, Folder, Globe, Link2, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceRelationshipRowProps {
  assignment: TeamResourceAssignment;
  canManage?: boolean;
  onDisconnectClick: (assignment: TeamResourceAssignment) => void;
}

export function ResourceRelationshipRow({
  assignment,
  canManage = true,
  onDisconnectClick,
}: ResourceRelationshipRowProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "qr_code":
        return <QrCode className="h-4 w-4 text-primary" />;
      case "campaign":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "brand_kit":
        return <Palette className="h-4 w-4 text-indigo-500" />;
      case "folder":
        return <Folder className="h-4 w-4 text-blue-500" />;
      case "domain":
        return <Globe className="h-4 w-4 text-teal-500" />;
      default:
        return <Link2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatResourceType = (type: string) => {
    switch (type) {
      case "qr_code":
        return "QR CODE";
      case "campaign":
        return "CAMPAIGN";
      case "brand_kit":
        return "BRAND KIT";
      case "folder":
        return "FOLDER";
      case "domain":
        return "DOMAIN";
      case "template":
        return "TEMPLATE";
      default:
        return type.toUpperCase();
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-surface-hover/80 transition-colors h-14 font-mono text-xs">
      {/* Column 1: Resource Title & Ref */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border/70 flex items-center justify-center shrink-0">
            {getResourceIcon(assignment.resourceType)}
          </div>
          <div className="truncate">
            <span className="font-semibold text-foreground font-sans truncate block text-xs">
              {assignment.title}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block">
              {assignment.ref}
            </span>
          </div>
        </div>
      </td>

      {/* Column 2: Resource Type */}
      <td className="px-4 py-2.5">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {formatResourceType(assignment.resourceType)}
        </span>
      </td>

      {/* Column 3: Relationship Type */}
      <td className="px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span className="uppercase text-[10px]">
            {assignment.relationshipType || "RESPONSIBLE"}
          </span>
        </span>
      </td>

      {/* Column 4: Connected Date */}
      <td className="px-4 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
        {formatDate(assignment.createdAt)}
      </td>

      {/* Column 5: Actions */}
      <td className="px-4 py-2.5 text-right">
        {canManage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDisconnectClick(assignment)}
            className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer text-xs"
            title={`Disconnect ${assignment.title} from team`}
          >
            <Unlink className="h-3.5 w-3.5 mr-1" />
            <span>Disconnect</span>
          </Button>
        )}
      </td>
    </tr>
  );
}
