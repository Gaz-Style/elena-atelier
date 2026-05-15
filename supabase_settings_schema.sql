-- Table: Company Settings (Global Cost Parameters)
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial default settings
INSERT INTO public.company_settings (key, value)
VALUES 
    ('cost_structure', '{
        "labor_hourly_rate": 25000,
        "operational_fixed_cost": 349000,
        "default_margin_percentage": 15
    }')
ON CONFLICT (key) DO NOTHING;
