import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/', '/admin/', '/portal/', '/api/'],
        },
        sitemap: 'https://elenalacosturera.cl/sitemap.xml',
    };
}
