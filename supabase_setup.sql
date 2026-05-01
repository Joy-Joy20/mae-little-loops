-- ============================================================
-- Mae Little Loops Studio — Supabase Setup
-- Run this first in Supabase SQL Editor
-- ============================================================

-- USERS TABLE (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now()
);

-- PRODUCTS TABLE
create table if not exists public.products (
  id serial primary key,
  name text not null,
  price numeric(10, 2) not null,
  category text not null check (category in ('bouquet', 'keychain')),
  image_url text,
  description text,
  stock int default 0,
  created_at timestamp with time zone default now()
);

-- ORDERS TABLE
create table if not exists public.orders (
  id serial primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  total_amount numeric(10, 2) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default now()
);

-- ORDER ITEMS TABLE
create table if not exists public.order_items (
  id serial primary key,
  order_id int references public.orders(id) on delete cascade,
  product_name text not null,
  price numeric(10, 2) not null,
  quantity int default 1,
  created_at timestamp with time zone default now()
);

-- CART TABLE
create table if not exists public.cart (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_name text not null,
  price numeric(10, 2) not null,
  quantity int default 1,
  created_at timestamp with time zone default now()
);

-- MESSAGES TABLE (Contact Us form)
create table if not exists public.messages (
  id serial primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart enable row level security;
alter table public.messages enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Products: anyone can view products
create policy "Anyone can view products"
  on public.products for select
  using (true);

-- Orders: users can only view their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Order items: users can view items tied to their orders
create policy "Users can view own order items"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

-- Cart: users can manage their own cart
create policy "Users can view own cart"
  on public.cart for select
  using (auth.uid() = user_id);

create policy "Users can insert into own cart"
  on public.cart for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from own cart"
  on public.cart for delete
  using (auth.uid() = user_id);

-- Messages: anyone can insert (contact form)
create policy "Anyone can send messages"
  on public.messages for insert
  with check (true);

-- Messages: only authenticated (admin) can view
create policy "Admin can view messages"
  on public.messages for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SAMPLE DATA — BOUQUETS
-- ============================================================

insert into public.products (name, price, category, image_url, description, stock) values
('Rainbow Tulip Charm', 200.00, 'bouquet', '', 'A vibrant handmade crochet bouquet featuring colorful tulips in red, yellow, blue, and purple. Perfect as a gift or home decoration.', 10),
('Pastel Blossom Bouquet', 250.00, 'bouquet', '', 'A lovely pastel-colored crochet flower bouquet with soft pink and blue blossoms. Great for birthdays and special occasions.', 10),
('Lavender Bell Flowers', 300.00, 'bouquet', '', 'An elegant bouquet of handcrafted lavender bell-shaped flowers wrapped in premium tissue paper with a pink ribbon.', 10),
('Mini White Pastel Flower Bouquet', 150.00, 'bouquet', '', 'A delicate mini bouquet of white pastel crochet flowers, perfect as a small gift or desk decoration.', 10);

-- ============================================================
-- SAMPLE DATA — KEYCHAINS
-- ============================================================

insert into public.products (name, price, category, image_url, description, stock) values
('Graduation Penguin', 80.00, 'keychain', '', 'An adorable handmade crochet penguin keychain wearing a graduation cap. Perfect graduation gift for friends and classmates.', 15),
('Frog-Hat', 90.00, 'keychain', '', 'A cute crochet frog keychain wearing a tiny hat. A fun and quirky accessory for bags and keys.', 15),
('Strawberry-Hat Creature', 100.00, 'keychain', '', 'A charming little crochet creature wearing a strawberry hat. Unique and handmade with love.', 15),
('Purple Bow', 95.00, 'keychain', '', 'A pretty purple crochet bow keychain. Simple, elegant, and perfect as an everyday accessory.', 15);
