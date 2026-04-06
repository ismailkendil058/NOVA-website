import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import imageCompression from 'browser-image-compression';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name_fr: '', name_ar: '', image: null as File | null });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    if (data) setCategories(data);
  }

  async function handleSubmit() {
    if (!form.name_fr || !form.name_ar) return;
    setLoading(true);
    let image_url = '';
    if (form.image) {
      try {
        const options = {
          maxSizeMB: 0.1, // 100KB
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(form.image, options);
        const ext = compressedFile.name.split('.').pop();
        const path = `categories/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('images').upload(path, compressedFile);
        if (!error) {
          image_url = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
        }
      } catch (error) {
        console.error('Compression error:', error);
      }
    }

    try {
      await supabase.from('categories').insert({ name_fr: form.name_fr, name_ar: form.name_ar, image_url });
      setForm({ name_fr: '', name_ar: '', image: null });
      setImagePreview('');
      setOpen(false);
      load();
      toast({ title: 'Catégorie ajoutée' });
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Supprimer cette catégorie?')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
    toast({ title: 'Catégorie supprimée' });
  }

  function handleImageChange(file: File) {
    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-3 border border-border shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Catégories</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white border-border text-foreground max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-foreground font-black uppercase">Nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nom (FR)</p>
                  <input type="text" placeholder="Ex: Peinture Satinée" value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} className="w-full px-3 py-2 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nom (AR)</p>
                  <input type="text" placeholder="مثال: طلاء ساتيني" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="w-full px-3 py-2 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none" dir="rtl" />
                </div>
                <div className="bg-zinc-50 p-3 border border-dashed border-border rounded">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Illustration</p>
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageChange(e.target.files[0])} className="text-xs text-muted-foreground" />
                  {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 w-20 h-20 object-cover rounded border border-border shadow-sm" />}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full bg-primary text-primary-foreground py-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white border border-border shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-50 text-muted-foreground">
                <th className="text-left py-3 px-3 uppercase font-bold text-[10px]">Image</th>
                <th className="text-left py-3 px-3 uppercase font-bold text-[10px]">Nom FR</th>
                <th className="text-left py-3 px-3 uppercase font-bold text-[10px]">Nom AR</th>
                <th className="text-right py-3 px-3 uppercase font-bold text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-zinc-50/50 transition-colors">
                  <td className="py-2 px-3">
                    {c.image_url ? <img src={c.image_url} alt="" className="w-10 h-10 object-cover rounded shadow-sm border border-border" /> : <div className="w-10 h-10 bg-secondary rounded" />}
                  </td>
                  <td className="py-2 px-3 text-foreground font-medium">{c.name_fr}</td>
                  <td className="py-2 px-3 text-muted-foreground font-medium" dir="rtl">{c.name_ar}</td>
                  <td className="py-2 px-3 text-right">
                    <button onClick={() => deleteCategory(c.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
