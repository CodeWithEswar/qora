/**
 * NXTQR — HTTP API V1 Landing Page Resource Contracts
 * Operational schemas for Mobile-First Destination Studio & QR-Native Experiences.
 */

import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { SortOrderSchema } from "./common";

// ==============================================================================
// 1. THEME PRESETS & TOKENS
// ==============================================================================

export const LANDING_PAGE_THEME_PRESETS = [
  "Ember Editorial",
  "Warm Paper",
  "Graphite Signal",
  "Midnight Route",
  "Sunlit Minimal",
  "Mono Terminal",
] as const;

export const LandingPageThemePresetSchema = z.enum(LANDING_PAGE_THEME_PRESETS);
export type LandingPageThemePreset = z.infer<typeof LandingPageThemePresetSchema>;

export const LandingPageThemeSchema = z.object({
  preset: LandingPageThemePresetSchema.default("Ember Editorial"),
  name: z.string().optional(),
  background: z.string().default("#FFFDF7"),
  surface: z.string().default("#FFFFFF"),
  text: z.string().default("#1F1F1F"),
  mutedText: z.string().default("#6A6A6A"),
  accent: z.string().default("#FA520F"),
  buttonBackground: z.string().default("#FA520F"),
  buttonText: z.string().default("#FFFFFF"),
  buttonShape: z.enum(["pill", "rounded", "square", "sharp"]).default("rounded"),
  fontPairing: z.enum(["editorial", "modern", "terminal", "geometric", "sans", "serif", "mono"]).default("editorial"),
  cornerRadius: z.number().default(12),
  spacing: z.enum(["compact", "normal", "spacious", "none", "sm", "md", "lg"]).default("normal"),
  backgroundColor: z.string().optional(),
  foregroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  surfaceColor: z.string().optional(),
  buttonStyle: z.string().optional(),
});
export type LandingPageTheme = z.infer<typeof LandingPageThemeSchema>;

export const THEME_PRESET_DEFINITIONS: Record<LandingPageThemePreset, LandingPageTheme> = {
  "Ember Editorial": {
    preset: "Ember Editorial",
    name: "Ember Editorial",
    background: "#FFFDF7",
    surface: "#FFFFFF",
    text: "#1F1F1F",
    mutedText: "#6A6A6A",
    accent: "#FA520F",
    buttonBackground: "#FA520F",
    buttonText: "#FFFFFF",
    buttonShape: "rounded",
    fontPairing: "editorial",
    cornerRadius: 12,
    spacing: "normal",
    backgroundColor: "#FFFDF7",
    foregroundColor: "#1F1F1F",
    accentColor: "#FA520F",
    surfaceColor: "#FFFFFF",
    buttonStyle: "rounded",
  },
  "Warm Paper": {
    preset: "Warm Paper",
    name: "Warm Paper",
    background: "#FBF8F1",
    surface: "#FFFFFF",
    text: "#2A2825",
    mutedText: "#7C776E",
    accent: "#D95D39",
    buttonBackground: "#2A2825",
    buttonText: "#FBF8F1",
    buttonShape: "rounded",
    fontPairing: "editorial",
    cornerRadius: 8,
    spacing: "normal",
    backgroundColor: "#FBF8F1",
    foregroundColor: "#2A2825",
    accentColor: "#D95D39",
    surfaceColor: "#FFFFFF",
    buttonStyle: "rounded",
  },
  "Graphite Signal": {
    preset: "Graphite Signal",
    name: "Graphite Signal",
    background: "#18181B",
    surface: "#27272A",
    text: "#FAFAFA",
    mutedText: "#A1A1AA",
    accent: "#FA520F",
    buttonBackground: "#FA520F",
    buttonText: "#FFFFFF",
    buttonShape: "rounded",
    fontPairing: "modern",
    cornerRadius: 12,
    spacing: "normal",
    backgroundColor: "#18181B",
    foregroundColor: "#FAFAFA",
    accentColor: "#FA520F",
    surfaceColor: "#27272A",
    buttonStyle: "rounded",
  },
  "Midnight Route": {
    preset: "Midnight Route",
    name: "Midnight Route",
    background: "#09090B",
    surface: "#18181B",
    text: "#F4F4F5",
    mutedText: "#71717A",
    accent: "#38BDF8",
    buttonBackground: "#38BDF8",
    buttonText: "#09090B",
    buttonShape: "pill",
    fontPairing: "geometric",
    cornerRadius: 16,
    spacing: "spacious",
    backgroundColor: "#09090B",
    foregroundColor: "#F4F4F5",
    accentColor: "#38BDF8",
    surfaceColor: "#18181B",
    buttonStyle: "pill",
  },
  "Sunlit Minimal": {
    preset: "Sunlit Minimal",
    name: "Sunlit Minimal",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#18181B",
    mutedText: "#71717A",
    accent: "#E11D48",
    buttonBackground: "#18181B",
    buttonText: "#FAFAFA",
    buttonShape: "pill",
    fontPairing: "modern",
    cornerRadius: 16,
    spacing: "spacious",
    backgroundColor: "#FAFAFA",
    foregroundColor: "#18181B",
    accentColor: "#E11D48",
    surfaceColor: "#FFFFFF",
    buttonStyle: "pill",
  },
  "Mono Terminal": {
    preset: "Mono Terminal",
    name: "Mono Terminal",
    background: "#0C0A09",
    surface: "#1C1917",
    text: "#E7E5E4",
    mutedText: "#78716C",
    accent: "#22C55E",
    buttonBackground: "#22C55E",
    buttonText: "#0C0A09",
    buttonShape: "square",
    fontPairing: "terminal",
    cornerRadius: 4,
    spacing: "compact",
    backgroundColor: "#0C0A09",
    foregroundColor: "#E7E5E4",
    accentColor: "#22C55E",
    surfaceColor: "#1C1917",
    buttonStyle: "sharp",
  },
};

// ==============================================================================
// 2. BLOCK SCHEMAS
// ==============================================================================

export const LandingPageBlockTypeSchema = z.enum([
  "hero",
  "text",
  "image",
  "button",
  "link_list",
  "social_links",
  "contact_card",
  "file_download",
  "divider",
]);
export type LandingPageBlockType = z.infer<typeof LandingPageBlockTypeSchema>;

export const LandingPageActionTypeSchema = z.enum([
  "url",
  "call",
  "email",
  "sms",
  "whatsapp",
  "download",
]);
export type LandingPageActionType = z.infer<typeof LandingPageActionTypeSchema>;

export const HeroBlockPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default("Welcome"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  layout: z.enum(["editorial", "centered", "split", "image-first", "minimal"]).default("centered"),
  primaryAction: z
    .object({
      label: z.string(),
      url: z.string(),
      actionType: LandingPageActionTypeSchema.default("url"),
    })
    .optional(),
  secondaryAction: z
    .object({
      label: z.string(),
      url: z.string(),
      actionType: LandingPageActionTypeSchema.default("url"),
    })
    .optional(),
});
export type HeroBlockProps = z.infer<typeof HeroBlockPropsSchema>;

export const TextBlockPropsSchema = z.object({
  content: z.string().default("Enter text or announcement here..."),
  alignment: z.enum(["left", "center", "right"]).default("left"),
  size: z.enum(["sm", "base", "lg", "xl"]).default("base"),
});
export type TextBlockProps = z.infer<typeof TextBlockPropsSchema>;

export const ImageBlockPropsSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.enum(["auto", "1:1", "16:9", "4:3", "3:2"]).default("auto"),
  fileId: z.string().optional(),
});
export type ImageBlockProps = z.infer<typeof ImageBlockPropsSchema>;

export const ButtonBlockPropsSchema = z.object({
  label: z.string().default("Take Action"),
  url: z.string().default("#"),
  actionType: LandingPageActionTypeSchema.default("url"),
  variant: z.enum(["primary", "secondary", "outline", "ghost"]).default("primary"),
});
export type ButtonBlockProps = z.infer<typeof ButtonBlockPropsSchema>;

export const LinkListItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  url: z.string(),
  actionType: LandingPageActionTypeSchema.default("url"),
  enabled: z.boolean().default(true),
});
export type LinkListItem = z.infer<typeof LinkListItemSchema>;

export const LinkListBlockPropsSchema = z.object({
  items: z.array(LinkListItemSchema).default([]),
  columns: z.enum(["auto", "1", "2"]).default("auto").optional(),
  alignment: z.enum(["left", "center"]).default("left").optional(),
});
export type LinkListBlockProps = z.infer<typeof LinkListBlockPropsSchema>;

export const SocialLinkItemSchema = z.object({
  platform: z.enum([
    "instagram",
    "youtube",
    "linkedin",
    "x",
    "facebook",
    "tiktok",
    "whatsapp",
    "telegram",
    "github",
    "website",
  ]),
  url: z.string(),
  enabled: z.boolean().default(true),
});
export type SocialLinkItem = z.infer<typeof SocialLinkItemSchema>;

export const SocialLinksBlockPropsSchema = z.object({
  items: z.array(SocialLinkItemSchema).default([]),
});
export type SocialLinksBlockProps = z.infer<typeof SocialLinksBlockPropsSchema>;

export const ContactCardBlockPropsSchema = z.object({
  name: z.string().default("Your Name"),
  role: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type ContactCardBlockProps = z.infer<typeof ContactCardBlockPropsSchema>;

export const FileDownloadBlockPropsSchema = z.object({
  fileId: z.string().optional(),
  fileName: z.string().default("Download Attachment"),
  fileSize: z.string().optional(),
  mimeType: z.string().optional(),
  downloadUrl: z.string().default("#"),
});
export type FileDownloadBlockProps = z.infer<typeof FileDownloadBlockPropsSchema>;

export const DividerBlockPropsSchema = z.object({
  style: z.enum(["line", "dots", "blank", "solid", "dashed", "dotted"]).default("solid"),
  spacing: z.enum(["sm", "md", "lg", "none"]).default("md"),
});
export type DividerBlockProps = z.infer<typeof DividerBlockPropsSchema>;

export const LandingPageBlockSchema = z.object({
  id: z.string(),
  type: LandingPageBlockTypeSchema,
  visible: z.boolean().default(true),
  props: z.record(z.string(), z.any()),
});
export type LandingPageBlock = z.infer<typeof LandingPageBlockSchema>;
export type LandingPageBlockV1 = LandingPageBlock;

// ==============================================================================
// 3. SEO & COMPLETE DOCUMENT SCHEMA (SCHEMA VERSION 1)
// ==============================================================================

export const LandingPageSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  socialImageUrl: z.string().optional(),
  noindex: z.boolean().default(false),
});
export type LandingPageSeo = z.infer<typeof LandingPageSeoSchema>;

export const LandingPageDocumentV1Schema = z.object({
  schemaVersion: z.literal(1).default(1),
  theme: LandingPageThemeSchema.default(THEME_PRESET_DEFINITIONS["Ember Editorial"]),
  seo: LandingPageSeoSchema.default({ noindex: false }),
  blocks: z.array(LandingPageBlockSchema).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type LandingPageDocumentV1 = z.infer<typeof LandingPageDocumentV1Schema>;

// ==============================================================================
// 4. STARTER LAYOUT TEMPLATES (PRODUCT CONFIGURATION)
// ==============================================================================

export interface LandingPageStarterLayout {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  document: LandingPageDocumentV1;
}

export const STARTER_LAYOUTS: LandingPageStarterLayout[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start with an empty canvas and add your own custom blocks.",
    category: "General",
    icon: "solar:document-add-linear",
    document: {
      schemaVersion: 1,
      theme: THEME_PRESET_DEFINITIONS["Ember Editorial"],
      seo: { noindex: false },
      blocks: [],
    },
  },
  {
    id: "product_launch",
    name: "Product / Offer",
    description: "Highlight a flagship product, special promotion, or retail launch.",
    category: "Commerce",
    icon: "solar:tag-price-bold",
    document: {
      schemaVersion: 1,
      theme: THEME_PRESET_DEFINITIONS["Ember Editorial"],
      seo: { noindex: false, title: "Special Product Offer" },
      blocks: [
        {
          id: "block_hero",
          type: "hero",
          visible: true,
          props: {
            eyebrow: "Exclusive Scan Offer",
            title: "Summer Collection 2026",
            description: "Scan-only 20% discount on all handcrafted essentials.",
            layout: "centered",
            primaryAction: { label: "Claim Offer", url: "https://nxtqr.vercel.app/shop", actionType: "url" },
            secondaryAction: { label: "Learn More", url: "#details", actionType: "url" },
          },
        },
        {
          id: "block_links",
          type: "link_list",
          visible: true,
          props: {
            items: [
              { id: "l1", label: "Shop Top Picks", description: "Bestselling items this week", icon: "solar:bag-bold", url: "https://nxtqr.vercel.app/shop", actionType: "url", enabled: true },
              { id: "l2", label: "Store Locations", description: "Find a boutique near you", icon: "solar:map-point-bold", url: "https://nxtqr.vercel.app/stores", actionType: "url", enabled: true },
            ],
          },
        },
      ],
    },
  },
  {
    id: "event_pass",
    name: "Event Pass",
    description: "Concert tickets, conference agendas, venue maps, and RSVP buttons.",
    category: "Events",
    icon: "solar:calendar-bold",
    document: {
      schemaVersion: 1,
      theme: THEME_PRESET_DEFINITIONS["Midnight Route"],
      seo: { noindex: false, title: "Event Information & Agenda" },
      blocks: [
        {
          id: "event_hero",
          type: "hero",
          visible: true,
          props: {
            eyebrow: "Saturday, Oct 24 • Grand Pavilion",
            title: "Global Creators Summit",
            description: "Scan pass verified. Show this screen at the check-in entrance for express entry badge.",
            layout: "editorial",
            primaryAction: { label: "View Schedule", url: "#schedule", actionType: "url" },
          },
        },
        {
          id: "event_links",
          type: "link_list",
          visible: true,
          props: {
            items: [
              { id: "e1", label: "Venue Directions", description: "Google Maps / Waze navigation", icon: "solar:map-bold", url: "https://maps.google.com", actionType: "url", enabled: true },
              { id: "e2", label: "Speaker Lineup", description: "Meet our keynote innovators", icon: "solar:users-group-rounded-bold", url: "#speakers", actionType: "url", enabled: true },
              { id: "e3", label: "Live Broadcast", description: "Stream keynotes live", icon: "solar:video-frame-bold", url: "https://youtube.com", actionType: "url", enabled: true },
            ],
          },
        },
      ],
    },
  },
  {
    id: "profile_contact",
    name: "Profile / Contact",
    description: "Digital business card, executive bio, social links, and direct vCard save.",
    category: "Identity",
    icon: "solar:user-id-bold",
    document: {
      schemaVersion: 1,
      theme: THEME_PRESET_DEFINITIONS["Warm Paper"],
      seo: { noindex: false, title: "Contact Card" },
      blocks: [
        {
          id: "contact_1",
          type: "contact_card",
          visible: true,
          props: {
            name: "Eswar Chinthakayala",
            role: "Founder & Architect",
            company: "NXTQR Infrastructure",
            phone: "+91 98765 43210",
            email: "eswar@nxtqr.com",
            website: "https://nxtqr.vercel.app",
            location: "Bengaluru, India",
          },
        },
        {
          id: "social_1",
          type: "social_links",
          visible: true,
          props: {
            items: [
              { platform: "linkedin", url: "https://linkedin.com", enabled: true },
              { platform: "x", url: "https://x.com", enabled: true },
              { platform: "github", url: "https://github.com", enabled: true },
              { platform: "whatsapp", url: "https://wa.me/919876543210", enabled: true },
            ],
          },
        },
      ],
    },
  },
  {
    id: "multi_link",
    name: "Multi-Link Bio",
    description: "All your relevant destinations, links, portfolios, and channels in one place.",
    category: "General",
    icon: "solar:link-circle-bold",
    document: {
      schemaVersion: 1,
      theme: THEME_PRESET_DEFINITIONS["Sunlit Minimal"],
      seo: { noindex: false, title: "Quick Links" },
      blocks: [
        {
          id: "bio_hero",
          type: "hero",
          visible: true,
          props: {
            title: "@nxtqr_brand",
            description: "Smart QR infrastructure for enterprise workflows and modern destinations.",
            layout: "minimal",
          },
        },
        {
          id: "bio_links",
          type: "link_list",
          visible: true,
          props: {
            items: [
              { id: "b1", label: "Official Website", description: "Explore the platform", icon: "solar:global-bold", url: "https://nxtqr.vercel.app", actionType: "url", enabled: true },
              { id: "b2", label: "Developer Documentation", description: "APIs & Edge Workers", icon: "solar:code-bold", url: "https://nxtqr.vercel.app/docs", actionType: "url", enabled: true },
              { id: "b3", label: "Join the Community", description: "Discord server & discussion", icon: "solar:chat-round-bold", url: "https://discord.com", actionType: "url", enabled: true },
            ],
          },
        },
        {
          id: "bio_social",
          type: "social_links",
          visible: true,
          props: {
            items: [
              { platform: "x", url: "https://x.com", enabled: true },
              { platform: "instagram", url: "https://instagram.com", enabled: true },
              { platform: "youtube", url: "https://youtube.com", enabled: true },
            ],
          },
        },
      ],
    },
  },
];

// ==============================================================================
// 5. OPERATIONAL DTOs & API SCHEMAS
// ==============================================================================

export const CreateLandingPageRequestV1Schema = z.object({
  name: z.string().trim().min(1, "Page name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(80)
    .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores"),
  description: z.string().trim().max(300).optional().nullable(),
  starterLayoutId: z.string().default("blank"),
});
export type CreateLandingPageRequestV1 = z.infer<typeof CreateLandingPageRequestV1Schema>;

export const UpdateLandingPageRequestV1Schema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-_]+$/)
    .optional(),
  description: z.string().trim().max(300).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
export type UpdateLandingPageRequestV1 = z.infer<typeof UpdateLandingPageRequestV1Schema>;

export const SaveLandingPageDraftRequestV1Schema = z.object({
  expectedDraftVersion: z.number().int().min(1),
  document: LandingPageDocumentV1Schema,
});
export type SaveLandingPageDraftRequestV1 = z.infer<typeof SaveLandingPageDraftRequestV1Schema>;

export const PublishLandingPageRequestV1Schema = z.object({
  changeSummary: z.string().trim().max(300).optional(),
});
export type PublishLandingPageRequestV1 = z.infer<typeof PublishLandingPageRequestV1Schema>;

export const ConnectQrRequestV1Schema = z.object({
  qrId: z.string().uuid("Invalid QR Code ID"),
  setAsDestination: z.boolean().default(true),
});
export type ConnectQrRequestV1 = z.infer<typeof ConnectQrRequestV1Schema>;

export const DisconnectQrRequestV1Schema = z.object({
  qrId: z.string().uuid("Invalid QR Code ID"),
});
export type DisconnectQrRequestV1 = z.infer<typeof DisconnectQrRequestV1Schema>;

export const LandingPageCollectionQuerySchema = PaginationQuerySchema.extend({
  search: z.string().max(80).optional(),
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
  sortBy: z.enum(["updatedAt", "createdAt", "name", "qrCount", "viewCount"]).default("updatedAt"),
  order: SortOrderSchema.default("desc"),
  offset: z.coerce.number().min(0).optional(),
});
export type LandingPageCollectionQueryParams = z.infer<typeof LandingPageCollectionQuerySchema>;

export const LandingPageResponseV1Schema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]),
  publishedVersionId: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  qrCount: z.number().default(0),
  viewCount: z.number().default(0),
  ctaCount: z.number().default(0),
  draftVersion: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional(),
  publicUrl: z.string(),
});
export type LandingPageResponseV1 = z.infer<typeof LandingPageResponseV1Schema>;

export const LandingPagePulseMetricsSchema = z.object({
  totalPages: z.number().default(0),
  publishedPages: z.number().default(0),
  draftPages: z.number().default(0),
  connectedQrs: z.number().default(0),
  totalViews: z.number().default(0),
  totalActions: z.number().default(0),
});
export type LandingPagePulseMetrics = z.infer<typeof LandingPagePulseMetricsSchema>;

export const LandingPageVersionResponseV1Schema = z.object({
  id: z.string(),
  pageId: z.string(),
  versionNumber: z.number(),
  changeSummary: z.string(),
  createdByName: z.string().optional(),
  createdAt: z.string(),
  isLive: z.boolean(),
});
export type LandingPageVersionResponseV1 = z.infer<typeof LandingPageVersionResponseV1Schema>;

export const LandingPageConnectedQrV1Schema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  qrType: z.string(),
  status: z.string(),
  totalScans: z.number(),
  uniqueScans: z.number(),
  updatedAt: z.string(),
});
export type LandingPageConnectedQrV1 = z.infer<typeof LandingPageConnectedQrV1Schema>;

export const LandingPageTelemetryEventSchema = z.object({
  pageId: z.string().uuid(),
  eventType: z.enum(["view", "action_click", "conversion"]),
  versionId: z.string().uuid().optional(),
  qrId: z.string().uuid().optional(),
  actionId: z.string().optional(),
  actionType: z.string().optional(),
  deviceType: z.string().optional(),
  referrer: z.string().optional(),
});
export type LandingPageTelemetryEvent = z.infer<typeof LandingPageTelemetryEventSchema>;

export const LANDING_PAGE_STARTER_LAYOUTS = STARTER_LAYOUTS;
export type LandingPageThemeV1 = LandingPageTheme;
export type LandingPageThemePresetName = LandingPageThemePreset;
export type LandingPageRecord = LandingPageResponseV1;

