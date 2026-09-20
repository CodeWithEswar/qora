"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { DynamicQrError } from "@/components/dynamic-qr/dynamic-qr-error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "default";

  React.useEffect(() => {
    console.error("[DynamicQrPage] Unexpected error:", error);
  }, [error]);

  return (
    <DynamicQrError
      orgSlug={orgSlug}
      onRetry={reset}
      message={error.message || "We couldn't retrieve its current configuration."}
    />
  );
}
