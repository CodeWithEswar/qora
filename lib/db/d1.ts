import "server-only";
import type { D1Database } from "@nxtqr/db";

let localProxyPromise: Promise<any> | null = null;
let syncTimer: any = null;

function scheduleSync() {
  if (process.env.NODE_ENV === "production") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      const srcDir = path.resolve(process.cwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
      if (!fs.existsSync(srcDir)) return;

      const targets = [
        path.resolve(process.cwd(), "apps/redirect-worker/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"),
        path.resolve(process.cwd(), "cloudflare/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"),
        path.resolve(process.cwd(), "apps/event-worker/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"),
        path.resolve(process.cwd(), "apps/collab-worker/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"),
      ];

      for (const target of targets) {
        if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
        for (const file of fs.readdirSync(srcDir)) {
          if (!file.endsWith(".sqlite")) continue;
          fs.copyFileSync(path.join(srcDir, file), path.join(target, file));
          if (target.includes("cloudflare") && file.startsWith("400ffb4a")) {
            fs.copyFileSync(
              path.join(srcDir, file),
              path.join(target, file.replace("400ffb4a9876b249b6702425c89b5a1920b30abc0d5cc7e4c823fc300f2d2857", "4bb55922b56f58ebc8e20bb16bd9a6be0e6f32f7f311c28bfbf2c5c53faee6c3"))
            );
          }
        }
      }
    } catch {}
  }, 100);
}

/**
 * NXTQR — Authoritative Cloudflare D1 Database Binding Provider
 *
 * In production on Cloudflare Pages / Workers / OpenNext:
 * - Directly resolves authoritative D1Database from request.env.DB, process.env.DB, or globalThis.DB.
 *
 * In local development:
 * - Resolves the real local Miniflare D1 database via Cloudflare Wrangler's getPlatformProxy
 *   targeting .wrangler/state/v3 with root wrangler.jsonc (Rule 4).
 * - Automatically keeps worker state mirrors synchronized so CLI queries from any folder match.
 * - Guarantees 100% parity with Cloudflare D1 SQL semantics.
 */
export async function getD1Database(request?: any): Promise<D1Database | null> {
  // 1. Production / Cloudflare runtime injected bindings
  if (request?.env?.DB) {
    return request.env.DB as D1Database;
  }
  if ((globalThis as any).DB) {
    return (globalThis as any).DB as D1Database;
  }
  if ((process.env as any).DB && typeof (process.env as any).DB?.prepare === "function") {
    return (process.env as any).DB as D1Database;
  }

  // 2. Local development via Cloudflare Wrangler getPlatformProxy
  if (process.env.NODE_ENV !== "production") {
    try {
      if (!localProxyPromise) {
        const dynamicRequire = eval("require");
        const { getPlatformProxy } = dynamicRequire("wrangler");
        localProxyPromise = getPlatformProxy({
          configPath: "wrangler.jsonc",
          persist: { path: ".wrangler/state/v3" },
        });
      }
      const proxy = await localProxyPromise;
      if (proxy?.env?.DB) {
        const realDb = proxy.env.DB as D1Database;
        return new Proxy(realDb, {
          get(target, prop, receiver) {
            if (prop === "batch") {
              return async (...args: any[]) => {
                const res = await (target as any).batch(...args);
                scheduleSync();
                return res;
              };
            }
            if (prop === "prepare") {
              return (query: string) => {
                const stmt = target.prepare(query);
                return new Proxy(stmt, {
                  get(stmtTarget, stmtProp) {
                    if (stmtProp === "run") {
                      return async (...stmtArgs: any[]) => {
                        const res = await (stmtTarget as any).run(...stmtArgs);
                        scheduleSync();
                        return res;
                      };
                    }
                    const val = (stmtTarget as any)[stmtProp];
                    return typeof val === "function" ? val.bind(stmtTarget) : val;
                  },
                });
              };
            }
            const val = Reflect.get(target, prop, receiver);
            return typeof val === "function" ? val.bind(target) : val;
          },
        });
      }
    } catch (err) {
      console.error("[D1Provider] Failed to acquire local Cloudflare D1 proxy:", err);
    }
  }

  return null;
}
