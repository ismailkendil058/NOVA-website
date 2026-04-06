import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Grid3X3, Truck, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { to: '/admin/orders', icon: ShoppingCart, label: 'Commandes' },
  { to: '/admin/categories', icon: Grid3X3, label: 'Catégories' },
  { to: '/admin/products', icon: Package, label: 'Produits' },
  { to: '/admin/tarifs', icon: Truck, label: 'Tarifs' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-black tracking-wider text-foreground">NOVA DECO <span className="text-primary text-xs font-normal ml-1">Admin</span></h1>
        <button onClick={logout} className="text-muted-foreground hover:text-primary transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <nav className="flex border-b border-border overflow-x-auto hide-scrollbar">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium shrink-0 border-b-2 transition-colors ${location.pathname === item.to
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="p-4 bg-zinc-50/50 min-h-[calc(100vh-100px)]">{children}</main>
    </div>
  );
}
