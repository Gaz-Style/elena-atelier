import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sastrería Femenina & Confección a Medida | Elena La Costurera',
    description: 'Servicio exclusivo de sastrería y confección a medida para mujer. Trajes, vestidos y piezas únicas diseñadas sobre tu anatomía en Santiago.',
    openGraph: {
        title: 'Sastrería Femenina & Confección a Medida | Elena La Costurera',
        description: 'Servicio exclusivo de sastrería y confección a medida para mujer.',
    }
};

export default function SastreriaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
