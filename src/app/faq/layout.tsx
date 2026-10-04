import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes | Elena La Costurera',
    description: 'Resuelve tus dudas sobre reservas, tiempos de confección, precios y modalidades de trabajo en Elena La Costurera.',
    openGraph: {
        title: 'Preguntas Frecuentes | Elena La Costurera',
        description: 'Resuelve tus dudas sobre reservas, tiempos de confección y modalidades de trabajo.',
    }
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
