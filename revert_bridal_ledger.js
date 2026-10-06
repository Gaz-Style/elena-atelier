const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const logText = `
Fixing bridal_dc99168f-b246-4d2b-a2a3-f86a84d47870_custom_p1: total_amount 60000 -> 120000
Fixing bridal_d07536f8-3455-436f-93e8-c6cf58323b59_p1: total_amount 75000 -> 150000
Renaming balance bridal_d07536f8-3455-436f-93e8-c6cf58323b59_p2 -> bridal_d07536f8-3455-436f-93e8-c6cf58323b59_p1_balance_p2
Fixing bridal_09aae6fb-683a-458a-b392-c4841734fe3d_custom_p1: total_amount 190000 -> 429000
Fixing bridal_329e7764-f8f8-40fb-8c72-51a31e87dfa6_p1: total_amount 77500 -> 155000
Fixing bridal_227e53d3-c822-4c6a-b0c8-e9b54835ca70_p1: total_amount 147500 -> 295000
Renaming balance bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p3 -> bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p1_balance_p3
Fixing bridal_35aefdcb-a901-4142-a7be-444a49bb891a_custom_p1: total_amount 180128 -> 360257
Fixing bridal_abcbb814-bfb0-4746-8510-14cd81727914_custom_p1: total_amount 60000 -> 120000
Fixing bridal_2a1fa597-f098-4f91-b9e2-e7b698c862b4_p1: total_amount 60000 -> 120000
Fixing bridal_4a8ccf09-36e6-4e62-b45b-6991e31181c8_custom_p1: total_amount 158500 -> 317000
Renaming balance bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p4 -> bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p1_balance_p4
Fixing bridal_1f784690-f1c4-492a-a319-cdc24620afaa_custom_p1: total_amount 147500 -> 295000
Fixing bridal_21843bea-c7c2-40f7-bd54-2462735b1283_custom_p1: total_amount 200000 -> 568000
Renaming balance bridal_21843bea-c7c2-40f7-bd54-2462735b1283_custom_p2 -> bridal_21843bea-c7c2-40f7-bd54-2462735b1283_custom_p1_balance_p2
Fixing bridal_444ac6aa-2432-44bf-908e-826964d4acf0_custom_p1: total_amount 80000 -> 160000
Fixing bridal_13d80212-c015-4a01-bd0a-72f318f667a9_custom_p1: total_amount 70000 -> 140000
Fixing bridal_1d18a6f8-2071-4098-97e9-47bfc9e89235_custom_p1: total_amount 190000 -> 380000
Fixing bridal_1b3dfa18-2dad-4e18-85e0-23e4e5025faf_custom_p1: total_amount 130000 -> 260000
Renaming balance bridal_13d80212-c015-4a01-bd0a-72f318f667a9_custom_p2 -> bridal_13d80212-c015-4a01-bd0a-72f318f667a9_custom_p1_balance_p2
Renaming balance bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p5 -> bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p1_balance_p5
Renaming balance bridal_35aefdcb-a901-4142-a7be-444a49bb891a_custom_p2 -> bridal_35aefdcb-a901-4142-a7be-444a49bb891a_custom_p1_balance_p2
Fixing bridal_07339669-2521-4458-b35b-3f71e8666ef6_custom_p1: total_amount 122500 -> 245000
Fixing bridal_d91e66d6-122d-4244-9923-83e9bd632727_custom_p1: total_amount 90000 -> 180000
Fixing bridal_a2bcc2ab-7601-4a20-9d5a-bb0a20d34d53_custom_p1: total_amount 156000 -> 312000
Fixing bridal_194f071a-61b6-4ee2-a8cb-1b6a799b1403_custom_p1: total_amount 60000 -> 120000
Fixing bridal_ddd346dc-d5dd-472d-8d30-94f9c6870afc_custom_p1: total_amount 95000 -> 190000
Fixing bridal_3fbacd29-fc76-484e-9160-ff5b94f19dac_custom_p1: total_amount 122500 -> 245000
Fixing bridal_65634235-c0f7-4551-816a-9d3889ba4a69_custom_p1: total_amount 60000 -> 120000
`;

async function revert() {
    console.log("Reverting database changes...");
    const lines = logText.trim().split('\n');
    let revertedCount = 0;

    for (const line of lines) {
        if (line.startsWith('Fixing ')) {
            // Fixing bridal_dc99..._custom_p1: total_amount 60000 -> 120000
            const match = line.match(/Fixing (.*?): total_amount (\d+) -> \d+/);
            if (match) {
                const id = match[1];
                const oldTotal = parseInt(match[2]);
                
                // Revert total_amount to oldTotal, and status back to 'completed'
                await supabase
                    .from('sales_ledger')
                    .update({ total_amount: oldTotal, status: 'completed' })
                    .eq('internal_id', id);
                    
                console.log(`Reverted ${id} to total_amount ${oldTotal} and status 'completed'`);
                revertedCount++;
            }
        } else if (line.startsWith('Renaming balance ')) {
            // Renaming balance oldId -> newId
            const match = line.match(/Renaming balance (.*?) -> (.*)/);
            if (match) {
                const oldId = match[1];
                const newId = match[2];
                
                await supabase
                    .from('sales_ledger')
                    .update({ internal_id: oldId })
                    .eq('internal_id', newId);
                    
                console.log(`Reverted internal_id from ${newId} to ${oldId}`);
                revertedCount++;
            }
        }
    }
    console.log(`Done. Reverted ${revertedCount} entries.`);
}

revert();
