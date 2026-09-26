import React from "react";
import Link from "next/link";
import { Sprout, Recycle, HeartHandshake, Globe, ArrowRight, HelpCircle } from "lucide-react";
import { whyIlaiContent, productContent, faqContent } from "@/config/content";
import { formatINR } from "@/lib/utils";

export default function WhyIlaiPage() {
  const iconMap = {
    Sprout: Sprout,
    Recycle: Recycle,
    HeartHandshake: HeartHandshake,
    Globe: Globe,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-[#F6F2E6]">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB]">
          Sustainable Innovation
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263618] tracking-tight">
          {whyIlaiContent.title}
        </h1>
        <p className="text-base sm:text-lg text-[#5F6F50] leading-relaxed">
          {whyIlaiContent.subtitle}
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {whyIlaiContent.pillars.map((pillar, idx) => {
          const IconComponent = iconMap[pillar.icon as keyof typeof iconMap] || Sprout;
          return (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-[#E2DCCB] shadow-sm hover:shadow-md hover:border-[#506638] transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EDE8D8] text-[#506638] flex items-center justify-center shrink-0 border border-[#E2DCCB]">
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#263618]">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-[#5F6F50] text-sm leading-relaxed">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Comparison Banner Card */}
      <div className="bg-white text-[#263618] rounded-3xl p-8 sm:p-12 space-y-6 border border-[#E2DCCB] shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#506638] bg-[#EDE8D8] px-3 py-1 rounded-full border border-[#E2DCCB]">
            Plastic vs ILAI
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263618]">
            The Hidden Cost of Conventional Pads
          </h2>
          <p className="text-[#5F6F50] text-sm leading-relaxed">
            Conventional sanitary pads contain up to 90% plastic — equivalent to 4 plastic bags per pad. In India, over 12 billion discarded pads enter landfills each year, remaining for 500+ years. ILAI replaces synthetic plastics with banana fibre & water hyacinth based renewable plant materials, offering safe protection that degrades naturally.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md"
          >
            <span>Switch to ILAI Pads ({formatINR(productContent.price)})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#506638] text-xs font-semibold border border-[#E2DCCB]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263618]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqContent.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-2"
            >
              <h3 className="text-base font-bold text-[#263618]">
                {faq.question}
              </h3>
              <p className="text-sm text-[#5F6F50] leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
