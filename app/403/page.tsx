import * as React from "react";
import type { Metadata } from "next";
import { SystemPage } from "@/components/system";

export const metadata: Metadata = {
  title: "Access restricted",
  description: "You're signed in, but your current workspace permissions don't allow access to this resource.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page403() {
  return (
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
  );
}
