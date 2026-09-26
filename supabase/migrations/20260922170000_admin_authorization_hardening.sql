-- Harden admin authorization without exposing a user-id based role checker.
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'::public.app_role
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Replace admin table policies so they use the current authenticated user only.
drop policy if exists "Admins can view all products" on public.jewellery_products;
drop policy if exists "Admins can insert products" on public.jewellery_products;
drop policy if exists "Admins can update products" on public.jewellery_products;
drop policy if exists "Admins can delete products" on public.jewellery_products;
create policy "Admins can view all products" on public.jewellery_products for select to authenticated using (private.is_admin());
create policy "Admins can insert products" on public.jewellery_products for insert to authenticated with check (private.is_admin());
create policy "Admins can update products" on public.jewellery_products for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can delete products" on public.jewellery_products for delete to authenticated using (private.is_admin());

drop policy if exists "Admins can view all services" on public.site_services;
drop policy if exists "Admins can insert services" on public.site_services;
drop policy if exists "Admins can update services" on public.site_services;
drop policy if exists "Admins can delete services" on public.site_services;
create policy "Admins can view all services" on public.site_services for select to authenticated using (private.is_admin());
create policy "Admins can insert services" on public.site_services for insert to authenticated with check (private.is_admin());
create policy "Admins can update services" on public.site_services for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can delete services" on public.site_services for delete to authenticated using (private.is_admin());

drop policy if exists "Admins can view all offers" on public.site_offers;
drop policy if exists "Admins can insert offers" on public.site_offers;
drop policy if exists "Admins can update offers" on public.site_offers;
drop policy if exists "Admins can delete offers" on public.site_offers;
create policy "Admins can view all offers" on public.site_offers for select to authenticated using (private.is_admin());
create policy "Admins can insert offers" on public.site_offers for insert to authenticated with check (private.is_admin());
create policy "Admins can update offers" on public.site_offers for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can delete offers" on public.site_offers for delete to authenticated using (private.is_admin());

drop policy if exists "Admins can delete site images" on public.site_images;
drop policy if exists "Admins can insert site images" on public.site_images;
drop policy if exists "Admins can update site images" on public.site_images;
create policy "Admins can delete site images" on public.site_images for delete to authenticated using (private.is_admin());
create policy "Admins can insert site images" on public.site_images for insert to authenticated with check (private.is_admin());
create policy "Admins can update site images" on public.site_images for update to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Admins can view all gallery images" on public.gallery_images;
drop policy if exists "Admins can insert gallery images" on public.gallery_images;
drop policy if exists "Admins can update gallery images" on public.gallery_images;
drop policy if exists "Admins can delete gallery images" on public.gallery_images;
create policy "Admins can view all gallery images" on public.gallery_images for select to authenticated using (private.is_admin());
create policy "Admins can insert gallery images" on public.gallery_images for insert to authenticated with check (private.is_admin());
create policy "Admins can update gallery images" on public.gallery_images for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can delete gallery images" on public.gallery_images for delete to authenticated using (private.is_admin());

drop policy if exists "Admins can view all price categories" on public.price_categories;
drop policy if exists "Admins can insert price categories" on public.price_categories;
drop policy if exists "Admins can update price categories" on public.price_categories;
drop policy if exists "Admins can delete price categories" on public.price_categories;
create policy "Admins can view all price categories" on public.price_categories for select to authenticated using (private.is_admin());
create policy "Admins can insert price categories" on public.price_categories for insert to authenticated with check (private.is_admin());
create policy "Admins can update price categories" on public.price_categories for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can delete price categories" on public.price_categories for delete to authenticated using (private.is_admin());

drop policy if exists "Admins can view all price items" on public.price_items;
drop policy if exists "Admins can insert price items" on public.price_items;
drop policy if exists "Admins can update price items" on public.price_items;
drop policy if exists "Admins can delete price items" on public.price_items;
create policy "Admins can view all price items" on public.price_items for select to authenticated using (private.is_admin());
create policy "Admins can insert price items" on public.price_items for insert to authenticated with check (private.is_admin());
create policy "Admins can update price items" on public.price_items for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can delete price items" on public.price_items for delete to authenticated using (private.is_admin());

-- Storage follows the same authorization model and has explicit UPDATE checks.
drop policy if exists "Admins can delete jewellery images" on storage.objects;
drop policy if exists "Admins can delete site media" on storage.objects;
drop policy if exists "Admins can update jewellery images" on storage.objects;
drop policy if exists "Admins can update site media" on storage.objects;
drop policy if exists "Admins can upload jewellery images" on storage.objects;
drop policy if exists "Admins can upload site media" on storage.objects;
create policy "Admins can delete jewellery images" on storage.objects for delete to authenticated using (bucket_id = 'jewellery' and private.is_admin());
create policy "Admins can delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and private.is_admin());
create policy "Admins can update jewellery images" on storage.objects for update to authenticated using (bucket_id = 'jewellery' and private.is_admin()) with check (bucket_id = 'jewellery' and private.is_admin());
create policy "Admins can update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and private.is_admin()) with check (bucket_id = 'site-media' and private.is_admin());
create policy "Admins can upload jewellery images" on storage.objects for insert to authenticated with check (bucket_id = 'jewellery' and private.is_admin());
create policy "Admins can upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and private.is_admin());

revoke execute on function public.has_role(uuid, public.app_role) from authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
