import React, { useEffect, useMemo, useState } from 'react';
import { useDashboardDataset } from './hooks/useDashboardDataset';

const sourceMeta = {
  actual: { label: 'Actual', color: '#0D4F4F' },
  budget: { label: 'Budget', color: '#1A8A8A' },
  forecast: { label: 'Forecast', color: '#E07B54' },
};
const sourceOrder = ['actual', 'budget', 'forecast'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

const formatCurrencyFull = (value) => {
  const n = Number(value) || 0;
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const pct = (num, den) => (den ? (num / den) * 100 : 0);
const sumYear = (items) => items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

const defaultRows = monthLabels.map((month) => ({
  month,
  revenue: 0,
  cogs: 0,
  opex: 0,
  other: 0,
  grossProfit: 0,
  netIncome: 0,
}));

const defaultTotals = {
  revenue: 0,
  cogs: 0,
  opex: 0,
  other: 0,
  grossProfit: 0,
  netIncome: 0,
};

const cardStyle = {
  background: '#fff',
  border: '1px solid rgba(13,79,79,0.08)',
  borderRadius: 16,
  boxShadow: '0 2px 8px rgba(13,79,79,0.04)',
};

const sectionHeader = (title, subtitle) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: 24, color: '#1A3A4A' }}>{title}</h2>
    {subtitle ? <p style={{ margin: '6px 0 0', color: '#5A7A8A' }}>{subtitle}</p> : null}
  </div>
);

const SourceSwitcher = ({ source, setSource, availableSources }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {sourceOrder.filter((s) => availableSources.includes(s)).map((s) => {
      const active = s === source;
      const meta = sourceMeta[s];
      return (
        <button
          key={s}
          type="button"
          onClick={() => setSource(s)}
          style={{
            border: 'none',
            borderRadius: 999,
            cursor: 'pointer',
            padding: '6px 12px',
            fontWeight: 600,
            color: active ? '#fff' : meta.color,
            background: active ? meta.color : `${meta.color}22`,
          }}
        >
          {meta.label}
        </button>
      );
    })}
  </div>
);

const KpiGrid = ({ totals }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
    {[
      { label: 'Revenue', value: totals.revenue, color: '#0D4F4F' },
      { label: 'COGS', value: totals.cogs, color: '#E07B54' },
      { label: 'Gross Profit', value: totals.grossProfit, color: '#1A8A8A' },
      { label: 'OpEx', value: totals.opex, color: '#94A7B0' },
      { label: 'Net Income', value: totals.netIncome, color: totals.netIncome >= 0 ? '#2EC4B6' : '#E07B54' },
    ].map((k) => (
      <div key={k.label} style={{ ...cardStyle, padding: 16 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#5A7A8A', marginBottom: 6 }}>{k.label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{formatCurrency(k.value)}</div>
      </div>
    ))}
  </div>
);

const MonthlyTable = ({ rows }) => (
  <div style={{ ...cardStyle, overflow: 'hidden' }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
        <thead>
          <tr>
            {['Month', 'Revenue', 'COGS', 'Gross Profit', 'OpEx', 'Other', 'Net Income'].map((col, idx) => (
              <th
                key={col}
                style={{
                  textAlign: idx === 0 ? 'left' : 'right',
                  padding: '12px 16px',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: '#5A7A8A',
                  borderBottom: '2px solid rgba(13,79,79,0.08)',
                  background: '#F8FAFB',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.month} style={{ background: i % 2 ? 'rgba(13,79,79,0.016)' : '#fff' }}>
              <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(13,79,79,0.08)' }}>{row.month}</td>
              <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid rgba(13,79,79,0.08)' }}>{formatCurrencyFull(row.revenue)}</td>
              <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid rgba(13,79,79,0.08)' }}>{formatCurrencyFull(row.cogs)}</td>
              <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid rgba(13,79,79,0.08)' }}>{formatCurrencyFull(row.grossProfit)}</td>
              <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid rgba(13,79,79,0.08)' }}>{formatCurrencyFull(row.opex)}</td>
              <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid rgba(13,79,79,0.08)' }}>{formatCurrencyFull(row.other)}</td>
              <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid rgba(13,79,79,0.08)', color: row.netIncome >= 0 ? '#0D4F4F' : '#E07B54', fontWeight: 600 }}>{formatCurrencyFull(row.netIncome)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LineItemsTop = ({ title, items, totalBase, color }) => (
  <div style={{ ...cardStyle, padding: 16 }}>
    <h3 style={{ margin: 0, fontSize: 18, color: '#1A3A4A' }}>{title}</h3>
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 13 }}>{item.label}</div>
          <div style={{ minWidth: 90, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</div>
          <span style={{ fontSize: 12, color }}>{pct(item.total, totalBase).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  </div>
);

const FinancialDashboard = () => {
  const { loading, error, data } = useDashboardDataset(2026);
  const [source, setSource] = useState('actual');
  const [activeSection, setActiveSection] = useState('snapshot');

  const availableSources = data?.availableSources || sourceOrder;

  useEffect(() => {
    if (!availableSources.includes(source)) setSource(availableSources[0] || 'actual');
  }, [availableSources, source]);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.dataset.section);
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [loading]);

  const current = useMemo(() => {
    if (!data) return { rows: defaultRows, totals: defaultTotals, lineItems: [] };
    return {
      rows: data.sources?.[source]?.rows || defaultRows,
      totals: data.sources?.[source]?.totals || defaultTotals,
      lineItems: data.lineItemsBySource?.[source] || [],
    };
  }, [data, source]);

  const cogsItems = useMemo(() => current.lineItems.filter((r) => r.category === 'COGS').sort((a, b) => b.total - a.total), [current.lineItems]);
  const opexItems = useMemo(() => current.lineItems.filter((r) => r.category === 'OPEX').sort((a, b) => b.total - a.total), [current.lineItems]);
  const utilityItems = useMemo(
    () =>
      current.lineItems
        .filter((r) => {
          const l = r.label.toLowerCase();
          return l.includes('utilities') || l.includes('water') || l.includes('electric') || l.includes('gas');
        })
        .sort((a, b) => b.total - a.total),
    [current.lineItems]
  );
  const payrollItems = useMemo(
    () =>
      current.lineItems
        .filter((r) => ['labor', 'payroll', 'benefits', 'contract labor', 'tax'].some((kw) => r.label.toLowerCase().includes(kw)))
        .sort((a, b) => b.total - a.total),
    [current.lineItems]
  );

  const hasRows = current.rows.some((r) => Math.abs(r.revenue) > 0 || Math.abs(r.netIncome) > 0 || Math.abs(r.opex) > 0);
  const peak = current.rows.reduce((best, row) => (row.netIncome > best.netIncome ? row : best), current.rows[0] || { month: 'N/A', netIncome: 0 });
  const low = current.rows.reduce((best, row) => (row.netIncome < best.netIncome ? row : best), current.rows[0] || { month: 'N/A', netIncome: 0 });
  const activeRows = current.rows.filter((r) => Math.abs(r.revenue) > 0 || Math.abs(r.netIncome) > 0 || Math.abs(r.opex) > 0);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; font-family: Outfit, system-ui, -apple-system, sans-serif; }
        @media (max-width: 980px) { .cf-side { display:none !important; } .cf-main { padding: 24px 16px !important; } }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          backgroundColor: '#F4F7F9',
          backgroundImage:
            'linear-gradient(to right, rgba(13,79,79,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(13,79,79,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <aside className="cf-side" style={{ width: 230, borderRight: '1px solid rgba(13,79,79,0.08)', background: '#fff', padding: '28px 12px', position: 'sticky', top: 0, height: '100vh' }}>
          <div style={{ padding: '0 10px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0D4F4F,#1A8A8A)', color: '#fff', fontWeight: 800, marginBottom: 10 }}>CF</div>
            <div style={{ fontWeight: 700, color: '#1A3A4A' }}>Color Fashion</div>
            <div style={{ fontSize: 12, color: '#5A7A8A' }}>2026 Live Dashboard</div>
          </div>
          {[
            ['snapshot', '2026 Snapshot'],
            ['overview', 'Overview'],
            ['cogs', 'COGS Details'],
            ['payroll', 'Payroll Analysis'],
            ['utilities', 'Utility Costs'],
            ['expenses', 'Expense Detail'],
            ['monthly', 'Monthly Report'],
          ].map(([id, label]) => {
            const active = activeSection === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  margin: '4px 6px',
                  padding: '9px 10px',
                  borderRadius: 10,
                  color: active ? '#0D4F4F' : '#5A7A8A',
                  background: active ? 'rgba(13,79,79,0.08)' : 'transparent',
                  borderLeft: active ? '3px solid #0D4F4F' : '3px solid transparent',
                }}
              >
                {label}
              </a>
            );
          })}
        </aside>

        <main className="cf-main" style={{ flex: 1, padding: 40 }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(13,79,79,0.12)', color: '#0D4F4F', fontWeight: 700 }}>FY 2026 Live Dashboard</span>
            <h1 style={{ margin: '10px 0 6px', color: '#0D4F4F', fontSize: 38 }}>Color Fashion Dye &amp; Finishing</h1>
            <p style={{ margin: 0, color: '#5A7A8A', fontSize: 17 }}>Supabase-driven P&amp;L Dashboard (Actual · Budget · Forecast)</p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <SourceSwitcher source={source} setSource={setSource} availableSources={availableSources} />
          </div>

          {!data?.configured ? (
            <div style={{ ...cardStyle, padding: 14, marginBottom: 16, borderLeft: '4px solid #E07B54' }}>
              Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in a local <code>.env</code> file to load live data.
            </div>
          ) : null}

          {error ? (
            <div style={{ ...cardStyle, padding: 14, marginBottom: 16, borderLeft: '4px solid #E07B54' }}>Failed to load dashboard data: {error}</div>
          ) : null}

          {loading ? (
            <div style={{ ...cardStyle, padding: 14 }}>Loading 2026 dashboard data...</div>
          ) : (
            <>
              <section id="snapshot" data-section="snapshot" style={{ marginBottom: 38, scrollMarginTop: 80 }}>
                {sectionHeader('2026 Snapshot (Supabase)', `Source: ${sourceMeta[source].label} · Monthly P&L totals from pl_category_summary`)}
                <KpiGrid totals={current.totals} />
                <MonthlyTable rows={current.rows} />
              </section>

              <section id="overview" data-section="overview" style={{ marginBottom: 38, scrollMarginTop: 80 }}>
                {sectionHeader('Overview', `High-level 2026 ${sourceMeta[source].label} performance`)}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(150px,1fr))', gap: 12 }}>
                  {[
                    { label: 'Best Month', value: formatCurrency(peak.netIncome), sub: peak.month, color: '#2EC4B6' },
                    { label: 'Worst Month', value: formatCurrency(low.netIncome), sub: low.month, color: '#E07B54' },
                    { label: 'Gross Margin', value: `${pct(current.totals.grossProfit, current.totals.revenue).toFixed(1)}%`, sub: 'year total', color: '#1A8A8A' },
                    { label: 'Net Margin', value: `${pct(current.totals.netIncome, current.totals.revenue).toFixed(1)}%`, sub: 'year total', color: '#0D4F4F' },
                  ].map((k) => (
                    <div key={k.label} style={{ ...cardStyle, padding: 14 }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#5A7A8A' }}>{k.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
                      <div style={{ fontSize: 12, color: '#5A7A8A' }}>{k.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="cogs" data-section="cogs" style={{ marginBottom: 38, scrollMarginTop: 80 }}>
                {sectionHeader('COGS Details', `Top COGS line items in 2026 ${sourceMeta[source].label}`)}
                <LineItemsTop title="Top COGS" items={cogsItems.slice(0, 10)} totalBase={sumYear(cogsItems) || 1} color="#0D4F4F" />
              </section>

              <section id="payroll" data-section="payroll" style={{ marginBottom: 38, scrollMarginTop: 80 }}>
                {sectionHeader('Payroll Analysis', `Payroll-related lines in 2026 ${sourceMeta[source].label}`)}
                <LineItemsTop title="Payroll Items" items={payrollItems.slice(0, 10)} totalBase={sumYear(payrollItems) || 1} color="#1A8A8A" />
              </section>

              <section id="utilities" data-section="utilities" style={{ marginBottom: 38, scrollMarginTop: 80 }}>
                {sectionHeader('Utility Costs', `Utility-related lines in 2026 ${sourceMeta[source].label}`)}
                <LineItemsTop title="Utility Items" items={utilityItems.slice(0, 10)} totalBase={sumYear(utilityItems) || 1} color="#E07B54" />
              </section>

              <section id="expenses" data-section="expenses" style={{ marginBottom: 38, scrollMarginTop: 80 }}>
                {sectionHeader('Expense Detail', `Top OpEx lines in 2026 ${sourceMeta[source].label}`)}
                <LineItemsTop title="Top OpEx" items={opexItems.slice(0, 12)} totalBase={sumYear(opexItems) || 1} color="#94A7B0" />
              </section>

              <section id="monthly" data-section="monthly" style={{ marginBottom: 10, scrollMarginTop: 80 }}>
                {sectionHeader('Monthly Report', `2026 ${sourceMeta[source].label} month-by-month P&L`)}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(150px,1fr))', gap: 12, marginBottom: 12 }}>
                  <div style={{ ...cardStyle, padding: 14 }}><div style={{ fontSize: 11, color: '#5A7A8A', textTransform: 'uppercase' }}>Profitable Months</div><div style={{ fontSize: 28, fontWeight: 800, color: '#0D4F4F' }}>{activeRows.filter((r) => r.netIncome > 0).length} / {activeRows.length || 12}</div></div>
                  <div style={{ ...cardStyle, padding: 14 }}><div style={{ fontSize: 11, color: '#5A7A8A', textTransform: 'uppercase' }}>Avg Net / Active Mo</div><div style={{ fontSize: 28, fontWeight: 800, color: '#1A8A8A' }}>{formatCurrency(activeRows.length ? current.totals.netIncome / activeRows.length : 0)}</div></div>
                  <div style={{ ...cardStyle, padding: 14 }}><div style={{ fontSize: 11, color: '#5A7A8A', textTransform: 'uppercase' }}>Total Revenue</div><div style={{ fontSize: 28, fontWeight: 800, color: '#0D4F4F' }}>{formatCurrency(current.totals.revenue)}</div></div>
                  <div style={{ ...cardStyle, padding: 14 }}><div style={{ fontSize: 11, color: '#5A7A8A', textTransform: 'uppercase' }}>Total Net</div><div style={{ fontSize: 28, fontWeight: 800, color: current.totals.netIncome >= 0 ? '#2EC4B6' : '#E07B54' }}>{formatCurrency(current.totals.netIncome)}</div></div>
                </div>
                {hasRows ? <MonthlyTable rows={current.rows} /> : <div style={{ ...cardStyle, padding: 14 }}>No monthly rows available for this source.</div>}
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default FinancialDashboard;
