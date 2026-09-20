"use client";

import React, { useEffect } from "react";
import type { LandingPageDocumentV1 } from "@nxtqr/contracts";
import { LandingPageRenderer } from "../renderer/landing-page-renderer";

interface PublicLandingPageClientProps {
  page: {
    id: string;
    name: string;
    slug: string;
  };
  versionId: string;
  document: LandingPageDocumentV1;
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function PublicLandingPageClient({
  page,
  versionId,
  document: doc,
}: PublicLandingPageClientProps) {
  // Asynchronous non-blocking visitor impression telemetry beacon
  useEffect(() => {
    try {
      fetch("/api/v1/landing-pages/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          eventType: "view",
          versionId,
          deviceType: getDeviceType(),
          referrer: window.document.referrer || "direct",
        }),
      }).catch((e) => {
        console.debug("[Telemetry Beacon] Ignored background view beacon error:", e);
      });
    } catch {
      // Non-blocking telemetry
    }
  }, [page.id, versionId]);

  // Asynchronous non-blocking CTA click telemetry beacon
  const handleActionClick = (actionId: string, actionType: string) => {
    try {
      fetch("/api/v1/landing-pages/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          eventType: "action_click",
          versionId,
          actionId,
          actionType,
          deviceType: getDeviceType(),
        }),
      }).catch((e) => {
        console.debug("[Telemetry Beacon] Ignored background action beacon error:", e);
      });
    } catch {
      // Non-blocking telemetry
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <LandingPageRenderer
        document={doc}
        mode="public"
        onActionClick={handleActionClick}
      />
    </div>
  );
}
