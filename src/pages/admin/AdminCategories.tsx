import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name_fr: '', name_ar: '', image: null as File | null });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    if (data) setCategories(data);
  }

  async function handleSubmit() {
    if (!form.name_fr || !form.name_ar) return;
    let image_url = '';
    if (form.image) {
      const ext = form.image.name.split('.').pop();
      const path = `categories/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(path, form.image);
      if (!error) {
        image_url = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
      }
    }
    await supabase.from('categories').insert({ name_fr: form.name_fr, name_ar: form.name_ar, image_url });
    setForm({ name_fr: '', name_ar: '', image: null });
    setImagePreview('');
    setOpen(false);
    load();
    toast({ title: 'Catégorie ajoutée' });
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
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-background">Catégories</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </DialogTrigger>
            <DialogContent className="bg-foreground border-white/10 text-background max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-background">Nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <input type="text" placeholder="Nom (FR)" value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} className="w-full px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none" />
                <input type="text" placeholder="Nom (AR)" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="w-full px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none" dir="rtl" />
                <div>
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageChange(e.target.files[0])} className="text-xs text-background/50" />
                  {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 w-20 h-20 object-cover" />}
                </div>
                <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground py-2 text-sm font-bold">Enregistrer</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-background/50">
              <th className="text-left py-2">Image</th>
              <th className="text-left py-2">FR</th>
              <th className="text-left py-2">AR</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="py-2">
                  {c.image_url ? <img src={c.image_url} alt="" className="w-10 h-10 object-cover" /> : <div className="w-10 h-10 bg-white/5" />}
                </td>
                <td className="py-2 text-background">{c.name_fr}</td>
                <td className="py-2 text-background/70" dir="rtl">{c.name_ar}</td>
                <td className="py-2 text-right">
                  <button onClick={() => deleteCategory(c.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
