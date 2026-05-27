import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "luminary_session";

function authToken() {
  return process.env.LUMINARY_SESSION_TOKEN || "luminary-dev-session-token-change-me";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isLoginApi = pathname === "/api/auth/login";
  const isPublicAsset = pathname.startsWith("/_next/") || pathname === "/favicon.ico";
  const authenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === authToken();

  if (isPublicAsset || isLoginApi) return NextResponse.next();

  if (isLoginPage) {
    if (authenticated) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
