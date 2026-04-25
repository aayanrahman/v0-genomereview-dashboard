import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Admin client for server-side operations without RLS
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Alias for consistency across codebase
export const createClient = createAdminClient
