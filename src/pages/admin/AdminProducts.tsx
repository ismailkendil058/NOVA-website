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
        <div className="space-y-6">
          <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase hover:text-foreground transition-colors">
            <ArrowLeft className="w-3 h-3" /> Retour
          </button>

          <div className="bg-white border border-border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{editingId ? 'Modifier' : 'Ajouter'} un produit</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Désignation (FR)</p>
                <input type="text" placeholder="Nom du produit" value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Description (FR)</p>
                <textarea placeholder="Détails du produit..." value={form.description_fr} onChange={e => setForm({ ...form, description_fr: e.target.value })} className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none min-h-[100px] transition-all" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Catégorie</p>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Prix de vente (DA)</p>
                  <input type="number" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Ancien prix (Optionnel)</p>
                  <div className="relative">
                    <input type="number" placeholder="0.00" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all" />
                    {discount > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">-{discount}%</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded border border-border/50">
                <input type="checkbox" id="is_pack" checked={form.is_pack} onChange={e => setForm({ ...form, is_pack: e.target.checked })} className="w-4 h-4 accent-primary" />
                <label htmlFor="is_pack" className="text-xs font-bold uppercase text-foreground cursor-pointer">Ce produit est un Pack</label>
              </div>

              <div className="bg-zinc-50 p-4 border border-dashed border-border rounded-lg">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3">Galerie Images</p>
                <div className="flex flex-col gap-4">
                  <input type="file" accept="image/*" multiple onChange={e => e.target.files && handleImageFiles(e.target.files)} className="text-xs text-muted-foreground file:bg-primary file:text-primary-foreground file:border-0 file:px-3 file:py-1 file:mr-3 file:font-bold file:uppercase file:text-[10px] cursor-pointer" />
                  {form.imagePreviews.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {form.imagePreviews.map((src, i) => (
                        <div key={i} className="relative shrink-0">
                          <img src={src} alt="" className="w-20 h-20 object-cover rounded-md border border-border shadow-sm" />
                          <button onClick={() => setForm({ ...form, imagePreviews: form.imagePreviews.filter((_, j) => j !== i) })} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="hasColors" checked={form.hasColors} onChange={e => setForm({ ...form, hasColors: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <label htmlFor="hasColors" className="text-xs font-bold uppercase text-foreground cursor-pointer">Couleurs disponibles?</label>
                </div>

                {form.hasColors && (
                  <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 space-y-3">
                    {form.colors.map((c, i) => (
                      <div key={i} className="flex gap-3 items-center bg-white p-2 border border-border rounded shadow-sm transition-all">
                        <input type="color" value={c.hex} onChange={e => { const colors = [...form.colors]; colors[i].hex = e.target.value; setForm({ ...form, colors }); }} className="w-10 h-10 border-0 p-0 cursor-pointer rounded overflow-hidden" />
                        <input type="text" placeholder="Nom de la couleur (Ex: Rouge)" value={c.name} onChange={e => { const colors = [...form.colors]; colors[i].name = e.target.value; setForm({ ...form, colors }); }} className="flex-1 px-3 py-2 bg-secondary text-foreground text-xs border border-border focus:border-primary focus:outline-none" />
                        <button onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })} className="text-destructive p-2 hover:bg-destructive/10 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={addColor} className="w-full py-2 border border-dashed border-primary/30 text-primary text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"><Plus className="w-4 h-4" /> Ajouter une variante couleur</button>
                  </div>
                )}
              </div>

              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                {editingId ? 'Valider les modifications' : 'Enregistrer le produit'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 border border-border shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Gestion Stock Produits</h2>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Nouveau Produit
          </button>
        </div>

        <div className="bg-white border border-border shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-50 text-muted-foreground uppercase font-bold text-[10px]">
                <th className="text-left py-4 px-4">Aperçu</th>
                <th className="text-left py-4 px-4">Désignation</th>
                <th className="text-right py-4 px-4">Prix Unitaire</th>
                <th className="text-right py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-4">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-md border border-border shadow-sm" /> : <div className="w-12 h-12 bg-secondary rounded-md" />}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-black text-foreground text-sm tracking-tight">{p.name_fr}</p>
                    <div className="flex gap-2 mt-1">
                      {p.is_pack && <span className="text-[9px] bg-foreground text-background font-black px-1.5 py-0.5 rounded-sm">PACK</span>}
                      {p.old_price && <span className="text-[9px] bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-sm">PROMO -{Math.round(((p.old_price - p.price) / p.old_price) * 100)}%</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-lg font-black text-primary">{p.price} <span className="text-[10px] text-muted-foreground">DA</span></p>
                    {p.old_price && <p className="text-[10px] text-muted-foreground line-through decoration-destructive/50">{p.old_price} DA</p>}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button onClick={() => editProduct(p)} className="bg-secondary text-foreground font-bold px-3 py-1.5 text-[10px] uppercase border border-border hover:bg-zinc-100 transition-all">Modifier</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-full transition-all inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
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
