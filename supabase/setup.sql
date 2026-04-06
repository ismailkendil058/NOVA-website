-- 1. Create Tables

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  image_url TEXT
);

-- Delivery Tarifs
CREATE TABLE delivery_tarifs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_number INTEGER NOT NULL,
  wilaya_name TEXT NOT NULL,
  tarif_domicile NUMERIC NOT NULL DEFAULT 0,
  tarif_bureau NUMERIC NOT NULL DEFAULT 0
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name_fr TEXT NOT NULL,
  description_fr TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  is_pack BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]'
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  delivery_type TEXT NOT NULL, -- 'bureau' or 'domicile'
  address TEXT,
  total NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  status TEXT DEFAULT 'nouveau' -- 'nouveau', 'confirmé', 'expédié', 'annulé'
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  color TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Categories: Anyone can read, only Admins can modify
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin all on categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products: Anyone can read, only Admins can modify
CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admin all on products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Delivery Tarifs: Anyone can read, only Admins can modify
CREATE POLICY "Allow public read on delivery_tarifs" ON delivery_tarifs FOR SELECT USING (true);
CREATE POLICY "Allow admin all on delivery_tarifs" ON delivery_tarifs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders: Anyone can insert (for checkout), only Admins can read/modify
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all on orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order Items: Anyone can insert, only Admins can read/modify
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all on order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Storage Setup (Run these in SQL Editor if bucket doesn't exist)
-- Insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- Storage Policies (Access via Storage > Buckets > images > Policies)
-- "Public Access" -> SELECT: true
-- "Authenticated Access" -> INSERT, DELETE: auth.role() = 'authenticated'
