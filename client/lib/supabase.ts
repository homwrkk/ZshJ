import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for database
export interface UserProfile {
  id: string
  email: string
  role: 'guest' | 'manager' | 'service_provider'
  first_name: string
  last_name: string
  phone: string
  room_number?: string
  service_type?: string // for service providers
  service_category?: string // internal or external
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: string
  user_id: string
  guest_name: string
  email: string
  room_number: string
  complaint_type: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  attachments: string[]
  created_at: string
  updated_at: string
}
