-- Provision the Kaaras owner account as the dashboard admin.
-- Run this migration after the owner account has been created in Supabase Auth.

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('vigneshkumar95eee@gmail.com')
on conflict (user_id, role) do nothing;
