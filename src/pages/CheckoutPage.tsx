import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { getCartTotal, clearCart } from '@/lib/cart';
import { toast } from '@/hooks/use-toast';

interface Tarif {
  wilaya_name: string;
  tarif_domicile: number;
  tarif_bureau: number;
}

export default function CheckoutPage() {
  const items = useCart();
  const navigate = useNavigate();
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    wilaya: '',
    deliveryType: 'bureau' as 'bureau' | 'domicile',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('delivery_tarifs').select('wilaya_name, tarif_domicile, tarif_bureau')
      .order('wilaya_name')
      .then(({ data }) => {
        if (data) setTarifs(data as Tarif[]);
      });
  }, []);

  const selectedTarif = tarifs.find(t => t.wilaya_name === form.wilaya);
  const deliveryFee = selectedTarif
    ? (form.deliveryType === 'domicile' ? selectedTarif.tarif_domicile : selectedTarif.tarif_bureau)
    : 0;
  const subtotal = getCartTotal(items);
  const total = subtotal + deliveryFee;

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.wilaya) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Erreur', description: 'Votre panier est vide', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase.from('orders').insert({
        client_name: form.name,
        phone: form.phone,
        wilaya: form.wilaya,
        delivery_type: form.deliveryType,
        address: form.deliveryType === 'domicile' ? form.address : '',
        total,
        delivery_fee: deliveryFee,
      }).select().single();

      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: (order as any).id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.color || null,
      }));

      await supabase.from('order_items').insert(orderItems);

      clearCart();
      toast({ title: 'Commande confirmée!', description: 'Nous vous contacterons bientôt.' });
      navigate('/');
    } catch (err) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-4 flex items-center gap-3">
        <Link to="/cart" className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">Commande</h1>
          <p className="text-xs text-muted-foreground" dir="rtl">الطلب</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom complet"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-transparent focus:border-primary focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Numéro de téléphone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-transparent focus:border-primary focus:outline-none"
          />
          <select
            value={form.wilaya}
            onChange={e => setForm({ ...form, wilaya: e.target.value })}
            className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-transparent focus:border-primary focus:outline-none"
          >
            <option value="">Sélectionner une wilaya</option>
            {tarifs.map(t => (
              <option key={t.wilaya_name} value={t.wilaya_name}>{t.wilaya_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground uppercase tracking-wide">Mode de livraison</p>
          <label className="flex items-center justify-between p-3 border border-border cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="delivery"
                checked={form.deliveryType === 'bureau'}
                onChange={() => setForm({ ...form, deliveryType: 'bureau' })}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">Livraison en bureau</span>
            </div>
            {selectedTarif && (
              <span className="text-sm font-bold text-primary">{selectedTarif.tarif_bureau} DA</span>
            )}
          </label>
          <label className="flex items-center justify-between p-3 border border-border cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="delivery"
                checked={form.deliveryType === 'domicile'}
                onChange={() => setForm({ ...form, deliveryType: 'domicile' })}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">Livraison à domicile</span>
            </div>
            {selectedTarif && (
              <span className="text-sm font-bold text-primary">{selectedTarif.tarif_domicile} DA</span>
            )}
          </label>

          {form.deliveryType === 'domicile' && (
            <textarea
              placeholder="Adresse complète"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-transparent focus:border-primary focus:outline-none min-h-[80px]"
            />
          )}
        </div>

        {/* Summary */}
        <div className="border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm text-foreground">
            <span>Sous-total</span>
            <span className="font-bold">{subtotal} DA</span>
          </div>
          <div className="flex justify-between text-sm text-foreground">
            <span>Livraison</span>
            <span className="font-bold">{deliveryFee} DA</span>
          </div>
          <div className="flex justify-between text-base text-foreground border-t border-border pt-2">
            <span className="font-bold">Total</span>
            <span className="font-black">{total} DA</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Paiement à la livraison</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Envoi...' : 'Confirmer la commande / تأكيد'}
        </button>
      </div>
    </div>
  );
}
