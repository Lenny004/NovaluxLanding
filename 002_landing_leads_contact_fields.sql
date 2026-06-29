-- Campos ampliados del formulario de contacto (consumo, servicios, tipo cliente, factura).
-- Ejecutar en bases que ya tengan landing_leads creada con 001_status_landing_leads.sql.

ALTER TABLE landing_leads
  ADD COLUMN IF NOT EXISTS client_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS approximate_consumption VARCHAR(100),
  ADD COLUMN IF NOT EXISTS service_luz BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS service_gas BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS invoice_file VARCHAR(255);
