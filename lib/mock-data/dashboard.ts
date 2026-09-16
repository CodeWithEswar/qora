export interface TopQRCode {
  id: string;
  name: string;
  shortCode: string;
  type: "Dynamic" | "Static";
  destination: string;
  campaign: string;
  scans: number;
  uniqueScans: number;
  status: "active" | "draft" | "paused" | "expired";
  updatedAt: string;
  owner: {
    name: string;
    avatar: string;
  };
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  time: string;
  type: "qr_create" | "brain_route" | "guardian_check" | "member_invite" | "campaign_update";
}

export interface ScanTimeseriesPoint {
  date: string;
  label: string;
  scans: number;
  unique: number;
}

export const DASHBOARD_KPIS = {
  totalScans: {
    value: "148,290",
    rawValue: 148290,
    change: 14.8,
    comparison: "vs. previous 30 days",
    sparkline: [42, 48, 55, 51, 62, 70, 78, 85, 92, 105, 118, 126, 148],
  },
  uniqueScans: {
    value: "112,450",
    rawValue: 112450,
    change: 11.2,
    comparison: "vs. previous 30 days",
    sparkline: [30, 36, 40, 38, 48, 54, 62, 68, 75, 84, 95, 102, 112],
  },
  activeQRs: {
    value: "42",
    rawValue: 42,
    change: 8.5,
    comparison: "+4 created this month",
    sparkline: [28, 30, 31, 32, 34, 35, 35, 36, 38, 38, 39, 40, 42],
  },
  conversionRate: {
    value: "6.8%",
    rawValue: 6.8,
    change: 0.9,
    comparison: "+0.9% vs. baseline",
    sparkline: [5.2, 5.4, 5.3, 5.7, 5.9, 6.0, 6.1, 6.4, 6.3, 6.5, 6.6, 6.7, 6.8],
  },
};

export const SCAN_ACTIVITY_30D: ScanTimeseriesPoint[] = [
  { date: "2026-08-18", label: "Aug 18", scans: 3420, unique: 2650 },
  { date: "2026-08-20", label: "Aug 20", scans: 3890, unique: 2980 },
  { date: "2026-08-22", label: "Aug 22", scans: 4120, unique: 3100 },
  { date: "2026-08-24", label: "Aug 24", scans: 3750, unique: 2840 },
  { date: "2026-08-26", label: "Aug 26", scans: 4680, unique: 3510 },
  { date: "2026-08-28", label: "Aug 28", scans: 5210, unique: 3920 },
  { date: "2026-08-30", label: "Aug 30", scans: 4950, unique: 3800 },
  { date: "2026-09-01", label: "Sep 01", scans: 5630, unique: 4210 },
  { date: "2026-09-03", label: "Sep 03", scans: 5980, unique: 4520 },
  { date: "2026-09-05", label: "Sep 05", scans: 5410, unique: 4100 },
  { date: "2026-09-07", label: "Sep 07", scans: 6120, unique: 4780 },
  { date: "2026-09-09", label: "Sep 09", scans: 6840, unique: 5230 },
  { date: "2026-09-11", label: "Sep 11", scans: 7290, unique: 5640 },
  { date: "2026-09-13", label: "Sep 13", scans: 6950, unique: 5310 },
  { date: "2026-09-15", label: "Sep 15", scans: 7850, unique: 5980 },
  { date: "2026-09-16", label: "Sep 16", scans: 8120, unique: 6240 },
];

export const SCAN_ACTIVITY_7D: ScanTimeseriesPoint[] = SCAN_ACTIVITY_30D.slice(-7);

export const SCAN_ACTIVITY_90D: ScanTimeseriesPoint[] = [
  { date: "2026-06-20", label: "Jun 20", scans: 2400, unique: 1800 },
  { date: "2026-07-05", label: "Jul 05", scans: 2900, unique: 2200 },
  { date: "2026-07-20", label: "Jul 20", scans: 3600, unique: 2750 },
  { date: "2026-08-05", label: "Aug 05", scans: 4300, unique: 3290 },
  { date: "2026-08-20", label: "Aug 20", scans: 5100, unique: 3890 },
  { date: "2026-09-05", label: "Sep 05", scans: 6400, unique: 4900 },
  { date: "2026-09-16", label: "Sep 16", scans: 8120, unique: 6240 },
];

export const TOP_QR_CODES: TopQRCode[] = [
  {
    id: "qr-1",
    name: "Summer Launch Packaging",
    shortCode: "qora.to/summer26",
    type: "Dynamic",
    destination: "https://acme.com/summer-promo?utm=qr",
    campaign: "Summer 2026",
    scans: 48920,
    uniqueScans: 39450,
    status: "active",
    updatedAt: "12m ago",
    owner: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    },
  },
  {
    id: "qr-2",
    name: "SF Tech Week Badge Portal",
    shortCode: "qora.to/sftw-vip",
    type: "Dynamic",
    destination: "https://acme.com/events/sftw?ref=badge",
    campaign: "Conferences",
    scans: 31400,
    uniqueScans: 27800,
    status: "active",
    updatedAt: "2h ago",
    owner: {
      name: "Jordan Lee",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
    },
  },
  {
    id: "qr-3",
    name: "Smart Menu Downtown",
    shortCode: "qora.to/menu-dt",
    type: "Dynamic",
    destination: "https://menu.acme-dining.com/downtown",
    campaign: "In-Store Experience",
    scans: 24150,
    uniqueScans: 19800,
    status: "active",
    updatedAt: "5h ago",
    owner: {
      name: "Maya Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    },
  },
  {
    id: "qr-4",
    name: "Q3 Billboard Manhattan",
    shortCode: "qora.to/nyc-billboard",
    type: "Dynamic",
    destination: "https://acme.com/ooh-nyc",
    campaign: "Brand Awareness",
    scans: 18420,
    uniqueScans: 14200,
    status: "paused",
    updatedAt: "1d ago",
    owner: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    },
  },
  {
    id: "qr-5",
    name: "Product Support WiFi Tag",
    shortCode: "qora.to/wifi-quick",
    type: "Static",
    destination: "WIFI:S:Acme-Guest;T:WPA;P:Secret2026;;",
    campaign: "Retail Operations",
    scans: 12890,
    uniqueScans: 9850,
    status: "active",
    updatedAt: "3d ago",
    owner: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
    },
  },
];

export const DEVICE_BREAKDOWN = [
  { name: "iOS", value: 58, count: 86008, color: "var(--color-primary)" },
  { name: "Android", value: 34, count: 50418, color: "#06b6d4" },
  { name: "Desktop", value: 6, count: 8897, color: "#10b981" },
  { name: "Other", value: 2, count: 2967, color: "#94a3b8" },
];

export const TOP_LOCATIONS = [
  { country: "United States", code: "US", scans: 56350, percentage: 38 },
  { country: "India", code: "IN", scans: 32623, percentage: 22 },
  { country: "Germany", code: "DE", scans: 20760, percentage: 14 },
  { country: "United Kingdom", code: "GB", scans: 16311, percentage: 11 },
  { country: "Japan", code: "JP", scans: 11863, percentage: 8 },
  { country: "Other Regions", code: "GL", scans: 10383, percentage: 7 },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    user: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    },
    action: "updated destination routing via Qora Brain",
    target: "Summer Launch Packaging",
    time: "14m ago",
    type: "brain_route",
  },
  {
    id: "act-2",
    user: {
      name: "Maya Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    },
    action: "created dynamic QR code",
    target: "SF Tech Week Badge Portal",
    time: "2h ago",
    type: "qr_create",
  },
  {
    id: "act-3",
    user: {
      name: "Qora Guardian",
      avatar: "",
    },
    action: "verified health across 42 active destinations",
    target: "100% link integrity verified",
    time: "3h ago",
    type: "guardian_check",
  },
  {
    id: "act-4",
    user: {
      name: "Jordan Lee",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
    },
    action: "invited team member Sarah Vance to",
    target: "Design Team",
    time: "6h ago",
    type: "member_invite",
  },
];

export const GUARDIAN_STATUS = {
  health: "healthy" as const,
  monitoredLinks: 42,
  healthyCount: 42,
  warningCount: 0,
  brokenCount: 0,
  uptime: "99.98%",
  avgLatency: "142ms",
  lastCheckTime: "2 mins ago",
  checkInterval: "Every 5 mins",
};
