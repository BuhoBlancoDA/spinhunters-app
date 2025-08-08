import 'server-only'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

// Create a Supabase client for use in server components
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// User-related API functions
export async function getCurrentUser() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return null
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
    
  return user
}

// Membership-related API functions
export async function getUserMembership(userId: string) {
  const supabase = createServerClient()
  
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
    
  return membership
}

// Admin-related API functions
export async function searchUserByEmail(email: string) {
  const supabase = createServerClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .ilike('email', `%${email}%`)
    .limit(1)
    .single()
    
  return user
}

export async function getUserMemberships(userId: string) {
  const supabase = createServerClient()
  
  const { data: memberships } = await supabase
    .from('memberships_view')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    
  return memberships || []
}