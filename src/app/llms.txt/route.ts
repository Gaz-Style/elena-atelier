import { NextResponse } from 'next/server';

export async function GET() {
  const content = `# Elena Atelier - Alta Costura y Sastrería a Medida

> Elena Atelier es una casa de alta costura, modistería fina, vestidos de novia, gala y sastrería a medida ubicada en Vitacura, Santiago de Chile.

## Servicios Principales

- Vestidos de Novia y Alta Costura: Diseños exclusivos y confección personalizada.
- Arreglos y Modificaciones de Alta Precisión: Ajustes perfectos para vestuario de gala y diario.
- Sastrería Masculina y Femenina: Trajes a medida con terminaciones artesanales.
- Vestidos de Graduación y Fiesta: Confección y asesoría de imagen.
- Cursos y Talleres de Confección: Clases de costura, patronaje y diseño.

## Ubicación y Contacto

- Dirección: Tabancura 1091, Oficina 319, Vitacura, Santiago, Chile.
- Teléfono / WhatsApp: +56 9 3766 7709
- Sitio Web: https://elenalacosturera.cl
- Horario: Lunes a Viernes: 10:00 - 21:00 hrs | Sábados: 10:00 - 14:00 hrs

## Secciones Principales del Sitio

- /novias: Catálogo y agenda para novias.
- /costuras: Servicios de arreglos y costura fina.
- /sastreria: Sastrería ejecutiva y a medida.
- /graduacion: Vestidos de graduación por comuna.
- /cursos: Cursos y formación en costura y confección.
- /agenda: Reserva de horas de atención presencial en taller.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
