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

    // 3. Compute live all-time statistics from Supabase (or local store fallback)
    let allOrdersForStats: {
      payment_method: string;
      payment_status: string;
      total_amount: number;
      order_status: string;
    }[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: allDb, error: statsErr } = await supabaseAdmin
          .from("orders")
          .select("payment_method, payment_status, total_amount, order_status");
        if (!statsErr && allDb && allDb.length > 0) {
          allOrdersForStats = allDb;
        }
      } catch (e) {
        console.warn("DB stats fetch fallback:", e);
      }
    }

    if (allOrdersForStats.length === 0) {
      allOrdersForStats = getAllLocalOrders();
    }

    const upiOrders = allOrdersForStats.filter(
      (o) => o.payment_method === "upi" || o.payment_method === "upi_gpay"
    );
    const codOrders = allOrdersForStats.filter(
      (o) => o.payment_method === "cod"
    );

    const upiPaidOrders = upiOrders.filter(
      (o) => (o.payment_status || "").toLowerCase() === "paid"
    );
    const upiPendingOrders = upiOrders.filter(
      (o) => (o.payment_status || "").toLowerCase() !== "paid"
    );

    const paidUpiRevenue = upiPaidOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0
    );
    const codRevenue = codOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0
    );
    const totalRevenue = allOrdersForStats
      .filter((o) => (o.order_status || "").toLowerCase() !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const stats = {
      totalUpiOrders: upiOrders.length,
      upiPaidOrders: upiPaidOrders.length,
      upiPendingOrders: upiPendingOrders.length,
      totalCodOrders: codOrders.length,
      paidUpiRevenue,
      codRevenue,
      totalRevenue,
      totalOrders: allOrdersForStats.length,
    };

    return NextResponse.json({ success: true, orders: orders || [], stats });
  } catch (err: any) {
    console.warn("Admin orders API error:", err?.message || err);
    const local = getAllLocalOrders();
    const upiOrders = local.filter((o) => o.payment_method === "upi" || o.payment_method === "upi_gpay");
    const codOrders = local.filter((o) => o.payment_method === "cod");
    const upiPaidOrders = upiOrders.filter((o) => (o.payment_status || "").toLowerCase() === "paid");
    const upiPendingOrders = upiOrders.filter((o) => (o.payment_status || "").toLowerCase() !== "paid");
    const stats = {
      totalUpiOrders: upiOrders.length,
      upiPaidOrders: upiPaidOrders.length,
      upiPendingOrders: upiPendingOrders.length,
      totalCodOrders: codOrders.length,
      paidUpiRevenue: upiPaidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
      codRevenue: codOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
      totalRevenue: local.filter((o) => (o.order_status || "").toLowerCase() !== "cancelled").reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
      totalOrders: local.length,
    };
    return NextResponse.json({ success: true, orders: local, stats });
  }
}
