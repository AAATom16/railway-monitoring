import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";

  if (isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("railway-monitoring-session");
  const hasSession = !!sessionCookie?.value;

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow /login always – users with stale/expired session can reach it to re-auth.
  // (With valid session they can still visit /login; they’ll just see the form.)
  if (isLoginPage) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};
