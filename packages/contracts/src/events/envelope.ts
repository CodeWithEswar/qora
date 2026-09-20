/**
 * NXTQR — Internal Domain Event Envelope Contract
 * System-wide integration facts describing business facts that have already occurred.
 * Minimal payloads, zero secrets, facts not commands.
 */

import { z } from "zod";

export const EventActorSchema = z.object({
  type: z.enum(["user", "api_key", "system", "provider"]),
  id: z.string(),
});
export type EventActor = z.infer<typeof EventActorSchema>;

export const EventResourceSchema = z.object({
  type: z.string(),
  id: z.string(),
});
export type EventResource = z.infer<typeof EventResourceSchema>;

export const InternalEventEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  schemaVersion: z.literal(1),
  occurredAt: z.string().datetime({ message: "occurredAt must be a valid ISO 8601 UTC timestamp" }),
  organizationId: z.string().min(1),
  actor: EventActorSchema,
  resource: EventResourceSchema,
  data: z.record(z.string(), z.unknown()),
});
export type InternalEventEnvelope<T = Record<string, unknown>> = Omit<
  z.infer<typeof InternalEventEnvelopeSchema>,
  "data"
> & {
  data: T;
};

/**
 * Factory to create a valid InternalEventEnvelope
 */
export function createInternalEvent<T extends Record<string, unknown>>(params: {
  eventType: string;
  organizationId: string;
  actor: EventActor;
  resource: EventResource;
  data: T;
  occurredAt?: string;
  eventId?: string;
}): InternalEventEnvelope<T> {
  const eventId = params.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const occurredAt = params.occurredAt || new Date().toISOString();

  return {
    eventId,
    eventType: params.eventType,
    schemaVersion: 1,
    occurredAt,
    organizationId: params.organizationId,
    actor: params.actor,
    resource: params.resource,
    data: params.data,
  };
}
