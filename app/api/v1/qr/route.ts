import { NextRequest, NextResponse } from "next/server";

/**
 * Compatibility alias: rewrites /api/v1/qr to canonical /api/v1/qrs
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/api/v1/qrs";
  return NextResponse.rewrite(url);
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/api/v1/qrs";
  return NextResponse.rewrite(url);
}
