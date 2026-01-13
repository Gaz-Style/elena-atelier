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
                    "name": "Restauración de vestidos de gala en Vitacura",
                    "description": "Servicio experto de restauración y cirugía textil para vestidos de fiesta y prendas de alta gama en Santiago."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Alta Costura y Diseños a Medida Santiago",
                    "description": "Confección exclusiva de vestidos de gala y sastrería femenina con trazabilidad digital."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Manufactura Ética Small Batch Chile",
                    "description": "Producción local de lotes pequeños para marcas de lujo y boutiques con enfoque en sostenibilidad."
                }
            }
        ]
    }
};
