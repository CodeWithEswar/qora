import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return <AppShell orgSlug={orgSlug}>{children}</AppShell>;
}
