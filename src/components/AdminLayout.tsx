import { ReactNode, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Grid3X3, Truck, LogOut } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Stats' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Commandes' },
  { to: '/admin/categories', icon: Grid3X3, label: 'Catégories' },
  { to: '/admin/products', icon: Package, label: 'Produits' },
  { to: '/admin/tarifs', icon: Truck, label: 'Tarifs' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('nova_admin') !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('nova_admin');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-foreground text-background">
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-black tracking-wider">NOVA DECO <span className="text-primary text-xs font-normal ml-1">Admin</span></h1>
        <button onClick={logout} className="text-background/50 hover:text-primary">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <nav className="flex border-b border-white/10 overflow-x-auto hide-scrollbar">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium shrink-0 border-b-2 transition-colors ${
              location.pathname === item.to
                ? 'border-primary text-primary'
                : 'border-transparent text-background/50 hover:text-background'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="p-4">{children}</main>
    </div>
  );
}
