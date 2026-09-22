"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANONICAL_OPERATIONAL_DOMAINS } from "@/lib/supabase/types/teams";
import type {
  TeamDetail,
  TeamAccessDomain,
  AccessDomainLevel,
} from "@/lib/supabase/types/teams";
import { AlertCircle } from "lucide-react";

interface ManageTeamAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamDetail | null;
  onSave: (teamId: string, accessDomains: TeamAccessDomain[]) => Promise<void>;
}

export function ManageTeamAccessDialog({
  isOpen,
  onClose,
  team,
  onSave,
}: ManageTeamAccessDialogProps) {
  const [domains, setDomains] = React.useState<TeamAccessDomain[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (team && isOpen) {
      // Initialize with existing or canonical default domains
      const currentMap = new Map(team.accessDomains.map((ad) => [ad.domain, ad.level]));
      const initialized = CANONICAL_OPERATIONAL_DOMAINS.map((cd) => ({
        domain: cd.domain,
        level: currentMap.get(cd.domain) || "NONE",
      }));
      setDomains(initialized);
      setError(null);
    }
  }, [team, isOpen]);

  if (!team) return null;

  const updateLevel = (domain: string, level: AccessDomainLevel) => {
    setDomains((prev) =>
      prev.map((item) => (item.domain === domain ? { ...item, level } : item))
    );
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(team.id, domains);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update team access.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-background text-foreground border border-border/80 p-6 font-mono text-xs">
        <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            ACCESS GOVERNANCE / FOOTPRINT
          </div>
          <DialogTitle className="text-base font-bold text-foreground font-sans">
            Configure {team.name} Access Footprint
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Define the operational capability levels granted through this team lane.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {domains.map((ad) => (
              <div
                key={ad.domain}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/70 bg-surface/50"
              >
                <div>
                  <p className="font-semibold text-xs text-foreground uppercase">{ad.domain}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {CANONICAL_OPERATIONAL_DOMAINS.find((c) => c.domain === ad.domain)?.description ||
                      "Operational access domain"}
                  </p>
                </div>

                <div className="w-32 shrink-0">
                  <Select
                    value={ad.level}
                    onValueChange={(val) => updateLevel(ad.domain, val as AccessDomainLevel)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-surface font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">FULL</SelectItem>
                      <SelectItem value="MANAGE">MANAGE</SelectItem>
                      <SelectItem value="VIEW">VIEW</SelectItem>
                      <SelectItem value="NONE">NONE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleConfirm}
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-white font-mono"
          >
            {isSaving ? "Saving Footprint..." : "Save Access Footprint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
