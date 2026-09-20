/**
 * NXTQR — HTTP API V1 Experiment Resource Contracts
 * Owned by Routing Domain (Phase 3). Validates variants and integer weights sum.
 */

import { z } from "zod";

export const ExperimentVariantInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(64),
  destinationUrl: z.string().url("destinationUrl must be a valid URL"),
  trafficWeight: z
    .number()
    .int()
    .min(1, "Weight must be at least 1")
    .max(10000, "Weight cannot exceed 10000"),
});
export type ExperimentVariantInput = z.infer<typeof ExperimentVariantInputSchema>;

export const CreateExperimentRequestV1Schema = z
  .object({
    qrId: z.string().min(1, "qrId is required"),
    name: z.string().min(1, "Experiment name is required").max(100),
    description: z.string().max(500).optional(),
    variants: z.array(ExperimentVariantInputSchema).min(2, "At least 2 variants are required"),
  })
  .refine(
    (data) => {
      const totalWeight = data.variants.reduce((sum, v) => sum + v.trafficWeight, 0);
      return totalWeight === 100 || totalWeight === 10000;
    },
    {
      message: "Variant traffic weights must sum to exactly 100 (percentage) or 10000 (basis points)",
      path: ["variants"],
    }
  );
export type CreateExperimentRequestV1 = z.infer<typeof CreateExperimentRequestV1Schema>;

export const ExperimentResponseV1Schema = z.object({
  id: z.string(),
  qrId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "completed"]),
  variants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      destinationUrl: z.string(),
      trafficWeight: z.number(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ExperimentResponseV1 = z.infer<typeof ExperimentResponseV1Schema>;
