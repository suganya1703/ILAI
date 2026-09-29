"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, RefreshCw, Truck, CreditCard, MapPin, Package } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function AdminSettingsPage() {
  const router = useRouter();

  // Form State
  const [price, setPrice] = useState<number>(60);
  const [stockQuantity, setStockQuantity] = useState<number>(500);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(40);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  const [minPacksPerOrder, setMinPacksPerOrder] = useState<number>(1);
  const [codEnabled, setCodEnabled] = useState<boolean>(true);
  const [codMinOrderValue, setCodMinOrderValue] = useState<number>(0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("2-5 working days");
  const [allowedPincodes, setAllowedPincodes] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401) {
        localStorage.removeItem("ilai_admin_session");
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPrice(data.price);
        setStockQuantity(data.stock_quantity);
        setDeliveryCharge(data.delivery_charge);
        setFreeDeliveryThreshold(data.free_delivery_threshold || 0);
        setMinPacksPerOrder(data.min_packs_per_order || 1);
        setCodEnabled(data.cod_enabled !== undefined ? data.cod_enabled : true);
        setCodMinOrderValue(data.cod_min_order_value || 0);
        setEstimatedDeliveryTime(data.estimated_delivery_time || "2-5 working days");
        setAllowedPincodes(data.allowed_pincodes || "");
      }
    } catch (e) {
      setError("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price),
          stock_quantity: Number(stockQuantity),
          delivery_charge: Number(deliveryCharge),
          free_delivery_threshold: Number(freeDeliveryThreshold),
          min_packs_per_order: Number(minPacksPerOrder),
          cod_enabled: Boolean(codEnabled),
          cod_min_order_value: Number(codMinOrderValue),
          estimated_delivery_time: String(estimatedDeliveryTime).trim(),
          allowed_pincodes: String(allowedPincodes).trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("All store delivery and pricing settings saved successfully!");
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch (err) {
      setError("Error connecting to server while saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-[#F6F2E6]">
      <div className="flex items-center justify-between border-b border-[#E2DCCB] pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#263618] hover:text-[#3E512B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <span className="text-xs font-bold text-[#506638] bg-[#EDE8D8] border border-[#E2DCCB] px-3 py-1 rounded-full">
          Store Configuration
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DCCB] shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#263618]">Store Delivery & Pricing Settings</h1>
          <p className="text-xs text-[#5F6F50] mt-1">
            Configure unit price, delivery charges, free shipping rules, COD toggles, and pincode restriction settings.
          </p>
        </div>

        {message && (
          <div className="p-3 bg.emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-[#5F6F50] text-xs">Loading settings from database...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8 text-xs">
            {/* Section 1: Product Pricing & Inventory */}
            <div className="space-y-4 border-b border-[#E2DCCB] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#263618]">
                  <Package className="w-4 h-4 text-[#506638]" />
                  <span>Product Pricing & Inventory</span>
                </div>
                <span className="text-[11px] font-semibold text-[#506638] bg-[#EDE8D8] px-2.5 py-0.5 rounded-full border border-[#E2DCCB]">
                  Launch Offer: ₹45 (Reg: ₹60)
                </span>
              </div>

              {/* Offer Info Box */}
              <div className="bg-[#FAF8F2] border border-[#E2DCCB] rounded-2xl p-4 text-[#263618] space-y-1">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>🎯 Active Promotional Pricing</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">Active</span>
                </div>
                <p className="text-[11px] text-[#5F6F50]">
                  Displays <strong>₹60</strong> (strikethrough) and <strong>₹45</strong> (offer price) with "Limited time offer" badge.
                </p>
                <p className="text-[11px] text-[#506638] font-medium">
                  Cutoff date: <strong>October 31</strong> — Configured in <code className="bg-[#EDE8D8] px-1 py-0.5 rounded text-[10px] font-mono">src/config/content.ts</code> via <code className="bg-[#EDE8D8] px-1 py-0.5 rounded text-[10px] font-mono">OFFER_END_DATE</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Pad Price (₹ per pack) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638]"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Current Price: {formatINR(price)} / pack</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638]"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Warehouse inventory</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Min Packs Per Order *
                  </label>
                  <input
                    type="number"
                    value={minPacksPerOrder}
                    onChange={(e) => setMinPacksPerOrder(Number(e.target.value))}
                    min={1}
                    max={10}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638]"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Default: 1 pack minimum</p>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery & Shipping Configuration */}
            <div className="space-y-4 border-b border-[#E2DCCB] pb-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#263618]">
                <Truck className="w-4 h-4 text-[#506638]" />
                <span>Delivery & Shipping Fees</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Flat Delivery Charge (₹) *
                  </label>
                  <input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638]"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Default: ₹40</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Free Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638]"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Set 0 to disable free delivery</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="text"
                    value={estimatedDeliveryTime}
                    onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                    placeholder="e.g. 2-5 working days"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638]"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Default: "2-5 working days"</p>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Options & COD Settings */}
            <div className="space-y-4 border-b border-[#E2DCCB] pb-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#263618]">
                <CreditCard className="w-4 h-4 text-[#506638]" />
                <span>Cash on Delivery (COD) Rules</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-3 bg-[#F6F2E6] p-4 rounded-xl border border-[#E2DCCB]">
                  <input
                    type="checkbox"
                    id="codEnabled"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#506638] rounded cursor-pointer"
                  />
                  <label htmlFor="codEnabled" className="font-bold text-[#263618] text-sm cursor-pointer select-none">
                    Enable Cash on Delivery (COD)
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#263618] uppercase">
                    Min Order Value for COD (₹)
                  </label>
                  <input
                    type="number"
                    value={codMinOrderValue}
                    onChange={(e) => setCodMinOrderValue(Number(e.target.value))}
                    min={0}
                    disabled={!codEnabled}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-sm font-bold text-[#263618] focus:outline-none focus:border-[#506638] disabled:opacity-50"
                  />
                  <p className="text-[11px] text-[#5F6F50]">Set minimum subtotal needed to enable COD (Default: ₹0)</p>
                </div>
              </div>
            </div>

            {/* Section 4: Tamil Nadu Pincode Restrictions */}
            <div className="space-y-4 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#263618]">
                <MapPin className="w-4 h-4 text-[#506638]" />
                <span>Location Restrictions (Tamil Nadu Only)</span>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-[#263618] uppercase">
                  Allowed PIN Codes List (Optional)
                </label>
                <textarea
                  value={allowedPincodes}
                  onChange={(e) => setAllowedPincodes(e.target.value)}
                  placeholder="e.g. 600001, 600002, 600003, 625001"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2DCCB] text-xs font-mono text-[#263618] focus:outline-none focus:border-[#506638]"
                />
                <p className="text-[11px] text-[#5F6F50]">
                  Leave empty to allow <strong>all Tamil Nadu PIN codes</strong> (starting 60, 61, 62, 63, 64). If specified, only PIN codes listed above will be accepted.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors shadow-md text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <span>Saving Store Settings...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Live Settings to Database</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
