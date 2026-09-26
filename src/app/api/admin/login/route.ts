import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Both email and password are required" },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdmin(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Invalid admin credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      email: authResult.email,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
