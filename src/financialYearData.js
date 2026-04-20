/**
 * FY 2024 / FY 2025 datasets for separate dashboard pages.
 * 2025: headline annuals ($13.28M revenue, $9.67M COGS, $523K net → implied OpEx).
 * 2024: YoY baselines (+7.3% revenue, +84.2% net, margin deltas vs 2025).
 */

const COLORS = {
  teal: '#0D4F4F',
  mid: '#1A8A8A',
  coral: '#E07B54',
  mint: '#2EC4B6',
  tan: '#D4A574',
  slate: '#94A7B0',
};

const MONTH_SEED = [
  { month: 'Jan', revenue: 1132141, cogs: 823600, opex: 265200, net: 43341, gas: 118000, elec: 78000, water: 32000, waste: 16000 },
  { month: 'Feb', revenue: 1054328, cogs: 767200, opex: 257100, net: 30028, gas: 112000, elec: 74000, water: 30000, waste: 15000 },
  { month: 'Mar', revenue: 978560, cogs: 712400, opex: 243800, net: 22360, gas: 98000, elec: 68000, water: 27000, waste: 13000 },
  { month: 'Apr', revenue: 1098745, cogs: 799800, opex: 258300, net: 40645, gas: 92000, elec: 65000, water: 26000, waste: 13000 },
  { month: 'May', revenue: 1326890, cogs: 965600, opex: 268500, net: 92790, gas: 105000, elec: 72000, water: 31000, waste: 15000 },
  { month: 'Jun', revenue: 1189234, cogs: 865700, opex: 242400, net: 81134, gas: 98000, elec: 70000, water: 30000, waste: 14000 },
  { month: 'Jul', revenue: 1067450, cogs: 777100, opex: 252200, net: 38150, gas: 88000, elec: 66000, water: 28000, waste: 13000 },
  { month: 'Aug', revenue: 1245670, cogs: 906800, opex: 256600, net: 82270, gas: 102000, elec: 71000, water: 30000, waste: 15000 },
  { month: 'Sep', revenue: 1298340, cogs: 945200, opex: 264300, net: 88840, gas: 108000, elec: 74000, water: 31000, waste: 15000 },
  { month: 'Oct', revenue: 1156780, cogs: 842100, opex: 258900, net: 55780, gas: 100000, elec: 70000, water: 29000, waste: 14000 },
  { month: 'Nov', revenue: 1089432, cogs: 793100, opex: 254700, net: 41632, gas: 96000, elec: 67000, water: 28000, waste: 14000 },
  { month: 'Dec', revenue: 944430, cogs: 687400, opex: 250900, net: 6130, gas: 90000, elec: 62000, water: 23000, waste: 14000 },
];

const OPEX_SEED = [
  ['Payroll (Admin)', 845000], ['Payroll Taxes', 156000], ['Employee Benefits', 98000], ['Rent Expense', 1052000],
  ['Rent Management Fee', 262000], ['Professional Fees Legal', 72000], ['Professional Fees Other', 40000], ['Sales Commission', 65000],
  ['Sales Promotion', 18000], ['Office Expense', 42000], ['Office Supplies', 28000], ['Computer & Internet', 36000],
  ['Telephone', 22000], ['Automobile', 48000], ['Repairs Computer', 35000], ['Repairs Equipment', 245000],
  ['Insurance Health', 89000], ['Insurance Truck', 47000], ['Licenses', 15000], ['Contract Labor', 126000],
  ['Outside Service', 78000], ['Interest Expense', 197000], ['Other/Misc', 71000],
];

const COGS_SEED = [
  ['Direct Labor Samuel Hale', 3410000, 'Primary production contractor', 'labor'],
  ['Direct Labor Workforce', 532000, 'Hourly production staff', 'labor'],
  ['Payroll Other COGS', 178000, 'Overtime, bonuses', 'labor'],
  ['Chemical & Dyestuffs', 2353000, 'Dyes, chemicals', 'material'],
  ['Finishing Supplies Paper Tube', 98000, 'Packaging tubes', 'material'],
  ['Lab Supplies Testing', 67000, 'Quality testing', 'material'],
  ['Plant Supplies & Parts', 89000, 'Machine parts', 'material'],
  ['Freight & Shipping', 168000, 'Logistics', 'other'],
  ['Truck Repair', 45000, 'Fleet maintenance', 'other'],
  ['Insurance Liability', 50000, 'Plant coverage', 'other'],
  ['Utilities Gas', 1207000, 'Boiler & heating', 'utility'],
  ['Utilities Electricity', 837000, 'Machine power', 'utility'],
  ['Utilities Water', 345000, 'Process water', 'utility'],
  ['Utilities Wastewater', 171000, 'Treatment', 'utility'],
];

const EXPENSE_ALLOC = [
  { name: 'Payroll', value: 30.5 },
  { name: 'Materials', value: 20.5 },
  { name: 'Utilities', value: 19.3 },
  { name: 'Rent', value: 10.6 },
  { name: 'Prof Fees', value: 1.9 },
  { name: 'Other', value: 17.2 },
];

const TOP5_NAMES = ['Rent', 'Payroll Admin', 'Rent Mgmt', 'Repairs Equipment', 'Interest'];
const TOP5_SEED_VALUES = [1052000, 845000, 262000, 245000, 197000];

function round(n) {
  return Math.round(n);
}

/** Largest remainder: exact integer split of `target` by `weights`. */
function allocateExact(target, weights) {
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (target * w) / wsum);
  const floors = raw.map((x) => Math.floor(x));
  let rem = target - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => ({ i, frac: x - floors[i] })).sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < order.length && rem > 0; k += 1) {
    out[order[k].i] += 1;
    rem -= 1;
  }
  return out;
}

function formatCompactM(v) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `$${(v / 1000).toFixed(2)}K`;
  return `$${round(v)}`;
}

export function getFinancialYearData(year) {
  const is2025 = year === 2025;

  const R25 = 13_280_000;
  const COGS25 = 9_670_000;
  const NET25 = 523_000;
  const OPEX25 = R25 - COGS25 - NET25;
  const GROSS25 = R25 - COGS25;
  const GPM25 = (GROSS25 / R25) * 100;
  const NPM25 = (NET25 / R25) * 100;

  const R24 = R25 / 1.073;
  const NET24 = NET25 / 1.842;
  const GPM24 = GPM25 - 4.2;
  const NPM24 = NPM25 / 1.696;
  const GROSS24 = (GPM24 / 100) * R24;
  const COGS24 = R24 - GROSS24;
  const OPEX24 = R24 - COGS24 - NET24;

  const targetRev = is2025 ? R25 : R24;
  const targetCogs = is2025 ? COGS25 : COGS24;
  const targetOpex = is2025 ? OPEX25 : OPEX24;

  const sumSeed = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);
  const revW = MONTH_SEED.map((m) => m.revenue);
  const cogsW = MONTH_SEED.map((m) => m.cogs);
  const opexW = MONTH_SEED.map((m) => m.opex);
  const revs = allocateExact(round(targetRev), revW);
  const cogss = allocateExact(round(targetCogs), cogsW);
  const opexs = allocateExact(round(targetOpex), opexW);

  const revenueTotal = revs.reduce((s, v) => s + v, 0);

  const cogsSeedTotal = sumSeed(COGS_SEED, (r) => r[1]);
  const sCogs = targetCogs / cogsSeedTotal;

  const cogsItems = COGS_SEED.map(([name, seedAmt, desc, cat]) => {
    const annual = round(seedAmt * sCogs);
    return {
      name,
      annual,
      desc,
      cat,
      pctRev: revenueTotal > 0 ? (annual / revenueTotal) * 100 : 0,
    };
  });

  const utilityAnnual = cogsItems.filter((c) => c.cat === 'utility').reduce((s, c) => s + c.annual, 0);
  const utilMonthWeights = MONTH_SEED.map((m) => m.gas + m.elec + m.water + m.waste);
  const utilMonthTotals = allocateExact(round(utilityAnnual), utilMonthWeights);

  const months = MONTH_SEED.map((m, i) => {
    const revenue = revs[i];
    const cogs = cogss[i];
    const opex = opexs[i];
    const net = revenue - cogs - opex;
    const uTot = m.gas + m.elec + m.water + m.waste;
    const targetU = utilMonthTotals[i];
    const r = uTot > 0 ? targetU / uTot : 0;
    return {
      month: m.month,
      revenue,
      cogs,
      opex,
      net,
      gas: round(m.gas * r),
      elec: round(m.elec * r),
      water: round(m.water * r),
      waste: round(m.waste * r),
    };
  });

  const totals = {
    revenue: months.reduce((s, m) => s + m.revenue, 0),
    cogs: months.reduce((s, m) => s + m.cogs, 0),
    opex: months.reduce((s, m) => s + m.opex, 0),
    net: months.reduce((s, m) => s + m.net, 0),
  };
  const gross = totals.revenue - totals.cogs;
  const gpm = (gross / totals.revenue) * 100;
  const npm = (totals.net / totals.revenue) * 100;
  const cogsPctRev = (totals.cogs / totals.revenue) * 100;

  const opexSeedTotal = OPEX_SEED.reduce((s, [, a]) => s + a, 0);
  const sOpex = targetOpex / opexSeedTotal;
  const opexItems = OPEX_SEED.map(([name, seedAmt]) => {
    const annual = round(seedAmt * sOpex);
    return { name, annual, pctRev: (annual / totals.revenue) * 100 };
  });

  const getOpex = (pred) => opexItems.find((o) => pred(o.name))?.annual ?? 0;

  const payrollBars = [
    { name: 'Samuel Hale', annual: cogsItems.find((c) => c.name.includes('Samuel'))?.annual ?? 0, avg: 0 },
    { name: 'Admin Payroll', annual: getOpex((n) => n.includes('Admin')), avg: 0 },
    { name: 'Workforce', annual: cogsItems.find((c) => c.name.includes('Workforce'))?.annual ?? 0, avg: 0 },
    { name: 'Payroll Other', annual: cogsItems.find((c) => c.name.includes('Payroll Other'))?.annual ?? 0, avg: 0 },
    { name: 'Payroll Taxes', annual: getOpex((n) => n.includes('Taxes')), avg: 0 },
    { name: 'Contract Labor', annual: getOpex((n) => n.includes('Contract Labor')), avg: 0 },
    { name: 'Benefits', annual: getOpex((n) => n.includes('Benefits')), avg: 0 },
  ].map((p) => ({ ...p, avg: round(p.annual / 12) }));

  const top5ExpenseChartData = TOP5_NAMES.map((name, i) => {
    let v = round(TOP5_SEED_VALUES[i] * sOpex);
    if (name === 'Rent') v = getOpex((n) => n.includes('Rent Expense')) + getOpex((n) => n.includes('Rent Management'));
    if (name === 'Payroll Admin') v = getOpex((n) => n.includes('Payroll (Admin)'));
    if (name === 'Repairs Equipment') v = getOpex((n) => n.includes('Repairs Equipment'));
    if (name === 'Interest') v = getOpex((n) => n.includes('Interest'));
    return { name, value: v };
  });

  const expenseAllocation = EXPENSE_ALLOC.map((s, i) => ({
    ...s,
    color: [COLORS.teal, COLORS.mid, COLORS.coral, COLORS.tan, COLORS.slate, COLORS.mint][i % 6],
  }));

  const totalExpenses = totals.cogs + totals.opex;

  const laborAmt = cogsItems.filter((c) => c.cat === 'labor').reduce((s, c) => s + c.annual, 0);
  const matAmt = cogsItems.filter((c) => c.cat === 'material').reduce((s, c) => s + c.annual, 0);
  const utilAmt = cogsItems.filter((c) => c.cat === 'utility').reduce((s, c) => s + c.annual, 0);
  const otherAmt = totals.cogs - laborAmt - matAmt - utilAmt;

  const pctOfRev = (amt) => `${((amt / totals.revenue) * 100).toFixed(1)}%`;

  const cogsSummaryRows = [
    { label: 'Labor', amount: laborAmt, pct: pctOfRev(laborAmt) },
    { label: 'Materials', amount: matAmt, pct: pctOfRev(matAmt) },
    { label: 'Utilities', amount: utilAmt, pct: pctOfRev(utilAmt) },
    { label: 'Other', amount: otherAmt, pct: pctOfRev(otherAmt) },
  ];

  const payrollAdmin = getOpex((n) => n.includes('Payroll (Admin)'));
  const payrollTaxes = getOpex((n) => n.includes('Taxes'));
  const benefits = getOpex((n) => n.includes('Benefits'));
  const contractLabor = getOpex((n) => n.includes('Contract Labor'));
  const rentOcc = getOpex((n) => n.includes('Rent Expense')) + getOpex((n) => n.includes('Rent Management'));
  const payrollBenefitsBucket = payrollTaxes + benefits + contractLabor;
  const otherOpexAmt = totals.opex - payrollAdmin - payrollBenefitsBucket - rentOcc;

  const opexSummaryRows = [
    { label: 'Payroll & benefits', amount: round(payrollAdmin + payrollBenefitsBucket), pct: pctOfRev(payrollAdmin + payrollBenefitsBucket) },
    { label: 'Rent & occupancy', amount: rentOcc, pct: pctOfRev(rentOcc) },
    { label: 'Utilities (OpEx alloc.)', amount: 0, pct: '—' },
    { label: 'All other OpEx', amount: otherOpexAmt, pct: pctOfRev(otherOpexAmt) },
  ];

  const monthlyRevenueChartData = months.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    peak: m.month === 'May' || m.month === 'Sep',
  }));

  const utilitiesStackData = months.map((m) => ({
    month: m.month,
    Gas: m.gas,
    Electricity: m.elec,
    Water: m.water,
    Wastewater: m.waste,
  }));

  const netIncomeBarData = months.map((m) => ({
    month: m.month,
    net: m.net,
    fill: m.net > 50000 ? COLORS.mint : m.net < 20000 ? COLORS.coral : COLORS.teal,
  }));

  const bestMonth = months.reduce((a, b) => (a.net > b.net ? a : b));
  const worstMonth = months.reduce((a, b) => (a.net < b.net ? a : b));
  const avgNet = totals.net / 12;
  const profitableCount = months.filter((m) => m.net > 0).length;

  const totalPayroll = payrollBars.reduce((s, p) => s + p.annual, 0);
  const headcountCost = round(totalPayroll / 12);
  const burdenRate = totals.revenue > 0 ? ((totalPayroll / totals.revenue) * 100).toFixed(1) : '0';

  const gasY = cogsItems.find((c) => c.name.includes('Gas'))?.annual ?? 0;
  const elecY = cogsItems.find((c) => c.name.includes('Electricity'))?.annual ?? 0;
  const waterY = cogsItems.find((c) => c.name.includes('Water') && !c.name.includes('Waste'))?.annual ?? 0;
  const wasteY = cogsItems.find((c) => c.name.includes('Wastewater'))?.annual ?? 0;

  const productionPayrollTotal = laborAmt;
  const adminPayrollCard = round(payrollAdmin + payrollTaxes + benefits + contractLabor);

  const yoyChartData = [
    { metric: 'Revenue', y2024: 100, y2025: 107.3, tip2024: formatCompactM(R24), tip2025: formatCompactM(R25) },
    { metric: 'Net Income', y2024: 100, y2025: 184.2, tip2024: formatCompactM(NET24), tip2025: formatCompactM(NET25) },
    { metric: 'Gross Margin', y2024: 100, y2025: 118.2, tip2024: `${GPM24.toFixed(1)}%`, tip2025: `${GPM25.toFixed(1)}%` },
    { metric: 'Net Margin', y2024: 100, y2025: 169.6, tip2024: `${NPM24.toFixed(1)}%`, tip2025: `${NPM25.toFixed(1)}%` },
  ];

  return {
    year,
    months,
    totals,
    gross,
    gpm,
    npm,
    cogsPctRev,
    expenseAllocation,
    totalExpenses,
    totalExpensesLabel: formatCompactM(totalExpenses),
    opexItems,
    cogsItems,
    payrollBars,
    top5ExpenseChartData,
    monthlyRevenueChartData,
    utilitiesStackData,
    netIncomeBarData,
    cogsSummaryRows,
    opexSummaryRows,
    yoyChartData,
    utilityCards: [
      { label: '🔥 Gas', amount: gasY, pct: pctOfRev(gasY), color: COLORS.coral },
      { label: '⚡ Electricity', amount: elecY, pct: pctOfRev(elecY), color: COLORS.teal },
      { label: '💧 Water', amount: waterY, pct: pctOfRev(waterY), color: COLORS.mid },
      { label: '🌊 Wastewater', amount: wasteY, pct: pctOfRev(wasteY), color: COLORS.tan },
    ],
    cogsDetailCards: cogsSummaryRows.map((r) => [r.label, r.amount, r.pct]),
    miniKpis: {
      bestLabel: `${bestMonth.month} ${formatCompactM(bestMonth.net)}`,
      worstLabel: `${worstMonth.month} ${formatCompactM(worstMonth.net)}`,
      avgNetLabel: formatCompactM(avgNet),
      profitableLabel: `${profitableCount} / 12`,
    },
    productionPayrollCard: productionPayrollTotal,
    adminPayrollCard,
    productionPayrollPct: pctOfRev(productionPayrollTotal),
    adminPayrollPct: pctOfRev(adminPayrollCard),
    totalPayroll,
    headcountCost,
    burdenRate,
    kpiYoYLabel: is2025 ? '+7.3% YoY' : 'Prior year',
    revenueYoYNote: is2025 ? '+7.3% YoY' : 'Baseline vs FY 2025',
    grossKpiSub: `${gpm.toFixed(1)}%`,
    netKpiSub: `${npm.toFixed(1)}%`,
    cogsKpiSub: `${cogsPctRev.toFixed(1)}%`,
    sidebarRevenue: totals.revenue,
    sidebarNetMargin: `${npm.toFixed(1)}%`,
    sidebarGrossMargin: `${gpm.toFixed(1)}%`,
    headerSubtitle: `FY ${year} Performance Dashboard`,
    sectionYearLabel: String(year),
    monthlySectionSubtitle: `Complete ${year} P&L with month-level profitability profile.`,
    utilitiesSubtitle: `Gas, electricity, water, and wastewater trends across FY ${year}.`,
    showYoySection: is2025,
    yoyFootnote: 'Revenue +7.3% · Net Income +84.2% · Gross Margin +4.2 pts · Net Margin +69.6%',
    profitabilityBanner: {
      grossMargin: `${gpm.toFixed(1)}%`,
      netMargin: `${npm.toFixed(1)}%`,
      monthlyAvgRev: formatCompactM(totals.revenue / 12),
    },
    totalRowGpPct: `${gpm.toFixed(1)}%`,
    totalRowNetPct: `${npm.toFixed(1)}%`,
  };
}
