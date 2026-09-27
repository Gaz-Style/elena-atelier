import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const qstashToken = process.env.QSTASH_TOKEN;
        const qstashUrl = process.env.QSTASH_URL || 'https://qstash.upstash.io';
        const baseUrl = qstashUrl.endsWith('/') ? qstashUrl.slice(0, -1) : qstashUrl;

        if (!qstashToken) {
            return NextResponse.json({ success: false, error: 'QSTASH_TOKEN is completely missing from Vercel env' });
        }

        const res = await fetch(`${baseUrl}/v2/publish/https://www.elenalacosturera.cl/api/orchestrator`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${qstashToken}`,
                'Content-Type': 'application/json',
                'Upstash-Forward-Authorization': `Bearer ${process.env.CRON_SECRET || 'antigravity-secret'}`
            },
            body: JSON.stringify({ ping: 'test-endpoint' })
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ success: false, error: `QStash returned ${res.status}: ${errorText}` });
        }

        return NextResponse.json({ success: true, message: 'QStash accepted the ping successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: `Fetch threw an exception: ${e.message}` });
    }
}
