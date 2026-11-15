import { Metadata } from 'next';
import CatalogoClient from '@/app/costuras/catalogo-completo/CatalogoClient';

export const metadata: Metadata = {
    title: "Lista de Precios de Arreglos de Ropa en Chile 2026 | Elena Atelier",
    description: "Lista oficial de precios y tarifas para arreglos de ropa, bastas de jeans, entalles, composturas y sastrería fina en Santiago de Chile. Tarifas desde $8.000 con retiro a domicilio o en taller Vitacura.",
    keywords: [
        "lista de precios de arreglos de ropa en chile",
        "precios arreglos de ropa santiago",
        "precios costurera vitacura",
        "cuanto cuesta una basta de pantalon chile",
        "precio arreglo de cierres chile",
        "entalle vestidos fiesta precio",
        "costurera a domicilio las condes precios",
        "sastreria precios chile"
    ],
    openGraph: {
        title: "Lista de Precios de Arreglos de Ropa en Chile 2026 | Elena Atelier",
        description: "Tarifas transparentes con 141+ arreglos de alta sastrería y composturas en Santiago. Retiro a domicilio en Vitacura, Las Condes y Lo Barnechea.",
        images: ['/og-image.jpg'],
        url: 'https://www.elenalacosturera.cl/precios',
        locale: 'es_CL',
        type: 'website',
    },
    alternates: {
        canonical: 'https://www.elenalacosturera.cl/precios',
    },
};

const jsonLdPrecios = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Lista Oficial de Precios de Arreglos de Ropa y Sastrería en Chile",
    "provider": {
        "@type": "LocalBusiness",
        "name": "Elena Atelier - Alta Costura & Sastrería",
        "image": "https://www.elenalacosturera.cl/hero_seamstress_taller.png",
        "telephone": "+56972812907",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Av. Tabancura 1091, Oficina 319",
            "addressLocality": "Vitacura",
            "addressRegion": "Región Metropolitana",
            "addressCountry": "CL"
        },
        "priceRange": "$$"
    },
    "areaServed": [
        { "@type": "City", "name": "Vitacura" },
        { "@type": "City", "name": "Las Condes" },
        { "@type": "City", "name": "Lo Barnechea" },
        { "@type": "City", "name": "La Dehesa" },
        { "@type": "City", "name": "Providencia" },
        { "@type": "City", "name": "Santiago" }
    ],
    "serviceType": "Lista de Precios de Arreglos de Ropa y Sastrería",
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Tarifas de Arreglos de Ropa Elena Atelier 2026",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Basta Invisible a Mano en Pantalón de Vestir"
                },
                "price": "8000",
                "priceCurrency": "CLP"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Basta Original de Jeans con Conservación de Ruedo"
                },
                "price": "10000",
                "priceCurrency": "CLP"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Achicar Cintura en Pretina de Pantalón o Jeans"
                },
                "price": "12000",
                "priceCurrency": "CLP"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Entalle de Vestidos de Fiesta y Gala"
                },
                "price": "12000",
                "priceCurrency": "CLP"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Acortar Mangas desde el Puño en Blazer con Forro"
                },
                "price": "15000",
                "priceCurrency": "CLP"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Cambio de Cierre en Parkas o Chaqueta de Pluma"
                },
                "price": "18000",
                "priceCurrency": "CLP"
            }
        ]
    }
};

export default function PreciosPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPrecios) }}
            />
            <CatalogoClient />
        </>
    );
}
