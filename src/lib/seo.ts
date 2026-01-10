export const ElenaAtelierSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Elena Atelier",
    "image": "https://elenaatelier.cl/images/facade.jpg",
    "@id": "https://elenaatelier.cl",
    "url": "https://elenaatelier.cl",
    "telephone": "+56912345678",
    "priceRange": "$$$",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Av. Tabancura 1091",
        "addressLocality": "Vitacura",
        "addressRegion": "Santiago",
        "postalCode": "7630000",
        "addressCountry": "CL"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": -33.3768,
        "longitude": -70.5284
    },
    "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
        ],
        "opens": "10:00",
        "closes": "19:00"
    },
    "sameAs": [
        "https://instagram.com/elenaatelier.cl"
    ],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios de Alta Costura",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Restauración de prendas de lujo Santiago",
                    "description": "Servicio experto de restauración y upcycling de prendas de alta gama en Vitacura."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Sastrería tecnológica en Vitacura",
                    "description": "Confección a medida combinando técnicas tradicionales con patronaje digital y pasaporte de trazabilidad."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Producción Small Batch Chile",
                    "description": "Manufactura ética de lotes pequeños para boutiques de lujo y marcas locales."
                }
            }
        ]
    }
};
