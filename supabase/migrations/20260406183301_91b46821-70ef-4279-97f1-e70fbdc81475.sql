
-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  description_fr TEXT DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  old_price NUMERIC,
  is_pack BOOLEAN NOT NULL DEFAULT false,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Delivery tariffs table
CREATE TABLE public.delivery_tarifs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wilaya_number INTEGER NOT NULL,
  wilaya_name TEXT NOT NULL,
  tarif_domicile NUMERIC NOT NULL DEFAULT 0,
  tarif_bureau NUMERIC NOT NULL DEFAULT 0
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'bureau',
  address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'nouveau',
  total NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  color TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, products, delivery_tarifs
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read delivery_tarifs" ON public.delivery_tarifs FOR SELECT TO anon, authenticated USING (true);

-- Anyone can insert orders and order_items (anonymous checkout)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can create order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Authenticated full access categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access delivery_tarifs" ON public.delivery_tarifs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access order_items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can read order_items" ON public.order_items FOR SELECT TO anon USING (true);

-- Storage bucket for product/category images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Public read access to images bucket
CREATE POLICY "Public read access on images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'images');
-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');

-- Seed 58 Algerian wilayas
INSERT INTO public.delivery_tarifs (wilaya_number, wilaya_name, tarif_domicile, tarif_bureau) VALUES
(1, 'Adrar', 1200, 800), (2, 'Chlef', 800, 500), (3, 'Laghouat', 1000, 700),
(4, 'Oum El Bouaghi', 900, 600), (5, 'Batna', 900, 600), (6, 'Béjaïa', 700, 400),
(7, 'Biskra', 1000, 700), (8, 'Béchar', 1200, 800), (9, 'Blida', 500, 300),
(10, 'Bouira', 600, 400), (11, 'Tamanrasset', 1500, 1000), (12, 'Tébessa', 1000, 700),
(13, 'Tlemcen', 900, 600), (14, 'Tiaret', 800, 500), (15, 'Tizi Ouzou', 600, 400),
(16, 'Alger', 400, 200), (17, 'Djelfa', 800, 500), (18, 'Jijel', 800, 500),
(19, 'Sétif', 700, 500), (20, 'Saïda', 900, 600), (21, 'Skikda', 800, 500),
(22, 'Sidi Bel Abbès', 900, 600), (23, 'Annaba', 800, 500), (24, 'Guelma', 900, 600),
(25, 'Constantine', 700, 500), (26, 'Médéa', 600, 400), (27, 'Mostaganem', 800, 500),
(28, 'M''Sila', 800, 500), (29, 'Mascara', 800, 500), (30, 'Ouargla', 1100, 800),
(31, 'Oran', 700, 500), (32, 'El Bayadh', 1000, 700), (33, 'Illizi', 1500, 1000),
(34, 'Bordj Bou Arréridj', 700, 500), (35, 'Boumerdès', 500, 300),
(36, 'El Tarf', 900, 600), (37, 'Tindouf', 1500, 1000), (38, 'Tissemsilt', 800, 500),
(39, 'El Oued', 1000, 700), (40, 'Khenchela', 900, 600), (41, 'Souk Ahras', 900, 600),
(42, 'Tipaza', 500, 300), (43, 'Mila', 800, 500), (44, 'Aïn Defla', 700, 400),
(45, 'Naâma', 1000, 700), (46, 'Aïn Témouchent', 800, 500), (47, 'Ghardaïa', 1000, 700),
(48, 'Relizane', 800, 500), (49, 'El M''Ghair', 1100, 800), (50, 'El Meniaa', 1200, 800),
(51, 'Ouled Djellal', 1000, 700), (52, 'Bordj Badji Mokhtar', 1500, 1000),
(53, 'Béni Abbès', 1200, 800), (54, 'Timimoun', 1300, 900), (55, 'Touggourt', 1100, 800),
(56, 'Djanet', 1500, 1000), (57, 'In Salah', 1400, 900), (58, 'In Guezzam', 1500, 1000);
