import React from "react";
import Link from "next/link";
import { Sprout, Leaf, ShieldCheck, Tag, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { productContent, getPricingInfo } from "@/config/content";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { formatINR } from "@/lib/utils";

export default function HomePage() {
  const pricing = getPricingInfo();

  const highlightIcons = {
    "Banana Fibre & Water Hyacinth": Sprout,
    "Biodegradable Design": Leaf,
    "Soft & Absorbent": ShieldCheck,
    "Affordable Care": Tag,
  };

  return (
    <div className="space-y-16 pb-16 bg-[#F6F2E6]">
      {/* Hero Section - Continuous Logo Background (#F6F2E6) */}
      <section className="relative overflow-hidden bg-[#F6F2E6] pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E2DCCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#263618] border border-[#E2DCCB] text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#506638]" />
                <span>Sustainable Femcare & Comfort</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#263618] leading-[1.15]">
                Natural Protection. <br className="hidden sm:inline" />
                <span className="text-[#506638]">Gentle on You & Earth.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5F6F50] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Introducing <strong className="text-[#263618] font-semibold">ILAI (இலை)</strong> — sanitary pads crafted from renewable banana fibre & water hyacinth based plant materials. Soft, natural, and accessible care for every woman in India.
              </p>

              {/* Pricing & CTA Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#506638] text-white font-bold text-base hover:bg-[#3E512B] transition-all shadow-md active:scale-[0.99]"
                >
                  <span>Shop Now — {formatINR(pricing.currentPrice)} / Pack</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/why-ilai"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white text-[#263618] font-semibold border border-[#E2DCCB] hover:bg-[#EDE8D8] transition-colors"
                >
                  Why Choose ILAI?
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-medium text-[#5F6F50]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#506638]" />
                  <span>Banana Fibre & Water Hyacinth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#506638]" />
                  <span>{productContent.packSize}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#506638]" />
                  <span>Pan-India Shipping</span>
                </div>
              </div>
            </div>

            {/* Right Product Image Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md relative group">
                <ProductImagePlaceholder className="w-full aspect-square shadow-sm border border-[#E2DCCB] rounded-2xl overflow-hidden" />
                
                {/* Floating Product Card Badge with Strikethrough & Offer Label */}
                <div className="absolute -bottom-4 -right-4 bg-white border border-[#E2DCCB] p-3 rounded-2xl shadow-lg flex items-center gap-3">
                  <div className="rounded-xl bg-[#EDE8D8] px-3 py-2 flex flex-col items-center justify-center text-[#263618] border border-[#E2DCCB]">
                    {pricing.isOfferActive ? (
                      <>
                        <span className="text-[11px] line-through text-[#8C9A80] font-semibold leading-none">
                          {formatINR(pricing.regularPrice)}
                        </span>
                        <span className="font-extrabold text-base text-[#506638] leading-tight">
                          {formatINR(pricing.currentPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="font-extrabold text-sm text-[#506638]">
                        {formatINR(pricing.currentPrice)}
                      </span>
                    )}
                  </div>
                  <div className="text-left text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-[#263618]">ILAI Sanitary Pad</p>
                      {pricing.isOfferActive && (
                        <span className="bg-[#506638] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          {pricing.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-[#5F6F50]">{productContent.packSize}</p>
                    {pricing.isOfferActive && (
                      <p className="text-[10px] text-[#506638] font-semibold mt-0.5">
                        {pricing.validityText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Short Introduction Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#263618] tracking-tight">
          Rethinking Menstrual Care in India
        </h2>
        <p className="text-base text-[#5F6F50] leading-relaxed">
          {productContent.description}
        </p>
      </section>

      {/* 4 Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB]">
            Key Features
          </span>
          <h2 className="text-3xl font-bold text-[#263618]">
            Why Women Choose ILAI
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productContent.highlights.map((item) => {
            const IconComponent = highlightIcons[item.title as keyof typeof highlightIcons] || Sprout;
            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm hover:shadow-md hover:border-[#506638] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EDE8D8] text-[#506638] flex items-center justify-center border border-[#E2DCCB]">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#263618]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5F6F50] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flagship Banner Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white text-[#263618] border border-[#E2DCCB] rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <span className="inline-block text-xs font-semibold text-[#506638] bg-[#EDE8D8] px-3 py-1 rounded-full border border-[#E2DCCB]">
                Flagship Pack
              </span>
              {pricing.isOfferActive && (
                <span className="inline-block text-xs font-bold text-white bg-[#506638] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  {pricing.badgeText}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ILAI Sanitary Pad ({productContent.packSize})
            </h2>

            {/* Price Row: Strikethrough Regular + Offer Price */}
            <div className="flex items-baseline justify-center lg:justify-start gap-3 flex-wrap">
              {pricing.isOfferActive && (
                <span className="text-2xl line-through text-[#8C9A80] font-semibold">
                  {formatINR(pricing.regularPrice)}
                </span>
              )}
              <span className="text-4xl font-extrabold text-[#506638]">
                {formatINR(pricing.currentPrice)}
              </span>
              <span className="text-xs text-[#5F6F50] font-normal">
                / Pack (6 pads)
              </span>
            </div>

            {pricing.isOfferActive && (
              <p className="text-xs text-[#506638] font-semibold">
                {pricing.validityText}
              </p>
            )}

            <p className="text-[#5F6F50] text-sm sm:text-base leading-relaxed">
              Made from banana fibre &amp; water hyacinth based materials. Biodegradable, soft, and accessible at just {formatINR(pricing.currentPrice)}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-center shadow-md"
            >
              Order Now — {formatINR(pricing.currentPrice)}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
