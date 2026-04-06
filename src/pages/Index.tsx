import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import SearchFilterBar from '@/components/SearchFilterBar';
import PacksSection from '@/components/PacksSection';
import CategoriesCarousel from '@/components/CategoriesCarousel';
import MobileDrawer from '@/components/MobileDrawer';
import CartFab from '@/components/CartFab';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const getCategoryId = (filterName: string) => {
    const cat = categories.find(c => c.name_fr === categoryFilterMap[filterName]);
    return cat?.id;
  };

  const filtered = products.filter(p => {
    if (search && !p.name_fr.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'Tous') return true;
    if (filter === 'Promotions') return p.old_price !== null;
    if (filter === 'Packs') return p.is_pack;
    const catId = getCategoryId(filter);
    return catId ? p.category_id === catId : true;
  });

  return (
    <div className="mobile-container bg-background">
      <MobileDrawer />
      <HeroCarousel />

      <div id="content">
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
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">Produits</h2>
            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">Discovery Collection</p>
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
    </div>
  );
};

export default Index;
