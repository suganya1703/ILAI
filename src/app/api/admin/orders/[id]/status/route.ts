import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import { updateLocalOrderStatus, getLocalOrder } from "@/lib/orders-store";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json();
    const { status, payment_status, courier_name, tracking_number, note, send_confirmation_email, delivery_note } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateFields.order_status = status;
    if (payment_status) updateFields.payment_status = payment_status;
    if (courier_name !== undefined) updateFields.courier_name = courier_name;
    if (tracking_number !== undefined) updateFields.tracking_number = tracking_number;

    let updatedOrder: any = null;

    if (isSupabaseConfigured) {
      try {
        const { data: order, error: updateError } = await supabaseAdmin
          .from("orders")
          .update(updateFields)
          .eq("id", orderId)
          .select("*, order_items(*)")
          .single();

        if (!updateError && order) {
          updatedOrder = order;
        }
      } catch (e) {
        console.warn("DB update fallback:", e);
      }
    }

    // Append to status history
    const logNote = note || (payment_status === "Paid" 
      ? `Payment manually verified as Paid by admin at ${new Date().toLocaleString('en-IN')}` 
      : `Order updated by admin at ${new Date().toLocaleString('en-IN')}`);

    // Update in local store
    const localUpdated = updateLocalOrderStatus(orderId, updateFields, logNote);
    if (!updatedOrder) {
      updatedOrder = localUpdated || getLocalOrder(orderId);
    }


    if (isSupabaseConfigured) {
      try {
        await supabaseAdmin.from("order_status_history").insert({
          order_id: orderId,
          status: updatedOrder.order_status,
          note: logNote,
        });
      } catch (e) {
        console.warn("DB history insert fallback:", e);
      }
    }

    // Trigger Confirmation Email if requested or if marked as Paid
    if (send_confirmation_email || payment_status === "Paid") {
      try {
        await sendPaymentConfirmedEmail(updatedOrder, delivery_note || note);
      } catch (emailErr) {
        console.warn("Manual payment confirmation email fallback:", emailErr);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    console.error("Admin order status update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
