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
      if (error) {
        console.error("[Admin Orders DB Fetch Error]:", error);
      }
      if (!error && dbOrders && dbOrders.length > 0) {
        orders = dbOrders;
      }
      } catch (e) {
        console.error("[Admin Orders Supabase Exception]:", e);
      }
    }

    // 2. Merge orders from local store if any exist (e.g. from transition or offline periods)
    const localOrders = getAllLocalOrders();
    if (orders.length === 0) {
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
    } else if (localOrders.length > 0) {
      const existingIds = new Set(orders.map((o) => o.id || o.order_number));
      for (const lo of localOrders) {
        if (!existingIds.has(lo.id) && !existingIds.has(lo.order_number)) {
          let match = true;
          if (status && status !== "All" && lo.order_status !== status) match = false;
          if (query) {
            const qLower = query.trim().toLowerCase();
            if (
              !lo.order_number.toLowerCase().includes(qLower) &&
              !lo.customer_name.toLowerCase().includes(qLower) &&
              !lo.customer_mobile.includes(qLower) &&
              !lo.customer_email.toLowerCase().includes(qLower)
            ) {
              match = false;
            }
          }
          if (match) {
            orders.push(lo);
          }
        }
      }
      orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // 3. Compute live all-time and daily statistics from Supabase (merged with local store)
    let allOrdersForStats: any[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: allDb, error: statsErr } = await supabaseAdmin
          .from("orders")
          .select("id, order_number, payment_method, payment_status, total_amount, order_status, created_at");
        if (statsErr) {
          console.error("[Admin Orders Stats DB Error]:", statsErr);
        }
        if (!statsErr && allDb && allDb.length > 0) {
          allOrdersForStats = allDb;
        }
      } catch (e) {
        console.warn("DB stats fetch fallback:", e);
      }
    }

    if (localOrders.length > 0) {
      const existingStatIds = new Set(allOrdersForStats.map((o) => o.id || o.order_number));
      for (const lo of localOrders) {
        if (!existingStatIds.has(lo.id) && !existingStatIds.has(lo.order_number)) {
          allOrdersForStats.push(lo);
        }
      }
    }

    const stats = computeOrderStats(allOrdersForStats);

    return NextResponse.json({ success: true, orders: orders || [], stats });
  } catch (err: any) {
    console.warn("Admin orders API error:", err?.message || err);
    const local = getAllLocalOrders();
    const stats = computeOrderStats(local);
    return NextResponse.json({ success: true, orders: local, stats });
  }
}

function computeOrderStats(allOrders: any[]) {
  const upiOrders = allOrders.filter(
    (o) => o.payment_method === "upi" || o.payment_method === "upi_gpay"
  );
  const codOrders = allOrders.filter((o) => o.payment_method === "cod");

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
  const totalRevenue = allOrders
    .filter((o) => (o.order_status || "").toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Today's date key in IST (Asia/Kolkata)
  let todayKey = "";
  try {
    todayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch (e) {
    todayKey = new Date().toISOString().split("T")[0];
  }

  const dailyMap = new Map<
    string,
    {
      date: string;
      totalOrders: number;
      upiPaidOrders: number;
      codOrders: number;
      totalReceived: number;
    }
  >();

  let todayOrdersCount = 0;
  let todayReceivedAmount = 0;
  let pendingVerificationCount = 0;

  for (const o of allOrders) {
    const isPaidUpi =
      (o.payment_method === "upi" || o.payment_method === "upi_gpay") &&
      (o.payment_status || "").toLowerCase() === "paid";
    const isCod = o.payment_method === "cod";
    const isPending =
      (o.payment_status || "").toLowerCase().includes("pending") ||
      (o.order_status || "").toLowerCase().includes("pending");

    if (isPending) {
      pendingVerificationCount++;
    }

    const amount = Number(o.total_amount) || 0;
    let orderDateKey = todayKey;
    if (o.created_at) {
      try {
        orderDateKey = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(o.created_at));
      } catch (e) {
        orderDateKey = String(o.created_at).slice(0, 10);
      }
    }

    if (orderDateKey === todayKey) {
      todayOrdersCount++;
      if (isPaidUpi || isCod) {
        todayReceivedAmount += amount;
      }
    }

    const dayRecord = dailyMap.get(orderDateKey) || {
      date: orderDateKey,
      totalOrders: 0,
      upiPaidOrders: 0,
      codOrders: 0,
      totalReceived: 0,
    };

    dayRecord.totalOrders += 1;
    if (isPaidUpi) {
      dayRecord.upiPaidOrders += 1;
      dayRecord.totalReceived += amount;
    }
    if (isCod) {
      dayRecord.codOrders += 1;
      dayRecord.totalReceived += amount;
    }

    dailyMap.set(orderDateKey, dayRecord);
  }

  const dailySummary = Array.from(dailyMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return {
    totalUpiOrders: upiOrders.length,
    upiPaidOrders: upiPaidOrders.length,
    upiPendingOrders: upiPendingOrders.length,
    totalCodOrders: codOrders.length,
    paidUpiRevenue,
    codRevenue,
    totalRevenue,
    totalOrders: allOrders.length,
    todayOrders: todayOrdersCount,
    todayReceived: todayReceivedAmount,
    pendingVerification: pendingVerificationCount,
    dailySummary,
  };
}
