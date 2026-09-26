"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  MessageCircle,
  X,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { FAQ_CHAT_ITEMS } from "@/config/content";
import { siteConfig } from "@/config/site";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export function FaqChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Do not display chat widget on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage
  )}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSelectQuestion = (item: { question: string; answer: string }) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: item.question,
    };
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      text: item.answer,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Backdrop overlay for mobile & click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Stacked Floating Action Buttons Container (Bottom Right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Chat FAQ Floating Button (Stacked top) */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full shadow-lg border-2 border-[#506638]/30 hover:border-[#506638] bg-[#F6F2E6] flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 group ${
            isOpen ? "ring-2 ring-[#506638]" : "ring-2 ring-white/80"
          }`}
          aria-label={isOpen ? "Close FAQ Assistant" : "Open FAQ Assistant"}
          title="Quick FAQ Assistant"
        >
          {/* Circular Brand Illustration Icon */}
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#F6F2E6] p-0.5">
            <img
              src="/images/ilai-icon.png"
              alt="ILAI Support Assistant"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/ilai-logo.png";
              }}
              className="w-full h-full object-cover rounded-full mix-blend-multiply"
            />
          </div>

          {/* Chat Badge Indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#506638] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110">
            {isOpen ? (
              <X className="w-3 h-3 stroke-[3]" />
            ) : (
              <MessageSquare className="w-2.5 h-2.5 fill-white text-white" />
            )}
          </div>
        </button>

        {/* WhatsApp Floating Button (Stacked bottom) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:bg-[#20ba5a] transition-all duration-200 transform hover:scale-105 active:scale-95 ring-2 ring-white/60"
          aria-label="Chat on WhatsApp"
          title="Chat with us on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 fill-white/20" />
        </a>
      </div>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 max-h-[540px] h-[78vh] bg-[#F6F2E6] border border-[#E2DCCB] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label="ILAI Quick Assistant"
        >
          {/* Panel Header */}
          <div className="bg-[#506638] text-white p-3.5 px-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-5 h-5 text-[#E8A2A4]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  ILAI Quick Assistant
                </h3>
                <p className="text-[11px] text-[#EDE8D8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
                  Instant answers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleResetChat}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Content (Scrollable Chat History + Question Buttons) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
            {/* Greeting Bot Message */}
            <div className="flex items-start gap-2 max-w-[90%]">
              <div className="w-7 h-7 rounded-full bg-[#506638] text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                இ
              </div>
              <div className="bg-white text-[#263618] border border-[#E2DCCB] rounded-2xl rounded-tl-xs p-3 text-xs sm:text-sm shadow-sm leading-relaxed">
                Hi! I&apos;m here to help. Choose a question below or chat with us on WhatsApp.
              </div>
            </div>

            {/* Rendered Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "items-start gap-2 max-w-[90%]"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-[#506638] text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                    இ
                  </div>
                )}
                <div
                  className={`p-3 text-xs sm:text-sm shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#506638] text-white rounded-2xl rounded-tr-xs max-w-[85%] ml-auto"
                      : "bg-white text-[#263618] border border-[#E2DCCB] rounded-2xl rounded-tl-xs"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Questions Selection Section */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5F6F50] px-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#506638]" />
                <span>Select a Question</span>
              </div>

              <div className="space-y-1.5">
                {FAQ_CHAT_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuestion(item)}
                    className="w-full text-left text-xs sm:text-sm font-medium p-2.5 px-3 rounded-xl bg-white hover:bg-[#EDE8D8] text-[#263618] border border-[#E2DCCB] hover:border-[#506638] transition-all flex items-center justify-between group shadow-sm active:scale-[0.99]"
                  >
                    <span className="pr-2 leading-tight">{item.question}</span>
                    <ChevronRight className="w-4 h-4 text-[#5F6F50] group-hover:text-[#506638] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}

                {/* WhatsApp Action Option */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left text-xs sm:text-sm font-semibold p-2.5 px-3 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/40 transition-all flex items-center justify-between shadow-sm group mt-2"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20" />
                    <span>Chat with us on WhatsApp</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#128C7E] group-hover:scale-110 transition-transform shrink-0" />
                </a>
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Panel Footer Banner */}
          <div className="p-2 px-3 bg-[#EDE8D8]/60 border-t border-[#E2DCCB] text-[11px] text-[#5F6F50] text-center shrink-0">
            ILAI Eco-Friendly Sanitary Care • Tamil Nadu
          </div>
        </div>
      )}
    </>
  );
}
