import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getLocalOrder } from "@/lib/orders-store";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitCheck = rateLimit({ ip, limit: 20, windowMs: 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many tracking attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const { orderNumber, mobileNumber } = await req.json();

    if (!orderNumber || !mobileNumber) {
      return NextResponse.json(
        { error: "Both Order ID and Mobile Number are required" },
        { status: 400 }
      );
    }

    // 1. Normalize Order ID: trim spaces, uppercase, and fix any double prefix like ILILAI-...
    let cleanOrderNumber = String(orderNumber).trim().toUpperCase();
    while (cleanOrderNumber.startsWith("ILILAI-") || cleanOrderNumber.startsWith("IL-ILAI-")) {
      cleanOrderNumber = cleanOrderNumber.replace(/^(IL-?)+ILAI-/i, "ILAI-");
    }

    // 2. Normalize Mobile Number: strip all non-digits, dashes, spaces, +91, and take last 10 digits
    const inputDigits = String(mobileNumber).replace(/\D/g, "");
    const cleanMobile = inputDigits.slice(-10);

    if (cleanMobile.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    let order: any = null;

    // 3. Query Supabase (persistent database)
    if (isSupabaseConfigured) {
      try {
        const { data: dbOrders, error } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*), order_status_history(*)")
          .eq("order_number", cleanOrderNumber);

        if (!error && dbOrders && dbOrders.length > 0) {
          const match = dbOrders.find((o: any) => {
            const dbDigits = String(o.customer_mobile || "").replace(/\D/g, "").slice(-10);
            return dbDigits === cleanMobile;
          });
          if (match) {
            order = match;
          }
        }
      } catch (dbErr) {
        console.warn("DB tracking query fallback:", dbErr);
      }
    }

    // 4. Secondary fallback to local store
    if (!order) {
      const local = getLocalOrder(cleanOrderNumber);
      if (local) {
        const localDigits = String(local.customer_mobile || "").replace(/\D/g, "").slice(-10);
        if (localDigits === cleanMobile) {
          order = local;
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "No order found matching this Order ID and Mobile Number. Please verify your details." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("Order tracking API error:", err);
    return NextResponse.json(
      { error: "Internal server error while tracking order" },
      { status: 500 }
    );
  }
}
