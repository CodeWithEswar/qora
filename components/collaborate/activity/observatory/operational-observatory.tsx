"use client";

import * as React from "react";
import type {
  ActivityProjection,
  ActivityDensityCell,
  ResourcePulseSegment,
  ActorResourceCell,
  EventCompositionItem,
  ChangeFlowLink,
  ActivityTimeSeriesPoint,
} from "@/lib/supabase/types/activity";
import { TemporalSignalSpine } from "./temporal-signal-spine";
import { ActivityVolumeChart } from "./activity-volume-chart";
import { ResourcePulse } from "./resource-pulse";
import { ActivityDensityMatrix } from "./activity-density-matrix";
import { EventComposition } from "./event-composition";
import { ActorResourceMatrix } from "./actor-resource-matrix";
import { ChangeFlow } from "./change-flow";
import { ChangeFingerprint } from "./change-fingerprint";
import { EventConstellation } from "./event-constellation";

interface OperationalObservatoryProps {
  events: ActivityProjection[];
  densityMatrix: ActivityDensityCell[];
  resourcePulse: ResourcePulseSegment[];
  actorResourceMatrix: ActorResourceCell[];
  eventComposition: EventCompositionItem[];
  changeFlow: ChangeFlowLink[];
  timeSeries: ActivityTimeSeriesPoint[];
  onSelectEvent: (event: ActivityProjection) => void;
  onSelectResource?: (resourceType: string) => void;
  onSelectActor?: (actorId: string) => void;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export function OperationalObservatory({
  events,
  densityMatrix,
  resourcePulse,
  actorResourceMatrix,
  eventComposition,
  changeFlow,
  timeSeries,
  onSelectEvent,
  onSelectResource,
  onSelectActor,
  onSelectCategory,
  className,
}: OperationalObservatoryProps) {
  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* 01 Temporal Signal Spine (Centerpiece Timeline) */}
      <TemporalSignalSpine events={events} onSelectEvent={onSelectEvent} />

      {/* 02 Change Volume & Event Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ActivityVolumeChart data={timeSeries} />
        </div>
        <div className="lg:col-span-5">
          <EventComposition items={eventComposition} onSelectCategory={onSelectCategory} />
        </div>
      </div>

      {/* 03 Resource Pulse & Density Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <ResourcePulse segments={resourcePulse} onSelectResource={onSelectResource} />
        </div>
        <div className="lg:col-span-6">
          <ActivityDensityMatrix cells={densityMatrix} />
        </div>
      </div>

      {/* 04 Change Flow & Fingerprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ChangeFlow links={changeFlow} />
        </div>
        <div className="lg:col-span-5">
          <ChangeFingerprint items={eventComposition} />
        </div>
      </div>

      {/* 05 Actor × Resource Matrix */}
      <ActorResourceMatrix cells={actorResourceMatrix} onSelectActor={onSelectActor} />

      {/* 06 Event Constellation Graph */}
      <EventConstellation events={events} onSelectEvent={onSelectEvent} />
    </div>
  );
}
