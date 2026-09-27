import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';

export const SYSTEM_PROMPT_ELENA_ATELIER = `
Eres la Asistente Virtual Inteligente de "Elena Atelier", un taller exclusivo de alta costura, vestidos de fiesta, novias y arreglos de prendas de vestir.

REGLAS DE IDENTIDAD Y CUMPLIMIENTO REGULATORIO:
1. Transparencia Activa: Eres una Asistente Virtual IA. Nunca finjas ser un ser humano biológico. Sé siempre educada, elegante, cordial y empática.
2. Formato de Respuesta: Tus respuestas deben ser breves, estructuradas y listas para enviarse por WhatsApp. Evita grandes bloques de texto denso.
3. Principio de Minimización de Datos: Pide únicamente los datos necesarios para agendar o resolver la duda del cliente (Nombre, Teléfono, Fecha deseada y tipo de prenda/servicio).
4. No Inventes Información: Si el usuario consulta disponibilidad o desea agendar, DEBES usar la herramienta de llamado a función disponible.

SERVICIOS OFRECIDOS:
- Confección a medida (Novias, Fiesta, Gala).
- Arreglos y entalles de alta costura.
- Asesoría de imagen e intake de diseño.

UBICACIÓN Y HORARIOS:
- Atención exclusivamente con cita previa.
`;

/**
 * Esquema estricto de herramientas (Function Calling) para DeepSeek
 */
export const ATELIER_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'consultar_disponibilidad',
            description: 'Utilizar esta herramienta obligatoriamente cada vez que un cliente pregunte por disponibilidad de horas o agenda para citas en el taller.',
            parameters: {
                type: 'object',
                properties: {
                    fecha: {
                        type: 'string',
                        description: 'Fecha a consultar en formato YYYY-MM-DD.',
                    },
                },
                required: ['fecha'],
                additionalProperties: false,
            },
            strict: true,
        },
    },
    {
        type: 'function',
        function: {
            name: 'agendar_visita',
            description: 'Utilizar para agendar una cita o visita técnica en el taller cuando el cliente haya confirmado la fecha, hora y sus datos.',
            parameters: {
                type: 'object',
                properties: {
                    nombre: {
                        type: 'string',
                        description: 'Nombre completo del cliente.',
                    },
                    telefono: {
                        type: 'string',
                        description: 'Número de teléfono o WhatsApp del cliente.',
                    },
                    fecha: {
                        type: 'string',
                        description: 'Fecha seleccionada YYYY-MM-DD.',
                    },
                    hora: {
                        type: 'string',
                        description: 'Hora seleccionada HH:MM.',
                    },
                    tipo_servicio: {
                        type: 'string',
                        description: 'Motivo de la visita (novia, fiesta, arreglo, entalle, etc.).',
                    },
                },
                required: ['nombre', 'telefono', 'fecha', 'hora', 'tipo_servicio'],
                additionalProperties: false,
            },
            strict: true,
        },
    },
];

/**
 * Ejecutor de herramientas locales según la solicitud del LLM
 */
export async function executeAtelierTool(name: string, args: any) {
    console.log(`Ejecutando herramienta ${name} con argumentos:`, args);
    try {
        if (name === 'consultar_disponibilidad') {
            const resultado = await consultar_disponibilidad(args.fecha);
            return JSON.stringify({ status: 'success', disponibilidad: resultado });
        }
        if (name === 'agendar_visita') {
            const { nombre, apellido, celular, correo, fecha_hora } = args;
            const resultado = await agendar_visita(nombre, apellido, celular, correo, fecha_hora, 'whatsapp');
            return JSON.stringify({ status: 'success', reserva: resultado });
        }
        return JSON.stringify({ error: `Herramienta ${name} no encontrada` });
    } catch (err: any) {
        console.error(`Error al ejecutar herramienta ${name}:`, err);
        return JSON.stringify({ error: err.message || 'Error al ejecutar la acción' });
    }
}
