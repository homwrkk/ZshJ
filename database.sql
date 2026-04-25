-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES TABLE (Multi-tenant with roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'manager', 'service_provider')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
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
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
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
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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
-- Users can read their own complaints
CREATE POLICY "Users can read own complaints" ON public.complaints
  FOR SELECT
  USING (user_id = auth.uid() OR email = auth.jwt() ->> 'email');

-- Users can insert complaints (with or without auth)
CREATE POLICY "Anyone can submit complaint" ON public.complaints
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own complaints
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
-- AUTOMATIC PROFILE CREATION ON SIGNUP (REPLACES MANUAL INSERT)
-- ============================================================================

-- Function to automatically create a profile row for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    'guest',  -- Default role is guest
    '',       -- Empty first name (to be filled in later)
    ''        -- Empty last name (to be filled in later)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMP
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
-- SAMPLE DATA FOR TESTING
-- ============================================================================
-- NOTE: User profile samples are NO LONGER included here.
-- Profiles are automatically created when users sign up via Supabase Auth.
--
-- To test with user profiles:
-- 1. Use Supabase Auth to create test users
-- 2. Profiles will be automatically created
-- 3. Update profiles via the registration flow in the app

-- Insert sample complaints (no hard-coded user_id references)
INSERT INTO public.complaints (
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  NULL,
  'John Doe',
  'john.doe@example.com',
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
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
  NULL,
  'Sarah Johnson',
  'sarah.johnson@example.com',
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
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
  NULL,
  'Michael Chen',
  'michael.chen@example.com',
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
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4',
  NULL,
  'Emma Wilson',
  'emma.wilson@example.com',
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
-- SUMMARY
-- ============================================================================
-- Tables created:
--   1. user_profiles - Stores user data with multi-tenant role support
--      - Automatically populated via trigger on user signup
--      - Foreign key constraint maintains data integrity
--   2. complaints - Stores guest complaints with tracking and status management
--
-- Automatic Profile Creation:
--   - When a new user signs up via Supabase Auth, a profile is automatically created
--   - Initial role is set to 'guest' (can be updated via app)
--   - No manual INSERT statements needed
--
-- RLS Policies:
--   - Users can manage their own data
--   - Managers have elevated access to view and update complaints
--   - Public access for complaint submission (unauthenticated guests)
--
-- Sample Data:
--   - 4 Sample complaints with various statuses and priorities
--   - User profiles are created automatically when users sign up
