import React, { useEffect, useRef, useState } from 'react';

const design = {
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
    gridLine: 'rgba(13,79,79,0.03)',
    cardBorder: 'rgba(13,79,79,0.08)',
    cardShadow: '0 2px 8px rgba(13,79,79,0.04)',
  },
  radius: { card: '20px', pill: '999px' },
  spacing: { gridSize: '48px' },
  font: {
    family: "'Outfit', system-ui, -apple-system, sans-serif",
    weights: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  },
};

const pageBackground = {
  backgroundColor: design.colors.background,
  backgroundImage: `
    linear-gradient(to right, ${design.colors.gridLine} 1px, transparent 1px),
    linear-gradient(to bottom, ${design.colors.gridLine} 1px, transparent 1px)
  `,
  backgroundSize: `${design.spacing.gridSize} ${design.spacing.gridSize}`,
};

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

const useInView = (options = { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const AnimatedNumber = ({
  value,
  duration = 1400,
  format = formatCurrency,
  startOnInView = true,
  style,
  className,
}) => {
  const [ref, inView] = useInView();
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (startOnInView && !inView) return;
    const target = Number(value) || 0;
    const startValue = 0;
    startRef.current = 0;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setDisplay(startValue + (target - startValue) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, inView, startOnInView]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(display)}
    </span>
  );
};

const Card = ({ children, style, padding = '28px', as: Tag = 'div', ...rest }) => (
  <Tag
    style={{
      backgroundColor: design.colors.cardBg,
      borderRadius: design.radius.card,
      boxShadow: design.colors.cardShadow,
      border: `1px solid ${design.colors.cardBorder}`,
      padding,
      ...style,
    }}
    {...rest}
  >
    {children}
  </Tag>
);

const Badge = ({ children, color = design.colors.midTeal, variant = 'soft', style }) => {
  const isSolid = variant === 'solid';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: design.radius.pill,
        backgroundColor: isSolid ? color : `${color}1A`,
        color: isSolid ? '#FFFFFF' : color,
        fontFamily: design.font.family,
        fontWeight: design.font.weights.semibold,
        fontSize: '12px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const SectionHeader = ({ eyebrow, title, description, action, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '24px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      ...style,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {eyebrow && <Badge color={design.colors.coral}>{eyebrow}</Badge>}
      <h2
        style={{
          margin: 0,
          fontFamily: design.font.family,
          fontWeight: design.font.weights.bold,
          fontSize: '28px',
          color: design.colors.darkText,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            margin: 0,
            fontFamily: design.font.family,
            fontWeight: design.font.weights.regular,
            fontSize: '15px',
            color: design.colors.mutedText,
            maxWidth: '640px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── COGS Section ─────────────────────────────────────────────────────────────

const cogsSummary = [
  { category: 'Labor', amount: 4120000, pct: 42.6, color: design.colors.teal },
  { category: 'Materials', amount: 2510000, pct: 25.9, color: design.colors.mint },
  { category: 'Utilities', amount: 2560000, pct: 26.5, color: design.colors.coral },
  { category: 'Other', amount: 480000, pct: 5.0, color: design.colors.slate },
];

const cogsLineItems = [
  { category: 'labor', item: 'Direct Labor — Samuel Hale', description: 'Primary production contractor', annual: 3410000, pct: 25.7 },
  { category: 'labor', item: 'Direct Labor — Workforce', description: 'Hourly production staff', annual: 532000, pct: 4.0 },
  { category: 'labor', item: 'Payroll — Other COGS', description: 'Overtime bonuses', annual: 178000, pct: 1.3 },
  { category: 'materials', item: 'Chemical & Dyestuffs', description: 'Dyes & chemicals', annual: 2353000, pct: 17.7 },
  { category: 'materials', item: 'Finishing Supplies — Paper Tube', description: 'Packaging tubes', annual: 98000, pct: 0.7 },
  { category: 'materials', item: 'Lab Supplies — Testing', description: 'Quality testing', annual: 67000, pct: 0.5 },
  { category: 'materials', item: 'Plant Supplies & Parts', description: 'Machine parts', annual: 89000, pct: 0.7 },
  { category: 'other', item: 'Freight & Shipping', description: 'Logistics', annual: 168000, pct: 1.3 },
  { category: 'other', item: 'Truck Repair', description: 'Fleet maintenance', annual: 45000, pct: 0.3 },
  { category: 'other', item: 'Insurance — Liability', description: 'Plant coverage', annual: 50000, pct: 0.4 },
  { category: 'utilities', item: 'Utilities — Gas', description: 'Boiler & heating', annual: 1207000, pct: 9.1 },
  { category: 'utilities', item: 'Utilities — Electricity', description: 'Machine power', annual: 837000, pct: 6.3 },
  { category: 'utilities', item: 'Utilities — Water', description: 'Process water', annual: 345000, pct: 2.6 },
  { category: 'utilities', item: 'Utilities — Wastewater', description: 'Treatment', annual: 171000, pct: 1.3 },
];

const rowTint = (category) => {
  if (category === 'labor') return 'rgba(13,79,79,0.05)';
  if (category === 'utilities') return 'rgba(224,123,84,0.06)';
  return 'transparent';
};

const pctBadgeColor = (pct) => {
  if (pct >= 5) return design.colors.teal;
  if (pct >= 1) return design.colors.midTeal;
  return design.colors.slate;
};

const COGSSection = () => (
  <section style={{ marginBottom: '48px' }}>
    <SectionHeader
      eyebrow="Cost of Goods Sold"
      title="COGS Details"
      description="Annual cost breakdown by category and line item for FY 2025."
    />

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cogsSummary.map(({ category, amount, pct, color }) => (
        <Card key={category} padding="24px">
          <div
            style={{
              fontSize: '11px',
              fontWeight: design.font.weights.semibold,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color,
              marginBottom: '8px',
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: design.font.weights.bold,
              color: design.colors.darkText,
              letterSpacing: '-0.01em',
              marginBottom: '10px',
            }}
          >
            <AnimatedNumber value={amount} />
          </div>
          <Badge color={color}>{pct}% of COGS</Badge>
        </Card>
      ))}
    </div>

    <Card padding="0">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: design.font.family }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${design.colors.cardBorder}` }}>
            {['Item', 'Description', 'Annual', '% of COGS'].map((col) => (
              <th
                key={col}
                style={{
                  padding: '14px 20px',
                  textAlign: col === 'Annual' || col === '% of COGS' ? 'right' : 'left',
                  fontSize: '11px',
                  fontWeight: design.font.weights.semibold,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: design.colors.mutedText,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cogsLineItems.map(({ category, item, description, annual, pct }, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: rowTint(category),
                borderBottom: `1px solid ${design.colors.cardBorder}`,
              }}
            >
              <td
                style={{
                  padding: '13px 20px',
                  fontSize: '14px',
                  fontWeight: design.font.weights.medium,
                  color: design.colors.darkText,
                }}
              >
                {item}
              </td>
              <td style={{ padding: '13px 20px', fontSize: '14px', color: design.colors.mutedText }}>
                {description}
              </td>
              <td
                style={{
                  padding: '13px 20px',
                  fontSize: '14px',
                  fontWeight: design.font.weights.semibold,
                  color: design.colors.darkText,
                  textAlign: 'right',
                }}
              >
                {formatCurrency(annual)}
              </td>
              <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                <Badge color={pctBadgeColor(pct)}>{pct}%</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </section>
);

// ─── Monthly Report Data ──────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 1132141, cogs: 823600, opex: 265200, net: 43341 },
  { month: 'Feb', revenue: 1054328, cogs: 767200, opex: 257100, net: 30028 },
  { month: 'Mar', revenue: 978560,  cogs: 712400, opex: 243800, net: 22360 },
  { month: 'Apr', revenue: 1098745, cogs: 799800, opex: 258300, net: 40645 },
  { month: 'May', revenue: 1326890, cogs: 965600, opex: 268500, net: 92790 },
  { month: 'Jun', revenue: 1189234, cogs: 865700, opex: 242400, net: 81134 },
  { month: 'Jul', revenue: 1067450, cogs: 777100, opex: 252200, net: 38150 },
  { month: 'Aug', revenue: 1245670, cogs: 906800, opex: 256600, net: 82270 },
  { month: 'Sep', revenue: 1298340, cogs: 945200, opex: 264300, net: 88840 },
  { month: 'Oct', revenue: 1156780, cogs: 842100, opex: 258900, net: 55780 },
  { month: 'Nov', revenue: 1089432, cogs: 793100, opex: 254700, net: 41632 },
  { month: 'Dec', revenue: 944430,  cogs: 687400, opex: 250900, net: 6130  },
].map(r => ({
  ...r,
  gp: r.revenue - r.cogs,
  gpPct: (r.revenue - r.cogs) / r.revenue * 100,
  netPct: r.net / r.revenue * 100,
}));

const PEAK_MONTHS = new Set(['May', 'Sep']);

const TOTALS = (() => {
  const t = MONTHLY_DATA.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue,
      cogs: acc.cogs + r.cogs,
      gp: acc.gp + r.gp,
      opex: acc.opex + r.opex,
      net: acc.net + r.net,
    }),
    { revenue: 0, cogs: 0, gp: 0, opex: 0, net: 0 }
  );
  return { ...t, gpPct: t.gp / t.revenue * 100, netPct: t.net / t.revenue * 100 };
})();

const MAX_NET = Math.max(...MONTHLY_DATA.map(r => r.net));

const netColor = (net) => {
  if (net > 50000) return design.colors.mint;
  if (net < 20000) return design.colors.coral;
  return design.colors.midTeal;
};

const barColor = (net) => {
  if (net >= 50000) return design.colors.mint;
  if (net < 20000) return design.colors.coral;
  return design.colors.midTeal;
};

// ─── Monthly Report Components ────────────────────────────────────────────────

const MiniKPI = ({ label, value, sub, accent }) => (
  <Card padding="20px 24px">
    <div style={{
      fontSize: '11px',
      fontWeight: design.font.weights.semibold,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: design.colors.mutedText,
      marginBottom: '10px',
      fontFamily: design.font.family,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '30px',
      fontWeight: design.font.weights.bold,
      color: accent,
      lineHeight: 1,
      letterSpacing: '-0.02em',
      fontFamily: design.font.family,
    }}>
      {value}
    </div>
    {sub && (
      <div style={{
        fontSize: '12px',
        color: design.colors.mutedText,
        marginTop: '4px',
        fontFamily: design.font.family,
      }}>
        {sub}
      </div>
    )}
    <div style={{
      height: '3px',
      backgroundColor: `${accent}22`,
      borderRadius: '999px',
      marginTop: '16px',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: '70%',
        backgroundColor: accent,
        borderRadius: '999px',
        opacity: 0.65,
      }} />
    </div>
  </Card>
);

const TH = ({ children, align = 'right' }) => (
  <th style={{
    padding: '13px 18px',
    textAlign: align,
    fontSize: '11px',
    fontWeight: design.font.weights.semibold,
    fontFamily: design.font.family,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontVariant: 'small-caps',
    color: design.colors.mutedText,
    borderBottom: '2px solid #EDF1F3',
    backgroundColor: '#F8FAFB',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </th>
);

const MonthlyReport = () => (
  <section style={{ marginTop: '56px' }}>
    <SectionHeader
      eyebrow="Full Year Breakdown"
      title="Monthly Report"
      description="Revenue, cost structure, and net profitability across all twelve months of FY 2025."
    />

    {/* KPI Mini Cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '28px',
    }}>
      <MiniKPI label="Best Month"     value="$93K"    sub="May"        accent={design.colors.mint}    />
      <MiniKPI label="Worst Month"    value="$6K"     sub="Dec"        accent={design.colors.coral}   />
      <MiniKPI label="Avg Net / Mo"   value="$44K"    sub="per month"  accent={design.colors.midTeal} />
      <MiniKPI label="All Profitable" value="12 / 12" sub="months"     accent={design.colors.teal}    />
    </div>

    {/* P&L Table */}
    <Card padding="0" style={{ marginBottom: '28px', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: design.font.family,
          fontSize: '13px',
          color: design.colors.darkText,
        }}>
          <thead>
            <tr>
              <TH align="left">Month</TH>
              <TH>Revenue</TH>
              <TH>COGS</TH>
              <TH>Gross Profit</TH>
              <TH>GP%</TH>
              <TH>OpEx</TH>
              <TH>Net Income</TH>
              <TH>Net%</TH>
            </tr>
          </thead>
          <tbody>
            {MONTHLY_DATA.map(row => {
              const isPeak = PEAK_MONTHS.has(row.month);
              const nc = netColor(row.net);
              const cell = { padding: '11px 18px', borderBottom: '1px solid #EDF1F3' };
              return (
                <tr key={row.month} style={{
                  backgroundColor: isPeak ? 'rgba(46,196,182,0.06)' : '#fff',
                }}>
                  <td style={{ ...cell, textAlign: 'left', fontWeight: design.font.weights.semibold, color: design.colors.darkText }}>
                    {row.month}
                    {isPeak && (
                      <span style={{ marginLeft: '6px', fontSize: '9px', color: design.colors.mint, verticalAlign: 'middle' }}>▲</span>
                    )}
                  </td>
                  <td style={{ ...cell, textAlign: 'right' }}>{formatCurrency(row.revenue)}</td>
                  <td style={{ ...cell, textAlign: 'right', color: design.colors.mutedText }}>{formatCurrency(row.cogs)}</td>
                  <td style={{ ...cell, textAlign: 'right' }}>{formatCurrency(row.gp)}</td>
                  <td style={{ ...cell, textAlign: 'right', color: design.colors.midTeal, fontWeight: design.font.weights.medium }}>{row.gpPct.toFixed(1)}%</td>
                  <td style={{ ...cell, textAlign: 'right', color: design.colors.mutedText }}>{formatCurrency(row.opex)}</td>
                  <td style={{ ...cell, textAlign: 'right', color: nc, fontWeight: design.font.weights.semibold }}>{formatCurrency(row.net)}</td>
                  <td style={{ ...cell, textAlign: 'right', color: nc }}>{row.netPct.toFixed(1)}%</td>
                </tr>
              );
            })}

            {/* TOTAL row */}
            <tr style={{ backgroundColor: '#EEF2F4' }}>
              {[
                { v: 'Total',                          align: 'left',  color: design.colors.darkText,  upper: true },
                { v: formatCurrency(TOTALS.revenue),   align: 'right', color: design.colors.darkText               },
                { v: formatCurrency(TOTALS.cogs),      align: 'right', color: design.colors.mutedText              },
                { v: formatCurrency(TOTALS.gp),        align: 'right', color: design.colors.darkText               },
                { v: `${TOTALS.gpPct.toFixed(1)}%`,    align: 'right', color: design.colors.midTeal                },
                { v: formatCurrency(TOTALS.opex),      align: 'right', color: design.colors.mutedText              },
                { v: formatCurrency(TOTALS.net),       align: 'right', color: design.colors.teal                   },
                { v: `${TOTALS.netPct.toFixed(1)}%`,   align: 'right', color: design.colors.teal                   },
              ].map((c, i) => (
                <td key={i} style={{
                  padding: '13px 18px',
                  textAlign: c.align,
                  fontWeight: design.font.weights.bold,
                  color: c.color,
                  fontFamily: design.font.family,
                  fontSize: c.upper ? '11px' : '13px',
                  letterSpacing: c.upper ? '0.08em' : 0,
                  textTransform: c.upper ? 'uppercase' : 'none',
                  borderTop: '2px solid #D0D8DC',
                }}>
                  {c.v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    {/* Net Income Bar Chart */}
    <Card padding="24px 28px">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: design.font.weights.semibold, color: design.colors.darkText, fontFamily: design.font.family }}>
            Net Income — Monthly Performance
          </div>
          <div style={{ fontSize: '12px', color: design.colors.mutedText, marginTop: '2px', fontFamily: design.font.family }}>
            FY 2025 · all values in USD
          </div>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Strong  >$50K', color: design.colors.mint    },
            { label: 'Mid  $20–50K',  color: design.colors.midTeal },
            { label: 'Weak  <$20K',   color: design.colors.coral   },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: l.color, opacity: 0.85 }} />
              <span style={{ fontSize: '11px', color: design.colors.mutedText, fontFamily: design.font.family }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '7px', height: '110px' }}>
        {MONTHLY_DATA.map(row => {
          const barH = Math.max((row.net / MAX_NET) * 110, 4);
          return (
            <div
              key={row.month}
              title={`${row.month}: ${formatCurrency(row.net)}`}
              style={{
                flex: 1,
                height: `${barH}px`,
                backgroundColor: barColor(row.net),
                borderRadius: '4px 4px 2px 2px',
                opacity: 0.82,
                cursor: 'default',
                transition: 'opacity 0.15s ease',
              }}
            />
          );
        })}
      </div>

      {/* Baseline */}
      <div style={{ height: '1px', backgroundColor: '#EDF1F3' }} />

      {/* Month labels */}
      <div style={{ display: 'flex', gap: '7px', marginTop: '7px' }}>
        {MONTHLY_DATA.map(row => (
          <div key={row.month} style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '10px',
            color: design.colors.mutedText,
            fontFamily: design.font.family,
            fontWeight: design.font.weights.medium,
            letterSpacing: '0.01em',
          }}>
            {row.month}
          </div>
        ))}
      </div>
    </Card>
  </section>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const FinancialDashboard = () => {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
      />
      <main
        style={{
          minHeight: '100vh',
          ...pageBackground,
          fontFamily: design.font.family,
          color: design.colors.darkText,
          padding: '48px 32px',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <header style={{ marginBottom: '40px' }}>
            <Badge color={design.colors.teal}>FY 2025</Badge>
            <h1
              style={{
                margin: '12px 0 8px',
                fontFamily: design.font.family,
                fontWeight: design.font.weights.extrabold,
                fontSize: '40px',
                letterSpacing: '-0.02em',
                color: design.colors.teal,
              }}
            >
              Color Fashion Dye & Finishing
            </h1>
            <p
              style={{
                margin: 0,
                fontFamily: design.font.family,
                fontWeight: design.font.weights.medium,
                fontSize: '18px',
                color: design.colors.mutedText,
              }}
            >
              FY 2025 Financial Dashboard
            </p>
          </header>

          <COGSSection />
          <MonthlyReport />
        </div>
      </main>
    </>
  );
};

export default FinancialDashboard;
