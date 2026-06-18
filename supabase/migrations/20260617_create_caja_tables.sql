-- Crear tabla de turnos de caja
CREATE TABLE IF NOT EXISTS cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    opened_by VARCHAR(255),
    closed_by VARCHAR(255),
    opening_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    closing_amount DECIMAL(10, 2),
    expected_cash DECIMAL(10, 2),
    expected_card DECIMAL(10, 2),
    difference DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed'
    notes TEXT
);

-- Habilitar RLS
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;

-- Crear políticas (permitir lectura y escritura a administradores)
CREATE POLICY "Allow read access to all authenticated users for cash_registers" 
ON cash_registers FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow insert access for cash_registers" 
ON cash_registers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access for cash_registers" 
ON cash_registers FOR UPDATE USING (true);


-- Crear tabla de movimientos manuales de caja
CREATE TABLE IF NOT EXISTS cash_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    register_id UUID REFERENCES cash_registers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'in', 'out'
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Habilitar RLS
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Allow read access to all authenticated users for cash_movements" 
ON cash_movements FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow insert access for cash_movements" 
ON cash_movements FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access for cash_movements" 
ON cash_movements FOR UPDATE USING (true);
