-- SpinHunters App - Schema Alignment
-- This script aligns the database schema with the requirements

-- Step 1 — Extensions (ensure they exist)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2 — Types and checks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='membership_status') THEN
    CREATE TYPE membership_status AS ENUM ('pending','active','expired','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='membership_plan') THEN
    CREATE TYPE membership_plan AS ENUM ('ultimate'); -- extensible
  END IF;
END$$;

-- Alter tables to use the new types
ALTER TABLE public.memberships
  ALTER COLUMN status TYPE membership_status USING status::membership_status;

ALTER TABLE public.memberships
  ALTER COLUMN plan TYPE membership_plan USING plan::membership_plan;

-- Ledger type/categoría with check
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ledger_type_chk') THEN
    ALTER TABLE public.ledger
      ADD CONSTRAINT ledger_type_chk CHECK (type IN ('inflow','outflow'));
  END IF;
END$$;

-- Step 3 — Align public.users.id with auth.users.id
-- Remove DEFAULT and add FK constraint
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fk_auth
  FOREIGN KEY(id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4 — Indices and uniqueness constraints
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status_expires ON public.memberships(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON public.ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_membership ON public.ledger(membership_id);
CREATE INDEX IF NOT EXISTS idx_ledger_payment_method ON public.ledger(payment_method_id);

-- One active membership per (user, plan)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_active_membership'
  ) THEN
    CREATE UNIQUE INDEX uniq_active_membership
      ON public.memberships(user_id, plan)
      WHERE status='active';
  END IF;
END$$;

-- Step 5 — Secure payment_methods seeds
ALTER TABLE public.payment_methods
  ADD CONSTRAINT payment_methods_name_key UNIQUE (name);

-- Re-insert payment methods with ON CONFLICT DO NOTHING
INSERT INTO public.payment_methods(name, description) VALUES
  ('Credit Card','Payment via credit card'),
  ('Bank Transfer','Direct bank transfer'),
  ('PayPal','Payment via PayPal'),
  ('Cash','Cash payment')
ON CONFLICT (name) DO NOTHING;

-- Step 6 — Update views with security_invoker=true
CREATE OR REPLACE VIEW public.memberships_view
WITH (security_invoker=true) AS
SELECT m.id,m.user_id,u.name AS user_name,u.email AS user_email,u.alternate_email AS user_alternate_email,
       m.plan,m.status,m.ggpoker_username,m.discord_nickname,m.notes,m.eva,m.start_date,m.expires_at,
       m.created_at,m.updated_at
FROM public.memberships m
JOIN public.users u ON u.id = m.user_id;

CREATE OR REPLACE VIEW public.ledger_view
WITH (security_invoker=true) AS
SELECT l.id,l.created_at,l.updated_at,l.transaction_date,l.description,l.amount,l.type,l.category,
       l.payment_method_id,pm.name AS payment_method_name,l.user_id,u.name AS user_name,l.membership_id
FROM public.ledger l
LEFT JOIN public.payment_methods pm ON pm.id = l.payment_method_id
LEFT JOIN public.users u ON u.id = l.user_id;

-- Step 7 — Secure functions
-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Update is_admin function to use admin_users table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

-- Update update_expired_memberships function
CREATE OR REPLACE FUNCTION public.update_expired_memberships()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.memberships
     SET status='expired'
   WHERE status='active'
     AND expires_at < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Step 8 — Update RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all user data" ON public.users;
DROP POLICY IF EXISTS "Admins can update all user data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Only admins can create memberships" ON public.memberships;
DROP POLICY IF EXISTS "Only admins can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Only admins can delete memberships" ON public.memberships;
DROP POLICY IF EXISTS "All authenticated users can read payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Only admins can create payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Only admins can update payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Only admins can delete payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can read their own ledger entries" ON public.ledger;
DROP POLICY IF EXISTS "Only admins can create ledger entries" ON public.ledger;
DROP POLICY IF EXISTS "Only admins can update ledger entries" ON public.ledger;
DROP POLICY IF EXISTS "Only admins can delete ledger entries" ON public.ledger;
DROP POLICY IF EXISTS "All authenticated users can read health check" ON public.health_check;
DROP POLICY IF EXISTS "Only admins can update health check" ON public.health_check;

-- Create new policies
-- USERS
CREATE POLICY "Users can read their own data"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- MEMBERSHIPS
CREATE POLICY "Users can read their own memberships"
ON public.memberships FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());

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

-- PAYMENT METHODS
CREATE POLICY "All authenticated users can read payment methods"
ON public.payment_methods FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can create payment methods"
ON public.payment_methods FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update payment methods"
ON public.payment_methods FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete payment methods"
ON public.payment_methods FOR DELETE TO authenticated
USING (is_admin());

-- LEDGER
CREATE POLICY "Users can read their own ledger entries"
ON public.ledger FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Only admins can create ledger entries"
ON public.ledger FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update ledger entries"
ON public.ledger FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete ledger entries"
ON public.ledger FOR DELETE TO authenticated
USING (is_admin());

-- HEALTH CHECK
CREATE POLICY "All authenticated users can read health check"
ON public.health_check FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can update health check"
ON public.health_check FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());