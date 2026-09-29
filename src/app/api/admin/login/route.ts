import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";
import {
  getClientIp,
  rateLimit,
  checkLoginLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/rate-limit";
import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Both email and password are required" },
        { status: 400 }
      );
    }

    // 1. Check Brute-Force Lockout
    const lockoutStatus = checkLoginLockout(ip);
    if (lockoutStatus.isLocked) {
      // Allow legitimate admin with correct password to bypass lockout
      const testAuth = await authenticateAdmin(email, password);
      if (!testAuth.success) {
        return NextResponse.json(
          {
            error: `Too many failed login attempts. This IP address is locked out for ${lockoutStatus.remainingMinutes || 15} minutes.`,
            locked: true,
            remainingMinutes: lockoutStatus.remainingMinutes,
          },
          { status: 429 }
        );
      }
    }

    // 2. Sliding Window Rate Limiting (max 10 login requests per minute per IP)
    const limitCheck = rateLimit({
      key: `admin_login_rate:${ip}`,
      limit: 10,
      windowMs: 60 * 1000,
    });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many login requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    // 3. Attempt Authentication
    const authResult = await authenticateAdmin(email, password);

    // 4. Handle Failed Authentication
    if (!authResult.success) {
      const failRecord = recordFailedLogin(ip);

      if (failRecord.isLocked) {
        return NextResponse.json(
          {
            error: "Too many failed login attempts. Your IP address has been locked out for 15 minutes.",
            locked: true,
            remainingMinutes: 15,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid admin credentials. ${failRecord.remainingAttempts} attempt(s) remaining before lockout.`,
          remainingAttempts: failRecord.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 5. Successful Authentication: Reset lockout immediately
    recordSuccessfulLogin(ip);

    // Create cryptographically signed HMAC-SHA256 session token
    const token = await createAdminToken(authResult.email || email);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      email: authResult.email,
      timestamp: Date.now(),
    });

    // Set secure HTTP-Only cookie (prevent client script theft)
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
