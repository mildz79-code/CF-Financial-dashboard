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

// ─── Expense Detail data ────────────────────────────────────────────────────

const OPEX_DATA = [
  { label: 'Payroll Admin',          annual: 845000,  pct: 6.4 },
  { label: 'Payroll Taxes',          annual: 156000,  pct: 1.2 },
  { label: 'Employee Benefits',      annual: 98000,   pct: 0.7 },
  { label: 'Rent Expense',           annual: 1052000, pct: 7.9 },
  { label: 'Rent Management Fee',    annual: 262000,  pct: 2.0 },
  { label: 'Professional Fees Legal',annual: 72000,   pct: 0.5 },
  { label: 'Professional Fees Other',annual: 40000,   pct: 0.3 },
  { label: 'Sales Commission',       annual: 65000,   pct: 0.5 },
  { label: 'Sales Promotion',        annual: 18000,   pct: 0.1 },
  { label: 'Office Expense',         annual: 42000,   pct: 0.3 },
  { label: 'Office Supplies',        annual: 28000,   pct: 0.2 },
  { label: 'Computer & Internet',    annual: 36000,   pct: 0.3 },
  { label: 'Telephone',              annual: 22000,   pct: 0.2 },
  { label: 'Automobile',             annual: 48000,   pct: 0.4 },
  { label: 'Repairs Computer',       annual: 35000,   pct: 0.3 },
  { label: 'Repairs Equipment',      annual: 245000,  pct: 1.8 },
  { label: 'Insurance Health',       annual: 89000,   pct: 0.7 },
  { label: 'Insurance Truck',        annual: 47000,   pct: 0.4 },
  { label: 'Licenses',               annual: 15000,   pct: 0.1 },
  { label: 'Contract Labor',         annual: 126000,  pct: 0.9 },
  { label: 'Outside Service',        annual: 78000,   pct: 0.6 },
  { label: 'Interest Expense',       annual: 197000,  pct: 1.5 },
  { label: 'Other/Misc',             annual: 71000,   pct: 0.5 },
];

const OPEX_TOTAL = OPEX_DATA.reduce((s, r) => s + r.annual, 0); // 3,687,000
const OPEX_PCT_TOTAL = OPEX_DATA.reduce((s, r) => s + r.pct, 0); // 27.8

const TOP5 = [
  { label: 'Rent Expense',      annual: 1052000 },
  { label: 'Payroll Admin',     annual: 845000  },
  { label: 'Rent Mgmt Fee',     annual: 262000  },
  { label: 'Repairs Equipment', annual: 245000  },
  { label: 'Interest Expense',  annual: 197000  },
];

const pctBadgeColor = (pct) => {
  if (pct >= 2) return design.colors.coral;
  if (pct >= 1) return design.colors.midTeal;
  return design.colors.slate;
};

const TH = ({ children, align = 'left' }) => (
  <th
    style={{
      padding: '13px 18px',
      textAlign: align,
      fontFamily: design.font.family,
      fontWeight: design.font.weights.semibold,
      fontSize: '11px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: design.colors.mutedText,
      whiteSpace: 'nowrap',
      borderBottom: `2px solid ${design.colors.cardBorder}`,
    }}
  >
    {children}
  </th>
);

const TD = ({ children, align = 'left', bold, style: extra }) => (
  <td
    style={{
      padding: '11px 18px',
      textAlign: align,
      fontFamily: design.font.family,
      fontSize: '13.5px',
      fontWeight: bold ? design.font.weights.semibold : design.font.weights.regular,
      color: design.colors.darkText,
      ...extra,
    }}
  >
    {children}
  </td>
);

// ─── Top-5 Bar Chart ────────────────────────────────────────────────────────

const BAR_COLORS = [
  design.colors.coral,
  design.colors.midTeal,
  design.colors.mint,
  design.colors.tan,
  design.colors.slate,
];

const TopFiveChart = () => {
  const [ref, inView] = useInView({ threshold: 0.25 });
  const max = TOP5[0].annual;

  return (
    <Card style={{ alignSelf: 'flex-start' }}>
      <p
        style={{
          margin: '0 0 22px',
          fontFamily: design.font.family,
          fontWeight: design.font.weights.semibold,
          fontSize: '15px',
          color: design.colors.darkText,
          letterSpacing: '-0.01em',
        }}
      >
        Top 5 by Annual Cost
      </p>

      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {TOP5.map((item, i) => {
          const color = BAR_COLORS[i];
          const widthPct = (item.annual / max) * 100;
          return (
            <div key={item.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '7px',
                }}
              >
                <span
                  style={{
                    fontFamily: design.font.family,
                    fontSize: '13px',
                    fontWeight: design.font.weights.medium,
                    color: design.colors.darkText,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: design.font.family,
                    fontSize: '13px',
                    fontWeight: design.font.weights.bold,
                    color,
                  }}
                >
                  {formatCurrency(item.annual)}
                </span>
              </div>

              {/* Track */}
              <div
                style={{
                  height: '10px',
                  backgroundColor: `${color}20`,
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                {/* Fill */}
                <div
                  style={{
                    height: '100%',
                    width: inView ? `${widthPct}%` : '0%',
                    backgroundColor: color,
                    borderRadius: '5px',
                    transition: `width ${0.75 + i * 0.12}s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total callout */}
      <div
        style={{
          marginTop: '26px',
          paddingTop: '18px',
          borderTop: `1px solid ${design.colors.cardBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: design.font.family,
            fontSize: '11px',
            fontWeight: design.font.weights.semibold,
            color: design.colors.mutedText,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Total OpEx (23 lines)
        </span>
        <AnimatedNumber
          value={OPEX_TOTAL}
          duration={1200}
          style={{
            fontFamily: design.font.family,
            fontSize: '20px',
            fontWeight: design.font.weights.bold,
            color: design.colors.darkText,
          }}
        />
      </div>
    </Card>
  );
};

// ─── Expense Detail Section ─────────────────────────────────────────────────

const ExpenseDetailSection = () => (
  <section style={{ marginBottom: '56px' }}>
    <SectionHeader
      eyebrow="Operating Expenses"
      title="Expense Detail"
      description="Full breakdown of 23 operating expense line items for FY 2025. Badge color reflects share of revenue: coral ≥ 2%, teal ≥ 1%, slate < 1%."
    />

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '24px',
        alignItems: 'flex-start',
      }}
    >
      {/* ── Left: full expense table ── */}
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <TH align="left">Expense</TH>
              <TH align="right">Annual</TH>
              <TH align="right">Monthly Avg</TH>
              <TH align="right">% of Revenue</TH>
            </tr>
          </thead>
          <tbody>
            {OPEX_DATA.map((row, i) => (
              <tr
                key={row.label}
                style={{
                  backgroundColor:
                    i % 2 === 1 ? 'rgba(13,79,79,0.018)' : 'transparent',
                  borderBottom: `1px solid ${design.colors.cardBorder}`,
                }}
              >
                <TD align="left">{row.label}</TD>
                <TD align="right">{formatCurrency(row.annual)}</TD>
                <TD align="right">{formatCurrency(row.annual / 12)}</TD>
                <TD align="right" style={{ paddingRight: '20px' }}>
                  <Badge color={pctBadgeColor(row.pct)}>
                    {row.pct.toFixed(1)}%
                  </Badge>
                </TD>
              </tr>
            ))}

            {/* Total row */}
            <tr
              style={{
                backgroundColor: 'rgba(13,79,79,0.04)',
                borderTop: `2px solid ${design.colors.cardBorder}`,
              }}
            >
              <TD align="left" bold>Total Operating Expenses</TD>
              <TD align="right" bold>{formatCurrency(OPEX_TOTAL)}</TD>
              <TD align="right" bold>{formatCurrency(OPEX_TOTAL / 12)}</TD>
              <TD align="right" bold style={{ paddingRight: '20px' }}>
                <Badge color={design.colors.coral}>
                  {OPEX_PCT_TOTAL.toFixed(1)}%
                </Badge>
              </TD>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* ── Right: top-5 bar chart ── */}
      <TopFiveChart />
    </div>
  </section>
);

// ─── Main Dashboard ─────────────────────────────────────────────────────────

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
          <header style={{ marginBottom: '56px' }}>
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

          <ExpenseDetailSection />
        </div>
      </main>
    </>
  );
};

export default FinancialDashboard;
