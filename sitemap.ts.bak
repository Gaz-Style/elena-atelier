import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://elenalacosturera.cl';
    const communes = ['vitacura', 'las-condes', 'lo-barnechea', 'providencia', 'la-reina', 'nunoa'];
    const costurasSectors = ['vitacura', 'las-condes', 'lo-barnechea', 'la-dehesa', 'los-trapenses', 'el-huinganal'];

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/agenda`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/novias`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/sastreria`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/servicios`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/costuras`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/restauracion`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/graduacion`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/opiniones`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/portafolio`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portafolio/novias/sofia-tres-vestidos-matrimonio-las-condes`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/vip`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/registro`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/cursos`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/presupuesto`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
    ];

    // Generar dinámicamente las páginas satélite para cada comuna/sector
    const dynamicRoutes: MetadataRoute.Sitemap = [];

    communes.forEach(commune => {
        // 1. Ruta de Graduación por Comuna
        dynamicRoutes.push({
            url: `${baseUrl}/graduacion/${commune}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        });

        // 2. Ruta de Novias por Comuna
        dynamicRoutes.push({
            url: `${baseUrl}/novias/${commune}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        });
    });

    costurasSectors.forEach(sector => {
        // 3. Ruta de Costuras por Sector Premium
        dynamicRoutes.push({
            url: `${baseUrl}/costuras/${sector}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9, // Máxima prioridad por la alta transaccionalidad local
        });
    });

    return [...staticRoutes, ...dynamicRoutes];
}
