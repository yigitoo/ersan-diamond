import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Panel routes require auth (except login page)
  const isPanelRoute = pathname.startsWith("/panel");
  const isLoginPage = pathname === "/panel/login";
  const isApiPanelRoute = pathname.startsWith("/api/panel");

  // Allow public API routes
  if (pathname.startsWith("/api/") && !isApiPanelRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated on panel routes
  if (isPanelRoute && !isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/panel/login", req.url));
  }

  // Redirect to dashboard if already logged in on login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/panel/dashboard", req.url));
  }

  // Reject unauthenticated API panel requests
  if (isApiPanelRoute && !isLoggedIn) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/panel/:path*", "/api/panel/:path*"],
};
