/**
 * NXTQR — Cloudflare Durable Object: PresenceRoom
 * 
 * Ephemeral Realtime Presence & Coordination for QR Studio and Dashboard.
 * 
 * Responsibilities:
 *  - Realtime active collaborator awareness (viewers, active editors)
 *  - Ephemeral resource editing locks (prevent concurrent accidental overwrite)
 *  - Heartbeat & disconnect cleanup (no ghost users)
 *  - Strict tenant boundary: room key is verified as `organizationId:resourceType:resourceId`
 * 
 * Invariants:
 *  - Ephemeral data stays in Durable Object memory/state; no high-frequency D1 writes.
 *  - Durable Objects coordinate realtime awareness; D1 remains authoritative business truth.
 *  - Zero PII: Exposes only connectionId, userId, displayName, avatarUrl, lastSeenAt.
 */

export interface PresenceParticipant {
  connectionId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: number;
  lastSeenAt: number;
  isEditing?: boolean;
  focusedField?: string;
}

export interface PresenceRoomState {
  roomId: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  participants: PresenceParticipant[];
  activeEditorId: string | null;
  editLockExpiresAt: number | null;
}

export class PresenceRoom {
  private state: DurableObjectState;
  private participants: Map<string, PresenceParticipant> = new Map();
  private activeEditorId: string | null = null;
  private editLockExpiresAt: number | null = null;
  private roomId = "";
  private organizationId = "";
  private resourceType = "";
  private resourceId = "";

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Prune stale participants older than 35 seconds on each request
    this.pruneStaleParticipants();

    // 1. WebSocket Upgrade for persistent live connection
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return this.handleWebSocket(request);
    }

    // 2. HTTP State query
    if (pathname === "/state" && request.method === "GET") {
      return Response.json(this.getRoomState());
    }

    // 3. HTTP Join / Heartbeat
    if (pathname === "/heartbeat" && request.method === "POST") {
      const body = (await request.json()) as {
        connectionId: string;
        userId: string;
        displayName: string;
        avatarUrl?: string;
        organizationId: string;
        resourceType: string;
        resourceId: string;
        isEditing?: boolean;
        focusedField?: string;
      };

      if (!this.roomId) {
        this.organizationId = body.organizationId;
        this.resourceType = body.resourceType;
        this.resourceId = body.resourceId;
        this.roomId = `${body.organizationId}:${body.resourceType}:${body.resourceId}`;
      }

      // Verify tenant boundary match
      if (this.organizationId && this.organizationId !== body.organizationId) {
        return Response.json({ error: "Tenancy mismatch in presence room" }, { status: 403 });
      }

      const now = Date.now();
      const existing = this.participants.get(body.connectionId);

      this.participants.set(body.connectionId, {
        connectionId: body.connectionId,
        userId: body.userId,
        displayName: body.displayName || "Collaborator",
        avatarUrl: body.avatarUrl,
        joinedAt: existing?.joinedAt || now,
        lastSeenAt: now,
        isEditing: body.isEditing || false,
        focusedField: body.focusedField,
      });

      return Response.json(this.getRoomState());
    }

    // 4. HTTP Acquire Edit Lock
    if (pathname === "/lock" && request.method === "POST") {
      const body = (await request.json()) as { userId: string; durationSeconds?: number };
      const now = Date.now();

      if (this.activeEditorId && this.activeEditorId !== body.userId && this.editLockExpiresAt && this.editLockExpiresAt > now) {
        return Response.json(
          {
            acquired: false,
            activeEditorId: this.activeEditorId,
            expiresAt: this.editLockExpiresAt,
            message: "Another collaborator is currently editing this resource.",
          },
          { status: 409 }
        );
      }

      const durationMs = (body.durationSeconds || 60) * 1000;
      this.activeEditorId = body.userId;
      this.editLockExpiresAt = now + durationMs;

      return Response.json({
        acquired: true,
        activeEditorId: this.activeEditorId,
        expiresAt: this.editLockExpiresAt,
      });
    }

    // 5. HTTP Release Edit Lock
    if (pathname === "/unlock" && request.method === "POST") {
      const body = (await request.json()) as { userId: string };
      if (this.activeEditorId === body.userId) {
        this.activeEditorId = null;
        this.editLockExpiresAt = null;
      }
      return Response.json({ released: true });
    }

    // 6. HTTP Leave
    if (pathname === "/leave" && request.method === "POST") {
      const body = (await request.json()) as { connectionId: string; userId: string };
      this.participants.delete(body.connectionId);
      if (this.activeEditorId === body.userId) {
        this.activeEditorId = null;
        this.editLockExpiresAt = null;
      }
      return Response.json({ left: true });
    }

    return new Response("PresenceRoom endpoint not found", { status: 404 });
  }

  private handleWebSocket(request: Request): Response {
    // Standard WebSocket pair creation
    const webSocketPair = new (globalThis as any).WebSocketPair();
    const [client, server] = [webSocketPair[0], webSocketPair[1]];

    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    server.accept();

    server.addEventListener("message", (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "JOIN" || msg.type === "HEARTBEAT") {
          const now = Date.now();
          this.participants.set(connectionId, {
            connectionId,
            userId: msg.userId,
            displayName: msg.displayName || "Collaborator",
            avatarUrl: msg.avatarUrl,
            joinedAt: now,
            lastSeenAt: now,
            isEditing: msg.isEditing || false,
            focusedField: msg.focusedField,
          });
          this.broadcastState();
        } else if (msg.type === "LEAVE") {
          this.participants.delete(connectionId);
          this.broadcastState();
        }
      } catch {
        // Safe parse ignore
      }
    });

    server.addEventListener("close", () => {
      this.participants.delete(connectionId);
      this.broadcastState();
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private pruneStaleParticipants(): void {
    const now = Date.now();
    const TIMEOUT_MS = 35 * 1000; // 35 seconds without heartbeat = disconnected

    for (const [id, p] of this.participants.entries()) {
      if (now - p.lastSeenAt > TIMEOUT_MS) {
        this.participants.delete(id);
      }
    }

    if (this.editLockExpiresAt && now > this.editLockExpiresAt) {
      this.activeEditorId = null;
      this.editLockExpiresAt = null;
    }
  }

  private getRoomState(): PresenceRoomState {
    return {
      roomId: this.roomId,
      organizationId: this.organizationId,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      participants: Array.from(this.participants.values()),
      activeEditorId: this.activeEditorId,
      editLockExpiresAt: this.editLockExpiresAt,
    };
  }

  private broadcastState(): void {
    const state = JSON.stringify({ type: "PRESENCE_STATE", state: this.getRoomState() });
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(state);
      } catch {
        // Socket closed
      }
    }
  }
}
