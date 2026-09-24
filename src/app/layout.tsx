import type { Metadata } from "next";
import { Playfair_Display, Inter, Geist } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import WhatsAppButton from "@/components/WhatsAppButton";
import FacebookPixel from "@/components/FacebookPixel";
import TikTokPixel from "@/components/TikTokPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTagManager from "@/components/GoogleTagManager";
import { ElenaAtelierSchema } from "@/lib/seo";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elenalacosturera.cl"),
  title: "ELENA La Costurera | Atelier de Alta Costura & Confección a Medida en Vitacura",
  description: "Atelier exclusivo de Alta Costura y arreglos de ropa fina ubicado en Av. Tabancura 1091 (Oficina 319), Vitacura, Santiago. Especialistas en vestidos de novia, gala, graduaciones y sastrería a medida con atención presencial y envíos.",
  keywords: [
    "alta costura vitacura",
    "costurera lo barnechea",
    "arreglos de ropa las condes",
    "atelier vestidos de novia santiago",
    "vestidos de gala a medida",
    "vestidos de graduacion vitacura",
    "sastreria fina santiago",
    "compostura de ropa la dehesa",
    "upcycling nupcial chile",
    "elena la costurera tabancura"
  ],
  authors: [{ name: "Elena Rojas Bustamante" }],
  openGraph: {
    title: "ELENA La Costurera | Atelier de Alta Costura en Vitacura, Santiago",
    description: "Atelier de Alta Costura y arreglos de ropa fina en Av. Tabancura 1091, Vitacura. Especialistas en vestidos de novia, gala, graduación y sastrería a medida.",
    url: "https://elenalacosturera.cl",
    siteName: "ELENA La Costurera",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ELENA La Costurera Atelier Vitacura",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ELENA La Costurera | Atelier de Alta Costura en Vitacura",
    description: "Atelier de Alta Costura y arreglos de ropa fina en Av. Tabancura 1091, Vitacura, Santiago. Vestidos de novia, gala y sastrería.",
    images: ["/og-image.jpg"],
  },
};

import MicrosoftClarity from "@/components/MicrosoftClarity";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans text-white bg-brand-charcoal flex flex-col min-h-screen`}
      >
        <FacebookPixel />
        <TikTokPixel />
        <GoogleAnalytics />
        <GoogleTagManager />
        <MicrosoftClarity />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ElenaAtelierSchema) }}
        />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <WhatsAppButton />
      </body>
    </html>
  );
}
