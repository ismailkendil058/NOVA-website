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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-foreground text-sm border border-border focus:border-primary focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => setFilterStatus('')} className={`shrink-0 px-3 py-1 text-[10px] font-bold uppercase border transition-all ${!filterStatus ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-border text-muted-foreground'}`}>Tous</button>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`shrink-0 px-3 py-1 text-[10px] font-bold uppercase border transition-all ${filterStatus === s ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-border text-muted-foreground'}`}>{statusLabels[s]}</button>
          ))}
        </div>

        <div className="overflow-x-auto bg-white border border-border shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-50 text-muted-foreground">
                <th className="text-left py-3 px-3 uppercase tracking-wider font-bold text-[10px]">Client</th>
                <th className="text-left py-3 px-3 uppercase tracking-wider font-bold text-[10px]">Wilaya</th>
                <th className="text-left py-3 px-3 uppercase tracking-wider font-bold text-[10px]">Statut</th>
                <th className="text-right py-3 px-3 uppercase tracking-wider font-bold text-[10px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => openOrder(o)} className="border-b border-border/50 cursor-pointer hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-foreground">{o.client_name}</p>
                    <p className="text-muted-foreground text-[10px]">{o.phone}</p>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{o.wilaya}</td>
                  <td className="py-3 px-3">
                    <select
                      value={o.status}
                      onChange={e => { e.stopPropagation(); updateStatus(o.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="bg-secondary text-foreground text-[10px] font-bold uppercase border border-border px-2 py-1 rounded"
                    >
                      {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-primary">{o.total} DA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="bg-white border-l border-border text-foreground">
          <SheetHeader>
            <SheetTitle className="text-foreground font-black uppercase tracking-tight">Détails Commande</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className="mt-6 space-y-6 text-sm">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Informations Client</p>
                <p className="font-black text-lg">{selectedOrder.client_name}</p>
                <p className="text-primary font-bold">{selectedOrder.phone}</p>
              </div>
              <div className="px-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Livraison</p>
                <p className="font-medium">{selectedOrder.wilaya} — <span className="uppercase text-primary">{selectedOrder.delivery_type}</span></p>
                {selectedOrder.address && <p className="text-muted-foreground mt-1 bg-white border border-border p-3 rounded">{selectedOrder.address}</p>}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3">Articles commandés</p>
                <div className="space-y-2">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-border/50">
                      <div>
                        <span className="font-bold">{item.product_name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">× {item.quantity}</span>
                        {item.color && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">Couleur:</span>
                            <span className="text-[10px] font-bold">{item.color}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-black text-primary">{item.price * item.quantity} DA</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg border border-primary/10">
                <span className="font-bold uppercase text-[10px]">Total à payer</span>
                <span className="text-primary font-black text-xl">{selectedOrder.total} DA</span>
              </div>
              <button onClick={() => deleteOrder(selectedOrder.id)} className="w-full flex items-center justify-center gap-2 text-destructive font-bold text-xs py-3 border border-destructive/20 hover:bg-destructive/5 transition-colors mt-8">
                <Trash2 className="w-4 h-4" /> Supprimer la commande
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
