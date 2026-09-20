import * as React from "react";
import { Settings, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <PageHeader
        breadcrumbs={[
          { label: orgSlug, href: `/${orgSlug}` },
          { label: "Settings" },
        ]}
        title="Workspace Settings"
        description="Configure general workspace metadata, custom domain routing, and team defaults."
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Save className="h-3.5 w-3.5" />
            <span>Save Changes</span>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Workspace Profile</CardTitle>
          <CardDescription>Public name and unique URL slug of your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Workspace Name</label>
            <Input defaultValue={orgSlug} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Organization Slug</label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 h-9 rounded-l-lg border border-r-0 border-border bg-muted text-xs text-muted-foreground">
                nxtqr.vercel.app/
              </span>
              <Input defaultValue={orgSlug} className="rounded-l-none" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
