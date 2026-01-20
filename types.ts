export interface Dish {
  id: string;
  name: string;
  orders: number;
  marginIncrease: number;
  imageUrl: string;
}

export interface DailyStat {
  day: string;
  sales: number;
  payment: number;
}

export interface KpiData {
  value: string;
  label: string;
  trend?: number;
  trendLabel?: string;
  icon: 'money' | 'pending';
}