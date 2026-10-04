import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nuestros Servicios de Confección y Sastrería | Elena La Costurera',
    description: 'Descubre todos nuestros servicios: Diseño de novias, vestidos de fiesta, sastrería femenina, upcycling y más.',
    openGraph: {
        title: 'Nuestros Servicios | Elena La Costurera',
        description: 'Diseño de novias, vestidos de fiesta, sastrería femenina, y upcycling.',
    }
};

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
