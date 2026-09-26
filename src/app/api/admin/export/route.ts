import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error || !orders) {
      return NextResponse.json({ error: "Failed to fetch orders for export" }, { status: 500 });
    }

    const headers = [
      "Order Number",
      "Created At",
      "Customer Name",
      "Email",
      "Mobile",
      "Address",
      "City",
      "State",
      "Pincode",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Subtotal (INR)",
      "Delivery Charge (INR)",
      "Total Amount (INR)",
      "Courier Name",
      "Tracking Number"
    ];

    const csvRows = orders.map((o) => {
      const escape = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
      return [
        escape(o.order_number),
        escape(new Date(o.created_at).toLocaleString('en-IN')),
        escape(o.customer_name),
        escape(o.customer_email),
        escape(o.customer_mobile),
        escape(o.address_line),
        escape(o.city),
        escape(o.state),
        escape(o.pincode),
        escape(o.payment_method.toUpperCase()),
        escape(o.payment_status.toUpperCase()),
        escape(o.order_status),
        o.subtotal,
        o.delivery_charge,
        o.total_amount,
        escape(o.courier_name),
        escape(o.tracking_number)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ilai-orders-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("Export CSV error:", err);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
