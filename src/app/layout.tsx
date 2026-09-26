import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { CartProvider } from "@/components/cart-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FaqChatWidget } from "@/components/faq-chat-widget";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: siteConfig.siteTitle,
  description: siteConfig.subtagline,
  icons: {
    icon: "/images/ilai-logo.png",
  },
  keywords: [
    "ILAI",
    "ilai",
    "இலை",
    "biodegradable sanitary pads",
    "banana fibre pads",
    "water hyacinth sanitary napkins",
    "eco-friendly menstrual pads India",
    "sustainable sanitary pads",
    "affordable plant fibre pads"
  ],
  openGraph: {
    title: siteConfig.siteTitle,
    description: "Eco-friendly, comfortable sanitary pads made from banana fibre & water hyacinth.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/images/ilai-logo.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.siteTitle,
    description: "Natural sanitary pads crafted from banana fibre & water hyacinth.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="smooth-scroll">
      <body className={`${inter.className} min-h-screen bg-[#F6F2E6] text-[#263618] flex flex-col justify-between antialiased`}>
        <CartProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <FaqChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
