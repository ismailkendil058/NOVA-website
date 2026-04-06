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
    <section className="px-4 py-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Catégories</h2>
        <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-tighter" dir="rtl">الفئات المختارة</p>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="shrink-0 w-28 group"
          >
            <div className="aspect-square bg-white border border-border shadow-sm rounded-xl overflow-hidden mb-2 transition-all group-hover:shadow-md group-hover:scale-[1.02]">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name_fr} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-2xl font-black">
                  {cat.name_fr[0]}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-foreground text-center line-clamp-1">{cat.name_fr}</p>
            <p className="text-[10px] text-muted-foreground text-center" dir="rtl">{cat.name_ar}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
