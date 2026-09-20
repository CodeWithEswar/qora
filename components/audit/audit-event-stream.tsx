"use client";

import * as React from "react";
import {
  History,
  ShieldCheck,
  KeyRound,
  UserCheck,
  QrCode,
  CreditCard,
  Globe,
  SlidersHorizontal,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AuditLogEntry } from "@nxtqr/contracts";

interface AuditEventStreamProps {
  initialEntries?: AuditLogEntry[];
  orgSlug: string;
}

export function AuditEventStream({ initialEntries = [], orgSlug }: AuditEventStreamProps) {
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Real database records: zero fake data
  const entries: AuditLogEntry[] = React.useMemo(() => {
    return initialEntries;
  }, [initialEntries]);

  const filtered = entries.filter((e) => {
    if (filterCategory === "access" && !["ROLE_ASSIGNED", "ROLE_CREATED", "MEMBER_INVITED", "MEMBER_REMOVED"].includes(e.action)) {
      return false;
    }
    if (filterCategory === "keys" && !["API_KEY_CREATED", "API_KEY_REVOKED", "WEBHOOK_CREATED"].includes(e.action)) {
      return false;
    }
    if (filterCategory === "routing" && !["ROUTING_PUBLISHED", "ROUTING_CHANGED", "QR_PUBLISHED", "QR_DESTINATION_CHANGED"].includes(e.action)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.action.toLowerCase().includes(q) ||
        e.resourceId.toLowerCase().includes(q) ||
        e.actorId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionIcon = (type: string) => {
    switch (type) {
      case "api_key": return <KeyRound className="h-4 w-4 text-primary" />;
      case "role":
      case "member": return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case "qr":
      case "route": return <QrCode className="h-4 w-4 text-amber-500" />;
      case "billing": return <CreditCard className="h-4 w-4 text-sky-500" />;
      case "domain": return <Globe className="h-4 w-4 text-indigo-500" />;
      default: return <ShieldCheck className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border w-fit text-xs font-medium">
          {[
            { id: "all", label: "All Events" },
            { id: "access", label: "Access & Roles" },
            { id: "keys", label: "API Keys" },
            { id: "routing", label: "QR & Brain" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterCategory === tab.id
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action or resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-background border border-input rounded-md pl-8 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Security Event Stream */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <EmptyState
            preset="audit"
            title="No audit logs yet"
            description="Meaningful security and organization audit events will appear here."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <EmptyState
            preset="search"
            title={searchQuery ? `No audit events found for "${searchQuery}"` : "No audit events match these filters"}
            description={searchQuery ? "Try checking for typos or searching for a different keyword." : "Adjust your selected category to view more events."}
            action={{
              label: searchQuery ? "Clear search" : "Clear filters",
              onClick: () => {
                setSearchQuery("");
                setFilterCategory("all");
              },
            }}
          />
        </div>
      ) : (
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-foreground">
                Forensic Security Event Stream
              </CardTitle>
              <span className="font-mono text-[11px] text-muted-foreground">
                Immutable Ledger • {filtered.length} Events
              </span>
            </div>
          </CardHeader>
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted/60 border border-border shrink-0 mt-0.5">
                    {getActionIcon(item.resourceType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground tracking-wide font-mono text-[11px]">
                        {item.action}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">
                        {item.resourceType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                      <span>Resource:</span>
                      <span className="font-mono text-foreground">{item.resourceId}</span>
                      <span>•</span>
                      <span>Actor:</span>
                      <span className="font-mono text-primary">{item.actorId}</span>
                    </div>
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="font-mono text-[10px] text-muted-foreground bg-muted/40 px-2 py-1 rounded w-fit mt-1">
                        {JSON.stringify(item.metadata)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 self-end sm:self-center font-mono text-[11px] text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                  UTC
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
