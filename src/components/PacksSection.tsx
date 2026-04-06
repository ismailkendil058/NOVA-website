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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter">Packs & Offres</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">Limited time deals</p>
        </div>
        <p className="text-sm font-medium text-muted-foreground/60" dir="rtl">الحزم والعروض</p>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
        {products.map(p => {
          const discount = p.old_price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0;
          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="shrink-0 w-48 border border-border/50 group snap-start bg-secondary/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-square bg-secondary overflow-hidden">
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name_fr}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-0"
                    loading="lazy"
                    onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                  />
                )}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 shadow-lg">
                    -{discount}% OFF
                  </span>
                )}
                {p.is_pack && (
                  <span className="absolute top-3 right-3 bg-foreground text-background text-[10px] font-black px-2 py-1 shadow-lg">
                    PACK
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{p.name_fr}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-black text-foreground">{p.price} DA</span>
                  {p.old_price && (
                    <span className="text-xs text-muted-foreground line-through decoration-primary/40">{p.old_price} DA</span>
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

