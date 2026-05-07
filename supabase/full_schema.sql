-- 1. DROP EXISTING TABLES (IF THEY EXIST)
DROP TABLE IF EXISTS web_order_items CASCADE;
DROP TABLE IF EXISTS web_orders CASCADE;
DROP TABLE IF EXISTS web_products CASCADE;
DROP TABLE IF EXISTS web_delivery_tarifs CASCADE;
DROP TABLE IF EXISTS web_categories CASCADE;

-- 2. CREATE TABLES WITH WEB_ PREFIX

-- Categories
CREATE TABLE web_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  image_url TEXT
);

-- Delivery Tarifs
CREATE TABLE web_delivery_tarifs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_number INTEGER NOT NULL,
  wilaya_name TEXT NOT NULL,
  tarif_domicile NUMERIC NOT NULL DEFAULT 0,
  tarif_bureau NUMERIC NOT NULL DEFAULT 0
);

-- Products
CREATE TABLE web_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name_fr TEXT NOT NULL,
  description_fr TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  old_price NUMERIC,
  is_pack BOOLEAN NOT NULL DEFAULT false,
  category_id UUID REFERENCES web_categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]'
);

-- Orders
CREATE TABLE web_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'bureau',
  address TEXT DEFAULT '',
  total NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nouveau'
);

-- Order Items
CREATE TABLE web_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES web_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES web_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  color TEXT
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE web_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_delivery_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_order_items ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES

-- Categories
CREATE POLICY "Anyone can read categories" ON web_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated full access categories" ON web_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products
CREATE POLICY "Anyone can read products" ON web_products FOR SELECT USING (true);
CREATE POLICY "Authenticated full access products" ON web_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Delivery Tarifs
CREATE POLICY "Anyone can read delivery_tarifs" ON web_delivery_tarifs FOR SELECT USING (true);
CREATE POLICY "Authenticated full access delivery_tarifs" ON web_delivery_tarifs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "Anyone can create orders" ON web_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON web_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated full access orders" ON web_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order Items
CREATE POLICY "Anyone can create order_items" ON web_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read order_items" ON web_order_items FOR SELECT USING (true);
CREATE POLICY "Authenticated full access order_items" ON web_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. STORAGE SETUP
-- Run these manually in the Supabase SQL Editor if buckets don't exist
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- CREATE POLICY "Public read access on images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'images');
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
-- CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images');
-- CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');

-- 6. SEED DATA

-- Categories
INSERT INTO web_categories (name_fr, name_ar) VALUES
('Satiné', 'ساتينيه'),
('Enduit', 'طلاء'),
('Vinyle', 'فينيل'),
('Décor', 'ديكور'),
('Fixateur', 'مثبت'),
('Accessoire', 'إكسسوار');

-- Wilayas (69)
INSERT INTO web_delivery_tarifs (wilaya_number, wilaya_name, tarif_domicile, tarif_bureau) VALUES
(1, 'Adrar', 800, 500),
(2, 'Chlef', 800, 500),
(3, 'Laghouat', 800, 500),
(4, 'Oum El Bouaghi', 800, 500),
(5, 'Batna', 800, 500),
(6, 'Béjaïa', 800, 500),
(7, 'Biskra', 800, 500),
(8, 'Béchar', 800, 500),
(9, 'Blida', 800, 500),
(10, 'Bouira', 800, 500),
(11, 'Tamanrasset', 800, 500),
(12, 'Tébessa', 800, 500),
(13, 'Tlemcen', 800, 500),
(14, 'Tiaret', 800, 500),
(15, 'Tizi Ouzou', 800, 500),
(16, 'Alger', 800, 400),
(17, 'Djelfa', 800, 500),
(18, 'Jijel', 800, 500),
(19, 'Sétif', 800, 500),
(20, 'Saïda', 800, 500),
(21, 'Skikda', 800, 500),
(22, 'Sidi Bel Abbès', 800, 500),
(23, 'Annaba', 800, 500),
(24, 'Guelma', 800, 500),
(25, 'Constantine', 800, 500),
(26, 'Médéa', 800, 500),
(27, 'Mostaganem', 800, 500),
(28, 'M''Sila', 800, 500),
(29, 'Mascara', 800, 500),
(30, 'Ouargla', 800, 500),
(31, 'Oran', 800, 500),
(32, 'El Bayadh', 800, 500),
(33, 'Illizi', 800, 500),
(34, 'Bordj Bou Arréridj', 800, 500),
(35, 'Boumerdès', 800, 500),
(36, 'El Tarf', 800, 500),
(37, 'Tindouf', 800, 500),
(38, 'Tissemsilt', 800, 500),
(39, 'El Oued', 800, 500),
(40, 'Khenchela', 800, 500),
(41, 'Souk Ahras', 800, 500),
(42, 'Tipaza', 800, 500),
(43, 'Mila', 800, 500),
(44, 'Aïn Defla', 800, 500),
(45, 'Naâma', 800, 500),
(46, 'Aïn Témouchent', 800, 500),
(47, 'Ghardaïa', 800, 500),
(48, 'Relizane', 800, 500),
(49, 'Timimoun', 800, 500),
(50, 'Bordj Badji Mokhtar', 800, 500),
(51, 'Ouled Djellal', 800, 500),
(52, 'Beni Abbes', 800, 500),
(53, 'In Salah', 800, 500),
(54, 'In Guezzam', 800, 500),
(55, 'Touggourt', 800, 500),
(56, 'Djanet', 800, 500),
(57, 'El M''Ghair', 800, 500),
(58, 'El Meniaa', 800, 500),
(59, 'Aflou', 800, 500),
(60, 'El Abiodh Sidi Cheikh', 800, 500),
(61, 'El Aricha', 800, 500),
(62, 'El Kantara', 800, 500),
(63, 'Barika', 800, 500),
(64, 'Bou Saâda', 800, 500),
(65, 'Bir El Ater', 800, 500),
(66, 'Ksar El Boukhari', 800, 500),
(67, 'Ksar Chellala', 800, 500),
(68, 'Aïn Oussara', 800, 500),
(69, 'Messaad', 800, 500);
