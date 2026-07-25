-- Add public_site_url column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS public_site_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN restaurants.public_site_url IS 'Custom public URL override for the restaurant website (used for QR codes)';