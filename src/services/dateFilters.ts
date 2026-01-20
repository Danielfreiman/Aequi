export type PeriodKey = 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'geral' | 'custom';

export const quickPeriods: Record<PeriodKey, { label: string; range: () => { start: Date | null; end: Date | null } }> = {
  mes_atual: {
    label: 'Este mês',
    range: () => {
      const n = new Date();
      return { start: new Date(n.getFullYear(), n.getMonth(), 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0) };
    },
  },
  mes_anterior: {
    label: 'Mês anterior',
    range: () => {
      const n = new Date();
      return { start: new Date(n.getFullYear(), n.getMonth() - 1, 1), end: new Date(n.getFullYear(), n.getMonth(), 0) };
    },
  },
  ano_atual: {
    label: 'Ano',
    range: () => {
      const n = new Date();
      return { start: new Date(n.getFullYear(), 0, 1), end: new Date(n.getFullYear(), 11, 31) };
    },
  },
  geral: {
    label: 'Geral',
    range: () => ({ start: null, end: null }),
  },
  custom: {
    label: 'Personalizado',
    range: () => ({ start: null, end: null }),
  },
};
