import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const statuses = ['nouveau', 'en_cours', 'livré', 'annulé'];
const statusLabels: Record<string, string> = { nouveau: 'Nouveau', en_cours: 'En cours', livré: 'Livré', annulé: 'Annulé' };

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
    const channel = supabase.channel('orders-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  async function openOrder(order: any) {
    setSelectedOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setOrderItems(data || []);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
    toast({ title: 'Statut mis à jour' });
  }

  async function deleteOrder(id: string) {
    if (!confirm('Supprimer cette commande?')) return;
    await supabase.from('orders').delete().eq('id', id);
    loadOrders();
    setSelectedOrder(null);
    toast({ title: 'Commande supprimée' });
  }

  const filtered = orders.filter(o => {
    if (search && !o.client_name.toLowerCase().includes(search.toLowerCase()) && !o.phone.includes(search)) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-background/30" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => setFilterStatus('')} className={`shrink-0 px-3 py-1 text-xs border ${!filterStatus ? 'border-primary text-primary' : 'border-white/10 text-background/50'}`}>Tous</button>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`shrink-0 px-3 py-1 text-xs border ${filterStatus === s ? 'border-primary text-primary' : 'border-white/10 text-background/50'}`}>{statusLabels[s]}</button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-background/50">
                <th className="text-left py-2 px-2">Client</th>
                <th className="text-left py-2 px-2">Wilaya</th>
                <th className="text-left py-2 px-2">Statut</th>
                <th className="text-right py-2 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => openOrder(o)} className="border-b border-white/5 cursor-pointer hover:bg-white/5">
                  <td className="py-2 px-2">
                    <p className="font-medium text-background">{o.client_name}</p>
                    <p className="text-background/40">{o.phone}</p>
                  </td>
                  <td className="py-2 px-2 text-background/70">{o.wilaya}</td>
                  <td className="py-2 px-2">
                    <select
                      value={o.status}
                      onChange={e => { e.stopPropagation(); updateStatus(o.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="bg-white/10 text-background text-xs border border-white/10 px-1 py-0.5"
                    >
                      {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-primary">{o.total} DA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="bg-foreground border-white/10 text-background">
          <SheetHeader>
            <SheetTitle className="text-background">Commande</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-background/50 text-xs">Client</p>
                <p className="font-medium">{selectedOrder.client_name}</p>
                <p className="text-background/60">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-background/50 text-xs">Livraison</p>
                <p>{selectedOrder.wilaya} — {selectedOrder.delivery_type}</p>
                {selectedOrder.address && <p className="text-background/60">{selectedOrder.address}</p>}
              </div>
              <div>
                <p className="text-background/50 text-xs mb-2">Produits</p>
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-white/5">
                    <span>{item.product_name} × {item.quantity} {item.color ? `(${item.color})` : ''}</span>
                    <span className="font-bold">{item.price * item.quantity} DA</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{selectedOrder.total} DA</span>
              </div>
              <button onClick={() => deleteOrder(selectedOrder.id)} className="flex items-center gap-2 text-destructive text-xs mt-4">
                <Trash2 className="w-3 h-3" /> Supprimer la commande
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
