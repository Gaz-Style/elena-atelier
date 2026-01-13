import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { ElenaAtelierSchema } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELENA ATELIER | Alta Costura & Restauración en Vitacura",
  description: "Taller de alta costura y restauración de vestidos de gala en Vitacura. Expertos en arreglos de lujo, diseño a medida y confección ética en Santiago.",
  openGraph: {
    title: "ELENA ATELIER | Sastrería & Alta Costura en Vitacura",
    description: "No solo reparamos prendas, elevamos inversiones. Maestría técnica en vestidos de gala y restauración profesional.",
    url: "https://elenaatelier.cl",
    siteName: "Elena Atelier",
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
    title: "ELENA ATELIER | Phygital Luxury Tailoring",
    description: "Artesanía y tecnología unidas para la longevidad de su armario.",
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
        className={`${inter.variable} ${playfair.variable} antialiased font-sans text-brand-charcoal bg-brand-sand/30`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ElenaAtelierSchema) }}
        />
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
