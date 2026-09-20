import * as React from "react";
import { EmptyState } from "@/components/empty-state";

export function StudioEmpty({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <EmptyState
        preset="qrCodes"
        variant="card"
        title="No QR codes yet"
        description="Create your first managed QR asset to design custom module styles, live previews, and dynamic routing."
        action={{
          label: "Create First QR",
          href: `/${orgSlug}/qr/studio?create=true`,
        }}
      />
    </div>
  );
}
