-- Add PIN and QR code token to staff_members
ALTER TABLE staff_members 
ADD COLUMN IF NOT EXISTS pin TEXT,
ADD COLUMN IF NOT EXISTS qr_code_token TEXT UNIQUE;

-- Create index for QR code token
CREATE INDEX IF NOT EXISTS idx_staff_members_qr_code_token ON staff_members(qr_code_token);

-- Add comment
COMMENT ON COLUMN staff_members.pin IS '4-digit PIN for quick login';
COMMENT ON COLUMN staff_members.qr_code_token IS 'Unique token for QR code login';