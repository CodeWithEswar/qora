"use client";

import * as React from "react";
import { Bell, Save, Mail, ShieldAlert, Newspaper, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  WorkspaceControlPlaneOverview,
  WorkspaceNotificationPreferences,
  UpdateWorkspaceNotificationsRequest,
} from "@nxtqr/contracts";

interface NotificationsSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onSave: (payload: UpdateWorkspaceNotificationsRequest) => Promise<void>;
  isSaving: boolean;
}

export function NotificationsSection({
  overview,
  onSave,
  isSaving,
}: NotificationsSectionProps) {
  const { notificationPreferences, userPermissions } = overview;

  const [inApp, setInApp] = React.useState(notificationPreferences.inApp);
  const [email, setEmail] = React.useState(notificationPreferences.email);
  const [securityAlerts, setSecurityAlerts] = React.useState(notificationPreferences.securityAlerts);
  const [weeklyDigest, setWeeklyDigest] = React.useState(notificationPreferences.weeklyDigest);

  React.useEffect(() => {
    setInApp(notificationPreferences.inApp);
    setEmail(notificationPreferences.email);
    setSecurityAlerts(notificationPreferences.securityAlerts);
    setWeeklyDigest(notificationPreferences.weeklyDigest);
  }, [notificationPreferences]);

  const hasChanges =
    inApp !== notificationPreferences.inApp ||
    email !== notificationPreferences.email ||
    securityAlerts !== notificationPreferences.securityAlerts ||
    weeklyDigest !== notificationPreferences.weeklyDigest;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSaving || !userPermissions.canUpdate) return;

    await onSave({
      notificationPreferences: {
        inApp,
        email,
        securityAlerts,
        weeklyDigest,
      },
    });
  };

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-bold font-display">Workspace Notification Routing</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure organization-level event routing, automated operational alerts, and digest dispatch channels.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* In-App Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notif-inapp" className="text-xs font-semibold text-foreground">
                    In-App Notification Stream
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Deliver real-time bell notifications for member approvals, team invitations, and publishing confirmations.
                </p>
              </div>

              <Switch
                id="notif-inapp"
                checked={inApp}
                onCheckedChange={setInApp}
                disabled={!userPermissions.canUpdate || isSaving}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notif-email" className="text-xs font-semibold text-foreground">
                    Administrative Email Alerts
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Dispatch email notifications to workspace owners and admins for billing events, domain DNS verification, and invitations.
                </p>
              </div>

              <Switch
                id="notif-email"
                checked={email}
                onCheckedChange={setEmail}
                disabled={!userPermissions.canUpdate || isSaving}
              />
            </div>

            {/* Security Alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notif-sec" className="text-xs font-semibold text-foreground">
                    Link Guardian & Security Alerts
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Immediate high-priority alerts when Guardian detects broken destination endpoints or unauthorized domain modifications.
                </p>
              </div>

              <Switch
                id="notif-sec"
                checked={securityAlerts}
                onCheckedChange={setSecurityAlerts}
                disabled={!userPermissions.canUpdate || isSaving}
              />
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notif-digest" className="text-xs font-semibold text-foreground">
                    Weekly Intelligence Digest
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Consolidated summary of scan volumes, campaign conversions, and active operational changes sent every Monday morning.
                </p>
              </div>

              <Switch
                id="notif-digest"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
                disabled={!userPermissions.canUpdate || isSaving}
              />
            </div>
          </div>

          {/* Signature Feature: Notification Route Map */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-xs font-semibold text-foreground font-display">
              EVENT ROUTE MAP
            </span>

            <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 text-xs font-mono">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
                <div className="px-2.5 py-1.5 rounded border border-border bg-surface text-foreground font-semibold">
                  WORKSPACE EVENT
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 hidden sm:inline-block" />

                <div className="px-2.5 py-1.5 rounded border border-primary/30 bg-primary/10 text-primary font-semibold">
                  ORGANIZATION POLICY
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 hidden sm:inline-block" />

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-[10px] ${
                      inApp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    IN-APP
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] ${
                      email ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    EMAIL
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] ${
                      securityAlerts ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    GUARDIAN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {userPermissions.canUpdate && (
            <div className="pt-4 flex items-center justify-between border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-mono">
                {hasChanges ? "● Unsaved notification preferences" : "Routing preferences saved"}
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={!hasChanges || isSaving}
                className="gap-1.5 text-xs h-8"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
