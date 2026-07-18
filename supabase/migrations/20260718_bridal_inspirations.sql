CREATE TABLE IF NOT EXISTS public.bridal_inspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.bridal_projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL, -- 'vestido', 'ramo', 'iglesia', 'otros'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bridal_inspirations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Permitir lectura pública en inspiraciones" ON public.bridal_inspirations;
DROP POLICY IF EXISTS "Permitir inserción pública en inspiraciones" ON public.bridal_inspirations;
DROP POLICY IF EXISTS "Permitir borrado público en inspiraciones" ON public.bridal_inspirations;

-- Recreate policies
CREATE POLICY "Permitir lectura pública en inspiraciones" ON public.bridal_inspirations FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública en inspiraciones" ON public.bridal_inspirations FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir borrado público en inspiraciones" ON public.bridal_inspirations FOR DELETE USING (true);
