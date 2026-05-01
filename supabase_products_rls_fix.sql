-- Run this in the Supabase SQL Editor if product create/update/delete
-- still fails because products table RLS was already enabled before
-- the updated policies were added to supabase_setup.sql.

drop policy if exists "Admin can insert products" on public.products;
drop policy if exists "Admin can update products" on public.products;
drop policy if exists "Admin can delete products" on public.products;

create policy "Admin can insert products"
  on public.products for insert
  with check ((auth.jwt() ->> 'email') = 'admin@maelittleloops.com');

create policy "Admin can update products"
  on public.products for update
  using ((auth.jwt() ->> 'email') = 'admin@maelittleloops.com')
  with check ((auth.jwt() ->> 'email') = 'admin@maelittleloops.com');

create policy "Admin can delete products"
  on public.products for delete
  using ((auth.jwt() ->> 'email') = 'admin@maelittleloops.com');
