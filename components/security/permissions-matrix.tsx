"use client";

import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Users,
  Check,
  Minus,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SYSTEM_ROLE_PERMISSIONS,
  SystemRoleName,
  PermissionCode,
} from "@nxtqr/contracts";

interface PermissionCategory {
  category: string;
  description: string;
  items: {
    code: PermissionCode;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionCategory[] = [
  {
    category: "Organization & Governance",
    description: "Manage root tenant configuration, audit trails, and custom role assignments",
    items: [
      { code: "organization.read", label: "View Organization", description: "View workspace metadata and tenant settings" },
      { code: "organization.update", label: "Update Organization", description: "Edit workspace name, security policies, and slug" },
      { code: "audit.read", label: "Audit Log Access", description: "Inspect immutable security audit event stream" },
    ],
  },
  {
    category: "Members, Teams & Roles",
    description: "Identity and access control boundaries within the organization",
    items: [
      { code: "members.read", label: "View Members", description: "List organization members and pending invites" },
      { code: "members.invite", label: "Invite Members", description: "Issue hashed invitation tokens to new collaborators" },
      { code: "members.remove", label: "Remove Members", description: "Revoke membership (protected against last owner)" },
      { code: "teams.create", label: "Manage Teams", description: "Create, update, and delete scoped team units" },
      { code: "roles.assign", label: "Assign Roles", description: "Promote, demote, and modify member role bindings" },
    ],
  },
  {
    category: "QR Lifecycle & Publishing",
    description: "Core QR asset lifecycle from creation to live edge publication",
    items: [
      { code: "qr.read", label: "View QRs", description: "Browse QR assets, studio states, and previews" },
      { code: "qr.create", label: "Create QRs", description: "Generate new dynamic QR records and studio drafts" },
      { code: "qr.update", label: "Edit QRs", description: "Update design parameters, frames, and styling" },
      { code: "qr.publish", label: "Publish Edge QR", description: "Authorize live KV snapshot publication and resolver state" },
      { code: "qr.delete", label: "Delete QRs", description: "Soft-delete or purge QR records and associated caches" },
    ],
  },
  {
    category: "QR Brain & Routing Engine",
    description: "Edge condition evaluation rules, experiments, and fallback graphs",
    items: [
      { code: "routing.read", label: "View Routing Rules", description: "Inspect geolocation, device, schedule, and experiment rules" },
      { code: "routing.update", label: "Edit Routing Rules", description: "Modify rule nodes, split ratios, and destination chains" },
      { code: "routing.publish", label: "Publish Routing Graph", description: "Push compiled edge routing rules to global edge resolvers" },
    ],
  },
  {
    category: "Analytics & Intelligence",
    description: "Scan telemetry, conversion events, and intelligence reports",
    items: [
      { code: "analytics.read", label: "View Analytics", description: "Access scan telemetry, geographic breakdown, and metrics" },
      { code: "analytics.export", label: "Export Telemetry", description: "Generate CSV / JSON raw intelligence extracts" },
      { code: "reports.create", label: "Generate Reports", description: "Compile scheduled and on-demand executive summaries" },
      { code: "reports.share", label: "Share Reports", description: "Generate hashed, expiring bearer share links" },
    ],
  },
  {
    category: "Link Guardian & Reliability",
    description: "Edge health probing, destination safety, and automated circuit breaking",
    items: [
      { code: "guardian.read", label: "View Guardian", description: "Monitor destination health status and incident logs" },
      { code: "guardian.manage", label: "Guardian Controls", description: "Recheck URLs, configure failovers, and acknowledge incidents" },
    ],
  },
  {
    category: "Developer Platform & Webhooks",
    description: "Programmatic API keys, scoped tokens, and outbound event subscriptions",
    items: [
      { code: "api_keys.read", label: "View API Keys", description: "Inspect active key prefixes and usage telemetry" },
      { code: "api_keys.manage", label: "Manage API Keys", description: "Create scoped tokens and revoke compromised credentials" },
      { code: "webhooks.manage", label: "Manage Webhooks", description: "Configure outbound endpoints, test events, and secret rotation" },
    ],
  },
  {
    category: "Domains & Commerce",
    description: "Custom branding domains and enterprise subscription management",
    items: [
      { code: "domains.manage", label: "Custom Domains", description: "Add, verify DNS CNAME, and activate branded domains" },
      { code: "billing.manage", label: "Manage Subscriptions", description: "Access Cashfree checkout, manage seats, and view invoices" },
    ],
  },
];

const ROLES: { name: SystemRoleName; badgeColor: string; description: string }[] = [
  { name: "Owner", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20", description: "Unrestricted workspace control, billing authority & owner protection" },
  { name: "Admin", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20", description: "Full operational authority across members, policies, and developers" },
  { name: "Manager", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20", description: "Can create, publish, configure routing, and export reports" },
  { name: "Editor", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", description: "Create and update drafts; cannot publish to edge or modify settings" },
  { name: "Analyst", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", description: "Read-only access to analytics, reports, campaigns, and telemetry exports" },
  { name: "Viewer", badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", description: "Auditor access: view dashboard, preview QRs, and read-only telemetry" },
];

export function PermissionsMatrix({ orgSlug }: { orgSlug: string }) {
  const [selectedRole, setSelectedRole] = React.useState<SystemRoleName>("Owner");

  return (
    <div className="space-y-8">
      {/* Control Plane Architectural Header */}
      <Card className="border-border/60 bg-gradient-to-r from-card via-card/80 to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">Server-Enforced RBAC</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Five-Part Server Authorization Decision</h3>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                NXTQR evaluates <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">ALLOW = Authenticated Actor ∧ Membership ∧ RBAC ∧ Plan Entitlement ∧ Org Policy ∧ Tenant Ownership</code> on every mutation. The browser is never the authorization authority.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto bg-muted/40 p-3 rounded-lg border border-border/50">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div className="text-xs">
                <div className="font-medium text-foreground">Last-Owner Protection</div>
                <div className="text-muted-foreground">Demotion or removal of the last active owner is rejected server-side.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.name;
          const permCount = SYSTEM_ROLE_PERMISSIONS[r.name]?.length || 0;
          return (
            <button
              key={r.name}
              onClick={() => setSelectedRole(r.name)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden ${
                isSelected
                  ? "bg-primary/5 border-primary/40 shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                  : "bg-card/60 border-border/50 hover:bg-muted/30 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-foreground">{r.name}</span>
                <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0 ${r.badgeColor}`}>
                  {permCount}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                {r.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Role Detail Banner */}
      <div className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{selectedRole} Role Policy</span>
              <span className="text-xs text-muted-foreground font-mono">system.role.{selectedRole.toLowerCase()}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {ROLES.find((r) => r.name === selectedRole)?.description}
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Assigned across active memberships in <span className="text-foreground">{orgSlug}</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="space-y-6">
        {PERMISSION_GROUPS.map((group) => (
          <Card key={group.category} className="border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/15 border-b border-border/40 py-3.5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground tracking-wide">
                    {group.category}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {group.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {group.items.length} permissions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-muted/10 text-[11px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border/30">
                      <th className="py-2.5 px-6 font-medium">Capability</th>
                      <th className="py-2.5 px-6 font-medium">System Permission Key</th>
                      {ROLES.map((r) => (
                        <th
                          key={r.name}
                          className={`py-2.5 px-4 text-center font-medium ${
                            selectedRole === r.name ? "text-primary bg-primary/5" : ""
                          }`}
                        >
                          {r.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {group.items.map((item) => {
                      return (
                        <tr key={item.code} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-6">
                            <div className="font-medium text-foreground text-xs">{item.label}</div>
                            <div className="text-[11px] text-muted-foreground">{item.description}</div>
                          </td>
                          <td className="py-3 px-6 font-mono text-[11px] text-muted-foreground">
                            <code>{item.code}</code>
                          </td>
                          {ROLES.map((r) => {
                            const hasPermission = SYSTEM_ROLE_PERMISSIONS[r.name]?.includes(item.code);
                            const isCurrentSelected = selectedRole === r.name;
                            return (
                              <td
                                key={r.name}
                                className={`py-3 px-4 text-center ${
                                  isCurrentSelected ? "bg-primary/5" : ""
                                }`}
                              >
                                {hasPermission ? (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Check className="h-3 w-3" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center h-5 w-5 text-muted-foreground/30">
                                    <Minus className="h-3 w-3" />
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
