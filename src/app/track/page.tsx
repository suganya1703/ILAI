"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle2, Clock, Package, Truck, Home, AlertCircle, Info } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatINR } from "@/lib/utils";

function cleanOrderNumber(val: string): string {
  if (!val) return "";
  let clean = val.trim().toUpperCase();
  while (clean.startsWith("ILILAI-") || clean.startsWith("IL-ILAI-")) {
    clean = clean.replace(/^(IL-?)+ILAI-/i, "ILAI-");
  }
  return clean;
}

function cleanMobile(val: string): string {
  if (!val) return "";
  return val.replace(/\D/g, "").slice(-10);
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || searchParams.get("orderNumber") || "";
  const rawMobile = searchParams.get("mobile") || "";

  const initialOrderNumber = cleanOrderNumber(rawId);
  const initialMobile = cleanMobile(rawMobile);

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const trackingSteps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: "Confirmed", label: "Order Confirmed", icon: CheckCircle2 },
    { status: "Packed", label: "Packed & Ready", icon: Package },
    { status: "Shipped", label: "Out for Delivery", icon: Truck },
    { status: "Delivered", label: "Delivered", icon: Home },
  ];

  const handleTrack = async (e?: React.FormEvent, customId?: string, customMobile?: string) => {
    if (e) e.preventDefault();
    setError(null);

    const targetOrderNumber = cleanOrderNumber(customId || orderNumber);
    const targetMobile = cleanMobile(customMobile || mobileNumber);

    if (!targetOrderNumber || !targetMobile) {
      setError("Please enter both your Order ID and 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: targetOrderNumber,
          mobileNumber: targetMobile,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Order not found. Please check your details.");
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch (err: any) {
      setError("Network error while searching for order. Please try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialMobile) {
      handleTrack(undefined, initialOrderNumber, initialMobile);
    }
  }, []);

  const getStepState = (stepStatus: OrderStatus) => {
    if (!order) return "pending";

    // If still in pending status, none of the confirmed pipeline steps are complete
    if (
      order.order_status === "Pending verification" ||
      order.order_status === "Pending confirmation" ||
      order.order_status === "Pending"
    ) {
      return "pending";
    }

    const statusOrder: OrderStatus[] = ["Confirmed", "Packed", "Shipped", "Delivered"];
    const currentIndex = statusOrder.indexOf(order.order_status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (order.order_status === "Cancelled") return "cancelled";
    if (currentIndex >= 0 && stepIndex <= currentIndex) return "completed";
    return "pending";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 bg-[#F6F2E6]">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB] shadow-sm">
          Real-Time Updates
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263618] tracking-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-[#5F6F50]">
          Enter your Order ID (format: <code>ILAI-2026-0001</code>) and 10-digit registered mobile number to view shipping progress.
        </p>
      </div>

      {/* Search Card */}
      <form onSubmit={handleTrack} className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#263618] uppercase">
              Order ID *
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(cleanOrderNumber(e.target.value))}
              placeholder="e.g. ILAI-2026-0001"
              className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm focus:outline-none focus:border-[#506638] focus:ring-2 focus:ring-[#EDE8D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#263618] uppercase">
              Mobile Number (10 digits) *
            </label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={14}
              className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm focus:outline-none focus:border-[#506638] focus:ring-2 focus:ring-[#EDE8D8]"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] disabled:opacity-50 transition-colors text-sm shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </>
          )}
        </button>
      </form>

      {/* Tracking Results Card */}
      {order && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DCCB] shadow-md space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2DCCB] pb-4">
            <div>
              <span className="text-xs font-semibold text-[#5F6F50] uppercase tracking-wider block">Order ID</span>
              <h2 className="text-2xl font-extrabold text-[#506638]">{cleanOrderNumber(order.order_number)}</h2>
              <p className="text-xs text-[#5F6F50] mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5F6F50]">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                order.order_status === "Delivered" || order.order_status === "Confirmed"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : order.order_status === "Cancelled"
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}>
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Pending Notice Banner when order is awaiting admin confirmation or verification */}
          {(order.order_status === "Pending verification" || order.order_status === "Pending confirmation" || order.order_status === "Pending") && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {order.order_status === "Pending confirmation"
                    ? "Order Received — Pending Confirmation (Cash on Delivery)"
                    : "Payment Submitted — Pending Verification (UPI / GPay)"}
                </p>
                <p className="text-amber-800">
                  {order.order_status === "Pending confirmation"
                    ? "We have received your Cash on Delivery order. Our team will verify your address and confirm your order shortly."
                    : "We have received your UPI payment details. Our team will verify your transaction and confirm your order shortly."}
                </p>
              </div>
            </div>
          )}

          {/* Stepper Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#263618]">Delivery Timeline</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {trackingSteps.map((step) => {
                const state = getStepState(step.status);
                const IconComp = step.icon;

                return (
                  <div
                    key={step.status}
                    className={`p-4 rounded-2xl border text-center space-y-3 transition-all ${
                      state === "completed"
                        ? "bg-[#EDE8D8] border-[#E2DCCB] text-[#263618] shadow-sm"
                        : "bg-[#F6F2E6] border-[#E2DCCB] text-[#5F6F50]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm ${
                        state === "completed"
                          ? "bg-[#506638] text-white shadow-sm"
                          : "bg-slate-200 text-[#5F6F50]"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{step.label}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        {state === "completed" ? "Completed" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Number & Courier info */}
          {order.tracking_number && (
            <div className="bg-[#EDE8D8] p-4 rounded-2xl border border-[#E2DCCB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-[#263618]">Courier Tracking Details</p>
                <p className="text-[#5F6F50]">
                  Courier: <strong>{order.courier_name || "Express Delivery"}</strong> • Tracking No: <strong>{order.tracking_number}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="pt-4 border-t border-[#E2DCCB] text-xs text-[#5F6F50] space-y-2">
            <p className="font-bold text-[#263618]">Delivery Address:</p>
            <p>{order.customer_name} • {order.address_line}, {order.city}, {order.state} - {order.pincode}</p>
            <p className="pt-1 font-bold text-[#263618]">
              Total Amount: {formatINR(order.total_amount)} ({order.payment_method === "cod" ? "Cash on Delivery" : "UPI / GPay"})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-[#5F6F50] text-sm bg-[#F6F2E6]">
        Loading tracking form...
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
