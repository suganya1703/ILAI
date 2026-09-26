import React from "react";
import { siteConfig } from "@/config/site";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-slate-700 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900 border-b border-slate-200 pb-3">
        Terms & Conditions
      </h1>
      <p className="text-xs text-slate-500">Last updated: September 19, 2026</p>

      <p>
        Welcome to <strong>ILAI Care</strong>. By accessing or placing an order on our website (ilai.in), you agree to be bound by the following terms and conditions.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">1. Products & Pricing</h2>
      <p>
        All products listed on the website are subject to availability. Prices for ILAI sanitary pads are listed in Indian Rupees (₹) and include applicable taxes. We reserve the right to modify prices or delivery charges at any time without prior notice.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">2. Payment Methods</h2>
      <p>
        We accept online payments via Razorpay (UPI, Debit/Credit Cards, Netbanking) and Cash on Delivery (COD). For COD orders, payment must be handed over to the courier partner upon package delivery.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">3. Orders & Cancellation</h2>
      <p>
        Once an order is confirmed, it is queued for packing. Customers may cancel their order before dispatch by contacting support at {siteConfig.contactEmail} or on WhatsApp at {siteConfig.contactPhone}.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">4. Limitation of Liability</h2>
      <p>
        ILAI sanitary pads are personal hygiene products made from banana fibre and water hyacinth based materials. They should be used according to standard hygiene instructions.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">5. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.
      </p>
    </div>
  );
}
