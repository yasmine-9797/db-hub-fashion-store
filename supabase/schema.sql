-- DB Hub Cloth Store — database schema (Supabase / PostgreSQL)
-- Run in the Supabase SQL editor. The storefront server uses the service-role key, which bypasses
-- row-level security; RLS is enabled with NO policies for anon/authenticated, so the public API key
-- can't read or write any of these tables (customer data stays private).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- catalogue (future migration)
-- The live catalogue currently ships in code (src/lib/catalog/products.ts). These tables are ready
-- for moving it into the database so stock can be decremented atomically (see docs/CATALOGUE.md).
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  active boolean not null default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short_description text not null default '',
  description text not null default '',
  category_id uuid references categories(id),
  product_type text,
  price integer not null check (price > 0),                 -- whole rupees
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  fabric text, fit text, care text,
  featured boolean not null default false,
  new_arrival boolean not null default false,
  budget_edit boolean not null default false,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null unique,
  size text not null,
  colour text not null,
  colour_hex text check (colour_hex ~ '^#[0-9a-fA-F]{6}$'),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  active boolean not null default true,
  unique (product_id, size, colour)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------- orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  idempotency_key text not null unique,                     -- one checkout attempt = one order
  status text not null check (status in ('pending','payment_initiated','payment_failed','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  payment_method text not null check (payment_method in ('razorpay','cod','pay_at_store')),
  customer_name text not null,
  customer_phone text not null check (customer_phone ~ '^[6-9][0-9]{9}$'),
  customer_email text,
  fulfilment jsonb not null,                                -- {kind:'delivery', address:{…}} | {kind:'pickup', city}
  notes text,
  subtotal integer not null check (subtotal >= 0),
  shipping_amount integer check (shipping_amount is null or shipping_amount >= 0), -- null = to be confirmed
  discount_amount integer not null default 0 check (discount_amount >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  demo boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_status_created_idx on orders (status, created_at desc);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_phone_idx on orders (customer_phone);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null,
  sku text not null,
  product_name_snapshot text not null,
  size text not null,
  colour text not null,
  quantity integer not null check (quantity between 1 and 100),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total = unit_price * quantity),
  image_url text
);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text not null,
  provider_payment_id text,
  payment_status text not null check (payment_status in ('captured','authorized','failed','refunded')),
  amount integer not null check (amount >= 0),               -- paise
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);
create index if not exists payments_order_idx on payments (order_id);

-- Customers: reserved for future accounts. Guest checkout stores a snapshot on each order instead.
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists wholesale_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  business_name text,
  approximate_quantity text not null,
  categories text[] not null default '{}',
  message text,
  created_at timestamptz not null default now()
);
create index if not exists wholesale_enquiries_created_idx on wholesale_enquiries (created_at desc);

-- ---------------------------------------------------------------- row-level security
-- Enabled everywhere with no permissive policies: only the server (service role) has access.
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table customers enable row level security;
alter table wholesale_enquiries enable row level security;

-- If you later read the catalogue directly from the browser, add read-only policies such as:
-- create policy "public can read active products" on products for select to anon using (status = 'active');
