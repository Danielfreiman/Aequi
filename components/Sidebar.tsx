import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Receipt, TrendingUp, Settings, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Sidebar: React.FC = () => {
  const [profile, setProfile] = useState({ nome_restaurante: 'Chef Antônio', avatar_url: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase.from('profiles').select('nome_restaurante, avatar_url').limit(1).single();
      if (!error && data) {
        setProfile({
          nome_restaurante: data.nome_restaurante || 'Chef Antônio',
          avatar_url: data.avatar_url || '',
        });
      }
    };

    fetchProfile();
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-72 bg-navy h-full text-white shrink-0 relative z-20">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <UtensilsCrossed className="text-white size-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Aequi</h1>
            <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Parceiros</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary transition-colors group cursor-pointer">
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm">Painel</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer">
          <Receipt size={20} className="group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">Conciliação iFood</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer">
          <TrendingUp size={20} className="group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">Análise de Margem</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer">
          <Settings size={20} className="group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">Configurações</span>
        </a>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left">
          <div 
            className="size-10 rounded-full bg-cover bg-center border-2 border-primary/30" 
            style={{ backgroundImage: `url(${profile.avatar_url || 'https://via.placeholder.com/150'})` }}
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-white truncate">{profile.nome_restaurante}</span>
            <span className="text-xs text-gray-400 truncate">Sapore Italiano</span>
          </div>
          <ChevronDown className="text-gray-500 ml-auto size-5" />
        </button>
      </div>
    </aside>
  );
};