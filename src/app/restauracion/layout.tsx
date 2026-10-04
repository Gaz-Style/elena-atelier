import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Restauración de Prendas y Reparaciones Fina | Elena La Costurera',
    description: 'Especialistas en restauración de prendas delicadas, vestidos de fiesta y ropa de lujo. Recupera la vida de tus piezas favoritas con terminaciones invisibles.',
    openGraph: {
        title: 'Restauración de Prendas y Reparaciones Fina | Elena La Costurera',
        description: 'Especialistas en restauración de prendas delicadas, vestidos de fiesta y ropa de lujo.',
    }
};

export default function RestauracionLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
