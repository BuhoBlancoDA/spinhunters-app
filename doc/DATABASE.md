# Database Structure and Schema

This document provides detailed information about the database structure and schema used in the SpinHunters POS application.

## Table of Contents

1. [Overview](#overview)
2. [Tables](#tables)
3. [Views](#views)
4. [Relationships](#relationships)
5. [Functions and Triggers](#functions-and-triggers)
6. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)

## Overview

The SpinHunters POS application uses a PostgreSQL database hosted on Supabase. The database schema is designed to support the following core functionalities:

- User management
- Membership tracking
- Financial ledger
- Product inventory
- Health checks

## Tables

### users

Stores information about users of the system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| created_at | timestamp with time zone | Creation timestamp, auto-generated |
| updated_at | timestamp with time zone | Last update timestamp |
| email | text | User's email address |
| name | text | User's full name |
| phone | text | User's phone number |
| address | text | User's address |
| notes | text | Additional notes about the user |
| auth_user_id | uuid | Bridge column that references auth.users.id (nullable) |

### memberships

Tracks memberships associated with users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| created_at | timestamp with time zone | Creation timestamp, auto-generated |
| updated_at | timestamp with time zone | Last update timestamp |
| user_id | uuid | Foreign key to users.id |
| plan | text | Membership plan type (TEXT with CHECK constraint, compatible with POS) |
| start_date | date | Start date of the membership |
| expires_at | date | Expiration date of the membership |
| status | text | Current status (TEXT with CHECK constraint: 'pending', 'active', 'expired', 'cancelled') |
| payment_method_id | uuid | Foreign key to payment_methods.id |
| amount | numeric | Amount paid for the membership |

### products

Stores information about products available for sale.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| created_at | timestamp with time zone | Creation timestamp, auto-generated |
| updated_at | timestamp with time zone | Last update timestamp |
| name | text | Product name |
| description | text | Product description |
| price | numeric | Product price |
| category | text | Product category |
| sku | text | Stock keeping unit |
| inventory_count | integer | Current inventory count |

### payment_methods

Stores available payment methods.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| created_at | timestamp with time zone | Creation timestamp, auto-generated |
| name | text | Payment method name |
| description | text | Payment method description |
| is_active | boolean | Whether the payment method is active |

### ledger

Records financial transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| created_at | timestamp with time zone | Creation timestamp, auto-generated |
| updated_at | timestamp with time zone | Last update timestamp |
| transaction_date | date | Date of the transaction |
| description | text | Transaction description |
| amount | numeric | Transaction amount |
| type | text | Transaction type (values: 'income', 'expense', maintained for POS compatibility) |
| category | text | Transaction category |
| payment_method_id | uuid | Foreign key to payment_methods.id |
| user_id | uuid | Foreign key to users.id (optional) |
| membership_id | uuid | Foreign key to memberships.id (optional) |
| currency | text | Currency of the transaction (default: 'EUR') |
| payment_method_description | text | Description of the payment method |
| product_id | uuid | Foreign key to products.id (optional) |
| created_by | uuid | Foreign key to auth.users.id (optional) |
| name_or_email | text | Name or email of the user related to the transaction |

### health_check

Simple table for checking database connectivity.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key, auto-incremented |
| ok | boolean | Always true, for connectivity checks |

### admin_users

Table that stores users with administrator privileges.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key, reference to auth.users.id |

### membership_periods

Table that stores the history of membership periods.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| membership_id | uuid | Foreign key to memberships.id |
| start_date | timestamptz | Start date of the period |
| end_date | timestamptz | End date of the period |
| plan | text | Membership plan type |
| created_at | timestamptz | Creation timestamp, auto-generated |

## Views

### memberships_view

A view that joins the `memberships` and `users` tables to provide a comprehensive view of memberships with user information.

```sql
CREATE VIEW memberships_view AS
SELECT 
  m.id,
  m.created_at,
  m.updated_at,
  m.user_id,
  u.name as user_name,
  u.email as user_email,
  m.plan,
  m.start_date,
  m.expires_at,
  m.status,
  m.payment_method_id,
  m.amount
FROM 
  memberships m
JOIN 
  users u ON m.user_id = u.id;
```

### ledger_view

A view that joins the `ledger`, `users`, and `payment_methods` tables to provide a comprehensive view of financial transactions.

```sql
CREATE VIEW ledger_view AS
SELECT 
  l.id,
  l.type,
  l.amount,
  l.description,
  l.product_id,
  p.name AS product_name,
  l.payment_method_id,
  pm.name AS payment_method_name,
  l.created_at,
  l.created_by,
  l.name_or_email,
  l.currency,
  l.payment_method_description,
  l.transaction_date,
  l.category,
  l.user_id,
  u.name AS user_name,
  l.membership_id
FROM 
  ledger l
LEFT JOIN 
  products p ON l.product_id = p.id
LEFT JOIN 
  payment_methods pm ON l.payment_method_id = pm.id
LEFT JOIN 
  users u ON l.user_id = u.id;
```

## Relationships

- `memberships.user_id` → `users.id` (Many-to-One)
- `memberships.payment_method_id` → `payment_methods.id` (Many-to-One)
- `ledger.payment_method_id` → `payment_methods.id` (Many-to-One)
- `ledger.user_id` → `users.id` (Many-to-One)
- `ledger.membership_id` → `memberships.id` (Many-to-One)
- `ledger.product_id` → `products.id` (Many-to-One)
- `ledger.created_by` → `auth.users.id` (Many-to-One)
- `membership_periods.membership_id` → `memberships.id` (Many-to-One)
- `admin_users.user_id` → `auth.users.id` (One-to-One)
- `users.auth_user_id` → `auth.users.id` (One-to-One, bridge column for linking with auth)

## Functions and Triggers

### update_expired_memberships

A function that automatically updates the status of expired memberships and returns the number of rows updated.

```sql
CREATE OR REPLACE FUNCTION update_expired_memberships()
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
```

### is_admin

A function that determines if the current user has administrator privileges by checking the `admin_users` table.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;
```

### update_updated_at_column

A function that automatically updates the `updated_at` column whenever a row is updated.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Triggers for this function:

```sql
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON memberships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_updated_at
BEFORE UPDATE ON ledger
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### record_membership_period

A function and trigger that automatically records membership periods when a membership is updated.

```sql
CREATE OR REPLACE FUNCTION record_membership_period()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status = 'active' AND NEW.status != 'active') OR
     OLD.plan != NEW.plan OR
     OLD.start_date != NEW.start_date OR
     OLD.expires_at != NEW.expires_at THEN
    INSERT INTO public.membership_periods (membership_id, start_date, end_date, plan)
    VALUES (OLD.id, OLD.start_date, OLD.expires_at, OLD.plan);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_membership_period_on_update
BEFORE UPDATE ON memberships
FOR EACH ROW
WHEN (OLD.status = 'active')
EXECUTE FUNCTION record_membership_period();
```

## Row Level Security (RLS) Policies

The database uses Row Level Security (RLS) to control access to data at the row level. Below are the current RLS policies:

### users Table

```sql
-- Users can read their own data or admins can read all
CREATE POLICY "Users can read their own data"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = auth_user_id OR is_admin());

-- Users can update their own data or admins can update all
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = auth_user_id OR is_admin())
WITH CHECK (auth.uid() = auth_user_id OR is_admin());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());
```

### memberships Table

```sql
-- Users can read their own memberships or admins can read all
CREATE POLICY "Users can read their own memberships"
ON public.memberships FOR SELECT TO authenticated
USING (
  is_admin() OR
  auth.uid() = (
    SELECT u.auth_user_id FROM public.users u WHERE u.id = user_id
  )
);

-- Only admins can create memberships
CREATE POLICY "Only admins can create memberships"
ON public.memberships FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Only admins can update memberships
CREATE POLICY "Only admins can update memberships"
ON public.memberships FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete memberships
CREATE POLICY "Only admins can delete memberships"
ON public.memberships FOR DELETE TO authenticated
USING (is_admin());
```

### payment_methods Table

```sql
-- All authenticated users can read payment methods
CREATE POLICY "All authenticated users can read payment methods"
ON public.payment_methods FOR SELECT TO authenticated
USING (true);

-- Only admins can create payment methods
CREATE POLICY "Only admins can create payment methods"
ON public.payment_methods FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Only admins can update payment methods
CREATE POLICY "Only admins can update payment methods"
ON public.payment_methods FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete payment methods
CREATE POLICY "Only admins can delete payment methods"
ON public.payment_methods FOR DELETE TO authenticated
USING (is_admin());
```

### ledger Table

```sql
-- Users can read their own ledger entries or admins can read all
CREATE POLICY "Users can read their own ledger entries"
ON public.ledger FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Only admins can create ledger entries
CREATE POLICY "Only admins can create ledger entries"
ON public.ledger FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Only admins can update ledger entries
CREATE POLICY "Only admins can update ledger entries"
ON public.ledger FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete ledger entries
CREATE POLICY "Only admins can delete ledger entries"
ON public.ledger FOR DELETE TO authenticated
USING (is_admin());
```

### health_check Table

```sql
-- All authenticated users can read health check
CREATE POLICY "All authenticated users can read health check"
ON public.health_check FOR SELECT TO authenticated
USING (true);

-- Only admins can update health check
CREATE POLICY "Only admins can update health check"
ON public.health_check FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

### products Table

```sql
-- All authenticated users can read products
CREATE POLICY "All authenticated users can read products"
ON public.products FOR SELECT TO authenticated
USING (true);

-- Only admins can create products
CREATE POLICY "Only admins can create products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Only admins can update products
CREATE POLICY "Only admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete products
CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (is_admin());
```

### membership_periods Table

```sql
-- Users can read their own membership periods or admins can read all
CREATE POLICY "Users can read their own membership periods"
ON public.membership_periods FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.id = membership_id AND (auth.uid() = m.user_id OR is_admin())
  )
);

-- Only admins can create membership periods
CREATE POLICY "Only admins can create membership periods"
ON public.membership_periods FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Only admins can update membership periods
CREATE POLICY "Only admins can update membership periods"
ON public.membership_periods FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete membership periods
CREATE POLICY "Only admins can delete membership periods"
ON public.membership_periods FOR DELETE TO authenticated
USING (is_admin());
```
