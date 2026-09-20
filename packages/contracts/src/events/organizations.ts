/**
 * NXTQR — Organization Internal Domain Event Schemas
 * Never include invitation plaintext tokens or secrets.
 */

import { z } from "zod";

export const MemberInvitedEventDataSchema = z.object({
  invitationId: z.string(),
  organizationId: z.string(),
  roleId: z.string(),
  invitedBy: z.string(),
});
export type MemberInvitedEventData = z.infer<typeof MemberInvitedEventDataSchema>;
