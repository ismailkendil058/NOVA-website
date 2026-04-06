import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import SearchFilterBar from '@/components/SearchFilterBar';
import PacksSection from '@/components/PacksSection';
import CategoriesCarousel from '@/components/CategoriesCarousel';
import MobileDrawer from '@/components/MobileDrawer';
import CartFab from '@/components/CartFab';
import ProductCard from '@/components/ProductCard';


interface Product {
  id: string;
  name_fr: string;
  price: number;
  old_price: number | null;
  is_pack: boolean;
  images: string[];
  category_id: string | null;
}

interface Category {
  id: string;
  name_fr: string;
}

const categoryFilterMap: Record<string, string> = {
  'Satiné': 'Satiné',
  'Enduit': 'Enduit',
  'Vinyle': 'Vinyle',
  'Décor': 'Décor',
  'Fixateur': 'Fixateur',
  'Accessoire': 'Accessoire',
};

const Index = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => {
      if (data) setProducts(data as unknown as Product[]);
    });
    supabase.from('categories').select('id, name_fr').then(({ data }) => {
      if (data) setCategories(data as unknown as Category[]);
    });
  }, []);

  const filtered = products.filter(p => {
    if (search && !p.name_fr.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'Tous') return true;
    if (filter === 'Promotions') return p.old_price !== null;
    if (filter === 'Packs') return p.is_pack;

    // Find the category by name to match the filter choice
    const selectedCat = categories.find(c => c.name_fr === filter);
    return selectedCat ? p.category_id === selectedCat.id : true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mobile-container bg-background"
    >
      <MobileDrawer />
      <HeroCarousel />

      <div id="content" className="relative z-10 bg-background">
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        <PacksSection />
        <CategoriesCarousel />

        {/* All Products */}
        <section className="px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground tracking-tighter">Nos Produits</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">Discovery Collection</p>
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">Aucun produit trouvé</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name_fr}
                  price={p.price}
                  oldPrice={p.old_price}
                  isPack={p.is_pack}
                  image={p.images?.[0]}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
      <CartFab />
    </motion.div>
  );
};


export default Index;
