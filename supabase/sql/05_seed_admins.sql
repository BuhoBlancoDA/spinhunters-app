-- === 05_seed_admins.sql ===
INSERT INTO public.admin_users(user_id) VALUES
  ('71eb6ed3-d5af-4ebe-9867-05dba15a9fe8'),
  ('9554058b-2d02-4c33-8c0a-9f778ada4963')
ON CONFLICT DO NOTHING;