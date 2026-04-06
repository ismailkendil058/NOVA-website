import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import { toast } from '@/hooks/use-toast';
import CartFab from '@/components/CartFab';

interface Product {
  id: string;
  name_fr: string;
  description_fr: string;
  price: number;
  old_price: number | null;
  is_pack: boolean;
  images: string[];
  colors: { name: string; hex: string }[];
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        const p = data as unknown as Product;
        p.colors = Array.isArray(p.colors) ? p.colors : [];
        setProduct(p);
        if (p.colors.length > 0) setSelectedColor(p.colors[0].name);
      }
    });
  }, [id]);

  if (!product) {
    return (
      <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      name: product.name_fr,
      price: product.price,
      image: product.images?.[0] || '',
      color: selectedColor,
    }, qty);
    toast({ title: 'Ajouté au panier', description: `${product.name_fr} × ${qty}` });
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <Link to="/" className="fixed top-4 left-4 z-30 bg-foreground/80 p-2">
        <ArrowLeft className="w-5 h-5 text-background" />
      </Link>

      {/* Image carousel */}
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {product.images?.length > 0 ? (
          <img src={product.images[currentImage]} alt={product.name_fr} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-6xl font-black">
            {product.name_fr[0]}
          </div>
        )}
        {product.images?.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-2 h-2 ${i === currentImage ? 'bg-primary' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{product.name_fr}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-foreground">{product.price} DA</span>
          {product.old_price && (
            <>
              <span className="text-lg text-muted-foreground line-through">{product.old_price} DA</span>
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5">-{discount}%</span>
            </>
          )}
        </div>

        {product.description_fr && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description_fr}</p>
        )}

        {/* Colors */}
        {product.colors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wide">Couleur</p>
            <div className="flex gap-2">
              {product.colors.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-8 h-8 border-2 ${selectedColor === c.name ? 'border-primary' : 'border-border'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <p className="text-xs font-medium text-foreground uppercase tracking-wide">Quantité</p>
          <div className="flex items-center border border-border">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-foreground">
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-bold text-foreground min-w-[40px] text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-foreground">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Ajouter au Panier / أضف إلى السلة
        </button>
      </div>

      <CartFab />
    </div>
  );
}
