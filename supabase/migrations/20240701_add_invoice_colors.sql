-- Add invoice_colors field to restaurants table for customization
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS invoice_colors JSONB DEFAULT '{"primary":"#1a1a1a","secondary":"#d4a853","text":"#1a1a1a","background":"#ffffff"}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN restaurants.invoice_colors IS 'Custom colors for invoices and receipts (JSON with primary, secondary, text, background)';