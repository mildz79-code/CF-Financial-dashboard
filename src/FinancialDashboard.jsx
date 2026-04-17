import React, { useEffect, useRef, useState } from 'react';

/* ==========================================================================
   1. SHARED FOUNDATION — Design Tokens & Global Helpers
   ========================================================================== */

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

// From PR #6 (payroll branch)
const formatK = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.round(abs / 1000).toLocaleString()}K`;
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

// PR #5 version with delay prop (most feature-complete)
const AnimatedNumber = ({
  value,
  duration = 1400,
  format = formatCurrency,
  startOnInView = true,
  delay = 0,
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
    let timeoutId;

    const run = () => {
      startRef.current = 0;
      const step = (timestamp) => {
        if (!startRef.current) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);
        setDisplay(0 + (target - 0) * eased);
        if (t < 1) frameRef.current = requestAnimationFrame(step);
      };
      frameRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeoutId = setTimeout(run, delay);
    } else {
      run();
    }

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, inView, startOnInView, delay]);

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

/* ==========================================================================
   2. OVERVIEW SECTION — from PR #5 (claude/add-kpi-cards-overview-BsBQI)
   ========================================================================== */

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const kpiData = [
  {
    label: 'Revenue',
    value: 13280000,
    badge: '+7.3% YoY',
    badgeColor: '#16a34a',
    sub: 'Total FY 2025',
    accent: design.colors.midTeal,
  },
  {
    label: 'Gross Profit',
    value: 3610000,
    badge: '27.2% Margin',
    badgeColor: design.colors.midTeal,
    sub: 'After COGS',
    accent: design.colors.mint,
  },
  {
    label: 'Net Income',
    value: 523000,
    badge: '3.9% Margin',
    badgeColor: design.colors.coral,
    sub: 'After All Expenses',
    accent: design.colors.coral,
  },
  {
    label: 'COGS',
    value: 9670000,
    badge: '72.8% of Revenue',
    badgeColor: design.colors.tan,
    sub: 'Cost of Goods Sold',
    accent: design.colors.tan,
  },
];

const KPICards = () => {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
      {kpiData.map((kpi, i) => (
        <Card
          key={kpi.label}
          padding="24px"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderTop: `3px solid ${kpi.accent}`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.semibold,
                fontSize: '13px',
                color: design.colors.mutedText,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {kpi.label}
            </span>
            <Badge color={kpi.badgeColor} style={{ fontSize: '11px' }}>
              {kpi.badge}
            </Badge>
          </div>
          <div>
            <div
              style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.extrabold,
                fontSize: '32px',
                letterSpacing: '-0.02em',
                color: design.colors.darkText,
                lineHeight: 1,
              }}
            >
              {inView ? (
                <AnimatedNumber value={kpi.value} delay={i * 100} startOnInView={false} />
              ) : (
                '$0'
              )}
            </div>
            <div
              style={{
                marginTop: '6px',
                fontFamily: design.font.family,
                fontWeight: design.font.weights.regular,
                fontSize: '13px',
                color: design.colors.mutedText,
              }}
            >
              {kpi.sub}
            </div>
          </div>
          <div
            style={{
              height: '3px',
              borderRadius: '999px',
              background: `linear-gradient(to right, ${kpi.accent}, ${kpi.accent}33)`,
              width: inView ? '100%' : '0%',
              transition: `width 0.8s ease ${i * 100 + 300}ms`,
            }}
          />
        </Card>
      ))}
    </div>
  );
};

// ─── Monthly Revenue Bar Chart ────────────────────────────────────────────────

const monthlyRevenue = [
  { month: 'Jan', value: 1080000 },
  { month: 'Feb', value: 1050000 },
  { month: 'Mar', value: 1120000 },
  { month: 'Apr', value: 1090000 },
  { month: 'May', value: 1330000 },
  { month: 'Jun', value: 1150000 },
  { month: 'Jul', value: 1070000 },
  { month: 'Aug', value: 1100000 },
  { month: 'Sep', value: 1280000 },
  { month: 'Oct', value: 1010000 },
  { month: 'Nov', value: 960000 },
  { month: 'Dec', value: 944000 },
];

const highlightMonths = new Set(['May', 'Sep']);
const chartMax = Math.max(...monthlyRevenue.map((d) => d.value)) * 1.08;

const MonthlyRevenueChart = () => {
  const [ref, inView] = useInView({ threshold: 0.15 });

  const avg = monthlyRevenue.reduce((s, d) => s + d.value, 0) / monthlyRevenue.length;
  const peak = Math.max(...monthlyRevenue.map((d) => d.value));
  const low = Math.min(...monthlyRevenue.map((d) => d.value));
  const spread = peak - low;

  return (
    <Card padding="28px" style={{ marginBottom: '32px' }}>
      <SectionHeader
        eyebrow="Revenue Trend"
        title="Monthly Revenue"
        description="FY 2025 monthly revenue — May and September were peak months."
        style={{ marginBottom: '28px' }}
      />
      <div
        ref={ref}
        style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '180px', padding: '0 4px' }}
      >
        {monthlyRevenue.map((d, i) => {
          const isHighlight = highlightMonths.has(d.month);
          const pct = (d.value / chartMax) * 100;
          return (
            <div
              key={d.month}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}
            >
              <div
                style={{
                  fontFamily: design.font.family,
                  fontSize: '11px',
                  fontWeight: design.font.weights.semibold,
                  color: isHighlight ? design.colors.coral : design.colors.mutedText,
                  opacity: inView ? 1 : 0,
                  transition: `opacity 0.3s ease ${i * 50 + 200}ms`,
                }}
              >
                {formatCurrency(d.value).replace('$', '')}
              </div>
              <div
                style={{
                  width: '100%',
                  height: inView ? `${pct}%` : '0%',
                  borderRadius: '6px 6px 2px 2px',
                  background: isHighlight
                    ? `linear-gradient(to top, ${design.colors.coral}, #F4A07A)`
                    : `linear-gradient(to top, ${design.colors.teal}, ${design.colors.midTeal})`,
                  transition: `height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 50}ms`,
                  position: 'relative',
                }}
              />
              <div
                style={{
                  fontFamily: design.font.family,
                  fontSize: '11px',
                  fontWeight: isHighlight ? design.font.weights.semibold : design.font.weights.regular,
                  color: isHighlight ? design.colors.coral : design.colors.mutedText,
                }}
              >
                {d.month}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginTop: '24px',
          borderTop: `1px solid ${design.colors.cardBorder}`,
          paddingTop: '20px',
        }}
      >
        {[
          { label: 'Monthly Avg', value: '$1.11M' },
          { label: 'Peak Month', value: '$1.33M' },
          { label: 'Low Month', value: '$944K' },
          { label: 'Peak–Low Spread', value: '$383K' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${design.colors.cardBorder}` : 'none',
              padding: '0 16px',
            }}
          >
            <div
              style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.extrabold,
                fontSize: '20px',
                color: design.colors.darkText,
                letterSpacing: '-0.01em',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: design.font.family,
                fontSize: '12px',
                color: design.colors.mutedText,
                marginTop: '3px',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── Expense Allocation Donut ─────────────────────────────────────────────────

const expenseSlices = [
  { label: 'Payroll', pct: 30.5, color: '#0D4F4F' },
  { label: 'Materials', pct: 20.5, color: '#1A8A8A' },
  { label: 'Utilities', pct: 19.3, color: '#2EC4B6' },
  { label: 'Rent', pct: 10.6, color: '#E07B54' },
  { label: 'Prof Fees', pct: 1.9, color: '#D4A574' },
  { label: 'Other', pct: 17.2, color: '#94A7B0' },
];

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx, cy, innerR, outerR, startAngle, endAngle) => {
  const s1 = polarToCartesian(cx, cy, outerR, startAngle);
  const e1 = polarToCartesian(cx, cy, outerR, endAngle);
  const s2 = polarToCartesian(cx, cy, innerR, endAngle);
  const e2 = polarToCartesian(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
};

const DonutChart = () => {
  const [hovered, setHovered] = useState(null);
  const [ref, inView] = useInView({ threshold: 0.15 });
  const cx = 110, cy = 110, innerR = 60, outerR = 98, expandR = 105;

  let cumAngle = 0;
  const slicesWithAngles = expenseSlices.map((s) => {
    const start = cumAngle;
    const sweep = (s.pct / 100) * 360;
    cumAngle += sweep;
    return { ...s, startAngle: start, endAngle: cumAngle };
  });

  return (
    <Card padding="28px" style={{ flex: 1 }}>
      <SectionHeader
        eyebrow="Cost Breakdown"
        title="Expense Allocation"
        description="FY 2025 — $12.76M total expenses"
        style={{ marginBottom: '20px' }}
      />
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{ flexShrink: 0, opacity: inView ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          {slicesWithAngles.map((s, i) => {
            const isHovered = hovered === i;
            const r = isHovered ? expandR : outerR;
            const dimmed = hovered !== null && !isHovered;
            return (
              <path
                key={s.label}
                d={describeArc(cx, cy, innerR, r, s.startAngle, s.endAngle)}
                fill={s.color}
                opacity={dimmed ? 0.3 : 1}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s ease, d 0.2s ease' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          {/* Center text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.extrabold,
              fontSize: '15px',
              fill: design.colors.darkText,
            }}
          >
            $12.76M
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.regular,
              fontSize: '10px',
              fill: design.colors.mutedText,
            }}
          >
            Total Expenses
          </text>
          {hovered !== null && (
            <text
              x={cx}
              y={cy + 28}
              textAnchor="middle"
              style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.semibold,
                fontSize: '11px',
                fill: slicesWithAngles[hovered].color,
              }}
            >
              {slicesWithAngles[hovered].pct}%
            </text>
          )}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '140px' }}>
          {slicesWithAngles.map((s, i) => (
            <div
              key={s.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                opacity: hovered !== null && hovered !== i ? 0.4 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontFamily: design.font.family, fontSize: '13px', color: design.colors.darkText }}>
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: design.font.family,
                  fontWeight: design.font.weights.semibold,
                  fontSize: '13px',
                  color: design.colors.mutedText,
                }}
              >
                {s.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ─── COGS + OpEx Tables (Overview) ────────────────────────────────────────────

const cogsItems = [
  { label: 'Raw Materials', amount: 4850000, pct: 50.2 },
  { label: 'Direct Labor', amount: 2920000, pct: 30.2 },
  { label: 'Dye & Chemicals', amount: 1140000, pct: 11.8 },
  { label: 'Freight & Logistics', amount: 460000, pct: 4.8 },
  { label: 'Other COGS', amount: 300000, pct: 3.1 },
];

const opexItems = [
  { label: 'Payroll (Admin)', amount: 1420000, pct: 44.7 },
  { label: 'Rent & Occupancy', amount: 485000, pct: 15.3 },
  { label: 'Utilities', amount: 880000, pct: 27.7 },
  { label: 'Professional Fees', amount: 88000, pct: 2.8 },
  { label: 'Other OpEx', amount: 303000, pct: 9.5 },
];

const SummaryTable = ({ title, items, total, accentColor }) => (
  <Card padding="24px" style={{ flex: 1 }}>
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.bold,
          fontSize: '17px',
          color: design.colors.darkText,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, fontFamily: design.font.family, fontSize: '13px', color: design.colors.darkText }}>
            {item.label}
          </div>
          <div
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.semibold,
              fontSize: '13px',
              color: design.colors.darkText,
              minWidth: '72px',
              textAlign: 'right',
            }}
          >
            {formatCurrency(item.amount)}
          </div>
          <Badge color={accentColor} style={{ minWidth: '52px', justifyContent: 'center', fontSize: '11px' }}>
            {item.pct}%
          </Badge>
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: `1px solid ${design.colors.cardBorder}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{ fontFamily: design.font.family, fontWeight: design.font.weights.bold, fontSize: '14px', color: design.colors.darkText }}>
        Total
      </span>
      <span
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.extrabold,
          fontSize: '18px',
          color: accentColor,
        }}
      >
        {formatCurrency(total)}
      </span>
    </div>
  </Card>
);

// ─── YoY Growth Bars ──────────────────────────────────────────────────────────

const yoyMetrics = [
  { label: 'Revenue', val2024: 100, val2025: 107.3, change: '+7.3%' },
  { label: 'Net Income', val2024: 100, val2025: 184.2, change: '+84.2%' },
  { label: 'Gross Margin', val2024: 100, val2025: 104.2, change: '+4.2%' },
  { label: 'Net Margin', val2024: 100, val2025: 169.6, change: '+69.6%' },
];

const YoYGrowth = () => {
  const [ref, inView] = useInView({ threshold: 0.15 });
  const maxVal = 184.2;

  return (
    <Card padding="28px" style={{ flex: 1 }}>
      <SectionHeader
        eyebrow="Year-over-Year"
        title="YoY Growth"
        description="2024 baseline vs. 2025 actuals (indexed to 100)"
        style={{ marginBottom: '24px' }}
      />
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {yoyMetrics.map((m, i) => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: design.font.family, fontSize: '13px', fontWeight: design.font.weights.semibold, color: design.colors.darkText }}>
                {m.label}
              </span>
              <Badge color="#16a34a">{m.change}</Badge>
            </div>
            {/* 2024 bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: design.font.family, fontSize: '11px', color: design.colors.mutedText, width: '34px' }}>2024</span>
              <div style={{ flex: 1, height: '8px', borderRadius: '999px', backgroundColor: `${design.colors.cardBorder}` }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    backgroundColor: '#CBD5DC',
                    width: inView ? `${(m.val2024 / maxVal) * 100}%` : '0%',
                    transition: `width 0.7s ease ${i * 80}ms`,
                  }}
                />
              </div>
            </div>
            {/* 2025 bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: design.font.family, fontSize: '11px', color: design.colors.mutedText, width: '34px' }}>2025</span>
              <div style={{ flex: 1, height: '8px', borderRadius: '999px', backgroundColor: `${design.colors.cardBorder}` }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    background: `linear-gradient(to right, ${design.colors.teal}, ${design.colors.mint})`,
                    width: inView ? `${(m.val2025 / maxVal) * 100}%` : '0%',
                    transition: `width 0.7s ease ${i * 80 + 100}ms`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── Profitability Banner ─────────────────────────────────────────────────────

const ProfitabilityBanner = () => (
  <div
    style={{
      borderRadius: design.radius.card,
      background: `linear-gradient(135deg, ${design.colors.teal} 0%, ${design.colors.midTeal} 100%)`,
      padding: '28px 36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '24px',
      marginTop: '32px',
    }}
  >
    <div>
      <div
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.semibold,
          fontSize: '12px',
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '6px',
        }}
      >
        FY 2025 Profitability Summary
      </div>
      <div
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.extrabold,
          fontSize: '22px',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
        }}
      >
        Color Fashion Dye & Finishing
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
      {[
        { label: 'Gross Margin', value: '27.2%' },
        { label: 'Net Margin', value: '3.9%' },
        { label: 'Monthly Avg Revenue', value: '$1.11M' },
      ].map((stat, i) => (
        <div
          key={stat.label}
          style={{
            padding: '0 28px',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.extrabold,
              fontSize: '28px',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: design.font.family,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.65)',
              marginTop: '3px',
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Overview Section ─────────────────────────────────────────────────────────

const OverviewSection = () => (
  <section
    id="overview"
    data-section="overview"
    style={{ scrollMarginTop: '80px', paddingTop: '48px', marginBottom: '64px' }}
  >
    <SectionHeader
      eyebrow="Overview"
      title="Financial Highlights"
      description="FY 2025 full-year performance at a glance — revenue, profitability, cost structure, and year-over-year growth."
    />

    <KPICards />
    <MonthlyRevenueChart />

    {/* Donut + YoY side by side */}
    <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
      <DonutChart />
      <YoYGrowth />
    </div>

    {/* COGS + OpEx tables */}
    <div style={{ display: 'flex', gap: '20px', marginBottom: '0', flexWrap: 'wrap' }}>
      <SummaryTable
        title="COGS Breakdown"
        items={cogsItems}
        total={9670000}
        accentColor={design.colors.teal}
      />
      <SummaryTable
        title="Operating Expenses"
        items={opexItems}
        total={3176000}
        accentColor={design.colors.coral}
      />
    </div>

    <ProfitabilityBanner />
  </section>
);

/* ==========================================================================
   3. COGS SECTION — from PR #8 (claude/add-expense-details-kdZm4)
      Uses PR #8's version which has cogsPctColor
   ========================================================================== */

const cogsSummary = [
  { category: 'Labor',     amount: 4120000, pct: 42.6, color: design.colors.teal },
  { category: 'Materials', amount: 2510000, pct: 25.9, color: design.colors.mint },
  { category: 'Utilities', amount: 2560000, pct: 26.5, color: design.colors.coral },
  { category: 'Other',     amount: 480000,  pct: 5.0,  color: design.colors.slate },
];

const cogsLineItems = [
  { category: 'labor',     item: 'Direct Labor — Samuel Hale',         description: 'Primary production contractor', annual: 3410000, pct: 25.7 },
  { category: 'labor',     item: 'Direct Labor — Workforce',           description: 'Hourly production staff',       annual: 532000,  pct: 4.0  },
  { category: 'labor',     item: 'Payroll — Other COGS',               description: 'Overtime bonuses',             annual: 178000,  pct: 1.3  },
  { category: 'materials', item: 'Chemical & Dyestuffs',               description: 'Dyes & chemicals',             annual: 2353000, pct: 17.7 },
  { category: 'materials', item: 'Finishing Supplies — Paper Tube',    description: 'Packaging tubes',              annual: 98000,   pct: 0.7  },
  { category: 'materials', item: 'Lab Supplies — Testing',             description: 'Quality testing',              annual: 67000,   pct: 0.5  },
  { category: 'materials', item: 'Plant Supplies & Parts',             description: 'Machine parts',                annual: 89000,   pct: 0.7  },
  { category: 'other',     item: 'Freight & Shipping',                 description: 'Logistics',                    annual: 168000,  pct: 1.3  },
  { category: 'other',     item: 'Truck Repair',                       description: 'Fleet maintenance',            annual: 45000,   pct: 0.3  },
  { category: 'other',     item: 'Insurance — Liability',              description: 'Plant coverage',               annual: 50000,   pct: 0.4  },
  { category: 'utilities', item: 'Utilities — Gas',                    description: 'Boiler & heating',             annual: 1207000, pct: 9.1  },
  { category: 'utilities', item: 'Utilities — Electricity',            description: 'Machine power',                annual: 837000,  pct: 6.3  },
  { category: 'utilities', item: 'Utilities — Water',                  description: 'Process water',                annual: 345000,  pct: 2.6  },
  { category: 'utilities', item: 'Utilities — Wastewater',             description: 'Treatment',                    annual: 171000,  pct: 1.3  },
];

const rowTint = (category) => {
  if (category === 'labor') return 'rgba(13,79,79,0.05)';
  if (category === 'utilities') return 'rgba(224,123,84,0.06)';
  return 'transparent';
};

// COGS thresholds: items reach 25%+ so scale accordingly
const cogsPctColor = (pct) => {
  if (pct >= 5) return design.colors.teal;
  if (pct >= 1) return design.colors.midTeal;
  return design.colors.slate;
};

const COGSSection = () => (
  <section
    id="cogs"
    data-section="cogs"
    style={{ scrollMarginTop: '80px', paddingTop: '48px', marginBottom: '48px' }}
  >
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

    <Card padding="0" style={{ overflow: 'hidden' }}>
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
                <Badge color={cogsPctColor(pct)}>{pct}%</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </section>
);

/* ==========================================================================
   4. PAYROLL SECTION — from PR #6 (claude/add-payroll-section-SQ6YB)
   ========================================================================== */

const PAYROLL_ITEMS = [
  { name: 'Samuel Hale',   amount: 3_410_000, monthly: 284_000, description: 'Primary production contractor', category: 'COGS' },
  { name: 'Admin Payroll', amount:   845_000, monthly:  70_000, description: 'Office staff',                  category: 'OpEx' },
  { name: 'Workforce',     amount:   532_000, monthly:  44_000, description: 'Hourly production',              category: 'COGS' },
  { name: 'Payroll Other', amount:   178_000, monthly:  15_000, description: 'Overtime bonuses',              category: 'COGS' },
  { name: 'Payroll Taxes', amount:   156_000, monthly:  13_000, description: 'Employer taxes',                category: 'OpEx' },
  { name: 'Contract Labor',amount:   126_000, monthly:  11_000, description: 'Temp workers',                  category: 'OpEx' },
  { name: 'Benefits',      amount:    98_000, monthly:   8_000, description: 'Health & retirement',           category: 'OpEx' },
];

const PayrollBarChart = () => {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const maxAmount = PAYROLL_ITEMS[0].amount;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {PAYROLL_ITEMS.map((item, i) => {
        const pct = (item.amount / maxAmount) * 100;
        const isCOGS = item.category === 'COGS';
        const barGradient = isCOGS
          ? `linear-gradient(90deg, ${design.colors.teal}, ${design.colors.midTeal})`
          : `linear-gradient(90deg, ${design.colors.coral}, #e8956f)`;
        const trackBg = isCOGS
          ? `${design.colors.teal}14`
          : `${design.colors.coral}14`;

        return (
          <div
            key={item.name}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}
          >
            {/* Label column */}
            <div style={{ width: '176px', flexShrink: 0 }}>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.semibold,
                fontSize: '14px',
                color: design.colors.darkText,
                lineHeight: 1.3,
              }}>
                {item.name}
              </div>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.regular,
                fontSize: '12px',
                color: design.colors.mutedText,
                marginTop: '2px',
              }}>
                {item.description}
              </div>
            </div>

            {/* Bar track */}
            <div style={{
              flex: 1,
              minWidth: 0,
              height: '30px',
              backgroundColor: trackBg,
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: inView ? `${pct}%` : '0%',
                height: '100%',
                background: barGradient,
                borderRadius: '6px',
                transition: `width ${0.45 + i * 0.07}s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05}s`,
              }} />
            </div>

            {/* Amount column */}
            <div style={{ width: '118px', flexShrink: 0, textAlign: 'right' }}>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.bold,
                fontSize: '14px',
                color: design.colors.darkText,
              }}>
                {formatK(item.amount)}
              </div>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.regular,
                fontSize: '12px',
                color: design.colors.mutedText,
                marginTop: '2px',
              }}>
                {formatK(item.monthly)}/mo
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PayrollSection = () => (
  <section
    id="payroll"
    data-section="payroll"
    style={{ scrollMarginTop: '80px', paddingTop: '48px' }}
  >
    <SectionHeader
      eyebrow="Workforce Cost"
      title="Payroll Analysis"
      description="Full-year payroll breakdown across production (COGS) and administrative (OpEx) categories."
    />

    {/* Summary cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '24px',
    }}>
      <Card>
        <Badge color={design.colors.teal}>COGS</Badge>
        <div style={{ marginTop: '16px' }}>
          <AnimatedNumber
            value={4_120_000}
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.extrabold,
              fontSize: '36px',
              color: design.colors.teal,
              letterSpacing: '-0.02em',
            }}
          />
          <div style={{
            marginTop: '6px',
            fontFamily: design.font.family,
            fontSize: '15px',
            fontWeight: design.font.weights.semibold,
            color: design.colors.darkText,
          }}>
            Production Payroll
          </div>
          <div style={{
            marginTop: '3px',
            fontFamily: design.font.family,
            fontSize: '13px',
            color: design.colors.mutedText,
          }}>
            31.0% of revenue
          </div>
        </div>
      </Card>

      <Card>
        <Badge color={design.colors.coral}>OpEx</Badge>
        <div style={{ marginTop: '16px' }}>
          <AnimatedNumber
            value={1_230_000}
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.extrabold,
              fontSize: '36px',
              color: design.colors.coral,
              letterSpacing: '-0.02em',
            }}
          />
          <div style={{
            marginTop: '6px',
            fontFamily: design.font.family,
            fontSize: '15px',
            fontWeight: design.font.weights.semibold,
            color: design.colors.darkText,
          }}>
            Admin Payroll
          </div>
          <div style={{
            marginTop: '3px',
            fontFamily: design.font.family,
            fontSize: '13px',
            color: design.colors.mutedText,
          }}>
            9.2% of revenue
          </div>
        </div>
      </Card>
    </div>

    {/* Horizontal bar chart */}
    <Card style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          margin: 0,
          fontFamily: design.font.family,
          fontWeight: design.font.weights.bold,
          fontSize: '18px',
          color: design.colors.darkText,
        }}>
          Payroll by Category
        </h3>
        <p style={{
          margin: '4px 0 0',
          fontFamily: design.font.family,
          fontSize: '13px',
          color: design.colors.mutedText,
        }}>
          Annual totals with monthly averages · sorted by spend
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Production COGS', color: design.colors.teal },
          { label: 'Admin OpEx',      color: design.colors.coral },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color, flexShrink: 0 }} />
            <span style={{
              fontFamily: design.font.family,
              fontSize: '12px',
              fontWeight: design.font.weights.medium,
              color: design.colors.mutedText,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable wrapper ensures chart stays usable on narrow screens */}
      <div className="cf-table-wrap">
        <div style={{ minWidth: '520px' }}>
          <PayrollBarChart />
        </div>
      </div>
    </Card>

    {/* Teal gradient summary banner */}
    <div style={{
      borderRadius: design.radius.card,
      background: `linear-gradient(135deg, ${design.colors.teal} 0%, ${design.colors.midTeal} 60%, #247a7a 100%)`,
      padding: '32px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '24px',
    }}>
      {[
        { value: '$5.35M',  sub: null,              label: 'Total Payroll'    },
        { value: '40.3%',   sub: 'of revenue',      label: 'Headcount Cost'  },
        { value: '~18%',    sub: 'employer overhead',label: 'Burden Rate'     },
      ].map(({ value, sub, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: design.font.family,
            fontWeight: design.font.weights.extrabold,
            fontSize: '32px',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {value}
          </div>
          {sub && (
            <div style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.regular,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.55)',
              marginTop: '3px',
            }}>
              {sub}
            </div>
          )}
          <div style={{
            fontFamily: design.font.family,
            fontWeight: design.font.weights.medium,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ==========================================================================
   5. UTILITIES SECTION — from PR #7 (claude/add-utilities-section-keSOV)
   ========================================================================== */

const UTILITY_KPI = [
  { emoji: '\u{1F525}', label: 'Gas',         value: 1207000, pct: '9.1%', color: design.colors.coral   },
  { emoji: '\u26A1',    label: 'Electricity', value:  837000, pct: '6.3%', color: design.colors.teal    },
  { emoji: '\u{1F4A7}', label: 'Water',       value:  345000, pct: '2.6%', color: design.colors.midTeal },
  { emoji: '\u{1F30A}', label: 'Wastewater',  value:  171000, pct: '1.3%', color: design.colors.tan     },
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

const UtilitiesSection = () => (
  <section
    id="utilities"
    data-section="utilities"
    style={{ scrollMarginTop: '80px', paddingTop: '48px' }}
  >
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

/* ==========================================================================
   6. EXPENSE DETAIL SECTION — from PR #8 (claude/add-expense-details-kdZm4)
   ========================================================================== */

const OPEX_DATA = [
  { label: 'Payroll Admin',           annual: 845000,  pct: 6.4 },
  { label: 'Payroll Taxes',           annual: 156000,  pct: 1.2 },
  { label: 'Employee Benefits',       annual: 98000,   pct: 0.7 },
  { label: 'Rent Expense',            annual: 1052000, pct: 7.9 },
  { label: 'Rent Management Fee',     annual: 262000,  pct: 2.0 },
  { label: 'Professional Fees Legal', annual: 72000,   pct: 0.5 },
  { label: 'Professional Fees Other', annual: 40000,   pct: 0.3 },
  { label: 'Sales Commission',        annual: 65000,   pct: 0.5 },
  { label: 'Sales Promotion',         annual: 18000,   pct: 0.1 },
  { label: 'Office Expense',          annual: 42000,   pct: 0.3 },
  { label: 'Office Supplies',         annual: 28000,   pct: 0.2 },
  { label: 'Computer & Internet',     annual: 36000,   pct: 0.3 },
  { label: 'Telephone',               annual: 22000,   pct: 0.2 },
  { label: 'Automobile',              annual: 48000,   pct: 0.4 },
  { label: 'Repairs Computer',        annual: 35000,   pct: 0.3 },
  { label: 'Repairs Equipment',       annual: 245000,  pct: 1.8 },
  { label: 'Insurance Health',        annual: 89000,   pct: 0.7 },
  { label: 'Insurance Truck',         annual: 47000,   pct: 0.4 },
  { label: 'Licenses',                annual: 15000,   pct: 0.1 },
  { label: 'Contract Labor',          annual: 126000,  pct: 0.9 },
  { label: 'Outside Service',         annual: 78000,   pct: 0.6 },
  { label: 'Interest Expense',        annual: 197000,  pct: 1.5 },
  { label: 'Other/Misc',              annual: 71000,   pct: 0.5 },
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

// OpEx thresholds: coral >= 2%, midTeal >= 1%, slate < 1%
const opexPctColor = (pct) => {
  if (pct >= 2) return design.colors.coral;
  if (pct >= 1) return design.colors.midTeal;
  return design.colors.slate;
};

// PR #8's TH — default align='left'
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

              <div
                style={{
                  height: '10px',
                  backgroundColor: `${color}20`,
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
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

const ExpenseDetailSection = () => (
  <section
    id="expenses"
    data-section="expenses"
    style={{ scrollMarginTop: '80px', paddingTop: '48px', marginBottom: '56px' }}
  >
    <SectionHeader
      eyebrow="Operating Expenses"
      title="Expense Detail"
      description="Full breakdown of 23 operating expense line items for FY 2025. Badge color reflects share of revenue: coral >= 2%, teal >= 1%, slate < 1%."
    />

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '24px',
        alignItems: 'flex-start',
      }}
    >
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
                  backgroundColor: i % 2 === 1 ? 'rgba(13,79,79,0.018)' : 'transparent',
                  borderBottom: `1px solid ${design.colors.cardBorder}`,
                }}
              >
                <TD align="left">{row.label}</TD>
                <TD align="right">{formatCurrency(row.annual)}</TD>
                <TD align="right">{formatCurrency(row.annual / 12)}</TD>
                <TD align="right" style={{ paddingRight: '20px' }}>
                  <Badge color={opexPctColor(row.pct)}>
                    {row.pct.toFixed(1)}%
                  </Badge>
                </TD>
              </tr>
            ))}

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

      <TopFiveChart />
    </div>
  </section>
);

/* ==========================================================================
   7. MONTHLY REPORT — from main
      MonthlyTH renamed from main's TH to avoid conflict with PR #8's TH
   ========================================================================== */

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

// Renamed from main's TH to MonthlyTH (default align='right')
const MonthlyTH = ({ children, align = 'right' }) => (
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
  <section
    id="monthly-report"
    data-section="monthly-report"
    style={{ scrollMarginTop: '80px', paddingTop: '48px' }}
  >
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
              <MonthlyTH align="left">Month</MonthlyTH>
              <MonthlyTH>Revenue</MonthlyTH>
              <MonthlyTH>COGS</MonthlyTH>
              <MonthlyTH>Gross Profit</MonthlyTH>
              <MonthlyTH>GP%</MonthlyTH>
              <MonthlyTH>OpEx</MonthlyTH>
              <MonthlyTH>Net Income</MonthlyTH>
              <MonthlyTH>Net%</MonthlyTH>
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
                      <span style={{ marginLeft: '6px', fontSize: '9px', color: design.colors.mint, verticalAlign: 'middle' }}>{'\u25B2'}</span>
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
            { label: 'Mid  $20\u201350K',  color: design.colors.midTeal },
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

/* ==========================================================================
   8. SIDEBAR — from PR #6, NAV_ITEMS updated to include ALL sections
   ========================================================================== */

const NAV_ITEMS = [
  { id: 'overview',       label: 'Overview'          },
  { id: 'cogs',           label: 'COGS Details'      },
  { id: 'payroll',        label: 'Payroll Analysis'  },
  { id: 'utilities',      label: 'Utility Costs'     },
  { id: 'expenses',       label: 'Expense Detail'    },
  { id: 'monthly-report', label: 'Monthly Report'    },
];

const Sidebar = ({ activeSection }) => (
  <aside
    className="cf-sidebar"
    style={{
      width: '240px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      backgroundColor: design.colors.cardBg,
      borderRight: `1px solid ${design.colors.cardBorder}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      overflowY: 'auto',
    }}
  >
    {/* Brand mark */}
    <div style={{ padding: '0 20px 32px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${design.colors.teal}, ${design.colors.midTeal})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px',
        boxShadow: '0 4px 12px rgba(13,79,79,0.25)',
      }}>
        <span style={{
          color: '#fff',
          fontSize: '15px',
          fontWeight: 800,
          fontFamily: design.font.family,
          letterSpacing: '-0.02em',
        }}>
          CF
        </span>
      </div>
      <div style={{
        fontFamily: design.font.family,
        fontWeight: design.font.weights.bold,
        fontSize: '14px',
        color: design.colors.darkText,
        lineHeight: 1.3,
      }}>
        Color Fashion
      </div>
      <div style={{
        fontFamily: design.font.family,
        fontWeight: design.font.weights.regular,
        fontSize: '12px',
        color: design.colors.mutedText,
        marginTop: '3px',
      }}>
        FY 2025 Dashboard
      </div>
    </div>

    <div style={{
      padding: '0 20px 8px',
      fontFamily: design.font.family,
      fontWeight: design.font.weights.semibold,
      fontSize: '10px',
      color: design.colors.slate,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}>
      Sections
    </div>

    <nav style={{ padding: '0 12px', flex: 1 }}>
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: isActive ? `${design.colors.teal}14` : 'transparent',
              color: isActive ? design.colors.teal : design.colors.mutedText,
              fontFamily: design.font.family,
              fontWeight: isActive ? design.font.weights.semibold : design.font.weights.regular,
              fontSize: '14px',
              borderLeft: isActive ? `3px solid ${design.colors.teal}` : '3px solid transparent',
              marginLeft: '4px',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            {label}
          </a>
        );
      })}
    </nav>

    <div style={{
      padding: '20px',
      borderTop: `1px solid ${design.colors.cardBorder}`,
    }}>
      <div style={{
        fontFamily: design.font.family,
        fontSize: '11px',
        color: design.colors.slate,
        lineHeight: 1.6,
      }}>
        Q1–Q4 2025<br />
        YTD Actuals
      </div>
    </div>
  </aside>
);

/* ==========================================================================
   9. MAIN DASHBOARD — PR #6 layout with sidebar + all sections
   ========================================================================== */

const FinancialDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

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
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
      />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        /* Horizontal scroll for any tables added to future sections */
        .cf-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .cf-table-wrap table { min-width: 600px; width: 100%; border-collapse: collapse; }
        @media (max-width: 768px) {
          .cf-sidebar { display: none !important; }
          .cf-content  { padding: 24px 20px !important; }
        }
        @media (max-width: 480px) {
          .cf-content { padding: 20px 16px !important; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          ...pageBackground,
          fontFamily: design.font.family,
          color: design.colors.darkText,
        }}
      >
        <Sidebar activeSection={activeSection} />

        <div
          className="cf-content"
          style={{
            flex: 1,
            padding: '48px',
            minWidth: 0,
            overflowX: 'hidden',
          }}
        >
          <header style={{ marginBottom: '8px' }}>
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
              Color Fashion Dye &amp; Finishing
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

          <OverviewSection />
          <COGSSection />
          <PayrollSection />
          <UtilitiesSection />
          <ExpenseDetailSection />
          <MonthlyReport />
        </div>
      </div>
    </>
  );
};

export default FinancialDashboard;
