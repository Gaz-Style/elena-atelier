import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const token = process.env.WHATSAPP_API_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            return NextResponse.json({ error: 'Faltan credenciales' }, { status: 500 });
        }

        // 1. Get WABA ID
        const phoneRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}?fields=whatsapp_business_account&access_token=${token}`);
        const phoneData = await phoneRes.json();
        const wabaId = phoneData.whatsapp_business_account?.id;

        if (!wabaId) {
            return NextResponse.json({ error: 'No se pudo obtener WABA ID', phoneData }, { status: 500 });
        }

        // 2. Fetch all templates for this WABA
        const tplRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=50&access_token=${token}`);
        const tplData = await tplRes.json();

        const templates = tplData.data?.map((t: any) => ({
            name: t.name,
            status: t.status,
            language: t.language,
            category: t.category
        })) || [];

        return NextResponse.json({
            wabaId,
            total: templates.length,
            templates,
            rawError: tplData.error
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
