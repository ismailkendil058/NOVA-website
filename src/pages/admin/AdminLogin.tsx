import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'novadeco2024';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('nova_admin', 'true');
      navigate('/admin');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-background tracking-wider">NOVA DECO</h1>
          <p className="text-primary text-xs mt-1">Administration</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-white/10 text-background text-sm border border-white/20 focus:border-primary focus:outline-none"
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-widest"
          >
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}
