import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { getCartCount } from '@/lib/cart';

export default function CartFab() {
  const items = useCart();
  const count = getCartCount(items);

  if (count === 0) return null;

  return (
    <Link
      to="/cart"
      className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold w-5 h-5 flex items-center justify-center">
        {count}
      </span>
    </Link>
  );
}
