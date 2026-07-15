-- Table de configuration des moyens de paiement par restaurant
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  icon TEXT,
  phone_number TEXT,
  instructions TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, method)
);

-- RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les propriétaires peuvent gérer leurs méthodes"
  ON payment_methods FOR ALL
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE user_id = auth.uid()
  ));

-- Insérer les méthodes par défaut pour les restaurants existants
INSERT INTO payment_methods (restaurant_id, method, label, enabled, sort_order)
SELECT 
  r.id,
  m.method,
  m.label,
  true,
  m.sort_order
FROM restaurants r
CROSS JOIN (
  VALUES 
    ('orange_money', 'Orange Money', 1),
    ('moov_money', 'Moov Money', 2),
    ('cash', 'Espèces', 3),
    ('wave', 'Wave', 4)
) AS m(method, label, sort_order)
ON CONFLICT (restaurant_id, method) DO NOTHING;