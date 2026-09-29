import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getLocalOrder } from "@/lib/orders-store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit({ key: `order-lookup:${ip}`, limit: 30, windowMs: 60 * 1000 });
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    let order: any = null;

    if (isSupabaseConfigured) {
      try {
        const { data: byToken, error: tokenErr } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*)")
          .eq("confirmation_token", id)
          .maybeSingle();

        if (!tokenErr && byToken) {
          order = byToken;
        } else {
          const { data: byId } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", id)
            .maybeSingle();
          if (byId) order = byId;
        }
      } catch (err) {
        console.warn("API Order lookup DB notice:", err);
      }
    }

    if (!order) {
      order = getLocalOrder(id);
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (e: any) {
    console.error("Order lookup error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
