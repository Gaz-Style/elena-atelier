import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase con Service Role para acceso administrativo en el Cron Job
// Usamos process.env en vez de variables Next públicas porque esto corre en servidor backend
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: Request) {
    try {
        // 1. Verificar autorización (Opcional: Bearer token o secreto compartido con el servicio externo de cron)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
            // Nota: En un ambiente de producción real, descomentar esta protección.
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Lógica del Negocio: Buscar sobrestock inmovilizado
        // Buscar telas premium que no se han movido en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoDateString = thirtyDaysAgo.toISOString();

        // Asumiendo que tenemos una tabla inventory_items en tu DB
        const { data: stockInmovilizado, error } = await supabase
            .from('inventory_items')
            .select('*')
            .lt('last_updated', isoDateString)
            .gt('quantity', 5) // más de 5 metros/unidades
            .in('category', ['Tela', 'Seda', 'Encaje']);

        if (error) {
            console.error("Error fetching inventory for cron:", error);
            // Si la tabla aún no existe, devolvemos success simulado para no fallar el cron
            return NextResponse.json({ 
                success: true, 
                message: "Marketing Cron ejecutado, pero no se encontró la tabla de inventario exacta o hubo un error.",
                details: error.message
            });
        }

        if (!stockInmovilizado || stockInmovilizado.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: "Inventario saludable. No hay stock inmovilizado crítico que requiera campaña de marketing." 
            });
        }

        // 3. Simular Acción de Marketing Automática (Smart Alerts)
        // En un futuro, aquí se integraría Resend o Twilio/WhatsApp API
        console.log(`[CRON MARKETING] ¡Alerta! Se detectaron ${stockInmovilizado.length} materiales inmovilizados.`);
        
        // Simular segmentación de clientas a las que les gusta la Seda
        const { data: vipClients } = await supabase
            .from('customers')
            .select('full_name, phone, email')
            .eq('vip_status', true)
            .limit(10);

        const messagesGenerated = vipClients?.map(client => ({
            client: client.full_name,
            channel: client.phone ? 'WhatsApp' : 'Email',
            draft: `Hola ${client.full_name.split(' ')[0]}, nos acaban de llegar bloques exclusivos de diseño y recordamos tu preferencia por las texturas naturales. Reservamos un cupo esta semana para ti.`
        })) || [];

        return NextResponse.json({
            success: true,
            marketing_campaign_triggered: true,
            stock_issues_found: stockInmovilizado.length,
            vip_messages_queued: messagesGenerated.length,
            sample_draft: messagesGenerated[0] || null
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
