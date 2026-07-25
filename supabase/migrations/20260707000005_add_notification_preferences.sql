-- Ajouter les preferences de notification
-- Permet a l'admin de choisir comment recevoir les notifications

ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS notification_orders_channel TEXT DEFAULT 'both' 
  CHECK (notification_orders_channel IN ('admin', 'whatsapp', 'both')),
  ADD COLUMN IF NOT EXISTS notification_reservations_channel TEXT DEFAULT 'both' 
  CHECK (notification_reservations_channel IN ('admin', 'whatsapp', 'both'));

CREATE INDEX IF NOT EXISTS idx_restaurants_notification_orders 
  ON restaurants(notification_orders_channel);
CREATE INDEX IF NOT EXISTS idx_restaurants_notification_reservations 
  ON restaurants(notification_reservations_channel);