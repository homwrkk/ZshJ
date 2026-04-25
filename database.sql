-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES TABLE (Multi-tenant with roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('guest', 'manager', 'service_provider')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  room_number VARCHAR(10),
  -- Service provider fields
  service_type VARCHAR(100),
  service_category VARCHAR(50) CHECK (service_category IN ('internal', 'external')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================================================
-- COMPLAINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  room_number VARCHAR(10) NOT NULL,
  complaint_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for complaints
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_email ON public.complaints(email);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_priority ON public.complaints(priority);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid()::text = 'anon');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Managers can read all profiles (optional - for management dashboard)
CREATE POLICY "Managers can read all profiles" ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'manager'
    )
  );

-- Complaints RLS Policies
-- Authenticated users can read their own complaints
CREATE POLICY "Users can read own complaints" ON public.complaints
  FOR SELECT
  USING (user_id = auth.uid());

-- Anyone (authenticated or not) can submit complaints
CREATE POLICY "Anyone can submit complaint" ON public.complaints
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users can update their own complaints
CREATE POLICY "Users can update own complaints" ON public.complaints
  FOR UPDATE
  USING (user_id = auth.uid());

-- Managers can read all complaints
CREATE POLICY "Managers can read all complaints" ON public.complaints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'manager'
    )
  );

-- Managers can update all complaints
CREATE POLICY "Managers can update all complaints" ON public.complaints
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'manager'
    )
  );

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample guest user profile (for testing without auth)
INSERT INTO public.user_profiles (
  id, email, role, first_name, last_name, phone, room_number, created_at, updated_at
) VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'guest.demo@sheraton.com',
  'guest',
  'John',
  'Doe',
  '+1-555-0100',
  '301',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample manager user profile
INSERT INTO public.user_profiles (
  id, email, role, first_name, last_name, phone, created_at, updated_at
) VALUES (
  'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
  'manager.demo@sheraton.com',
  'manager',
  'Jane',
  'Smith',
  '+1-555-0101',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample service provider (internal)
INSERT INTO public.user_profiles (
  id, email, role, first_name, last_name, phone, service_type, service_category, created_at, updated_at
) VALUES (
  'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3',
  'maintenance.staff@sheraton.com',
  'service_provider',
  'Robert',
  'Johnson',
  '+1-555-0102',
  'Maintenance',
  'internal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample external service provider
INSERT INTO public.user_profiles (
  id, email, role, first_name, last_name, phone, service_type, service_category, created_at, updated_at
) VALUES (
  'g4g4g4g4-g4g4-g4g4-g4g4-g4g4g4g4g4g4',
  'external.vendor@plumbing.com',
  'service_provider',
  'Mike',
  'Wilson',
  '+1-555-0103',
  'Plumbing',
  'external',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample complaints
INSERT INTO public.complaints (
  id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'comp-001-uuid-0001',
  'John Doe',
  'guest.demo@sheraton.com',
  '301',
  'Maintenance Issue',
  'The air conditioning in room 301 is not working properly. The temperature control is set to 72°F but the room is still very warm. This is affecting my comfort and sleep.',
  'urgent',
  'open',
  '[]'::jsonb,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'comp-002-uuid-0002',
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '205',
  'Cleanliness',
  'The bathroom had not been properly cleaned when we checked in. There were hairs in the sink and the towels were not fresh. We immediately requested housekeeping to come clean the room.',
  'high',
  'in_progress',
  '[]'::jsonb,
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '1 hour'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'comp-003-uuid-0003',
  'Michael Chen',
  'michael.chen@email.com',
  '420',
  'Noise/Disturbance',
  'There was excessive noise coming from the adjacent room late into the evening (past midnight). Despite requesting quiet hours, the noise continued. This significantly disrupted our sleep.',
  'medium',
  'resolved',
  '[]'::jsonb,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'comp-004-uuid-0004',
  'Emma Wilson',
  'emma.wilson@email.com',
  '315',
  'Missing Items',
  'The room was missing several amenities that are typically provided: shower caps, sewing kits, and complimentary water bottles. These items are important for guest comfort.',
  'low',
  'resolved',
  '[]'::jsonb,
  NOW() - INTERVAL '18 hours',
  NOW() - INTERVAL '12 hours'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================================================

-- Create function to update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for complaints
DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Tables created:
--   1. user_profiles - Stores user data with multi-tenant role support
--   2. complaints - Stores guest complaints with tracking and status management
--
-- RLS Policies:
--   - Users can manage their own data
--   - Managers have elevated access to view and update complaints
--   - Public access for complaint submission (unauthenticated guests)
--
-- Sample Data:
--   - 1 Guest user profile
--   - 1 Manager user profile
--   - 2 Service Provider profiles (1 internal, 1 external)
--   - 4 Sample complaints with various statuses and priorities
