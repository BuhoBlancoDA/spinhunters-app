-- SpinHunters App - Initial Database Schema
-- This script creates all the necessary tables, views, functions, and triggers for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    alternate_email TEXT
);

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    plan TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    ggpoker_username TEXT,
    discord_nickname TEXT,
    notes TEXT,
    eva BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    payment_method_id UUID REFERENCES public.payment_methods(id),
    user_id UUID REFERENCES public.users(id),
    membership_id UUID REFERENCES public.memberships(id)
);

CREATE TABLE IF NOT EXISTS public.health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'ok',
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views
CREATE OR REPLACE VIEW public.memberships_view 
WITH (security_invoker=true)
AS
SELECT 
    m.id,
    m.user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.alternate_email AS user_alternate_email,
    m.plan,
    m.status,
    m.ggpoker_username,
    m.discord_nickname,
    m.notes,
    m.eva,
    m.start_date,
    m.expires_at,
    m.created_at,
    m.updated_at
FROM 
    public.memberships m
JOIN 
    public.users u ON m.user_id = u.id;

CREATE OR REPLACE VIEW public.ledger_view 
AS
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
    public.ledger l
LEFT JOIN 
    public.payment_methods pm ON l.payment_method_id = pm.id
LEFT JOIN 
    public.users u ON l.user_id = u.id;

-- Create functions
CREATE OR REPLACE FUNCTION update_expired_memberships()
RETURNS void AS $$
BEGIN
  UPDATE memberships
  SET status = 'expired'
  WHERE expires_at < CURRENT_DATE
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_updated_at
BEFORE UPDATE ON public.ledger
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment methods
INSERT INTO public.payment_methods (name, description)
VALUES 
    ('Credit Card', 'Payment via credit card'),
    ('Bank Transfer', 'Direct bank transfer'),
    ('PayPal', 'Payment via PayPal'),
    ('Cash', 'Cash payment');