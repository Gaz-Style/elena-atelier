const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Faltan credenciales de Supabase en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Todos los arreglos extraídos exhaustivamente de las 7 categorías principales y sus subcategorías
const todosLosArreglos = [
    // 1. CHAQUETAS, BLAZERS & SACOS DE TRAJE
    { name: "Acortar mangas desde el puño — chaqueta sport / sin forro", category: "Chaquetas & Blazers", price: 12000, time: 45, desc: "Chaqueta sport sin forro" },
    { name: "Acortar mangas desde el puño — blazer con forro", category: "Chaquetas & Blazers", price: 15000, time: 60, desc: "Incluye ajuste de forro interno de manga" },
    { name: "Acortar mangas desde el puño — saco de traje con forro completo", category: "Chaquetas & Blazers", price: 18000, time: 75, desc: "Saco de traje con forro completo" },
    { name: "Acortar mangas desde el tajalí (hombro) — ojales funcionales", category: "Chaquetas & Blazers", price: 28000, time: 150, desc: "Desmonte completo de manga desde la sisa, recorte en cabeza de manga y reconstrucción." },
    { name: "Acortar mangas desde el tajalí — saco con estructura sastre", category: "Chaquetas & Blazers", price: 35000, time: 180, desc: "Alta sastrería" },
    { name: "Alargar mangas (si hay reserva) — sin forro", category: "Chaquetas & Blazers", price: 12000, time: 45, desc: "Soltado de reserva sin forro" },
    { name: "Alargar mangas (si hay reserva) — con forro", category: "Chaquetas & Blazers", price: 16000, time: 60, desc: "Soltado de reserva con ajuste de forro" },
    { name: "Adelgazar manga (tapering) — sin forro", category: "Chaquetas & Blazers", price: 12000, time: 45, desc: "Ajuste de ancho de manga sin forro" },
    { name: "Adelgazar manga (tapering) — con forro", category: "Chaquetas & Blazers", price: 16000, time: 60, desc: "Ajuste de ancho de manga con forro" },
    { name: "Ensanchar manga (si hay reserva)", category: "Chaquetas & Blazers", price: 14000, time: 50, desc: "Ampliación de manga con reserva de tela" },
    { name: "Reducir ancho de hombros — chaqueta sport", category: "Chaquetas & Blazers", price: 25000, time: 120, desc: "Reducción de hombros en chaqueta sport" },
    { name: "Reducir ancho de hombros — estructura sastre", category: "Chaquetas & Blazers", price: 35000, time: 180, desc: "Reducción integral de hombros en saco estructurado" },
    { name: "Ajuste / cambio / eliminar hombreras", category: "Chaquetas & Blazers", price: 8000, time: 30, desc: "Modificación o reposición de hombreras" },
    { name: "Entalle lateral (costados) — chaqueta sport", category: "Chaquetas & Blazers", price: 15000, time: 50, desc: "Ajuste de torso sin forro" },
    { name: "Entalle lateral (costados) — blazer con forro", category: "Chaquetas & Blazers", price: 20000, time: 75, desc: "Ajuste de torso con forro" },
    { name: "Entalle lateral (costados) — saco de traje con estructura", category: "Chaquetas & Blazers", price: 25000, time: 90, desc: "Entalle sastre completo" },
    { name: "Entalle de espalda (pinzas)", category: "Chaquetas & Blazers", price: 15000, time: 45, desc: "Ajuste de espalda mediante pinzas" },
    { name: "Ajuste de sisa (ampliar/reducir)", category: "Chaquetas & Blazers", price: 18000, time: 60, desc: "Modificación de apertura de armadura/sisa" },
    { name: "Reducir pecho / delantero", category: "Chaquetas & Blazers", price: 18000, time: 60, desc: "Ajuste en zona del tórax" },
    { name: "Acortar largo — chaqueta sin forro", category: "Chaquetas & Blazers", price: 15000, time: 60, desc: "Subida de basta en chaqueta sin forro" },
    { name: "Acortar largo — blazer con forro", category: "Chaquetas & Blazers", price: 20000, time: 75, desc: "Subida de basta en blazer con forro" },
    { name: "Acortar largo — saco de traje con estructura", category: "Chaquetas & Blazers", price: 25000, time: 90, desc: "Subida de basta en saco de traje" },
    { name: "Cambio de forro completo", category: "Chaquetas & Blazers", price: 45000, time: 240, desc: "Confección y cambio total de forro interno" },
    { name: "Reparación de forro / costura", category: "Chaquetas & Blazers", price: 6000, time: 25, desc: "Zurcido o zurcido de forro roto" },
    { name: "Corrección de cuello (collar roll)", category: "Chaquetas & Blazers", price: 15000, time: 60, desc: "Eliminación del pliegue tras la nuca" },
    { name: "Ajustar/cerrar ventana (vent)", category: "Chaquetas & Blazers", price: 10000, time: 40, desc: "Modificación de aperturas traseras" },
    { name: "Cambio de botones (juego completo)", category: "Chaquetas & Blazers", price: 5000, time: 20, desc: "Pegado de botones y ajuste de ojales" },

    // 2. PANTALONES DE VESTIR & CASUALES
    { name: "Basta simple a máquina", category: "Pantalones", price: 6000, time: 20, desc: "Ruedo recto a máquina" },
    { name: "Basta invisible a mano (blind hem)", category: "Pantalones", price: 8000, time: 30, desc: "Puntada oculta para pantalón vestir" },
    { name: "Basta con conservación de ruedo original", category: "Pantalones", price: 10000, time: 40, desc: "Manteniendo el acabado de fábrica" },
    { name: "Agregar/quitar valenciana (cuff)", category: "Pantalones", price: 6000, time: 30, desc: "Confección de doblez valenciana" },
    { name: "Achicar cintura (hasta 4 cm)", category: "Pantalones", price: 12000, time: 45, desc: "Ajuste de pretina posterior" },
    { name: "Achicar cintura (5 a 8 cm)", category: "Pantalones", price: 18000, time: 75, desc: "Ajuste medio de pretina y tiro" },
    { name: "Achicar cintura (más de 8 cm)", category: "Pantalones", price: 25000, time: 100, desc: "Reconstrucción integral de pretina y lados" },
    { name: "Ensanchar cintura (si hay reserva)", category: "Pantalones", price: 12000, time: 45, desc: "Soltado de reserva de tela posterior" },
    { name: "Entalle de piernas (tapering)", category: "Pantalones", price: 12000, time: 45, desc: "Angostado muslo a bota" },
    { name: "Ajuste de tiro (subir/bajar cintura)", category: "Pantalones", price: 15000, time: 60, desc: "Recorte y reubicación de tiro" },
    { name: "Ajuste de asiento (trasero)", category: "Pantalones", price: 12000, time: 40, desc: "Eliminar la bolsa de tela trasera" },
    { name: "Reparación/refuerzo de entrepierna", category: "Pantalones", price: 8000, time: 30, desc: "Parche/tramado interno" },
    { name: "Cambio de cierre", category: "Pantalones", price: 8000, time: 30, desc: "Cierre sintético o metálico" },
    { name: "Cambio de forro de bolsillo", category: "Pantalones", price: 6000, time: 25, desc: "Sustitución de tela de bolsillo rota" },
    { name: "Ajuste/reemplazo de pinzas", category: "Pantalones", price: 8000, time: 30, desc: "Crear o eliminar pinzas delanteras" },

    // 3. JEANS & DENIM
    { name: "Basta con conservación de ruedo original (Jean)", category: "Jeans & Denim", price: 10000, time: 40, desc: "Manteniendo el desgaste de fábrica" },
    { name: "Basta simple (hilo denim)", category: "Jeans & Denim", price: 7000, time: 25, desc: "Hilo grueso reforzado" },
    { name: "Achique de cintura en pretina (Jean)", category: "Jeans & Denim", price: 12000, time: 45, desc: "Corte y ajuste en V trasera" },
    { name: "Achique de cintura (reconstrucción Jean)", category: "Jeans & Denim", price: 18000, time: 75, desc: "Desmonte completo de pretina denim" },
    { name: "Entalle de piernas (skinny/slim Jean)", category: "Jeans & Denim", price: 12000, time: 45, desc: "Ajuste por costura interna y externa" },
    { name: "Reparación de entrepierna (refuerzo invisible Jean)", category: "Jeans & Denim", price: 10000, time: 40, desc: "Zurcido cruzado en zona gastada" },
    { name: "Parche (funcional o invisible/zurcido)", category: "Jeans & Denim", price: 8000, time: 30, desc: "Reparación de roturas" },
    { name: "Cambio de cierre denim (metálico)", category: "Jeans & Denim", price: 10000, time: 35, desc: "Cierre de bronce o níquel reforzado" },

    // 4. VESTIDOS (DIARIO, FIESTA Y NOVIA)
    { name: "Basta simple / invisible (Vestido)", category: "Vestidos & Gala", price: 8000, time: 30, desc: "Una sola capa de tela" },
    { name: "Basta con forro (dos capas)", category: "Vestidos & Gala", price: 12000, time: 45, desc: "Tela exterior y forro" },
    { name: "Basta múltiples capas (tul, forro, tela)", category: "Vestidos & Gala", price: 18000, time: 75, desc: "Vestidos con amplio vuelo o capas" },
    { name: "Basta con aplicaciones / encaje", category: "Vestidos & Gala", price: 25000, time: 120, desc: "Desmonte y pegado manual de puntilla/encaje" },
    { name: "Ajuste de costados (cintura Vestido)", category: "Vestidos & Gala", price: 12000, time: 45, desc: "Entalle lateral de torso" },
    { name: "Ajuste de busto (achicar/ampliar)", category: "Vestidos & Gala", price: 15000, time: 60, desc: "Modificación del contorno de busto" },
    { name: "Ajuste de corsé estructurado", category: "Vestidos & Gala", price: 25000, time: 90, desc: "Con ballenas y forro rígido" },
    { name: "Agregar/ajustar copas (bra cups)", category: "Vestidos & Gala", price: 10000, time: 30, desc: "Instalación de copas preformadas" },
    { name: "Ajuste de tirantes", category: "Vestidos & Gala", price: 8000, time: 25, desc: "Subida o ajuste de pabilos/tirantes" },
    { name: "Cambiar forma de escote", category: "Vestidos & Gala", price: 20000, time: 90, desc: "Rediseño de línea de escote" },
    { name: "Ajuste integral vestido fiesta", category: "Vestidos & Gala", price: 45000, time: 180, desc: "Ajuste completo de busto, cintura y basta" },
    { name: "Ajuste integral vestido novia", category: "Vestidos & Gala", price: 80000, time: 300, desc: "Alta costura novia con pruebas presenciales" },
    { name: "Reparación pedrería / reposicionar encaje", category: "Vestidos & Gala", price: 10000, time: 45, desc: "Bordado a mano de cristales o apliques" },
    { name: "Cambio a cierre tipo cordón (lace-up)", category: "Vestidos & Gala", price: 18000, time: 75, desc: "Instalación de ojetillos y corsatería" },

    // 5. CAMISAS, BLUSAS & FALDAS
    { name: "Acortar mangas desde puño (Camisa)", category: "Camisas & Blusas", price: 8000, time: 30, desc: "Reubicación de puño y abertura" },
    { name: "Acortar mangas desde tajalí/hombro (Camisa)", category: "Camisas & Blusas", price: 15000, time: 60, desc: "Desmonte completo en hombro" },
    { name: "Entalle costados / espalda (Camisa)", category: "Camisas & Blusas", price: 10000, time: 35, desc: "Entalle slim fit" },
    { name: "Ajuste de cuello (reducir/ampliar)", category: "Camisas & Blusas", price: 12000, time: 45, desc: "Modificación de pie de cuello" },
    { name: "Acortar largo de camisa", category: "Camisas & Blusas", price: 8000, time: 30, desc: "Subida de basta curvo o recto" },
    { name: "Basta falda (simple, invisible o con forro)", category: "Camisas & Blusas", price: 6000, time: 25, desc: "Ruedo de falda" },
    { name: "Basta falda plisada (por pliegue)", category: "Camisas & Blusas", price: 14000, time: 60, desc: "Planchado y remate de pliegues" },
    { name: "Ajustar cintura / cadera falda", category: "Camisas & Blusas", price: 10000, time: 35, desc: "Entalle de pretina" },
    { name: "Entalle falda tubo / lápiz", category: "Camisas & Blusas", price: 12000, time: 45, desc: "Reducción de anchura lateral" },

    // 6. ABRIGOS, CUERO & ROPA TÉCNICA
    { name: "Cambio cierre parka / cortavientos", category: "Abrigos & Cuero", price: 18000, time: 60, desc: "Cierre separable para chaqueta sintética" },
    { name: "Cambio cierre chaqueta pluma (sellado)", category: "Abrigos & Cuero", price: 22000, time: 75, desc: "Cierre hermético sin perder pluma" },
    { name: "Cambio cierre abrigo lana / cuero", category: "Abrigos & Cuero", price: 22000, time: 80, desc: "Cierre pesado metálico" },
    { name: "Acortar mangas chaqueta cuero", category: "Abrigos & Cuero", price: 16000, time: 75, desc: "Costura industrial para cuero" },
    { name: "Entalle de cuero (costados)", category: "Abrigos & Cuero", price: 25000, time: 100, desc: "Ajuste lateral en piel" },
    { name: "Ajuste hombros cuero", category: "Abrigos & Cuero", price: 35000, time: 150, desc: "Desmonte sisa en prenda de cuero" },
    { name: "Cambio de forro abrigo / cuero", category: "Abrigos & Cuero", price: 40000, time: 180, desc: "Forro interior completo pesados" },

    // 7. TEXTIL HOGAR & ESPECIALES
    { name: "Basta cortina (por paño)", category: "Hogar & Especiales", price: 8000, time: 30, desc: "Ruedo largo por metro de paño" },
    { name: "Angostar / acortar cortina", category: "Hogar & Especiales", price: 10000, time: 40, desc: "Ajuste de ancho y largo" },
    { name: "Confección fundas cojín", category: "Hogar & Especiales", price: 8000, time: 30, desc: "Funda con cierre invisible" },
    { name: "Zurcido invisible / desgarros", category: "Hogar & Especiales", price: 8000, time: 35, desc: "Restauración de tela dañada" },
    { name: "Servicio Express (24-48h)", category: "Hogar & Especiales", price: 15000, time: 0, desc: "Recargo por entrega rápida de urgencia" },
    { name: "Servicio Express (Mismo día)", category: "Hogar & Especiales", price: 25000, time: 0, desc: "Atención prioritaria inmediata" }
];

async function seedAllCatalogItems() {
    console.log('=== Iniciando Carga Exhaustiva de Todos los Arreglos en Supabase ===');
    
    // Consultar cuáles existen actualmente
    const { data: existing, error: checkError } = await supabase.from('catalog').select('id, name');
    
    if (checkError) {
        console.error('Error al consultar tabla catalog:', checkError.message);
        return;
    }

    const existingNames = new Set((existing || []).map(e => e.name.trim().toLowerCase()));
    console.log(`Actualmente en Base de Datos: ${existingNames.size} ítems.`);

    let insertados = 0;
    let omitidos = 0;

    for (const item of todosLosArreglos) {
        const key = item.name.trim().toLowerCase();
        if (!existingNames.has(key)) {
            const { error: insertError } = await supabase.from('catalog').insert([{
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.desc,
                production_time_minutes: item.time,
                material_cost: Math.round(item.price * 0.05), // Estimación 5% insumos
                suggested_price: item.price,
                active: true
            }]);

            if (insertError) {
                console.error(`❌ Error al insertar "${item.name}":`, insertError.message);
            } else {
                insertados++;
                existingNames.add(key);
                console.log(`[${insertados}] ✓ Cargado: "${item.name}" — $${item.price.toLocaleString('es-CL')} (${item.time} min)`);
            }
        } else {
            omitidos++;
        }
    }

    console.log(`\n🎉 PROCESO FINALIZADO CON ÉXITO:`);
    console.log(`- Nuevos ítems agregados: ${insertados}`);
    console.log(`- Ítems previamente existentes: ${omitidos}`);
    console.log(`- Total final de servicios activos en la Base de Datos: ${existingNames.size}`);
}

seedAllCatalogItems();
