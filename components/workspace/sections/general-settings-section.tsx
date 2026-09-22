"use client";

import * as React from "react";
import { Settings, Save, AlertCircle, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceControlPlaneOverview, UpdateWorkspaceGeneralRequest } from "@nxtqr/contracts";

interface GeneralSettingsSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onSave: (payload: UpdateWorkspaceGeneralRequest) => Promise<void>;
  onOpenSlugImpactDialog: (newSlug: string) => void;
  isSaving: boolean;
}

const COMMON_TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
];

const LOCALES = [
  { code: "en", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "hi", label: "Hindi (हिन्दी)" },
];

export function GeneralSettingsSection({
  overview,
  onSave,
  onOpenSlugImpactDialog,
  isSaving,
}: GeneralSettingsSectionProps) {
  const { identity, userPermissions } = overview;

  const [name, setName] = React.useState(identity.name);
  const [slug, setSlug] = React.useState(identity.slug);
  const [description, setDescription] = React.useState(identity.description);
  const [timezone, setTimezone] = React.useState(identity.timezone);
  const [locale, setLocale] = React.useState(identity.locale);

  // Sync state if overview updates externally
  React.useEffect(() => {
    setName(identity.name);
    setSlug(identity.slug);
    setDescription(identity.description);
    setTimezone(identity.timezone);
    setLocale(identity.locale);
  }, [identity]);

  const hasChanges =
    name !== identity.name ||
    slug !== identity.slug ||
    description !== identity.description ||
    timezone !== identity.timezone ||
    locale !== identity.locale;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSaving || !userPermissions.canUpdate) return;

    if (slug !== identity.slug) {
      // Trigger confirmation dialog for slug change
      onOpenSlugImpactDialog(slug);
      return;
    }

    await onSave({
      name,
      slug,
      description,
      timezone,
      locale,
    });
  };

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-bold font-display">General Settings</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Authoritative identity metadata, organization slug, and regional execution preferences.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-xs font-medium text-foreground">
              Workspace Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!userPermissions.canUpdate || isSaving}
              required
              maxLength={80}
              placeholder="e.g. Acme Corporation"
              className="max-w-md h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Displayed across team notifications, workspace switchers, and asset ownership badges.
            </p>
          </div>

          {/* Workspace URL Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-slug" className="text-xs font-medium text-foreground">
              Workspace URL Slug <span className="text-primary">*</span>
            </Label>
            <div className="flex items-center max-w-md">
              <span className="inline-flex items-center px-3 h-9 rounded-l-md border border-r-0 border-border bg-muted/50 text-xs font-mono text-muted-foreground select-none">
                nxtqr.vercel.app/
              </span>
              <Input
                id="ws-slug"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                }
                disabled={!userPermissions.canUpdate || isSaving}
                required
                maxLength={64}
                className="rounded-l-none font-mono text-xs h-9"
              />
            </div>
            {slug !== identity.slug && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-mono pt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>Changing workspace slug will require deliberate impact confirmation.</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-desc" className="text-xs font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!userPermissions.canUpdate || isSaving}
              maxLength={280}
              placeholder="Brief operational purpose of this workspace..."
              rows={2}
              className="max-w-md text-xs resize-none"
            />
          </div>

          {/* Timezone & Locale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ws-tz" className="text-xs font-medium text-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>Timezone</span>
              </Label>
              <Select
                value={timezone}
                onValueChange={setTimezone}
                disabled={!userPermissions.canUpdate || isSaving}
              >
                <SelectTrigger id="ws-tz" className="h-9 text-xs font-mono">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz} className="text-xs font-mono">
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Governs time-based smart routing and audit timestamps.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ws-locale" className="text-xs font-medium text-foreground flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span>Locale</span>
              </Label>
              <Select
                value={locale}
                onValueChange={setLocale}
                disabled={!userPermissions.canUpdate || isSaving}
              >
                <SelectTrigger id="ws-locale" className="h-9 text-xs">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((l) => (
                    <SelectItem key={l.code} value={l.code} className="text-xs">
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Formatting for numbers, dates, and export files.
              </p>
            </div>
          </div>

          {/* Section Action Bar */}
          {userPermissions.canUpdate && (
            <div className="pt-4 flex items-center justify-between border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-mono">
                {hasChanges ? "● Unsaved general changes" : "All settings up to date"}
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={!hasChanges || isSaving}
                className="gap-1.5 text-xs h-8"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save General Settings"}</span>
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
