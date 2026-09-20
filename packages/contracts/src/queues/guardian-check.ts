/**
 * NXTQR — Guardian Link Health Check Queue Job Contract
 */

import { z } from "zod";

export const GuardianCheckJobV1Schema = z.object({
  schemaVersion: z.literal(1),
  jobId: z.string(),
  destinationId: z.string(),
  qrId: z.string(),
  organizationId: z.string(),
  targetUrl: z.string().url(),
  timeoutMs: z.number().int().positive().default(5000),
  scheduledAt: z.number(),
});
export type GuardianCheckJobV1 = z.infer<typeof GuardianCheckJobV1Schema>;
