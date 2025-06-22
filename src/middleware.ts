import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    // Get the full path including search params
    const redirectUrl = encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(
      new URL(`/sign-in?redirect=${redirectUrl}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard"],
};
