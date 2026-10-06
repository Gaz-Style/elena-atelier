require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepDive() {
  // 1. Obtener las tareas de CLIENTES reales (no admin) y ver sus error_logs
  const adminPhones = ['56937667709', '56984021940'];
  
  const { data: allTasks } = await supabase
    .from('ai_agent_tasks')
    .select('id, status, error_log, created_at, payload, result, processed_at')
    .eq('agent_role', 'whatsapp_closer')
    .order('created_at', { ascending: false })
    .limit(100);

  const clientTasks = allTasks.filter(t => {
    const phone = t.payload?.phone_number;
    return phone && !adminPhones.includes(phone);
  });

  const adminTasks = allTasks.filter(t => {
    const phone = t.payload?.phone_number;
    return phone && adminPhones.includes(phone);
  });

  const noPhoneTasks = allTasks.filter(t => !t.payload?.phone_number);

  console.log('=== RESUMEN DE TAREAS ===');
  console.log(`Total tareas: ${allTasks.length}`);
  console.log(`Tareas de ADMIN: ${adminTasks.length}`);
  console.log(`Tareas de CLIENTES: ${clientTasks.length}`);
  console.log(`Tareas SIN teléfono: ${noPhoneTasks.length}`);

  console.log('\n=== TAREAS DE CLIENTES REALES (detalle) ===');
  for (const t of clientTasks) {
    const phone = t.payload?.phone_number;
    const content = (t.payload?.content || '').slice(0, 50);
    const reply = (t.result?.message || 'SIN RESPUESTA').slice(0, 60);
    const err = (t.error_log || '').slice(0, 80);
    console.log(`${t.status.padEnd(12)} | ${t.created_at.slice(5,19)} | ${phone} | "${content}"`);
    console.log(`  => reply: "${reply}"`);
    console.log(`  => error_log: "${err}"`);
    console.log(`  => processed_at: ${t.processed_at || 'NUNCA'}`);
    console.log('');
  }

  console.log('\n=== TAREAS SIN TELÉFONO (detalle) ===');
  for (const t of noPhoneTasks.slice(0, 5)) {
    console.log(`${t.status.padEnd(12)} | ${t.created_at.slice(5,19)} | payload: ${JSON.stringify(t.payload).slice(0, 120)}`);
    console.log(`  => error_log: "${t.error_log}"`);
    console.log('');
  }

  // 2. Verificar si hay mensajes de clientes en la DB sin tarea correspondiente
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: clientChats } = await supabase
    .from('crm_whatsapp_chats')
    .select('id, phone_number, session_status')
    .not('phone_number', 'in', `(${adminPhones.join(',')})`)
    .gte('last_interaction', weekAgo);

  console.log('\n=== CHATS DE CLIENTES REALES (últimos 7 días) ===');
  for (const chat of (clientChats || [])) {
    // Contar mensajes del cliente
    const { count: custMsgCount } = await supabase
      .from('crm_whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chat.id)
      .eq('sender_type', 'customer');

    // Contar tareas asociadas a este chat
    const { data: chatTasks } = await supabase
      .from('ai_agent_tasks')
      .select('id, status')
      .filter('payload->>chat_id', 'eq', chat.id);

    const completed = (chatTasks || []).filter(t => t.status === 'completed').length;
    const failed = (chatTasks || []).filter(t => t.status === 'failed').length;
    const pending = (chatTasks || []).filter(t => t.status === 'pending' || t.status === 'processing').length;

    console.log(`${chat.phone_number} (${chat.session_status}) => ${custMsgCount} msgs, tareas: ${completed} ok / ${failed} fail / ${pending} stuck`);
  }
}
deepDive();
