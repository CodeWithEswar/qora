import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await clearSession();
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.delete("nxtqr_session");
  return response;
}

export async function GET(request: NextRequest) {
  await clearSession();
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.delete("nxtqr_session");
  return response;
}
