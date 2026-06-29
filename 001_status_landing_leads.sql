CREATE TABLE IF NOT EXISTS status_landing_leads (
  id_status_landing_lead SERIAL PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL UNIQUE,
  sort_order SMALLINT NOT NULL DEFAULT 0
);

INSERT INTO status_landing_leads (status_name, sort_order) VALUES
  ('Nuevo', 1),
  ('Contactado', 2),
  ('Convertido', 3),
  ('Descartado', 4)
ON CONFLICT (status_name) DO UPDATE SET sort_order = EXCLUDED.sort_order;

CREATE TABLE IF NOT EXISTS landing_leads (
  id_lead SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(200),
  business_type VARCHAR(50),
  client_type VARCHAR(30),
  approximate_consumption VARCHAR(100),
  service_luz BOOLEAN NOT NULL DEFAULT FALSE,
  service_gas BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT,
  invoice_file VARCHAR(255),
  extra_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  id_status_landing_lead INT NOT NULL DEFAULT 1
    REFERENCES status_landing_leads(id_status_landing_lead),
  handled_by INT REFERENCES users(id_user),
  handled_at TIMESTAMPTZ,
  notes TEXT,
  id_client INT REFERENCES clients(id_client),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_leads_source ON landing_leads(source);
CREATE INDEX IF NOT EXISTS idx_landing_leads_status ON landing_leads(id_status_landing_lead);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created ON landing_leads(created_at DESC);
