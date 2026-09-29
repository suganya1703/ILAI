// ============================================================================
// Single Source of Truth for Store Contact Numbers
// Edit either of these two values to update numbers across the entire storefront:
// ============================================================================

/** 1. WHATSAPP NUMBER (for chat/message enquiries, floating button, wa.me links): 8610835406 */
export const WHATSAPP_NUMBER_RAW = "8610835406";

/** 2. PHONE CALL NUMBER (for calling, "Call us" section, tel: links): 8300815220 */
export const PHONE_CALL_NUMBER_RAW = "8300815220";

export const siteConfig = {
  name: "ILAI",
  siteTitle: "ILAI - Sustainable Sanitary Pads",
  tamilName: "இலை",
  tagline: "Sustainable Femcare + Comfort",
  subtagline: "Gentle on you, kind to the Earth — crafted from banana fibre & water hyacinth.",
  domain: "ilai.in",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ilai.in",
  contactEmail: "info.ilaiofficial@gmail.com",

  // Support Hours: Mon - Sat 9am-7pm, Sunday 7am-9pm
  supportHours: {
    weekdays: "Mon - Sat: 9:00 AM - 7:00 PM IST",
    sunday: "Sun: 7:00 AM - 9:00 PM IST",
    display: "Mon - Sat: 9:00 AM - 7:00 PM IST | Sun: 7:00 AM - 9:00 PM IST",
  },

  // 1. WhatsApp Configuration (8610835406)
  whatsappRaw: WHATSAPP_NUMBER_RAW,
  whatsappNumber: `91${WHATSAPP_NUMBER_RAW}`, // "918610835406" (country code, no +, no spaces for wa.me)
  whatsappDisplay: `+91 ${WHATSAPP_NUMBER_RAW.slice(0, 5)} ${WHATSAPP_NUMBER_RAW.slice(5)}`, // "+91 86108 35406"
  whatsappMessage: "Hello ILAI team, I have an inquiry regarding your biodegradable sanitary pads.",
  whatsappUrl: `https://wa.me/91${WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent("Hello ILAI team, I have an inquiry regarding your biodegradable sanitary pads.")}`,

  // 2. Phone Call Configuration (8300815220)
  phoneCallRaw: PHONE_CALL_NUMBER_RAW,
  phoneCallNumber: PHONE_CALL_NUMBER_RAW,
  phoneCallTel: `tel:+91${PHONE_CALL_NUMBER_RAW}`, // "tel:+918300815220" for tel: links
  phoneCallDisplay: `+91 ${PHONE_CALL_NUMBER_RAW.slice(0, 5)} ${PHONE_CALL_NUMBER_RAW.slice(5)}`, // "+91 83008 15220" for display
  contactPhone: `+91 ${PHONE_CALL_NUMBER_RAW.slice(0, 5)} ${PHONE_CALL_NUMBER_RAW.slice(5)}`, // "+91 83008 15220" (alias for phoneCallDisplay)
  instagramUrl: "https://instagram.com/_ilai_off",
  upiId: "suganyasubramaniam1727@okaxis",
  getUpiQrUrl: (token: string) => `/api/orders/${token}/qr`,
  currencySymbol: "₹",
  defaultDeliveryCharge: 40,
  freeDeliveryThreshold: null,
  theme: {
    primaryColor: "#506638", // Main organic leaf green from logo
    primaryHover: "#3E512B",
    accentColor: "#E8A2A4",  // Soft blush/pink accent from logo
    background: "#F6F2E6",   // Logo background color sampled from top-left pixel
    surface: "#FFFFFF",      // Clean surface for cards
    softGreen: "#EDE8D8",    // Soft brand background tint
    border: "#E2DCCB",       // Soft border line
    text: "#263618",         // Deep dark green text
    mutedText: "#5F6F50",    // Muted leaf text
  },
  indianStates: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ]
};
