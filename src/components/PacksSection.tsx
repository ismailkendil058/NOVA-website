import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name_fr: string;
  price: number;
  old_price: number | null;
  is_pack: boolean;
  images: string[];
}

export default function PacksSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .or('is_pack.eq.true,old_price.not.is.null')
      .limit(10)
      .then(({ data }) => {
        if (data) setProducts(data as unknown as Product[]);
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="px-4 py-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Packs & Promotions</h2>
        <p className="text-xs text-muted-foreground mt-0.5" dir="rtl">الحزم والعروض</p>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {products.map(p => {
          const discount = p.old_price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0;
          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="shrink-0 w-44 border border-border group"
            >
              <div className="relative aspect-square bg-secondary overflow-hidden">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.name_fr} className="w-full h-full object-cover" loading="lazy" />
                )}
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                    PROMO -{discount}%
                  </span>
                )}
                {p.is_pack && (
                  <span className="absolute top-2 right-2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5">
                    PACK
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-foreground truncate">{p.name_fr}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-foreground">{p.price} DA</span>
                  {p.old_price && (
                    <span className="text-xs text-muted-foreground line-through">{p.old_price} DA</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
