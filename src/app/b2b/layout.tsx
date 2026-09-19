import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sastrería Corporativa y Convenios B2B | Elena Atelier Las Condes',
    description: 'Servicio exclusivo de sastrería ejecutiva a domicilio en Las Condes, Vitacura y El Golf. Ajuste de trajes, mantención de uniformes y cotizaciones in-situ para RRHH.',
    keywords: 'sastrería corporativa, sastrería a domicilio, uniformes empresas, arreglos de ropa las condes, sastrería sanhattan, convenios B2B, costurera a domicilio santiago, executive care',
    openGraph: {
        title: 'Sastrería Ejecutiva en tu Oficina | Elena Atelier',
        description: 'Llevamos la alta costura al piso de gerencia. Ahorra tiempo con nuestro servicio corporativo B2B en Sanhattan.',
        images: [{ url: '/b2b_hero.png' }],
    }
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Sastrería Corporativa y Ejecutiva a Domicilio",
    "provider": {
        "@type": "LocalBusiness",
        "name": "Elena Atelier",
        "image": "https://www.elenaatelier.cl/b2b_hero.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tabancura 1091, Oficina 319",
            "addressLocality": "Vitacura",
            "addressRegion": "Región Metropolitana",
            "addressCountry": "CL"
        }
    },
    "areaServed": ["Las Condes", "Vitacura", "Lo Barnechea", "Providencia"],
    "audience": {
        "@type": "BusinessAudience",
        "audienceType": "B2B, Gerencias de Recursos Humanos, C-Level"
    },
    "offers": [
        {
            "@type": "Offer",
            "name": "Visita Sastre a Domicilio",
            "price": "9990",
            "priceCurrency": "CLP",
            "description": "Incluye visita técnica a la oficina corporativa y entrega de prendas terminadas."
        },
        {
            "@type": "Offer",
            "name": "Ajuste de Flota Corporativa (Uniformes)",
            "description": "Convenios B2B para entalle de uniformes institucionales y trajes de alta gama."
        }
    ]
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
