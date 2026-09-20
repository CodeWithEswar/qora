"use client";

import * as React from "react";
import Link from "next/link";
import { RoutingRule } from "@nxtqr/contracts";
import { Route, ExternalLink, ArrowRight, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoutingAssetItem } from "../types";

interface EnrichedRuleItem {
  rule: RoutingRule;
  qrAsset: RoutingAssetItem;
}

interface RoutingRulesTableProps {
  assets: RoutingAssetItem[];
  orgSlug: string;
  onInspectRule: (rule: RoutingRule, asset: RoutingAssetItem) => void;
}

export function RoutingRulesTable({
  assets,
  orgSlug,
  onInspectRule,
}: RoutingRulesTableProps) {
  // Aggregate all rules across all assets
  const enrichedRules: EnrichedRuleItem[] = React.useMemo(() => {
    const list: EnrichedRuleItem[] = [];
    for (const asset of assets) {
      for (const rule of asset.rules || []) {
        list.push({ rule, qrAsset: asset });
      }
    }
    // Sort by asset name then priority
    return list.sort((a, b) => {
      if (a.qrAsset.name !== b.qrAsset.name) {
        return a.qrAsset.name.localeCompare(b.qrAsset.name);
      }
      return a.rule.priority - b.rule.priority;
    });
  }, [assets]);

  if (enrichedRules.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FA520F]/10 border border-[#FA520F]/20 flex items-center justify-center mx-auto text-[#FA520F]">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-semibold text-[#F7F4EC]">
            No Routing Rules Configured
          </h3>
          <p className="text-xs text-[#85827B]">
            None of your Dynamic QR codes currently have conditional routing rules. All scans route to default destinations.
          </p>
        </div>
        {assets.length > 0 && (
          <Button
            asChild
            size="sm"
            className="text-xs bg-[#FA520F] hover:bg-[#d9440a] text-white"
          >
            <Link href={`/${orgSlug}/qr/${assets[0].id}/brain`}>
              Configure QR Brain for {assets[0].name}
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141414] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#F7F4EC]">
            Active Edge Decision Branches
          </h3>
          <p className="text-xs text-[#85827B]">
            All ordered rules evaluated across your published dynamic routing policies.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-[11px] border-white/10 text-[#85827B]">
          {enrichedRules.length} Total Rules
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#111111] border-b border-white/[0.08]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Priority
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Rule Name
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Target QR Asset
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Conditions
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Match Type
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B] min-w-[200px]">
                Target Destination
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/[0.06]">
            {enrichedRules.map(({ rule, qrAsset }) => (
              <TableRow
                key={`${qrAsset.id}_${rule.id}`}
                className="hover:bg-[#18181c] transition-colors border-none"
              >
                <TableCell className="py-3 font-mono text-xs text-[#FA520F] font-bold">
                  #{rule.priority}
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs font-semibold text-[#F7F4EC]">
                    {rule.name}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#B8B5AD]">{qrAsset.name}</span>
                    <span className="text-[10px] font-mono text-[#85827B]">
                      (/{qrAsset.slug})
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {(rule.conditions || []).map((cond, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1b1b1f] border border-white/10 text-[#F7F4EC]"
                      >
                        {cond.type} {cond.operator} {String(cond.value)}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      rule.matchType === "ALL"
                        ? "bg-[#FA520F]/10 border-[#FA520F]/30 text-[#FA520F]"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    }`}
                  >
                    {rule.matchType}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs font-mono text-[#B8B5AD] truncate block max-w-[240px]">
                    {rule.action?.destinationUrl}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onInspectRule(rule, qrAsset)}
                      className="h-7 text-xs text-[#85827B] hover:text-[#F7F4EC] hover:bg-white/5 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[#FA520F] hover:text-[#FA520F] hover:bg-[#FA520F]/10"
                    >
                      <Link href={`/${orgSlug}/qr/${qrAsset.id}/brain`}>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
