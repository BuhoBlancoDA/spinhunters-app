# Archived Files

This directory contains files that have been archived because they are incompatible with the current POS system or pose security risks.

## Archived SQL Files

### 02_rls_policies.sql

This file was archived because it contains an insecure implementation of the `is_admin()` function that returns `TRUE` for all users, which is a security risk.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, we'll just return true for simplicity
  -- In a real application, you would check if the user has admin privileges
  -- For example, by checking a role in a separate table
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 03_schema_alignment.sql

This file was archived because it contains several patterns that are incompatible with the existing POS system:

1. Creates ENUM types for `membership_status` and `membership_plan`, which conflicts with the POS system that uses TEXT types with CHECK constraints.

```sql
CREATE TYPE membership_status AS ENUM ('pending','active','expired','cancelled');
CREATE TYPE membership_plan AS ENUM ('ultimate');
```

2. Alters `memberships.status` and `memberships.plan` to use these ENUM types, which would break compatibility with the POS system.

```sql
ALTER TABLE public.memberships
  ALTER COLUMN status TYPE membership_status USING status::membership_status;

ALTER TABLE public.memberships
  ALTER COLUMN plan TYPE membership_plan USING plan::membership_plan;
```

3. Adds a CHECK constraint that only allows 'inflow'/'outflow' for `ledger.type`, which conflicts with the POS system that uses 'income'/'expense'.

```sql
ALTER TABLE public.ledger
  ADD CONSTRAINT ledger_type_chk CHECK (type IN ('inflow','outflow'));
```

4. Imposes a FK constraint from `public.users(id)` to `auth.users(id)`, which is not appropriate because there are currently 35 misaligned user records.

```sql
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fk_auth
  FOREIGN KEY(id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## Compatibility with POS System

The current approach is to maintain compatibility with the existing POS system by:

1. Using TEXT types for `memberships.plan` and `memberships.status` with CHECK constraints instead of ENUM types.
2. Maintaining `ledger.type` as TEXT with values 'income'/'expense' instead of 'inflow'/'outflow'.
3. Using `auth_user_id` as a bridge column in `public.users` to link with `auth.users(id)` instead of enforcing a direct foreign key constraint.

For more details, see the [POS Compatibility documentation](../doc/POS_COMPATIBILITY.md).