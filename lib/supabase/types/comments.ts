export type CommentContextType =
  | "qr"
  | "qr_code"
  | "approval"
  | "team"
  | "order"
  | "member"
  | "vehicle"
  | "campaign"
  | "route"
  | "incident"
  | "status_incident"
  | "journal"
  | "journal_article";

export type ThreadContextType = CommentContextType;

export type ThreadState = "OPEN" | "RESOLVED" | "LOCKED";

export interface ParticipantItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  initials: string;
  roleName?: string;
  role?: string;
}

export type ReplyToSnippet = {
  commentId: string;
  authorName: string;
  snippet: string;
};

export interface ThreadSummary {
  id: string;
  publicId: string; // e.g. 'THR-8K2F'
  organizationId: string;
  contextType: CommentContextType;
  contextId: string;
  contextTitle: string;
  contextRef: string; // e.g. 'QR-7F3K-9021', 'APR-8K2F'
  contextState?: string | null;
  contextUrl?: string;
  contextMetadata?: Record<string, any>;
  title: string;
  state: ThreadState;
  createdBy: ParticipantItem;
  resolvedBy?: { id: string; name: string; email?: string } | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  participants: ParticipantItem[];
  participantPreview: ParticipantItem[];
  commentCount: number;
  isUnread: boolean;
  isMentioned: boolean;
  unreadCount?: number;
  isCurrentUserParticipant?: boolean;
  mentionedCurrentMember?: boolean;
  references?: CommentReferenceItem[];
  latestComment?: {
    id?: string;
    publicId?: string;
    authorName: string;
    snippet?: string;
    bodySnippet?: string;
    createdAt: string;
  } | null;
  lastActivityAt: string;
  createdAt: string;
  availableActions: {
    canComment: boolean;
    canResolve: boolean;
    canReopen: boolean;
  };
}

export interface CommentReferenceItem {
  id: string;
  type?: CommentContextType;
  idRef?: string;
  publicRef?: string;
  title?: string;
  state?: string | null;
  referencedType?: string;
  referencedId?: string;
  referencedRef?: string;
  referencedTitle?: string;
  referencedState?: string | null;
  url?: string;
}

export interface CommentAttachmentItem {
  id: string;
  name: string;
  fileType: "IMAGE" | "DOCUMENT" | "LOG" | "image" | "document" | "log";
  mimeType: string;
  sizeBytes: number;
  url?: string;
  storagePath: string;
}

export interface CommentDTO {
  id: string;
  publicId: string; // e.g. 'CMT-3N7X'
  threadId: string;
  author: ParticipantItem;
  body: string;
  bodyFormat: string;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  isDeleted: boolean;
  replyTo?: ReplyToSnippet | null;
  mentions: Array<{ userId: string; displayName: string }>;
  references: CommentReferenceItem[];
  attachments: CommentAttachmentItem[];
  availableActions: {
    canEdit: boolean;
    canDelete: boolean;
    canReply: boolean;
  };
}

export interface ThreadDetail extends ThreadSummary {
  comments: CommentDTO[];
  topology: {
    peopleCount: number;
    referencesCount: number;
    state: ThreadState;
  };
}

export interface ThreadPulseMetrics {
  totalThreads?: number;
  threadsCount?: number;
  unreadCount: number;
  mentionsCount: number;
  unresolvedCount: number;
}

export interface CollaborationAtlasDomain {
  domain: string;
  contextType: CommentContextType;
  count: number;
  activeCount: number;
}

export interface CollaborationAtlasMetrics {
  totalThreads: number;
  domainBreakdown: CollaborationAtlasDomain[];
}

export type AttentionReason =
  | "mentioned"
  | "participated"
  | "review_required"
  | "created";

export interface ThreadFilters {
  view?: "all" | "for_you" | "my_threads" | "mentions" | "unread" | "unresolved";
  domain?: string | "all";
  state?: "all" | "open" | "resolved";
  search?: string;
  sort?: "latest_activity" | "oldest" | "most_comments";
}

export type ConstellationLens = "threads" | "resources" | "people";

export interface ConstellationNode {
  id: string;
  type: "person" | "thread" | "resource" | "revision";
  label: string;
  sublabel?: string;
  status?: "OPEN" | "RESOLVED" | "ACTIVE" | "PENDING";
  threadPublicId?: string;
  meta?: Record<string, any>;
  x: number; // grid percentage or column index
  y: number;
}

export interface ConstellationEdge {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  status?: "active" | "resolved";
}

export interface CommentContextDefinition {
  type: CommentContextType;
  label: string;
  domain: string;
  identifierPrefix: string;
  description: string;
}

export const CANONICAL_COMMENT_CONTEXTS: CommentContextDefinition[] = [
  {
    type: "qr",
    label: "QR Identity",
    domain: "QR Operations",
    identifierPrefix: "QR-",
    description: "Dynamic and static QR code assets, routing rules, and destinations.",
  },
  {
    type: "approval",
    label: "Approval Request",
    domain: "Approvals",
    identifierPrefix: "APR-",
    description: "Consequential operational governance decision.",
  },
  {
    type: "team",
    label: "Operational Team",
    domain: "Teams",
    identifierPrefix: "TM-",
    description: "Collaborative team reach and access domain boundaries.",
  },
  {
    type: "order",
    label: "Batch & Print Order",
    domain: "Operations",
    identifierPrefix: "ORD-",
    description: "Production and dispatch workflow for physical QR codes and print runs.",
  },
  {
    type: "member",
    label: "Organization Member",
    domain: "Identity & Access",
    identifierPrefix: "MEM-",
    description: "Operational member identity, role and privileges.",
  },
  {
    type: "campaign",
    label: "Campaign",
    domain: "Marketing",
    identifierPrefix: "CMP-",
    description: "Organized marketing grouping and attribution sets.",
  },
  {
    type: "route",
    label: "Smart Route",
    domain: "Routing / Brain",
    identifierPrefix: "RT-",
    description: "Dynamic edge destination and conditional redirection.",
  },
  {
    type: "incident",
    label: "Status Incident",
    domain: "Guardian / Status",
    identifierPrefix: "INC-",
    description: "Operational system incident and remediation context.",
  },
  {
    type: "journal",
    label: "Release / Note",
    domain: "Platform / Updates",
    identifierPrefix: "REL-",
    description: "Campaign updates, editorial notes, and documentation.",
  },
];
