import * as React from "react";
import { Cpu, QrCode, ShieldCheck, UserPlus, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  time: string;
  type: "qr_create" | "brain_route" | "guardian_check" | "member_invite" | "campaign_update";
}

export interface RecentActivityProps {
  orgSlug: string;
  items?: ActivityItem[];
}

export function RecentActivity({ orgSlug, items = [] }: RecentActivityProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "brain_route":
        return <Cpu className="h-3 w-3 text-indigo-500" />;
      case "qr_create":
        return <QrCode className="h-3 w-3 text-primary" />;
      case "guardian_check":
        return <ShieldCheck className="h-3 w-3 text-emerald-500" />;
      case "member_invite":
        return <UserPlus className="h-3 w-3 text-amber-500" />;
      default:
        return <QrCode className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card className="col-span-full md:col-span-6 xl:col-span-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Workspace Activity</CardTitle>
        <CardDescription>Real-time audit log of actions by team and autonomous agents</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-1">
        {items.length === 0 ? (
          <EmptyState
            preset="activity"
            variant="card"
            className="border-none bg-transparent p-4"
          />
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-xs group">
              <div className="relative mt-0.5">
                <Avatar className="h-7 w-7 border border-border">
                  {item.user.avatar ? (
                    <AvatarImage src={item.user.avatar} alt={item.user.name} />
                  ) : null}
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {item.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface border border-border">
                  {getIcon(item.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-foreground leading-relaxed">
                  <span className="font-semibold">{item.user.name}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>{" "}
                  <span className="font-medium text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
                    {item.target}
                  </span>
                </p>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  {item.time}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
