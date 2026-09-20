export type ExperimentStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

export interface ExperimentVariantItem {
  id: string;
  experimentId: string;
  name: string;
  destinationUrl: string;
  trafficWeight: number; // e.g. 50.0 (percentage, sum = 100)
  totalScans: number;
  conversions: number;
}

export interface ExperimentItem {
  id: string;
  qrId: string;
  qrName: string;
  qrSlug: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  goalMetric: string; // e.g. "scans" | "conversions" | "signup"
  startTime?: string;
  endTime?: string;
  variants: ExperimentVariantItem[];
  totalObservations: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExperimentSummaryMetrics {
  totalExperiments: number;
  runningExperiments: number;
  qrAssetsCount: number;
  totalObservations: number;
  completedExperiments: number;
}

export type ExperimentControlTab = "all" | "running" | "draft" | "paused" | "completed";
export type ExperimentLayoutMode = "signal" | "list";
export type ExperimentSortOption = "updated" | "name" | "observations" | "created";

export interface ExperimentFilterState {
  searchQuery: string;
  status: "all" | "running" | "draft" | "paused" | "completed";
  qrId: string; // "all" or specific qrId
  sort: ExperimentSortOption;
}

export interface EligibleDynamicQrOption {
  id: string;
  name: string;
  slug: string;
  status: string;
  defaultUrl: string;
  publishedRevision: number;
}

export interface CreateExperimentStepInput {
  name: string;
  description?: string;
  qrId: string;
  goalMetric: string;
  variants: {
    name: string;
    destinationUrl: string;
    trafficWeight: number;
  }[];
  startTime?: string;
  endTime?: string;
}
