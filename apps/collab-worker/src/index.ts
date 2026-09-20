/**
 * NXTQR — Collaboration & Realtime Presence Worker (Cloudflare Free Tier Compatible)
 * Standard Worker using WebSockets and in-memory room coordination.
 */

import { PresenceRoom } from "./presence-room";

export { PresenceRoom };

export interface Env {
  DB?: any; // Cloudflare D1Database
}

const activeRooms = new Map<string, PresenceRoom>();

function getOrCreateRoom(roomKey: string): PresenceRoom {
  let room = activeRooms.get(roomKey);
  if (!room) {
    room = new PresenceRoom();
    activeRooms.set(roomKey, room);
  }
  return room;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "collab-worker", tier: "free" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    // Extract room key: /rooms/:organizationId/:resourceType/:resourceId
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "rooms" && parts.length >= 4) {
      const organizationId = parts[1];
      const resourceType = parts[2];
      const resourceId = parts[3];
      const roomKey = `${organizationId}:${resourceType}:${resourceId}`;

      const room = getOrCreateRoom(roomKey);

      // Forward remaining path (e.g. /state, /heartbeat, /lock, /unlock, /leave, or websocket upgrade)
      const subPath = "/" + parts.slice(4).join("/");
      const forwardUrl = new URL(request.url);
      forwardUrl.pathname = subPath || "/";

      return room.fetch(new Request(forwardUrl.toString(), request));
    }

    return new Response(JSON.stringify({ error: "Invalid presence room route" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  },
};
