import { NextResponse } from "next/server";
import { sendOrderReceivedEmail, sendPaymentConfirmedEmail, SENDER_EMAIL, REPLY_TO_EMAIL } from "@/lib/email";
import { Order } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      type = "received",
      customer_name = "Deepika",
      order_number = "ILAI-2026-0001",
      product_name = "ILAI Regular Eco-Pads (Pack of 10)",
      quantity = 1,
      total_amount = 220,
    } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required in the 'email' field." },
        { status: 400 }
      );
    }

    const appPassword = process.env.GMAIL_APP_PASSWORD || "goauueyoqorssbuk";
    if (!appPassword || appPassword === "your_gmail_app_password_here") {
      return NextResponse.json(
        {
          error: "GMAIL_APP_PASSWORD environment variable is not configured. Please add your Gmail App Password to your .env.local file.",
          sender: SENDER_EMAIL,
          replyTo: REPLY_TO_EMAIL,
        },
        { status: 500 }
      );
    }

    const mockOrder: Order = {
      id: "test-order-uuid-12345",
      order_number: order_number,
      customer_name: customer_name,
      customer_email: email.trim(),
      customer_mobile: "8300815220",
      address_line: "Flat 4B, Green Meadows Apartment, MG Road",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001",
      payment_method: "upi_gpay",
      payment_status: type === "confirmed" ? "Paid" : "Pending verification",
      order_status: type === "confirmed" ? "Confirmed" : "Confirmed",
      subtotal: total_amount > 40 ? total_amount - 40 : total_amount,
      delivery_charge: 40,
      total_amount: total_amount,
      created_at: new Date().toISOString(),
      order_items: [
        {
          product_id: "ilai-reg-10",
          product_name: product_name,
          quantity: quantity,
          unit_price: total_amount > 40 ? total_amount - 40 : total_amount,
          total_price: total_amount > 40 ? total_amount - 40 : total_amount,
        },
      ],
    };

    let result;
    if (type === "confirmed") {
      result = await sendPaymentConfirmedEmail(
        mockOrder,
        "Package dispatched via ST Courier. Tracking: ST12345678IN"
      );
    } else {
      result = await sendOrderReceivedEmail(mockOrder);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to send email via Gmail SMTP",
          sender: SENDER_EMAIL,
          replyTo: REPLY_TO_EMAIL,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email (${type}) sent successfully to ${email} via Gmail SMTP`,
      orderNumber: mockOrder.order_number,
      sender: SENDER_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      smtpData: result.data,
    });
  } catch (err: any) {
    console.error("Test email API route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
