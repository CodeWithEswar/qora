import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SupabaseAuditRepository } from "@/lib/supabase/repositories/audit";
import { AuditLedgerClient } from "@/components/audit/audit-ledger-client";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditLogsPage({
  params,
  searchParams,
}: PageProps) {
  const { orgSlug } = await params;
  const sp = await searchParams;
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let overview;
  try {
    const rawFilters: Record<string, any> = {};
    if (typeof sp.range === "string") rawFilters.range = sp.range;
    if (typeof sp.lens === "string") rawFilters.lens = sp.lens;
    if (typeof sp.actorId === "string") rawFilters.actorId = sp.actorId;
    if (typeof sp.action === "string") rawFilters.action = sp.action;
    if (typeof sp.resourceType === "string") rawFilters.resourceType = sp.resourceType;
    if (typeof sp.result === "string") rawFilters.result = sp.result;
    if (typeof sp.search === "string") rawFilters.search = sp.search;
    if (sp.myActions === "true") rawFilters.myActions = true;
    if (sp.hasChanges === "true") rawFilters.hasChanges = true;

    overview = await SupabaseAuditRepository.getAuditLedgerOverview(
      orgSlug,
      rawFilters,
      session.user.id
    );
  } catch (err: any) {
    console.error("[AuditLogsPage] Failed to load audit ledger overview:", err);
    notFound();
  }

  // Check user role for export permission
  const userMembership = session.user.workspaces?.find(
    (w) => w.slug === orgSlug || w.id === overview.organization.id
  );
  const userRole = userMembership?.role || "OWNER";
  const canExport = userRole !== "VIEWER";

  return (
    <div className="-m-6">
      <AuditLedgerClient
        initialOverview={overview}
        currentUserId={session.user.id}
        canExport={canExport}
      />
    </div>
  );
}
