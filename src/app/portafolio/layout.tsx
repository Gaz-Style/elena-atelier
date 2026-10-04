import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Portafolio de Diseños y Vestidos | Elena La Costurera',
    description: 'Explora nuestra galería de trabajos: Vestidos de novia, trajes de fiesta y sastrería a medida creados en nuestro taller.',
    openGraph: {
        title: 'Portafolio de Diseños | Elena La Costurera',
        description: 'Galería de vestidos de novia, trajes de fiesta y sastrería a medida.',
    }
};

export default function PortafolioLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
