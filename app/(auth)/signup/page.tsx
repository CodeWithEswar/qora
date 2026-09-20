import { redirect } from "next/navigation";

interface SignUpPageProps {
  searchParams: Promise<{
    error?: string | string[];
    returnTo?: string | string[];
    plan?: string | string[];
  }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const search = new URLSearchParams();

  if (typeof params.returnTo === "string") {
    search.set("returnTo", params.returnTo);
  }
  if (typeof params.error === "string") {
    search.set("error", params.error);
  }

  const query = search.toString();
  redirect(`/login${query ? `?${query}` : ""}`);
}
