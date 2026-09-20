/**
 * NXTQR Empty State System — Centralized Module Presets
 *
 * Provides official product copy, deterministic initial letter, and semantic
 * actions for all NXTQR modules and cards.
 */

export interface EmptyStatePreset {
  module: string;
  letter: string;
  title: string;
  description: string;
  actionLabel?: string;
  staggerBaseDelay?: number;
}

export const EMPTY_STATE_PRESETS: Record<string, EmptyStatePreset> = {
  qrCodes: {
    module: "QR Codes",
    letter: "Q",
    title: "No QR codes yet",
    description: "Create your first managed QR asset.",
    actionLabel: "Create QR",
    staggerBaseDelay: 0,
  },
  campaigns: {
    module: "Campaigns",
    letter: "C",
    title: "No campaigns yet",
    description: "Group QR assets into campaigns to organize and measure them together.",
    actionLabel: "Create campaign",
    staggerBaseDelay: 200,
  },
  folders: {
    module: "Folders",
    letter: "F",
    title: "No folders yet",
    description: "Create a folder to organize your QR assets.",
    actionLabel: "Create folder",
    staggerBaseDelay: 100,
  },
  analytics: {
    module: "Analytics",
    letter: "A",
    title: "No scan signals yet",
    description: "When your QR codes are scanned, their analytics will appear here.",
    actionLabel: "View QR Codes",
    staggerBaseDelay: 0,
  },
  filteredAnalytics: {
    module: "Analytics",
    letter: "A",
    title: "No scan signals match this view",
    description: "Try adjusting your date range or clearing active filters to see more results.",
    actionLabel: "Clear filters",
    staggerBaseDelay: 0,
  },
  routes: {
    module: "Routes",
    letter: "R",
    title: "No routing rules yet",
    description: "Add routing logic to send scans to the right destination.",
    actionLabel: "Create route",
    staggerBaseDelay: 300,
  },
  experiments: {
    module: "Experiments",
    letter: "E",
    title: "No experiments yet",
    description: "Create an experiment when you're ready to compare destination experiences.",
    actionLabel: "Create experiment",
    staggerBaseDelay: 150,
  },
  guardian: {
    module: "Guardian",
    letter: "G",
    title: "Nothing is being monitored yet",
    description: "Add an eligible destination to Guardian to begin health monitoring.",
    actionLabel: "Configure Guardian",
    staggerBaseDelay: 240,
  },
  members: {
    module: "Members",
    letter: "M",
    title: "No members yet",
    description: "Invite people to collaborate in this workspace.",
    actionLabel: "Invite members",
    staggerBaseDelay: 120,
  },
  teams: {
    module: "Teams",
    letter: "T",
    title: "No teams yet",
    description: "Group members around products, campaigns or responsibilities.",
    actionLabel: "Create team",
    staggerBaseDelay: 240,
  },
  roles: {
    module: "Roles",
    letter: "R",
    title: "No custom roles yet",
    description: "Create custom roles to define granular access control.",
    actionLabel: "Create role",
    staggerBaseDelay: 200,
  },
  invitations: {
    module: "Invitations",
    letter: "I",
    title: "No pending invitations",
    description: "New workspace invitations will appear here.",
    staggerBaseDelay: 150,
  },
  approvals: {
    module: "Approvals",
    letter: "A",
    title: "Nothing awaiting approval",
    description: "New approval requests will appear here.",
    staggerBaseDelay: 180,
  },
  brand: {
    module: "Brand Kits",
    letter: "B",
    title: "No brand kits yet",
    description: "Save logos, primary hex colors, and custom frame designs for team consistency.",
    actionLabel: "Create Brand Kit",
    staggerBaseDelay: 150,
  },
  apiKeys: {
    module: "API Keys",
    letter: "A",
    title: "No API keys",
    description: "Create an API key when you're ready to connect NXTQR to your stack.",
    actionLabel: "Create API key",
    staggerBaseDelay: 220,
  },
  webhooks: {
    module: "Webhooks",
    letter: "W",
    title: "No webhook endpoints",
    description: "Add an endpoint to receive supported NXTQR events.",
    actionLabel: "Add endpoint",
    staggerBaseDelay: 260,
  },
  domains: {
    module: "Domains",
    letter: "D",
    title: "No custom domains",
    description: "Connect a domain when you want branded QR destinations.",
    actionLabel: "Add domain",
    staggerBaseDelay: 180,
  },
  locations: {
    module: "Locations",
    letter: "L",
    title: "No geographic data yet",
    description: "Location density will calculate automatically as global scans occur.",
    staggerBaseDelay: 280,
  },
  devices: {
    module: "Devices",
    letter: "D",
    title: "No device telemetry yet",
    description: "Device distributions will populate once scans are recorded.",
    staggerBaseDelay: 320,
  },
  activity: {
    module: "Activity",
    letter: "A",
    title: "No activity yet",
    description: "Meaningful organization changes will appear here.",
    staggerBaseDelay: 160,
  },
  audit: {
    module: "Audit",
    letter: "A",
    title: "No audit logs yet",
    description: "Meaningful security and organization audit events will appear here.",
    staggerBaseDelay: 160,
  },
  search: {
    module: "Search",
    letter: "S",
    title: "No matching results",
    description: "Try another search query or clear your current filters.",
    actionLabel: "Clear filters",
    staggerBaseDelay: 0,
  },
  notifications: {
    module: "Notifications",
    letter: "N",
    title: "No notifications yet",
    description: "System alerts and scan notifications will appear here.",
    staggerBaseDelay: 0,
  },
  comments: {
    module: "Comments",
    letter: "C",
    title: "No comments yet",
    description: "Start a conversation around this resource.",
    actionLabel: "Add comment",
    staggerBaseDelay: 100,
  },
  versions: {
    module: "Versions",
    letter: "V",
    title: "No version history yet",
    description: "Saved and published changes create immutable revision snapshots here.",
    staggerBaseDelay: 140,
  },
  shares: {
    module: "Shares",
    letter: "S",
    title: "No share links yet",
    description: "Create a controlled external view without granting workspace access.",
    actionLabel: "Create share link",
    staggerBaseDelay: 180,
  },
  portals: {
    module: "Client Portals",
    letter: "P",
    title: "No client portals yet",
    description: "Share an allowlisted collection of campaigns and reports with external clients.",
    actionLabel: "Create portal",
    staggerBaseDelay: 220,
  },
  payments: {
    module: "Payments",
    letter: "P",
    title: "No payments yet",
    description: "Completed billing transactions and Cashfree receipts will appear here.",
    staggerBaseDelay: 100,
  },
};

/**
 * Safely extracts the first alphabetic letter from a module name.
 * e.g. "QR Codes" -> "Q", "API Keys" -> "A", "Brand Kits" -> "B"
 */
export function getInitial(moduleName?: string): string {
  if (!moduleName) return "Q";
  const cleaned = moduleName.trim().replace(/^[^a-zA-Z]+/, "");
  return (cleaned.charAt(0) || "Q").toUpperCase();
}
