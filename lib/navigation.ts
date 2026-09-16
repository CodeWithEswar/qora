import {
  LayoutDashboard,
  QrCode,
  Layers,
  FileSpreadsheet,
  FolderTree,
  FileText,
  Files,
  BarChart3,
  Cpu,
  FlaskConical,
  ShieldCheck,
  Users,
  Building2,
  CheckCheck,
  Activity,
  Palette,
  Globe,
  KeyRound,
  Webhook,
  Terminal,
  BookOpen,
  Settings,
  CreditCard,
  ShieldAlert,
  History,
  LifeBuoy,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: (orgSlug: string) => string;
  pathSegment: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "indigo";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "PRIMARY",
    items: [
      {
        title: "Overview",
        href: (orgSlug) => `/${orgSlug}`,
        pathSegment: "",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "CREATE",
    items: [
      {
        title: "QR Studio",
        href: (orgSlug) => `/${orgSlug}/qr/studio`,
        pathSegment: "qr/studio",
        icon: QrCode,
        badge: "Studio",
      },
      {
        title: "Bulk Create",
        href: (orgSlug) => `/${orgSlug}/qr/bulk`,
        pathSegment: "qr/bulk",
        icon: FileSpreadsheet,
      },
      {
        title: "Templates",
        href: (orgSlug) => `/${orgSlug}/templates`,
        pathSegment: "templates",
        icon: Layers,
      },
    ],
  },
  {
    title: "MANAGE",
    items: [
      {
        title: "QR Codes",
        href: (orgSlug) => `/${orgSlug}/qr`,
        pathSegment: "qr",
        icon: QrCode,
        badge: "42",
      },
      {
        title: "Campaigns",
        href: (orgSlug) => `/${orgSlug}/campaigns`,
        pathSegment: "campaigns",
        icon: FolderTree,
      },
      {
        title: "Folders",
        href: (orgSlug) => `/${orgSlug}/folders`,
        pathSegment: "folders",
        icon: FolderTree,
      },
      {
        title: "Landing Pages",
        href: (orgSlug) => `/${orgSlug}/pages`,
        pathSegment: "pages",
        icon: FileText,
      },
      {
        title: "Files",
        href: (orgSlug) => `/${orgSlug}/files`,
        pathSegment: "files",
        icon: Files,
      },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      {
        title: "Analytics",
        href: (orgSlug) => `/${orgSlug}/analytics`,
        pathSegment: "analytics",
        icon: BarChart3,
      },
      {
        title: "Qora Brain",
        href: (orgSlug) => `/${orgSlug}/brain`,
        pathSegment: "brain",
        icon: Cpu,
        badge: "AI",
        badgeVariant: "indigo",
      },
      {
        title: "Experiments",
        href: (orgSlug) => `/${orgSlug}/experiments`,
        pathSegment: "experiments",
        icon: FlaskConical,
        badge: "A/B",
      },
      {
        title: "Qora Guardian",
        href: (orgSlug) => `/${orgSlug}/guardian`,
        pathSegment: "guardian",
        icon: ShieldCheck,
        badge: "Live",
        badgeVariant: "success",
      },
    ],
  },
  {
    title: "COLLABORATE",
    items: [
      {
        title: "Members",
        href: (orgSlug) => `/${orgSlug}/members`,
        pathSegment: "members",
        icon: Users,
      },
      {
        title: "Teams",
        href: (orgSlug) => `/${orgSlug}/teams`,
        pathSegment: "teams",
        icon: Building2,
      },
      {
        title: "Approvals",
        href: (orgSlug) => `/${orgSlug}/approvals`,
        pathSegment: "approvals",
        icon: CheckCheck,
      },
      {
        title: "Activity",
        href: (orgSlug) => `/${orgSlug}/activity`,
        pathSegment: "activity",
        icon: Activity,
      },
    ],
  },
  {
    title: "BRAND",
    items: [
      {
        title: "Brand Kits",
        href: (orgSlug) => `/${orgSlug}/brand`,
        pathSegment: "brand",
        icon: Palette,
      },
      {
        title: "Domains",
        href: (orgSlug) => `/${orgSlug}/domains`,
        pathSegment: "domains",
        icon: Globe,
      },
    ],
  },
  {
    title: "DEVELOPERS",
    items: [
      {
        title: "API Keys",
        href: (orgSlug) => `/${orgSlug}/developers/keys`,
        pathSegment: "developers/keys",
        icon: KeyRound,
      },
      {
        title: "Webhooks",
        href: (orgSlug) => `/${orgSlug}/developers/webhooks`,
        pathSegment: "developers/webhooks",
        icon: Webhook,
      },
      {
        title: "API Logs",
        href: (orgSlug) => `/${orgSlug}/developers/logs`,
        pathSegment: "developers/logs",
        icon: Terminal,
      },
      {
        title: "Documentation",
        href: () => "https://docs.qora.io",
        pathSegment: "docs",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      {
        title: "Workspace",
        href: (orgSlug) => `/${orgSlug}/settings/workspace`,
        pathSegment: "settings/workspace",
        icon: Building2,
      },
      {
        title: "Roles & Permissions",
        href: (orgSlug) => `/${orgSlug}/settings/permissions`,
        pathSegment: "settings/permissions",
        icon: ShieldAlert,
      },
      {
        title: "Audit Logs",
        href: (orgSlug) => `/${orgSlug}/audit`,
        pathSegment: "audit",
        icon: History,
      },
      {
        title: "Billing",
        href: (orgSlug) => `/${orgSlug}/billing`,
        pathSegment: "billing",
        icon: CreditCard,
        badge: "PRO",
        badgeVariant: "indigo",
      },
    ],
  },
];

export const BOTTOM_NAV_ITEMS = [
  {
    title: "Settings",
    href: (orgSlug: string) => `/${orgSlug}/settings`,
    pathSegment: "settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: () => "https://help.qora.io",
    pathSegment: "help",
    icon: LifeBuoy,
  },
];
