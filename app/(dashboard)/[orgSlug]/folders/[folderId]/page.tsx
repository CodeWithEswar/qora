import * as React from "react";
import { Metadata } from "next";
import { FolderDetailWorkspace } from "@/components/folders/folder-detail/folder-detail-workspace";

export const metadata: Metadata = {
  title: "Folder Space — QR Asset Organization Workspace | NXTQR",
  description: "Focused workspace organizing QR assets, routing topologies, and scan signals.",
};

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; folderId: string }>;
}) {
  const { orgSlug, folderId } = await params;

  return <FolderDetailWorkspace orgSlug={orgSlug} folderId={folderId} />;
}
