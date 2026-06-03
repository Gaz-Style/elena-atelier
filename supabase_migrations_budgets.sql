-- Table: Budgets (For short URLs)
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and set public select access
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select budgets" ON public.budgets;
CREATE POLICY "Allow public select budgets" ON public.budgets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role insert budgets" ON public.budgets;
CREATE POLICY "Allow service role insert budgets" ON public.budgets FOR INSERT WITH CHECK (true);
