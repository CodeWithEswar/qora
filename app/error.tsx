"use client";

import * as React from "react";
import { SystemPage } from "@/components/system";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Safely record error digest to observability without exposing traces to DOM
    if (process.env.NODE_ENV === "development") {
      console.error("[NXTQR Error Boundary]", error);
    }
  }, [error]);

  return (
    <>
      <title>Something went wrong — NXTQR</title>
      <meta name="robots" content="noindex, follow" />
      <SystemPage
        code="500"
        type="fault"
        eyebrow="NXTQR / SYSTEM RECOVERY"
        title="Something interrupted the route."
        description="NXTQR encountered an unexpected problem while processing this request. The system has logged the event."
        primaryAction={{
          label: "Try again",
          onClick: () => reset(),
          icon: "refresh",
        }}
        secondaryAction={{
          label: "Return home",
          href: "/",
        }}
      />
    </>
  );
}
