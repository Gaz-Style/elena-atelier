import type { Metadata } from "next";
import { Playfair_Display, Inter, Geist } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  title: "ELENA La Costurera | Alta Costura & Confección a Medida",
  description: "Costurera y atelier en Santiago especializada en vestidos de novia, alta costura, confección a medida, arreglos y reparación de prendas con terminaciones de excelencia.",
  openGraph: {
    title: "ELENA La Costurera | Alta Costura & Confección a Medida",
    description: "Costurera y atelier en Santiago especializada en vestidos de novia, alta costura, confección a medida, arreglos y reparación de prendas con terminaciones de excelencia.",
    url: "https://elenalacosturera.cl",
    siteName: "ELENA La Costurera",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ELENA La Costurera | Alta Costura & Confección a Medida",
    description: "Costurera y atelier en Santiago especializada en vestidos de novia, alta costura, confección a medida, arreglos y reparación de prendas con terminaciones de excelencia.",
    images: ["/og-image.jpg"],
  },
};

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
