import * as React from "react";
import { SystemPage } from "@/components/system";

export default function NotFound() {
  return (
    <>
      <title>Page not found — NXTQR</title>
      <meta name="robots" content="noindex, follow" />
      <SystemPage
        code="404"
        type="not-found"
        eyebrow="NXTQR / ROUTE RESOLUTION"
        title="This route went nowhere."
        description="The page you're looking for doesn't exist, may have moved, or is no longer available."
        primaryAction={{
          label: "Return home",
          href: "/",
          icon: "arrow",
        }}
        secondaryAction={{
          label: "Explore NXTQR",
          href: "/features",
        }}
      />
    </>
  );
}
