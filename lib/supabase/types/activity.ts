export type ActivityCategory =
  | "create"
  | "update"
  | "publish"
  | "approval"
  | "comment"
  | "routing"
  | "team"
  | "membership"
  | "brand"
  | "domain"
  | "guardian"
  | "archive"
  | "restore"
  | "delete";

export type ActivityResourceKind =
  | "qr"
  | "qr_code"
  | "campaign"
  | "brand_kit"
  | "approval"
  | "comment"
  | "team"
  | "member"
  | "domain"
  | "route"
  | "template"
  | "folder"
  | "landing_page"
  | "guardian";

export interface ActivityActor {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  role?: string;
  initials: string;
  isSystem?: boolean;
}

export interface ActivityResource {
  type: string;
  id: string;
  name: string;
  ref: string;
  url?: string;
}

export interface ChangeSummaryItem {
  field: string;
  before?: any;
  after?: any;
}

export interface ActivityProjection {
  id: string;
  organizationId: string;
  actor: ActivityActor;
  action: string;
  category: ActivityCategory;
  verb: string;
  resource: ActivityResource;
  context: string;
  revision?: string | number;
  teamId?: string;
  occurredAt: string; // ISO timestamp
  changeSummary?: ChangeSummaryItem[];
  metadataJson?: Record<string, any>;
}

export interface ActivitySignalMetrics {
  totalEvents: number;
  contributorsCount: number;
  resourcesCount: number;
  changesCount: number;
  publishesCount: number;
  approvalsCount: number;
}

export interface TemporalSpinePoint {
  id: string;
  occurredAt: string;
  markerType: "publish" | "approval" | "standard" | "archive";
  actorName: string;
  actorInitials: string;
  actionLabel: string;
  resourceName: string;
  resourceType: string;
  category: ActivityCategory;
  context?: string;
}

export interface ActivityDensityCell {
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ... 6 = Sat
  hourBucket: number; // 0, 4, 8, 12, 16, 20
  count: number;
}

export interface ResourcePulseSegment {
  resourceType: string;
  label: string;
  eventCount: number;
  distinctResourceCount: number;
  percentage: number;
  latestEventAt: string;
}

export interface ActorResourceCell {
  actorId: string;
  actorName: string;
  actorInitials: string;
  resourceType: string;
  count: number;
}

export interface ChangeFlowLink {
  source: string;
  target: string;
  count: number;
  description: string;
}

export interface EventCompositionItem {
  category: ActivityCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ActivityTimeSeriesPoint {
  date: string;
  total: number;
  publishes: number;
  approvals: number;
  comments: number;
  updates: number;
}

export interface ActivityFilterState {
  view: "stream" | "observatory" | "resources" | "people";
  range: "24h" | "7d" | "30d" | "90d" | "custom";
  category?: string;
  resourceType?: string;
  actorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface EventInspectorDetail extends ActivityProjection {
  eventChain: Array<{
    id: string;
    action: string;
    occurredAt: string;
    actorName: string;
    label: string;
  }>;
}
