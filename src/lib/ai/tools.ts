import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';

export const SYSTEM_PROMPT_ELENA_ATELIER = `
Eres la Asistente Virtual Inteligente de "Elena Atelier", un taller exclusivo de alta costura, vestidos de fiesta, novias y arreglos de prendas de vestir.

REGLAS DE IDENTIDAD Y CUMPLIMIENTO REGULATORIO:
1. Transparencia Activa: Eres una Asistente Virtual IA. Nunca finjas ser un ser humano biológico. Sé siempre educada, elegante, cordial y empática.
2. Formato de Respuesta: Tus respuestas deben ser breves, estructuradas y listas para enviarse por WhatsApp. Evita grandes bloques de texto denso.
3. Principio de Minimización de Datos: Pide únicamente los datos necesarios para agendar o resolver la duda del cliente (Nombre, Correo, Fecha deseada). ¡NUNCA pidas el número de teléfono, el sistema lo captura solo!
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
                    correo: {
                        type: 'string',
                        description: 'Correo electrónico del cliente.',
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
                required: ['nombre', 'fecha', 'hora', 'tipo_servicio'],
                additionalProperties: false,
            },
            strict: true,
        },
    },
    {
        type: 'function',
        function: {
            name: 'solicitar_asistencia_humana',
            description: 'Utilizar esta herramienta INMEDIATAMENTE si el cliente tiene un reclamo, problema, pide hablar con un humano/Elena, solicita servicios complejos como alta costura/novias, o hace preguntas que no puedes responder.',
            parameters: {
                type: 'object',
                properties: {
                    motivo: {
                        type: 'string',
                        description: 'Breve resumen de por qué se requiere intervención humana (ej: Reclamo por cierre malo, Cliente pide hablar con Elena).',
                    },
                    urgencia: {
                        type: 'string',
                        enum: ['normal', 'alta'],
                        description: 'Nivel de urgencia. Alta para reclamos o molestias. Normal para dudas o servicios complejos.',
                    },
                },
                required: ['motivo', 'urgencia'],
                additionalProperties: false,
            },
            strict: true,
        },
    },
];

/**
 * Ejecutor de herramientas locales según la solicitud del LLM
 */
export async function executeAtelierTool(name: string, args: any, extraData?: any) {
    console.log(`Ejecutando herramienta ${name} con argumentos:`, args);
    try {
        if (name === 'solicitar_asistencia_humana') {
            return JSON.stringify({ status: 'handoff_triggered', action: 'Transfiere el chat cordialmente indicando que un asesor tomará el caso.' });
        }
        if (name === 'consultar_disponibilidad') {
            const resultado = await consultar_disponibilidad(args.fecha);
            return JSON.stringify({ status: 'success', disponibilidad: resultado });
        }
        if (name === 'agendar_visita') {
            const nombreParts = (args.nombre || '').split(' ');
            const nombre = nombreParts[0] || '';
            const apellido = nombreParts.slice(1).join(' ') || '';
            const celular = extraData?.celular || '';
            const correo = args.correo || '';
            const fecha_hora = `${args.fecha}T${args.hora}:00`;
            const resultado = await agendar_visita(nombre, apellido, celular, correo, fecha_hora, 'whatsapp');
            return JSON.stringify({ status: 'success', reserva: resultado });
        }
        return JSON.stringify({ error: `Herramienta ${name} no encontrada` });
    } catch (err: any) {
        console.error(`Error al ejecutar herramienta ${name}:`, err);
        return JSON.stringify({ error: err.message || 'Error al ejecutar la acción' });
    }
}
