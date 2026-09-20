/**
 * NXTQR — Asynchronous Jobs & Queue Consumers Worker Entrypoint
 */

import { processScanEventsBatch } from "./consumers/scan-events";

export interface Env {
  DB: any; // Cloudflare D1Database
  SCAN_ANALYTICS?: any; // Cloudflare AnalyticsEngineDataset
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "event-worker" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Event worker does not accept public HTTP traffic" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  },

  async queue(batch: { queue: string; messages: Array<{ body: any }> }, env: Env): Promise<void> {
    if (batch.queue === "nxtqr-scan-telemetry") {
      await processScanEventsBatch(batch.messages, env);
    }
  },
};
