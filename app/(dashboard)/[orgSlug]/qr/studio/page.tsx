"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { QrStudio } from "@/components/qr-studio/qr-studio";
import { StudioLoadingSkeleton } from "@/components/qr-studio/states/studio-loading";
import { StudioEmpty } from "@/components/qr-studio/states/studio-empty";
import { StudioError } from "@/components/qr-studio/states/studio-error";

export default function NxtqrStudioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orgSlug = (params?.orgSlug as string) || "workspace";
  const requestedId = searchParams.get("id");
  const isCreateIntent = searchParams.get("create") === "true";

  const [activeQrId, setActiveQrId] = React.useState<string | null>(requestedId);
  const [isLoading, setIsLoading] = React.useState(!requestedId);
  const [hasZeroQrs, setHasZeroQrs] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // If no explicit ID is provided, query D1 for the user's latest QR or handle create intent
  React.useEffect(() => {
    if (requestedId) {
      setActiveQrId(requestedId);
      setIsLoading(false);
      return;
    }

    async function resolveActiveQr() {
      setIsLoading(true);
      setError(null);
      try {
        // If user wants to create a new QR: create real record in D1
        if (isCreateIntent) {
          const createRes = await fetch("/api/v1/qrs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-organization-slug": orgSlug,
            },
            body: JSON.stringify({
              name: "New QR Asset",
              type: "url",
              mode: "static",
              destinationUrl: "https://nxtqr.vercel.app",
            }),
          });

          if (createRes.ok) {
            const json = await createRes.json();
            const newId = json.data.id;
            setActiveQrId(newId);
            router.replace(`/${orgSlug}/qr/studio?id=${newId}`);
            setIsLoading(false);
            return;
          } else {
            const errJson = await createRes.json().catch(() => null);
            setError(errJson?.error?.message || "Failed to create QR code asset.");
            setIsLoading(false);
            return;
          }
        }

        // Otherwise list existing QRs from database
        const res = await fetch("/api/v1/qrs?limit=1", {
          headers: {
            "x-organization-slug": orgSlug,
          },
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          setError(errJson?.error?.message || "Failed to load organization QR assets.");
          setIsLoading(false);
          return;
        }

        const json = await res.json();
        const items = json.data || [];

        if (items.length > 0) {
          const firstId = items[0].id;
          setActiveQrId(firstId);
          router.replace(`/${orgSlug}/qr/studio?id=${firstId}`);
        } else {
          // Zero Fake Data: True empty state with Q monogram
          setHasZeroQrs(true);
        }
      } catch (err: any) {
        setError(err.message || "Network error loading QR Studio.");
      } finally {
        setIsLoading(false);
      }
    }

    resolveActiveQr();
  }, [requestedId, isCreateIntent, orgSlug, router]);

  if (isLoading) {
    return <StudioLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <StudioError message={error} orgSlug={orgSlug} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (hasZeroQrs || !activeQrId) {
    return (
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <StudioEmpty orgSlug={orgSlug} />
      </div>
    );
  }

  return <QrStudio orgSlug={orgSlug} qrId={activeQrId} />;
}
