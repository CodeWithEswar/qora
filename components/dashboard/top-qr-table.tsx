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
  Share2,
  Trash2,
  Archive,
  QrCode,
  ArrowUpRight,
} from "lucide-react";
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
import { TOP_QR_CODES, TopQRCode } from "@/lib/mock-data/dashboard";
import { QRFinderPattern } from "@/components/shared/qr-decor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopQRTable({ orgSlug }: { orgSlug: string }) {
  const [items] = React.useState<TopQRCode[]>(TOP_QR_CODES);

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Top Performing QR Codes</CardTitle>
          <CardDescription>Most actively scanned campaigns in the current billing cycle</CardDescription>
        </div>

        <Button variant="outline" size="sm" asChild className="text-xs h-8">
          <Link href={`/${orgSlug}/qr`}>
            <span>View All (42)</span>
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
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
              {items.map((qr) => (
                <tr
                  key={qr.id}
                  className="hover:bg-surface-hover/60 transition-colors group"
                >
                  {/* QR Preview & Name */}
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-elevated text-primary p-1 shadow-2xs">
                        <QRFinderPattern size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/${orgSlug}/qr`}
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
                  <td className="px-3 py-3 max-w-[140px] sm:max-w-[180px]">
                    <span
                      className="text-[11px] text-muted-foreground truncate block hover:text-foreground"
                      title={qr.destination}
                    >
                      {qr.destination}
                    </span>
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
                      <DropdownMenuContent align="end" className="w-44">
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
                          <Link href={`/${orgSlug}/qr/studio?edit=${qr.id}`} className="cursor-pointer">
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
                          onClick={() => navigator.clipboard?.writeText(qr.shortCode)}
                          className="cursor-pointer"
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          <span>Copy Short Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => alert(`Downloading SVG for ${qr.name}`)}
                          className="cursor-pointer"
                        >
                          <Download className="mr-2 h-3.5 w-3.5" />
                          <span>Download SVG</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer"
                          onClick={() => alert(`Archiving ${qr.name}`)}
                        >
                          <Archive className="mr-2 h-3.5 w-3.5" />
                          <span>Archive QR</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
