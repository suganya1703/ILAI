"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { siteConfig } from "@/config/site";
import { productContent, getPricingInfo } from "@/config/content";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalItems, isLoaded } = useCart();
  const pricing = getPricingInfo();

  const [deliveryCharge, setDeliveryCharge] = useState<number>(siteConfig.defaultDeliveryCharge);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("2-5 working days");

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
        setEstimatedDeliveryTime(data.estimated_delivery_time || "2-5 working days");
      }
    } catch (e) {
      // Fallback to default site config
    }
  };

  const isFreeDelivery = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;
  const currentDeliveryCharge = items.length > 0 ? (isFreeDelivery ? 0 : deliveryCharge) : 0;
  const grandTotal = subtotal + currentDeliveryCharge;

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-[#5F6F50] bg-[#F6F2E6]">
        Loading cart details...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 bg-[#F6F2E6]">
        <div className="w-20 h-20 rounded-full bg-[#EDE8D8] text-[#506638] flex items-center justify-center mx-auto border border-[#E2DCCB]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#263618]">Your Cart is Empty</h1>
          <p className="text-sm text-[#5F6F50]">
            You haven't added any sanitary pads to your cart yet.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md"
        >
          <span>Browse Product ({formatINR(pricing.currentPrice)} / Pack)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F6F2E6]">
      {/* Tamil Nadu Shipping Badge & Header */}
      <div className="space-y-2 border-b border-[#E2DCCB] pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#506638] text-xs font-bold border border-[#E2DCCB] mb-2 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#506638]" />
              <span>Delivering across Tamil Nadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263618] tracking-tight">
              Shopping Cart ({totalItems} {totalItems === 1 ? "pack" : "packs"})
            </h1>
          </div>
          <Link href="/shop" className="text-xs font-semibold text-[#506638] hover:underline">
            + Add More Packs
          </Link>
        </div>

        {/* Free Delivery Banner Progress if Free Delivery Threshold > 0 */}
        {freeDeliveryThreshold > 0 && (
          <div className="pt-2">
            {isFreeDelivery ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Congratulations! You unlocked FREE delivery on this order!</span>
              </div>
            ) : (
              <div className="p-3 bg-[#EDE8D8] border border-[#E2DCCB] text-[#263618] text-xs font-bold rounded-xl flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#506638] shrink-0" />
                <span>
                  Add <strong>{formatINR(freeDeliveryThreshold - subtotal)}</strong> more for free delivery!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2DCCB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E2DCCB] shrink-0 bg-white shadow-sm">
                  <img
                    src="/images/ilai-box-front.jpg"
                    alt="ILAI Sanitary Pad Box"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/product.jpg";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#263618] text-base">
                      {item.product.name}
                    </h3>
                    {pricing.isOfferActive && (
                      <span className="bg-[#506638] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        {pricing.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5F6F50]">
                    Banana Fibre & Water Hyacinth Based ({productContent.packSize})
                  </p>
                  
                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    {pricing.isOfferActive && (
                      <span className="text-xs line-through text-[#8C9A80] font-semibold">
                        {formatINR(pricing.regularPrice)}
                      </span>
                    )}
                    <span className="text-sm font-bold text-[#506638]">
                      {formatINR(pricing.currentPrice)} / pack
                    </span>
                  </div>

                  {/* Validity line */}
                  {pricing.isOfferActive && (
                    <p className="text-[11px] text-[#506638] font-semibold mt-0.5">
                      {pricing.validityText}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Selector & Item Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E2DCCB]">
                <div className="flex items-center border border-[#E2DCCB] rounded-lg bg-[#F6F2E6] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 text-[#263618] hover:bg-[#EDE8D8] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-bold text-[#263618] text-sm select-none">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                    className="p-2 text-[#263618] hover:bg-[#EDE8D8] disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-[#263618] text-base">
                    {formatINR(item.product.price * item.quantity)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-[#5F6F50] hover:text-red-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#263618] border-b border-[#E2DCCB] pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#5F6F50]">
              <span>Subtotal ({totalItems} packs)</span>
              <span className="font-semibold text-[#263618]">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5F6F50]">
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-[#506638]" />
                <span>Delivery Charge</span>
              </span>
              <span className="font-semibold text-[#263618]">
                {isFreeDelivery ? (
                  <span className="text-emerald-700 font-bold uppercase">Free</span>
                ) : (
                  formatINR(currentDeliveryCharge)
                )}
              </span>
            </div>

            <div className="pt-2 text-xs text-[#5F6F50] border-t border-slate-100 flex items-center justify-between">
              <span>Estimated Delivery:</span>
              <span className="font-bold text-[#263618]">{estimatedDeliveryTime}</span>
            </div>

            <div className="pt-3 border-t border-[#E2DCCB] flex justify-between items-baseline">
              <span className="text-base font-bold text-[#263618]">Total Amount</span>
              <span className="text-2xl font-extrabold text-[#506638]">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-base shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="pt-2 space-y-1 text-center text-xs text-[#5F6F50]">
            <p className="flex items-center justify-center gap-1 font-semibold text-[#506638]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivering across Tamil Nadu only</span>
            </p>
            <p className="text-[11px] text-[#5F6F50]">Razorpay Online & COD Options Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
