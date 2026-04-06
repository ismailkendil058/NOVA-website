import { useState, useEffect, useCallback } from 'react';
import { getCart, CartItem } from '@/lib/cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(getCart());

  const refresh = useCallback(() => setItems(getCart()), []);

  useEffect(() => {
    window.addEventListener('cart-updated', refresh);
    return () => window.removeEventListener('cart-updated', refresh);
  }, [refresh]);

  return items;
}
