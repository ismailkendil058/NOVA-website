import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import CartFab from '@/components/CartFab';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name_fr: string;
  price: number;
  old_price: number | null;
  is_pack: boolean;
  images: string[];
}

interface Category {
  id: string;
  name_fr: string;
  name_ar: string;
}

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from('categories').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setCategory(data as unknown as Category);
    });
    supabase.from('products').select('*').eq('category_id', id).then(({ data }) => {
      if (data) setProducts(data as unknown as Product[]);
    });
  }, [id]);

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-4 flex items-center gap-3">
        <Link to="/" className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">{category?.name_fr || 'Catégorie'}</h1>
          {category && <p className="text-xs text-muted-foreground" dir="rtl">{category.name_ar}</p>}
        </div>
      </div>

      <div className="px-4 py-6">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">Aucun produit dans cette catégorie</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => (
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
      </div>
      <CartFab />
    </div>
  );
}
