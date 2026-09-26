"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Leaf } from "lucide-react";
import { siteConfig } from "@/config/site";
import { productContent, MATERIALS_TEXT, DELIVERY_COVERAGE_TEXT } from "@/config/content";
import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Why ILAI", href: "/why-ilai" },
    { name: "About", href: "/about" },
    { name: "Track Order", href: "/track" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#F6F2E6]/95 backdrop-blur-md border-b border-[#E2DCCB] transition-all">
      {/* Announcement Ticker - Continuous Brand Background & Dark Text */}
      <div className="bg-[#F6F2E6] text-[#263618] text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-[#E2DCCB]">
        <Leaf className="w-3.5 h-3.5 text-[#506638]" />
        <span>{MATERIALS_TEXT} • {DELIVERY_COVERAGE_TEXT}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with mix-blend-multiply to seamlessly merge with #F6F2E6 background */}
          <Link href="/" className="flex items-center gap-3 group py-1">
            {!logoError ? (
              <img
                src="/images/ilai-logo.png"
                alt="ILAI Sustainable Femcare"
                onError={() => setLogoError(true)}
                className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#EDE8D8] flex items-center justify-center text-[#506638]">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-[#263618] font-sans">
                  {siteConfig.name.toLowerCase()}
                </span>
                <span className="text-xs font-semibold text-[#506638] bg-[#EDE8D8] px-2 py-0.5 rounded-full ml-1 border border-[#E2DCCB]">
                  {siteConfig.tamilName}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation Links - Uniform Dark Green #263618 Color across all links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-[#263618] hover:text-[#3E512B] relative py-1.5 transition-colors"
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#506638] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Cart & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full text-[#263618] hover:text-[#506638] hover:bg-[#EDE8D8] transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 text-[#263618]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#506638] text-white font-bold text-[11px] rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#263618] hover:bg-[#EDE8D8] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F6F2E6] border-b border-[#E2DCCB] px-4 pt-2 pb-6 space-y-2 shadow-md animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                isActive(link.href)
                  ? "bg-[#EDE8D8] text-[#263618] border-l-4 border-[#506638]"
                  : "text-[#263618] hover:bg-[#EDE8D8]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#E2DCCB] flex flex-col gap-2">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#506638] text-white rounded-lg font-semibold hover:bg-[#3E512B] transition-colors text-sm shadow-sm"
            >
              Shop Now ({formatINR(productContent.price)} / Pack)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
