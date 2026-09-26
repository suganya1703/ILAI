// Single Source of Truth for Store Contact Phone Number
const rawPhoneNumber = "8300815220"; // 10-digit Indian mobile number

export const siteConfig = {
  name: "ILAI",
  siteTitle: "ILAI - Sustainable Sanitary Pads",
  tamilName: "இலை",
  tagline: "Sustainable Femcare + Comfort",
  subtagline: "Gentle on you, kind to the Earth — crafted from banana fibre & water hyacinth.",
  domain: "ilai.in",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ilai.in",
  contactEmail: "support@ilai.in",
  contactPhone: `+91 ${rawPhoneNumber.slice(0, 5)} ${rawPhoneNumber.slice(5)}`, // "+91 83008 15220" for customer display
  whatsappNumber: `91${rawPhoneNumber}`, // "918300815220" for wa.me links & WhatsApp API
  whatsappMessage: "Hello ILAI team, I have an inquiry regarding your biodegradable sanitary pads.",
  instagramUrl: "https://instagram.com/ilai.care",
  upiId: "suganyasubramaniam1727@okaxis",
  upiQrImage: "/images/ilai-upi-qr.png",
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
