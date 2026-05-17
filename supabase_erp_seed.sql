-- SEED: Chart of Accounts (Elena Atelier ERP Standard)

-- Level 1: Classes
INSERT INTO public.chart_of_accounts (code, name, level, account_type, is_selectable) VALUES
('1', 'ACTIVOS', 1, 'Activo', false),
('2', 'PASIVOS', 1, 'Pasivo', false),
('3', 'PATRIMONIO', 1, 'Patrimonio', false),
('4', 'INGRESOS', 1, 'Ingreso', false),
('5', 'COSTOS Y GASTOS', 1, 'Gasto', false)
ON CONFLICT (code) DO NOTHING;

-- Level 2: Groups (Examples)
INSERT INTO public.chart_of_accounts (code, name, level, account_type, is_selectable) VALUES
('1.1', 'Activos Corrientes', 2, 'Activo', false),
('2.1', 'Pasivos Corrientes', 2, 'Pasivo', false),
('4.1', 'Ingresos Operacionales', 2, 'Ingreso', false),
('5.1', 'Costos de Explotación', 2, 'Costo', false),
('5.2', 'Gastos de Operación y Administración', 2, 'Gasto', false)
ON CONFLICT (code) DO NOTHING;

-- Level 3/4: Operational Accounts (Specifics for Elena)
INSERT INTO public.chart_of_accounts (code, name, level, account_type, is_selectable) VALUES
('1.1.1.01.00.000', 'Efectivo y Equivalentes', 4, 'Activo', false),
('1.1.1.02.01.000', 'Banco Local (CLP)', 5, 'Activo', true),
('4.1.1.01.01.000', 'Venta de Productos Atelier', 5, 'Ingreso', true),
('4.1.1.02.01.000', 'Servicios de Sastrería/Modista', 5, 'Ingreso', true),

-- Costs & Expenses (The core request)
('5.2.1.01.01.000', 'Arriendos Oficinas/Taller', 5, 'Gasto', true),
('5.2.1.01.03.000', 'Gastos Comunes', 5, 'Gasto', true),
('5.2.1.02.01.000', 'Suministro Agua Potable', 5, 'Gasto', true),
('5.2.1.02.02.000', 'Suministro Energía Eléctrica', 5, 'Gasto', true),
('5.2.1.02.03.000', 'Suministro Gas', 5, 'Gasto', true),
('5.2.1.02.04.000', 'Servicios Telecomunicaciones/Internet', 5, 'Gasto', true),
('5.2.1.04.01.000', 'Sueldos Base Personal', 5, 'Gasto', true),
('5.2.2.01.01.000', 'Publicidad y Marketing Digital', 5, 'Gasto', true)
ON CONFLICT (code) DO NOTHING;

-- SEED: Default Cost Center
INSERT INTO public.analytic_accounts (name, description) VALUES
('Taller Principal', 'Centro de costo central para producción y diseño'),
('Administración', 'Gastos generales de soporte back-office')
ON CONFLICT (name) DO NOTHING;
