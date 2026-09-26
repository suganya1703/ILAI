"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, Mail, Instagram, ShieldCheck, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { MATERIALS_TEXT, DELIVERY_COVERAGE_TEXT } from "@/config/content";

export function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-[#F6F2E6] text-[#263618] border-t border-[#E2DCCB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {!logoError ? (
                <img
                  src="/images/ilai-logo.png"
                  alt="ILAI Logo"
                  onError={() => setLogoError(true)}
                  className="h-12 w-auto object-contain mix-blend-multiply"
                />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-2xl text-[#263618] tracking-tight">
                    {siteConfig.name.toLowerCase()}
                  </span>
                  <span className="text-xs font-semibold text-[#506638] bg-[#EDE8D8] border border-[#E2DCCB] px-2 py-0.5 rounded-full">
                    {siteConfig.tamilName}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-[#5F6F50] leading-relaxed">
              {siteConfig.subtagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white text-[#506638] hover:bg-[#506638] hover:text-white border border-[#E2DCCB] flex items-center justify-center transition-colors shadow-sm"
                aria-label="Contact on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="w-9 h-9 rounded-full bg-white text-[#5F6F50] hover:bg-[#506638] hover:text-white border border-[#E2DCCB] flex items-center justify-center transition-colors shadow-sm"
                aria-label="Send Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white text-[#5F6F50] hover:bg-[#506638] hover:text-white border border-[#E2DCCB] flex items-center justify-center transition-colors shadow-sm"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#263618]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#263618]">
              <li>
                <Link href="/" className="hover:text-[#3E512B] transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#3E512B] transition-colors font-medium">
                  Shop ILAI Pads
                </Link>
              </li>
              <li>
                <Link href="/why-ilai" className="hover:text-[#3E512B] transition-colors font-medium">
                  Why ILAI (Eco-Friendly)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3E512B] transition-colors font-medium">
                  Our Story & Mission
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#3E512B] transition-colors font-medium">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#263618]">
              Policies & Support
            </h4>
            <ul className="space-y-2 text-sm text-[#263618]">
              <li>
                <Link href="/contact" className="hover:text-[#3E512B] transition-colors font-medium">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#3E512B] transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#3E512B] transition-colors font-medium">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-[#3E512B] transition-colors font-medium">
                  Shipping & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-[#5F6F50] hover:text-[#263618] transition-colors text-xs font-medium">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Banner */}
          <div className="space-y-3 bg-white p-5 rounded-xl border border-[#E2DCCB] shadow-sm">
            <div className="flex items-center gap-2 text-[#506638] font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#506638]" />
              <span>Safe & Biodegradable</span>
            </div>
            <p className="text-xs text-[#5F6F50] leading-relaxed">
              {MATERIALS_TEXT}. Designed to protect women and nurture the Earth.
            </p>
            <div className="pt-2 text-xs text-[#506638] font-bold flex items-center gap-1">
              <span>📍 {DELIVERY_COVERAGE_TEXT}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#E2DCCB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F6F50] gap-4">
          <p>© {new Date().getFullYear()} ILAI Care. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#E8A2A4] fill-[#E8A2A4]" /> for sustainable menstruation.
          </p>
        </div>
      </div>
    </footer>
  );
}
