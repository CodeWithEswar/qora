"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QR_STATUS_ENUM } from "@nxtqr/contracts";

export interface FilterSheetState {
  status?: string;
  qrType?: string;
  campaignId?: string;
  ownerId?: string;
  sortBy?: "updatedAt" | "createdAt" | "name" | "totalScans";
  order?: "asc" | "desc";
}

export interface CampaignOption {
  id: string;
  name: string;
}

export interface MemberOption {
  id: string;
  name: string;
  email?: string;
}

export interface QrFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterSheetState;
  campaigns?: CampaignOption[];
  members?: MemberOption[];
  onApply: (filters: FilterSheetState) => void;
  onReset: () => void;
}

export function QrFilterSheet({
  open,
  onOpenChange,
  filters,
  campaigns = [],
  members = [],
  onApply,
  onReset,
}: QrFilterSheetProps) {
  const [draft, setDraft] = React.useState<FilterSheetState>(filters);

  React.useEffect(() => {
    setDraft(filters);
  }, [filters, open]);

  const qrTypes = [
    { value: "ALL", label: "All QR Types" },
    { value: "url", label: "Website / URL" },
    { value: "vcard", label: "Contact (vCard)" },
    { value: "wifi", label: "Wi-Fi Network" },
    { value: "pdf", label: "PDF Document" },
    { value: "app", label: "App Store Link" },
    { value: "text", label: "Plain Text" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email Message" },
    { value: "payment", label: "UPI / Payment" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col justify-between p-6 bg-white dark:bg-[#151515] border-l border-border/80"
      >
        <div className="space-y-6">
          <SheetHeader className="text-left space-y-1 pr-10 sm:pr-12">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[1px] bg-primary" />
              <SheetTitle className="font-serif text-lg tracking-tight">
                Filter QR Codes
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Narrow your workspace operational view by lifecycle, type, or assignment.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 pt-2">
            {/* 1. Lifecycle Status */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Lifecycle Status
              </Label>
              <Select
                value={draft.status || "ALL"}
                onValueChange={(val) =>
                  setDraft((prev) => ({ ...prev, status: val === "ALL" ? undefined : val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {QR_STATUS_ENUM.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. QR Type */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                QR Type
              </Label>
              <Select
                value={draft.qrType || "ALL"}
                onValueChange={(val) =>
                  setDraft((prev) => ({ ...prev, qrType: val === "ALL" ? undefined : val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {qrTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Campaign */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Campaign
              </Label>
              <Select
                value={draft.campaignId || "ALL"}
                onValueChange={(val) =>
                  setDraft((prev) => ({
                    ...prev,
                    campaignId: val === "ALL" ? undefined : val,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Campaigns</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Owner */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Owner
              </Label>
              <Select
                value={draft.ownerId || "ALL"}
                onValueChange={(val) =>
                  setDraft((prev) => ({
                    ...prev,
                    ownerId: val === "ALL" ? undefined : val,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Members</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name || m.email || m.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 5. Sort Order */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Sort By
              </Label>
              <Select
                value={`${draft.sortBy || "updatedAt"}_${draft.order || "desc"}`}
                onValueChange={(val) => {
                  const [sortBy, order] = val.split("_");
                  setDraft((prev) => ({
                    ...prev,
                    sortBy: sortBy as any,
                    order: order as any,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Recently updated" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt_desc">Recently updated</SelectItem>
                  <SelectItem value="createdAt_desc">Recently created</SelectItem>
                  <SelectItem value="name_asc">Name (A &rarr; Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z &rarr; A)</SelectItem>
                  <SelectItem value="totalScans_desc">Most scanned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row items-center justify-between gap-3 pt-6 border-t border-border/80 sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onReset();
              onOpenChange(false);
            }}
          >
            Reset all
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-primary hover:bg-[#cc3a05] text-white"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              Apply filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
