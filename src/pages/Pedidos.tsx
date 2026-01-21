import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';
import {
    ShoppingBag,
    Search,
    Calendar,
    RefreshCw,
    Check,
    X,
    ChevronRight,
    Filter
} from 'lucide-react';

interface Order {
    id: string;
    ifood_order_id: string;
    short_code: string;
    order_type: string;
    order_status: string;
    customer_name: string;
    total_amount: number;
    order_timestamp: string;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function Pedidos() {
    const { userId } = useAuthSession();
    const [profileId, setProfileId] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Carrega profileId
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('owner_id', userId)
                .single();
            if (data) setProfileId(data.id);
        };
        fetchProfile();
    }, [userId]);

    const loadOrders = async () => {
        if (!profileId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ifood_orders')
                .select('*')
                .eq('profile_id', profileId)
                .order('order_timestamp', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [profileId]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.short_code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-navy">Gestão de Pedidos</h2>
                    <p className="text-slate-600 text-sm">Acompanhe todos os pedidos integrados do iFood.</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Sincronizar
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm"
                    />
                </div>
                <div className="relative">
                    <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm appearance-none"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="CONCLUDED">Concluídos</option>
                        <option value="CANCELLED">Cancelados</option>
                    </select>
                </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-navy">Código</th>
                                <th className="px-6 py-4 font-bold text-navy">Data/Hora</th>
                                <th className="px-6 py-4 font-bold text-navy">Cliente</th>
                                <th className="px-6 py-4 font-bold text-navy">Tipo</th>
                                <th className="px-6 py-4 font-bold text-navy">Valor</th>
                                <th className="px-6 py-4 font-bold text-navy">Status</th>
                                <th className="px-6 py-4 font-bold text-navy text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary/40" />
                                        Carregando histórico...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum pedido encontrado.
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-bold text-navy">#{order.short_code}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(order.order_timestamp).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-navy">{order.customer_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${order.order_type === 'DELIVERY' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {order.order_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-navy">{currencyFormatter.format(order.total_amount)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`size-2 rounded-full ${order.order_status === 'CONCLUDED' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="font-medium text-slate-700">{order.order_status === 'CONCLUDED' ? 'Concluído' : 'Cancelado'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-navy transition">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
