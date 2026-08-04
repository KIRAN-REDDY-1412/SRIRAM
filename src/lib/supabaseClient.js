import { createClient } from '@supabase/supabase-js';

// Read Supabase environment variables from Vite .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

console.log('🔗 [PharmDVerse Supabase Client] Initialized with URL:', supabaseUrl);

// Create and export Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
