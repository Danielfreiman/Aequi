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
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const itemClass =
  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors';

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-72 bg-navy h-full text-white shrink-0">
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <UtensilsCrossed className="text-white size-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Aequi</h1>
            <span className="text-xs text-gray-300 font-semibold uppercase tracking-wide">Parceiros</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Painel</span>
        </NavLink>
        <NavLink
          to="/app/conciliacao"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <Receipt size={18} className="shrink-0" />
          <span>Conciliação iFood</span>
        </NavLink>
        <NavLink
          to="/app/cardapio"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <TrendingUp size={18} className="shrink-0" />
          <span>Engenharia de Cardápio</span>
        </NavLink>
        <NavLink
          to="/app/financeiro"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <Wallet size={18} className="shrink-0" />
          <span>Financeiro</span>
        </NavLink>
        <NavLink
          to="/app/contas-pagar"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <BadgeDollarSign size={18} className="shrink-0" />
          <span>Contas a Pagar</span>
        </NavLink>
        <NavLink
          to="/app/contas-receber"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <ClipboardList size={18} className="shrink-0" />
          <span>Contas a Receber</span>
        </NavLink>
        <NavLink
          to="/app/dre"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <LineChart size={18} className="shrink-0" />
          <span>DRE</span>
        </NavLink>
        <NavLink
          to="/app/ponto"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <CalendarClock size={18} className="shrink-0" />
          <span>Ponto</span>
        </NavLink>
        <NavLink
          to="/app/rh"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
          }
        >
          <Users size={18} className="shrink-0" />
          <span>RH</span>
        </NavLink>
        <NavLink
          to="/app/ajustes"
          className={({ isActive }) =>
            `${itemClass} ${isActive ? 'bg-primary/15 text-white border border-primary/30' : 'text-gray-200'}`
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
            <span className="text-xs text-gray-400 truncate">Sapore Italiano</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
