import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  title: "ELENA La Costurera | Alta Costura & Diseño a Medida",
  description: "Atelier de alta costura y diseño a medida en Santiago. Creamos prendas exclusivas, restauración textil y desarrollo boutique con oficio artesanal, atención personalizada y confección premium.",
  openGraph: {
    title: "ELENA La Costurera | Alta Costura & Diseño a Medida",
    description: "Atelier de alta costura y diseño a medida en Santiago. Creamos prendas exclusivas, restauración textil y desarrollo boutique con oficio artesanal, atención personalizada y confección premium.",
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
    title: "ELENA La Costurera | Alta Costura & Diseño a Medida",
    description: "Atelier de alta costura y diseño a medida en Santiago. Creamos prendas exclusivas, restauración textil y desarrollo boutique con oficio artesanal, atención personalizada y confección premium.",
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
        className={`${inter.variable} ${playfair.variable} antialiased font-sans text-white bg-brand-charcoal flex flex-col min-h-screen`}
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
        <WhatsAppButton />
      </body>
    </html>
  );
}
