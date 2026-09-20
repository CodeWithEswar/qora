/**
 * NXTQR — Internal Domain Event Type Registry
 * Canonical string constants for all published internal domain events.
 */

export const INTERNAL_EVENT_TYPES = {
  // QR Domain
  QR_CREATED: "qr.created",
  QR_VERSION_CREATED: "qr.version.created",
  QR_PUBLISHED: "qr.published",
  QR_DESTINATION_CHANGED: "qr.destination.changed",
  QR_RULE_CHANGED: "qr.rule.changed",

  // Campaigns
  CAMPAIGN_CREATED: "campaign.created",
  CAMPAIGN_UPDATED: "campaign.updated",
  CAMPAIGN_ARCHIVED: "campaign.archived",
  CAMPAIGN_DELETED: "campaign.deleted",
  CAMPAIGN_QR_ADDED: "campaign.qr_added",
  CAMPAIGN_QR_REMOVED: "campaign.qr_removed",

  // Folders & Asset Organization
  FOLDER_CREATED: "folder.created",
  FOLDER_UPDATED: "folder.updated",
  FOLDER_ARCHIVED: "folder.archived",
  FOLDER_DELETED: "folder.deleted",
  FOLDER_QR_ADDED: "folder.qr_added",
  FOLDER_QR_REMOVED: "folder.qr_removed",
  FOLDER_QR_MOVED: "folder.qr_moved",

  // Collaboration
  COMMENT_CREATED: "comment.created",
  APPROVAL_REQUESTED: "approval.requested",
  APPROVAL_APPROVED: "approval.approved",

  // Organizations & Members
  MEMBER_INVITED: "member.invited",

  // Billing (Provider-neutral internal facts)
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_CHANGED: "subscription.changed",
  PAYMENT_SUCCEEDED: "payment.succeeded",

  // Guardian
  QR_LINK_UNHEALTHY: "qr.link.unhealthy",
  QR_LINK_RECOVERED: "qr.link.recovered",

  // Reports
  REPORT_REQUESTED: "report.requested",
  REPORT_COMPLETED: "report.completed",

  // Webhooks
  WEBHOOK_DELIVERY_FAILED: "webhook.delivery.failed",
} as const;

export type InternalEventType = (typeof INTERNAL_EVENT_TYPES)[keyof typeof INTERNAL_EVENT_TYPES];
