import { NextResponse } from 'next/server';

export async function GET() {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
        return NextResponse.json({ success: false, error: 'MP_ACCESS_TOKEN no configurado' });
    }

    try {
        const terminalsResponse = await fetch('https://api.mercadopago.com/terminals/v1/list', {
            headers: { 'Authorization': `Bearer ${mpToken}` }
        });
        const data = await terminalsResponse.json();
        return NextResponse.json({ status: terminalsResponse.status, data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
