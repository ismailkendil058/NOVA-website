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
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-background">Tarifs de livraison</h2>
          {Object.keys(edited).length > 0 && (
            <button onClick={saveAll} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">
              <Save className="w-3 h-3" /> Sauvegarder
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-background/50">
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Wilaya</th>
                <th className="text-right py-2 px-1">Domicile</th>
                <th className="text-right py-2 px-1">Bureau</th>
              </tr>
            </thead>
            <tbody>
              {tarifs.map(t => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="py-1.5 px-1 text-background/40">{t.wilaya_number}</td>
                  <td className="py-1.5 px-1 text-background">{t.wilaya_name}</td>
                  <td className="py-1.5 px-1 text-right">
                    <input
                      type="number"
                      value={edited[t.id]?.domicile ?? t.tarif_domicile}
                      onChange={e => handleEdit(t.id, 'domicile', e.target.value)}
                      className="w-16 text-right bg-white/5 text-background text-xs border border-white/10 px-1 py-0.5 focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-1 text-right">
                    <input
                      type="number"
                      value={edited[t.id]?.bureau ?? t.tarif_bureau}
                      onChange={e => handleEdit(t.id, 'bureau', e.target.value)}
                      className="w-16 text-right bg-white/5 text-background text-xs border border-white/10 px-1 py-0.5 focus:border-primary focus:outline-none"
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
