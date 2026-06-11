import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function testLiveChat() {
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    console.log('PHONE_NUMBER_ID:', PHONE_NUMBER_ID ? '✅ OK' : '❌ MISSING');
    console.log('WHATSAPP_API_TOKEN:', WHATSAPP_API_TOKEN ? '✅ OK' : '❌ MISSING');

    if (!WHATSAPP_API_TOKEN || !PHONE_NUMBER_ID) {
        console.error('Faltan variables de entorno');
        return;
    }

    // Test 1: Get chats from Supabase
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: chats, error: chatsError } = await adminClient
        .from('crm_whatsapp_chats')
        .select('id, phone_number, session_status')
        .limit(3);

    console.log('\n=== Chats en BD ===');
    console.log('Error:', chatsError?.message || 'ninguno');
    console.log('Chats:', JSON.stringify(chats, null, 2));

    if (!chats || chats.length === 0) {
        console.log('No hay chats para probar');
        return;
    }

    // Test 2: Send a test message to first chat number
    const targetPhone = chats[0].phone_number;
    console.log(`\n=== Enviando mensaje de prueba a ${targetPhone} ===`);

    const res = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: targetPhone,
            type: 'text',
            text: { body: '✅ Mensaje de prueba desde Live Chat (diagnóstico)' }
        })
    });

    const data = await res.json();
    console.log('Respuesta Meta:', JSON.stringify(data, null, 2));
}

testLiveChat().catch(console.error);
