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

// ── Utilities Data ───────────────────────────────────────────────────────────
const UTILITY_KPI = [
  { emoji: '🔥', label: 'Gas',         value: 1207000, pct: '9.1%', color: design.colors.coral   },
  { emoji: '⚡', label: 'Electricity', value:  837000, pct: '6.3%', color: design.colors.teal    },
  { emoji: '💧', label: 'Water',       value:  345000, pct: '2.6%', color: design.colors.midTeal },
  { emoji: '🌊', label: 'Wastewater',  value:  171000, pct: '1.3%', color: design.colors.tan     },
];

const UTILITY_MONTHLY = [
  { month: 'Jan', gas: 118, elec:  78, water: 32, waste: 16 },
  { month: 'Feb', gas: 112, elec:  74, water: 30, waste: 15 },
  { month: 'Mar', gas:  98, elec:  68, water: 27, waste: 13 },
  { month: 'Apr', gas:  92, elec:  65, water: 26, waste: 13 },
  { month: 'May', gas: 105, elec:  72, water: 31, waste: 15 },
  { month: 'Jun', gas:  98, elec:  70, water: 30, waste: 14 },
  { month: 'Jul', gas:  88, elec:  66, water: 28, waste: 13 },
  { month: 'Aug', gas: 102, elec:  71, water: 30, waste: 15 },
  { month: 'Sep', gas: 108, elec:  74, water: 31, waste: 15 },
  { month: 'Oct', gas: 100, elec:  70, water: 29, waste: 14 },
  { month: 'Nov', gas:  96, elec:  67, water: 28, waste: 14 },
  { month: 'Dec', gas:  90, elec:  62, water: 23, waste: 14 },
];

const CHART_COLORS = {
  gas:   design.colors.coral,
  elec:  design.colors.teal,
  water: design.colors.midTeal,
  waste: design.colors.tan,
};

// ── Utility KPI Card ──────────────────────────────────────────────────────────
const UtilityKpiCard = ({ emoji, label, value, pct, color }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{
      width: 48, height: 48, borderRadius: '14px',
      background: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22,
    }}>
      {emoji}
    </div>
    <div>
      <p style={{
        margin: '0 0 6px',
        fontFamily: design.font.family,
        fontSize: 12,
        fontWeight: design.font.weights.semibold,
        color: design.colors.mutedText,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {label}
      </p>
      <AnimatedNumber
        value={value}
        style={{
          display: 'block',
          fontFamily: design.font.family,
          fontSize: 28,
          fontWeight: design.font.weights.bold,
          color: design.colors.darkText,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      />
      <p style={{
        margin: '8px 0 0',
        fontFamily: design.font.family,
        fontSize: 13,
        fontWeight: design.font.weights.medium,
        color,
      }}>
        {pct} of total costs
      </p>
    </div>
  </Card>
);

// ── Utility Stacked Bar Chart ─────────────────────────────────────────────────
const CHART_LEGEND = [
  { key: 'gas',   label: 'Gas',         color: CHART_COLORS.gas   },
  { key: 'elec',  label: 'Electricity', color: CHART_COLORS.elec  },
  { key: 'water', label: 'Water',       color: CHART_COLORS.water },
  { key: 'waste', label: 'Wastewater',  color: CHART_COLORS.waste },
];

const UtilityStackedBarChart = () => {
  const [ref, inView] = useInView({ threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const DURATION = 1000;

  useEffect(() => {
    if (!inView) return;
    startRef.current = null;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / DURATION, 1);
      setProgress(easeOutCubic(t));
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [inView]);

  const W = 720, H = 300;
  const padL = 52, padR = 16, padT = 16, padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const Y_MAX = 260;
  const toH = (v) => (v / Y_MAX) * plotH;
  const toY = (v) => plotH - toH(v);
  const barSlot = plotW / 12;
  const barW = barSlot * 0.58;
  const yTicks = [0, 50, 100, 150, 200, 250];

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
        {CHART_LEGEND.map(({ key, label, color }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
            <span style={{
              fontFamily: design.font.family,
              fontSize: 12,
              fontWeight: design.font.weights.medium,
              color: design.colors.mutedText,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div ref={ref} style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', minWidth: 480, height: 'auto', display: 'block' }}
        >
          {yTicks.map((tick) => {
            const y = padT + toY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padL} y1={y} x2={padL + plotW} y2={y}
                  stroke={tick === 0 ? 'rgba(13,79,79,0.15)' : 'rgba(13,79,79,0.06)'}
                  strokeWidth={1}
                />
                {tick > 0 && (
                  <text
                    x={padL - 8} y={y + 4}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily={design.font.family}
                    fill={design.colors.mutedText}
                  >
                    ${tick}K
                  </text>
                )}
              </g>
            );
          })}

          {UTILITY_MONTHLY.map((d, i) => {
            const cx = padL + i * barSlot + barSlot / 2;
            const x = cx - barW / 2;
            const gH = toH(d.gas)   * progress;
            const eH = toH(d.elec)  * progress;
            const wH = toH(d.water) * progress;
            const aH = toH(d.waste) * progress;
            const totalH = gH + eH + wH + aH;
            const clipId = `uc${i}`;

            return (
              <g key={d.month}>
                <defs>
                  <clipPath id={clipId}>
                    <rect x={x} y={padT + plotH - totalH} width={barW} height={totalH} rx={3} />
                  </clipPath>
                </defs>
                <rect x={x} y={padT + plotH - gH}
                  width={barW} height={gH}
                  fill={CHART_COLORS.gas} clipPath={`url(#${clipId})`} />
                <rect x={x} y={padT + plotH - gH - eH}
                  width={barW} height={eH}
                  fill={CHART_COLORS.elec} clipPath={`url(#${clipId})`} />
                <rect x={x} y={padT + plotH - gH - eH - wH}
                  width={barW} height={wH}
                  fill={CHART_COLORS.water} clipPath={`url(#${clipId})`} />
                <rect x={x} y={padT + plotH - gH - eH - wH - aH}
                  width={barW} height={aH}
                  fill={CHART_COLORS.waste} clipPath={`url(#${clipId})`} />
                <text
                  x={cx} y={padT + plotH + 20}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily={design.font.family}
                  fill={design.colors.mutedText}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ── Utility Table ─────────────────────────────────────────────────────────────
const fmtK = (v) => `$${v}K`;

const UtilityTable = () => {
  const totals = UTILITY_MONTHLY.reduce(
    (acc, d) => ({
      gas:   acc.gas   + d.gas,
      elec:  acc.elec  + d.elec,
      water: acc.water + d.water,
      waste: acc.waste + d.waste,
    }),
    { gas: 0, elec: 0, water: 0, waste: 0 }
  );

  const cellBase = {
    padding: '10px 16px',
    fontFamily: design.font.family,
    fontSize: 13,
    borderBottom: `1px solid ${design.colors.cardBorder}`,
  };

  const numCell = (bold, color) => ({
    ...cellBase,
    textAlign: 'right',
    fontWeight: bold ? design.font.weights.semibold : design.font.weights.regular,
    color: color || design.colors.darkText,
  });

  const thBase = {
    padding: '10px 16px',
    fontFamily: design.font.family,
    fontSize: 11,
    fontWeight: design.font.weights.semibold,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: `2px solid ${design.colors.cardBorder}`,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(13,79,79,0.02)' }}>
            <th style={{ ...thBase, textAlign: 'left', color: design.colors.mutedText }}>Month</th>
            <th style={{ ...thBase, textAlign: 'right', color: CHART_COLORS.gas   }}>Gas</th>
            <th style={{ ...thBase, textAlign: 'right', color: CHART_COLORS.elec  }}>Electricity</th>
            <th style={{ ...thBase, textAlign: 'right', color: CHART_COLORS.water }}>Water</th>
            <th style={{ ...thBase, textAlign: 'right', color: CHART_COLORS.waste }}>Wastewater</th>
            <th style={{ ...thBase, textAlign: 'right', color: design.colors.darkText }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {UTILITY_MONTHLY.map((d, i) => {
            const total = d.gas + d.elec + d.water + d.waste;
            return (
              <tr
                key={d.month}
                style={{ backgroundColor: i % 2 === 1 ? 'rgba(13,79,79,0.015)' : 'transparent' }}
              >
                <td style={{ ...cellBase, textAlign: 'left', fontWeight: design.font.weights.medium, color: design.colors.darkText }}>
                  {d.month}
                </td>
                <td style={numCell(false, CHART_COLORS.gas  )}>{fmtK(d.gas  )}</td>
                <td style={numCell(false, CHART_COLORS.elec )}>{fmtK(d.elec )}</td>
                <td style={numCell(false, CHART_COLORS.water)}>{fmtK(d.water)}</td>
                <td style={numCell(false, CHART_COLORS.waste)}>{fmtK(d.waste)}</td>
                <td style={numCell(true)}>{fmtK(total)}</td>
              </tr>
            );
          })}
          <tr style={{ backgroundColor: `${design.colors.teal}0A` }}>
            <td style={{ ...cellBase, textAlign: 'left', fontWeight: design.font.weights.bold, color: design.colors.darkText, borderBottom: 'none' }}>
              Total
            </td>
            <td style={{ ...numCell(true, CHART_COLORS.gas  ), borderBottom: 'none' }}>{fmtK(totals.gas  )}</td>
            <td style={{ ...numCell(true, CHART_COLORS.elec ), borderBottom: 'none' }}>{fmtK(totals.elec )}</td>
            <td style={{ ...numCell(true, CHART_COLORS.water), borderBottom: 'none' }}>{fmtK(totals.water)}</td>
            <td style={{ ...numCell(true, CHART_COLORS.waste), borderBottom: 'none' }}>{fmtK(totals.waste)}</td>
            <td style={{ ...numCell(true), borderBottom: 'none' }}>{fmtK(totals.gas + totals.elec + totals.water + totals.waste)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ── Utilities Section ─────────────────────────────────────────────────────────
const UtilitiesSection = () => (
  <section style={{ marginTop: '56px' }}>
    <SectionHeader
      eyebrow="Utilities"
      title="Utility Costs"
      description="Annual breakdown of gas, electricity, water, and wastewater expenditures across all 12 months."
    />

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '20px',
      marginBottom: '28px',
    }}>
      {UTILITY_KPI.map((kpi) => (
        <UtilityKpiCard key={kpi.label} {...kpi} />
      ))}
    </div>

    <Card style={{ marginBottom: '28px' }} padding="28px">
      <h3 style={{
        margin: '0 0 20px',
        fontFamily: design.font.family,
        fontWeight: design.font.weights.semibold,
        fontSize: 15,
        color: design.colors.darkText,
        letterSpacing: '-0.01em',
      }}>
        Monthly Utilities Trend
      </h3>
      <UtilityStackedBarChart />
    </Card>

    <Card padding="0">
      <div style={{ padding: '20px 28px 12px' }}>
        <h3 style={{
          margin: 0,
          fontFamily: design.font.family,
          fontWeight: design.font.weights.semibold,
          fontSize: 15,
          color: design.colors.darkText,
          letterSpacing: '-0.01em',
        }}>
          Monthly Utility Breakdown
        </h3>
      </div>
      <UtilityTable />
      <div style={{ height: 8 }} />
    </Card>
  </section>
);

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
          <UtilitiesSection />
        </div>
      </main>
    </>
  );
};

export default FinancialDashboard;
