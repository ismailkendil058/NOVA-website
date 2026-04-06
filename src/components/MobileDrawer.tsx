import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Home, Grid3X3, Package, ShoppingCart, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed top-4 left-4 z-50 bg-foreground/80 backdrop-blur-sm p-2">
          <Menu className="w-5 h-5 text-background" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 bg-foreground border-none p-0 focus:outline-none"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-black text-background tracking-wider">NOVA DECO</h2>
            <p className="text-primary text-xs mt-1 font-light">Décoration & Peinture</p>
          </div>

          <nav className="flex-1 p-6 space-y-1">
            {[
              { to: '/', icon: Home, label: 'Accueil' },
              { to: '/#packs', icon: Package, label: 'Packs & Promos' },
              { to: '/cart', icon: ShoppingCart, label: 'Panier' },
              { to: '/#footer', icon: Phone, label: 'Contact' },
            ].map(item => (
              <SheetClose asChild key={item.to}>
                {item.to.includes('#') ? (
                  <a
                    href={item.to}
                    className="flex items-center gap-3 px-3 py-3 text-background/70 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-3 text-background/70 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )}
              </SheetClose>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <p className="text-background/40 text-xs mb-4">Ouled Heddaj, ALGER</p>
            <div className="flex gap-4">
              <a href="#" className="text-background/50 hover:text-primary transition-colors text-xs">IG</a>
              <a href="#" className="text-background/50 hover:text-primary transition-colors text-xs">FB</a>
              <a href="#" className="text-background/50 hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
