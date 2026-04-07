import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefetchedImages = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    // Sync scroll position if product changes
    if (scrollRef.current && product?.images) {
      scrollRef.current.scrollTo({
        left: 0,
        behavior: 'auto'
      });
      setCurrentImage(0);
    }
  }, [product?.id]);

  const preloadImage = (url?: string) => {
    if (!url || typeof window === 'undefined') return;
    if (prefetchedImages.current.has(url)) return;
    const img = new Image();
    img.src = url;
    prefetchedImages.current.add(url);
  };

  useEffect(() => {
    if (!product?.images?.length) return;
    product.images.slice(0, 3).forEach(preloadImage);
  }, [product?.images]);

  useEffect(() => {
    if (!product?.images?.length) return;
    [currentImage + 1, currentImage + 2].forEach(index => {
      preloadImage(product.images[index]);
    });
  }, [currentImage, product?.images]);

  const handleThumbnailClick = (index: number) => {
    setCurrentImage(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.offsetWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      if (index !== currentImage) {
        setCurrentImage(index);
      }
    }
  };

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
    navigate('/cart');
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <Link to="/" className="fixed top-4 left-4 z-30 bg-foreground/80 p-2">
        <ArrowLeft className="w-5 h-5 text-background" />
      </Link>

      {/* Image Gallery */}
      <div className="relative aspect-square bg-secondary overflow-hidden group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar no-scrollbar scroll-smooth"
        >
          {product.images?.length > 0 ? (
            product.images.map((img, i) => (
              <div key={i} className="min-w-full h-full snap-center flex-shrink-0">
                <img
                  src={img}
                  alt={`${product.name_fr} - view ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i <= currentImage + 1 ? 'eager' : 'lazy'}
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-6xl font-black">
              {product.name_fr[0]}
            </div>
          )}
        </div>

        {/* Count Indicator */}
        {product.images?.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest z-10">
            {currentImage + 1} / {product.images.length}
          </div>
        )}
      </div>

      {/* Thumbnails below main picture */}
      {product.images?.length > 1 && (
        <div className="flex gap-2 px-4 mt-4 overflow-x-auto hide-scrollbar pb-2">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className={`relative flex-shrink-0 aspect-square w-16 overflow-hidden transition-all duration-300 border ${i === currentImage ? 'border-primary scale-110 shadow-lg z-10' : 'border-transparent opacity-60 scale-100 hover:opacity-100'
                }`}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

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
