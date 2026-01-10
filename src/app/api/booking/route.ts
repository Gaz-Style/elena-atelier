import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Simulation: HubSpot Contact Creation
        console.log('--- Agentic Trigger: HubSpot Integration ---');
        console.log(`Creating contact: ${body.name} (${body.email})`);

        // 2. Simulation: n8n Webhook for WhatsApp
        console.log('--- Agentic Trigger: WhatsApp Notification via n8n ---');
        console.log(`Queueing message to: ${body.phone}`);
        console.log('Payload:', {
            template: 'booking_received',
            vars: [body.name, body.serviceType, 'Av. Tabancura 1091']
        });

        return NextResponse.json({ success: true, message: 'Booking processed by agents' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to process booking' }, { status: 500 });
    }
}
