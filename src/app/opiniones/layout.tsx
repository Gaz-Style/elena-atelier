import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Opiniones y Experiencias de Clientas | Elena La Costurera',
    description: 'Conoce lo que dicen nuestras clientas sobre el servicio de alta costura, arreglos de ropa y sastrería a medida en nuestro atelier de Vitacura.',
    openGraph: {
        title: 'Opiniones y Experiencias de Clientas | Elena La Costurera',
        description: 'Testimonios reales sobre nuestro servicio de alta costura y sastrería.',
    }
};

export default function OpinionesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
