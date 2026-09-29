import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public admin login endpoints
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    // If admin is already authenticated and visits /admin/login, redirect to /admin dashboard
    if (pathname === "/admin/login") {
      const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (token) {
        try {
          const { valid } = await verifyAdminToken(token);
          if (valid) {
            return NextResponse.redirect(new URL("/admin", req.url));
          }
        } catch (e) {
          // Token invalid, allow login page
        }
      }
    }
    return NextResponse.next();
  }

  // 2. Extract token from cookie (or Bearer header for API tools)
  const tokenFromCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  let token = tokenFromCookie;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 3. Verify session token
  let valid = false;
  if (token) {
    try {
      const result = await verifyAdminToken(token);
      valid = Boolean(result.valid);
    } catch (e) {
      valid = false;
    }
  }

  // 4. API routes: return 401 JSON if unauthorized
  if (pathname.startsWith("/api/admin")) {
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Valid admin session required to access this endpoint",
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 5. Page routes (/admin, /admin/orders, /admin/settings, etc.): redirect to /admin/login
  if (pathname.startsWith("/admin")) {
    if (!valid) {
      const loginUrl = new URL("/admin/login", req.url);
      if (pathname !== "/admin") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
