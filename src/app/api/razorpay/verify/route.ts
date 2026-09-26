import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Verify HMAC Signature on Server
    const isMock = razorpay_order_id.startsWith("rzp_test_order_") || process.env.RAZORPAY_KEY_SECRET === "placeholder_secret";
    let isValid = false;

    if (isMock) {
      isValid = true; // In test / development placeholder mode
    } else {
      isValid = verifyRazorpaySignature({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature || "",
      });
    }

    if (!isValid) {
      // Mark as failed payment
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId);

      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // Update order status in Supabase to 'paid' and 'Confirmed'
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "Confirmed",
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    if (updateError || !updatedOrder) {
      console.error("Order update error after verification:", updateError);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    // Add status history record
    await supabaseAdmin.from("order_status_history").insert({
      order_id: orderId,
      status: "Confirmed",
      note: `Online payment verified successfully via Razorpay (Payment ID: ${razorpay_payment_id})`,
    });

    // Send order confirmation email via Gmail SMTP
    await sendOrderConfirmationEmail(updatedOrder);

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.order_number,
    });
  } catch (err: any) {
    console.error("Razorpay verification API error:", err);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
