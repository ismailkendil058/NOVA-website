import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductForm {
  name_fr: string;
  description_fr: string;
  category_id: string;
  price: string;
  old_price: string;
  is_pack: boolean;
  hasColors: boolean;
  colors: { name: string; hex: string }[];
  images: File[];
  imagePreviews: string[];
}

const emptyForm: ProductForm = {
  name_fr: '', description_fr: '', category_id: '', price: '', old_price: '',
  is_pack: false, hasColors: false, colors: [], images: [], imagePreviews: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name_fr'),
    ]);
    if (p) setProducts(p);
    if (c) setCategories(c);
  }

  async function handleSubmit() {
    if (!form.name_fr || !form.price) return;
    const imageUrls: string[] = [];
    for (const file of form.images) {
      const ext = file.name.split('.').pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(path, file);
      if (!error) {
        imageUrls.push(supabase.storage.from('images').getPublicUrl(path).data.publicUrl);
      }
    }

    const record = {
      name_fr: form.name_fr,
      description_fr: form.description_fr,
      category_id: form.category_id || null,
      price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      is_pack: form.is_pack,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      colors: form.hasColors ? form.colors : [],
    };

    if (editingId) {
      await supabase.from('products').update(record).eq('id', editingId);
      toast({ title: 'Produit modifié' });
    } else {
      await supabase.from('products').insert(record);
      toast({ title: 'Produit ajouté' });
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    load();
  }

  function editProduct(p: any) {
    setForm({
      name_fr: p.name_fr,
      description_fr: p.description_fr || '',
      category_id: p.category_id || '',
      price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : '',
      is_pack: p.is_pack,
      hasColors: (p.colors || []).length > 0,
      colors: p.colors || [],
      images: [],
      imagePreviews: p.images || [],
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit?')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
    toast({ title: 'Produit supprimé' });
  }

  function addColor() {
    setForm({ ...form, colors: [...form.colors, { name: '', hex: '#000000' }] });
  }

  function handleImageFiles(files: FileList) {
    const newFiles = Array.from(files);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setForm({ ...form, images: [...form.images, ...newFiles], imagePreviews: [...form.imagePreviews, ...previews] });
  }

  if (showForm) {
    const discount = form.old_price && form.price
      ? Math.round(((parseFloat(form.old_price) - parseFloat(form.price)) / parseFloat(form.old_price)) * 100)
      : 0;

    return (
      <AdminLayout>
        <div className="space-y-4">
          <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-1 text-background/50 text-xs">
            <ArrowLeft className="w-3 h-3" /> Retour
          </button>
          <h2 className="text-sm font-bold text-background">{editingId ? 'Modifier' : 'Ajouter'} un produit</h2>

          <input type="text" placeholder="Nom du produit (FR)" value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} className="w-full px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none" />
          <textarea placeholder="Description (FR)" value={form.description_fr} onChange={e => setForm({ ...form, description_fr: e.target.value })} className="w-full px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none min-h-[80px]" />

          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none">
            <option value="">Catégorie</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Prix (DA)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none" />
            <div className="relative">
              <input type="number" placeholder="Ancien prix" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} className="w-full px-3 py-2 bg-white/5 text-background text-sm border border-white/10 focus:border-primary focus:outline-none" />
              {discount > 0 && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-xs font-bold">-{discount}%</span>}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-background">
            <input type="checkbox" checked={form.is_pack} onChange={e => setForm({ ...form, is_pack: e.target.checked })} className="accent-primary" />
            Est un Pack?
          </label>

          <div>
            <p className="text-xs text-background/50 mb-2">Images</p>
            <input type="file" accept="image/*" multiple onChange={e => e.target.files && handleImageFiles(e.target.files)} className="text-xs text-background/50" />
            {form.imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {form.imagePreviews.map((src, i) => <img key={i} src={src} alt="" className="w-16 h-16 object-cover" />)}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-background">
            <input type="checkbox" checked={form.hasColors} onChange={e => setForm({ ...form, hasColors: e.target.checked })} className="accent-primary" />
            Couleurs disponibles?
          </label>

          {form.hasColors && (
            <div className="space-y-2">
              {form.colors.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="color" value={c.hex} onChange={e => { const colors = [...form.colors]; colors[i].hex = e.target.value; setForm({ ...form, colors }); }} className="w-8 h-8 border-0 p-0" />
                  <input type="text" placeholder="Nom" value={c.name} onChange={e => { const colors = [...form.colors]; colors[i].name = e.target.value; setForm({ ...form, colors }); }} className="flex-1 px-2 py-1 bg-white/5 text-background text-xs border border-white/10" />
                  <button onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={addColor} className="text-primary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter couleur</button>
            </div>
          )}

          <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-widest">
            {editingId ? 'Modifier' : 'Enregistrer'}
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-background">Produits</h2>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">
            <Plus className="w-3 h-3" /> Ajouter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-background/50">
                <th className="text-left py-2">Img</th>
                <th className="text-left py-2">Nom</th>
                <th className="text-right py-2">Prix</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-10 h-10 object-cover" /> : <div className="w-10 h-10 bg-white/5" />}
                  </td>
                  <td className="py-2 text-background">
                    <p className="font-medium">{p.name_fr}</p>
                    <div className="flex gap-1 mt-0.5">
                      {p.is_pack && <span className="text-[9px] bg-white/10 px-1">PACK</span>}
                      {p.old_price && <span className="text-[9px] text-primary">-{Math.round(((p.old_price - p.price) / p.old_price) * 100)}%</span>}
                    </div>
                  </td>
                  <td className="py-2 text-right text-primary font-bold">{p.price} DA</td>
                  <td className="py-2 text-right space-x-2">
                    <button onClick={() => editProduct(p)} className="text-background/50 hover:text-primary text-[10px]">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
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
