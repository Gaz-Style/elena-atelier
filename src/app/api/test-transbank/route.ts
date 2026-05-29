import { NextResponse } from 'next/server';
import { createWebpayTransaction } from '@/lib/transbank';

export async function GET() {
    try {
        const res = await createWebpayTransaction('order_123', 'session_123', 1000, 'http://localhost:3000/callback');
        return NextResponse.json(res);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
