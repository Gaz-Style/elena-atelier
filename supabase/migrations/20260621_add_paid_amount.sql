-- Agregar columnas para registrar abonos y saldos pendientes

ALTER TABLE sales_ledger
ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE production_orders
ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
