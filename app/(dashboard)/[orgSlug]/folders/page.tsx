import * as React from "react";
import { Metadata } from "next";
import { FoldersWorkspace } from "@/components/folders/folders-workspace";

export const metadata: Metadata = {
  title: "Folders — QR Asset Organization Workspace | NXTQR",
  description: "Organize QR assets into focused spaces without changing their scan identity or routing rules.",
};

export default async function FoldersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return <FoldersWorkspace orgSlug={orgSlug} />;
}
