# POS Compatibility

This document explains the compatibility considerations between the SpinHunters App and the existing POS system that shares the same Supabase database.

## Database Compatibility Decisions

### Type Compatibility

- We maintain `ledger.type` as TEXT with values 'income'/'expense' instead of converting to ENUM or using 'inflow'/'outflow'.
- We maintain `memberships.status` and `memberships.plan` as TEXT with CHECK constraints instead of converting to ENUM types.

### Extra Columns

- We preserve all extra columns used by the POS system in the database tables.
- The ledger table includes additional columns like `currency`, `payment_method_description`, etc. that are used by the POS.

### User ID Alignment

- We use `auth_user_id` as a bridge column in `public.users` to link with `auth.users.id` instead of enforcing a direct foreign key constraint.
- This approach is necessary because there are currently 35 misaligned user records between the two tables.

## SQL Migration Execution

- Dan will execute the SQL migration files manually in Supabase (first in staging, then in production).
- The migration files are designed to be idempotent and compatible with the existing POS system.

## Verification Queries

### Check for Duplicate Payment Methods

```sql
SELECT lower(name) AS key, COUNT(*), array_agg(id) AS ids
FROM public.payment_methods
GROUP BY lower(name)
HAVING COUNT(*) > 1;
```

If duplicates are found, use the following procedure to resolve them:

```sql
-- Example for a key 'paypal' (substitute for each problematic key)
-- 1) Identify the id to preserve:
WITH cand AS (
  SELECT id FROM public.payment_methods WHERE lower(name)='paypal' ORDER BY created_at ASC LIMIT 1
),
dups AS (
  SELECT id FROM public.payment_methods WHERE lower(name)='paypal' AND id <> (SELECT id FROM cand)
)
UPDATE public.ledger l
SET payment_method_id = (SELECT id FROM cand)
WHERE l.payment_method_id IN (SELECT id FROM dups);

-- 2) Delete remaining duplicates:
DELETE FROM public.payment_methods
WHERE lower(name)='paypal'
  AND id NOT IN (SELECT id FROM cand);
```

### Check for Misaligned Users

```sql
SELECT COUNT(*) AS misaligned
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
WHERE au.id IS NULL;
```

This query identifies users in `public.users` that don't have a corresponding entry in `auth.users` with the same ID.