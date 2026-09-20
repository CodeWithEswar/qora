import { redirect } from "next/navigation";

export default async function LegacyBrainPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/routes`);
}
