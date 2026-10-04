import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cursos de Costura y Diseño | Elena La Costurera',
    description: 'Aprende costura, moldería y diseño de moda con nuestros cursos especializados. Talleres presenciales en Santiago.',
    openGraph: {
        title: 'Cursos de Costura y Diseño | Elena La Costurera',
        description: 'Aprende costura, moldería y diseño de moda en nuestros talleres.',
    }
};

export default function CursosLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
