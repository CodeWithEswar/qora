/**
 * NXTQR — Modular Domain Architecture Barrel Export
 * 12 Bounded Contexts + Shared Primitives
 */

export * from "./shared/errors";
export * from "./shared/events";
export * from "./shared/ssrf";
export * from "./shared/types";

export * as IdentityDomain from "./identity";
export * as OrganizationsDomain from "./organizations";
export * as QRDomain from "./qr";
export * as RoutingDomain from "./routing";
export * as CampaignsDomain from "./campaigns";
export * as BrandDomain from "./brand";
export * as AnalyticsDomain from "./analytics";
export * as CollaborationDomain from "./collaboration";
export * as SecurityDomain from "./security";
export * as BillingDomain from "./billing";
export * as DeveloperDomain from "./developer";
export * as GuardianDomain from "./guardian";
