import React from "react";
import { MessageCircle, Mail, Instagram, Phone, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#F6F2E6]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#506638] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#E2DCCB] shadow-sm">
          We are here to help
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263618] tracking-tight">
          Contact & Customer Support
        </h1>
        <p className="text-sm sm:text-base text-[#5F6F50]">
          Have questions about ILAI sanitary pads, order delivery, or bulk inquiries? Reach out to us directly through any of our official channels.
        </p>
      </div>

      {/* Main Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* WhatsApp Card */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-4 text-center flex flex-col justify-between hover:border-[#506638] transition-colors">
          <div className="w-16 h-16 rounded-full bg-[#EDE8D8] text-[#506638] flex items-center justify-center mx-auto border border-[#E2DCCB]">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#263618]">WhatsApp Chat</h3>
            <p className="text-xs text-[#5F6F50]">Fastest response for order support</p>
          </div>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Email Support Card */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-4 text-center flex flex-col justify-between hover:border-[#506638] transition-colors">
          <div className="w-16 h-16 rounded-full bg-[#EDE8D8] text-[#506638] flex items-center justify-center mx-auto border border-[#E2DCCB]">
            <Mail className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#263618]">Email Support</h3>
            <p className="text-xs text-[#5F6F50]">For general & corporate inquiries</p>
          </div>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="w-full py-3 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md inline-flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>{siteConfig.contactEmail}</span>
          </a>
        </div>

        {/* Instagram Profile Card */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2DCCB] shadow-sm space-y-4 text-center flex flex-col justify-between hover:border-[#506638] transition-colors">
          <div className="w-16 h-16 rounded-full bg-[#EDE8D8] text-[#506638] flex items-center justify-center mx-auto border border-[#E2DCCB]">
            <Instagram className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#263618]">Instagram</h3>
            <p className="text-xs text-[#5F6F50]">Follow for updates & community stories</p>
          </div>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-sm shadow-md inline-flex items-center justify-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            <span>@ilai.care</span>
          </a>
        </div>
      </div>

      {/* Support Hours & Location Info */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-[#E2DCCB] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left text-xs text-[#5F6F50] shadow-sm">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <Clock className="w-5 h-5 text-[#506638] shrink-0" />
          <div>
            <p className="font-bold text-[#263618]">Support Hours</p>
            <p>Mon - Sat: 9:00 AM - 7:00 PM IST</p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <Phone className="w-5 h-5 text-[#506638] shrink-0" />
          <div>
            <p className="font-bold text-[#263618]">Direct Helpline</p>
            <p>{siteConfig.contactPhone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <MapPin className="w-5 h-5 text-[#506638] shrink-0" />
          <div>
            <p className="font-bold text-[#263618]">Location</p>
            <p>Tamil Nadu, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
