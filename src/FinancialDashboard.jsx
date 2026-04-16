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

// ─── COGS + OpEx Tables ───────────────────────────────────────────────────────

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
  <section style={{ marginBottom: '64px' }}>
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

          <OverviewSection />
        </div>
      </main>
    </>
  );
};

export default FinancialDashboard;
