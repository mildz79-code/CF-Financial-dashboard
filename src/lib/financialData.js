import { supabase, hasSupabaseEnv } from './supabaseClient';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildDefaultMonthlyRow = (month) => ({
  month,
  revenue: 0,
  cogs: 0,
  opex: 0,
  other: 0,
  grossProfit: 0,
  netIncome: 0,
});

const createDefaultSeries = () => MONTH_ABBR.map(buildDefaultMonthlyRow);

const toNumber = (value) => Number(value ?? 0);

export const fetchYearSummary = async (year = 2026, source = 'actual') => {
  if (!hasSupabaseEnv || !supabase) {
    return {
      configured: false,
      year,
      source,
      rows: createDefaultSeries(),
      totals: {
        revenue: 0,
        cogs: 0,
        opex: 0,
        other: 0,
        grossProfit: 0,
        netIncome: 0,
      },
    };
  }

  const { data, error } = await supabase
    .from('pl_category_summary')
    .select('month,revenue,cogs,opex,other,gross_profit,net_income')
    .eq('year', year)
    .eq('source', source)
    .order('month', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = createDefaultSeries();

  for (const row of data ?? []) {
    const idx = Number(row.month) - 1;
    if (idx < 0 || idx > 11) continue;

    rows[idx] = {
      month: MONTH_ABBR[idx],
      revenue: toNumber(row.revenue),
      cogs: toNumber(row.cogs),
      opex: toNumber(row.opex),
      other: toNumber(row.other),
      grossProfit: toNumber(row.gross_profit),
      netIncome: toNumber(row.net_income),
    };
  }

  const totals = rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      opex: acc.opex + row.opex,
      other: acc.other + row.other,
      grossProfit: acc.grossProfit + row.grossProfit,
      netIncome: acc.netIncome + row.netIncome,
    }),
    {
      revenue: 0,
      cogs: 0,
      opex: 0,
      other: 0,
      grossProfit: 0,
      netIncome: 0,
    }
  );

  return {
    configured: true,
    year,
    source,
    rows,
    totals,
  };
};
