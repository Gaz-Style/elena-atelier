import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vestidos de Novia a Medida & Alta Costura | Elena La Costurera',
    description: 'Diseño exclusivo de vestidos de novia, upcycling nupcial y confección a medida en Vitacura, Santiago. Agenda tu experiencia íntima de diseño.',
    openGraph: {
        title: 'Vestidos de Novia a Medida & Alta Costura | Elena La Costurera',
        description: 'Diseño exclusivo de vestidos de novia, upcycling nupcial y confección a medida en Vitacura.',
    }
};

export default function NoviasLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
