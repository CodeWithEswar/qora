/**
 * NXTQR — Standard Domain Event Envelope
 * Uniform structure for all cross-domain and asynchronous queue messages.
 */

export interface EventActor {
  id: string;
  type: "user" | "system" | "api_key" | "webhook";
  organizationId?: string;
}

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: number; // Unix epoch ms
  organizationId: string;
  actor: EventActor;
  data: T;
  traceId?: string;
}

export function createDomainEvent<T>(params: {
  eventType: string;
  version?: number;
  organizationId: string;
  actor: EventActor;
  data: T;
  traceId?: string;
}): DomainEvent<T> {
  return {
    eventId: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    eventType: params.eventType,
    version: params.version ?? 1,
    occurredAt: Date.now(),
    organizationId: params.organizationId,
    actor: params.actor,
    data: params.data,
    traceId: params.traceId,
  };
}
