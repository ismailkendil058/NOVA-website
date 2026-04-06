export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
}

const CART_KEY = 'nova_deco_cart';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: Omit<CartItem, 'quantity'>, qty = 1) {
  const cart = getCart();
  const key = `${item.productId}-${item.color || ''}`;
  const existing = cart.find(c => `${c.productId}-${c.color || ''}` === key);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  saveCart(cart);
}

export function updateQuantity(productId: string, color: string | undefined, qty: number) {
  let cart = getCart();
  const key = `${productId}-${color || ''}`;
  if (qty <= 0) {
    cart = cart.filter(c => `${c.productId}-${c.color || ''}` !== key);
  } else {
    const item = cart.find(c => `${c.productId}-${c.color || ''}` === key);
    if (item) item.quantity = qty;
  }
  saveCart(cart);
}

export function removeFromCart(productId: string, color?: string) {
  const cart = getCart().filter(c => !(c.productId === productId && (c.color || '') === (color || '')));
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
