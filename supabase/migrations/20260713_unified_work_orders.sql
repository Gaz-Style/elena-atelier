-- =======================================================================================
-- MIGRACIÓN: SISTEMA UNIFICADO DE ÓRDENES DE TRABAJO (WORK ORDERS)
-- Elena Atelier OS — Unificación de Producción + Alta Costura
-- =======================================================================================

-- Función Genérica para actualizar timestamp (en caso de que no exista)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ─── 1. TABLA MAESTRA: work_orders ────────────────────────────────────────────
-- Unifica production_orders + bridal_projects en un solo pipeline
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relaciones
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES sales_ledger(id) ON DELETE SET NULL,
    
    -- Identificación
    order_number SERIAL,
    pos_order_id TEXT,  -- Compatibilidad con POS existente
    
    -- Clasificación
    order_type TEXT NOT NULL DEFAULT 'bespoke',  
        -- 'bespoke', 'modificacion', 'reparacion', 'graduacion', 'novia', 'madrina', 'b2b_batch', 'upcycling'
    order_category TEXT NOT NULL DEFAULT 'sastreria',
        -- 'alta_costura', 'sastreria', 'reparacion', 'confeccion'
    source TEXT DEFAULT 'pos',
        -- 'pos', 'web', 'whatsapp', 'presencial', 'b2b'
    
    -- Estado de producción
    status TEXT NOT NULL DEFAULT 'draft',
        -- 'consulta', 'presupuesto', 'contrato_pendiente', 'draft', 'cutting', 'sewing', 'finishing', 'ready', 'delivered', 'cancelled'
    priority TEXT DEFAULT 'normal',
        -- 'urgente', 'alta', 'normal', 'baja'
    
    -- Descripción
    description TEXT,
    notes TEXT,
    materials_notes TEXT,
    internal_notes TEXT,
    
    -- Financiero
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending',
        -- 'pending', 'partial', 'paid'
    payment_method TEXT,
    payment_plan JSONB,  -- Para cuotas: [{numero, monto, status, fecha, metodo}]
    
    -- Fechas de producción
    deadline TIMESTAMPTZ,
    production_start_date TIMESTAMPTZ,
    production_end_date TIMESTAMPTZ,
    final_delivery_date TIMESTAMPTZ,
    estimated_hours DECIMAL(8, 2) DEFAULT 0,
    
    -- Alta Costura (campos heredados de bridal_projects)
    event_date TIMESTAMPTZ,
    event_venue TEXT,
    project_type TEXT,  -- 'novia', 'madrina', 'graduacion' (para filtros de Alta Costura)
    service_type TEXT,  -- 'modificacion_tienda', 'vestido_propio', 'bespoke'
    contract_accepted BOOLEAN DEFAULT false,
    contract_accepted_at TIMESTAMPTZ,
    contract_notes TEXT,
    linked_group_id TEXT,
    
    -- Asignación
    assigned_operator_id UUID REFERENCES atelier_operators(id) ON DELETE SET NULL,
    
    -- Referencia a tablas legacy (para migración gradual)
    legacy_production_order_id UUID,
    legacy_bridal_project_id UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. TABLA: work_order_items ───────────────────────────────────────────────
-- Cada prenda individual dentro de una orden (para órdenes multi-prenda)
CREATE TABLE IF NOT EXISTS work_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    
    description TEXT,
    status TEXT DEFAULT 'pendiente',
        -- 'pendiente', 'corte', 'confeccion', 'acabados', 'calidad', 'listo'
    assigned_operator_id UUID REFERENCES atelier_operators(id) ON DELETE SET NULL,
    
    estimated_hours DECIMAL(8, 2) DEFAULT 0,
    actual_hours DECIMAL(8, 2) DEFAULT 0,
    production_start TIMESTAMPTZ,
    production_end TIMESTAMPTZ,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. TABLA: work_order_milestones ──────────────────────────────────────────
-- Hitos de producción (pruebas, entregas, etc.) — reemplaza bridal_milestones
CREATE TABLE IF NOT EXISTS work_order_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    
    milestone_type TEXT NOT NULL,
        -- 'toma_medidas', 'prueba_estructura', 'prueba_ajustes', 'prueba_final', 'entrega', 'retiro', 'otro'
    title TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
        -- 'pending', 'scheduled', 'completed', 'cancelled'
    required_payment DECIMAL(12, 2) DEFAULT 0,
    
    -- Enlace bidireccional con agenda
    agenda_event_id UUID,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. TABLA: work_order_measurements ────────────────────────────────────────
-- Medidas del cliente para esta orden específica
CREATE TABLE IF NOT EXISTS work_order_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    measurement_data JSONB,  -- Datos estructurados de medidas
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    taken_by TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. AGREGAR FKs A AGENDAMIENTOS ──────────────────────────────────────────
ALTER TABLE agendamientos ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE agendamientos ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL;
ALTER TABLE agendamientos ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES work_order_milestones(id) ON DELETE SET NULL;

-- ─── 6. RLS (Row Level Security) ─────────────────────────────────────────────
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_measurements ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para service_role y authenticated
CREATE POLICY "Allow all for work_orders" ON work_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for work_order_items" ON work_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for work_order_milestones" ON work_order_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for work_order_measurements" ON work_order_measurements FOR ALL USING (true) WITH CHECK (true);

-- ─── 7. ÍNDICES DE RENDIMIENTO ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_type ON work_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_work_orders_category ON work_orders(order_category);
CREATE INDEX IF NOT EXISTS idx_work_orders_pos_order ON work_orders(pos_order_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_legacy_po ON work_orders(legacy_production_order_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_legacy_bp ON work_orders(legacy_bridal_project_id);
CREATE INDEX IF NOT EXISTS idx_work_order_items_wo ON work_order_items(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_milestones_wo ON work_order_milestones(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_measurements_wo ON work_order_measurements(work_order_id);
CREATE INDEX IF NOT EXISTS idx_agendamientos_customer ON agendamientos(customer_id);
CREATE INDEX IF NOT EXISTS idx_agendamientos_work_order ON agendamientos(work_order_id);

-- ─── 8. TRIGGER PARA UPDATED_AT ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_work_orders_modtime ON work_orders;
CREATE TRIGGER update_work_orders_modtime
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_work_order_items_modtime ON work_order_items;
CREATE TRIGGER update_work_order_items_modtime
    BEFORE UPDATE ON work_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
