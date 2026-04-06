import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { updateQuantity, removeFromCart, getCartTotal } from '@/lib/cart';

export default function CartPage() {
  const items = useCart();
  const total = getCartTotal(items);

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-4 flex items-center gap-3">
        <Link to="/" className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">Panier</h1>
          <p className="text-xs text-muted-foreground" dir="rtl">سلة التسوق</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-muted-foreground text-sm mb-4">Votre panier est vide</p>
          <Link to="/" className="text-primary text-sm font-medium underline">
            Continuer vos achats
          </Link>
        </div>
      ) : (
        <div className="px-4 py-6 space-y-4">
          {items.map(item => (
            <div
              key={`${item.productId}-${item.color || ''}`}
              className="flex gap-3 border-b border-border pb-4"
            >
              <div className="w-20 h-20 bg-secondary shrink-0">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                {item.color && <p className="text-xs text-muted-foreground">{item.color}</p>}
                <p className="text-sm font-bold text-foreground mt-1">{item.price * item.quantity} DA</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.color, item.quantity - 1)}
                    className="p-1 border border-border text-foreground"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-foreground w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.color, item.quantity + 1)}
                    className="p-1 border border-border text-foreground"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId, item.color)}
                    className="ml-auto p-1 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Sous-total</span>
            <span className="text-xl font-black text-foreground">{total} DA</span>
          </div>

          <Link
            to="/checkout"
            className="block w-full bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest text-center hover:opacity-90 transition-opacity"
          >
            Valider la commande / تأكيد الطلب
          </Link>

          <Link
            to="/"
            className="block w-full bg-secondary text-foreground py-4 text-sm font-bold uppercase tracking-widest text-center hover:bg-zinc-200 transition-colors border border-border"
          >
            Continuer les achats / متابعة التسوق
          </Link>
        </div>
      )}
    </div>
  );
}
