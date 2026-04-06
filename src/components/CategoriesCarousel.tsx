import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name_fr: string;
  name_ar: string;
  image_url: string | null;
}

const fallbackCategories = [
  { name_fr: 'Satiné', name_ar: 'ساتينيه' },
  { name_fr: 'Enduit', name_ar: 'طلاء' },
  { name_fr: 'Vinyle', name_ar: 'فينيل' },
  { name_fr: 'Décor', name_ar: 'ديكور' },
  { name_fr: 'Fixateur', name_ar: 'مثبت' },
  { name_fr: 'Accessoire', name_ar: 'إكسسوار' },
];

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data && data.length > 0) setCategories(data as unknown as Category[]);
    });
  }, []);

  const display = categories.length > 0
    ? categories
    : fallbackCategories.map((c, i) => ({ id: `fb-${i}`, ...c, image_url: null }));

  return (
    <section className="px-4 py-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Catégories</h2>
        <p className="text-xs text-muted-foreground mt-0.5" dir="rtl">الفئات</p>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {display.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="shrink-0 w-28 group"
          >
            <div className="aspect-square bg-secondary border border-border overflow-hidden mb-2">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name_fr} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-black">
                  {cat.name_fr[0]}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-foreground text-center">{cat.name_fr}</p>
            <p className="text-[10px] text-muted-foreground text-center" dir="rtl">{cat.name_ar}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
