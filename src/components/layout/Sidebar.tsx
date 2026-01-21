import {
  BadgeDollarSign,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  CalendarClock,
  LineChart,
  UtensilsCrossed,
  Upload,
  Package,
  Store,
  PlusCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const itemClass =
  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors';

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-72 bg-[#0f2c1f] h-full text-white shrink-0 border-r border-white/10 relative z-20">
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#103826] to-[#2ecc71] flex items-center justify-center shadow-lg shadow-black/10">
            <UtensilsCrossed className="text-white size-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Aequi</h1>
            <span className="text-xs text-[#cfe7d6] font-semibold uppercase tracking-wide">Parceiro do operador</span>
          </div>
        </div>
      </div>

      {/* Botão de novo lançamento */}
      <div className="px-4 pb-2">
        <NavLink
          to="/app/operacoes"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white text-sm font-semibold shadow-lg shadow-[#2ecc71]/25 hover:brightness-110 transition"
        >
          <PlusCircle size={18} />
          <span>Novo Lançamento</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Painel</span>
        </NavLink>
        <NavLink
          to="/app/conciliacao"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <Receipt size={18} className="shrink-0" />
          <span>Conciliação iFood</span>
        </NavLink>
        <NavLink
          to="/app/cardapio"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <TrendingUp size={18} className="shrink-0" />
          <span>Engenharia de Cardápio</span>
        </NavLink>
        <NavLink
          to="/app/integracao-ifood"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <Store size={18} className="shrink-0" />
          <span>Integração iFood</span>
        </NavLink>
        <NavLink
          to="/app/produtos"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <Package size={18} className="shrink-0" />
          <span>Produtos</span>
        </NavLink>
        <NavLink
          to="/app/financeiro"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <Wallet size={18} className="shrink-0" />
          <span>Financeiro</span>
        </NavLink>
        <NavLink
          to="/app/contas-pagar"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <BadgeDollarSign size={18} className="shrink-0" />
          <span>Contas a Pagar</span>
        </NavLink>
        <NavLink
          to="/app/contas-receber"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <ClipboardList size={18} className="shrink-0" />
          <span>Contas a Receber</span>
        </NavLink>
        <NavLink
          to="/app/dre"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <LineChart size={18} className="shrink-0" />
          <span>DRE</span>
        </NavLink>
        <NavLink
          to="/app/ponto"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <CalendarClock size={18} className="shrink-0" />
          <span>Ponto</span>
        </NavLink>
        <NavLink
          to="/app/rh"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <Users size={18} className="shrink-0" />
          <span>RH</span>
        </NavLink>
        <NavLink
          to="/app/ajustes"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
          }
        >
          <Settings size={18} className="shrink-0" />
          <span>Ajustes</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full bg-cover bg-center border-2 border-primary/30"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADGEL_rPodJZEaa-dkKZEwihTiGl_kGJV1AJsERpjdYU7GibHDPGVjTpAUpTyN0b_qMveepUpjHdFkwqb8RJ6X0VrMwhv0FG_BJnQIFRwDSzsAGmihptKU00IuKeaZAsO_jqqJp4-mWTYxQ0Z9t7d8iAAyoxBhxsUtBRU0TkQIp10kROUz2yvvnZf34zkd5ItFYPQ7MGoLDaOJ40Zd1ZhSFVxwLFKONs1w3lN239MxngdVfn3VHUS6BmrWYpU7VukC6qCm2j9UFNqi')",
            }}
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-white truncate">Chef Antônio</span>
            <span className="text-xs text-white/60 truncate">Sapore Italiano</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
