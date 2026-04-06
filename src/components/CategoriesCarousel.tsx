import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name_fr: string;
  name_ar: string;
  image_url: string | null;
}

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data as unknown as Category[]);
    });
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter">Catégories</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">Premium Selection</p>
        </div>
        <p className="text-sm font-medium text-muted-foreground/60" dir="rtl">الفئات المميزة</p>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="shrink-0 w-32 group snap-start"
          >
            <div className="aspect-[4/5] bg-secondary border border-border/50 shadow-sm rounded-2xl overflow-hidden mb-3 transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name_fr}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-3xl font-black">
                  {cat.name_fr[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <p className="text-sm font-bold text-foreground text-center line-clamp-1 transition-colors group-hover:text-primary">{cat.name_fr}</p>
            <p className="text-[10px] text-muted-foreground text-center mt-0.5" dir="rtl">{cat.name_ar}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

