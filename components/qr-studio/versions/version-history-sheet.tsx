import * as React from "react";
import {
  History,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export interface VersionItem {
  id: string;
  versionNumber: number;
  changeSummary: string;
  createdAt: string;
  isCurrent: boolean;
  isPublished: boolean;
  author: {
    name: string;
    email: string;
  };
}

interface VersionHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  qrId: string;
  versions: VersionItem[];
  isLoading: boolean;
  onRestoreVersion: (versionNumber: number) => Promise<void>;
}

export function VersionHistorySheet({
  isOpen,
  onClose,
  qrId,
  versions,
  isLoading,
  onRestoreVersion,
}: VersionHistorySheetProps) {
  const [restoringVersion, setRestoringVersion] = React.useState<number | null>(null);

  const handleRestore = async (ver: number) => {
    setRestoringVersion(ver);
    try {
      await onRestoreVersion(ver);
      onClose();
    } finally {
      setRestoringVersion(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 border-l border-border bg-surface flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-4 w-4" />
            <SheetTitle className="text-base font-semibold text-foreground">Immutable Version History</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Audit-grade record of published checkpoints. Restoring an older version creates a new working draft without mutating historical logs.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading version records…</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
              <History className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">No Saved Checkpoints Yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Click &ldquo;Save Version&rdquo; in the top bar to create an immutable snapshot.
              </p>
            </div>
          ) : (
            versions.map((ver) => {
              const isBusy = restoringVersion === ver.versionNumber;
              return (
                <div
                  key={ver.id}
                  className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 hover:border-border transition-colors space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">v{ver.versionNumber}</span>
                      {ver.isPublished && (
                        <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white text-[9px] uppercase tracking-wider px-1.5 py-0">
                          Live on Edge
                        </Badge>
                      )}
                      {ver.isCurrent && !ver.isPublished && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0">
                          Current Draft
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(ver.versionNumber)}
                      disabled={isBusy}
                      className="h-7 text-[11px] gap-1 hover:text-primary hover:border-primary/40 cursor-pointer"
                      title="Create a new draft based on this version"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      <span>Restore</span>
                    </Button>
                  </div>

                  <p className="text-foreground font-medium text-xs">{ver.changeSummary}</p>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ver.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(ver.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
