import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Agendar Cita en Taller | Elena La Costurera',
    description: 'Reserva tu visita presencial en nuestro Atelier de Vitacura. Evaluamos tu prenda para arreglos, upcycling o diseño de alta costura a medida.',
    openGraph: {
        title: 'Agendar Cita en Taller | Elena La Costurera',
        description: 'Reserva tu visita presencial en nuestro Atelier de Vitacura.',
    }
};

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
