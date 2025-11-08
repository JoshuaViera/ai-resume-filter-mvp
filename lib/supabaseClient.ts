import { createClient } from '@supabase/supabase-js';

// Public client (for use in frontend components)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (for use in API routes)
export const supabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }
  
  // Create a new admin client every time to avoid issues with stale credentials
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};