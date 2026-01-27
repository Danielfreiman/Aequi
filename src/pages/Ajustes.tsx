import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Store = {
  id: string;
  name: string;
  location: string | null;
};

type Category = {
  id: string;
  name: string;
};

export function Ajustes() {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: '', avatar_url: '' });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const [{ data: profileData, error: profileError }, { data: storeData, error: storeError }, { data: categoryData, error: categoryError }] =
        await Promise.all([
          supabase.from('profiles').select('id, name, avatar_url').limit(1).single(),
          supabase.from('stores').select('id,name,location').order('name', { ascending: true }),
          supabase.from('finance_categories').select('id,name').order('name', { ascending: true }),
        ]);

      if (profileError || storeError || categoryError) {
        setError(profileError?.message || storeError?.message || categoryError?.message || 'Erro ao carregar dados.');
      } else {
        setProfileId(profileData?.id || null);
        setProfile({ name: profileData?.name || '', avatar_url: profileData?.avatar_url || '' });
        setStores(storeData || []);
        setCategories(categoryData || []);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleProfileUpdate = async () => {
    if (!profileId) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name: profile.name, avatar_url: profile.avatar_url })
      .eq('id', profileId);

    if (updateError) {
      setError(updateError.message);
    }

    setSaving(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !profileId) return;
    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase.from('finance_categories').insert({
      profile_id: profileId,
      name: newCategory.trim(),
      source: 'manual',
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setNewCategory('');
      const { data: updated } = await supabase
        .from('finance_categories')
        .select('id,name')
        .order('name', { ascending: true });
      setCategories(updated || data || []);
    }

    setSaving(false);
  };

  const storeCountLabel = useMemo(() => `${stores.length} lojas vinculadas`, [stores.length]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">Ajustes</h2>
        <p className="text-slate-600 text-sm">Central de cadastro de categorias e gestão básica de lojas.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-navy">Perfil</h3>
            <p className="text-sm text-slate-500">Atualize seu nome e foto de perfil.</p>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nome</label>
            <input
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              placeholder="Seu nome"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <label className="text-xs font-semibold text-slate-500 uppercase">Foto de Perfil (URL)</label>
            <input
              value={profile.avatar_url}
              onChange={(event) => setProfile({ ...profile, avatar_url: event.target.value })}
              placeholder="URL da foto"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleProfileUpdate}
              disabled={saving || !profileId}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Atualizar Perfil'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-navy">Lojas</h3>
            <p className="text-sm text-slate-500">{loading ? 'Carregando...' : storeCountLabel}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-semibold text-navy">{store.name}</p>
                  <p className="text-slate-500">{store.location || 'Sem localização'}</p>
                </div>
              </div>
            ))}
            {!loading && stores.length === 0 && (
              <div className="p-6 text-sm text-slate-500">Nenhuma loja encontrada.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-navy">Categorias financeiras</h3>
            <p className="text-sm text-slate-500">Central de cadastro para contas a pagar/receber.</p>
          </div>
          <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase">Adicionar categoria</label>
            <div className="flex flex-wrap gap-2">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Ex: Taxas bancárias"
                className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || saving || !profileId}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 text-sm">
                <span className="font-semibold text-navy">{category.name}</span>
              </div>
            ))}
            {!loading && categories.length === 0 && (
              <div className="p-6 text-sm text-slate-500">Nenhuma categoria encontrada.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
