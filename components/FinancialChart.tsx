import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { DailyStat } from '../types';

const data: DailyStat[] = [
  { day: 'Seg', sales: 12000, payment: 4200 },
  { day: 'Ter', sales: 19000, payment: 0 },
  { day: 'Qua', sales: 8000, payment: 0 },
  { day: 'Qui', sales: 15000, payment: 12000 },
  { day: 'Sex', sales: 28000, payment: 24000 },
  { day: 'Sáb', sales: 32000, payment: 22000 },
  { day: 'Dom', sales: 24000, payment: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy text-white text-xs py-2 px-3 rounded shadow-lg">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-primary">Vendas: R$ {(payload[0].value / 1000).toFixed(1)}k</p>
        {payload[1] && (
            <p className="text-gray-300">Líquido: R$ {(payload[1].value / 1000).toFixed(1)}k</p>
        )}
      </div>
    );
  }
  return null;
};

export const FinancialChart: React.FC = () => {
  return (
    <div className="w-full h-64 md:h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          barGap={4} 
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
            dy={10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {/* Sales Bar */}
          <Bar 
            dataKey="sales" 
            fill="#e2e8f0" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
             {data.map((entry, index) => (
                <Cell key={`cell-sales-${index}`} fill={index === 4 ? '#2ECC71' : entry.payment > 0 ? '#dbeafe' : '#e2e8f0'} />
              ))}
          </Bar>
          {/* Payment Bar - overlaying or stacked visually as separate in this design style */}
          <Bar 
            dataKey="payment" 
            fill="#2C3E50" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
            // We use a trick with negative margin or custom positioning if we wanted exact overlap, 
            // but for standard bar chart, side-by-side or stacked is standard. 
            // However, to match the "bar inside bar" look of the mock, we can use a composed chart or just side-by-side. 
            // The mockup shows "Sales vs Payment". Let's stick to side-by-side for clarity in Recharts, 
            // or we could use `stackId` if they were additive, but they aren't.
            // A common trick for "bar inside bar" is rendering two bars with same XAxis ID but different widths.
            xAxisId={0}
          />
           <Bar 
            dataKey="payment" 
            fill="#2C3E50" 
            radius={[2, 2, 0, 0]} 
            barSize={12}
            xAxisId={0}
            // This is a "hack" to center the narrower bar on top of the wider bar if we want that look.
            // But Recharts defaults to side-by-side. 
            // Let's stick to the visual provided which implies the dark bar is "inside" or overlaid.
            // To achieve "Bar inside Bar" in Recharts:
            // Use same xAxisId, but render the wider bar first, then the narrower bar.
           />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};