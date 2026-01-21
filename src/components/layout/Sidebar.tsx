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
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const itemClass =
  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#0f2c1f] h-full text-white shrink-0 border-r border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        <div className="p-8 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#103826] to-[#2ecc71] flex items-center justify-center shadow-lg shadow-black/10">
              <UtensilsCrossed className="text-white size-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">Aequi</h1>
              <span className="text-xs text-[#cfe7d6] font-semibold uppercase tracking-wide">Parceiro do operador</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Botão de novo lançamento */}
        <div className="px-4 pb-2">
          <NavLink
            to="/app/operacoes"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white text-sm font-semibold shadow-lg shadow-[#2ecc71]/25 hover:brightness-110 transition"
          >
            <PlusCircle size={18} />
            <span>Novo Lançamento</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
          <NavLink
            to="/app"
            onClick={onClose}
            end
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <LayoutDashboard size={18} />
            <span>Painel</span>
          </NavLink>
          <NavLink
            to="/app/conciliacao"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <Receipt size={18} className="shrink-0" />
            <span>Conciliação iFood</span>
          </NavLink>
          <NavLink
            to="/app/cardapio"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <TrendingUp size={18} className="shrink-0" />
            <span>Engenharia de Cardápio</span>
          </NavLink>
          <NavLink
            to="/app/integracao-ifood"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <Store size={18} className="shrink-0" />
            <span>Integração iFood</span>
          </NavLink>
          <NavLink
            to="/app/produtos"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <Package size={18} className="shrink-0" />
            <span>Produtos</span>
          </NavLink>
          <NavLink
            to="/app/financeiro"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <Wallet size={18} className="shrink-0" />
            <span>Financeiro</span>
          </NavLink>
          <NavLink
            to="/app/contas-pagar"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <BadgeDollarSign size={18} className="shrink-0" />
            <span>Contas a Pagar</span>
          </NavLink>
          <NavLink
            to="/app/contas-receber"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <ClipboardList size={18} className="shrink-0" />
            <span>Contas a Receber</span>
          </NavLink>
          <NavLink
            to="/app/dre"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <LineChart size={18} className="shrink-0" />
            <span>DRE</span>
          </NavLink>
          <NavLink
            to="/app/ponto"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <CalendarClock size={18} className="shrink-0" />
            <span>Ponto</span>
          </NavLink>
          <NavLink
            to="/app/rh"
            onClick={onClose}
            className={({ isActive }) =>
              `${itemClass} ${isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/85'}`
            }
          >
            <Users size={18} className="shrink-0" />
            <span>RH</span>
          </NavLink>
          <NavLink
            to="/app/ajustes"
            onClick={onClose}
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
    </>
  );
}
