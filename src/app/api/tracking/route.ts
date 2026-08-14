import { NextResponse } from 'next/server';
import { sendServerEvent } from '@/lib/serverTracking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, userData = {}, customData = {} } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
    }

    // Extract Client IP and User Agent from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Enrich user data with request metadata
    const enrichedUserData = {
      ...userData,
      ip,
      userAgent,
      url: request.headers.get('referer') || userData.url,
    };

    // Dispatch the server tracking calls asynchronously
    await sendServerEvent(eventName, enrichedUserData, customData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tracking API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
