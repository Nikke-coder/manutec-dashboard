CREATE TABLE IF NOT EXISTS manutec_pnl (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  line_item TEXT NOT NULL,
  month_index INT NOT NULL,
  value NUMERIC(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, line_item, month_index)
);
ALTER TABLE manutec_pnl ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON manutec_pnl FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE manutec_pnl;
