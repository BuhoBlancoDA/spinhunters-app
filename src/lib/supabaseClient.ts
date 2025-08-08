import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Create a Supabase client for use in the browser
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// For direct use in components
export const supabase = createClient()