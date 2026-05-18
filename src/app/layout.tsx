import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ElenaAtelierSchema } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "elenalacosturera | Patrimonio Textil & Lujo Silencioso",
  description: "Taller de alta costura en Vitacura. No hacemos ropa; construimos patrimonio textil. Maestría técnica, escasez deliberada y estética Wabi-Sabi.",
  openGraph: {
    title: "elenalacosturera | Patrimonio Textil",
    description: "Lujo que no se grita, se susurra en cada puntada. Restauración y sastrería de alta gama.",
    url: "https://elenalacosturera.cl",
    siteName: "elenalacosturera",
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
    title: "elenalacosturera | Lujo Silencioso",
    description: "El alma de la imperfección perfecta. Artesanía y tiempo.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans text-brand-charcoal bg-brand-sand/30 flex flex-col min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ElenaAtelierSchema) }}
        />
        <Navbar />
        <main className="pt-20 flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
