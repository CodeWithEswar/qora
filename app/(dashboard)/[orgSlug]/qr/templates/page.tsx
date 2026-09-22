import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function QrTemplatesRedirectPage({ params }: PageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/templates`);
}
