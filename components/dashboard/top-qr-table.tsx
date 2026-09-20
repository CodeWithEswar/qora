"use client";

import * as React from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  ExternalLink,
  Edit2,
  BarChart2,
  Copy,
  Download,
  Archive,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QrTypeIcon, resolveQrTypeFromMetadata, cleanDomainFromUrl } from "@/components/icons/qr-type-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";

export interface TopQRCode {
  id: string;
  name: string;
  shortCode: string;
  type: "Dynamic" | "Static";
  qrType?: string;
  destination: string;
  campaign: string;
  scans: number;
  uniqueScans: number;
  status: "active" | "draft" | "paused" | "expired";
  updatedAt: string;
  owner: {
    name: string;
    avatar: string;
  };
}

export interface TopQRTableProps {
  orgSlug: string;
  initialItems?: TopQRCode[];
}

export function TopQRTable({ orgSlug, initialItems = [] }: TopQRTableProps) {
  const [items, setItems] = React.useState<TopQRCode[]>(initialItems);
  const [isLoading, setIsLoading] = React.useState<boolean>(initialItems.length === 0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchQrs = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/qrs?limit=50", {
        headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.warn("[TopQRTable] Unable to fetch QR assets from API:", res.status, errJson);
        return;
      }
      const json = await res.json();
      const records = json.data || [];
      const mapped: TopQRCode[] = records.map((q: any) => ({
        id: q.id,
        name: q.name || "Untitled QR",
        shortCode: q.slug || q.id,
        type: q.mode === "static" ? "Static" : "Dynamic",
        qrType: q.type || q.qrType || "url",
        destination: q.destinationUrl || "https://nxtqr.vercel.app",
        campaign: q.campaignId || "General",
        scans: q.scans ?? 0,
        uniqueScans: q.uniqueScans ?? 0,
        status: (q.status || "ACTIVE").toLowerCase() as any,
        updatedAt: q.updatedAt || new Date().toISOString(),
        owner: {
          name: "Admin",
          avatar: "",
        },
      }));
      setItems(mapped);
    } catch (err: any) {
      console.warn("[TopQRTable] Error loading QRs:", err?.message || err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orgSlug]);

  React.useEffect(() => {
    fetchQrs();
  }, [fetchQrs]);

  const handleCopyLink = (shortCode: string) => {
    const fullUrl = `https://nxtqr.vercel.app/s/${shortCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      toast.success("Short link copied to clipboard!", { description: fullUrl });
    }
  };

  const handleArchive = async (qr: TopQRCode) => {
    try {
      const res = await fetch(`/api/v1/qrs/${qr.id}`, {
        method: "DELETE",
        headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
      });
      if (res.ok) {
        toast.success(`Archived ${qr.name}`);
        setItems((prev) => prev.filter((item) => item.id !== qr.id));
      } else {
        toast.error("Failed to archive QR code");
      }
    } catch {
      toast.error("Network error archiving QR");
    }
  };

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Top Performing QR Codes</CardTitle>
          <CardDescription>Most actively scanned campaigns in the current billing cycle</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => fetchQrs(true)}
            disabled={isLoading || isRefreshing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Refresh QR list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>

          {items.length > 0 && (
            <Button variant="outline" size="sm" asChild className="text-xs h-8">
              <Link href={`/${orgSlug}/qr`}>
                <span>View All ({items.length})</span>
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={items.length === 0 && !isLoading ? "p-6" : "p-0"}>
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-muted/60 animate-pulse shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
                      <div className="h-3 w-20 bg-muted/40 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-28 bg-muted/40 animate-pulse rounded hidden md:block" />
                  <div className="h-4 w-16 bg-muted/40 animate-pulse rounded" />
                  <div className="h-6 w-16 bg-muted/50 animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            preset="qrCodes"
            actionHref={`/${orgSlug}/qr/studio?create=true`}
            variant="table"
            className="border-none bg-transparent"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-y border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 pl-5 pr-3 font-medium">QR Code</th>
                  <th className="px-3 py-2.5 font-medium hidden md:table-cell">Campaign</th>
                  <th className="px-3 py-2.5 font-medium">Destination</th>
                  <th className="px-3 py-2.5 font-medium text-right">Scans</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium hidden lg:table-cell">Owner</th>
                  <th className="py-2.5 pl-3 pr-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((qr) => {
                  const domainInfo = cleanDomainFromUrl(qr.destination);
                  const iconType = resolveQrTypeFromMetadata(qr);
                  return (
                    <tr
                      key={qr.id}
                      className="hover:bg-surface-hover/60 transition-colors group"
                    >
                      {/* QR Preview & Name */}
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/${orgSlug}/qr/studio?id=${qr.id}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/40 text-foreground p-1.5 shadow-2xs hover:border-primary/50 hover:bg-muted/80 transition-all hover:scale-105"
                            title={`Open ${qr.name} (${domainInfo.displayName}) in QR Studio`}
                          >
                            <QrTypeIcon
                              type={iconType}
                              domain={domainInfo.cleanDomain}
                              faviconUrl={domainInfo.faviconUrl}
                              size={20}
                              tone="brand"
                            />
                          </Link>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/${orgSlug}/qr/studio?id=${qr.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[200px]"
                            >
                              {qr.name}
                            </Link>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {qr.shortCode}
                            </span>
                          </div>
                        </div>
                      </td>

                    {/* Campaign */}
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground border border-border/80">
                        {qr.campaign}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="px-3 py-3 max-w-[160px] sm:max-w-[220px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="h-4.5 w-4.5 shrink-0 rounded-xs border border-border/70 bg-neutral-100/70 dark:bg-[#1a1a1a] flex items-center justify-center p-0.5 overflow-hidden shadow-3xs">
                          <QrTypeIcon
                            type={domainInfo.brandKey || "url"}
                            domain={domainInfo.cleanDomain}
                            faviconUrl={domainInfo.faviconUrl}
                            size={12}
                            tone="brand"
                          />
                        </div>
                        <span
                          className="text-[11px] text-muted-foreground truncate font-mono hover:text-foreground transition-colors"
                          title={qr.destination}
                        >
                          {domainInfo.cleanDomain || qr.destination}
                        </span>
                      </div>
                    </td>

                    {/* Scans (Tabular) */}
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-foreground">
                      {qr.scans.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3">
                      <StatusBadge status={qr.status} />
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5" title={qr.owner.name}>
                        <Avatar className="h-5 w-5 border border-border">
                          <AvatarImage src={qr.owner.avatar} alt={qr.owner.name} />
                          <AvatarFallback className="text-[9px]">
                            {qr.owner.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[90px]">
                          {qr.owner.name}
                        </span>
                      </div>
                    </td>

                    {/* Actions Dropdown */}
                    <td className="py-3 pl-3 pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            className="opacity-60 group-hover:opacity-100 hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <a
                              href={qr.destination}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              <span>Test Destination</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/${orgSlug}/qr/studio?id=${qr.id}`} className="cursor-pointer">
                              <Edit2 className="mr-2 h-3.5 w-3.5" />
                              <span>Edit Style & Link</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/${orgSlug}/analytics?qr=${qr.id}`} className="cursor-pointer">
                              <BarChart2 className="mr-2 h-3.5 w-3.5" />
                              <span>View Analytics</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCopyLink(qr.shortCode)}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            <span>Copy Short Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/${orgSlug}/qr/studio?id=${qr.id}&export=true`} className="cursor-pointer">
                              <Download className="mr-2 h-3.5 w-3.5" />
                              <span>Export Formats (SVG/PDF)</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer"
                            onClick={() => handleArchive(qr)}
                          >
                            <Archive className="mr-2 h-3.5 w-3.5" />
                            <span>Archive QR</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
