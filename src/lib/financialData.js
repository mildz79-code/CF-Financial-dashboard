import { supabase, hasSupabaseEnv } from './supabaseClient';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const SOURCE_ORDER = ['actual', 'budget', 'forecast'];

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

const emptyTotals = () => ({
  revenue: 0,
  cogs: 0,
  opex: 0,
  other: 0,
  grossProfit: 0,
  netIncome: 0,
});

const createDefaultSources = () =>
  Object.fromEntries(
    SOURCE_ORDER.map((source) => [
      source,
      {
        rows: createDefaultSeries(),
        totals: emptyTotals(),
      },
    ])
  );

const toNumber = (value) => Number(value ?? 0);

const calculateTotals = (rows) =>
  rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      opex: acc.opex + row.opex,
      other: acc.other + row.other,
      grossProfit: acc.grossProfit + row.grossProfit,
      netIncome: acc.netIncome + row.netIncome,
    }),
    emptyTotals()
  );

const normalizeLineItem = (row) => ({
  label: row.label,
  category: row.category,
  sortOrder: row.sort_order ?? 0,
  monthly: MONTH_KEYS.map((key) => toNumber(row[key])),
  total: toNumber(row.total),
});

export const fetchYearSummary = async (year = 2026, source = 'actual') => {
  if (!hasSupabaseEnv || !supabase) {
    return {
      configured: false,
      year,
      source,
      rows: createDefaultSeries(),
      totals: emptyTotals(),
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

  return {
    configured: true,
    year,
    source,
    rows,
    totals: calculateTotals(rows),
  };
};

export const fetchDashboardDataset = async (year = 2026) => {
  if (!hasSupabaseEnv || !supabase) {
    return {
      configured: false,
      year,
      sources: createDefaultSources(),
      lineItemsBySource: Object.fromEntries(SOURCE_ORDER.map((source) => [source, []])),
      availableSources: SOURCE_ORDER,
    };
  }

  const [summaryResp, lineItemsResp] = await Promise.all([
    supabase
      .from('pl_category_summary')
      .select('source,month,revenue,cogs,opex,other,gross_profit,net_income')
      .eq('year', year)
      .order('month', { ascending: true }),
    supabase
      .from('pl_monthly_wide')
      .select('source,label,category,sort_order,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec,total')
      .eq('year', year)
      .order('sort_order', { ascending: true }),
  ]);

  if (summaryResp.error) throw summaryResp.error;
  if (lineItemsResp.error) throw lineItemsResp.error;

  const sources = createDefaultSources();

  for (const row of summaryResp.data ?? []) {
    const source = SOURCE_ORDER.includes(row.source) ? row.source : 'actual';
    const idx = Number(row.month) - 1;
    if (idx < 0 || idx > 11) continue;

    sources[source].rows[idx] = {
      month: MONTH_ABBR[idx],
      revenue: toNumber(row.revenue),
      cogs: toNumber(row.cogs),
      opex: toNumber(row.opex),
      other: toNumber(row.other),
      grossProfit: toNumber(row.gross_profit),
      netIncome: toNumber(row.net_income),
    };
  }

  for (const source of SOURCE_ORDER) {
    sources[source].totals = calculateTotals(sources[source].rows);
  }

  const lineItemsBySource = Object.fromEntries(SOURCE_ORDER.map((source) => [source, []]));

  for (const row of lineItemsResp.data ?? []) {
    const source = SOURCE_ORDER.includes(row.source) ? row.source : 'actual';
    lineItemsBySource[source].push(normalizeLineItem(row));
  }

  const availableSources = SOURCE_ORDER.filter((source) => {
    const t = sources[source].totals;
    const sum = Math.abs(t.revenue) + Math.abs(t.cogs) + Math.abs(t.opex) + Math.abs(t.other);
    return sum > 0 || lineItemsBySource[source].length > 0;
  });

  return {
    configured: true,
    year,
    sources,
    lineItemsBySource,
    availableSources: availableSources.length ? availableSources : SOURCE_ORDER,
  };
};
