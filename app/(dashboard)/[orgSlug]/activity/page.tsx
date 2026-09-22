import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseActivityRepository } from "@/lib/supabase/repositories/activity";
import { ActivityObservatoryView } from "@/components/collaborate/activity/activity-observatory-view";
import type {
  ActivityProjection,
  ActivitySignalMetrics,
  ActivityTimeSeriesPoint,
  ActivityDensityCell,
  ResourcePulseSegment,
  ActorResourceCell,
  EventCompositionItem,
  ChangeFlowLink,
} from "@/lib/supabase/types/activity";
import type { ActivityViewTab } from "@/components/collaborate/activity/shell/activity-tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Activity — Operational Event Observatory | NXTQR",
  description:
    "Understand how work changes across your NXTQR organization with real-time operational memory.",
};

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{
    view?: string;
    range?: string;
    category?: string;
    resourceType?: string;
    actorId?: string;
  }>;
}) {
  const { orgSlug } = await params;
  const {
    view: viewParam,
    range: rangeParam,
    category: categoryParam,
    resourceType: resourceTypeParam,
    actorId: actorIdParam,
  } = await searchParams;

  let org = null;
  try {
    org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  } catch (err) {
    console.error("[ActivityPage] Failed to fetch organization:", err);
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Workspace Not Found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            The workspace &quot;{orgSlug}&quot; could not be resolved from Supabase directory records.
          </p>
        </div>
        <Link href={`/${orgSlug}`}>
          <Button variant="outline" size="sm" className="text-xs">
            Return to Overview
          </Button>
        </Link>
      </div>
    );
  }

  const range = (rangeParam as any) || "30d";
  const category = categoryParam || undefined;
  const resourceType = resourceTypeParam || undefined;
  const actorId = actorIdParam || undefined;
  const view = (viewParam as ActivityViewTab) || "stream";

  let events: ActivityProjection[] = [];
  let metrics: ActivitySignalMetrics = {
    totalEvents: 0,
    contributorsCount: 0,
    resourcesCount: 0,
    publishesCount: 0,
    approvalsCount: 0,
    changesCount: 0,
  };
  let timeSeries: ActivityTimeSeriesPoint[] = [];
  let densityMatrix: ActivityDensityCell[] = [];
  let resourcePulse: ResourcePulseSegment[] = [];
  let actorResourceMatrix: ActorResourceCell[] = [];
  let eventComposition: EventCompositionItem[] = [];
  let changeFlow: ChangeFlowLink[] = [];
  let loadError: string | null = null;

  try {
    const [
      fetchedEvents,
      fetchedMetrics,
      fetchedTimeSeries,
      fetchedDensityMatrix,
      fetchedResourcePulse,
      fetchedActorMatrix,
      fetchedComposition,
      fetchedChangeFlow,
    ] = await Promise.all([
      SupabaseActivityRepository.listActivityEvents(org.id, {
        view,
        range,
        category,
        resourceType,
        actorId,
      }),
      SupabaseActivityRepository.getOperationalSignalMetrics(org.id, range),
      SupabaseActivityRepository.getTimeSeries(org.id, range),
      SupabaseActivityRepository.getDensityMatrix(org.id, range),
      SupabaseActivityRepository.getResourcePulse(org.id, range),
      SupabaseActivityRepository.getActorResourceMatrix(org.id, range),
      SupabaseActivityRepository.getEventComposition(org.id, range),
      SupabaseActivityRepository.getChangeFlow(org.id, range),
    ]);

    events = fetchedEvents;
    metrics = fetchedMetrics;
    timeSeries = fetchedTimeSeries;
    densityMatrix = fetchedDensityMatrix;
    resourcePulse = fetchedResourcePulse;
    actorResourceMatrix = fetchedActorMatrix;
    eventComposition = fetchedComposition;
    changeFlow = fetchedChangeFlow;
  } catch (err: any) {
    console.error("[ActivityPage] Error fetching Supabase activity data:", err);
    loadError = err?.message || "Failed to load operational event observatory.";
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            ACTIVITY / OBSERVATORY UNAVAILABLE
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Activity Couldn&apos;t Be Loaded
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {loadError}
          </p>
        </div>
        <Link href={`/${orgSlug}/activity`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 font-mono">
            <RotateCcw className="h-3 w-3" />
            <span>Retry</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-2">
      <ActivityObservatoryView
        organization={{
          id: org.id,
          name: org.name,
          slug: org.slug,
        }}
        initialEvents={events}
        initialMetrics={metrics}
        initialTimeSeries={timeSeries}
        initialDensityMatrix={densityMatrix}
        initialResourcePulse={resourcePulse}
        initialActorResourceMatrix={actorResourceMatrix}
        initialEventComposition={eventComposition}
        initialChangeFlow={changeFlow}
        initialRange={range}
        initialCategory={category}
        initialResourceType={resourceType}
        initialActorId={actorId}
        initialView={view}
      />
    </div>
  );
}
