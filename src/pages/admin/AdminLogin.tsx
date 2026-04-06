import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'admin@gmail.com';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password
      });
      if (error) throw error;
      toast({ title: 'Connecté' });
      navigate('/admin');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-foreground tracking-wider">NOVA DECO</h1>
          <p className="text-primary text-xs mt-1 uppercase font-bold tracking-widest">Administration</p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Admin Password</p>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            {loading ? 'Connexion...' : 'Connexion'}
          </button>
        </div>
      </div>
    </div>
  );
}
