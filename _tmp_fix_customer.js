const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

const target = `                        // Inyectar datos del cliente desde CRM si existe
                        let searchPhone1 = recipientPhone;
                        let searchPhone2 = recipientPhone.startsWith('56') ? recipientPhone.substring(2) : \`56\${recipientPhone}\`;
                        const { data: customerData } = await supabase
                            .from('customers')
                            .select('full_name, email')
                            .or(\`phone.eq.\${searchPhone1},phone.eq.\${searchPhone2}\`)
                            .limit(1);
                        
                        if (customerData && customerData.length > 0) {
                            const cName = customerData[0].full_name || '';
                            const cEmail = customerData[0].email || '';`;

const replacement = `                        // Inyectar datos del cliente desde CRM usando el customer_id asociado al chat
                        let cName = '';
                        let cEmail = '';
                        let customerFound = false;

                        if (task.payload.chat_id) {
                            const { data: chatData } = await supabase
                                .from('crm_whatsapp_chats')
                                .select('customer_id')
                                .eq('id', task.payload.chat_id)
                                .single();
                                
                            if (chatData && chatData.customer_id) {
                                const { data: exactCustomer } = await supabase
                                    .from('customers')
                                    .select('full_name, email')
                                    .eq('id', chatData.customer_id)
                                    .single();
                                    
                                if (exactCustomer) {
                                    cName = exactCustomer.full_name || '';
                                    cEmail = exactCustomer.email || '';
                                    customerFound = true;
                                }
                            }
                        }

                        if (!customerFound) {
                            // Fallback para clientes antiguos sin customer_id en el chat
                            let searchPhone1 = recipientPhone;
                            let searchPhone2 = recipientPhone.startsWith('56') ? recipientPhone.substring(2) : \`56\${recipientPhone}\`;
                            const { data: customerData } = await supabase
                                .from('customers')
                                .select('full_name, email')
                                .or(\`phone.eq.\${searchPhone1},phone.eq.\${searchPhone2}\`)
                                .limit(1);
                            
                            if (customerData && customerData.length > 0) {
                                cName = customerData[0].full_name || '';
                                cEmail = customerData[0].email || '';
                                customerFound = true;
                            }
                        }
                        
                        if (customerFound) {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/api/orchestrator/route.ts', code, 'utf8');
    console.log('Success!');
} else {
    console.log('Target not found!');
}
