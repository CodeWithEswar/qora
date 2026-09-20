import * as React from "react";
import type { Metadata } from "next";
import { SystemPage } from "@/components/system";

export const metadata: Metadata = {
  title: "Authentication required",
  description: "Sign in with Google to continue securely to this NXTQR resource.",
  robots: {
    index: false,
    follow: true,
  },
};

interface Page401Props {
  searchParams: Promise<{
    returnTo?: string;
  }>;
}

export default async function Page401({ searchParams }: Page401Props) {
  const params = await searchParams;
  const returnTo =
    typeof params.returnTo === "string" &&
    params.returnTo.startsWith("/") &&
    !params.returnTo.startsWith("//")
      ? params.returnTo
      : undefined;

  const loginHref = returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/login";

  return (
    <SystemPage
      code="401"
      type="unauthorized"
      eyebrow="NXTQR / IDENTITY REQUIRED"
      title="Identity required."
      description="Sign in with Google to continue securely to this NXTQR resource."
      primaryAction={{
        label: "Sign in",
        href: loginHref,
        icon: "arrow",
      }}
      secondaryAction={{
        label: "Return home",
        href: "/",
      }}
    />
  );
}
