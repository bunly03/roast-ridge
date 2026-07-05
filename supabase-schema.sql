-- ============================================================
-- Roast & Ridge — Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. PRODUCTS TABLE ------------------------------------------------
create table if not exists products (
  id bigint primary key generated always as identity,
  name text not null,
  tag text,
  description text not null,
  price numeric(10,2) not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- Allow anonymous (public) read access to products
alter table products enable row level security;

create policy "Public can view products"
  on products for select
  using (true);

-- Seed data (matches script.js fallback data)
insert into products (name, tag, description, price, image_url) values
('Ethiopian Yirgacheffe', 'Light Roast', 'Floral and bright with notes of jasmine, bergamot, and lemon zest. Washed process, grown at 1,900m.', 18.99, 'https://images.unsplash.com/photo-1587734195503-904fca47e0d9?w=600&q=80'),
('Colombian Supremo', 'Medium Roast', 'A balanced, crowd-pleasing cup with caramel sweetness, red apple acidity, and a smooth walnut finish.', 16.99, 'https://images.unsplash.com/photo-1524350876685-274059332603?w=600&q=80'),
('Sumatra Mandheling', 'Dark Roast', 'Full-bodied and earthy with notes of dark chocolate, cedar, and a low, syrupy acidity.', 17.99, 'https://images.unsplash.com/photo-1559525839-8f275eae4536?w=600&q=80'),
('Guatemala Antigua', 'Medium Roast', 'Rich and spicy with cocoa, orange peel, and a subtle smokiness from volcanic soil.', 19.99, 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=600&q=80'),
('Kenya AA', 'Light-Medium Roast', 'Wine-like acidity with juicy blackcurrant, tomato, and a bright, sparkling finish.', 20.99, 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80'),
('House Blend Espresso', 'Dark Roast', 'Our signature blend built for espresso — bold, chocolatey, with a thick, lingering crema.', 15.99, 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&q=80');


-- 2. ORDERS TABLE (demo checkout log — no real payment data) --------
create table if not exists orders (
  id bigint primary key generated always as identity,
  order_id text not null,
  customer_name text,
  customer_email text,
  items jsonb,
  total numeric(10,2),
  status text default 'demo_no_payment',
  created_at timestamp with time zone default now()
);

alter table orders enable row level security;

-- Allow anonymous inserts so the demo checkout can log an order
create policy "Public can insert demo orders"
  on orders for insert
  with check (true);

-- (No public select policy on orders — customer data stays private
--  from the anon key; only visible to you via the Supabase dashboard.)
