import { RoutingRule, RoutingCondition, RoutingSimulationResult, ResolverContext } from "@nxtqr/contracts";

export interface RoutingDestinationOption {
  id: string;
  url: string;
  label: string;
  isDefault?: boolean;
  isFallback?: boolean;
}

export interface RoutingAssetItem {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "PAUSED" | "DRAFT" | "ARCHIVED" | string;
  publishedRevision: number;
  defaultUrl: string;
  fallbackUrl?: string;
  ruleCount: number;
  routingMode: "DEFAULT" | "CONDITIONAL" | "EXPERIMENT";
  rules: RoutingRule[];
  destinations: RoutingDestinationOption[];
  updatedAt?: string;
  createdAt?: string;
  isDynamic: boolean;
}

export interface RoutingSummaryMetrics {
  totalDynamicQr: number;
  activeRules: number;
  destinationsCount: number;
  publishedPolicies: number;
}

export type RoutingViewTab = "assets" | "rules" | "simulator" | "analytics";
export type RoutingLayoutMode = "grid" | "list";
export type RoutingSortOption = "updated" | "name" | "rules" | "slug";
export type RoutingFilterStatus = "all" | "active" | "paused" | "draft";
export type RoutingFilterMode = "all" | "default" | "conditional";

export interface RoutingFilterState {
  searchQuery: string;
  status: RoutingFilterStatus;
  mode: RoutingFilterMode;
  sort: RoutingSortOption;
}
