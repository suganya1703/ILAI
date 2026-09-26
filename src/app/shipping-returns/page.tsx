import React from "react";
import { siteConfig } from "@/config/site";
import { MapPin } from "lucide-react";

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-[#5F6F50] text-sm leading-relaxed bg-[#F6F2E6]">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E2DCCB] shadow-sm space-y-6">
        <div className="border-b border-[#E2DCCB] pb-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE8D8] text-[#506638] text-xs font-bold border border-[#E2DCCB]">
            <MapPin className="w-3.5 h-3.5 text-[#506638]" />
            <span>Delivering across Tamil Nadu only</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263618]">
            Shipping & Returns Policy
          </h1>
          <p className="text-xs text-[#5F6F50]">Last updated: September 22, 2026</p>
        </div>

        <h2 className="text-lg font-bold text-[#263618] pt-2">1. Shipping & Location Coverage</h2>
        <p className="text-[#263618] font-semibold">
          We currently deliver within Tamil Nadu only.
        </p>
        <p>
          Deliveries are dispatched exclusively to valid 6-digit Tamil Nadu PIN codes (starting with 60, 61, 62, 63, or 64). Orders placed with PIN codes outside Tamil Nadu are automatically blocked. If you require bulk orders or special delivery inquiries outside Tamil Nadu, please reach out to us via WhatsApp.
        </p>

        <h2 className="text-lg font-bold text-[#263618] pt-2">2. Delivery Charges & Estimated Delivery Time</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Standard flat delivery charge: <strong>₹40 per order</strong>.</li>
          <li>Free delivery options are available when store subtotal thresholds are met.</li>
          <li>Estimated Delivery Time: <strong>2 to 5 working days</strong> across all districts in Tamil Nadu.</li>
        </ul>

        <h2 className="text-lg font-bold text-[#263618] pt-2">3. Order Tracking</h2>
        <p>
          Every customer receives a unique Order ID (format: <code>ILAI-2026-XXXX</code>) upon checkout. You can track your order status live at <strong><a href="/track" className="text-[#506638] underline font-bold">ilai.in/track</a></strong> by entering your Order ID and mobile number.
        </p>

        <h2 className="text-lg font-bold text-[#263618] pt-2">4. Personal Hygiene & Return Policy</h2>
        <p>
          Due to the intimate personal hygiene nature of sanitary pads, <strong>we cannot accept returns or exchanges once the product package seal has been opened or unsealed</strong>.
        </p>

        <h2 className="text-lg font-bold text-[#263618] pt-2">5. Damaged or Defective Deliveries</h2>
        <p>
          If you receive a package that is damaged, tampered with, or defective, please notify us within 48 hours of delivery at <strong>{siteConfig.contactEmail}</strong> or WhatsApp us at <strong>{siteConfig.contactPhone}</strong> with photos of the damaged parcel. We will issue a replacement or refund immediately.
        </p>
      </div>
    </div>
  );
}
