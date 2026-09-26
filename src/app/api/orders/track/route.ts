import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getLocalOrder } from "@/lib/orders-store";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitCheck = rateLimit({ ip, limit: 15, windowMs: 60 * 1000 });

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

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanMobile = mobileNumber.trim().replace(/^(\+91|91)/, '');

    let order: any = null;

    if (isSupabaseConfigured) {
      try {
        const { data: dbOrder, error } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*), order_status_history(*)")
          .eq("order_number", cleanOrderNumber)
          .eq("customer_mobile", cleanMobile)
          .single();

        if (!error && dbOrder) {
          order = dbOrder;
        }
      } catch (dbErr) {
        console.warn("DB tracking query fallback:", dbErr);
      }
    }

    if (!order) {
      const local = getLocalOrder(cleanOrderNumber);
      if (local && (local.customer_mobile.replace(/^(\+91|91)/, '') === cleanMobile || local.customer_mobile === cleanMobile)) {
        order = local;
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
