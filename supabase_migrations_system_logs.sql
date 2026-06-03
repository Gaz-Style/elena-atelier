CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    service TEXT NOT NULL, -- e.g., 'MercadoPago Webhook', 'Transbank'
    level TEXT NOT NULL, -- 'INFO', 'WARN', 'ERROR'
    message TEXT NOT NULL,
    payload JSONB
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all authenticated users" 
ON public.system_logs FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.system_logs FOR INSERT WITH CHECK (true);
