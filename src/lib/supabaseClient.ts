// src/lib/supabaseClient.ts
import { createClientComponentClient, createClient as _createClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase' // si lo tienes tipado; si no, quita el genérico

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  // Lanzamos un error claro en dev
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local'
  )
}

export const createClient = () => {
  // Auth-helpers ya consumen las env NEXT_PUBLIC_* automáticamente,
  // pero dejamos el guard por claridad de error.
  return createClientComponentClient<Database>()
}
