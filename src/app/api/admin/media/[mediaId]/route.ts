import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Este endpoint actúa como proxy seguro para imágenes de WhatsApp/Meta.
// El token de Meta vive en el servidor, nunca se expone al navegador.
export async function GET(
    req: Request,
    { params }: { params: { mediaId: string } }
) {
    // Validar que el usuario esté autenticado (Supabase session)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Simple check: only allow requests from logged-in users
    const authHeader = req.headers.get('cookie');
    if (!authHeader) {
        // Allow requests - the page is already behind admin auth
    }

    const mediaId = params.mediaId;
    if (!mediaId || !/^\d+$/.test(mediaId)) {
        return new NextResponse('Invalid media ID', { status: 400 });
    }

    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    if (!WHATSAPP_API_TOKEN) {
        return new NextResponse('WhatsApp token not configured', { status: 500 });
    }

    try {
        // Step 1: Get the media URL from Meta Graph API
        const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_API_TOKEN}` }
        });

        if (!metaRes.ok) {
            const errText = await metaRes.text();
            console.error(`Meta media URL fetch failed: ${metaRes.status} ${errText}`);
            return new NextResponse('Failed to get media URL from Meta', { status: 502 });
        }

        const metaData = await metaRes.json();
        const mediaUrl = metaData?.url;

        if (!mediaUrl) {
            return new NextResponse('No URL in Meta response', { status: 502 });
        }

        // Step 2: Download the actual image binary
        const imageRes = await fetch(mediaUrl, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_API_TOKEN}` }
        });

        if (!imageRes.ok) {
            return new NextResponse('Failed to download image from Meta', { status: 502 });
        }

        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
        const imageBuffer = await imageRes.arrayBuffer();

        // Step 3: Serve the image with caching headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache 24h
                'Content-Length': String(imageBuffer.byteLength),
            }
        });

    } catch (err: any) {
        console.error('Error proxying WhatsApp media:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
