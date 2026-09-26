import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getAllLocalOrders } from "@/lib/orders-store";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    let orders: Order[] = [];

    // 1. Attempt query from Supabase only if configured
    if (isSupabaseConfigured) {
      try {
        let dbQuery = supabaseAdmin
          .from("orders")
          .select("*, order_items(*), order_status_history(*)")
          .order("created_at", { ascending: false });

      if (status && status !== "All") {
        dbQuery = dbQuery.eq("order_status", status);
      }

      if (query) {
        const cleanQ = query.trim();
        dbQuery = dbQuery.or(`order_number.ilike.%${cleanQ}%,customer_name.ilike.%${cleanQ}%,customer_mobile.ilike.%${cleanQ}%`);
      }

      const { data: dbOrders, error } = await dbQuery;
      if (!error && dbOrders && dbOrders.length > 0) {
        orders = dbOrders;
      }
      } catch (e) {
        // Supabase unconfigured or offline
      }
    }

    // 2. If Supabase has no orders (or unconfigured), load from local persistent store
    if (orders.length === 0) {
      const localOrders = getAllLocalOrders();
      let filtered = localOrders;

      if (status && status !== "All") {
        filtered = filtered.filter((o) => o.order_status === status);
      }

      if (query) {
        const qLower = query.trim().toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.order_number.toLowerCase().includes(qLower) ||
            o.customer_name.toLowerCase().includes(qLower) ||
            o.customer_mobile.includes(qLower) ||
            o.customer_email.toLowerCase().includes(qLower)
        );
      }

      orders = filtered;
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.warn("Admin orders API error:", err?.message || err);
    return NextResponse.json({ success: true, orders: getAllLocalOrders() });
  }
}
