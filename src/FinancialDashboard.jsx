import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getFinancialYearData } from './financialYearData.js';

/** Design system — Color Fashion Dye & Finishing FY 2025 */
const ds = {
  colors: {
    teal: '#0D4F4F',
    midTeal: '#1A8A8A',
    coral: '#E07B54',
    mint: '#2EC4B6',
    tan: '#D4A574',
    slate: '#94A7B0',
    darkText: '#1A3A4A',
    mutedText: '#5A7A8A',
    background: '#F4F7F9',
    cardBg: '#FFFFFF',
    border: 'rgba(13, 79, 79, 0.12)',
    gridLine: 'rgba(13, 79, 79, 0.03)',
    rowBorder: '#EDF1F3',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 20,
    boxShadow: '0 2px 8px rgba(13, 79, 79, 0.04)',
    border: '1px solid rgba(13, 79, 79, 0.12)',
  },
  fontFamily: '"Outfit", system-ui, sans-serif',
};

const C = ds.colors;

/** ≥1M → "$X.XXM", ≥1K → "$XK", else "$X" */
function formatCurrency(value) {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${Math.round(v)}`;
}

function formatMoneyFull(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString('en-US')}`;
}

function pctOf(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

/** IntersectionObserver — returns [ref, inView] */
function useInView(options = {}) {
  const { threshold = 0.2, rootMargin = '0px' } = options;
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setInView(true);
        });
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function useAnimatedNumber(target, active, { duration = 1400, delay = 0 } = {}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const t = Number(target) || 0;
    let cancelled = false;

    /** Approximates CSS cubic-bezier(0.22, 1, 0.36, 1) — strong ease-out */
    const ease = (t) => {
      const u = 1 - t;
      return 1 - u * u * u * u;
    };

    const tick = (now) => {
      if (cancelled) return;
      if (startRef.current == null) startRef.current = now + delay;
      const elapsed = now - startRef.current;
      if (elapsed < 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / duration);
      setDisplay(t * ease(p));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
      else setDisplay(t);
    };

    startRef.current = null;
    setDisplay(0);
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, target, duration, delay]);

  return display;
}

function AnimatedNumber({ value, format = formatCurrency, active, delay = 0, duration = 1400, style }) {
  const n = useAnimatedNumber(value, active, { duration, delay });
  return <span style={{ transition: 'none', ...style }}>{format(n)}</span>;
}

const Card = React.forwardRef(function Card({ children, style, className }, ref) {
  return (
    <div ref={ref} className={className} style={{ ...ds.card, ...style }}>
      {children}
    </div>
  );
});

function Badge({ children, tone = 'teal', style }) {
  const bg =
    tone === 'coral'
      ? C.coral
      : tone === 'mid'
        ? C.midTeal
        : tone === 'slate'
          ? C.slate
          : tone === 'mint'
            ? C.mint
            : C.teal;
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: '#fff',
        fontWeight: 700,
        fontSize: 12,
        lineHeight: 1.2,
        padding: '4px 10px',
        borderRadius: 8,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function SectionHeader({ title, subtitle, style }) {
  return (
    <header style={{ marginBottom: 20, ...style }}>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.darkText, letterSpacing: -0.02 }}>{title}</h2>
      {subtitle ? (
        <p style={{ margin: '8px 0 0', fontSize: 15, color: C.mutedText, maxWidth: 720 }}>{subtitle}</p>
      ) : null}
    </header>
  );
}

const SCROLL_MARGIN = 88;

const yearLinkStyle = ({ isActive }) => ({
  padding: '6px 12px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 13,
  textDecoration: 'none',
  color: isActive ? '#fff' : C.teal,
  background: isActive ? C.teal : 'rgba(13,79,79,0.08)',
  border: `1px solid ${isActive ? C.teal : 'transparent'}`,
});

const PAYROLL_SUBS = {
  'Samuel Hale': 'Primary production contractor',
  'Admin Payroll': 'Office staff',
  Workforce: 'Hourly production',
  'Payroll Other': 'Overtime bonuses',
  'Payroll Taxes': 'Employer taxes',
  'Contract Labor': 'Temp workers',
  Benefits: 'Health & retirement',
};

function IconOverview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconMonthly() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}
function IconExpense() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}
function IconCogs() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function IconUtilities() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function IconPayroll() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const NAV = [
  { id: 'overview', label: 'Overview', Icon: IconOverview },
  { id: 'monthly', label: 'Monthly Report', Icon: IconMonthly },
  { id: 'expense', label: 'Expense Detail', Icon: IconExpense },
  { id: 'cogs', label: 'COGS Details', Icon: IconCogs },
  { id: 'utilities', label: 'Utilities', Icon: IconUtilities },
  { id: 'payroll', label: 'Payroll', Icon: IconPayroll },
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${large} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerR} ${innerR} 0 ${large} 1 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ');
}

function ExpenseDonut({ allocation, centerLine2 }) {
  const [hovered, setHovered] = useState(null);
  const cx = 120;
  const cy = 120;
  const inner = 60;
  const baseOuter = 98;
  let angle = 0;
  const slices = allocation.map((s) => {
    const sweep = (s.pct / 100) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return { ...s, start, end };
  });

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" style={{ display: 'block' }}>
      <defs>
        <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(13,79,79,0.12)" />
        </filter>
      </defs>
      {slices.map((s) => {
        const isH = hovered === s.name;
        const outer = isH ? 105 : baseOuter;
        const dim = hovered && hovered !== s.name;
        return (
          <path
            key={s.name}
            d={donutSlicePath(cx, cy, inner, outer, s.start, s.end)}
            fill={s.color}
            opacity={dim ? 0.35 : 1}
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: 'pointer', transition: `opacity 0.2s ${EASE}, d 0.25s ${EASE}` }}
            onMouseEnter={() => setHovered(s.name)}
            onMouseLeave={() => setHovered(null)}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.mutedText} fontSize="12" fontFamily={ds.fontFamily}>
        Total Expenses
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill={C.darkText} fontSize="20" fontWeight="800" fontFamily={ds.fontFamily}>
        {centerLine2}
      </text>
    </svg>
  );
}

function MonthlyRevenueBars({ active, months }) {
  const max = Math.max(...months.map((m) => m.revenue));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 220, paddingTop: 8 }}>
      {months.map((m, i) => {
        const h = (m.revenue / max) * 100;
        const peak = m.month === 'May' || m.month === 'Sep';
        return (
          <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              title={formatMoneyFull(m.revenue)}
              style={{
                width: '100%',
                maxWidth: 36,
                margin: '0 auto',
                height: `${active ? h : 0}%`,
                minHeight: active ? 4 : 0,
                borderRadius: '8px 8px 4px 4px',
                background: peak ? 'linear-gradient(180deg, #F2A27F, #E07B54)' : 'linear-gradient(180deg, #1A8A8A, #0D4F4F)',
                transformOrigin: 'bottom',
                transition: `height 0.9s ${EASE}`,
                transitionDelay: `${active ? i * 45 : 0}ms`,
              }}
            />
            <span style={{ fontSize: 11, color: C.mutedText, fontWeight: 600 }}>{m.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function YoYGrowthBars({ active, show }) {
  if (!show) return null;
  const rows = [
    { label: 'Revenue', p2024: 100, p2025: 107.3, d2024: 100, d2025: 107.3 },
    { label: 'Net Income', p2024: 100, p2025: 184.2, d2024: 100, d2025: 184.2 },
    { label: 'Gross Margin', p2024: 100, p2025: 118.2, d2024: 100, d2025: 118.2 },
    { label: 'Net Margin', p2024: 100, p2025: 169.6, d2024: 100, d2025: 169.6 },
  ];
  const labels = ['+7.3%', '+84.2%', '+4.2%', '+69.6%'];
  const max = 200;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {rows.map((r, idx) => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: C.darkText }}>{r.label}</span>
            <span style={{ fontWeight: 700, color: C.midTeal }}>{labels[idx]} YoY</span>
          </div>
          <div style={{ position: 'relative', height: 22, borderRadius: 10, background: C.rowBorder }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: active ? `${(r.p2024 / max) * 100}%` : '0%',
                borderRadius: 10,
                background: C.slate,
                opacity: 0.85,
                transition: `width 0.9s ${EASE}`,
                transitionDelay: `${active ? idx * 70 : 0}ms`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: active ? `${(r.p2025 / max) * 100}%` : '0%',
                borderRadius: 10,
                background: 'linear-gradient(90deg, #0D4F4F, #1A8A8A)',
                transition: `width 0.9s ${EASE}`,
                transitionDelay: `${active ? idx * 70 + 80 : 0}ms`,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: C.mutedText }}>
            <span>
              <span style={{ color: C.slate, fontWeight: 700 }}>2024</span> index {r.d2024}
            </span>
            <span>
              <span style={{ color: C.teal, fontWeight: 700 }}>2025</span> index {r.d2025}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HorizontalBarChart({ data, max, active, barColor = C.midTeal }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {data.map((row, i) => {
        const w = max ? (row.value / max) * 100 : 0;
        return (
          <div key={row.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: C.darkText }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: C.teal }}>{formatCurrency(row.value)}</span>
            </div>
            <div style={{ height: 10, borderRadius: 8, background: C.rowBorder, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: active ? `${w}%` : '0%',
                  borderRadius: 8,
                  background: barColor,
                  transition: `width 0.85s ${EASE}`,
                  transitionDelay: `${active ? i * 60 : 0}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PayrollBarList({ active, bars }) {
  const max = Math.max(...bars.map((p) => p.annual));
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {bars.map((p, i) => {
        const w = (p.annual / max) * 100;
        return (
          <div key={p.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, color: C.darkText }}>
                  {p.label}{' '}
                  <span style={{ color: C.midTeal }}>{formatCurrency(p.annual)}</span>{' '}
                  <span style={{ color: C.mutedText, fontWeight: 600 }}>({formatCurrency(p.monthly)}/mo)</span>
                </div>
                <div style={{ fontSize: 13, color: C.mutedText, marginTop: 2 }}>{p.sub || PAYROLL_SUBS[p.label] || ''}</div>
              </div>
            </div>
            <div style={{ height: 10, borderRadius: 8, background: C.rowBorder, overflow: 'hidden', marginTop: 8 }}>
              <div
                style={{
                  height: '100%',
                  width: active ? `${w}%` : '0%',
                  borderRadius: 8,
                  background: 'linear-gradient(90deg, #0D4F4F, #1A8A8A)',
                  transition: `width 0.85s ${EASE}`,
                  transitionDelay: `${active ? i * 55 : 0}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UtilitiesStackedChart({ active, utilityMonths }) {
  const months = utilityMonths;
  const max = Math.max(...months.map((m) => m.gas + m.elec + m.water + m.waste));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 240, paddingTop: 8 }}>
      {months.map((m, mi) => {
        const total = m.gas + m.elec + m.water + m.waste;
        const scale = active ? total / max : 0;
        const hPct = scale * 100;
        const seg = (v) => (total ? (v / total) * hPct : 0);
        return (
          <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: '100%',
                maxWidth: 32,
                height: `${hPct}%`,
                minHeight: active ? 4 : 0,
                borderRadius: 6,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                transition: `height 0.9s ${EASE}`,
                transitionDelay: `${active ? mi * 40 : 0}ms`,
              }}
            >
              <div style={{ flex: seg(m.waste), background: C.tan, minHeight: 2 }} />
              <div style={{ flex: seg(m.water), background: C.midTeal, minHeight: 2 }} />
              <div style={{ flex: seg(m.elec), background: C.teal, minHeight: 2 }} />
              <div style={{ flex: seg(m.gas), background: C.coral, minHeight: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: C.mutedText, fontWeight: 600 }}>{m.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function NetIncomeMiniBars({ active, months }) {
  const max = Math.max(...months.map((m) => m.net));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
      {months.map((m, i) => {
        const h = (m.net / max) * 100;
        const fill = m.net > 50000 ? '#22c55e' : m.net < 20000 ? C.coral : C.teal;
        return (
          <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: '100%',
                maxWidth: 22,
                height: `${active ? h : 0}%`,
                minHeight: active ? 3 : 0,
                borderRadius: '4px 4px 2px 2px',
                background: fill,
                transition: `height 0.75s ${EASE}`,
                transitionDelay: `${active ? i * 40 : 0}ms`,
              }}
            />
            <span style={{ fontSize: 9, color: C.mutedText }}>{m.month}</span>
          </div>
        );
      })}
    </div>
  );
}

const tableBase = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 720,
  fontFamily: ds.fontFamily,
};

function FinancialDashboard({ year }) {
  const D = useMemo(() => getFinancialYearData(year), [year]);

  const expenseAllocationUi = useMemo(
    () => D.expenseAllocation.map((s) => ({ name: s.name, pct: s.value, color: s.color })),
    [D.expenseAllocation]
  );

  const opexItemsUi = useMemo(() => D.opexItems.map((o) => [o.name, o.annual, o.pctRev]), [D.opexItems]);

  const cogsLineUi = useMemo(
    () =>
      D.cogsItems.map((c) => ({
        category: c.cat === 'utility' ? 'utilities' : c.cat === 'material' ? 'materials' : c.cat,
        item: c.name,
        description: c.desc,
        annual: c.annual,
        pctCogs: D.totals.cogs > 0 ? (c.annual / D.totals.cogs) * 100 : 0,
      })),
    [D.cogsItems, D.totals.cogs]
  );

  const payrollBarsUi = useMemo(
    () => D.payrollBars.map((p) => ({ label: p.name, annual: p.annual, monthly: p.avg })),
    [D.payrollBars]
  );

  const top5ForChart = useMemo(
    () => D.top5ExpenseChartData.map((x) => ({ label: x.name, value: x.value })),
    [D.top5ExpenseChartData]
  );

  const utilityMonthsScaled = useMemo(
    () =>
      D.months.map((m) => ({
        month: m.month,
        gas: m.gas / 1000,
        elec: m.elec / 1000,
        water: m.water / 1000,
        waste: m.waste / 1000,
      })),
    [D.months]
  );

  const revStats = useMemo(() => {
    const peak = Math.max(...D.months.map((m) => m.revenue));
    const low = Math.min(...D.months.map((m) => m.revenue));
    return {
      avg: D.totals.revenue / 12,
      peak,
      low,
      spread: peak - low,
    };
  }, [D.months, D.totals.revenue]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');
  const sectionRefs = useRef({});

  const [overviewRef, overviewIn] = useInView({ threshold: 0.15 });
  const [revBarRef, revBarIn] = useInView({ threshold: 0.2 });
  const [donutRef] = useInView({ threshold: 0.15 });
  const [yoyRef, yoyIn] = useInView({ threshold: 0.15 });
  const [netBarsRef, netBarsIn] = useInView({ threshold: 0.15 });
  const [opexBarRef, opexBarIn] = useInView({ threshold: 0.15 });
  const [utilChartRef, utilChartIn] = useInView({ threshold: 0.15 });
  const [payrollBarsRef, payrollBarsIn] = useInView({ threshold: 0.15 });

  const totals = D.totals;
  const displayRevenue = D.totals.revenue;
  const displayGross = D.gross;
  const displayNet = D.totals.net;
  const displayCogs = D.totals.cogs;

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const elements = ids.map((id) => sectionRefs.current[id]).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveNav(visible[0].target.id);
      },
      { threshold: [0.25, 0.35, 0.45], rootMargin: '-20% 0px -55% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [year]);

  const sectionProps = (id) => ({
    id,
    ref: (el) => {
      sectionRefs.current[id] = el;
    },
    style: { scrollMarginTop: SCROLL_MARGIN, marginBottom: 40 },
  });

  const opexBadgeTone = (p) => (p >= 2 ? 'coral' : p >= 1 ? 'mid' : 'slate');
  const cogsBadgeTone = (p) => (p >= 5 ? 'teal' : p >= 1 ? 'mid' : 'slate');

  const top5Max = Math.max(...top5ForChart.map((x) => x.value), 1);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: ${ds.fontFamily};
          background: ${C.background};
          color: ${C.darkText};
        }
        .cf-wrap {
          min-height: 100vh;
          background-color: ${C.background};
          background-image:
            linear-gradient(to right, ${C.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${C.gridLine} 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .cf-table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .cf-th {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
          color: ${C.mutedText};
          padding: 12px 14px;
          border-bottom: 2px solid ${C.rowBorder};
          text-align: right;
        }
        .cf-th:first-child, .cf-td:first-child { text-align: left; }
        .cf-td {
          padding: 11px 14px;
          border-bottom: 1px solid ${C.rowBorder};
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
      `}</style>

      <div className="cf-wrap" key={year}>
        <button
          type="button"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setSidebarOpen((o) => !o)}
          style={{
            position: 'fixed',
            left: 14,
            top: 14,
            zIndex: 60,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: 'none',
            background: C.teal,
            color: '#fff',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 2px 10px rgba(13,79,79,0.25)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              border: 'none',
              padding: 0,
              margin: 0,
              background: 'rgba(10, 22, 40, 0.3)',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
            }}
          />
        ) : null}

        <aside
          style={{
            position: 'fixed',
            left: sidebarOpen ? 0 : -280,
            top: 0,
            width: 260,
            height: '100vh',
            zIndex: 50,
            background: '#fff',
            borderRight: `1px solid ${C.rowBorder}`,
            padding: '20px 18px',
            transition: `left 0.28s ${EASE}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: sidebarOpen ? '4px 0 24px rgba(13,79,79,0.08)' : 'none',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                background: 'linear-gradient(145deg, #0D4F4F, #1A8A8A)',
                flexShrink: 0,
              }}
            >
              CF
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: C.darkText }}>Color Fashion</div>
              <div style={{ fontSize: 13, color: C.mutedText }}>Dye &amp; Finishing</div>
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: C.coral,
                    color: '#fff',
                  }}
                >
                  FY {year}
                </span>
                <span style={{ display: 'inline-flex', gap: 6 }}>
                  <NavLink to="/2024" style={yearLinkStyle} end>
                    2024
                  </NavLink>
                  <NavLink to="/2025" style={yearLinkStyle} end>
                    2025
                  </NavLink>
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: C.mutedText,
              marginBottom: 10,
              fontVariant: 'small-caps',
            }}
          >
            Sections
          </div>

          <nav style={{ display: 'grid', gap: 8, flex: 1, overflowY: 'auto' }}>
            {NAV.map(({ id, label, Icon }) => {
              const on = activeNav === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: 'left',
                    background: on ? C.teal : 'transparent',
                    color: on ? '#fff' : C.darkText,
                    transition: `background 0.2s ${EASE}, color 0.2s`,
                  }}
                >
                  <Icon />
                  {label}
                </button>
              );
            })}
          </nav>

          <Card style={{ padding: 14, marginTop: 16 }}>
            <div style={{ fontSize: 12, color: C.mutedText }}>Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{formatCurrency(D.sidebarRevenue)}</div>
            <div style={{ fontSize: 12, color: C.mutedText, marginTop: 8 }}>Net margin</div>
            <div style={{ fontWeight: 800, color: C.teal }}>{D.sidebarNetMargin}</div>
            <div style={{ fontSize: 12, color: C.mutedText, marginTop: 6 }}>Gross margin</div>
            <div style={{ fontWeight: 800, color: C.teal }}>{D.sidebarGrossMargin}</div>
          </Card>
        </aside>

        <main style={{ padding: '24px 20px 48px 72px', maxWidth: 1280, margin: '0 auto' }}>
          <header
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 28,
              paddingTop: 8,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 3.2vw, 36px)',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  maxWidth: 900,
                }}
              >
                <span style={{ color: C.teal }}>Color Fashion</span>{' '}
                <span style={{ color: C.coral }}>Dye &amp; Finishing</span>{' '}
                <span style={{ color: C.mutedText, fontWeight: 700 }}>—</span>{' '}
                <span style={{ color: C.teal }}>FY {year}</span>{' '}
                <span style={{ color: C.darkText }}>Financial Dashboard</span>
              </h1>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <NavLink to="/2024" style={yearLinkStyle} end>
                  View FY 2024
                </NavLink>
                <NavLink to="/2025" style={yearLinkStyle} end>
                  View FY 2025
                </NavLink>
              </div>
            </div>
            <Card style={{ padding: '12px 18px', minWidth: 200 }}>
              <div style={{ fontSize: 12, color: C.mutedText, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Revenue
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.teal }}>{formatCurrency(displayRevenue)}</div>
            </Card>
          </header>

          {/* Overview */}
          <section {...sectionProps('overview')}>
            <div ref={overviewRef}>
              <SectionHeader
                title="Overview"
                subtitle={`Executive KPIs, revenue cadence, expense mix${D.showYoySection ? ', and year-over-year performance' : ''} — FY ${year}.`}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                }}
              >
                <Card style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.mutedText }}>REVENUE</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.teal, marginTop: 6 }}>
                    <AnimatedNumber value={displayRevenue} active={overviewIn} delay={0} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Badge tone="teal">{D.kpiYoYLabel}</Badge>
                  </div>
                </Card>
                <Card style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.mutedText }}>GROSS PROFIT</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.midTeal, marginTop: 6 }}>
                    <AnimatedNumber value={displayGross} active={overviewIn} delay={90} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Badge tone="mid">{D.grossKpiSub}</Badge>
                  </div>
                </Card>
                <Card style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.mutedText }}>NET INCOME</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.mint, marginTop: 6 }}>
                    <AnimatedNumber value={displayNet} active={overviewIn} delay={180} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Badge tone="mint">{D.netKpiSub}</Badge>
                  </div>
                </Card>
                <Card style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.mutedText }}>COGS</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.coral, marginTop: 6 }}>
                    <AnimatedNumber value={displayCogs} active={overviewIn} delay={270} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Badge tone="coral">{D.cogsKpiSub}</Badge>
                  </div>
                </Card>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              <Card ref={revBarRef} style={{ padding: 18 }}>
                <SectionHeader title="Monthly revenue" subtitle="May and September peak performance highlighted." />
                <MonthlyRevenueBars active={revBarIn} months={D.months} />
                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 10,
                  }}
                >
                  {[
                    ['Avg', formatCurrency(revStats.avg)],
                    ['Peak', formatCurrency(revStats.peak)],
                    ['Low', formatCurrency(revStats.low)],
                    ['Spread', formatCurrency(revStats.spread)],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: C.background, borderRadius: 12, padding: 10 }}>
                      <div style={{ fontSize: 12, color: C.mutedText }}>{k}</div>
                      <div style={{ fontWeight: 800, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card ref={donutRef} style={{ padding: 18 }}>
                <SectionHeader title="Expense allocation" subtitle="Operating mix by category (percent of OpEx)." />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <ExpenseDonut allocation={expenseAllocationUi} centerLine2={D.totalExpensesLabel} />
                  <div style={{ display: 'grid', gap: 8 }}>
                    {expenseAllocationUi.map((s) => (
                      <div
                        key={s.name}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.darkText }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                          {s.name}
                        </span>
                        <Badge tone={s.color === C.coral ? 'coral' : s.color === C.slate ? 'slate' : s.color === C.mint ? 'mint' : 'teal'}>
                          {s.pct}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px 0' }}>
                  <SectionHeader title="COGS summary" />
                </div>
                <div className="cf-table-scroll">
                  <table style={tableBase}>
                    <thead>
                      <tr>
                        <th className="cf-th">Line</th>
                        <th className="cf-th">Amount</th>
                        <th className="cf-th">% Rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {D.cogsSummaryRows.map((r) => (
                        <tr key={r.label}>
                          <td className="cf-td" style={{ fontWeight: 600 }}>
                            {r.label}
                          </td>
                          <td className="cf-td">{formatCurrency(r.amount)}</td>
                          <td className="cf-td">
                            <Badge tone="teal">{r.pct}</Badge>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(237,241,243,0.65)', fontWeight: 800 }}>
                        <td className="cf-td">Total COGS</td>
                        <td className="cf-td">{formatCurrency(displayCogs)}</td>
                        <td className="cf-td">
                          <Badge tone="coral">{D.cogsKpiSub}</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px 0' }}>
                  <SectionHeader title="OpEx summary" />
                </div>
                <div className="cf-table-scroll">
                  <table style={tableBase}>
                    <thead>
                      <tr>
                        <th className="cf-th">Bucket</th>
                        <th className="cf-th">Amount</th>
                        <th className="cf-th">% Rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {D.opexSummaryRows.map((r) => (
                        <tr key={r.label}>
                          <td className="cf-td" style={{ fontWeight: 600 }}>
                            {r.label}
                          </td>
                          <td className="cf-td">{r.amount ? formatCurrency(r.amount) : '—'}</td>
                          <td className="cf-td">
                            <Badge tone="mid">{r.pct}</Badge>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(237,241,243,0.65)', fontWeight: 800 }}>
                        <td className="cf-td">Total OpEx</td>
                        <td className="cf-td">{formatCurrency(totals.opex)}</td>
                        <td className="cf-td">
                          <Badge tone="slate">{pctOf(totals.opex, displayRevenue)}</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <Card ref={yoyRef} style={{ padding: 20, marginTop: 16 }}>
              <SectionHeader
                title="YoY growth"
                subtitle={D.showYoySection ? 'Indexed comparison: 2024 baseline vs 2025 performance.' : 'Shown for FY 2025; switch year for prior-period context.'}
              />
              {D.showYoySection ? <p style={{ margin: '0 0 12px', fontSize: 13, color: C.mutedText }}>{D.yoyFootnote}</p> : null}
              <YoYGrowthBars active={yoyIn} show={D.showYoySection} />
            </Card>

            <div
              style={{
                marginTop: 16,
                borderRadius: 20,
                padding: '22px 20px',
                background: 'linear-gradient(120deg, #0D4F4F, #1A8A8A)',
                color: '#fff',
                boxShadow: ds.card.boxShadow,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 18,
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ opacity: 0.9, fontSize: 13 }}>Gross margin</div>
                  <div style={{ fontWeight: 800, fontSize: 32, marginTop: 4 }}>{D.profitabilityBanner.grossMargin}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.9, fontSize: 13 }}>Net margin</div>
                  <div style={{ fontWeight: 800, fontSize: 32, marginTop: 4 }}>{D.profitabilityBanner.netMargin}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.9, fontSize: 13 }}>Monthly avg revenue</div>
                  <div style={{ fontWeight: 800, fontSize: 32, marginTop: 4 }}>{D.profitabilityBanner.monthlyAvgRev}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Monthly */}
          <section {...sectionProps('monthly')}>
            <SectionHeader title="Monthly report" subtitle={D.monthlySectionSubtitle} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: C.mutedText }}>Best month</div>
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{D.miniKpis.bestLabel}</div>
              </Card>
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: C.mutedText }}>Worst</div>
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{D.miniKpis.worstLabel}</div>
              </Card>
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: C.mutedText }}>Avg net/mo</div>
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{D.miniKpis.avgNetLabel}</div>
              </Card>
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: C.mutedText }}>All profitable</div>
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{D.miniKpis.profitableLabel}</div>
              </Card>
            </div>

            <Card ref={netBarsRef} style={{ padding: 18, marginBottom: 16 }}>
              <SectionHeader title="Net income" subtitle="Strong months in green; watch-list months in coral." />
              <NetIncomeMiniBars active={netBarsIn} months={D.months} />
            </Card>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div className="cf-table-scroll">
                <table style={tableBase}>
                  <thead>
                    <tr>
                      {['Month', 'Revenue', 'COGS', 'Gross profit', 'GP%', 'OpEx', 'Net income', 'Net%'].map((h) => (
                        <th key={h} className="cf-th">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {D.months.map((m) => {
                      const gp = m.revenue - m.cogs;
                      const peak = m.month === 'May' || m.month === 'Sep';
                      return (
                        <tr key={m.month} style={{ background: peak ? 'rgba(46,196,182,0.12)' : 'transparent' }}>
                          <td className="cf-td" style={{ fontWeight: 700 }}>
                            {m.month}
                          </td>
                          <td className="cf-td">{formatMoneyFull(m.revenue)}</td>
                          <td className="cf-td">{formatMoneyFull(m.cogs)}</td>
                          <td className="cf-td">{formatMoneyFull(gp)}</td>
                          <td className="cf-td">{pctOf(gp, m.revenue)}</td>
                          <td className="cf-td">{formatMoneyFull(m.opex)}</td>
                          <td
                            className="cf-td"
                            style={{
                              fontWeight: 800,
                              color: m.net > 50000 ? C.mint : m.net < 20000 ? C.coral : C.teal,
                            }}
                          >
                            {formatMoneyFull(m.net)}
                          </td>
                          <td className="cf-td">{pctOf(m.net, m.revenue)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: 'rgba(237,241,243,0.75)', fontWeight: 800 }}>
                      <td className="cf-td">Total</td>
                      <td className="cf-td">{formatMoneyFull(totals.revenue)}</td>
                      <td className="cf-td">{formatMoneyFull(totals.cogs)}</td>
                      <td className="cf-td">{formatMoneyFull(totals.gross)}</td>
                      <td className="cf-td">{D.totalRowGpPct}</td>
                      <td className="cf-td">{formatMoneyFull(totals.opex)}</td>
                      <td className="cf-td">{formatMoneyFull(totals.net)}</td>
                      <td className="cf-td">{D.totalRowNetPct}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Expense */}
          <section {...sectionProps('expense')}>
            <SectionHeader title="Expense detail" subtitle="Operating expense composition and concentration." />
            <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
              <div className="cf-table-scroll">
                <table style={tableBase}>
                  <thead>
                    <tr>
                      <th className="cf-th">Expense</th>
                      <th className="cf-th">Annual</th>
                      <th className="cf-th">Monthly avg</th>
                      <th className="cf-th">% of revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opexItemsUi.map(([name, annual, p]) => (
                      <tr key={name}>
                        <td className="cf-td" style={{ fontWeight: 600 }}>
                          {name}
                        </td>
                        <td className="cf-td">{formatCurrency(annual)}</td>
                        <td className="cf-td">{formatCurrency(annual / 12)}</td>
                        <td className="cf-td">
                          <Badge tone={opexBadgeTone(p)}>{p.toFixed(1)}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card ref={opexBarRef} style={{ padding: 18 }}>
              <SectionHeader title="Top 5 expense drivers" />
              <HorizontalBarChart
                data={top5ForChart}
                max={top5Max}
                active={opexBarIn}
                barColor={C.midTeal}
              />
            </Card>
          </section>

          {/* COGS */}
          <section {...sectionProps('cogs')}>
            <SectionHeader title="COGS details" subtitle="Production cost structure with category emphasis." />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {D.cogsDetailCards.map(([t, v, b]) => (
                <Card key={t} style={{ padding: 16 }}>
                  <div style={{ color: C.mutedText, fontSize: 13 }}>{t}</div>
                  <div style={{ fontWeight: 800, fontSize: 26, marginTop: 6 }}>{formatCurrency(v)}</div>
                  <div style={{ marginTop: 10 }}>
                    <Badge tone="teal">{b}</Badge>
                  </div>
                </Card>
              ))}
            </div>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div className="cf-table-scroll">
                <table style={{ ...tableBase, minWidth: 820 }}>
                  <thead>
                    <tr>
                      <th className="cf-th">Item</th>
                      <th className="cf-th">Description</th>
                      <th className="cf-th">Annual</th>
                      <th className="cf-th">% of COGS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cogsLineUi.map((row) => {
                      const tint =
                        row.category === 'labor'
                          ? 'rgba(13,79,79,0.06)'
                          : row.category === 'utilities'
                            ? 'rgba(224,123,84,0.10)'
                            : 'transparent';
                      return (
                        <tr key={row.item} style={{ background: tint }}>
                          <td className="cf-td" style={{ fontWeight: 700 }}>
                            {row.item}
                          </td>
                          <td className="cf-td" style={{ textAlign: 'left', color: C.mutedText }}>
                            {row.description}
                          </td>
                          <td className="cf-td">{formatCurrency(row.annual)}</td>
                          <td className="cf-td">
                            <Badge tone={cogsBadgeTone(row.pctCogs)}>{row.pctCogs.toFixed(1)}%</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Utilities */}
          <section {...sectionProps('utilities')}>
            <SectionHeader title="Utilities" subtitle={D.utilitiesSubtitle} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {D.utilityCards.map((u) => {
                const tone =
                  u.color === C.coral ? 'coral' : u.color === C.slate ? 'slate' : u.color === C.mint ? 'mint' : u.color === C.mid ? 'mid' : 'teal';
                return (
                  <Card key={u.label} style={{ padding: 16 }}>
                    <div style={{ fontWeight: 800, marginTop: 0, color: C.darkText, fontSize: 15 }}>{u.label}</div>
                    <div style={{ fontWeight: 800, fontSize: 24, marginTop: 6 }}>{formatCurrency(u.amount)}</div>
                    <div style={{ marginTop: 8 }}>
                      <Badge tone={tone}>{u.pct}</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Card ref={utilChartRef} style={{ padding: 18, marginBottom: 16 }}>
              <SectionHeader title="Monthly utilities trend" subtitle="Stacked mix: gas, electricity, water, wastewater." />
              <UtilitiesStackedChart active={utilChartIn} utilityMonths={utilityMonthsScaled} />
            </Card>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div className="cf-table-scroll">
                <table style={tableBase}>
                  <thead>
                    <tr>
                      <th className="cf-th">Month</th>
                      <th className="cf-th">Gas</th>
                      <th className="cf-th">Electricity</th>
                      <th className="cf-th">Water</th>
                      <th className="cf-th">Wastewater</th>
                      <th className="cf-th">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {D.months.map((m) => (
                      <tr key={m.month}>
                        <td className="cf-td" style={{ fontWeight: 700 }}>
                          {m.month}
                        </td>
                        <td className="cf-td">{formatCurrency(m.gas)}</td>
                        <td className="cf-td">{formatCurrency(m.elec)}</td>
                        <td className="cf-td">{formatCurrency(m.water)}</td>
                        <td className="cf-td">{formatCurrency(m.waste)}</td>
                        <td className="cf-td" style={{ fontWeight: 800 }}>
                          {formatCurrency(m.gas + m.elec + m.water + m.waste)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Payroll */}
          <section {...sectionProps('payroll')}>
            <SectionHeader title="Payroll" subtitle="Production payroll in COGS vs administrative payroll in OpEx." />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Card style={{ padding: 16 }}>
                <div style={{ color: C.mutedText }}>Production payroll (COGS)</div>
                <div style={{ fontWeight: 800, fontSize: 28, marginTop: 6 }}>{formatCurrency(D.productionPayrollCard)}</div>
                <div style={{ marginTop: 10 }}>
                  <Badge tone="teal">{D.productionPayrollPct}</Badge>
                </div>
              </Card>
              <Card style={{ padding: 16 }}>
                <div style={{ color: C.mutedText }}>Admin payroll (OpEx)</div>
                <div style={{ fontWeight: 800, fontSize: 28, marginTop: 6 }}>{formatCurrency(D.adminPayrollCard)}</div>
                <div style={{ marginTop: 10 }}>
                  <Badge tone="mid">{D.adminPayrollPct}</Badge>
                </div>
              </Card>
            </div>
            <Card ref={payrollBarsRef} style={{ padding: 18, marginBottom: 16 }}>
              <SectionHeader title="Payroll components" subtitle="Annual totals with implied monthly run-rate." />
              <PayrollBarList active={payrollBarsIn} bars={payrollBarsUi} />
            </Card>
            <div
              style={{
                borderRadius: 20,
                padding: '20px 18px',
                background: 'linear-gradient(120deg, #0D4F4F, #1A8A8A)',
                color: '#fff',
                boxShadow: ds.card.boxShadow,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1.35,
                }}
              >
                <div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>Total payroll</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{formatCurrency(D.totalPayroll)}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>Headcount cost (avg / mo)</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{formatCurrency(D.headcountCost)}</div>
                  <div style={{ opacity: 0.85, fontSize: 12, marginTop: 4 }}>{pctOf(D.totalPayroll, displayRevenue)} of revenue</div>
                </div>
                <div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>Burden rate</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{D.burdenRate}%</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default FinancialDashboard;
