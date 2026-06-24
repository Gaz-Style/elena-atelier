require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTables() {
    // Test if tables already exist
    const { data: testBP } = await supabase.from('bridal_projects').select('id').limit(1);
    
    if (testBP !== null) {
        console.log('Tables already exist, checking milestones and measurements...');
        const { data: testBM } = await supabase.from('bridal_milestones').select('id').limit(1);
        const { data: testBMeas } = await supabase.from('bridal_measurements').select('id').limit(1);
        console.log('bridal_milestones exists:', testBM !== null);
        console.log('bridal_measurements exists:', testBMeas !== null);
        return;
    }

    console.log('Tables do not exist yet. Please create them via the Supabase SQL Editor.');
    console.log('SQL to execute:');
    console.log('---');
    
    const sql = `
-- Table 1: bridal_projects
CREATE TABLE IF NOT EXISTS bridal_projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    project_type text NOT NULL DEFAULT 'novia',
    service_type text NOT NULL DEFAULT 'modificacion_tienda',
    event_date timestamptz,
    event_venue text,
    status text NOT NULL DEFAULT 'consulta',
    total_amount integer NOT NULL DEFAULT 0,
    payment_1_amount integer DEFAULT 0,
    payment_1_status text DEFAULT 'pending',
    payment_1_date timestamptz,
    payment_2_amount integer DEFAULT 0,
    payment_2_status text DEFAULT 'pending',
    payment_2_date timestamptz,
    payment_3_amount integer DEFAULT 0,
    payment_3_status text DEFAULT 'pending',
    payment_3_date timestamptz,
    contract_accepted boolean DEFAULT false,
    contract_accepted_at timestamptz,
    contract_notes text,
    description text,
    materials_notes text,
    internal_notes text,
    linked_group_id uuid,
    pos_order_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table 2: bridal_milestones
CREATE TABLE IF NOT EXISTS bridal_milestones (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES bridal_projects(id) ON DELETE CASCADE,
    milestone_type text NOT NULL DEFAULT 'custom',
    title text NOT NULL,
    scheduled_date timestamptz,
    completed_date timestamptz,
    status text NOT NULL DEFAULT 'pending',
    required_payment integer DEFAULT 0,
    notes text,
    agenda_event_id uuid,
    created_at timestamptz DEFAULT now()
);

-- Table 3: bridal_measurements
CREATE TABLE IF NOT EXISTS bridal_measurements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES bridal_projects(id) ON DELETE CASCADE,
    milestone_id uuid REFERENCES bridal_milestones(id) ON DELETE SET NULL,
    bust numeric,
    waist numeric,
    hips numeric,
    full_length numeric,
    shoulder_width numeric,
    arm_circumference numeric,
    sleeve_length numeric,
    back_length numeric,
    neckline_depth numeric,
    custom_measurements jsonb DEFAULT '{}',
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bridal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridal_measurements ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users, same as other tables)
CREATE POLICY "Allow all for authenticated" ON bridal_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON bridal_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON bridal_measurements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role bypass
CREATE POLICY "Allow service role" ON bridal_projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role" ON bridal_milestones FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role" ON bridal_measurements FOR ALL TO service_role USING (true) WITH CHECK (true);
`;
    
    console.log(sql);
}

createTables();
