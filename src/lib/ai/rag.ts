import { supabase } from '../supabase';

export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("No GEMINI_API_KEY set for embeddings.");
            return null;
        }

        const payload = {
            model: "models/text-embedding-004",
            content: { parts: [{ text: text }] }
        };

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error("Error from Gemini Embedding:", await res.text());
            return null;
        }

        const data = await res.json();
        return data.embedding?.values || null;

    } catch (e) {
        console.error("Failed to generate embedding:", e);
        return null;
    }
}

export async function retrieveContext(query: string, phone: string): Promise<string> {
    const queryVector = await generateEmbedding(query);
    if (!queryVector) return "";

    try {
        const { data: matches, error } = await supabase.rpc('match_knowledge', {
            query_embedding: queryVector,
            match_threshold: 0.6,
            match_count: 4,
            filter_category: null,
            filter_phone: null
        });

        if (error) {
            console.error("Error retrieving context from Supabase:", error);
            return "";
        }

        if (!matches || matches.length === 0) return "";

        let contextText = "\n[MEMORIA DEL RAG - CONTEXTO RECUPERADO DE CONVERSACIONES/REGLAS]:\n";
        matches.forEach((m: any) => {
            contextText += `- [${m.category.toUpperCase()}]: ${m.content}\n`;
        });

        return contextText;

    } catch (e) {
        console.error("Error during retrieval:", e);
        return "";
    }
}

export async function saveClientMemory(phone: string, memoryText: string) {
    const embedding = await generateEmbedding(memoryText);
    if (!embedding) return;

    await supabase.from('bot_knowledge_base').insert([{
        category: 'memoria_cliente',
        content: `Cliente [${phone}]: ${memoryText}`,
        embedding: embedding,
        metadata: { phone: phone }
    }]);
}
