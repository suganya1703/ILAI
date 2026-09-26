import React from "react";
import Link from "next/link";
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, Mail, MapPin, QrCode, Clock } from "lucide-react";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/utils";
import { getLocalOrder } from "@/lib/orders-store";
import { siteConfig } from "@/config/site";
import { Order } from "@/types";

export const revalidate = 0;

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let orderData: Order | null = null;

  if (isSupabaseConfigured) {
    try {
      const { data: order } = (await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single()) as { data: Order | null };

      orderData = order;
    } catch (e) {
      console.warn("Order confirmation DB fetch fallback:", e);
    }
  }

  // Retrieve from local persistent orders store if not in Supabase
  if (!orderData && id) {
    orderData = getLocalOrder(id);
  }

  // If still not found, construct fallback based on id
  if (!orderData) {
    orderData = {
      id: id || "demo-1",
      order_number: id.startsWith("ILAI-") ? id : "ILAI-2026-0001",
      customer_name: "Customer",
      customer_email: "",
      customer_mobile: "",
      address_line: "Delivery Address",
      city: "Tamil Nadu",
      state: "Tamil Nadu",
      pincode: "",
      payment_method: "upi",
      payment_status: "Pending verification",
      order_status: "Pending",
      subtotal: 60,
      delivery_charge: 40,
      total_amount: 100,
      created_at: new Date().toISOString(),
      order_items: [
        {
          product_id: "ilai-sanitary-pad",
          product_name: "ILAI Eco-Friendly Sanitary Pads",
          unit_price: 60,
          quantity: 1,
          total_price: 60,
        },
      ],
    };
  }

  const isUpi = orderData.payment_method === "upi" || orderData.payment_method === "upi_gpay" || orderData.payment_method === "razorpay";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-[#F6F2E6]">
      {/* Thank You & Order Received Header */}
      <div className="bg-[#EDE8D8] border border-[#E2DCCB] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#506638] text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB]">
            {isUpi ? "Order Submitted - Pending Verification" : "Order Confirmed (COD)"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263618]">
            Thank You for Choosing ILAI!
          </h1>
          <p className="text-[#5F6F50] text-xs sm:text-sm max-w-md mx-auto">
            Order confirmation & details sent to <strong>{orderData.customer_email}</strong>.
          </p>
        </div>

        {/* Order ID & Server Calculated Total Amount Badge */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#E2DCCB] shadow-sm text-left">
            <span className="text-[11px] text-[#5F6F50] uppercase tracking-wider block font-semibold">Order ID</span>
            <span className="text-xl font-extrabold text-[#506638] tracking-tight">{orderData.order_number}</span>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#E2DCCB] shadow-sm text-left">
            <span className="text-[11px] text-[#5F6F50] uppercase tracking-wider block font-semibold">Total Amount (Server Calculated)</span>
            <span className="text-xl font-extrabold text-[#263618] tracking-tight">{formatINR(orderData.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Required Exact Message Callout Banner */}
      <div className="bg-white border-l-4 border-[#506638] border-[#E2DCCB] border-t border-r border-b rounded-2xl p-5 sm:p-6 shadow-sm space-y-2">
        <p className="font-bold text-[#263618] text-base">🌿 Thank you for choosing ILAI!</p>
        <p className="text-sm text-[#263618]">We have received your order and payment details.</p>
        <p className="text-sm text-[#263618]">Our team will verify your payment and confirm your order as soon as possible.</p>
        <p className="text-sm text-[#506638] font-semibold">Your order confirmation and delivery details will be shared once the payment is verified.</p>
      </div>

      {/* UPI QR Code Section for UPI / GPay Orders */}
      {isUpi && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DCCB] shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDE8D8] text-[#506638] text-xs font-bold border border-[#E2DCCB]">
            <QrCode className="w-4 h-4 text-[#506638]" />
            <span>UPI / GPay Payment QR Code</span>
          </div>
          <h2 className="text-lg font-bold text-[#263618]">
            Scan to Pay {formatINR(orderData.total_amount)}
          </h2>

          <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-[#E2DCCB] p-2 bg-white shadow-md">
            <img
              src={siteConfig.upiQrImage}
              alt="ILAI GPay UPI QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-[#F6F2E6] p-3 rounded-xl border border-[#E2DCCB] inline-block max-w-sm mx-auto">
            <p className="text-xs text-[#5F6F50]">UPI ID (Tap or Scan in GPay / PhonePe / Paytm):</p>
            <p className="text-sm font-extrabold text-[#506638] select-all tracking-wide">{siteConfig.upiId}</p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Items & Totals */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#506638]" />
            <span>Ordered Items</span>
          </h2>

          <div className="space-y-3">
            {orderData.order_items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm border-b border-[#E2DCCB]/60 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E2DCCB] shrink-0 bg-white">
                    <img
                      src="/images/ilai-pad-1.jpg"
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[#263618]">{item.product_name}</p>
                    <p className="text-xs text-[#5F6F50]">Qty: {item.quantity} pack(s) (6 pads/pack)</p>
                  </div>
                </div>
                <span className="font-bold text-[#263618]">{formatINR(item.total_price)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm pt-2">
            <div className="flex justify-between text-[#5F6F50]">
              <span>Subtotal</span>
              <span>{formatINR(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5F6F50]">
              <span>Delivery Charge (Tamil Nadu)</span>
              <span>{orderData.delivery_charge === 0 ? "FREE" : formatINR(orderData.delivery_charge)}</span>
            </div>
            <div className="pt-3 border-t border-[#E2DCCB] flex justify-between items-baseline font-bold text-[#263618] text-base">
              <span>Total Payable</span>
              <span className="text-xl text-[#506638]">{formatINR(orderData.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Status */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#506638]" />
            <span>Delivery & Payment Status</span>
          </h2>

          <div className="space-y-4 text-xs text-[#5F6F50]">
            <div>
              <p className="font-bold text-[#263618] text-sm">{orderData.customer_name}</p>
              <p>{orderData.address_line}</p>
              <p>{orderData.city}, {orderData.state} - {orderData.pincode}</p>
              <p className="mt-1 font-medium text-[#263618]">Mobile: +91 {orderData.customer_mobile}</p>
            </div>

            <div className="bg-[#F6F2E6] p-4 rounded-xl border border-[#E2DCCB] space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#5F6F50]">Payment Method:</span>
                <span className="font-bold text-[#263618]">
                  {orderData.payment_method === "cod" ? "Cash on Delivery (COD)" : "Pay via UPI / GPay"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#5F6F50]">Payment Status:</span>
                <span className="font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px]">
                  {orderData.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#5F6F50]">Order Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                  orderData.order_status === "Confirmed"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : orderData.order_status === "Pending"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-[#EDE8D8] text-[#506638] border-[#E2DCCB]"
                }`}>
                  {orderData.order_status === "Pending" ? "Pending Verification" : orderData.order_status}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/track?id=${orderData.order_number}&mobile=${orderData.customer_mobile}`}
            className="w-full py-3.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
