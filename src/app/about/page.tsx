import React from "react";
import Link from "next/link";
import { Leaf, Target, Eye, Users, ArrowRight } from "lucide-react";
import { aboutContent } from "@/config/content";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-[#F6F2E6]">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#263618] text-xs font-semibold border border-[#E2DCCB] shadow-sm">
          <Leaf className="w-3.5 h-3.5 text-[#506638]" />
          <span>Our Origin & Purpose</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263618] tracking-tight">
          {aboutContent.title} <span className="text-[#506638] font-sans font-normal">({aboutContent.tamilTitle})</span>
        </h1>
        <p className="text-base sm:text-lg text-[#5F6F50] leading-relaxed">
          {aboutContent.subtitle}
        </p>
      </div>

      {/* Origin Story Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E2DCCB] shadow-sm space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-[#263618] border-b border-[#E2DCCB] pb-3">
          Why ILAI Was Created
        </h2>
        <div className="text-[#5F6F50] text-base leading-relaxed whitespace-pre-line">
          {aboutContent.story}
        </div>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EDE8D8] text-[#506638] border border-[#E2DCCB] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#263618]">Our Mission</h3>
          <p className="text-sm text-[#5F6F50] leading-relaxed">
            {aboutContent.mission}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EDE8D8] text-[#506638] border border-[#E2DCCB] flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#263618]">Our Vision</h3>
          <p className="text-sm text-[#5F6F50] leading-relaxed">
            {aboutContent.vision}
          </p>
        </div>
      </div>

      {/* Founder & Team Overview Section */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E2DCCB] shadow-sm max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EDE8D8] text-[#506638] border border-[#E2DCCB] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#263618]">
            {aboutContent.teamSection.title}
          </h2>
        </div>
        <p className="text-[#5F6F50] text-sm leading-relaxed">
          {aboutContent.teamSection.description}
        </p>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#F6F2E6] p-5 rounded-2xl border border-[#E2DCCB] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#506638] text-white font-bold flex items-center justify-center text-lg">
              IL
            </div>
            <div>
              <h4 className="font-bold text-[#263618] text-base">ILAI Research & Development</h4>
              <p className="text-xs text-[#5F6F50]">Materials & Sustainability Team</p>
            </div>
          </div>
          <div className="bg-[#F6F2E6] p-5 rounded-2xl border border-[#E2DCCB] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#506638] text-white font-bold flex items-center justify-center text-lg">
              IC
            </div>
            <div>
              <h4 className="font-bold text-[#263618] text-base">ILAI Community & Outreach</h4>
              <p className="text-xs text-[#5F6F50]">Women's Health & Distribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center pt-4">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-base shadow-md"
        >
          <span>Try ILAI Sanitary Pads Today</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
