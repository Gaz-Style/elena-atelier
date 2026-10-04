import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Registro VIP & Círculo Atelier | Elena La Costurera',
    description: 'Únete a nuestra comunidad exclusiva. Digitaliza tus medidas y obtén acceso prioritario a nuestro servicio de alta costura y sastrería.',
    openGraph: {
        title: 'Registro VIP & Círculo Atelier | Elena La Costurera',
        description: 'Únete a nuestra comunidad exclusiva para acceso prioritario.',
    }
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
