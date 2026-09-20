import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { CreatePageView } from "@/components/landing-pages/create/create-page-view";

export const metadata = {
  title: "New Destination — Landing Pages | NXTQR",
  description: "Choose a starter layout and create a destination experience for your QR codes.",
};

export default async function NewLandingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <CreatePageView orgSlug={orgSlug} />
    </div>
  );
}
