import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
        return NextResponse.json({ success: false, error: 'MP_ACCESS_TOKEN no configurado' });
    }

    const { searchParams } = new URL(req.url);
    const activate = searchParams.get('activate') === 'true';

    try {
        const terminalsResponse = await fetch('https://api.mercadopago.com/terminals/v1/list', {
            headers: { 'Authorization': `Bearer ${mpToken}` }
        });
        const data = await terminalsResponse.json();
        const terminals = data?.data?.terminals || [];

        if (activate && terminals.length > 0) {
            const setupPayload = {
                terminals: terminals.map((t: any) => ({
                    id: t.id,
                    operating_mode: 'PDV'
                }))
            };

            const patchRes = await fetch('https://api.mercadopago.com/terminals/v1/setup', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${mpToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(setupPayload)
            });

            const patchData = await patchRes.json();
            return NextResponse.json({
                status: patchRes.status,
                message: 'Modo PDV activado en las terminales',
                patchResult: patchData,
                terminals
            });
        }

        return NextResponse.json({ status: terminalsResponse.status, data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
