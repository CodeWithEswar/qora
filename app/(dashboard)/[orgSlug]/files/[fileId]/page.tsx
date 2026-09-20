import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseFilesRepository } from "@/lib/supabase/repositories/files";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetConstellation } from "@/components/files/inspector/asset-constellation";

export const metadata = {
  title: "Asset Details — Asset Vault | NXTQR",
  description: "Detailed dependency tree and infrastructure usage for asset.",
};

interface DetailPageProps {
  params: Promise<{ orgSlug: string; fileId: string }>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

export default async function FileDetailPage({ params }: DetailPageProps) {
  const { orgSlug, fileId } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  const file = await SupabaseFilesRepository.getFileById(org.id, fileId, orgSlug);
  if (!file) {
    notFound();
  }

  const usages = file.usages;

  const isImage = file.category === "IMAGE";
  const isDocument = file.category === "DOCUMENT";

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Link href={`/${orgSlug}`} className="hover:text-foreground hover:underline">
              Workspace
            </Link>
            <span className="opacity-40">/</span>
            <Link href={`/${orgSlug}/files`} className="hover:text-foreground hover:underline">
              Files
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground font-semibold truncate max-w-xs">{file.name}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            <h1 className="text-2xl font-bold font-serif text-foreground truncate">{file.name}</h1>
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
            >
              {file.status}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-mono uppercase">
              {file.category}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${orgSlug}/files`}>
            <Button variant="outline" size="sm" className="text-xs cursor-pointer">
              <NxtqrIcon icon="solar:arrow-left-linear" size={14} className="mr-1" />
              Back to Files
            </Button>
          </Link>
          <a href={file.publicUrl} download={file.originalName || file.name} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-[#FA520F] hover:bg-[#FA520F]/90 text-white text-xs gap-1.5 cursor-pointer">
              <NxtqrIcon icon="solar:download-minimalistic-linear" size={14} />
              Download Binary
            </Button>
          </a>
        </div>
      </div>

      {/* Main Grid: Preview & Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="h-96 w-full flex items-center justify-center p-6 bg-muted/10 relative">
              {isImage ? (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, rgba(128, 128, 128, 0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(128, 128, 128, 0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(128, 128, 128, 0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(128, 128, 128, 0.08) 75%)",
                    backgroundSize: "20px 20px",
                  }}
                >
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="max-h-full max-w-full object-contain rounded drop-shadow-md"
                  />
                </div>
              ) : isDocument ? (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                    <NxtqrIcon icon="solar:document-text-bold" size={44} />
                  </div>
                  <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {file.extension || "PDF"} Document
                  </span>
                  <span className="text-xs font-mono text-muted-foreground mt-1">
                    {formatBytes(file.sizeBytes)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <NxtqrIcon icon="solar:file-bold" size={48} className="text-muted-foreground mb-2" />
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    .{file.extension || "FILE"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Asset Constellation Tree */}
          <AssetConstellation
            fileName={file.name}
            usages={usages}
            orgSlug={orgSlug}
          />
        </div>

        {/* Right: Technical Specs & Metadata */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <NxtqrIcon icon="solar:database-bold" size={15} className="text-[#FA520F]" />
              Technical Identity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-mono font-medium text-foreground">{formatBytes(file.sizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">MIME Type</span>
                <span className="font-mono text-foreground">{file.mimeType}</span>
              </div>
              {file.dimensions?.width && file.dimensions?.height && (
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="font-mono text-foreground">{file.dimensions.width} × {file.dimensions.height} px</span>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Storage Bucket</span>
                <span className="font-mono text-foreground">{file.bucket || "qr-assets"}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(file.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total In-Use</span>
                <span className="font-mono font-semibold text-foreground">{usages.length} locations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
