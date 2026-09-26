import React from "react";
import { siteConfig } from "@/config/site";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-slate-700 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900 border-b border-slate-200 pb-3">
        Privacy Policy
      </h1>
      <p className="text-xs text-slate-500">Last updated: September 19, 2026</p>

      <p>
        At <strong>ILAI Care</strong> ("we", "our", or "us"), we value your privacy and are committed to protecting the personal information of our customers across India.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">1. Information We Collect</h2>
      <p>
        When you place an order on ilai.in, we collect the necessary customer details required to fulfill your delivery, including your name, email address, 10-digit mobile number, shipping address, city, state, and 6-digit PIN code.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">2. Payment Security</h2>
      <p>
        We do not store your credit card numbers, debit card PINs, UPI PINs, or netbanking credentials on our servers. All online transactions are processed securely through Razorpay, a PCI-DSS compliant payment gateway provider.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">3. How We Use Your Data</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>To process and dispatch your order.</li>
        <li>To send order confirmation notifications and tracking updates via email or SMS/WhatsApp.</li>
        <li>To provide customer support and respond to inquiries.</li>
      </ul>

      <h2 className="text-lg font-bold text-slate-900 pt-2">4. Data Sharing</h2>
      <p>
        We do not sell or rent your personal information to third parties. We share delivery details strictly with authorized courier partners to ensure timely shipping of your order.
      </p>

      <h2 className="text-lg font-bold text-slate-900 pt-2">5. Contact Us</h2>
      <p>
        For any privacy concerns or data requests, please contact us at <strong>{siteConfig.contactEmail}</strong> or via WhatsApp at <strong>{siteConfig.contactPhone}</strong>.
      </p>
    </div>
  );
}
