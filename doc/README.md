# Supabase Security Policies

This document explains the Row Level Security (RLS) policies used in the SpinHunters POS application and the differences between development and production environments.

## Row Level Security (RLS)

Row Level Security (RLS) is a feature in PostgreSQL that allows you to restrict which rows a user can access in a table. This is important for multi-tenant applications where different users should only see their own data.

In Supabase, RLS is enabled by default for all tables, and you need to create policies to allow access to the data.

## Development vs Production Policies

### Development Environment

In development environments, you might want to use more permissive policies to facilitate testing and debugging:

```sql
-- Example of a permissive policy for development
create policy "Allow users CRUD for authenticated"
on public.users
for all
to authenticated
using (true)
with check (true);
```

This policy allows any authenticated user to perform all operations (SELECT, INSERT, UPDATE, DELETE) on the users table.

For even more permissive access during local development, you could allow anonymous access:

```sql
-- NOT RECOMMENDED for production
create policy "Allow users CRUD for anon"
on public.users
for all
to anon
using (true)
with check (true);
```

### Production Environment

In production environments, you should use more restrictive policies to ensure data security:

```sql
-- Example of a restrictive policy for production
create policy "Allow users to select their own data"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy "Allow users to insert their own data"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

create policy "Allow users to update their own data"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

These policies ensure that users can only access, modify, or delete their own data.

## Current Implementation

The current implementation uses restrictive policies that follow the principle of least privilege:

1. Users can only read and update their own data in the `users` table, and can only insert their own profile with `id = auth.uid()`.
2. Users can only read their own memberships in the `memberships` table.
3. Only administrators (determined by the `admin_users` table and `is_admin()` function) can create, update, or delete memberships.
4. All authenticated users can read payment methods, but only administrators can create, update, or delete them.
5. Users can only read their own ledger entries, and only administrators can create, update, or delete ledger entries.

These policies ensure that users can only access their own data and cannot perform operations that should be restricted to administrators.

The SQL migration file `supabase/sql/03_schema_alignment.sql` contains the current RLS policies.

## Best Practices

1. **Never** open tables to anonymous users in production
2. Always use the principle of least privilege - grant only the permissions that are absolutely necessary
3. Test your policies thoroughly to ensure they work as expected
4. Consider using different policies for different roles (e.g., admin, user, etc.)
5. Regularly review and update your policies as your application evolves
