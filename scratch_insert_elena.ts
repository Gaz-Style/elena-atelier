import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const { agendar_visita } = await import('./src/lib/agenda');
    console.log('--- INSERTANDO AGENDAMIENTO REAL PARA ELENA ROJAS ---');
    const res = await agendar_visita(
        'Elena',
        'Rojas',
        '56972812907',
        'nenitadesign@gmail.com',
        '2026-10-02T18:00:00',
        'whatsapp'
    );
    console.log('Resultado:', res);
}

run();
