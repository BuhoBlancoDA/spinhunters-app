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

### memberships

Tracks memberships associated with users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| created_at | timestamp with time zone | Creation timestamp, auto-generated |
| updated_at | timestamp with time zone | Last update timestamp |
| user_id | uuid | Foreign key to users.id |
| plan | text | Membership plan type |
| start_date | date | Start date of the membership |
| expires_at | date | Expiration date of the membership |
| status | text | Current status (active, expired, cancelled) |
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
| type | text | Transaction type (income, expense) |
| category | text | Transaction category |
| payment_method_id | uuid | Foreign key to payment_methods.id |
| user_id | uuid | Foreign key to users.id (optional) |
| membership_id | uuid | Foreign key to memberships.id (optional) |

### health_check

Simple table for checking database connectivity.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key, auto-incremented |
| ok | boolean | Always true, for connectivity checks |

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
  l.created_at,
  l.updated_at,
  l.transaction_date,
  l.description,
  l.amount,
  l.type,
  l.category,
  l.payment_method_id,
  pm.name as payment_method_name,
  l.user_id,
  u.name as user_name,
  l.membership_id
FROM 
  ledger l
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

## Functions and Triggers

### update_expired_memberships

A function that automatically updates the status of expired memberships.

```sql
CREATE OR REPLACE FUNCTION update_expired_memberships()
RETURNS void AS $$
BEGIN
  UPDATE memberships
  SET status = 'expired'
  WHERE expires_at < CURRENT_DATE
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;
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

## Row Level Security (RLS) Policies

The database uses Row Level Security (RLS) to control access to data at the row level. Below are the current RLS policies:

### users Table

```sql
-- Allow authenticated users to perform all operations on their own data
CREATE POLICY "Allow users CRUD for authenticated"
ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### memberships Table

```sql
-- Allow authenticated users to perform all operations on memberships
CREATE POLICY "Allow memberships CRUD for authenticated"
ON public.memberships
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

For production environments, it is recommended to use more restrictive policies. See the [Security Policies](README.md) document for more information.