import { createClient } from '@supabase/supabase-js';

// Modelos soportados para el enrutamiento asimétrico
export const DEEPSEEK_MODELS = {
    FLASH: 'deepseek-chat', // Representa V4 Flash / V3 para respuestas ultra rápidas
    REASONER: 'deepseek-reasoner', // Representa R1 para razonamiento complejo
};

export interface DeepSeekMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    reasoning_content?: string;
    tool_calls?: any[];
    tool_call_id?: string;
}

/**
 * Filtra y remueve bloques de razonamiento <think>...</think> si existen en el texto
 */
export function sanitizeDeepSeekResponse(content: string): string {
    if (!content) return '';
    // Erradicar cualquier contenido encerrado entre <think> y </think>
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Limpiar posibles etiquetas sueltas por truncación
    cleaned = cleaned.replace(/<\/?think>/gi, '').trim();
    return cleaned;
}

/**
 * Cliente de Inferencia DeepSeek para Elena Atelier
 */
export async function generateDeepSeekCompletion({
    messages,
    model = DEEPSEEK_MODELS.FLASH,
    tools = [],
    temperature = 0.3,
}: {
    messages: DeepSeekMessage[];
    model?: string;
    tools?: any[];
    temperature?: number;
}) {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY; // Fallback para compatibilidad
    const baseUrl = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';

    if (!apiKey) {
        console.warn('DEEPSEEK_API_KEY no configurada. Retornando respuesta de fallback.');
        return {
            content: '¡Hola! Gracias por contactar a Elena Atelier. En este momento nuestro sistema de atención inteligente se encuentra en mantenimiento, pero te derivaremos con un asesor humano en breve. ✨',
            reasoningContent: null,
            toolCalls: null,
        };
    }

    try {
        const payload: any = {
            model,
            messages,
            temperature,
            stream: false,
        };

        if (tools && tools.length > 0) {
            payload.tools = tools;
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`DeepSeek API Error HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const message = choice?.message;

        // Separar reasoning_content (DeepSeek R1 / V3 con modo reflexivo) del contenido público
        const reasoningContent = message?.reasoning_content || null;
        let content = message?.content || '';

        // Aplicar filtro de desinfección de trazas de pensamiento
        content = sanitizeDeepSeekResponse(content);

        return {
            content,
            reasoningContent,
            toolCalls: message?.tool_calls || null,
            usage: data.usage || null,
        };
    } catch (error) {
        console.error('Error al llamar a DeepSeek API:', error);
        throw error;
    }
}
