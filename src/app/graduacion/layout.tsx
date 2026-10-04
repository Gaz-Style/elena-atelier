import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vestidos de Graduación a Medida | Elena La Costurera',
    description: 'Diseñamos y confeccionamos tu vestido de graduación soñado. Moldería única para que luzcas increíble en tu fiesta de gala.',
    openGraph: {
        title: 'Vestidos de Graduación a Medida | Elena La Costurera',
        description: 'Diseñamos y confeccionamos tu vestido de graduación soñado.',
    }
};

export default function GraduacionLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
