import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function isValidIndianMobile(mobile: string): boolean {
  const cleanMobile = mobile.trim().replace(/^(\+91|91)/, '');
  return /^[6-9]\d{9}$/.test(cleanMobile);
}

export function isValidIndianPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

export function isTamilNaduPincode(pincode: string): boolean {
  const cleanPin = pincode.trim();
  return /^6[0-4]\d{4}$/.test(cleanPin);
}

export function isValidTamilNaduPincode(pincode: string, allowedPincodesStr?: string | null): {
  isValid: boolean;
  isTN: boolean;
  isAllowed: boolean;
  errorReason?: string;
} {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return { isValid: false, isTN: false, isAllowed: false, errorReason: "PIN code must be a 6-digit number" };
  }

  const isTN = /^6[0-4]\d{4}$/.test(cleanPin);
  if (!isTN) {
    return { isValid: false, isTN: false, isAllowed: false, errorReason: "Right now we deliver only within Tamil Nadu." };
  }

  if (allowedPincodesStr && allowedPincodesStr.trim().length > 0) {
    const list = allowedPincodesStr
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (list.length > 0) {
      const isAllowed = list.includes(cleanPin);
      if (!isAllowed) {
        return {
          isValid: false,
          isTN: true,
          isAllowed: false,
          errorReason: "Right now we deliver only within selected Tamil Nadu PIN codes.",
        };
      }
    }
  }

  return { isValid: true, isTN: true, isAllowed: true };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
