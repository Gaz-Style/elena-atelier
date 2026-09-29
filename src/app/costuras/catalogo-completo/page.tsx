import { Metadata } from 'next';
import CatalogoClient from './CatalogoClient';

export const metadata: Metadata = {
    title: "Catálogo Completo de Arreglos de Ropa y Sastrería | Precios 2026 | Elena Atelier",
    description: "Inventario técnico oficial con 141+ arreglos de alta sastrería a domicilio en Vitacura, Las Condes, Lo Barnechea y La Dehesa. Especialistas en acortar mangas desde tajalí, entalle de vestidos de novia, basta ruedo original y cuero.",
    keywords: [
        "arreglos de ropa vitacura",
        "sastreria a domicilio lo barnechea",
        "acortar mangas tajalí la dehesa",
        "basta original jeans las condes",
        "entalle vestidos novia santiago",
        "costurera a domicilio sector oriente",
        "arreglo chaquetas cuero vitacura"
    ],
    openGraph: {
        title: "Catálogo Completo de Arreglos de Ropa & Sastrería | Elena Atelier",
        description: "Inventario técnico oficial con 141+ arreglos de alta sastrería a domicilio en Vitacura, Las Condes, Lo Barnechea y La Dehesa.",
        images: ['/og-image.jpg'],
    },
};

const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Elena Atelier — Sastrería y Arreglos Técnicos a Domicilio",
    "provider": {
        "@type": "LocalBusiness",
        "name": "Elena Atelier",
        "image": "https://www.elenalacosturera.cl/hero_seamstress_taller.png",
        "telephone": "+56937667709",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Vitacura",
            "addressRegion": "Región Metropolitana",
            "addressCountry": "CL"
        },
        "priceRange": "$$$"
    },
    "areaServed": [
        { "@type": "City", "name": "Vitacura" },
        { "@type": "City", "name": "Las Condes" },
        { "@type": "City", "name": "Lo Barnechea" },
        { "@type": "City", "name": "La Dehesa" },
        { "@type": "City", "name": "Los Trapenses" }
    ],
    "serviceType": "Alta Sastrería y Arreglos de Ropa Técnicos",
    "knowsAbout": [
        "Acortar mangas desde el tajalí u hombro",
        "Basta con conservación de ruedo original en jeans",
        "Entalle de vestidos de fiesta y novia",
        "Modificación de chaquetas de cuero y abrigos pesados",
        "Reconstrucción de pretinas de pantalón",
        "Sastrería artesanal con acabados de fábrica"
    ],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Catálogo Maestro de Arreglos Elena Atelier",
        "itemListElement": [
            {
                "@type": "OfferCatalog",
                "name": "Chaquetas y Sacos de Traje",
                "description": "Sastrería técnica de hombros, mangas desde tajalí y reemplazo de forros."
            },
            {
                "@type": "OfferCatalog",
                "name": "Pantalones y Jeans",
                "description": "Bastas invisibles, ruedos originales, achique de cintura y tiro."
            },
            {
                "@type": "OfferCatalog",
                "name": "Vestidos de Gala y Novia",
                "description": "Bastas multicapas de tul, corsés estructurados y copas preformadas."
            }
        ]
    }
};

export default function CatalogoCompletoPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
            />
            <CatalogoClient />
        </>
    );
}
