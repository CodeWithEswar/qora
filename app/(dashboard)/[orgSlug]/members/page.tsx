import * as React from "react";
import { Users, UserPlus, Shield, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const members = [
    {
      name: "Alex Rivera",
      email: "alex@acme.com",
      role: "Workspace Owner",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    },
    {
      name: "Jordan Lee",
      email: "jordan@acme.com",
      role: "Admin",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
    },
    {
      name: "Maya Chen",
      email: "maya@acme.com",
      role: "Campaign Designer",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    },
    {
      name: "Sarah Vance",
      email: "sarah@acme.com",
      role: "Analyst",
      status: "Pending Invite",
      avatar: "",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Acme Corp", href: `/${orgSlug}` },
          { label: "Members" },
        ]}
        title="Team Members & Roles"
        description="Invite collaborators, assign fine-grained roles, and manage workspace permissions."
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite Member</span>
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Workspace Members ({members.length})</span>
          <span className="text-xs text-muted-foreground">14 of 20 seats assigned</span>
        </div>

        <div className="divide-y divide-border/60">
          {members.map((m) => (
            <div key={m.email} className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-hover/60 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border">
                  {m.avatar ? <AvatarImage src={m.avatar} alt={m.name} /> : null}
                  <AvatarFallback className="text-xs font-semibold">{m.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={m.role === "Workspace Owner" ? "indigo" : "secondary"}>
                  {m.role}
                </Badge>
                <span className="text-muted-foreground text-[11px]">{m.status}</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
