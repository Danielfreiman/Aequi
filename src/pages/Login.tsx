import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/app');
    }

    setLoading(false);
  };

  const handleCheckout = () => navigate('/assinar');

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-100 shadow-soft p-8 space-y-6">
        <div>
          <span className="text-xs font-bold rounded-full bg-primary/10 text-primary px-3 py-1">Área do parceiro</span>
          <h1 className="text-3xl font-black text-navy mt-3">Entrar na Aequi</h1>
          <p className="text-slate-500 text-sm">Acesse seu painel financeiro e gerencie as lojas.</p>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <label className="block text-sm font-semibold text-slate-600">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="voce@restaurante.com"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="********"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-white font-semibold py-3 hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full rounded-xl border border-navy/20 text-navy font-semibold py-3 hover:bg-navy/5 transition"
          >
            Ainda não assinou? Começar assinatura
          </button>
        </form>
      </div>
    </div>
  );
}
