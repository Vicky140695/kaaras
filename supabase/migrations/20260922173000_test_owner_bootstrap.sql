-- Temporary test-owner bootstrap.
-- Remove this migration's trigger/function before customer handover.
-- Production should use an explicitly provisioned admin account and MFA/OTP.

create or replace function private.assign_test_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.phone = '+918778839633' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function private.assign_test_owner_admin() from public;

drop trigger if exists trg_assign_test_owner_admin on auth.users;
create trigger trg_assign_test_owner_admin
after insert on auth.users
for each row execute function private.assign_test_owner_admin();
