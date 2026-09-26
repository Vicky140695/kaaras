-- Kaaras owner admin provisioning
-- Run once in Supabase SQL Editor after creating the owner account.

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('vigneshkumar95eee@gmail.com')
on conflict (user_id, role) do nothing;

-- Verify the account now has the admin role:
select u.email, ur.role
from auth.users u
join public.user_roles ur on ur.user_id = u.id
where lower(u.email) = lower('vigneshkumar95eee@gmail.com');
