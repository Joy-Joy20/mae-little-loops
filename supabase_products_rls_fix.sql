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
