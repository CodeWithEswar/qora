import * as React from "react";
import { SystemPage } from "@/components/system";

export default function UnauthorizedPage() {
  return (
    <>
      <title>Authentication required — NXTQR</title>
      <meta name="robots" content="noindex, follow" />
      <SystemPage
        code="401"
        type="unauthorized"
        eyebrow="NXTQR / IDENTITY REQUIRED"
        title="Identity required."
        description="Sign in with Google to continue securely to this NXTQR resource."
        primaryAction={{
          label: "Sign in",
          href: "/login",
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
