"use client";

import React, { useState, useEffect, useRef } from "react";
import { QrCode, Smartphone, Clock, Copy, Check, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface UpiPaymentSectionProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  upiId: string;
  qrImageUrl: string;
  customerEmail?: string | null;
}

export function UpiPaymentSection({
  orderId,
  orderNumber,
  totalAmount,
  upiId,
  qrImageUrl,
  customerEmail,
}: UpiPaymentSectionProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [deepLinkFailed, setDeepLinkFailed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isAttemptingPay, setIsAttemptingPay] = useState<boolean>(false);

  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Deep link format: upi://pay?pa=[UPI_ID]&pn=ILAI&am=[AMOUNT]&cu=INR&tn=Order[ORDER_ID]
  const cleanOrderRef = orderNumber ? orderNumber.replace(/^(IL)+ILAI-/i, "ILAI-") : orderId;
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=ILAI&am=${encodeURIComponent(totalAmount.toString())}&cu=INR&tn=${encodeURIComponent(`Order${cleanOrderRef}`)}`;

  useEffect(() => {
    setIsMounted(true);

    const checkDevice = () => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isMobileWidth = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      return isMobileUa || isMobileWidth;
    };

    const mobileDetected = checkDevice();
    setIsMobile(mobileDetected);

    // On Desktop: Keep QR visible by default.
    // On Mobile: Hide QR code by default.
    setShowQr(!mobileDetected);

    const handleResize = () => {
      const nowMobile = checkDevice();
      setIsMobile(nowMobile);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const handleCopyUpiId = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Clipboard copy error:", err);
    }
  };

  const handleMobilePayClick = (e: React.MouseEvent) => {
    // Reset any previous failed state
    setDeepLinkFailed(false);
    setIsAttemptingPay(true);

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }

    let appOpened = false;

    // Detect if app switch occurred (browser tab loses focus / becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        appOpened = true;
      }
    };

    const handleBlur = () => {
      appOpened = true;
    };

    window.addEventListener("visibilitychange", handleVisibilityChange, { once: true });
    window.addEventListener("pagehide", handleBlur, { once: true });
    window.addEventListener("blur", handleBlur, { once: true });

    // If after ~2200ms the browser is still in the foreground and visible, deep link failed
    fallbackTimerRef.current = setTimeout(() => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleBlur);
      window.removeEventListener("blur", handleBlur);
      setIsAttemptingPay(false);

      if (!appOpened && !document.hidden) {
        setDeepLinkFailed(true);
        setShowQr(true); // Automatically reveal QR as fallback!
      }
    }, 2200);

    // Trigger UPI deep link navigation
    window.location.href = upiDeepLink;
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DCCB] shadow-md text-center space-y-6">
      {/* Header Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE8D8] text-[#506638] text-xs font-bold border border-[#E2DCCB]">
        {isMounted ? (
          isMobile ? (
            <>
              <Smartphone className="w-4 h-4 text-[#506638]" />
              <span>Instant UPI / GPay Payment</span>
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 text-[#506638]" />
              <span>UPI / GPay Payment QR Code</span>
            </>
          )
        ) : (
          <>
            <span className="inline-flex md:hidden items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#506638]" />
              <span>Instant UPI / GPay Payment</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#506638]" />
              <span>UPI / GPay Payment QR Code</span>
            </span>
          </>
        )}
      </div>

      {/* Main Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263618]">
          {isMounted ? (
            isMobile ? `Pay ${formatINR(totalAmount)} via UPI` : `Scan to Pay ${formatINR(totalAmount)}`
          ) : (
            <>
              <span className="block md:hidden">Pay {formatINR(totalAmount)} via UPI</span>
              <span className="hidden md:block">Scan to Pay {formatINR(totalAmount)}</span>
            </>
          )}
        </h2>
        <p className="text-xs text-[#5F6F50] mt-1">
          Compatible with Google Pay, PhonePe, Paytm, BHIM, and any UPI app
        </p>
      </div>

      {/* Deep link failure alert banner (Requirement 4) */}
      {deepLinkFailed && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-left flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">No UPI app found.</p>
            <p className="mt-0.5">Please scan the QR code below using GPay, PhonePe, or any UPI app.</p>
          </div>
        </div>
      )}

      {/* MOBILE VIEW: Prominent Pay Button (Requirement 2) */}
      <div className={`${isMounted ? (isMobile ? "block" : "hidden") : "block md:hidden"} max-w-md mx-auto space-y-4`}>
        {/* Large Prominent Pay Button */}
        <a
          href={upiDeepLink}
          onClick={handleMobilePayClick}
          id="mobile-upi-pay-button"
          className="w-full py-4 px-6 bg-[#506638] hover:bg-[#3E512B] active:scale-[0.98] text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 border border-[#3E512B] group cursor-pointer"
        >
          <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Pay ₹{totalAmount} with GPay / PhonePe / UPI app</span>
        </a>

        {/* Small fallback link/toggle: "Or show QR code instead" (Requirement 2) */}
        <div>
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            id="toggle-qr-code-button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#506638] hover:text-[#263618] hover:underline transition-colors py-1 px-3 rounded-lg hover:bg-[#EDE8D8]/50"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQr ? "Hide QR code" : "Or show QR code instead"}</span>
            {showQr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* QR CODE DISPLAY (Visible by default on Desktop, revealed on Mobile via toggle or fallback) */}
      <div
        className={`${
          isMounted ? (isMobile ? (showQr ? "block" : "hidden") : "block") : "hidden md:block"
        } transition-all duration-300 space-y-4`}
        id="upi-qr-container"
      >
        <div className="w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-2xl overflow-hidden border-2 border-[#506638]/30 p-3 bg-white shadow-lg relative">
          <img
            src={qrImageUrl}
            alt="ILAI GPay UPI QR Code"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-xs text-[#5F6F50]">
          Scan this QR code using Google Pay, PhonePe, Paytm, or any UPI app on your phone
        </p>
      </div>

      {/* Copyable UPI ID Box */}
      <div className="bg-[#F6F2E6] p-3.5 sm:p-4 rounded-xl border border-[#E2DCCB] inline-flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md w-full mx-auto">
        <div className="text-left">
          <p className="text-xs text-[#5F6F50]">UPI ID (Payee VPA):</p>
          <p className="text-sm font-extrabold text-[#506638] select-all tracking-wide mt-0.5">{upiId}</p>
        </div>
        <button
          type="button"
          onClick={handleCopyUpiId}
          className="w-full sm:w-auto px-3.5 py-1.5 bg-white hover:bg-[#EDE8D8] text-[#506638] border border-[#E2DCCB] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          title="Copy UPI ID"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy UPI ID</span>
            </>
          )}
        </button>
      </div>

      {/* Clear instruction — "After paying, we'll verify and confirm your order shortly." */}
      <div className="max-w-md mx-auto bg-[#EDE8D8]/80 border border-[#E2DCCB] rounded-2xl p-4 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-[#506638] font-bold text-sm">
          <Clock className="w-4 h-4" />
          <span>After paying, we&apos;ll verify and confirm your order shortly.</span>
        </div>
        <p className="text-xs text-[#5F6F50]">
          Once you complete payment in your UPI app, our team will verify the payment and confirm your order. Confirmation will be sent to <strong>{customerEmail || "your email"}</strong>.
        </p>
      </div>
    </div>
  );
}
