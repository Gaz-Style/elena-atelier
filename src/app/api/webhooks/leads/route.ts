import { NextResponse } from 'next/server';

// Este endpoint puede ser llamado por Supabase Webhooks (o Edge Functions)
// cada vez que un nuevo registro es insertado en la tabla `customers` o una tabla de leads.
export async function POST(request: Request) {
    try {
        const payload = await request.json();
        
        // El payload esperado típico de Supabase webhook
        // { type: 'INSERT', table: 'customers', record: { email: '...', full_name: '...' } }
        const lead = payload?.record || payload;

        if (!lead || !lead.email) {
            return NextResponse.json({ error: "No email provided in payload." }, { status: 400 });
        }

        console.log(`[SMART WELCOME FLOW] Procesando nuevo lead: ${lead.email}`);

        // Aquí simulamos el enriquecimiento de datos.
        // En producción se conectaría a APIs como Clearbit, LinkedIn API o similar
        // para buscar el background del cliente basado en su correo corporativo.
        let isCorporate = lead.email.includes('.com') && !lead.email.includes('gmail.com');
        let profileType = isCorporate ? "Corporativa/Ejecutiva" : "Estándar/Social";

        console.log(`[SMART WELCOME FLOW] Perfil detectado: ${profileType}`);

        // Aquí llamaríamos a la API de Resend (https://resend.com)
        // Ej: await resend.emails.send({...})
        const emailBodySimulated = isCorporate 
            ? `Estimada ${lead.full_name}, entendemos la exigencia de tu agenda profesional. En Elena Atelier confeccionamos sastrería ejecutiva que proyecta autoridad.`
            : `¡Hola ${lead.full_name}! Bienvenida a nuestro círculo privado. Te invitamos a descubrir el arte de la alta costura.`;

        // Simulamos éxito
        return NextResponse.json({
            success: true,
            enriched_profile: profileType,
            email_sent: true,
            draft_content: emailBodySimulated
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
