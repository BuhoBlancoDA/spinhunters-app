import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if the user exists in the users table
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // Check if user exists in the users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      // If user doesn't exist in the users table, create a new record
      if (!existingUser) {
        await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name || null,
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}