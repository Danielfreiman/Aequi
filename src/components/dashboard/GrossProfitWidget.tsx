import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GrossProfitData {
    revenue: number;
    cost: number;
    grossProfit: number;
    margin: number;
    missingCostCount: number;
}

export function GrossProfitWidget({ userId }: { userId: string | null }) {
    const [data, setData] = useState<GrossProfitData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('owner_id', userId)
                    .single();

                if (!profile) return;

                // Fetch data from the view we devised earlier
                const { data: analysis, error } = await supabase
                    .from('view_ifood_cmv_analysis')
                    .select('*')
                    .eq('profile_id', profile.id);

                if (error) throw error;

                let totalRevenue = 0;
                let totalCost = 0;

                // Summing up
                analysis?.forEach((row: any) => {
                    totalRevenue += Number(row.revenue || 0);
                    totalCost += Number(row.estimated_total_cost || 0);
                });

                // Check for products sold with NO cost (cost is null or 0)
                // We need a separate query or join analysis logic.
                // The view returns estimated_total_cost, which is quantity * cost.
                // If cost is null, the sum might be null or 0.
                // Let's verify products in `ifood_order_items` that have no cost in `products`.

                const { count, error: countError } = await supabase
                    .from('ifood_order_items')
                    .select('ifood_product_id', { count: 'exact', head: true })
                    .not('ifood_product_id', 'is', null);

                // Since we can't easily join in client-side to find missing costs efficiently without a specific view,
                // let's rely on checking if any product with `ifood_id` in the `products` table has cost 0 or null
                // AND appears in orders.

                // Better approach: fetch all active products associated with recent orders and check their costs.
                // For simplicity/performance in this widget, let's just count products with cost = 0 or null
                // that are linked to iFood.
                const { count: missingCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('profile_id', profile.id)
                    .not('ifood_id', 'is', null)
                    .or('cost.is.null,cost.eq.0');

                setData({
                    revenue: totalRevenue,
                    cost: totalCost,
                    grossProfit: totalRevenue - totalCost,
                    margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
                    missingCostCount: missingCount || 0
                });

            } catch (error) {
                console.error('Error fetching profit data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) return <div className="animate-pulse h-32 bg-white rounded-2xl"></div>;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={20} />
                    Lucro Bruto (iFood)
                </h3>
                {data && data.missingCostCount > 0 && (
                    <Link to="/app/produtos" className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-orange-100 transition">
                        <AlertTriangle size={12} />
                        {data.missingCostCount} produtos sem custo
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Vendas (Liq.)</p>
                    <p className="text-lg font-bold text-navy">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.revenue || 0)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Custo (CMV)</p>
                    <p className="text-lg font-bold text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.cost || 0)}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm font-semibold text-slate-600">Lucro Bruto</p>
                        <p className="text-2xl font-black text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.grossProfit || 0)}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-sm font-bold ${data?.margin || 0 >= 30 ? 'text-green-600' : 'text-orange-500'}`}>
                            {(data?.margin || 0).toFixed(1)}%
                        </span>
                        <p className="text-xs text-slate-400">Margem</p>
                    </div>
                </div>
                {data && data.missingCostCount > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs text-red-700 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Cálculo pode estar incorreto. Existem produtos vendidos sem custo cadastrado.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
