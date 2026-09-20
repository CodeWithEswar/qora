import * as React from "react";
import { SystemPage } from "@/components/system";

export default function ForbiddenPage() {
  return (
    <>
      <title>Access restricted — NXTQR</title>
      <meta name="robots" content="noindex, follow" />
      <SystemPage
        code="403"
        type="forbidden"
        eyebrow="NXTQR / ACCESS CONTROL"
        title="This path is restricted."
        description="You're signed in, but your current workspace permissions don't allow access to this resource."
        primaryAction={{
          label: "Return to workspace",
          href: "/",
          icon: "arrow",
        }}
        secondaryAction={{
          label: "Return home",
          href: "/",
        }}
      />
    </>
  );
}
