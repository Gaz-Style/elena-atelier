import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Propuesta Comercial y Presupuesto | Elena La Costurera',
    description: 'Revisa y confirma tu propuesta comercial de alta costura, upcycling o arreglos de ropa.',
    openGraph: {
        title: 'Propuesta Comercial y Presupuesto | Elena La Costurera',
        description: 'Revisa y confirma tu propuesta comercial.',
    }
};

export default function PresupuestoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
