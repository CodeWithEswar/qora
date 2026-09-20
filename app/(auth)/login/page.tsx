import type { Metadata } from "next";

import { AuthShell } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your NXTQR workspace.",
  robots: {
    index: false,
    follow: true,
  },
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    returnTo?: string | string[];
  }>;
}

/**
 * Only allow internal application paths.
 *
 * Prevents redirects such as:
 * /login?returnTo=https://malicious.example
 * /login?returnTo=//malicious.example
 */
function getSafeReturnTo(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const path = value.trim();

  if (!path.startsWith("/")) {
    return undefined;
  }

  if (path.startsWith("//")) {
    return undefined;
  }

  // Avoid returning directly into auth endpoints.
  if (
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/auth/")
  ) {
    return undefined;
  }

  return path;
}

function getErrorType(
  value: string | string[] | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const errorType = getErrorType(params.error);
  const returnTo = getSafeReturnTo(params.returnTo);

  return (
    <AuthShell
      mode="login"
      errorType={errorType}
      returnTo={returnTo}
    />
  );
}