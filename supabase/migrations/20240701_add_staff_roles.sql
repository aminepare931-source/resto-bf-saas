-- Staff Management System with Roles
-- This migration adds the ability to manage staff members with different roles

-- Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cuisinier',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_members_restaurant_id ON staff_members(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_members_updated_at();

-- Add comments
COMMENT ON TABLE staff_members IS 'Staff members with different roles (admin, cuisinier, serveur, etc.)';
COMMENT ON COLUMN staff_members.role IS 'Role: admin, cuisinier, serveur, manager';
COMMENT ON COLUMN staff_members.permissions IS 'JSON object with specific permissions';

-- Enable Row Level Security
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Restaurant owners can view their own staff"
  ON staff_members FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can insert staff"
  ON staff_members FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can update their own staff"
  ON staff_members FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can delete their own staff"
  ON staff_members FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Insert default admin (the restaurant owner)
INSERT INTO staff_members (restaurant_id, user_id, name, email, role, is_active)
SELECT 
  r.id,
  r.user_id,
  COALESCE(u.raw_user_meta_data->>'name', u.email, 'Admin'),
  u.email,
  'admin',
  true
FROM restaurants r
JOIN auth.users u ON u.id = r.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM staff_members WHERE restaurant_id = r.id AND role = 'admin'
);