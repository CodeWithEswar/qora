export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "business";
  logoUrl?: string;
  membersCount: number;
  qrCount: number;
}

export const WORKSPACES: Organization[] = [
  {
    id: "org-1",
    name: "Acme Corp",
    slug: "acme-corp",
    plan: "pro",
    membersCount: 14,
    qrCount: 42,
  },
  {
    id: "org-2",
    name: "Starlight Media Agency",
    slug: "starlight-media",
    plan: "business",
    membersCount: 38,
    qrCount: 168,
  },
  {
    id: "org-3",
    name: "Alex's Sandbox",
    slug: "alex-sandbox",
    plan: "free",
    membersCount: 1,
    qrCount: 3,
  },
];

export const CURRENT_USER = {
  id: "usr-1",
  name: "Alex Rivera",
  email: "alex@acme.com",
  role: "Workspace Owner",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
};
