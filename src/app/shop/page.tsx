"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, Zap, CheckCircle2, Sparkles } from "lucide-react";
import { productContent, getPricingInfo } from "@/config/content";
import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/lib/utils";
import { ProductGallery } from "@/components/product-gallery";

export default function ShopPage() {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"details" | "howToUse" | "disposal">("details");
  const [addedNotice, setAddedNotice] = useState(false);

  const router = useRouter();
  const { addItem } = useCart();
  const pricing = getPricingInfo();

  const productImages = productContent.images && productContent.images.length > 0 
    ? productContent.images 
    : [
        "/images/product/ilai-pad-1.jpg",
        "/images/product/ilai-pad-2.jpg",
        "/images/product/ilai-pad-3.jpg",
        "/images/product/ilai-pad-4.jpg",
      ];

  const productObj = {
    id: productContent.id,
    slug: productContent.slug,
    name: productContent.name,
    subtitle: productContent.tagline,
    price: pricing.currentPrice,
    pack_quantity: productContent.padsPerPack,
    stock_quantity: 500,
    is_available: true,
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(productContent.minQuantity, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => Math.min(productContent.maxQuantity, prev + 1));
  };

  const handleAddToCart = () => {
    addItem(productObj, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    addItem(productObj, quantity);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 bg-[#F6F2E6]">
      {/* Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={productImages}
            productName={productContent.name}
          />
        </div>

        {/* Right Column: Buying Options */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#263618] text-xs font-semibold mb-3 border border-[#E2DCCB]">
              <Sparkles className="w-3.5 h-3.5 text-[#506638]" />
              <span>Banana Fibre & Water Hyacinth Based</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263618] tracking-tight">
              {productContent.name}
            </h1>
            <p className="text-[#5F6F50] text-sm mt-1">
              {productContent.tagline}
            </p>
          </div>

          {/* Pricing & Pack Spec */}
          <div className="bg-white p-5 rounded-xl border border-[#E2DCCB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {/* Badge & Stock Indicator */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {pricing.isOfferActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#506638] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    {pricing.badgeText}
                  </span>
                )}
                <span className="text-xs font-bold text-[#506638] bg-[#EDE8D8] px-2.5 py-0.5 rounded-md border border-[#E2DCCB]">
                  In Stock
                </span>
              </div>

              {/* Price Row: Original (strikethrough) + Current Price */}
              <div className="flex items-baseline gap-2.5 flex-wrap">
                {pricing.isOfferActive && (
                  <span className="text-xl line-through text-[#8C9A80] font-semibold">
                    {formatINR(pricing.regularPrice)}
                  </span>
                )}
                <span className="text-3xl font-extrabold text-[#506638]">
                  {formatINR(pricing.currentPrice)}
                </span>
                <span className="text-xs text-[#5F6F50] font-normal">
                  (Inclusive of all taxes)
                </span>
              </div>

              {/* Offer Validity Small Text Line */}
              {pricing.isOfferActive && (
                <p className="text-xs text-[#506638] font-semibold mt-1">
                  {pricing.validityText}
                </p>
              )}

              <p className="text-xs font-semibold text-[#263618] mt-1.5">
                Pack Size: <span className="text-[#506638] font-bold">{productContent.packSize}</span>
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#263618]">
              Select Pack Quantity (Min 1, Max 10):
            </label>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-[#E2DCCB] rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= productContent.minQuantity}
                  className="p-3 text-[#263618] hover:bg-[#EDE8D8] disabled:opacity-40 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2 font-bold text-[#263618] text-base min-w-[3rem] text-center select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= productContent.maxQuantity}
                  className="p-3 text-[#263618] hover:bg-[#EDE8D8] disabled:opacity-40 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-sm font-medium text-[#5F6F50]">
                Total: <strong className="text-[#506638] font-bold">{formatINR(pricing.currentPrice * quantity)}</strong>
              </span>
            </div>
          </div>

          {/* Added to Cart Toast Notice */}
          {addedNotice && (
            <div className="p-3 bg-[#EDE8D8] border border-[#E2DCCB] text-[#263618] text-xs font-semibold rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#506638]" />
              <span>Added {quantity} pack(s) of ILAI Sanitary Pad to your cart!</span>
            </div>
          )}

          {/* Action Buttons: Add to Cart (Outline) & Buy Now (Solid) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full sm:w-1/2 py-4 px-6 rounded-xl border-2 border-[#506638] text-[#506638] font-bold text-base hover:bg-[#EDE8D8] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 text-[#506638]" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full sm:w-1/2 py-4 px-6 rounded-xl bg-[#506638] text-white font-bold text-base hover:bg-[#3E512B] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Zap className="w-5 h-5 text-[#E8A2A4]" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Key Specs Card */}
          <div className="pt-4 border-t border-[#E2DCCB] space-y-2 text-xs text-[#5F6F50]">
            <div className="flex justify-between py-1 border-b border-[#E2DCCB]/60">
              <span className="font-medium text-[#5F6F50]">Shipping Coverage:</span>
              <span className="font-bold text-[#506638] bg-[#EDE8D8] px-2 py-0.5 rounded border border-[#E2DCCB]">
                Delivering across Tamil Nadu only
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2DCCB]/60">
              <span className="font-medium text-[#5F6F50]">Delivery Charge & Time:</span>
              <span className="font-bold text-[#263618]">₹40 • 2-5 working days</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2DCCB]/60">
              <span className="font-medium text-[#5F6F50]">Materials Used:</span>
              <span className="font-bold text-[#263618]">{productContent.materialsUsed}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2DCCB]/60">
              <span className="font-medium text-[#5F6F50]">Number of Pads:</span>
              <span className="font-bold text-[#263618]">{productContent.packSize}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2DCCB]/60">
              <span className="font-medium text-[#5F6F50]">Pad Size:</span>
              <span className="font-semibold text-[#5F6F50] bg-[#EDE8D8] px-2 py-0.5 rounded border border-[#E2DCCB]">
                {productContent.padSize}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-[#5F6F50]">Absorbency:</span>
              <span className="font-semibold text-[#5F6F50] bg-[#EDE8D8] px-2 py-0.5 rounded border border-[#E2DCCB]">
                {productContent.absorbencyInfo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs Section */}
      <div className="bg-white rounded-2xl border border-[#E2DCCB] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2DCCB] gap-6 text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "details"
                ? "border-[#506638] text-[#506638]"
                : "border-transparent text-[#5F6F50] hover:text-[#263618]"
            }`}
          >
            Product Overview & Specifications
          </button>
          <button
            onClick={() => setActiveTab("howToUse")}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "howToUse"
                ? "border-[#506638] text-[#506638]"
                : "border-transparent text-[#5F6F50] hover:text-[#263618]"
            }`}
          >
            How to Use
          </button>
          <button
            onClick={() => setActiveTab("disposal")}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "disposal"
                ? "border-[#506638] text-[#506638]"
                : "border-transparent text-[#5F6F50] hover:text-[#263618]"
            }`}
          >
            Disposal & Environment
          </button>
        </div>

        {/* Tab 1: Details & Specs */}
        {activeTab === "details" && (
          <div className="space-y-6 text-[#263618] text-sm leading-relaxed animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-[#263618] mb-2">Description</h3>
              <p className="text-[#5F6F50]">{productContent.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-[#F6F2E6] p-4 rounded-xl border border-[#E2DCCB]">
                <h4 className="font-bold text-[#263618] text-sm mb-1">
                  {productContent.detailsSections.materials.title}
                </h4>
                <p className="text-[#506638] font-semibold">
                  {productContent.detailsSections.materials.content}
                </p>
              </div>

              <div className="bg-[#F6F2E6] p-4 rounded-xl border border-[#E2DCCB]">
                <h4 className="font-bold text-[#263618] text-sm mb-1">
                  {productContent.detailsSections.size.title}
                </h4>
                <p className="text-[#263618] font-semibold">
                  {productContent.detailsSections.size.content}
                </p>
              </div>

              <div className="bg-[#F6F2E6] p-4 rounded-xl border border-[#E2DCCB]">
                <h4 className="font-bold text-[#263618] text-sm mb-1">
                  {productContent.detailsSections.absorbency.title}
                </h4>
                <p className="text-[#263618] font-semibold">
                  {productContent.detailsSections.absorbency.content}
                </p>
              </div>

              <div className="bg-[#F6F2E6] p-4 rounded-xl border border-[#E2DCCB]">
                <h4 className="font-bold text-[#263618] text-sm mb-1">Pads Per Pack</h4>
                <p className="text-[#263618] font-medium">{productContent.packSize}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2DCCB]">
              <h3 className="text-base font-bold text-[#263618] mb-2">
                {productContent.detailsSections.whyDifferent.title}
              </h3>
              <p className="text-[#5F6F50]">{productContent.detailsSections.whyDifferent.content}</p>
            </div>
          </div>
        )}

        {/* Tab 2: How to Use */}
        {activeTab === "howToUse" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-[#263618]">
              Step-by-Step Instructions
            </h3>
            <ol className="space-y-3">
              {productContent.detailsSections.howToUse.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#F6F2E6] p-3.5 rounded-xl border border-[#E2DCCB]">
                  <span className="w-6 h-6 rounded-full bg-[#506638] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-[#263618] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tab 3: Disposal */}
        {activeTab === "disposal" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-[#263618]">
              Eco-Friendly Disposal Guide
            </h3>
            <ul className="space-y-3">
              {productContent.detailsSections.disposal.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#F6F2E6] p-3.5 rounded-xl border border-[#E2DCCB]">
                  <CheckCircle2 className="w-5 h-5 text-[#506638] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#263618] leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
