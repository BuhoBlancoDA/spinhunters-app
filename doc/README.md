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

The current implementation uses policies that allow authenticated users to perform all operations on the users and memberships tables. This is suitable for the current stage of development but should be reviewed and tightened before deploying to production.

The SQL migration file `supabase/migrations/20240619_rls_memberships_users.sql` contains the current RLS policies.

## Best Practices

1. **Never** open tables to anonymous users in production
2. Always use the principle of least privilege - grant only the permissions that are absolutely necessary
3. Test your policies thoroughly to ensure they work as expected
4. Consider using different policies for different roles (e.g., admin, user, etc.)
5. Regularly review and update your policies as your application evolves