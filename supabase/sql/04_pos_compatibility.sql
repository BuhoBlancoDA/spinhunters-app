-- === 04_pos_compatibility.sql ===

-- 1) Columna puente para enlazar auth (NO toques users.id)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Backfill suave por email (opcional, ejecutar si Dan lo desea)
-- UPDATE public.users u
-- SET auth_user_id = au.id
-- FROM auth.users au
-- WHERE u.auth_user_id IS NULL AND lower(u.email)=lower(au.email);

-- 2) Índice parcial: una membresía ACTIVA por (user, plan)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='uniq_active_membership'
  ) THEN
    CREATE UNIQUE INDEX uniq_active_membership
      ON public.memberships (user_id, plan)
      WHERE status = 'active';
  END IF;
END$$;

-- 3) UNIQUE en payment_methods.name (solo tras limpiar duplicados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.payment_methods'::regclass
      AND conname='payment_methods_name_key'
  ) THEN
    ALTER TABLE public.payment_methods
      ADD CONSTRAINT payment_methods_name_key UNIQUE (name);
  END IF;
END$$;

-- 4) Asegurar métodos que usa el POS (no borra, solo upsert)
INSERT INTO public.payment_methods(name) VALUES
  ('Neteller'),('Skrill'),('Paypal'),('Winamax'),('Binance'),('Otros')
ON CONFLICT (name) DO NOTHING;

-- 5) Vistas con security_invoker=true (manteniendo columnas del POS)
CREATE OR REPLACE VIEW public.ledger_view
WITH (security_invoker=true) AS
SELECT 
  l.id, l.type, l.amount, l.description,
  l.product_id, p.name AS product_name,
  l.payment_method_id, pm.name AS payment_method_name,
  l.created_at, l.created_by, l.name_or_email,
  l.currency, l.payment_method_description
FROM public.ledger l
LEFT JOIN public.products p ON l.product_id = p.id
LEFT JOIN public.payment_methods pm ON l.payment_method_id = pm.id;

CREATE OR REPLACE VIEW public.memberships_view
WITH (security_invoker=true) AS
SELECT 
  m.id, m.user_id,
  u.name AS user_name, u.email AS user_email, u.alternate_email AS user_alternate_email,
  m.plan, m.status, m.ggpoker_username, m.discord_nickname, m.notes, m.eva,
  m.start_date, m.expires_at, m.created_at, m.updated_at
FROM public.memberships m
JOIN public.users u ON m.user_id = u.id;
