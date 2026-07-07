-- Stock Management System for Premium Plan
-- This migration adds the stock_items table for inventory management

-- Create stock_items table
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pièce',
  last_restock TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_items_restaurant_id ON stock_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_stock_items_category ON stock_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_items_current_quantity ON stock_items(current_quantity);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stock_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON stock_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_items_updated_at();

-- Add comments
COMMENT ON TABLE stock_items IS 'Stock management items for Premium restaurants';
COMMENT ON COLUMN stock_items.current_quantity IS 'Current quantity in stock';
COMMENT ON COLUMN stock_items.min_quantity IS 'Minimum quantity before alert';
COMMENT ON COLUMN stock_items.last_restock IS 'Date of last restock';

-- Enable Row Level Security
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Restaurant owners can view their own stock items"
  ON stock_items FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can insert their own stock items"
  ON stock_items FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can update their own stock items"
  ON stock_items FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can delete their own stock items"
  ON stock_items FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );
