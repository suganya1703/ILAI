"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Package, Truck, MapPin, QrCode, AlertCircle, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { productContent } from "@/config/content";
import { Order } from "@/types";
import { UpiPaymentSection } from "@/components/upi-payment-section";

interface OrderConfirmationClientProps {
  initialOrder: Order | null;
  id: string;
}

export function OrderConfirmationClient({
  initialOrder,
  id,
}: OrderConfirmationClientProps) {
  const [orderData, setOrderData] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState<boolean>(!initialOrder);

  useEffect(() => {
    if (initialOrder) {
      setOrderData(initialOrder);
      setLoading(false);
      return;
    }

    // Attempt client-side recovery from sessionStorage
    try {
      const cached =
        sessionStorage.getItem(`ilai_order_${id}`) ||
        sessionStorage.getItem("ilai_latest_order");

      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          (parsed.confirmation_token === id ||
            parsed.id === id ||
            parsed.order_number === id ||
            !parsed.confirmation_token)
        ) {
          setOrderData(parsed);
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn("Could not parse sessionStorage order cache:", e);
    }

    // Also attempt fallback fetch from API route
    let isCancelled = false;
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success && data.order) {
            setOrderData(data.order);
          }
        }
      } catch (err) {
        console.warn("Client fallback order lookup notice:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      isCancelled = true;
    };
  }, [initialOrder, id]);

  // Loading state
  if (loading && !orderData) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center bg-[#F6F2E6] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#506638] mx-auto" />
        <h2 className="text-xl font-bold text-[#263618]">
          Retrieving your order details...
        </h2>
        <p className="text-xs text-[#5F6F50]">
          Please wait a moment while we load your confirmation.
        </p>
      </div>
    );
  }

  // Not Found State
  if (!orderData) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-6 text-center bg-[#F6F2E6]">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300 shadow-sm">
          <AlertCircle className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263618]">
            Order Not Found
          </h1>
          <p className="text-sm text-[#5F6F50] max-w-md mx-auto">
            We could not find the order details for this link. If you recently placed an order, please check your email for the confirmation link or track your order with your registered mobile number.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/track"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md inline-flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#263618] font-semibold border border-[#E2DCCB] rounded-xl hover:bg-[#EDE8D8] transition-colors text-sm inline-flex items-center justify-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isUpi = orderData.payment_method === "upi" || orderData.payment_method === "upi_gpay";
  const isCod = orderData.payment_method === "cod";
  const isPaid = (orderData.payment_status || "").toLowerCase() === "paid";
  const isUpiAwaitingPayment = isUpi && !isPaid;

  const cleanOrderNumber = (orderData.order_number || "").replace(/^(IL)+ILAI-/i, "ILAI-");
  const cleanMobile = (orderData.customer_mobile || "").replace(/\D/g, "").slice(-10);

  // ==========================================
  // 1. UPI / GPay Orders Awaiting Payment Flow
  // ==========================================
  if (isUpiAwaitingPayment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-[#F6F2E6]">
        {/* Header */}
        <div className="bg-[#EDE8D8] border border-[#E2DCCB] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#506638] text-white flex items-center justify-center mx-auto shadow-md">
            <QrCode className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB]">
              Action Required • Complete UPI Payment
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263618]">
              Order Placed — Complete Your Payment
            </h1>
            <p className="text-[#5F6F50] text-xs sm:text-sm max-w-md mx-auto">
              Please scan the UPI QR code below or tap to pay with your UPI app to complete your payment so our team can verify and confirm your order.
            </p>
          </div>

          {/* Order ID & Total Payable Badge */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#E2DCCB] shadow-sm text-left">
              <span className="text-[11px] text-[#5F6F50] uppercase tracking-wider block font-semibold">Order ID</span>
              <span className="text-xl font-extrabold text-[#506638] tracking-tight">{cleanOrderNumber}</span>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#E2DCCB] shadow-sm text-left">
              <span className="text-[11px] text-[#5F6F50] uppercase tracking-wider block font-semibold">Total Payable</span>
              <span className="text-xl font-extrabold text-[#263618] tracking-tight">{formatINR(orderData.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* UPI Payment Section */}
        <UpiPaymentSection
          orderId={orderData.id}
          orderNumber={cleanOrderNumber}
          totalAmount={orderData.total_amount}
          upiId={siteConfig.upiId}
          qrImageUrl={`/api/orders/${encodeURIComponent(orderData.confirmation_token || orderData.id)}/qr`}
          customerEmail={orderData.customer_email}
        />

        {/* Thank You Callout Banner */}
        <div className="bg-white border-l-4 border-[#506638] border-[#E2DCCB] border-t border-r border-b rounded-2xl p-5 sm:p-6 shadow-sm space-y-2">
          <p className="font-bold text-[#263618] text-base">🌿 Thank you for choosing ILAI!</p>
          <p className="text-sm text-[#263618]">We have received your order details.</p>
          <p className="text-sm text-[#263618]">Our team will verify your payment and confirm your order as soon as possible.</p>
          <p className="text-sm text-[#506638] font-semibold">Your order confirmation and delivery details will be shared once the payment is verified.</p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Items & Totals */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#506638]" />
              <span>Ordered Items</span>
            </h2>

            <div className="space-y-3">
              {orderData.order_items && orderData.order_items.length > 0 ? (
                orderData.order_items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm border-b border-[#E2DCCB]/60 pb-3 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E2DCCB] shrink-0 bg-white">
                        <img
                          src={productContent.images?.[0] || "/images/product/ilai-pad-1.jpg"}
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
                ))
              ) : (
                <div className="text-xs text-[#5F6F50] py-2">
                  ILAI Eco-Friendly Sanitary Pads (1 pack)
                </div>
              )}
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

          {/* Right: Customer & Delivery Info */}
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
                    Pay via UPI / GPay
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#5F6F50]">Payment Status:</span>
                  <span className="font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px]">
                    {orderData.payment_status || "Pending verification"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#5F6F50]">Order Status:</span>
                  <span className="font-bold px-2.5 py-0.5 rounded-full text-[11px] border bg-amber-100 text-amber-900 border-amber-300">
                    {orderData.order_status}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/track?id=${encodeURIComponent(cleanOrderNumber)}&mobile=${encodeURIComponent(cleanMobile)}`}
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

  // ========================================================
  // 2. COD Orders & Already Paid Orders Flow
  // ========================================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-[#F6F2E6]">
      {/* Header */}
      <div className="bg-[#EDE8D8] border border-[#E2DCCB] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#506638] text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB]">
            {orderData.order_status === "Confirmed" || isPaid
              ? "Order Confirmed"
              : isCod
              ? "Order Received - Pending Confirmation"
              : "Order Submitted - Pending Verification"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263618]">
            Thank You for Choosing ILAI!
          </h1>
          {orderData.customer_email && (
            <p className="text-[#5F6F50] text-xs sm:text-sm max-w-md mx-auto">
              Order confirmation & details sent to <strong>{orderData.customer_email}</strong>.
            </p>
          )}
        </div>

        {/* Order ID & Total Amount Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#E2DCCB] shadow-sm text-left">
            <span className="text-[11px] text-[#5F6F50] uppercase tracking-wider block font-semibold">Order ID</span>
            <span className="text-xl font-extrabold text-[#506638] tracking-tight">{cleanOrderNumber}</span>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#E2DCCB] shadow-sm text-left">
            <span className="text-[11px] text-[#5F6F50] uppercase tracking-wider block font-semibold">Total Amount</span>
            <span className="text-xl font-extrabold text-[#263618] tracking-tight">{formatINR(orderData.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Message Callout */}
      <div className="bg-white border-l-4 border-[#506638] border-[#E2DCCB] border-t border-r border-b rounded-2xl p-5 sm:p-6 shadow-sm space-y-2">
        <p className="font-bold text-[#263618] text-base">🌿 Thank you for choosing ILAI!</p>
        {isCod ? (
          <>
            <p className="text-sm text-[#263618]">Order received. Pay cash on delivery. We will confirm your order shortly.</p>
            <p className="text-sm text-[#506638] font-semibold">Our team will verify your address and prepare your package for dispatch across Tamil Nadu.</p>
          </>
        ) : isPaid ? (
          <>
            <p className="text-sm text-[#263618]">Your payment has been successfully verified.</p>
            <p className="text-sm text-[#506638] font-semibold">Our team is packing your order for dispatch across Tamil Nadu.</p>
          </>
        ) : (
          <>
            <p className="text-sm text-[#263618]">We have received your order and payment details.</p>
            <p className="text-sm text-[#263618]">Our team will verify your payment and confirm your order as soon as possible.</p>
            <p className="text-sm text-[#506638] font-semibold">Your order confirmation and delivery details will be shared once the payment is verified.</p>
          </>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Items & Totals */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#506638]" />
            <span>Ordered Items</span>
          </h2>

          <div className="space-y-3">
            {orderData.order_items && orderData.order_items.length > 0 ? (
              orderData.order_items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b border-[#E2DCCB]/60 pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E2DCCB] shrink-0 bg-white">
                      <img
                        src={productContent.images?.[0] || "/images/product/ilai-pad-1.jpg"}
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
              ))
            ) : (
              <div className="text-xs text-[#5F6F50] py-2">
                ILAI Eco-Friendly Sanitary Pads (1 pack)
              </div>
            )}
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

        {/* Right: Customer & Delivery Info */}
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
                  {isCod ? "Cash on Delivery (COD)" : "Pay via UPI / GPay"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#5F6F50]">Payment Status:</span>
                <span className={`font-bold border px-2.5 py-0.5 rounded-full text-[11px] ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}>
                  {orderData.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#5F6F50]">Order Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                  orderData.order_status === "Confirmed"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}>
                  {orderData.order_status}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/track?id=${encodeURIComponent(cleanOrderNumber)}&mobile=${encodeURIComponent(cleanMobile)}`}
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
