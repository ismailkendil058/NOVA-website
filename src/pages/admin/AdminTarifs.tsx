import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function AdminTarifs() {
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [edited, setEdited] = useState<Record<string, { domicile: string; bureau: string }>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('delivery_tarifs').select('*').order('wilaya_number');
    if (data) setTarifs(data);
  }

  function handleEdit(id: string, field: 'domicile' | 'bureau', value: string) {
    const current = edited[id] || { domicile: '', bureau: '' };
    const tarif = tarifs.find(t => t.id === id);
    if (!tarif) return;
    setEdited({
      ...edited,
      [id]: {
        domicile: field === 'domicile' ? value : (current.domicile || String(tarif.tarif_domicile)),
        bureau: field === 'bureau' ? value : (current.bureau || String(tarif.tarif_bureau)),
      },
    });
  }

  async function saveAll() {
    const updates = Object.entries(edited);
    for (const [id, vals] of updates) {
      await supabase.from('delivery_tarifs').update({
        tarif_domicile: parseFloat(vals.domicile),
        tarif_bureau: parseFloat(vals.bureau),
      }).eq('id', id);
    }
    setEdited({});
    load();
    toast({ title: `${updates.length} tarif(s) mis à jour` });
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-3 border border-border shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Tarifs de livraison</h2>
          {Object.keys(edited).length > 0 && (
            <button onClick={saveAll} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Save className="w-3.5 h-3.5" /> Sauvegarder les modifications
            </button>
          )}
        </div>

        <div className="bg-white border border-border shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-zinc-50 text-muted-foreground uppercase font-bold text-[10px]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="text-right py-3 px-4">Domicile (DA)</th>
                <th className="text-right py-3 px-4">Bureau (DA)</th>
              </tr>
            </thead>
            <tbody>
              {tarifs.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-zinc-50/50 transition-colors">
                  <td className="py-2 px-4 text-muted-foreground font-bold">#{t.wilaya_number}</td>
                  <td className="py-2 px-4 text-foreground font-black">{t.wilaya_name}</td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      value={edited[t.id]?.domicile ?? t.tarif_domicile}
                      onChange={e => handleEdit(t.id, 'domicile', e.target.value)}
                      className="w-24 text-right bg-secondary text-foreground text-xs font-bold border border-border px-3 py-1.5 focus:border-primary focus:outline-none rounded transition-all"
                    />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      value={edited[t.id]?.bureau ?? t.tarif_bureau}
                      onChange={e => handleEdit(t.id, 'bureau', e.target.value)}
                      className="w-24 text-right bg-secondary text-foreground text-xs font-bold border border-border px-3 py-1.5 focus:border-primary focus:outline-none rounded transition-all"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
