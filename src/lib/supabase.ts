import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  notification_email?: string;
  email_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'work' | 'personal' | 'health' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}
