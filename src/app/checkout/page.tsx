"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ShieldCheck, Lock, QrCode, CreditCard, Banknote, Truck, ArrowLeft, AlertCircle, MapPin, MessageCircle, Info } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { siteConfig } from "@/config/site";
import { getPricingInfo } from "@/config/content";
import { formatINR, isValidIndianMobile, isValidEmail, isValidTamilNaduPincode } from "@/lib/utils";
import { ShippingAddressForm } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart, isLoaded } = useCart();
  const pricing = getPricingInfo();

  const [formData, setFormData] = useState<ShippingAddressForm>({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
    address_line: "",
    city: "",
    state: "Tamil Nadu", // Fixed to Tamil Nadu
    pincode: "",
    payment_method: "upi",
  });

  // Settings State
  const [deliveryCharge, setDeliveryCharge] = useState<number>(siteConfig.defaultDeliveryCharge);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  const [minPacksPerOrder, setMinPacksPerOrder] = useState<number>(1);
  const [codEnabled, setCodEnabled] = useState<boolean>(true);
  const [codMinOrderValue, setCodMinOrderValue] = useState<number>(0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("2-5 working days");
  const [allowedPincodes, setAllowedPincodes] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pincodeErrorNotice, setPincodeErrorNotice] = useState<string | null>(null);

  // Fetch settings dynamically from server
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setDeliveryCharge(data.delivery_charge !== undefined ? data.delivery_charge : 40);
        setFreeDeliveryThreshold(data.free_delivery_threshold || 0);
        setMinPacksPerOrder(data.min_packs_per_order || 1);
        setCodEnabled(data.cod_enabled !== undefined ? data.cod_enabled : true);
        setCodMinOrderValue(data.cod_min_order_value || 0);
        setEstimatedDeliveryTime(data.estimated_delivery_time || "2-5 working days");
        setAllowedPincodes(data.allowed_pincodes || "");
      }
    } catch (e) {
      // Fallback to default
    }
  };

  const isFreeDelivery = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;
  const currentDeliveryCharge = items.length > 0 ? (isFreeDelivery ? 0 : deliveryCharge) : 0;
  const grandTotal = subtotal + currentDeliveryCharge;

  const isCodEligible = codEnabled && (codMinOrderValue === 0 || subtotal >= codMinOrderValue);

  // Force Razorpay if COD is ineligible
  useEffect(() => {
    if (!isCodEligible && formData.payment_method === "cod") {
      setFormData((prev) => ({ ...prev, payment_method: "razorpay" }));
    }
  }, [isCodEligible, formData.payment_method]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push("/cart");
    }
  }, [isLoaded, items, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "pincode") {
      setPincodeErrorNotice(null);
      if (value.trim().length === 6) {
        const pinCheck = isValidTamilNaduPincode(value, allowedPincodes);
        if (!pinCheck.isValid) {
          setPincodeErrorNotice(pinCheck.errorReason || "Right now we deliver only within Tamil Nadu.");
        }
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    setPincodeErrorNotice(null);

    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = "Please enter your full name (at least 2 characters)";
    }

    if (!isValidEmail(formData.customer_email)) {
      newErrors.customer_email = "Please enter a valid email address";
    }

    if (!isValidIndianMobile(formData.customer_mobile)) {
      newErrors.customer_mobile = "Please enter a valid 10-digit Indian mobile number (starts with 6-9)";
    }

    if (!formData.address_line.trim() || formData.address_line.trim().length < 5) {
      newErrors.address_line = "Please enter your full delivery address";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city";
    }

    // Tamil Nadu Pincode check
    const pinCheck = isValidTamilNaduPincode(formData.pincode, allowedPincodes);
    if (!pinCheck.isValid) {
      newErrors.pincode = pinCheck.errorReason || "Right now we deliver only within Tamil Nadu.";
      setPincodeErrorNotice(pinCheck.errorReason || "Right now we deliver only within Tamil Nadu.");
    }

    // Minimum Packs Check
    if (totalItems < minPacksPerOrder) {
      newErrors.items = `Minimum order requirement is ${minPacksPerOrder} pack(s).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (isSubmitting) return;

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_mobile: formData.customer_mobile.trim(),
        address_line: formData.address_line.trim(),
        city: formData.city.trim(),
        state: "Tamil Nadu",
        pincode: formData.pincode.trim(),
        payment_method: formData.payment_method,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let res: Response;
      try {
        res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.error || "Failed to create order record. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const confirmationToken = data.confirmationToken || data.orderId;

      if (data.order) {
        try {
          sessionStorage.setItem(`ilai_order_${confirmationToken}`, JSON.stringify(data.order));
          if (data.orderId) {
            sessionStorage.setItem(`ilai_order_${data.orderId}`, JSON.stringify(data.order));
          }
          sessionStorage.setItem("ilai_latest_order", JSON.stringify(data.order));
        } catch (storageErr) {
          console.warn("Session storage save notice:", storageErr);
        }
      }

      // 1. If UPI / GPay payment method: redirect immediately to confirmation page with QR code
      if (formData.payment_method === "upi" || formData.payment_method === "upi_gpay") {
        clearCart();
        window.location.href = `/order-confirmation/${confirmationToken}`;
        return;
      }

      // 2. If COD payment method: redirect to confirmation page
      if (formData.payment_method === "cod") {
        clearCart();
        window.location.href = `/order-confirmation/${confirmationToken}`;
        return;
      }

      // 3. If Razorpay payment method: open Razorpay popup
      if (formData.payment_method === "razorpay") {
        const rzpOrderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: data.totalAmount,
            orderId: data.orderId,
            orderNumber: data.orderNumber,
          }),
        });

        const rzpData = await rzpOrderRes.json();

        if (!rzpOrderRes.ok || !rzpData.success) {
          setServerError(rzpData.error || "Failed to initialize Razorpay checkout.");
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
          amount: rzpData.amount,
          currency: rzpData.currency || "INR",
          name: siteConfig.name,
          description: `Order #${data.orderNumber} - Sanitary Pads`,
          image: "/images/ilai-logo.png",
          order_id: rzpData.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  order_id: data.orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                window.location.href = `/order-confirmation/${confirmationToken}`;
              } else {
                setServerError("Payment verification failed. Please contact support.");
                setIsSubmitting(false);
              }
            } catch (err) {
              setServerError("Verification network error. Please contact support.");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: formData.customer_name,
            email: formData.customer_email,
            contact: formData.customer_mobile,
          },
          theme: {
            color: "#506638",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        return;
      }

      // Fallback for any other payment method
      clearCart();
      window.location.href = `/order-confirmation/${confirmationToken}`;
    } catch (err: any) {
      if (err.name === "AbortError") {
        setServerError("Order request timed out after 15 seconds. Please check your network and try again.");
      } else {
        setServerError(err?.message || "An unexpected error occurred during checkout. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-[#5F6F50] bg-[#F6F2E6]">
        Redirecting to cart...
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F6F2E6]">
        {/* Header & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2DCCB] pb-4 gap-2">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#506638] hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Cart</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263618] tracking-tight">
              Checkout & Shipping
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#506638] bg-white border border-[#E2DCCB] px-3 py-1.5 rounded-full shadow-sm">
            <MapPin className="w-4 h-4 text-[#506638]" />
            <span>Delivering across Tamil Nadu only</span>
          </div>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Checkout Error</p>
              <p className="text-xs text-red-600 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipping Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DCCB] shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3">
              Shipping Information (Tamil Nadu Delivery)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.customer_name
                      ? "border-red-500 focus:ring-red-200 bg-red-50/30"
                      : "border-[#E2DCCB] focus:border-[#506638] focus:ring-[#EDE8D8]"
                  }`}
                />
                {errors.customer_name && (
                  <p className="text-xs text-red-600 font-medium">{errors.customer_name}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  name="customer_mobile"
                  value={formData.customer_mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.customer_mobile
                      ? "border-red-500 focus:ring-red-200 bg-red-50/30"
                      : "border-[#E2DCCB] focus:border-[#506638] focus:ring-[#EDE8D8]"
                  }`}
                />
                {errors.customer_mobile && (
                  <p className="text-xs text-red-600 font-medium">{errors.customer_mobile}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="e.g. priya@example.com"
                  className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.customer_email
                      ? "border-red-500 focus:ring-red-200 bg-red-50/30"
                      : "border-[#E2DCCB] focus:border-[#506638] focus:ring-[#EDE8D8]"
                  }`}
                />
                {errors.customer_email && (
                  <p className="text-xs text-red-600 font-medium">{errors.customer_email}</p>
                )}
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  Shipping Address *
                </label>
                <input
                  type="text"
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleChange}
                  placeholder="Flat / Door No., Street, Area, Landmark"
                  className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.address_line
                      ? "border-red-500 focus:ring-red-200 bg-red-50/30"
                      : "border-[#E2DCCB] focus:border-[#506638] focus:ring-[#EDE8D8]"
                  }`}
                />
                {errors.address_line && (
                  <p className="text-xs text-red-600 font-medium">{errors.address_line}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.city
                      ? "border-red-500 focus:ring-red-200 bg-red-50/30"
                      : "border-[#E2DCCB] focus:border-[#506638] focus:ring-[#EDE8D8]"
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 font-medium">{errors.city}</p>
                )}
              </div>

              {/* State Field (Fixed to Tamil Nadu) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value="Tamil Nadu"
                  readOnly
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-base sm:text-sm bg-[#EDE8D8]/50 text-[#263618] font-bold cursor-not-allowed select-none"
                />
                <p className="text-[11px] text-[#506638] font-semibold">Delivering across Tamil Nadu only</p>
              </div>

              {/* PIN Code Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#263618] uppercase tracking-wider">
                  PIN Code (Tamil Nadu Only) *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 600001"
                  maxLength={6}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.pincode || pincodeErrorNotice
                      ? "border-red-500 focus:ring-red-200 bg-red-50/30"
                      : "border-[#E2DCCB] focus:border-[#506638] focus:ring-[#EDE8D8]"
                  }`}
                />
                <p className="text-[11px] text-[#5F6F50]">Must be a 6-digit PIN starting 60, 61, 62, 63, 64</p>
              </div>
            </div>

            {/* Tamil Nadu PIN Restriction Error & WhatsApp Inquiry Callout */}
            {pincodeErrorNotice && (
              <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-amber-950">Right now we deliver only within Tamil Nadu.</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      The PIN code <strong>{formData.pincode}</strong> is outside our current Tamil Nadu delivery zone.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                    `Hello ILAI team, I would like to inquire about delivering to PIN code ${formData.pincode}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#506638] text-white font-bold rounded-xl text-xs hover:bg-[#3E512B] transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp for Delivery Inquiries</span>
                </a>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-[#E2DCCB] space-y-3">
              <label className="block text-sm font-bold text-[#263618]">
                Select Payment Option
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* UPI / GPay Option */}
                <label
                  className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    formData.payment_method === "upi" || formData.payment_method === "upi_gpay"
                      ? "border-[#506638] bg-[#EDE8D8]/60 ring-2 ring-[#EDE8D8]"
                      : "border-[#E2DCCB] hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={formData.payment_method === "upi" || formData.payment_method === "upi_gpay"}
                    onChange={handleChange}
                    className="mt-1 text-[#506638] focus:ring-[#506638]"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#263618] text-sm">
                      <QrCode className="w-4 h-4 text-[#506638]" />
                      <span>Pay via UPI / GPay</span>
                    </div>
                    <p className="text-xs text-[#5F6F50] mt-0.5">
                      Scan QR code to pay via GPay, PhonePe, or Paytm
                    </p>
                  </div>
                </label>

                {/* COD Option */}
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    !isCodEligible
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                      : formData.payment_method === "cod"
                      ? "border-[#506638] bg-[#EDE8D8]/60 ring-2 ring-[#EDE8D8] cursor-pointer"
                      : "border-[#E2DCCB] hover:border-slate-300 cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    disabled={!isCodEligible}
                    checked={formData.payment_method === "cod"}
                    onChange={handleChange}
                    className="mt-1 text-[#506638] focus:ring-[#506638]"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#263618] text-sm">
                      <Banknote className="w-4 h-4 text-[#506638]" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-xs text-[#5F6F50] mt-0.5">
                      Pay cash at your doorstep upon delivery
                    </p>
                    {!isCodEligible && (
                      <p className="text-[11px] text-amber-800 font-semibold mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-700" />
                        <span>
                          {!codEnabled
                            ? "COD is currently unavailable"
                            : `COD requires min subtotal of ${formatINR(codMinOrderValue)}`}
                        </span>
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DCCB] shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3">
              Order Summary ({totalItems} {totalItems === 1 ? "pack" : "packs"})
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-[#263618]">{item.product.name}</p>
                      {pricing.isOfferActive && (
                        <span className="bg-[#506638] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                          {pricing.badgeText}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 text-[#5F6F50]">
                      <span>{item.quantity} x</span>
                      {pricing.isOfferActive && (
                        <span className="line-through text-[#8C9A80] text-[11px]">
                          {formatINR(pricing.regularPrice)}
                        </span>
                      )}
                      <span className="font-semibold text-[#506638]">{formatINR(item.product.price)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#263618]">{formatINR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-3 text-xs border-t border-[#E2DCCB] pt-4">
              <div className="flex justify-between text-[#5F6F50]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#263618]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5F6F50]">
                <span>Delivery Charge (Tamil Nadu)</span>
                <span className="font-semibold text-[#263618]">
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-bold uppercase">Free</span>
                  ) : (
                    formatINR(currentDeliveryCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#5F6F50]">
                <span>Estimated Delivery:</span>
                <span className="font-bold text-[#263618]">{estimatedDeliveryTime}</span>
              </div>

              <div className="pt-3 border-t border-[#E2DCCB] flex justify-between items-baseline">
                <span className="text-base font-bold text-[#263618]">Total Payable</span>
                <span className="text-2xl font-extrabold text-[#506638]">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!pincodeErrorNotice}
              className="w-full py-4 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] disabled:opacity-50 transition-all text-base shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>
                    {formData.payment_method === "cod" ? "Confirm Order (COD)" : `Pay ${formatINR(grandTotal)} Online`}
                  </span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#5F6F50] text-center">
              <ShieldCheck className="w-4 h-4 text-[#506638] shrink-0" />
              <span>Safe & Encrypted 256-bit Checkout</span>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
