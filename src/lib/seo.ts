export const ElenaAtelierSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": ["LocalBusiness", "SewingStore"],
            "@id": "https://elenalacosturera.cl/#organization",
            "name": "ELENA La Costurera - Atelier de Alta Costura en Vitacura",
            "url": "https://elenalacosturera.cl",
            "image": "https://elenalacosturera.cl/hero_seamstress_taller.png",
            "telephone": "+56937667709",
            "priceRange": "$$$",
            "description": "Atelier exclusivo de Alta Costura, vestidos de novia, gala, graduación y arreglos de ropa fina. Ubicado en Av. Tabancura 1091, Oficina 319, Vitacura, Santiago de Chile. Atención presencial con estacionamiento y envíos a todo Chile.",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Tabancura 1091, Oficina 319",
                "addressLocality": "Vitacura",
                "addressRegion": "Santiago, Región Metropolitana",
                "postalCode": "7650020",
                "addressCountry": "CL"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": -33.3714288,
                "longitude": -70.5484838
            },
            "founder": {
                "@id": "https://elenalacosturera.cl/#founder"
            },
            "sameAs": [
                "https://instagram.com/elenaatelier.cl"
            ],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Vitacura" },
                { "@type": "AdministrativeArea", "name": "Las Condes" },
                { "@type": "AdministrativeArea", "name": "Lo Barnechea" },
                { "@type": "AdministrativeArea", "name": "La Dehesa" },
                { "@type": "AdministrativeArea", "name": "Providencia" },
                { "@type": "AdministrativeArea", "name": "Santiago" }
            ],
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de Sastrería & Alta Costura en Vitacura",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Arreglos de Ropa, Bastas & Sastrería Fina en Vitacura",
                            "description": "Prueba presencial en atelier o retiro a domicilio. Calce anatómico perfecto para vestidos, trajes de sastre y ropa ejecutiva en Vitacura, Las Condes y Lo Barnechea."
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Diseño de Vestidos de Novia & Upcycling Nupcial",
                            "description": "Vestidos de novia únicos hechos a medida y rediseño (upcycling) de trajes familiares de gala bajo experiencia de atelier privado en Tabancura 1091."
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Vestidos de Gala, Fiesta & Graduación Exclusivos",
                            "description": "Confección y ajuste de vestidos de gala y graduación 2026 con registro de exclusividad por colegio en Santiago."
                        }
                    }
                ]
            }
        },
        {
            "@type": "Person",
            "@id": "https://elenalacosturera.cl/#founder",
            "name": "Elena Rojas Bustamante",
            "jobTitle": "Maestra Costurera & Diseñadora de Alta Costura",
            "worksFor": {
                "@id": "https://elenalacosturera.cl/#organization"
            },
            "description": "Más de 30 años de experiencia en confección a medida en su atelier de Vitacura, colaboraciones internacionales en París con la firma SEVALI y proyectos de sastrería técnica en Chile.",
            "knowsAbout": ["Alta Costura", "Sastrería Masculina", "Upcycling Nupcial", "Modelaje Anatómico", "Confección a Medida", "Arreglos de Ropa Fina"]
        }
    ]
};
