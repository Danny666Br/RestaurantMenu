-- ============================================================
-- BreakfastHub — Schema SQL
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Extensión para UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLAS
-- ============================================================

-- Categorías del menú (Bebidas calientes, Platos principales, etc.)
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

-- Productos del menú
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null,
  description text    not null default '',
  price       integer not null,          -- precio en COP (pesos enteros)
  emoji       text    not null default '🍽️',
  category_id uuid    not null references categories(id) on delete restrict,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Usuarios (login por username simple, sin contraseña)
create table if not exists users (
  id         uuid primary key default gen_random_uuid(),
  username   text not null unique,
  created_at timestamptz not null default now()
);

-- Pedidos (uno por usuario, se reemplaza al actualizar)
create table if not exists orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)                       -- un pedido activo por usuario
);

-- Ítems de cada pedido
create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid    not null references orders(id) on delete cascade,
  product_id uuid    not null references products(id) on delete restrict,
  quantity   integer not null default 1 check (quantity > 0),
  unique(order_id, product_id)          -- sin duplicados por pedido
);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index if not exists idx_users_username        on users(username);
create index if not exists idx_products_category     on products(category_id);
create index if not exists idx_products_active       on products(is_active);
create index if not exists idx_order_items_order     on order_items(order_id);
create index if not exists idx_order_items_product   on order_items(product_id);
create index if not exists idx_orders_user           on orders(user_id);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table categories   enable row level security;
alter table products     enable row level security;
alter table users        enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;

-- categories: lectura pública
create policy "categories_read_public"
  on categories for select
  using (true);

-- products: lectura pública (solo activos desde cliente; admin ve todos)
create policy "products_read_public"
  on products for select
  using (true);

-- users: lectura y escritura pública (el username es el "auth")
create policy "users_read_public"
  on users for select
  using (true);

create policy "users_insert_public"
  on users for insert
  with check (true);

-- orders: lectura y escritura pública (las API routes validan)
create policy "orders_read_public"
  on orders for select
  using (true);

create policy "orders_insert_public"
  on orders for insert
  with check (true);

create policy "orders_update_public"
  on orders for update
  using (true);

create policy "orders_delete_public"
  on orders for delete
  using (true);

-- order_items: lectura y escritura pública
create policy "order_items_read_public"
  on order_items for select
  using (true);

create policy "order_items_insert_public"
  on order_items for insert
  with check (true);

create policy "order_items_delete_public"
  on order_items for delete
  using (true);

-- categories/products: escritura solo desde service_role (admin API)
-- (Las API routes de admin usan la service_role key, que bypasea RLS)

-- ============================================================
-- CAMPO subcategory EN products (agrupación visual dentro de Platos Principales)
-- ============================================================

alter table products add column if not exists subcategory text;

-- ============================================================
-- REALTIME: habilitar para pedidos en tiempo real
-- ============================================================

-- Ejecutar en Supabase Dashboard > Database > Replication
-- o con estos comandos:
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table orders;
