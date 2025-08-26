// src/lib/supabaseServer.ts
import { cookies } from 'next/headers'
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs'
// Si tienes tipos generados por Supabase, descomenta y añade <Database>:
// import type { Database } from '@/types/supabase'

// Client para Server Components (RSC)
export const createServerSupabase = () =>
  createServerComponentClient/*<Database>*/({ cookies })

// Client para Route Handlers (app/**/route.ts)
export const createRouteSupabase = () =>
  createRouteHandlerClient/*<Database>*/({ cookies })
