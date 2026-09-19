export const ElenaAtelierSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": ["LocalBusiness", "SewingStore"],
            "@id": "https://elenalacosturera.cl/#organization",
            "name": "ELENA La Costurera - Alta Costura & Sastrería",
            "url": "https://elenalacosturera.cl",
            "image": "https://elenalacosturera.cl/hero_seamstress_taller.png",
            "telephone": "+56937667709",
            "priceRange": "$$$",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Tabancura 1091, Oficina 319",
                "addressLocality": "Vitacura",
                "addressRegion": "Región Metropolitana",
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
                { "@type": "AdministrativeArea", "name": "Providencia" }
            ],
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de Sastrería & Alta Costura",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Arreglos de Ropa & Sastrería a Domicilio",
                            "description": "Retiro, prueba y entrega de prendas con calce anatómico perfecto en Vitacura, Las Condes y Lo Barnechea."
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Diseño de Vestidos de Novia & Upcycling Nupcial",
                            "description": "Vestidos de novia a medida y transformación de prendas de gala bajo experiencia de atelier privado."
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Sastrería Ejecutiva B2B & Convenios Corporativos",
                            "description": "Servicio exclusivo de ajuste y sastrería in-situ en oficinas corporativas para el personal ejecutivo de empresas en Vitacura, Las Condes y Santiago."
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
            "description": "Más de 30 años de experiencia en confección a medida, colaboraciones internacionales en París con la firma SEVALI y proyectos de sastrería técnica en Chile.",
            "knowsAbout": ["Alta Costura", "Sastrería Masculina", "Upcycling Nupcial", "Modelaje Anatómico", "Confección a Medida"]
        }
    ]
};
