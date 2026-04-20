import React, { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const COLORS = {
  teal: '#0D4F4F',
  mid: '#1A8A8A',
  coral: '#E07B54',
  mint: '#2EC4B6',
  tan: '#D4A574',
  slate: '#94A7B0',
  dark: '#1A3A4A',
  muted: '#5A7A8A',
  card: '#FFFFFF',
  bg: '#F4F7F9',
  border: '#EDF1F3',
};

const cardStyle = {
  background: COLORS.card,
  borderRadius: 20,
  border: '1px solid rgba(13,79,79,0.1)',
  boxShadow: '0 2px 8px rgba(13,79,79,0.04)',
};

const months = [
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

const expenseAllocation = [
  { name: 'Payroll', value: 30.5, color: COLORS.teal },
  { name: 'Materials', value: 20.5, color: COLORS.mid },
  { name: 'Utilities', value: 19.3, color: COLORS.coral },
  { name: 'Rent', value: 10.6, color: COLORS.tan },
  { name: 'Prof Fees', value: 1.9, color: COLORS.slate },
  { name: 'Other', value: 17.2, color: COLORS.mint },
];

const opexItems = [
  ['Payroll (Admin)', 845000, 6.4], ['Payroll Taxes', 156000, 1.2], ['Employee Benefits', 98000, 0.7], ['Rent Expense', 1052000, 7.9],
  ['Rent Management Fee', 262000, 2.0], ['Professional Fees Legal', 72000, 0.5], ['Professional Fees Other', 40000, 0.3], ['Sales Commission', 65000, 0.5],
  ['Sales Promotion', 18000, 0.1], ['Office Expense', 42000, 0.3], ['Office Supplies', 28000, 0.2], ['Computer & Internet', 36000, 0.3],
  ['Telephone', 22000, 0.2], ['Automobile', 48000, 0.4], ['Repairs Computer', 35000, 0.3], ['Repairs Equipment', 245000, 1.8],
  ['Insurance Health', 89000, 0.7], ['Insurance Truck', 47000, 0.4], ['Licenses', 15000, 0.1], ['Contract Labor', 126000, 0.9],
  ['Outside Service', 78000, 0.6], ['Interest Expense', 197000, 1.5], ['Other/Misc', 71000, 0.5],
];

const cogsItems = [
  ['Direct Labor Samuel Hale', 3410000, 25.7, 'Primary production contractor', 'labor'],
  ['Direct Labor Workforce', 532000, 4.0, 'Hourly production staff', 'labor'],
  ['Payroll Other COGS', 178000, 1.3, 'Overtime, bonuses', 'labor'],
  ['Chemical & Dyestuffs', 2353000, 17.7, 'Dyes, chemicals', 'material'],
  ['Finishing Supplies Paper Tube', 98000, 0.7, 'Packaging tubes', 'material'],
  ['Lab Supplies Testing', 67000, 0.5, 'Quality testing', 'material'],
  ['Plant Supplies & Parts', 89000, 0.7, 'Machine parts', 'material'],
  ['Freight & Shipping', 168000, 1.3, 'Logistics', 'other'],
  ['Truck Repair', 45000, 0.3, 'Fleet maintenance', 'other'],
  ['Insurance Liability', 50000, 0.4, 'Plant coverage', 'other'],
  ['Utilities Gas', 1207000, 9.1, 'Boiler & heating', 'utility'],
  ['Utilities Electricity', 837000, 6.3, 'Machine power', 'utility'],
  ['Utilities Water', 345000, 2.6, 'Process water', 'utility'],
  ['Utilities Wastewater', 171000, 1.3, 'Treatment', 'utility'],
];

const payrollBars = [
  ['Samuel Hale', 3410000, 284000], ['Admin Payroll', 845000, 70000], ['Workforce', 532000, 44000], ['Payroll Other', 178000, 15000],
  ['Payroll Taxes', 156000, 13000], ['Contract Labor', 126000, 11000], ['Benefits', 98000, 8000],
];

const navItems = [
  ['overview', 'Overview', '▦'],
  ['monthly', 'Monthly Report', '▤'],
  ['expense', 'Expense Detail', '◫'],
  ['cogs', 'COGS Details', '◩'],
  ['utilities', 'Utilities', '◒'],
  ['payroll', 'Payroll', '◧'],
];

const sum = (arr, key) => arr.reduce((a, b) => a + b[key], 0);
const totals = {
  revenue: sum(months, 'revenue'),
  cogs: sum(months, 'cogs'),
  opex: sum(months, 'opex'),
  net: sum(months, 'net'),
};
const gross = totals.revenue - totals.cogs;

const ANNUAL_REVENUE_DISPLAY = 13280000;

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

const top5ExpenseChartData = [
  { name: 'Rent', value: 1052000 },
  { name: 'Payroll Admin', value: 845000 },
  { name: 'Rent Mgmt', value: 262000 },
  { name: 'Repairs Equipment', value: 245000 },
  { name: 'Interest', value: 197000 },
];

const payrollChartData = payrollBars.map(([name, annual, avg]) => ({
  name,
  annual,
  avg,
}));

/** Indexed YoY (2024 = 100) so one axis reads cleanly; tooltips show actuals. */
const yoyChartData = [
  {
    metric: 'Revenue',
    y2024: 100,
    y2025: 107.3,
    tip2024: '$12.38M',
    tip2025: '$13.28M',
  },
  {
    metric: 'Net Income',
    y2024: 100,
    y2025: 184.2,
    tip2024: '$284K',
    tip2025: '$523K',
  },
  {
    metric: 'Gross Margin',
    y2024: 100,
    y2025: 118.2,
    tip2024: '23.0%',
    tip2025: '27.2%',
  },
  {
    metric: 'Net Margin',
    y2024: 100,
    y2025: 169.6,
    tip2024: '2.3%',
    tip2025: '3.9%',
  },
];

const netIncomeBarData = months.map((m) => ({
  month: m.month,
  net: m.net,
  fill: m.net > 50000 ? COLORS.mint : m.net < 20000 ? COLORS.coral : COLORS.teal,
}));

const cogsSummaryRows = [
  { label: 'Labor', amount: 4120000, pct: '42.6%' },
  { label: 'Materials', amount: 2510000, pct: '25.9%' },
  { label: 'Utilities', amount: 2560000, pct: '26.5%' },
  { label: 'Other', amount: 480000, pct: '5.0%' },
];

const opexSummaryRows = [
  { label: 'Payroll & benefits', amount: 1099000, pct: '8.3%' },
  { label: 'Rent & occupancy', amount: 1314000, pct: '9.9%' },
  { label: 'Utilities (OpEx alloc.)', amount: 0, pct: '—' },
  { label: 'All other OpEx', amount: totals.opex - 1099000 - 1314000, pct: `${((totals.opex - 1099000 - 1314000) / ANNUAL_REVENUE_DISPLAY * 100).toFixed(1)}%` },
];

const formatCurrency = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
};
const formatMoney = (v) => `$${Math.round(v).toLocaleString()}`;
const pct = (v, d) => `${((v / d) * 100).toFixed(1)}%`;

/** Recharts tooltip: dollar values as $XK */
const tooltipCurrencyK = (v) => `$${(Number(v) / 1000).toFixed(0)}K`;

const useInView = (threshold = 0.25) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || visible) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, visible]);
  return [ref, visible];
};

const useCountUp = (target, active, duration = 1300) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    const ease = (t) => 1 - (1 - t) ** 3;
    let frame = null;
    const start = performance.now();
    const run = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * ease(p));
      if (p < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);
  return value;
};

const SectionTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: 30, color: COLORS.dark }}>{title}</h2>
    <p style={{ margin: '4px 0 0', color: COLORS.muted }}>{subtitle}</p>
  </div>
);

const badge = (bg) => ({
  background: bg,
  color: '#fff',
  borderRadius: 6,
  padding: '2px 8px',
  fontWeight: 700,
  fontSize: 12,
});

const axisTick = { fill: COLORS.muted, fontSize: 11 };

const FinancialDashboard = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('overview');
  const sectionRefs = useRef({});
  const [heroRef, heroInView] = useInView(0.2);
  const [revRef, revInView] = useInView(0.25);
  const [donutRef, donutInView] = useInView(0.25);
  const [yoyRef, yoyInView] = useInView(0.25);
  const [utilRef, utilInView] = useInView(0.25);
  const [netBarRef, netBarInView] = useInView(0.25);
  const [expBarRef, expBarInView] = useInView(0.25);
  const [payBarRef, payBarInView] = useInView(0.25);

  const animatedRevenue = useCountUp(totals.revenue, heroInView);
  const animatedGross = useCountUp(gross, heroInView);
  const animatedNet = useCountUp(totals.net, heroInView);
  const animatedCogs = useCountUp(totals.cogs, heroInView);

  const avgRevenue = totals.revenue / 12;
  const peakRevenue = Math.max(...months.map((m) => m.revenue));
  const lowRevenue = Math.min(...months.map((m) => m.revenue));

  useEffect(() => {
    const sections = Object.values(sectionRefs.current);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4, rootMargin: '-10% 0px -50% 0px' }
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <style>{`
        *{box-sizing:border-box} html,body,#root{margin:0;padding:0;scroll-behavior:smooth}
        body{font-family:Outfit,system-ui,sans-serif;background:${COLORS.bg};color:${COLORS.dark}}
        .wrap{min-height:100vh;background-image:linear-gradient(to right,rgba(13,79,79,.03) 1px,transparent 1px),linear-gradient(to bottom,rgba(13,79,79,.03) 1px,transparent 1px);background-size:48px 48px}
        .tbl{width:100%;border-collapse:collapse;min-width:760px}.tbl th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${COLORS.muted};padding:10px 12px;border-bottom:2px solid ${COLORS.border};text-align:right}.tbl th:first-child,.tbl td:first-child{text-align:left}.tbl td{padding:10px 12px;border-bottom:1px solid ${COLORS.border};text-align:right}
        .recharts-default-tooltip{border-radius:12px!important;border:1px solid ${COLORS.border}!important;box-shadow:0 2px 8px rgba(13,79,79,0.08)!important}
        @media (max-width:900px){.main{padding:88px 14px 30px !important}}
      `}</style>
      <div className="wrap">
        <button type="button" onClick={() => setOpen((v) => !v)} style={{ position: 'fixed', left: 14, top: 14, zIndex: 60, width: 44, height: 44, borderRadius: 12, border: 'none', background: COLORS.teal, color: '#fff', fontSize: 20, cursor: 'pointer' }}>☰</button>
        {open ? <div role="presentation" onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.3)', backdropFilter: 'blur(3px)', zIndex: 40 }} /> : null}
        <aside style={{ position: 'fixed', left: open ? 0 : -280, top: 0, width: 260, height: '100vh', background: '#fff', zIndex: 50, transition: 'left .28s ease', padding: 18, borderRight: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, background: 'linear-gradient(145deg,#0D4F4F,#1A8A8A)' }}>CF</div>
            <div>
              <div style={{ fontWeight: 700 }}>Color Fashion</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>Dye &amp; Finishing</div>
              <span style={{ ...badge(COLORS.coral), display: 'inline-block', marginTop: 5 }}>FY 2025</span>
            </div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '.12em', color: COLORS.muted, marginBottom: 8 }}>SECTIONS</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {navItems.map(([id, label, icon]) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} style={{ border: 'none', borderRadius: 12, textAlign: 'left', cursor: 'pointer', padding: '10px 12px', background: active === id ? COLORS.teal : '#fff', color: active === id ? '#fff' : COLORS.dark, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20, ...cardStyle, padding: 12 }}>
            <div style={{ fontSize: 13, color: COLORS.muted }}>Revenue</div><div style={{ fontWeight: 800 }}>{formatCurrency(13280000)}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 6 }}>Net Margin <b style={{ color: COLORS.teal }}>3.9%</b></div>
            <div style={{ fontSize: 13, color: COLORS.muted }}>Gross Margin <b style={{ color: COLORS.teal }}>27.2%</b></div>
          </div>
        </aside>

        <main className="main" style={{ padding: '28px 26px 40px 72px', maxWidth: 1320, margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', marginBottom: 20 }}>
            <div><h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1 }}><span style={{ color: COLORS.teal }}>Color Fashion</span> <span style={{ color: COLORS.coral }}>Dye &amp; Finishing</span></h1><span style={{ ...badge(COLORS.teal), marginTop: 8, display: 'inline-block' }}>FY 2025 Performance Dashboard</span></div>
            <div style={{ ...cardStyle, padding: '10px 14px', fontSize: 14 }}><div style={{ color: COLORS.muted }}>Annual Revenue</div><div style={{ fontWeight: 800, fontSize: 25 }}>{formatCurrency(13280000)}</div></div>
          </header>

          <section id="overview" ref={(el) => { sectionRefs.current.overview = el; }} style={{ marginBottom: 34, scrollMarginTop: 80 }}>
            <SectionTitle title="1. Overview" subtitle="Executive KPI summary, revenue momentum, expense allocation, and YoY growth." />
            <div ref={heroRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              {[['Revenue', animatedRevenue, '+7.3% YoY', COLORS.teal], ['Gross Profit', animatedGross, '27.2%', COLORS.mid], ['Net Income', animatedNet, '3.9%', COLORS.mint], ['COGS', animatedCogs, '72.8%', COLORS.coral]].map(([k, v, sub, c]) => (
                <div key={k} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ color: COLORS.muted, textTransform: 'uppercase', fontSize: 11 }}>{k}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: c }}>{formatCurrency(v)}</div>
                  <span style={badge(c)}>{sub}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14, marginTop: 14 }}>
              <div ref={revRef} style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ margin: '0 0 8px' }}>Monthly Revenue</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueChartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barTeal" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#0D4F4F" />
                          <stop offset="100%" stopColor="#1A8A8A" />
                        </linearGradient>
                        <linearGradient id="barCoral" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#E07B54" />
                          <stop offset="100%" stopColor="#F2A27F" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                      <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}K`} tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                      <Tooltip formatter={(v) => tooltipCurrencyK(v)} labelStyle={{ color: COLORS.dark }} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} isAnimationActive={revInView} animationDuration={900}>
                        {monthlyRevenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.peak ? 'url(#barCoral)' : 'url(#barTeal)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 10, gap: 8 }}>
                  {[['Avg', avgRevenue], ['Peak', peakRevenue], ['Low', lowRevenue], ['Spread', peakRevenue - lowRevenue]].map(([k, v]) => (
                    <div key={k} style={{ background: '#f8fafb', borderRadius: 10, padding: 8 }}>
                      <div style={{ color: COLORS.muted, fontSize: 12 }}>{k}</div>
                      <div style={{ fontWeight: 700 }}>{formatCurrency(v)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={donutRef} style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ margin: '0 0 8px' }}>Expense Allocation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseAllocation}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          isAnimationActive={donutInView}
                          animationDuration={800}
                        >
                          {expenseAllocation.map((s) => (
                            <Cell key={s.name} fill={s.color} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>Total Expenses</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.dark }}>$12.76M</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {expenseAllocation.map((x) => (
                      <div key={x.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: x.color }} />
                          {x.name}
                        </span>
                        <span style={badge(x.color)}>{x.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, marginTop: 14 }}>
              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ margin: '0 0 10px' }}>COGS summary</h3>
                <table className="tbl" style={{ minWidth: 0 }}>
                  <thead><tr><th>Category</th><th>Amount</th><th>% Rev</th></tr></thead>
                  <tbody>
                    {cogsSummaryRows.map((r) => (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        <td>{formatCurrency(r.amount)}</td>
                        <td><span style={badge(COLORS.teal)}>{r.pct}</span></td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 800, background: '#F8FBFC' }}>
                      <td>Total COGS</td>
                      <td>{formatCurrency(totals.cogs)}</td>
                      <td><span style={badge(COLORS.coral)}>72.8%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ margin: '0 0 10px' }}>OpEx summary</h3>
                <table className="tbl" style={{ minWidth: 0 }}>
                  <thead><tr><th>Bucket</th><th>Amount</th><th>% Rev</th></tr></thead>
                  <tbody>
                    {opexSummaryRows.map((r) => (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        <td>{r.amount ? formatCurrency(r.amount) : '—'}</td>
                        <td><span style={badge(COLORS.mid)}>{r.pct}</span></td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 800, background: '#F8FBFC' }}>
                      <td>Total OpEx</td>
                      <td>{formatCurrency(totals.opex)}</td>
                      <td><span style={badge(COLORS.slate)}>{pct(totals.opex, ANNUAL_REVENUE_DISPLAY)}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div ref={yoyRef} style={{ ...cardStyle, padding: 14, marginTop: 14 }}>
              <h3 style={{ margin: '0 0 8px' }}>YoY growth (2024 vs 2025)</h3>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: COLORS.muted }}>Revenue +7.3% · Net Income +84.2% · Gross Margin +4.2 pts · Net Margin +69.6%</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={yoyChartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
                    <XAxis type="number" tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} tickFormatter={(v) => `${v}`} domain={[80, 'auto']} label={{ value: 'Index (2024 = 100)', position: 'insideBottom', offset: -4, fill: COLORS.muted, fontSize: 11 }} />
                    <YAxis type="category" dataKey="metric" width={110} tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const row = props?.payload;
                        if (!row) return value;
                        if (name === '2024') return row.tip2024;
                        if (name === '2025') return row.tip2025;
                        return value;
                      }}
                      labelStyle={{ color: COLORS.dark }}
                    />
                    <Legend />
                    <Bar dataKey="y2024" name="2024" fill={COLORS.slate} radius={[0, 4, 4, 0]} isAnimationActive={yoyInView} />
                    <Bar dataKey="y2025" name="2025" fill={COLORS.teal} radius={[0, 4, 4, 0]} isAnimationActive={yoyInView} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 20, marginTop: 14, background: 'linear-gradient(120deg,#0D4F4F,#1A8A8A)', color: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, textAlign: 'center' }}>
                <div><div style={{ opacity: 0.85, fontSize: 13 }}>Gross Margin</div><div style={{ fontWeight: 800, fontSize: 34 }}>27.2%</div></div>
                <div><div style={{ opacity: 0.85, fontSize: 13 }}>Net Margin</div><div style={{ fontWeight: 800, fontSize: 34 }}>3.9%</div></div>
                <div><div style={{ opacity: 0.85, fontSize: 13 }}>Monthly Avg Revenue</div><div style={{ fontWeight: 800, fontSize: 34 }}>{formatCurrency(avgRevenue)}</div></div>
              </div>
            </div>
          </section>

          <section id="monthly" ref={(el) => { sectionRefs.current.monthly = el; }} style={{ marginBottom: 34, scrollMarginTop: 80 }}>
            <SectionTitle title="2. Monthly Report" subtitle="Complete 2025 P&L with month-level profitability profile." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10, marginBottom: 10 }}>
              {[['Best Month', `May ${formatCurrency(93000)}`], ['Worst Month', `Dec ${formatCurrency(6000)}`], ['Avg Net/Mo', formatCurrency(44000)], ['All Profitable', '12 / 12']].map(([k, v]) => (
                <div key={k} style={{ ...cardStyle, padding: 12 }}><div style={{ color: COLORS.muted, fontSize: 12 }}>{k}</div><div style={{ fontWeight: 800, fontSize: 24 }}>{v}</div></div>
              ))}
            </div>
            <div ref={netBarRef} style={{ ...cardStyle, padding: 14, marginBottom: 12 }}>
              <h3 style={{ margin: '0 0 8px' }}>Net Income by month</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={netIncomeBarData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}K`} tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <Tooltip formatter={(v) => tooltipCurrencyK(v)} labelStyle={{ color: COLORS.dark }} />
                    <Legend />
                    <Bar dataKey="net" name="Net Income" radius={[4, 4, 0, 0]} isAnimationActive={netBarInView} animationDuration={800}>
                      {netIncomeBarData.map((e, i) => (
                        <Cell key={`net-${i}`} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr>{['Month', 'Revenue', 'COGS', 'Gross Profit', 'GP%', 'OpEx', 'Net Income', 'Net%'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {months.map((m) => {
                    const gp = m.revenue - m.cogs;
                    const peak = m.month === 'May' || m.month === 'Sep';
                    return (
                      <tr key={m.month} style={{ background: peak ? 'rgba(46,196,182,0.08)' : '#fff' }}>
                        <td>{m.month}</td>
                        <td>{formatMoney(m.revenue)}</td>
                        <td>{formatMoney(m.cogs)}</td>
                        <td>{formatMoney(gp)}</td>
                        <td>{pct(gp, m.revenue)}</td>
                        <td>{formatMoney(m.opex)}</td>
                        <td style={{ color: m.net > 50000 ? COLORS.mint : m.net < 20000 ? COLORS.coral : COLORS.teal, fontWeight: 700 }}>{formatMoney(m.net)}</td>
                        <td>{pct(m.net, m.revenue)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#F8FBFC', fontWeight: 800 }}><td>TOTAL</td><td>{formatMoney(totals.revenue)}</td><td>{formatMoney(totals.cogs)}</td><td>{formatMoney(gross)}</td><td>27.2%</td><td>{formatMoney(totals.opex)}</td><td>{formatMoney(totals.net)}</td><td>3.9%</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="expense" ref={(el) => { sectionRefs.current.expense = el; }} style={{ marginBottom: 34, scrollMarginTop: 80 }}>
            <SectionTitle title="3. Expense Detail" subtitle="Operating expense line-item composition and concentration." />
            <div style={{ ...cardStyle, overflowX: 'auto', marginBottom: 10 }}>
              <table className="tbl"><thead><tr><th>Line Item</th><th>Annual</th><th>Monthly Avg</th><th>% Revenue</th></tr></thead><tbody>{opexItems.map(([name, annual, p]) => { const b = p >= 2 ? COLORS.coral : p >= 1 ? COLORS.mid : COLORS.slate; return <tr key={name}><td>{name}</td><td>{formatCurrency(annual)}</td><td>{formatCurrency(annual / 12)}</td><td><span style={badge(b)}>{p.toFixed(1)}%</span></td></tr>; })}</tbody></table>
            </div>
            <div ref={expBarRef} style={{ ...cardStyle, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Top 5 Expense Drivers</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={top5ExpenseChartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
                    <XAxis type="number" tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                    <YAxis type="category" dataKey="name" width={130} tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <Tooltip formatter={(v) => tooltipCurrencyK(v)} labelStyle={{ color: COLORS.dark }} />
                    <Legend />
                    <Bar dataKey="value" name="Annual" fill={COLORS.mid} radius={[0, 8, 8, 0]} isAnimationActive={expBarInView} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section id="cogs" ref={(el) => { sectionRefs.current.cogs = el; }} style={{ marginBottom: 34, scrollMarginTop: 80 }}>
            <SectionTitle title="4. COGS Details" subtitle="Production cost structure with labor and utilities emphasis." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 10 }}>
              {[['Labor', 4120000, '42.6%'], ['Materials', 2510000, '25.9%'], ['Utilities', 2560000, '26.5%'], ['Other', 480000, '5.0%']].map(([n, v, p]) => <div key={n} style={{ ...cardStyle, padding: 12 }}><div style={{ color: COLORS.muted }}>{n}</div><div style={{ fontWeight: 800, fontSize: 27 }}>{formatCurrency(v)}</div><span style={badge(COLORS.teal)}>{p}</span></div>)}
            </div>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table className="tbl"><thead><tr><th>Item</th><th>Annual</th><th>% Rev</th><th>Description</th></tr></thead><tbody>{cogsItems.map(([name, annual, p, desc, cat]) => { const bg = cat === 'labor' ? 'rgba(13,79,79,0.06)' : cat === 'utility' ? 'rgba(224,123,84,0.08)' : 'transparent'; const b = p >= 5 ? COLORS.teal : p >= 1 ? COLORS.mid : COLORS.slate; return <tr key={name} style={{ background: bg }}><td>{name}</td><td>{formatCurrency(annual)}</td><td><span style={badge(b)}>{p.toFixed(1)}%</span></td><td style={{ textAlign: 'left', color: COLORS.muted }}>{desc}</td></tr>; })}</tbody></table>
            </div>
          </section>

          <section id="utilities" ref={(el) => { sectionRefs.current.utilities = el; }} style={{ marginBottom: 34, scrollMarginTop: 80 }}>
            <SectionTitle title="5. Utilities" subtitle="Gas, electricity, water, and wastewater trends across the fiscal year." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 10 }}>
              {[['🔥 Gas', 1210000, '9.1%', COLORS.coral], ['⚡ Electricity', 837000, '6.3%', COLORS.teal], ['💧 Water', 345000, '2.6%', COLORS.mid], ['🌊 Wastewater', 171000, '1.3%', COLORS.tan]].map(([n, v, p, c]) => <div key={n} style={{ ...cardStyle, padding: 12 }}><div style={{ color: COLORS.muted }}>{n}</div><div style={{ fontWeight: 800, fontSize: 27 }}>{formatCurrency(v)}</div><span style={badge(c)}>{p}</span></div>)}
            </div>
            <div ref={utilRef} style={{ ...cardStyle, padding: 12, marginBottom: 10 }}>
              <h3 style={{ marginTop: 0 }}>Monthly Utilities (Stacked)</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilitiesStackData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}K`} tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <Tooltip formatter={(v) => tooltipCurrencyK(v)} labelStyle={{ color: COLORS.dark }} />
                    <Legend />
                    <Bar dataKey="Gas" stackId="u" fill={COLORS.coral} isAnimationActive={utilInView} animationDuration={800} />
                    <Bar dataKey="Electricity" stackId="u" fill={COLORS.teal} isAnimationActive={utilInView} animationDuration={800} />
                    <Bar dataKey="Water" stackId="u" fill={COLORS.mid} isAnimationActive={utilInView} animationDuration={800} />
                    <Bar dataKey="Wastewater" stackId="u" fill={COLORS.tan} isAnimationActive={utilInView} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table className="tbl"><thead><tr><th>Month</th><th>Gas</th><th>Electricity</th><th>Water</th><th>Wastewater</th><th>Total</th></tr></thead><tbody>{months.map((m) => <tr key={m.month}><td>{m.month}</td><td>{formatCurrency(m.gas)}</td><td>{formatCurrency(m.elec)}</td><td>{formatCurrency(m.water)}</td><td>{formatCurrency(m.waste)}</td><td>{formatCurrency(m.gas + m.elec + m.water + m.waste)}</td></tr>)}</tbody></table>
            </div>
          </section>

          <section id="payroll" ref={(el) => { sectionRefs.current.payroll = el; }} style={{ marginBottom: 14, scrollMarginTop: 80 }}>
            <SectionTitle title="6. Payroll" subtitle="COGS payroll vs operating payroll burden and monthly run-rate by labor type." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10, marginBottom: 10 }}>
              <div style={{ ...cardStyle, padding: 12 }}><div style={{ color: COLORS.muted }}>Production Payroll (COGS)</div><div style={{ fontWeight: 800, fontSize: 30 }}>{formatCurrency(4120000)}</div><span style={badge(COLORS.teal)}>31.0%</span></div>
              <div style={{ ...cardStyle, padding: 12 }}><div style={{ color: COLORS.muted }}>Admin Payroll (OpEx)</div><div style={{ fontWeight: 800, fontSize: 30 }}>{formatCurrency(1230000)}</div><span style={badge(COLORS.mid)}>9.2%</span></div>
            </div>
            <div ref={payBarRef} style={{ ...cardStyle, padding: 12, marginBottom: 10 }}>
              <h3 style={{ marginTop: 0 }}>Payroll Components</h3>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={payrollChartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
                    <XAxis type="number" tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                    <YAxis type="category" dataKey="name" width={118} tick={axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                    <Tooltip formatter={(v) => tooltipCurrencyK(v)} labelStyle={{ color: COLORS.dark }} />
                    <Legend />
                    <Bar dataKey="annual" name="Annual" fill={COLORS.teal} radius={[0, 8, 8, 0]} isAnimationActive={payBarInView} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 6, fontSize: 13, color: COLORS.muted }}>
                {payrollChartData.map((row) => (
                  <div key={row.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{row.name}</span>
                    <span>{formatCurrency(row.avg)}/mo avg</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...cardStyle, padding: 16, background: 'linear-gradient(120deg,#0D4F4F,#1A8A8A)', color: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                <div><div style={{ opacity: 0.8 }}>Total Payroll</div><div style={{ fontWeight: 800, fontSize: 30 }}>{formatCurrency(5350000)}</div></div>
                <div><div style={{ opacity: 0.8 }}>Headcount Cost</div><div style={{ fontWeight: 800, fontSize: 30 }}>{formatCurrency(446000)}</div></div>
                <div><div style={{ opacity: 0.8 }}>Burden Rate</div><div style={{ fontWeight: 800, fontSize: 30 }}>10.8%</div></div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default FinancialDashboard;
