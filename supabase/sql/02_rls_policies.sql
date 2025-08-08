-- SpinHunters App - Row Level Security Policies
-- This script sets up the RLS policies for the database tables

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is an admin
-- In a real application, you would have a more robust way to determine admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, we'll just return true for simplicity
  -- In a real application, you would check if the user has admin privileges
  -- For example, by checking a role in a separate table
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
-- Users can read their own data
CREATE POLICY "Users can read their own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can read all user data
CREATE POLICY "Admins can read all user data"
ON public.users
FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update all user data
CREATE POLICY "Admins can update all user data"
ON public.users
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Memberships table policies
-- Users can read their own memberships
CREATE POLICY "Users can read their own memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can create memberships
CREATE POLICY "Only admins can create memberships"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update memberships
CREATE POLICY "Only admins can update memberships"
ON public.memberships
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete memberships
CREATE POLICY "Only admins can delete memberships"
ON public.memberships
FOR DELETE
TO authenticated
USING (is_admin());

-- Payment methods table policies
-- All authenticated users can read payment methods
CREATE POLICY "All authenticated users can read payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (true);

-- Only admins can create payment methods
CREATE POLICY "Only admins can create payment methods"
ON public.payment_methods
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update payment methods
CREATE POLICY "Only admins can update payment methods"
ON public.payment_methods
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete payment methods
CREATE POLICY "Only admins can delete payment methods"
ON public.payment_methods
FOR DELETE
TO authenticated
USING (is_admin());

-- Ledger table policies
-- Users can read their own ledger entries
CREATE POLICY "Users can read their own ledger entries"
ON public.ledger
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- Only admins can create ledger entries
CREATE POLICY "Only admins can create ledger entries"
ON public.ledger
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update ledger entries
CREATE POLICY "Only admins can update ledger entries"
ON public.ledger
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete ledger entries
CREATE POLICY "Only admins can delete ledger entries"
ON public.ledger
FOR DELETE
TO authenticated
USING (is_admin());

-- Health check table policies
-- All authenticated users can read health check
CREATE POLICY "All authenticated users can read health check"
ON public.health_check
FOR SELECT
TO authenticated
USING (true);

-- Only admins can update health check
CREATE POLICY "Only admins can update health check"
ON public.health_check
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());