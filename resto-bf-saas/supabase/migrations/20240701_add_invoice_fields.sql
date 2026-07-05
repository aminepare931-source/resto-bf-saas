-- Add missing fields to invoices table for better billing
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS table_number TEXT,
ADD COLUMN IF NOT EXISTS waiter TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN invoices.payment_method IS 'Payment method used (Espèces, Mobile Money, Carte bancaire, Virement)';
COMMENT ON COLUMN invoices.table_number IS 'Table number for restaurant orders';
COMMENT ON COLUMN invoices.waiter IS 'Waiter/waitress name who served the order';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant_id ON invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at);