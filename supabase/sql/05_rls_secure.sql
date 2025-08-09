-- === 05_rls_secure.sql ===
-- 🔒 Limpieza total de policies previas (evita conflictos por nombres distintos)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT pol.polname
           FROM pg_policy pol
           JOIN pg_class c ON c.oid = pol.polrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname='public' AND c.relname='users'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.polname); END LOOP;

  FOR r IN SELECT pol.polname
           FROM pg_policy pol
           JOIN pg_class c ON c.oid = pol.polrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname='public' AND c.relname='memberships'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.memberships', r.polname); END LOOP;

  FOR r IN SELECT pol.polname
           FROM pg_policy pol
           JOIN pg_class c ON c.oid = pol.polrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname='public' AND c.relname='payment_methods'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.payment_methods', r.polname); END LOOP;

  FOR r IN SELECT pol.polname
           FROM pg_policy pol
           JOIN pg_class c ON c.oid = pol.polrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname='public' AND c.relname='ledger'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.ledger', r.polname); END LOOP;

  FOR r IN SELECT pol.polname
           FROM pg_policy pol
           JOIN pg_class c ON c.oid = pol.polrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname='public' AND c.relname='membership_periods'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.membership_periods', r.polname); END LOOP;
END$$;
-- Admins seguros
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_periods ENABLE ROW LEVEL SECURITY;

-- USERS
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can read their own data"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = auth_user_id OR is_admin());

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = auth_user_id OR is_admin())
WITH CHECK (auth.uid() = auth_user_id OR is_admin());

CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- MEMBERSHIPS
DROP POLICY IF EXISTS "Users can read their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Only admins can create memberships" ON public.memberships;
DROP POLICY IF EXISTS "Only admins can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Only admins can delete memberships" ON public.memberships;

CREATE POLICY "Users can read their own memberships"
ON public.memberships FOR SELECT TO authenticated
USING (
  is_admin() OR
  auth.uid() = (
    SELECT u.auth_user_id FROM public.users u WHERE u.id = user_id
  )
);

CREATE POLICY "Only admins can create memberships"
ON public.memberships FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update memberships"
ON public.memberships FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete memberships"
ON public.memberships FOR DELETE TO authenticated
USING (is_admin());

-- PAYMENT METHODS (solo lectura para autenticados)
DROP POLICY IF EXISTS "All authenticated users can read payment methods" ON public.payment_methods;
CREATE POLICY "All authenticated users can read payment methods"
ON public.payment_methods FOR SELECT TO authenticated
USING (true);

-- LEDGER (cerrado para usuarios; solo admin)
DROP POLICY IF EXISTS "Users can read their own ledger entries" ON public.ledger;
CREATE POLICY "Only admins can read ledger"
ON public.ledger FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Only admins can create ledger entries" ON public.ledger;
CREATE POLICY "Only admins can create ledger entries"
ON public.ledger FOR INSERT TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Only admins can update ledger entries" ON public.ledger;
CREATE POLICY "Only admins can update ledger entries"
ON public.ledger FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Only admins can delete ledger entries" ON public.ledger;
CREATE POLICY "Only admins can delete ledger entries"
ON public.ledger FOR DELETE TO authenticated
USING (is_admin());

 -- MEMBERSHIP_PERIODS (RLS ya está habilitada arriba)
DROP POLICY IF EXISTS "Admins can read membership periods" ON public.membership_periods;
DROP POLICY IF EXISTS "Admins can insert membership periods" ON public.membership_periods;

CREATE POLICY "Admins can read membership periods"
ON public.membership_periods FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Admins can insert membership periods"
ON public.membership_periods FOR INSERT TO authenticated
WITH CHECK (is_admin());
