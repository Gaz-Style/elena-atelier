const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

const targetCatalogFetch = `                        // Obtener catálogo para inyectar precios reales
                        const { data: catalogItems } = await supabase
                            .from('catalog')
                            .select('name, category, price, description')
                            .eq('active', true);
                            
                        let catalogContext = 'Catálogo No Disponible';
                        if (catalogItems && catalogItems.length > 0) {
                            catalogContext = catalogItems.map((item: any) => \`- \${item.name} (\${item.category}): desde $\${item.price.toLocaleString('es-CL')}\`).join('\\n');
                        }`;

code = code.replace(targetCatalogFetch, `                        // El catálogo de precios ahora se consulta dinámicamente vía tool (consultar_precio)
                        // Ya no se inyecta todo el bloque duro en la memoria.
                        let catalogContext = '';`);

const targetTool = `                                    {
                                        name: "consultar_disponibilidad",
                                        description: "Consulta horarios disponibles (YYYY-MM-DD)",
                                        parameters: { type: "OBJECT", properties: { fecha: { type: "STRING" } }, required: ["fecha"] }
                                    }`;

const newTool = `                                    {
                                        name: "consultar_disponibilidad",
                                        description: "Consulta horarios disponibles (YYYY-MM-DD)",
                                        parameters: { type: "OBJECT", properties: { fecha: { type: "STRING" } }, required: ["fecha"] }
                                    },
                                    {
                                        name: "consultar_precio",
                                        description: "Busca el precio de un servicio o prenda en la base de datos del Atelier.",
                                        parameters: { type: "OBJECT", properties: { servicio: { type: "STRING", description: "Término de búsqueda, ej: basta, cierre, vestido de novia, entalle" } }, required: ["servicio"] }
                                    }`;

code = code.replace(targetTool, newTool);

const targetExecute = `                                } else {
                                    toolResult = await executeAtelierTool(funcName, funcArgs, { celular: recipientPhone });
                                }`;

const newExecute = `                                } else if (funcName === 'consultar_precio') {
                                    const searchTerm = funcArgs.servicio || '';
                                    const { data: catalogData } = await supabase.from('catalog').select('*').eq('active', true);
                                    let found = [];
                                    if (catalogData) {
                                        found = catalogData.filter((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.category.toLowerCase().includes(searchTerm.toLowerCase()));
                                    }
                                    if (found.length > 0) {
                                        toolResult = JSON.stringify({ status: 'success', precios_referenciales: found.map((i: any) => \`\${i.name}: desde $\${i.price}\`) });
                                    } else {
                                        toolResult = JSON.stringify({ status: 'not_found', message: 'No hay un precio estandarizado para esto. Indica al cliente que esto se evalúa en el taller y requiere cita.' });
                                    }
                                } else {
                                    toolResult = await executeAtelierTool(funcName, funcArgs, { celular: recipientPhone });
                                }`;

code = code.replace(targetExecute, newExecute);

fs.writeFileSync('src/app/api/orchestrator/route.ts', code, 'utf8');
console.log('Done!');
