// Single Source of Truth for Pad Size
export const PAD_SIZE_TEXT = "XL";

// Single Source of Truth for Absorbency Information
export const ABSORBENCY_TEXT = "40 to 50 ml";

// Single Source of Truth for Materials Used
export const MATERIALS_TEXT = "Made from Banana Fibre & Water Hyacinth";

// Single Source of Truth for Delivery Coverage
export const DELIVERY_COVERAGE_TEXT = "Delivering across Tamil Nadu";

/**
 * ============================================================================
 * PROMOTIONAL OFFER & PRICING CONFIGURATION
 * ============================================================================
 * 
 * Edit or extend the promotional offer details below:
 * - OFFER_END_DATE: The cutoff date/time for the promotional price (ISO format / YYYY-MM-DD).
 *   Example: "2026-10-31T23:59:59+05:30" (or "2026-10-31")
 * - REGULAR_PRICE: ₹60 (reverts automatically when current date is past OFFER_END_DATE)
 * - OFFER_PRICE: ₹45 (active while current date is on or before OFFER_END_DATE)
 * - OFFER_BADGE_TEXT: Badge displayed near the price ("Limited time offer")
 * - OFFER_VALIDITY_TEXT: Text displayed below the price ("Offer valid till october 31")
 */
export const OFFER_END_DATE = process.env.NEXT_PUBLIC_OFFER_END_DATE || "2026-10-31T23:59:59+05:30";
export const REGULAR_PRICE = Number(process.env.NEXT_PUBLIC_REGULAR_PRICE) || 60;
export const OFFER_PRICE = Number(process.env.NEXT_PUBLIC_OFFER_PRICE) || 45;
export const OFFER_BADGE_TEXT = process.env.NEXT_PUBLIC_OFFER_BADGE_TEXT || "Limited time offer";
export const OFFER_VALIDITY_TEXT = process.env.NEXT_PUBLIC_OFFER_VALIDITY_TEXT || "Offer valid till october 31";

/**
 * Checks whether the promotional offer is currently active.
 * Automatically evaluates whether the current time is on or before OFFER_END_DATE.
 */
export function isOfferActive(): boolean {
  try {
    const end = new Date(OFFER_END_DATE).getTime();
    if (isNaN(end)) return true; // Default to active launch offer
    return Date.now() <= end;
  } catch {
    return true;
  }
}

/**
 * Returns the effective unit price:
 * ₹45 while the offer is active, and ₹60 once the offer ends.
 */
export function getCurrentPrice(): number {
  return isOfferActive() ? OFFER_PRICE : REGULAR_PRICE;
}

/**
 * Unified helper returning all pricing metadata for UI components and server logic.
 */
export function getPricingInfo() {
  const active = isOfferActive();
  return {
    isOfferActive: active,
    currentPrice: active ? OFFER_PRICE : REGULAR_PRICE,
    regularPrice: REGULAR_PRICE,
    offerPrice: OFFER_PRICE,
    badgeText: OFFER_BADGE_TEXT,
    validityText: OFFER_VALIDITY_TEXT,
    endDate: OFFER_END_DATE,
  };
}

export const productContent = {
  id: "ilai-sanitary-pad-pack-6",
  slug: "ilai-sanitary-pad",
  name: "ILAI Sanitary Pad",
  tagline: "Sustainable menstrual protection crafted from banana fibre & water hyacinth.",
  get price() {
    return getCurrentPrice();
  },
  regularPrice: REGULAR_PRICE,
  offerPrice: OFFER_PRICE,
  packSize: "6 pads per pack",
  padsPerPack: 6,
  minQuantity: 1,
  maxQuantity: 10,
  materialsUsed: MATERIALS_TEXT,
  padSize: PAD_SIZE_TEXT,
  absorbencyInfo: ABSORBENCY_TEXT,
  description: `ILAI is a sustainable sanitary pad created to provide women in India with safe, comfortable, and affordable menstrual care. Made using banana fibre and water hyacinth based plant materials, ILAI offers gentle protection while reducing plastic waste in our environment.`,
  
  images: [
    "/images/product/ilai-pad-1.jpg",
    "/images/product/ilai-pad-2.jpg",
    "/images/product/ilai-pad-3.jpg",
    "/images/product/ilai-pad-4.jpg",
  ],

  highlights: [
    {
      id: "plant-based",
      title: "Banana Fibre & Water Hyacinth",
      description: "Crafted using renewable banana fibre and water hyacinth based materials.",
      icon: "Sprout"
    },
    {
      id: "biodegradable",
      title: "Biodegradable Design",
      description: "Designed for natural breakdown, reducing plastic footprint in landfills.",
      icon: "Leaf"
    },
    {
      id: "comfortable",
      title: "Soft & Absorbent",
      description: `Gentle texture designed for comfort. Absorbency: ${ABSORBENCY_TEXT}.`,
      icon: "ShieldCheck"
    },
    {
      id: "affordable",
      title: "Affordable Care",
      description: "High-quality sustainable menstrual hygiene priced at an accessible rate per pack of 6 pads.",
      icon: "Tag"
    }
  ],

  detailsSections: {
    materials: {
      title: "Materials Used",
      content: MATERIALS_TEXT
    },
    size: {
      title: "Pad Size",
      content: PAD_SIZE_TEXT
    },
    absorbency: {
      title: "Absorbency Information",
      content: ABSORBENCY_TEXT
    },
    howToUse: {
      title: "How to Use",
      steps: [
        "Unwrap the ILAI sanitary pad from its protective wrapper.",
        "Peel off the paper backing strip from the adhesive underside.",
        "Position and press the pad securely onto your undergarment.",
        "Change every 4 to 6 hours for maximum hygiene and comfort."
      ]
    },
    disposal: {
      title: "Disposal Instructions",
      steps: [
        "Wrap the used pad neatly in discarded paper or newspaper.",
        "Dispose in designated dry waste or compost bins.",
        "Do not flush down toilets.",
        "Made from banana fibre & water hyacinth based plant materials designed to naturally decompose in proper conditions."
      ]
    },
    whyDifferent: {
      title: "Why ILAI is Different",
      content: "Conventional sanitary pads contain up to 90% plastic and take up to 500 years to decompose. ILAI replaces synthetic plastics with renewable agricultural waste — banana fibre and water hyacinth — giving women a healthy, affordable, and Earth-friendly choice."
    }
  }
};

export const faqContent = [
  {
    question: "What is the absorbency capacity of ILAI sanitary pads?",
    answer: `ILAI sanitary pads provide an absorbency capacity of ${ABSORBENCY_TEXT} for reliable and comfortable protection.`
  },
  {
    question: "What is the size / dimensions of the pads?",
    answer: `ILAI sanitary pads are currently available in ${PAD_SIZE_TEXT} size.`
  },
  {
    question: "Where does ILAI deliver?",
    answer: "We currently deliver within Tamil Nadu only. Delivery orders are dispatched to valid Tamil Nadu PIN codes (starting with 60, 61, 62, 63, or 64). Standard estimated delivery time is 2-5 working days."
  },
  {
    question: "What are the shipping charges?",
    answer: "Standard flat delivery charge is ₹40 per order across Tamil Nadu. Free delivery options and Cash on Delivery rules are calculated automatically at checkout."
  },
  {
    question: "What raw materials are used to make ILAI pads?",
    answer: "ILAI pads are crafted from renewable, biodegradable plant materials — specifically banana fibre and water hyacinth."
  },
  {
    question: "How many pads come in one pack?",
    answer: "Each pack contains 6 biodegradable sanitary pads."
  }
];

export const whyIlaiContent = {
  title: "Why Choose ILAI?",
  subtitle: "Rethinking menstrual care with sustainable plant fibre innovation.",
  pillars: [
    {
      title: "Renewable Plant Fibre",
      description: "By utilizing banana fibre & water hyacinth based materials, we repurpose agricultural and aquatic waste into essential hygiene products, creating a circular model that benefits both women and nature.",
      icon: "Sprout"
    },
    {
      title: "Biodegradable Design",
      description: "Plastic pads persist in landfills for centuries. ILAI pads are designed to decompose naturally, drastically reducing environmental pollution without compromising performance.",
      icon: "Recycle"
    },
    {
      title: "Affordable & Accessible Care",
      description: "We believe sustainable menstrual hygiene should never be a luxury. ILAI makes eco-friendly protection accessible to everyone.",
      icon: "HeartHandshake"
    },
    {
      title: "Environmental Impact",
      description: "Water hyacinth is an invasive aquatic weed that chokes waterways, and banana pseudo-stems are often discarded after harvest. Utilizing these renewable plant sources helps clear water bodies and support farmer communities.",
      icon: "Globe"
    }
  ]
};

export const aboutContent = {
  title: "About ILAI",
  tamilTitle: "இலை",
  subtitle: "Pioneering eco-friendly menstrual care for a cleaner, healthier future.",
  story: `ILAI ("இலை" — the Tamil word for "leaf") was born out of a passion to solve two critical challenges in India: the high environmental cost of plastic-filled sanitary napkins and the lack of affordable, natural menstrual hygiene products.

Our journey began by exploring natural plant fibres abundant in South India — specifically banana fibre & water hyacinth based sources. By converting these eco-friendly plant raw materials into absorbent, soft sanitary pads, ILAI bridges the gap between sustainability, affordability, and hygiene.`,
  mission: "To empower every individual with natural, affordable, and dignified menstrual care while protecting our planet from single-use plastic waste.",
  vision: "A world where sustainable menstrual hygiene is universal, accessible, and completely zero-waste.",
  teamSection: {
    title: "Behind ILAI",
    description: "We are a dedicated team of innovators, sustainability researchers, and community advocates passionate about green technology and women's health in India."
  }
};

// FAQ items for the rule-based chat widget
export const FAQ_CHAT_ITEMS = [
  {
    question: "How long does delivery take?",
    answer: "We currently deliver within Tamil Nadu in [X] working days."
  },
  {
    question: "What payment options do you have?",
    answer: "You can pay online (UPI/card) or choose Cash on Delivery, where available."
  },
  {
    question: "How many pads are in a pack?",
    answer: "Each ILAI pack has 6 pads for ₹60."
  },
  {
    question: "What is ILAI made of?",
    answer: "ILAI pads are made from banana fibre and water hyacinth based materials."
  },
  {
    question: "How do I use and dispose of the pad?",
    answer: "See our Why ILAI page for full instructions on use and disposal."
  },
  {
    question: "Can I cancel or return my order?",
    answer: "See our Shipping & Returns page for our cancellation and return policy."
  },
  {
    question: "How do I track my order?",
    answer: "Use the Track Order page with your Order ID and mobile number."
  }
];

