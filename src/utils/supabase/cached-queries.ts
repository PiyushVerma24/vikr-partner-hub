import { unstable_cache } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Fetch user profile once and cache it for 5 minutes.
 * Avoids the per-page DB round trip in checkIsAdminBoolean().
 * Cache is keyed by userId so different users get different cached values.
 */
export const getCachedProfile = (userId: string) =>
  unstable_cache(
    async () => {
      const supabaseAdmin = createAdminClient()
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('territory_code, is_admin')
        .eq('id', userId)
        .single()
      return data ?? null
    },
    ['profile', userId],
    { revalidate: 300 } // 5-minute cache — acceptable for is_admin / territory
  )()
