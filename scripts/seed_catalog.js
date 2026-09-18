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

// Catálogo completo listo para insertar en la tabla catalog
const serviciosParaInsertar = [
    // 1. CHAQUETAS, BLAZERS & SACOS DE TRAJE
    {
        name: "Acortar mangas desde el puño — chaqueta sport / sin forro",
        category: "Chaquetas & Blazers",
        price: 12000,
        description: "Ajuste de largo de mangas en chaquetas sin forro interno.",
        production_time_minutes: 45,
        material_cost: 500,
        suggested_price: 12000,
        active: true
    },
    {
        name: "Acortar mangas desde el puño — blazer con forro",
        category: "Chaquetas & Blazers",
        price: 15000,
        description: "Incluye ajuste de forro interno de manga y repliegue técnico.",
        production_time_minutes: 60,
        material_cost: 800,
        suggested_price: 15000,
        active: true
    },
    {
        name: "Acortar mangas desde el puño — saco de traje con forro completo",
        category: "Chaquetas & Blazers",
        price: 18000,
        description: "Reconstrucción de abertura de puño con botones y forro sastre.",
        production_time_minutes: 75,
        material_cost: 1000,
        suggested_price: 18000,
        active: true
    },
    {
        name: "Acortar mangas desde el tajalí (hombro) — ojales funcionales",
        category: "Chaquetas & Blazers",
        price: 32000,
        description: "Desmonte completo de manga desde la sisa, recorte en cabeza de manga y reconstrucción.",
        production_time_minutes: 150,
        material_cost: 2000,
        suggested_price: 32000,
        active: true
    },
    {
        name: "Acortar mangas desde el tajalí — saco con estructura sastre",
        category: "Chaquetas & Blazers",
        price: 38000,
        description: "Intervención de alta sastrería con ajuste de copa y hombrera.",
        production_time_minutes: 180,
        material_cost: 2500,
        suggested_price: 38000,
        active: true
    },
    {
        name: "Alargar mangas (con reserva) — con forro",
        category: "Chaquetas & Blazers",
        price: 18000,
        description: "Soltado de reserva interna, bajada de forro y planchado técnico.",
        production_time_minutes: 60,
        material_cost: 1000,
        suggested_price: 18000,
        active: true
    },
    {
        name: "Adelgazar manga (tapering) — con forro",
        category: "Chaquetas & Blazers",
        price: 18000,
        description: "Ajuste de ancho de brazo desde la sisa hasta el puño.",
        production_time_minutes: 60,
        material_cost: 800,
        suggested_price: 18000,
        active: true
    },
    {
        name: "Reducir ancho de hombros — estructura sastre",
        category: "Chaquetas & Blazers",
        price: 40000,
        description: "Reducción de espalda y hombros con desmonte de mangas y ajuste de hombreras.",
        production_time_minutes: 180,
        material_cost: 3000,
        suggested_price: 40000,
        active: true
    },
    {
        name: "Entalle lateral (costados) — blazer con forro",
        category: "Chaquetas & Blazers",
        price: 22000,
        description: "Ajuste de silueta en cintura y costados respetando las pinzas originales.",
        production_time_minutes: 75,
        material_cost: 1000,
        suggested_price: 22000,
        active: true
    },
    {
        name: "Cambio de forro completo — Chaqueta o Abrigo",
        category: "Chaquetas & Blazers",
        price: 55000,
        description: "Desmonte total del forro antiguo, confección e instalación de forro nuevo.",
        production_time_minutes: 240,
        material_cost: 12000,
        suggested_price: 55000,
        active: true
    },

    // 2. PANTALONES DE VESTIR & CASUALES
    {
        name: "Basta simple a máquina",
        category: "Pantalones",
        price: 6000,
        description: "Ruedo estándar para pantalones casuales o institucionales.",
        production_time_minutes: 20,
        material_cost: 300,
        suggested_price: 6000,
        active: true
    },
    {
        name: "Basta invisible a mano (blind hem)",
        category: "Pantalones",
        price: 8000,
        description: "Costura oculta a mano para pantalón de vestir o traje.",
        production_time_minutes: 30,
        material_cost: 500,
        suggested_price: 8000,
        active: true
    },
    {
        name: "Basta con conservación de ruedo original (Jeans / Vestir)",
        category: "Pantalones",
        price: 10000,
        description: "Corte y reubicación de la basta de fábrica manteniendo el acabado original.",
        production_time_minutes: 40,
        material_cost: 500,
        suggested_price: 10000,
        active: true
    },
    {
        name: "Achicar cintura (hasta 4 cm)",
        category: "Pantalones",
        price: 12000,
        description: "Ajuste de pretina trasera conservando el calce del asiento.",
        production_time_minutes: 45,
        material_cost: 500,
        suggested_price: 12000,
        active: true
    },
    {
        name: "Achicar cintura (reconstrucción más de 5 cm)",
        category: "Pantalones",
        price: 20000,
        description: "Desmonte lateral y trasero de pretina con ajuste de pinzas.",
        production_time_minutes: 90,
        material_cost: 1000,
        suggested_price: 20000,
        active: true
    },
    {
        name: "Entalle de piernas (tapering slim/skinny)",
        category: "Pantalones",
        price: 15000,
        description: "Angostado de muslos, rodillas y bota por ambos lados.",
        production_time_minutes: 50,
        material_cost: 500,
        suggested_price: 15000,
        active: true
    },
    {
        name: "Cambio de cierre estándar",
        category: "Pantalones",
        price: 8000,
        description: "Reemplazo de cierre de nylon o metálico en pantalones.",
        production_time_minutes: 30,
        material_cost: 1200,
        suggested_price: 8000,
        active: true
    },

    // 3. JEANS & DENIM
    {
        name: "Basta simple (hilo denim especial)",
        category: "Jeans & Denim",
        price: 7000,
        description: "Corte y ruedo con hilo grueso reforzado tipo levis.",
        production_time_minutes: 25,
        material_cost: 500,
        suggested_price: 7000,
        active: true
    },
    {
        name: "Reparación/Zurcido invisible de entrepierna",
        category: "Jeans & Denim",
        price: 12000,
        description: "Refuerzo interno y tramado de hilo para reparar el desgaste.",
        production_time_minutes: 45,
        material_cost: 800,
        suggested_price: 12000,
        active: true
    },

    // 4. VESTIDOS (DIARIO, FIESTA Y NOVIA)
    {
        name: "Entalle de Vestidos (Costados y Pinzas)",
        category: "Vestidos & Gala",
        price: 12000,
        description: "Ajuste de silueta en vestidos de diario o fiesta.",
        production_time_minutes: 45,
        material_cost: 500,
        suggested_price: 12000,
        active: true
    },
    {
        name: "Basta con forro (dos capas)",
        category: "Vestidos & Gala",
        price: 15000,
        description: "Nivelado y ruedo de tela principal y forro interior.",
        production_time_minutes: 60,
        material_cost: 600,
        suggested_price: 15000,
        active: true
    },
    {
        name: "Basta múltiples capas (tul, gasa, forro)",
        category: "Vestidos & Gala",
        price: 24000,
        description: "Corte y terminado fino en vestidos de noche con capas de vuelo.",
        production_time_minutes: 90,
        material_cost: 1000,
        suggested_price: 24000,
        active: true
    },
    {
        name: "Ajuste integral de Corsé / Estructura",
        category: "Vestidos & Gala",
        price: 32000,
        description: "Ajuste de ballenas, varillas y copas estructuradas.",
        production_time_minutes: 120,
        material_cost: 2000,
        suggested_price: 32000,
        active: true
    },
    {
        name: "Ajuste integral Vestido de Fiesta",
        category: "Vestidos & Gala",
        price: 45000,
        description: "Modificación de busto, cintura, tirantes y basta completa.",
        production_time_minutes: 180,
        material_cost: 3000,
        suggested_price: 45000,
        active: true
    },

    // 5. CAMISAS, BLUSAS & FALDAS
    {
        name: "Acortar mangas de camisa desde puño",
        category: "Camisas & Blusas",
        price: 10000,
        description: "Subida de largo de manga reubicando el puño y pliegues.",
        production_time_minutes: 35,
        material_cost: 400,
        suggested_price: 10000,
        active: true
    },
    {
        name: "Entalle de camisa (costados y pinzas de espalda)",
        category: "Camisas & Blusas",
        price: 12000,
        description: "Ajuste de holgura en torso y espalda.",
        production_time_minutes: 40,
        material_cost: 400,
        suggested_price: 12000,
        active: true
    },

    // 6. ABRIGOS, CUERO & ROPA TÉCNICA
    {
        name: "Cambio de cierre parka / cortavientos (técnico)",
        category: "Abrigos & Cuero",
        price: 22000,
        description: "Reemplazo de cierre termosellado o reforzado.",
        production_time_minutes: 75,
        material_cost: 3500,
        suggested_price: 22000,
        active: true
    },
    {
        name: "Acortar mangas chaqueta de cuero",
        category: "Abrigos & Cuero",
        price: 22000,
        description: "Trabajo con aguja especial para cuero sin marcar la piel.",
        production_time_minutes: 90,
        material_cost: 1500,
        suggested_price: 22000,
        active: true
    }
];

async function seedCatalog() {
    console.log('Iniciando poblamiento de la base de datos (tabla catalog)...');
    
    // 1. Limpiar o verificar estado
    const { data: existing, error: checkError } = await supabase.from('catalog').select('id, name');
    
    if (checkError) {
        console.error('Error al consultar tabla catalog:', checkError.message);
        return;
    }

    console.log(`Ítems actuales en la base de datos: ${existing ? existing.length : 0}`);

    // Insertar ítems en lotes para evitar problemas de timeout
    let insertados = 0;
    for (const item of serviciosParaInsertar) {
        // Verificar si ya existe por nombre para evitar duplicados accidentales
        const yaExiste = existing?.some(e => e.name.trim().toLowerCase() === item.name.trim().toLowerCase());
        
        if (!yaExiste) {
            const { error: insertError } = await supabase.from('catalog').insert([item]);
            if (insertError) {
                console.error(`Error al insertar "${item.name}":`, insertError.message);
            } else {
                insertados++;
                console.log(`✓ Cargado: ${item.name} ($${item.price} | ${item.production_time_minutes} min)`);
            }
        } else {
            console.log(`- Ya existe en BD (omitido): ${item.name}`);
        }
    }

    console.log(`\n¡Poblamiento finalizado con éxito! Se añadieron ${insertados} nuevos servicios a la base de datos.`);
}

seedCatalog();
